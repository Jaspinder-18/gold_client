import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createChart, ColorType, CrosshairMode } from 'lightweight-charts';
import { 
  BarChart2, 
  RefreshCw, 
  ZoomIn, 
  ZoomOut, 
  Layers, 
  Maximize2, 
  Radio, 
  Target,
  Sparkles,
  TrendingUp,
  Activity
} from 'lucide-react';
import { api } from '../services/api';
import { formatNumber } from '../utils/formatters';

const TIMEFRAMES = [
  { value: '1', label: '1m' },
  { value: '5', label: '5m' },
  { value: '15', label: '15m' },
  { value: '60', label: '1h' },
  { value: '240', label: '4h' },
  { value: 'D', label: '1D' }
];

export const InteractiveChart = ({ 
  activeSymbol = 'XAUUSD', 
  symbolConfig, 
  marketData, 
  activeAlerts = [], 
  config 
}) => {
  const [chartMode, setChartMode] = useState('tradingview'); // 'tradingview' | 'lightweight'
  const [selectedTf, setSelectedTf] = useState(config?.chartTimeframe || '15');
  const [isLoading, setIsLoading] = useState(false);
  const [barSpacing, setBarSpacing] = useState(config?.barSpacing || 18);

  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);
  const priceLinesRef = useRef([]);
  const candlesDataRef = useRef([]);
  const tvWidgetContainerRef = useRef(null);

  const decimals = symbolConfig?.priceDecimals || (activeSymbol.includes('EUR') || activeSymbol.includes('GBP') ? 5 : (activeSymbol.includes('JPY') ? 3 : 2));
  const rawSym = (activeSymbol || 'XAUUSD').toUpperCase();
  const tvTicker = symbolConfig?.tradingViewTicker || (rawSym === 'XAUUSD' ? 'OANDA:XAUUSD' : (rawSym === 'XAGUSD' ? 'TVC:SILVER' : (rawSym === 'BTCUSD' ? 'BINANCE:BTCUSDT' : (rawSym === 'EURUSD' ? 'FX_IDC:EURUSD' : `OANDA:${rawSym}`))));

  // 1. Fetch & Populate Candles for Lightweight Mode
  const loadCandles = useCallback(async (sym, tf) => {
    setIsLoading(true);
    const targetSym = sym || rawSym;
    const targetTf = tf || selectedTf;
    try {
      const res = await api.getKlines(120, targetSym, targetTf);
      const candles = res.data?.data || [];
      if (Array.isArray(candles) && candles.length > 0) {
        candlesDataRef.current = [...candles];
        if (candleSeriesRef.current) {
          candleSeriesRef.current.setData(candlesDataRef.current);
          if (chartRef.current) {
            chartRef.current.timeScale().scrollToRealTime();
          }
        }
      }
    } catch (err) {
      console.warn('Could not load historical candles:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [rawSym, selectedTf]);

  // 2. Initialize Lightweight Charts Canvas
  useEffect(() => {
    if (chartMode !== 'lightweight' || !chartContainerRef.current) return;

    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const container = chartContainerRef.current;
    const chart = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: '#030712' },
        textColor: '#94a3b8',
        fontSize: 11,
        fontFamily: 'JetBrains Mono, -apple-system, monospace'
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.04)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.04)' }
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: 'rgba(245, 158, 11, 0.4)', width: 1, style: 3 },
        horzLine: { color: 'rgba(245, 158, 11, 0.4)', width: 1, style: 3 }
      },
      rightPriceScale: {
        borderColor: '#1f2937',
        scaleMargins: { top: 0.12, bottom: 0.12 }
      },
      timeScale: {
        borderColor: '#1f2937',
        timeVisible: true,
        secondsVisible: false,
        barSpacing: barSpacing,
        rightOffset: 6
      }
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderUpColor: '#10b981',
      borderDownColor: '#ef4444',
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
      priceFormat: {
        type: 'price',
        precision: decimals,
        minMove: Math.pow(10, -decimals)
      }
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;

    loadCandles(rawSym, selectedTf);

    const handleResize = () => {
      if (container && chartRef.current) {
        chartRef.current.applyOptions({
          width: container.clientWidth,
          height: container.clientHeight
        });
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [chartMode, rawSym, selectedTf, decimals, loadCandles, barSpacing]);

  // 3. Update real-time candle when market price ticks
  useEffect(() => {
    if (chartMode !== 'lightweight' || !candleSeriesRef.current || !marketData?.price) return;

    const price = parseFloat(marketData.price);
    if (isNaN(price)) return;

    const now = Math.floor(Date.now() / 1000);
    const tfMinutes = parseInt(selectedTf, 10) || 5;
    const candlePeriod = tfMinutes * 60;
    const currentCandleTime = Math.floor(now / candlePeriod) * candlePeriod;

    if (candlesDataRef.current.length === 0) {
      const initialCandle = {
        time: currentCandleTime,
        open: price,
        high: price,
        low: price,
        close: price
      };
      candlesDataRef.current.push(initialCandle);
      candleSeriesRef.current.update(initialCandle);
      return;
    }

    const lastCandle = candlesDataRef.current[candlesDataRef.current.length - 1];
    if (lastCandle && lastCandle.time === currentCandleTime) {
      lastCandle.high = Math.max(lastCandle.high, price);
      lastCandle.low = Math.min(lastCandle.low, price);
      lastCandle.close = price;
      candleSeriesRef.current.update(lastCandle);
    } else if (lastCandle && currentCandleTime > lastCandle.time) {
      const newCandle = {
        time: currentCandleTime,
        open: lastCandle.close,
        high: Math.max(lastCandle.close, price),
        low: Math.min(lastCandle.close, price),
        close: price
      };
      candlesDataRef.current.push(newCandle);
      if (candlesDataRef.current.length > 300) candlesDataRef.current.shift();
      candleSeriesRef.current.update(newCandle);
    }
  }, [marketData?.price, chartMode, selectedTf]);

  // 4. Draw Solid White Price Lines for Armed Custom Alerts
  useEffect(() => {
    if (chartMode !== 'lightweight' || !candleSeriesRef.current) return;

    // Clear old lines
    priceLinesRef.current.forEach(line => {
      try {
        candleSeriesRef.current.removePriceLine(line);
      } catch (e) {}
    });
    priceLinesRef.current = [];

    // Draw lines for each active price alert
    activeAlerts.forEach((alert, idx) => {
      const target = Number(alert.targetPrice);
      if (target > 0) {
        try {
          const line = candleSeriesRef.current.createPriceLine({
            price: target,
            color: '#ffffff', // SOLID WHITE LINE FOR TARGET
            lineWidth: 2,
            lineStyle: 0, // Solid
            axisLabelVisible: true,
            title: `🎯 TARGET ${idx + 1} ($${target.toFixed(decimals)})`
          });
          priceLinesRef.current.push(line);
        } catch (e) {}
      }
    });
  }, [activeAlerts, chartMode, decimals]);

  // 5. Embedded TradingView Advanced Real-Time Widget
  useEffect(() => {
    if (chartMode !== 'tradingview' || !tvWidgetContainerRef.current) return;

    const containerId = 'tv_advanced_widget_embed';
    tvWidgetContainerRef.current.innerHTML = `<div id="${containerId}" style="width: 100%; height: 100%;"></div>`;

    let script = document.getElementById('tv_script_tag');
    if (!script) {
      script = document.createElement('script');
      script.id = 'tv_script_tag';
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      document.head.appendChild(script);
    }

    const initTvWidget = () => {
      if (window.TradingView && document.getElementById(containerId)) {
        try {
          new window.TradingView.widget({
            container_id: containerId,
            autosize: true,
            symbol: tvTicker,
            interval: selectedTf === '1' ? '1' : (selectedTf === '5' ? '5' : (selectedTf === '15' ? '15' : (selectedTf === '60' ? '60' : (selectedTf === '240' ? '240' : 'D')))),
            timezone: 'Etc/UTC',
            theme: 'dark',
            style: '1', // Candlesticks
            locale: 'en',
            toolbar_bg: '#030712',
            enable_publishing: false,
            allow_symbol_change: false,
            hide_side_toolbar: false,
            save_image: true,
            studies: [
              'Volume@tv-basicstudies'
            ],
            overrides: {
              'mainSeriesProperties.candleStyle.upColor': '#10b981',
              'mainSeriesProperties.candleStyle.downColor': '#ef4444',
              'mainSeriesProperties.candleStyle.borderUpColor': '#10b981',
              'mainSeriesProperties.candleStyle.borderDownColor': '#ef4444',
              'mainSeriesProperties.candleStyle.wickUpColor': '#10b981',
              'mainSeriesProperties.candleStyle.wickDownColor': '#ef4444',
              'paneProperties.background': '#030712',
              'paneProperties.vertGridProperties.color': 'rgba(255, 255, 255, 0.04)',
              'paneProperties.horzGridProperties.color': 'rgba(255, 255, 255, 0.04)'
            }
          });
        } catch (e) {
          console.warn('TradingView widget initialization notice:', e);
        }
      }
    };

    if (window.TradingView) {
      initTvWidget();
    } else {
      script.onload = initTvWidget;
    }
  }, [chartMode, tvTicker, selectedTf]);

  const handleZoom = (delta) => {
    if (!chartRef.current) return;
    const newSpacing = Math.min(Math.max(barSpacing + delta, 6), 45);
    setBarSpacing(newSpacing);
    chartRef.current.timeScale().applyOptions({ barSpacing: newSpacing });
  };

  return (
    <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[560px] relative transition-all duration-300 backdrop-blur-xl">
      
      {/* Chart Top Header Controls */}
      <div className="px-5 py-3.5 bg-slate-950/80 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 z-20">
        
        {/* Left: Symbol & Live Indicators */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-amber-400" />
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-black text-white tracking-tight">
                {symbolConfig?.displayName || rawSym}
              </span>
              <span className="text-xs font-mono text-slate-400 font-semibold px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                {tvTicker}
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono">
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block"></span>
              REAL-TIME FEED
            </span>
            {activeAlerts.length > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold flex items-center gap-1">
                <Target className="w-3.5 h-3.5" />
                {activeAlerts.length} TARGETS ARMED
              </span>
            )}
          </div>
        </div>

        {/* Center/Right: Mode Switcher & Timeframe Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Chart Engine Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
            <button
              type="button"
              onClick={() => setChartMode('tradingview')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                chartMode === 'tradingview'
                  ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              TradingView Pro
            </button>
            <button
              type="button"
              onClick={() => setChartMode('lightweight')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                chartMode === 'lightweight'
                  ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Precision Terminal
            </button>
          </div>

          {/* Timeframe Buttons */}
          <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
            {TIMEFRAMES.map(tf => {
              const isActive = selectedTf === tf.value;
              return (
                <button
                  key={tf.value}
                  type="button"
                  onClick={() => setSelectedTf(tf.value)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-800 text-amber-400 shadow-sm font-black'
                      : 'text-slate-500 hover:text-slate-200'
                  }`}
                >
                  {tf.label}
                </button>
              );
            })}
          </div>

          {/* Zoom controls for lightweight canvas */}
          {chartMode === 'lightweight' ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => loadCandles(rawSym, selectedTf)}
                className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-amber-400 border border-slate-800 transition-colors cursor-pointer"
                title="Refresh Candlesticks"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
              </button>
              <button
                type="button"
                onClick={() => handleZoom(-3)}
                className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleZoom(3)}
                className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                const currentTf = selectedTf;
                setSelectedTf('');
                setTimeout(() => setSelectedTf(currentTf), 50);
              }}
              className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-amber-400 border border-slate-800 transition-colors cursor-pointer flex items-center gap-1 text-xs font-mono"
              title="Reload TradingView Chart"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-[11px]">Reload TV</span>
            </button>
          )}

        </div>

      </div>

      {/* Chart Canvas / Widget Container */}
      <div className="relative flex-1 w-full bg-[#030712] overflow-hidden">
        
        {chartMode === 'tradingview' ? (
          <div ref={tvWidgetContainerRef} className="w-full h-full" />
        ) : (
          <div className="w-full h-full relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm z-10">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-mono">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Loading TradingView Candlesticks...</span>
                </div>
              </div>
            )}
            <div ref={chartContainerRef} className="w-full h-full" />
          </div>
        )}

      </div>

    </div>
  );
};

export default InteractiveChart;
