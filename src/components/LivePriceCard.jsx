import React, { useEffect, useState, useRef } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight, 
  Camera, 
  Clock, 
  Activity, 
  Target, 
  Layers, 
  Zap 
} from 'lucide-react';
import { formatNumber, formatTime } from '../utils/formatters';

const TIMEFRAMES = [
  { value: '1', label: '1M' },
  { value: '3', label: '3M' },
  { value: '5', label: '5M' },
  { value: '15', label: '15M' },
  { value: '30', label: '30M' },
  { value: '60', label: '1H' },
  { value: '240', label: '4H' },
  { value: 'D', label: '1D' }
];

export const LivePriceCard = ({
  marketData,
  lastScreenshotTime,
  detectedLevel,
  customTargetPrice,
  customAlertStatus,
  currentTimeframe = '15',
  onTimeframeChange,
  onManualCapture,
  isCapturing
}) => {
  const price = marketData?.price;
  const change = marketData?.change ?? 0;
  const changePercent = marketData?.changePercent ?? 0;
  const isPositive = change >= 0;

  // 'up' = Green (bullish), 'down' = Red (bearish)
  const [tickDirection, setTickDirection] = useState('up');
  const prevPriceRef = useRef(price);

  useEffect(() => {
    if (price && prevPriceRef.current) {
      if (price > prevPriceRef.current) {
        setTickDirection('up');
      } else if (price < prevPriceRef.current) {
        setTickDirection('down');
      }
    }
    if (price) {
      prevPriceRef.current = price;
    }
  }, [price]);

  // Formatted active custom target status
  let customTargetDisplay = 'No Target Set';
  if (customTargetPrice && Number(customTargetPrice) > 0) {
    if (customAlertStatus === 'TRIGGERED') {
      customTargetDisplay = `TOUCHED: $${Number(customTargetPrice).toFixed(2)}`;
    } else {
      customTargetDisplay = `TARGET: $${Number(customTargetPrice).toFixed(2)}`;
    }
  } else if (detectedLevel) {
    customTargetDisplay = detectedLevel;
  }

  return (
    <div className={`h-full flex flex-col justify-between rounded-3xl p-6 shadow-2xl relative overflow-hidden transition-all duration-500 border ${
      tickDirection === 'up'
        ? 'glass-emerald-glow shadow-emerald-950/20'
        : 'glass-crimson-glow shadow-rose-950/20'
    }`}>
      {/* Ambient background spotlights */}
      <div className={`absolute -top-24 -left-24 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
        tickDirection === 'up' ? 'bg-emerald-500/10' : 'bg-rose-500/10'
      }`}></div>
      <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full bg-amber-500/5 blur-3xl pointer-events-none"></div>

      <div className="space-y-5">
        
        {/* Top: Header Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-black uppercase tracking-wider text-amber-400 font-mono px-2.5 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/25">
              {marketData?.assetType || 'COMMODITY'}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400 font-medium truncate max-w-[200px]">
              {marketData?.provider || 'TradingView Real-Time (OANDA)'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 shadow-sm">
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
            <span className="font-extrabold tracking-wide">{marketData?.marketStatus || 'LIVE'}</span>
          </div>
        </div>

        {/* Big Live Price Ticker: UP = GREEN, DOWN = RED */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-2.5">
              <h2 className="text-2xl font-black text-white tracking-tight">
                {marketData?.displayName || marketData?.symbol || 'Gold / USD Spot'}
              </h2>
              <span className="text-xs font-mono text-slate-400 font-bold px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                {marketData?.rawSymbol || 'XAUUSD'}
              </span>
            </div>

            <div className="mt-2 flex flex-wrap items-baseline gap-3">
              {/* Live Price Display */}
              <div className={`text-5xl sm:text-6xl font-black font-mono tracking-tight transition-all duration-200 flex items-baseline tabular-nums ${
                tickDirection === 'up'
                  ? 'text-emerald-400 drop-shadow-[0_0_25px_rgba(52,211,153,0.6)]'
                  : 'text-rose-400 drop-shadow-[0_0_25px_rgba(248,113,113,0.6)]'
              }`}>
                {price != null ? `$${price}` : 'FETCHING...'}
              </div>

              {price && (
                tickDirection === 'up' ? (
                  <span className="ml-2.5 text-xs font-black font-mono text-emerald-300 bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-1 rounded-lg shadow-sm animate-pulse flex items-center gap-1">
                    ▲ TICK UP
                  </span>
                ) : (
                  <span className="ml-2.5 text-xs font-black font-mono text-rose-300 bg-rose-500/20 border border-rose-500/40 px-2.5 py-1 rounded-lg shadow-sm animate-pulse flex items-center gap-1">
                    ▼ TICK DOWN
                  </span>
                )
              )}

              {/* 24h Change Badge */}
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-black border shadow-md transition-all ${
                isPositive
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                  : 'bg-rose-500/15 text-rose-300 border-rose-500/40'
              }`}>
                {isPositive ? <ArrowUpRight className="w-4 h-4 stroke-[2.5]" /> : <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />}
                <span>{isPositive ? '+' : ''}{formatNumber(change)}</span>
                <span className="opacity-80">({isPositive ? '+' : ''}{formatNumber(changePercent)}%)</span>
              </div>
            </div>

            {/* Live Bid / Ask Spread Line */}
            <div className="mt-3 flex items-center gap-3 text-xs font-mono text-slate-400">
              <span>Bid: <strong className="text-slate-200">${formatNumber(marketData?.bid || (price ? price - 0.25 : 0), 2)}</strong></span>
              <span className="text-slate-700">|</span>
              <span>Ask: <strong className="text-slate-200">${formatNumber(marketData?.ask || (price ? price + 0.25 : 0), 2)}</strong></span>
              <span className="text-slate-700">|</span>
              <span>Spread: <strong className="text-amber-400 font-bold">${formatNumber(Math.abs((marketData?.ask || 0) - (marketData?.bid || 0)) || 0.01, 2)}</strong></span>
            </div>
          </div>

          {/* Quick Capture Button */}
          <div>
            <button
              type="button"
              onClick={onManualCapture}
              disabled={isCapturing}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs font-mono flex items-center gap-2.5 shadow-xl shadow-amber-500/25 active:scale-95 transition-all duration-200 disabled:opacity-50 cursor-pointer"
              title="Capture real TradingView chart screenshot right now"
            >
              <Camera className={`w-4 h-4 stroke-[2.5] ${isCapturing ? 'animate-spin' : ''}`} />
              <span>{isCapturing ? 'CAPTURING...' : 'CAPTURE NOW'}</span>
            </button>
          </div>
        </div>

        {/* 3 Status Gauges */}
        <div className="grid grid-cols-3 gap-3 text-xs">
          
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-all">
            <div className="text-[10px] text-slate-400 font-semibold mb-1">Feed Status</div>
            <div className="font-mono text-xs font-black text-emerald-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              <span>LIVE STREAM</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-1 truncate">
              {formatTime(marketData?.lastUpdated || new Date())}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-all">
            <div className="text-[10px] text-slate-400 font-semibold mb-1">Custom Target</div>
            <div className={`font-mono text-xs font-black flex items-center gap-1.5 truncate ${
              customAlertStatus === 'TRIGGERED' ? 'text-rose-400 animate-pulse' : 'text-amber-400'
            }`}>
              <Target className="w-3.5 h-3.5" />
              <span className="truncate">{customTargetDisplay}</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-1">
              {customAlertStatus === 'ACTIVE' ? 'Active & Monitoring' : customAlertStatus === 'TRIGGERED' ? 'Triggered / Touched' : 'Standby'}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-all">
            <div className="text-[10px] text-slate-400 font-semibold mb-1">Last Screenshot</div>
            <div className="font-mono text-xs font-black text-slate-200 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{lastScreenshotTime ? formatTime(lastScreenshotTime) : 'Ready'}</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-1">
              Max 6 Stored
            </div>
          </div>

        </div>

      </div>

      {/* Bottom: Dynamic Screenshot Timeframe Switcher */}
      <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-950/60 p-3 rounded-2xl">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-black text-slate-300 uppercase tracking-wider">
            Screenshot Timeframe:
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {TIMEFRAMES.map(tf => {
            const isActive = String(currentTimeframe).toUpperCase() === tf.value.toUpperCase();
            return (
              <button
                key={tf.value}
                type="button"
                onClick={() => onTimeframeChange && onTimeframeChange(tf.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/25 font-black scale-105 ring-1 ring-amber-300'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700'
                }`}
              >
                {tf.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
