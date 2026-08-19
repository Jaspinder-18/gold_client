import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { HeaderStatus } from './components/HeaderStatus';
import { LivePriceCard } from './components/LivePriceCard';
import { PivotLevelsGrid } from './components/PivotLevelsGrid';
import { AlertHistoryTable } from './components/AlertHistoryTable';
import { ScreenshotGallery } from './components/ScreenshotGallery';
import { ScreenshotModal } from './components/ScreenshotModal';
import { TestConsoleModal } from './components/TestConsoleModal';
import { ConfigDrawer } from './components/ConfigDrawer';
import { api } from './services/api';
import { initSocketListeners } from './services/socket';

export function App() {
  const [marketData, setMarketData] = useState({
    price: 4345.50,
    previousPrice: 4345.50,
    bid: 4345.25,
    ask: 4345.75,
    high24h: 4386.20,
    low24h: 4328.10,
    change: -30.70,
    changePercent: -0.70,
    marketStatus: 'LIVE',
    connected: true,
    lastUpdated: new Date()
  });

  const [config, setConfig] = useState({
    r3: 4473.76,
    r2: 4432.84,
    s2: 4300.45,
    s3: 4259.54,
    tolerance: 0.20,
    retriggerDistance: 1.00,
    enabled: true,
    telegramAlertsEnabled: true,
    chartTimeframe: '5',
    chartRange: '2D',
    monitoredLevels: ['R3', 'R2', 'S2', 'S3']
  });

  const [distances, setDistances] = useState({});
  const [alertStates, setAlertStates] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [systemHealth, setSystemHealth] = useState(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  // Modals & Drawers state
  const [selectedAlertForModal, setSelectedAlertForModal] = useState(null);
  const [isTestConsoleOpen, setIsTestConsoleOpen] = useState(false);
  const [isConfigDrawerOpen, setIsConfigDrawerOpen] = useState(false);

  // Fetch initial REST data
  const loadInitialData = useCallback(async () => {
    try {
      const [tickerRes, configRes, alertsRes, healthRes, statesRes] = await Promise.allSettled([
        api.getTicker(),
        api.getConfig(),
        api.getAlerts({ limit: 6 }), // Max 6 latest screenshots & alerts
        api.getSystemHealth(),
        api.getAlertStates()
      ]);

      if (tickerRes.status === 'fulfilled' && tickerRes.value.data?.data) {
        setMarketData(tickerRes.value.data.data);
        if (tickerRes.value.data.data.distances) {
          setDistances(tickerRes.value.data.data.distances);
        }
      }

      if (configRes.status === 'fulfilled' && configRes.value.data?.data) {
        setConfig(configRes.value.data.data);
      }

      if (alertsRes.status === 'fulfilled' && alertsRes.value.data?.data) {
        setAlerts(alertsRes.value.data.data.slice(0, 6));
      }

      if (healthRes.status === 'fulfilled' && healthRes.value.data?.status) {
        setSystemHealth(healthRes.value.data.status);
      }

      if (statesRes.status === 'fulfilled' && statesRes.value.data?.data) {
        setAlertStates(statesRes.value.data.data);
      }
    } catch (err) {
      console.error('Error loading initial terminal data', err);
    }
  }, []);

  useEffect(() => {
    loadInitialData();

    // Polling health fallback every 15s
    const healthInterval = setInterval(() => {
      api.getSystemHealth().then(r => setSystemHealth(r.data?.status)).catch(() => {});
    }, 15000);

    // Initialize real-time Socket.IO subscriptions for high-frequency price ticks
    const cleanupSocket = initSocketListeners({
      onConnect: () => setIsSocketConnected(true),
      onDisconnect: () => setIsSocketConnected(false),
      onInitialState: (state) => {
        if (state.market) setMarketData(state.market);
        if (state.config) setConfig(state.config);
        if (state.distances) setDistances(state.distances);
        if (state.alertStates) setAlertStates(state.alertStates);
      },
      onMarketTick: (data) => {
        setMarketData(data);
        if (data.distances) setDistances(data.distances);
      },
      onAlertTriggered: (payload) => {
        if (payload.event) {
          setAlerts(prev => [payload.event, ...prev.filter(a => a._id !== payload.event._id)].slice(0, 6));
        }
        if (payload.alertStates) {
          setAlertStates(payload.alertStates);
        }
        if (payload.distances) {
          setDistances(payload.distances);
        }
      }
    });

    return () => {
      clearInterval(healthInterval);
      cleanupSocket();
    };
  }, [loadInitialData]);

  // Compute last screenshot time
  const lastScreenshotTime = useMemo(() => {
    const latestAlertWithScreenshot = alerts.find(a => a.screenshotPath);
    return latestAlertWithScreenshot?.timestamp || latestAlertWithScreenshot?.createdAt || null;
  }, [alerts]);

  // Compute detected level
  const detectedLevel = useMemo(() => {
    for (const [lvl, st] of Object.entries(alertStates)) {
      if (st?.status === 'TRIGGERED') {
        return `🚨 ${lvl} ACTIVE TOUCH ($${config[lvl.toLowerCase()]?.toFixed(2) || ''})`;
      }
    }
    for (const [lvl, dist] of Object.entries(distances)) {
      if (dist?.isNear) {
        return `⚡ NEAR ${lvl.toUpperCase()} ($${dist.target?.toFixed(2)})`;
      }
    }
    return 'MONITORING R3, R2, S2, S3';
  }, [alertStates, distances, config]);

  // Handle dynamic timeframe switch (affects screenshot only)
  const handleTimeframeChange = async (newTf) => {
    try {
      setConfig(prev => ({ ...prev, chartTimeframe: newTf }));
      await api.updateConfig({ chartTimeframe: newTf });
    } catch (err) {
      console.error('Failed to update timeframe config', err);
    }
  };

  // Delete screenshot alert handler
  const handleDeleteAlert = async (alertId) => {
    try {
      await api.deleteAlert(alertId);
      setAlerts(prev => prev.filter(a => a._id !== alertId));
      if (selectedAlertForModal?._id === alertId) {
        setSelectedAlertForModal(null);
      }
    } catch (err) {
      alert('Failed to delete screenshot: ' + (err.response?.data?.error || err.message));
    }
  };

  // On-demand manual screenshot capture with selected dynamic timeframe, range, and bar spacing
  const handleManualCapture = async () => {
    setIsCapturing(true);
    try {
      const selectedTf = String(config.chartTimeframe || '15');
      const selectedRange = String(config.chartRange || '1D');
      const selectedBarSpacing = Number(config.barSpacing || 22);

      const res = await api.captureScreenshot({
        level: 'MANUAL',
        timeframe: selectedTf,
        range: selectedRange,
        barSpacing: selectedBarSpacing
      });

      if (res.data?.data) {
        const screenshotPath = res.data.data.cloudinaryUrl || res.data.data.relativePath;
        const dummyAlert = {
          _id: 'manual-' + Date.now(),
          symbol: 'XAUUSD',
          level: 'MANUAL',
          levelPrice: marketData.price,
          currentPrice: marketData.price,
          tolerance: config.tolerance || 0.20,
          screenshotPath,
          telegramStatus: 'MANUAL_CAPTURE',
          triggerReason: `Manual TradingView screenshot capture (${selectedTf}m, ${selectedRange} range, ${selectedBarSpacing}px barSpacing)`,
          timestamp: new Date(),
          isTest: true
        };
        setAlerts(prev => [dummyAlert, ...prev].slice(0, 6));
        setSelectedAlertForModal(dummyAlert);
      }
    } catch (err) {
      alert('Failed to capture TradingView screenshot: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col selection:bg-gold-500 selection:text-black">
      
      {/* Header & Status */}
      <HeaderStatus
        systemHealth={systemHealth}
        isSocketConnected={isSocketConnected}
        onOpenTestConsole={() => setIsTestConsoleOpen(true)}
        onOpenSettings={() => setIsConfigDrawerOpen(true)}
      />

      {/* Main Terminal Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 space-y-6">
        
        {/* Simple Top Row: Left Side Current Market, Right Side R3, R2, S2, S3 Levels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          
          {/* Left Side: Current Market Live Price Ticker & Timeframe Switcher */}
          <div className="h-full">
            <LivePriceCard
              marketData={marketData}
              alertStates={alertStates}
              lastScreenshotTime={lastScreenshotTime}
              detectedLevel={detectedLevel}
              currentTimeframe={config.chartTimeframe || '5'}
              onTimeframeChange={handleTimeframeChange}
              onManualCapture={handleManualCapture}
              isCapturing={isCapturing}
            />
          </div>

          {/* Right Side: R3, R2, S2, S3 Levels (Yellow = Ready, Red = Touched, Blue = Previous) */}
          <div className="h-full">
            <PivotLevelsGrid
              config={config}
              alertStates={alertStates}
              currentPrice={marketData?.price || 4345.50}
            />
          </div>

        </div>

        {/* Below: Screenshot History Gallery (Latest Max 20 Captures with Delete Option) */}
        <ScreenshotGallery
          alerts={alerts}
          onViewScreenshot={(evt) => setSelectedAlertForModal(evt)}
          onDeleteScreenshot={handleDeleteAlert}
        />

        {/* Below: Touch Levels Alert History Table with Delete Option */}
        <AlertHistoryTable
          alerts={alerts}
          onSelectAlert={(evt) => setSelectedAlertForModal(evt)}
          onViewScreenshot={(evt) => setSelectedAlertForModal(evt)}
          onDeleteAlert={handleDeleteAlert}
        />

      </main>

      {/* Modals & Drawers */}
      {isCapturing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-dark-900 border border-gold-500/40 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl space-y-4">
            <div className="w-12 h-12 border-3 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Capturing TradingView Chart
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Rendering {config.chartTimeframe || '15'}M ({config.chartRange || '1D'} session) with {config.barSpacing || 22}px zoom & syncing to Cloudinary...
              </p>
            </div>
          </div>
        </div>
      )}

      {selectedAlertForModal && (
        <ScreenshotModal
          alert={selectedAlertForModal}
          onClose={() => setSelectedAlertForModal(null)}
          onDeleteAlert={handleDeleteAlert}
        />
      )}

      {isTestConsoleOpen && (
        <TestConsoleModal
          config={config}
          onClose={() => setIsTestConsoleOpen(false)}
          onAlertGenerated={(newEvent) => {
            setAlerts(prev => [newEvent, ...prev].slice(0, 20));
            setSelectedAlertForModal(newEvent);
          }}
        />
      )}

      {isConfigDrawerOpen && (
        <ConfigDrawer
          config={config}
          onClose={() => setIsConfigDrawerOpen(false)}
          onConfigSaved={(updated) => {
            setConfig(updated);
          }}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-dark-900 bg-dark-950 py-4 px-6 text-center text-xs text-slate-500 font-mono">
        GOLD (XAU/USD) ALERT TERMINAL · EXACT TRADINGVIEW BROWSER CAPTURE ENGINE · REAL-TIME AUTOMATION
      </footer>

    </div>
  );
}

export default App;
