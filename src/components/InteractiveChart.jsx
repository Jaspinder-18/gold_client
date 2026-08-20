import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType } from 'lightweight-charts';
import { Maximize2, RefreshCw, BarChart2, ZoomIn, ZoomOut } from 'lucide-react';
import { api } from '../services/api';

export const InteractiveChart = ({ marketData, config }) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const priceLinesRef = useRef([]);
  const candlesDataRef = useRef([]);

  const [isLoading, setIsLoading] = useState(true);
  const [currentBarSpacing, setCurrentBarSpacing] = useState(config?.barSpacing || 18);

  // Initialize Chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Clean up previous instance
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0c1017' },
        textColor: '#94a3b8',
        fontSize: 11,
        fontFamily: 'Inter, -apple-system, sans-serif'
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.04)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.04)' }
      },
      crosshair: {
        mode: 1,
        vertLine: { color: 'rgba(245, 158, 11, 0.4)', width: 1, style: 3 },
        horzLine: { color: 'rgba(245, 158, 11, 0.4)', width: 1, style: 3 }
      },
      rightPriceScale: {
        borderColor: '#1e293b',
        scaleMargins: { top: 0.15, bottom: 0.15 }
      },
      timeScale: {
        borderColor: '#1e293b',
        timeVisible: true,
        secondsVisible: false,
        barSpacing: config?.barSpacing || 18,
        rightOffset: 5,
        fixLeftEdge: false,
        fixRightEdge: false
      },
      handleScroll: true,
      handleScale: true
    });

    // Add Candlestick Series
    const candleSeries = chart.addCandlestickSeries({
      upColor: '#089981',
      downColor: '#f23645',
      borderUpColor: '#089981',
      borderDownColor: '#f23645',
      wickUpColor: '#089981',
      wickDownColor: '#f23645',
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01
      }
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;

    // Fetch initial historical 5m klines
    api.getKlines(120)
      .then(res => {
        if (res.data && res.data.data && Array.isArray(res.data.data)) {
          candlesDataRef.current = [...res.data.data];
          candleSeries.setData(candlesDataRef.current);
          chart.timeScale().scrollToRealTime();
        }
      })
      .catch(err => console.error('Failed to load klines', err))
      .finally(() => setIsLoading(false));

    // Handle Window / Container Resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight
        });
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, []);

  // Sync bar spacing from config
  useEffect(() => {
    if (config?.barSpacing && chartRef.current) {
      setCurrentBarSpacing(config.barSpacing);
      chartRef.current.timeScale().applyOptions({
        barSpacing: config.barSpacing
      });
    }
  }, [config?.barSpacing]);

  // Update real-time candle when market price ticks without corrupting OHLC with 24h stats
  useEffect(() => {
    if (!candleSeriesRef.current || !marketData?.price) return;

    const price = parseFloat(marketData.price);
    if (isNaN(price)) return;

    const now = Math.floor(Date.now() / 1000);
    const candlePeriod = 5 * 60; // 5 minute candles
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
      // Update existing 5-minute candle
      lastCandle.high = Math.max(lastCandle.high, price);
      lastCandle.low = Math.min(lastCandle.low, price);
      lastCandle.close = price;
      candleSeriesRef.current.update(lastCandle);
    } else {
      // Start a new 5-minute candle cleanly
      const newCandle = {
        time: currentCandleTime,
        open: lastCandle ? lastCandle.close : price,
        high: price,
        low: price,
        close: price
      };
      candlesDataRef.current.push(newCandle);
      if (candlesDataRef.current.length > 300) candlesDataRef.current.shift();
      candleSeriesRef.current.update(newCandle);
    }
  }, [marketData?.price]);

  // Update Pivot Price Lines (R3, R2, R1, P, S1, S2, S3)
  useEffect(() => {
    if (!candleSeriesRef.current || !config) return;

    // Remove existing lines
    priceLinesRef.current.forEach(line => {
      try {
        candleSeriesRef.current.removePriceLine(line);
      } catch (e) {}
    });
    priceLinesRef.current = [];

    const linesToDraw = [
      { price: config.r3, title: 'R3 RESISTANCE', color: '#f59e0b', lineWidth: 2, lineStyle: 2 },
      { price: config.r2, title: 'R2 RESISTANCE', color: '#f97316', lineWidth: 2, lineStyle: 2 },
      { price: config.s2, title: 'S2 SUPPORT', color: '#10b981', lineWidth: 2, lineStyle: 2 },
      { price: config.s3, title: 'S3 SUPPORT', color: '#14b8a6', lineWidth: 2, lineStyle: 2 }
    ];

    linesToDraw.forEach(item => {
      if (item.price && !isNaN(item.price)) {
        try {
          const line = candleSeriesRef.current.createPriceLine({
            price: item.price,
            color: item.color,
            lineWidth: item.lineWidth,
            lineStyle: item.lineStyle,
            axisLabelVisible: true,
            title: `${item.title} ($${item.price.toFixed(2)})`
          });
          priceLinesRef.current.push(line);
        } catch (e) {}
      }
    });
  }, [config?.r3, config?.r2, config?.s2, config?.s3]);

  const handleZoom = (delta) => {
    if (!chartRef.current) return;
    const newSpacing = Math.min(Math.max(currentBarSpacing + delta, 6), 45);
    setCurrentBarSpacing(newSpacing);
    chartRef.current.timeScale().applyOptions({ barSpacing: newSpacing });
  };

  const handleResetView = () => {
    if (chartRef.current) {
      chartRef.current.timeScale().applyOptions({ barSpacing: config?.barSpacing || 18 });
      chartRef.current.timeScale().scrollToRealTime();
    }
  };

  return (
    <div className="rounded-2xl bg-dark-900 border border-dark-700/80 overflow-hidden shadow-xl flex flex-col h-[460px]">
      {/* Chart Header Bar */}
      <div className="px-4 py-2.5 bg-dark-850 border-b border-dark-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-gold-400" />
            <span className="text-xs font-bold text-slate-200">XAU/USD · 5M TRADINGVIEW LIVE CHART</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400 font-mono">
            <span className="px-1.5 py-0.5 rounded bg-dark-950 border border-dark-800">5m Candles</span>
            <span className="px-1.5 py-0.5 rounded bg-dark-950 border border-dark-800">Spacing: {currentBarSpacing}px</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleZoom(-3)}
            className="p-1.5 rounded-md bg-dark-800 hover:bg-dark-700 text-slate-300 hover:text-white border border-dark-700 transition-colors"
            title="Zoom Out (Narrower Bars)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleZoom(3)}
            className="p-1.5 rounded-md bg-dark-800 hover:bg-dark-700 text-slate-300 hover:text-white border border-dark-700 transition-colors"
            title="Zoom In (Wider Bars)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetView}
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-dark-800 hover:bg-dark-700 text-[11px] text-slate-300 hover:text-white border border-dark-700 transition-colors"
            title="Reset Chart Zoom"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative flex-1 w-full">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-dark-950/80 backdrop-blur-sm z-10">
            <div className="flex items-center gap-2 text-gold-400 text-xs font-mono">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Loading Historical Candles...</span>
            </div>
          </div>
        )}
        <div ref={chartContainerRef} className="w-full h-full" />
      </div>
    </div>
  );
};

