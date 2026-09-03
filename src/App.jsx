import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { HeaderStatus } from './components/HeaderStatus';
import { LivePriceCard } from './components/LivePriceCard';
import { CustomLevelCard } from './components/CustomLevelCard';
import { AlertHistoryTable } from './components/AlertHistoryTable';
import { ScreenshotGallery } from './components/ScreenshotGallery';
import { ScreenshotModal } from './components/ScreenshotModal';
import { TestConsoleModal } from './components/TestConsoleModal';
import { ConfigDrawer } from './components/ConfigDrawer';
import { SymbolSearchModal } from './components/SymbolSearchModal';
import { api } from './services/api';
import { initSocketListeners } from './services/socket';
import { audioAlert } from './utils/audioAlert';

export function App() {
  const [activeSymbol, setActiveSymbol] = useState('XAUUSD');
  const [symbolConfig, setSymbolConfig] = useState(null);
  const [marketData, setMarketData] = useState(null);
  const [pivotState, setPivotState] = useState(null);
  const [isSoundEnabled, setIsSoundEnabled] = useState(audioAlert.enabled);

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
    customPriceAlertEnabled: false,
    customPriceAlertTarget: 0,
    customPriceAlertStatus: 'INACTIVE',
    chartTimeframe: '15',
    chartRange: '1D',
    customChartUrl: ''
  });

  const [alertStates, setAlertStates] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [systemHealth, setSystemHealth] = useState(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  // Modals & Drawers state
  const [selectedAlertForModal, setSelectedAlertForModal] = useState(null);
  const [isTestConsoleOpen, setIsTestConsoleOpen] = useState(false);
  const [isConfigDrawerOpen, setIsConfigDrawerOpen] = useState(false);
  const [isSymbolSearchOpen, setIsSymbolSearchOpen] = useState(false);

  // Initial Load from Central Online Database
  const loadInitialData = useCallback(async (sym) => {
    try {
      const targetSym = sym || activeSymbol;

      const [tickerRes, configRes, alertsRes, symRes] = await Promise.allSettled([
        api.getTicker(),
        api.getConfig(targetSym),
        api.getAlerts({ limit: 6, symbol: targetSym }),
        api.getActiveSymbol()
      ]);

      if (symRes.status === 'fulfilled' && symRes.value.data?.data) {
        setSymbolConfig(symRes.value.data.data);
      }

      if (tickerRes.status === 'fulfilled' && tickerRes.value.data?.data) {
        setMarketData(tickerRes.value.data.data);
      }

      if (configRes.status === 'fulfilled' && configRes.value.data?.data) {
        const loadedCfg = configRes.value.data.data;
        setConfig(prev => ({
          ...prev,
          ...loadedCfg,
          symbol: loadedCfg.symbol || targetSym
        }));
      }

      if (alertsRes.status === 'fulfilled' && alertsRes.value.data?.data) {
        setAlerts(alertsRes.value.data.data.slice(0, 6));
      }
    } catch (err) {
      console.error('Failed to load initial data', err);
    }
  }, [activeSymbol]);

  // Initial Boot & Socket Connection
  useEffect(() => {
    loadInitialData(activeSymbol);

    const checkHealth = async () => {
      try {
        const res = await api.getSystemHealth();
        setSystemHealth(res.data?.data);
      } catch (e) {}
    };
    checkHealth();
    const healthInterval = setInterval(checkHealth, 15000);

    // Initialize WebSockets
    const cleanupSocket = initSocketListeners({
      onConnect: () => setIsSocketConnected(true),
      onDisconnect: () => setIsSocketConnected(false),
      onInitialState: (state) => {
        if (state.activeSymbol) {
          setActiveSymbol(state.activeSymbol);
        }
        if (state.symbolConfig) setSymbolConfig(state.symbolConfig);
        if (state.market) setMarketData(state.market);
        if (state.config) setConfig(state.config);
        if (state.pivotState) setPivotState(state.pivotState);
        if (state.alertStates) setAlertStates(state.alertStates);
      },
      onSymbolChanged: (data) => {
        if (data.symbol) {
          setActiveSymbol(data.symbol);
          if (data.config) setSymbolConfig(data.config);
          if (data.market) setMarketData(data.market);
          if (data.pivotState) setPivotState(data.pivotState);
        }
      },
      onPivotUpdated: (data) => {
        if (data && (!data.symbol || data.symbol === activeSymbol)) {
          setPivotState(data);
          setConfig(prev => ({
            ...prev,
            symbol: data.symbol || prev.symbol,
            r3: data.r3,
            r2: data.r2,
            s2: data.s2,
            s3: data.s3,
            p: data.p,
            r1: data.r1,
            s1: data.s1
          }));
        }
      },
      onConfigUpdate: (newConfig) => {
        if (newConfig && (!newConfig.symbol || newConfig.symbol === activeSymbol)) {
          setConfig(prev => ({ ...prev, ...newConfig }));
        }
      },
      onMarketTick: (data) => {
        if (!data.rawSymbol || data.rawSymbol === activeSymbol) {
          setMarketData(data);
        }
      },
      onAlertTriggered: (payload) => {
        if (payload.event) {
          setAlerts(prev => [payload.event, ...prev.filter(a => a._id !== payload.event._id && a.eventId !== payload.event.eventId)].slice(0, 6));
          // Trigger Loud Alarm Sound on Web App Terminal
          audioAlert.playAlarm({ durationSeconds: 6 });
        }
        if (payload.alertStates) {
          setAlertStates(payload.alertStates);
        }
      }
    });

    return () => {
      clearInterval(healthInterval);
      cleanupSocket();
    };
  }, [loadInitialData, activeSymbol]);

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
        if (data.config) setConfig(prev => ({ ...prev, ...data.config, symbol: data.symbol }));
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

  // Compute detected level header string
  const detectedLevel = useMemo(() => {
    const customPrice = config?.customPriceAlertTarget;
    const isEnabled = config?.customPriceAlertEnabled;
    const isTriggered = config?.customPriceAlertStatus === 'TRIGGERED' || alertStates?.CUSTOM?.status === 'TRIGGERED';

    if (isTriggered && customPrice > 0) {
      return `TOUCHED: $${Number(customPrice).toFixed(2)}`;
    }

    if (isEnabled && customPrice > 0) {
      return `TARGET: $${Number(customPrice).toFixed(2)}`;
    }

    return 'STANDBY';
  }, [alertStates, config]);

  // Handle dynamic timeframe switch (updates config on server so screenshots use it)
  const handleTimeframeChange = async (newTf) => {
    try {
      setConfig(prev => ({ ...prev, chartTimeframe: newTf }));
      await api.updateConfig({ chartTimeframe: newTf });
    } catch (err) {
      console.error('Failed to update timeframe config', err);
    }
  };

  // Handle manual screenshot capture
  const handleManualCapture = async () => {
    setIsCapturing(true);
    try {
      const res = await api.captureScreenshot({
        symbol: activeSymbol,
        timeframe: config.chartTimeframe || '15',
        range: config.chartRange || '1D',
        barSpacing: config.barSpacing || 22
      });

      if (res.data?.data) {
        const newEvt = res.data.data;
        setAlerts(prev => [newEvt, ...prev.filter(a => a._id !== newEvt._id)].slice(0, 6));
        setSelectedAlertForModal(newEvt);
      }
    } catch (err) {
      alert('Failed to capture TradingView screenshot: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsCapturing(false);
    }
  };

  const handleDeleteAlert = async (id) => {
    try {
      await api.deleteAlert(id);
      setAlerts(prev => prev.filter(a => a._id !== id && a.eventId !== id));
      if (selectedAlertForModal?._id === id || selectedAlertForModal?.eventId === id) {
        setSelectedAlertForModal(null);
      }
    } catch (err) {
      alert('Failed to delete alert: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleToggleSound = () => {
    const next = !isSoundEnabled;
    setIsSoundEnabled(next);
    audioAlert.setEnabled(next);
    if (next) {
      audioAlert.playAlarm({ durationSeconds: 1.5 });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-400 selection:text-slate-950">
      
      {/* Header & Status (Contains Symbol Selector / Changer) */}
      <HeaderStatus
        activeSymbol={activeSymbol}
        symbolConfig={symbolConfig}
        systemHealth={systemHealth}
        isSocketConnected={isSocketConnected}
        isSoundEnabled={isSoundEnabled}
        onToggleSound={handleToggleSound}
        onOpenSymbolSearch={() => setIsSymbolSearchOpen(true)}
        onOpenTestConsole={() => setIsTestConsoleOpen(true)}
        onOpenSettings={() => setIsConfigDrawerOpen(true)}
      />

      {/* Main Terminal Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 space-y-6">
        
        {/* Top 2-Column Row: Live Price & Screenshot Settings (Left) + Custom Price Selection (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          
          {/* Left: Live Price & Screenshot Settings Card */}
          <div className="h-full">
            <LivePriceCard
              marketData={marketData}
              lastScreenshotTime={lastScreenshotTime}
              detectedLevel={detectedLevel}
              customTargetPrice={config.customPriceAlertTarget}
              customAlertStatus={config.customPriceAlertStatus}
              currentTimeframe={config.chartTimeframe || '15'}
              onTimeframeChange={handleTimeframeChange}
              onManualCapture={handleManualCapture}
              isCapturing={isCapturing}
            />
          </div>

          {/* Right: Custom Price Selection & Alert Management Card */}
          <div className="h-full">
            <CustomLevelCard
              activeSymbol={activeSymbol}
              marketData={marketData}
              config={config}
              alertStates={alertStates}
              pivotState={pivotState}
              onConfigUpdated={(updatedCfg) => {
                setConfig(prev => ({ ...prev, ...updatedCfg }));
              }}
              onAlertGenerated={(newEvent) => {
                setAlerts(prev => [newEvent, ...prev.filter(a => a._id !== newEvent._id)].slice(0, 6));
                setSelectedAlertForModal(newEvent);
              }}
            />
          </div>

        </div>

        {/* Screenshot History Gallery (Latest Max 6 Captures with White Custom Price Line) */}
        <ScreenshotGallery
          alerts={alerts}
          onViewScreenshot={(evt) => setSelectedAlertForModal(evt)}
          onDeleteScreenshot={handleDeleteAlert}
        />

        {/* Alert Events History Table */}
        <AlertHistoryTable
          alerts={alerts}
          onSelectAlert={(evt) => setSelectedAlertForModal(evt)}
          onViewScreenshot={(evt) => setSelectedAlertForModal(evt)}
          onDeleteAlert={handleDeleteAlert}
        />

      </main>

      {/* Symbol Search / Changer Modal */}
      <SymbolSearchModal
        isOpen={isSymbolSearchOpen}
        onClose={() => setIsSymbolSearchOpen(false)}
        activeSymbol={activeSymbol}
        onSelectSymbol={handleSelectSymbol}
      />

      {/* Full Screenshot View Modal */}
      {selectedAlertForModal && (
        <ScreenshotModal
          alert={selectedAlertForModal}
          onClose={() => setSelectedAlertForModal(null)}
          onDelete={() => handleDeleteAlert(selectedAlertForModal._id || selectedAlertForModal.eventId)}
        />
      )}

      {/* Alert Pipeline Test Console Modal */}
      {isTestConsoleOpen && (
        <TestConsoleModal
          config={config}
          onClose={() => setIsTestConsoleOpen(false)}
          onAlertGenerated={(evt) => {
            setAlerts(prev => [evt, ...prev.filter(a => a._id !== evt._id)].slice(0, 6));
            setSelectedAlertForModal(evt);
          }}
        />
      )}

      {/* Configuration Drawer */}
      <ConfigDrawer
        isOpen={isConfigDrawerOpen}
        onClose={() => setIsConfigDrawerOpen(false)}
        config={config}
        activeSymbol={activeSymbol}
        onSave={async (newConfig) => {
          setConfig(prev => ({ ...prev, ...newConfig }));
        }}
      />

    </div>
  );
}
export default App;
