import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { HeaderStatus } from './components/HeaderStatus';
import { LivePriceCard } from './components/LivePriceCard';
import { PivotLevelsGrid } from './components/PivotLevelsGrid';
import { DebugValidationPanel } from './components/DebugValidationPanel';
import { AlertHistoryTable } from './components/AlertHistoryTable';
import { ScreenshotGallery } from './components/ScreenshotGallery';
import { ScreenshotModal } from './components/ScreenshotModal';
import { TestConsoleModal } from './components/TestConsoleModal';
import { ConfigDrawer } from './components/ConfigDrawer';
import { SymbolSearchModal } from './components/SymbolSearchModal';
import { api } from './services/api';
import { initSocketListeners } from './services/socket';

export function App() {
  const [activeSymbol, setActiveSymbol] = useState('XAUUSD');
  const [symbolConfig, setSymbolConfig] = useState(null);
  const [marketData, setMarketData] = useState(null);
  const [pivotState, setPivotState] = useState(null);

  const [config, setConfig] = useState({
    symbol: 'XAUUSD',
    r3: 0,
    r2: 0,
    s2: 0,
    s3: 0,
    tolerance: 0.20,
    retriggerDistance: 1.00,
    enabled: true,
    telegramAlertsEnabled: true,
    chartTimeframe: '15',
    chartRange: '1D',
    customChartUrl: '',
    monitoredLevels: ['R3', 'R2', 'S2', 'S3']
  });

  const [distances, setDistances] = useState({});
  const [alertStates, setAlertStates] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [systemHealth, setSystemHealth] = useState(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isAutoCalculating, setIsAutoCalculating] = useState(false);

  // Modals & Drawers state
  const [selectedAlertForModal, setSelectedAlertForModal] = useState(null);
  const [isTestConsoleOpen, setIsTestConsoleOpen] = useState(false);
  const [isConfigDrawerOpen, setIsConfigDrawerOpen] = useState(false);
  const [isSymbolSearchOpen, setIsSymbolSearchOpen] = useState(false);

  // Fetch initial REST data
  const loadInitialData = useCallback(async () => {
    try {
      const [symRes, tickerRes, configRes, alertsRes, healthRes, statesRes] = await Promise.allSettled([
        api.getActiveSymbol(),
        api.getTicker(),
        api.getConfig(),
        api.getAlerts({ limit: 6 }),
        api.getSystemHealth(),
        api.getAlertStates()
      ]);

      if (symRes.status === 'fulfilled' && symRes.value.data?.data) {
        const data = symRes.value.data.data;
        setActiveSymbol(data.symbol || 'XAUUSD');
        setSymbolConfig(data.config);
        if (data.pivotState) setPivotState(data.pivotState);
        if (data.market) setMarketData(data.market);
      }

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

    // Initialize real-time Socket.IO subscriptions
    const cleanupSocket = initSocketListeners({
      onConnect: () => setIsSocketConnected(true),
      onDisconnect: () => setIsSocketConnected(false),
      onInitialState: (state) => {
        if (state.activeSymbol) setActiveSymbol(state.activeSymbol);
        if (state.symbolConfig) setSymbolConfig(state.symbolConfig);
        if (state.market) setMarketData(state.market);
        if (state.config) setConfig(state.config);
        if (state.pivotState) setPivotState(state.pivotState);
        if (state.distances) setDistances(state.distances);
        if (state.alertStates) setAlertStates(state.alertStates);
      },
      onSymbolActive: (data) => {
        if (data.symbol) setActiveSymbol(data.symbol);
        if (data.config) setSymbolConfig(data.config);
        if (data.pivotState) setPivotState(data.pivotState);
        if (data.market) setMarketData(data.market);
        if (data.alertStates) setAlertStates(data.alertStates);
      },
      onPivotState: (state) => {
        if (state) setPivotState(state);
      },
      onConfigUpdate: (newConfig) => {
        if (newConfig) setConfig(newConfig);
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

  // Handle Switching Active Symbol
  const handleSelectSymbol = async (newSym) => {
    try {
      const res = await api.setActiveSymbol(newSym);
      if (res.data?.data) {
        const data = res.data.data;
        setActiveSymbol(data.symbol);
        setSymbolConfig(data.config);
        setPivotState(data.pivotState);
        if (data.market) setMarketData(data.market);
      }
    } catch (err) {
      alert('Failed to switch symbol: ' + (err.response?.data?.error || err.message));
    }
  };

  // Compute last screenshot time
  const lastScreenshotTime = useMemo(() => {
    const latestAlertWithScreenshot = alerts.find(a => a.screenshotPath);
    return latestAlertWithScreenshot?.timestamp || latestAlertWithScreenshot?.createdAt || null;
  }, [alerts]);

  // Compute detected level
  const detectedLevel = useMemo(() => {
    for (const [lvl, st] of Object.entries(alertStates)) {
      if (st?.status === 'TRIGGERED' || st === 'TRIGGERED') {
        const targetPrice = pivotState?.[lvl.toLowerCase()] || config[lvl.toLowerCase()];
        return `🚨 ${lvl} ACTIVE TOUCH ($${targetPrice ? Number(targetPrice).toFixed(2) : ''})`;
      }
    }
    for (const [lvl, dist] of Object.entries(distances)) {
      if (dist != null && dist <= (config.tolerance || 0.20)) {
        return `⚡ NEAR ${lvl.toUpperCase()}`;
      }
    }
    return `MONITORING ${activeSymbol} LEVELS`;
  }, [alertStates, distances, config, pivotState, activeSymbol]);

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

  // On-demand manual screenshot capture
  const handleManualCapture = async () => {
    setIsCapturing(true);
    try {
      const selectedTf = String(config.chartTimeframe || '15');
      const selectedRange = String(config.chartRange || '1D');
      const selectedBarSpacing = Number(config.barSpacing || 22);

      const res = await api.captureScreenshot({
        symbol: activeSymbol,
        level: 'MANUAL',
        timeframe: selectedTf,
        range: selectedRange,
        barSpacing: selectedBarSpacing
      });

      if (res.data?.data) {
        const newEvent = res.data.data;
        setAlerts(prev => [newEvent, ...prev.filter(a => a._id !== newEvent._id)].slice(0, 6));
        setSelectedAlertForModal(newEvent);
      }
    } catch (err) {
      alert('Failed to capture TradingView screenshot: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsCapturing(false);
    }
  };

  // Live recalculate from current market data
  const handleAutoCalculatePivots = async () => {
    setIsAutoCalculating(true);
    try {
      const res = await api.autoCalculatePivots();
      if (res.data?.data) {
        setPivotState(res.data.data);
      }
    } catch (err) {
      console.error('Failed to auto-calculate pivot levels', err);
    } finally {
      setIsAutoCalculating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-400 selection:text-slate-950">
      
      {/* Header & Status */}
      <HeaderStatus
        activeSymbol={activeSymbol}
        symbolConfig={symbolConfig}
        systemHealth={systemHealth}
        isSocketConnected={isSocketConnected}
        onOpenSymbolSearch={() => setIsSymbolSearchOpen(true)}
        onOpenTestConsole={() => setIsTestConsoleOpen(true)}
        onOpenSettings={() => setIsConfigDrawerOpen(true)}
      />

      {/* Main Terminal Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 space-y-6">
        
        {/* Simple Top Row: Left Side Current Market, Right Side Target Levels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          
          {/* Left Side: Current Market Live Price Ticker & Timeframe Switcher */}
          <div className="h-full">
            <LivePriceCard
              marketData={marketData}
              alertStates={alertStates}
              lastScreenshotTime={lastScreenshotTime}
              detectedLevel={detectedLevel}
              currentTimeframe={config.chartTimeframe || '15'}
              onTimeframeChange={handleTimeframeChange}
              onManualCapture={handleManualCapture}
              isCapturing={isCapturing}
            />
          </div>

          {/* Right Side: R3, R2, S2, S3 Levels */}
          <div className="h-full">
            <PivotLevelsGrid
              config={{
                ...config,
                r3: pivotState?.r3 ?? config.r3,
                r2: pivotState?.r2 ?? config.r2,
                s2: pivotState?.s2 ?? config.s2,
                s3: pivotState?.s3 ?? config.s3
              }}
              alertStates={alertStates}
              currentPrice={marketData?.price}
              onAutoCalc={handleAutoCalculatePivots}
              isAutoCalculating={isAutoCalculating}
            />
          </div>

        </div>

        {/* Developer Audit & Validation Inspector */}
        <DebugValidationPanel
          activeSymbol={activeSymbol}
          pivotState={pivotState}
          onRecalculate={handleAutoCalculatePivots}
        />

        {/* Below: Screenshot History Gallery (Latest Max 6 Captures) */}
        <ScreenshotGallery
          alerts={alerts}
          onViewScreenshot={(evt) => setSelectedAlertForModal(evt)}
          onDeleteScreenshot={handleDeleteAlert}
        />

        {/* Below: Touch Levels Alert History Table */}
        <AlertHistoryTable
          alerts={alerts}
          onSelectAlert={(evt) => setSelectedAlertForModal(evt)}
          onViewScreenshot={(evt) => setSelectedAlertForModal(evt)}
          onDeleteAlert={handleDeleteAlert}
        />

      </main>

      {/* Symbol Search Modal */}
      <SymbolSearchModal
        isOpen={isSymbolSearchOpen}
        onClose={() => setIsSymbolSearchOpen(false)}
        activeSymbol={activeSymbol}
        onSelectSymbol={handleSelectSymbol}
      />

      {/* Modals & Drawers */}
      {isCapturing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl space-y-4">
            <div className="w-12 h-12 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Capturing TradingView Chart
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Rendering {activeSymbol} on TradingView with {config.chartTimeframe || '15'}M interval...
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
            setAlerts(prev => [newEvent, ...prev].slice(0, 6));
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
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-6 text-center text-xs text-slate-500 font-mono">
        MULTI-ASSET TRADINGVIEW ALERT TERMINAL · DYNAMIC PREVIOUS COMPLETED OHLC PIVOT ENGINE · REAL-TIME AUTOMATION
      </footer>

    </div>
  );
}

export default App;
