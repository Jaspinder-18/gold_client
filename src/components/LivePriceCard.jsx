import React, { useEffect, useState, useRef } from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Camera, Clock, Activity, ShieldAlert, Layers, Zap } from 'lucide-react';
import { formatPrice, formatNumber, formatTime } from '../utils/formatters';

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
  alertStates,
  lastScreenshotTime,
  detectedLevel,
  currentTimeframe = '5',
  onTimeframeChange,
  onManualCapture,
  isCapturing
}) => {
  const price = marketData?.price || 4345.50;
  const change = marketData?.change || 0;
  const changePercent = marketData?.changePercent || 0;
  const isPositive = change >= 0;

  // 'up' = Green (bullish), 'down' = Red (bearish)
  const [tickDirection, setTickDirection] = useState('up');
  const prevPriceRef = useRef(price);

  useEffect(() => {
    if (price > prevPriceRef.current) {
      setTickDirection('up');
    } else if (price < prevPriceRef.current) {
      setTickDirection('down');
    }
    prevPriceRef.current = price;
  }, [price]);

  const activeLevel = detectedLevel || 'MONITORING R3, R2, S2, S3';

  // Format price into main dollars and cents with 2 decimals
  const formattedPriceStr = Number(price).toFixed(2);
  const [dollars, cents] = formattedPriceStr.split('.');

  return (
    <div className="h-full flex flex-col justify-between rounded-2xl bg-gradient-to-b from-dark-850 to-dark-900 border border-dark-700/80 p-5 shadow-2xl relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute -top-20 -left-20 w-48 h-48 rounded-full bg-gold-500/5 blur-3xl pointer-events-none"></div>

      <div className="space-y-4">
        
        {/* Top: Header Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gold-400 font-mono">
              Live Commodity Spot
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-[11px] text-slate-400 font-medium">
              TradingView OANDA:XAUUSD
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-mono text-gold-400 bg-gold-500/10 px-2.5 py-0.5 rounded-full border border-gold-500/30 shadow-sm">
            <Zap className="w-3 h-3 text-gold-400 fill-gold-400 animate-pulse" />
            <span className="font-bold">LIVE STREAMING</span>
          </div>
        </div>

        {/* Big Live Price Ticker: UP = GREEN, DOWN = RED */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-2xl font-black text-white tracking-tight">GOLD / USD</h2>
              <span className="text-xs font-mono text-slate-400 font-semibold">(XAUUSD)</span>
            </div>

            <div className="mt-1 flex items-baseline gap-3">
              {/* Live Price Display: Up -> Green, Down -> Red */}
              <div className={`text-4xl sm:text-5xl font-black font-mono tracking-tight transition-colors duration-150 flex items-baseline ${
                tickDirection === 'up'
                  ? 'text-emerald-400 drop-shadow-[0_0_18px_rgba(52,211,153,0.9)]'
                  : 'text-rose-400 drop-shadow-[0_0_18px_rgba(248,113,113,0.9)]'
              }`}>
                <span>${Number(dollars).toLocaleString()}</span>
                <span className="text-3xl sm:text-4xl">.{cents}</span>
                {tickDirection === 'up' ? (
                  <span className="ml-2 text-xs font-bold font-mono text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-md animate-pulse">
                    ▲ UP
                  </span>
                ) : (
                  <span className="ml-2 text-xs font-bold font-mono text-rose-400 bg-rose-500/20 border border-rose-500/30 px-2 py-0.5 rounded-md animate-pulse">
                    ▼ DOWN
                  </span>
                )}
              </div>

              {/* 24h Change: Up (+) -> Green, Down (-) -> Red */}
              <div className={`flex items-center gap-0.5 px-2 py-1 rounded-md text-xs font-mono font-bold border ${
                isPositive
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}>
                {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                <span>{isPositive ? '+' : ''}{formatNumber(change)}</span>
                <span>({isPositive ? '+' : ''}{formatNumber(changePercent)}%)</span>
              </div>
            </div>

            {/* Live Bid / Ask Spread Line */}
            <div className="mt-2 flex items-center gap-3 text-xs font-mono text-slate-400">
              <span>Bid: <strong className="text-slate-200">${formatNumber(marketData?.bid || price - 0.25, 2)}</strong></span>
              <span className="text-slate-600">|</span>
              <span>Ask: <strong className="text-slate-200">${formatNumber(marketData?.ask || price + 0.25, 2)}</strong></span>
              <span className="text-slate-600">|</span>
              <span>Spread: <strong className="text-gold-400">$0.50</strong></span>
            </div>
          </div>

          {/* Quick Capture Button */}
          <div>
            <button
              type="button"
              onClick={onManualCapture}
              disabled={isCapturing}
              className="px-4 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-black font-extrabold text-xs font-mono flex items-center gap-2 shadow-lg shadow-gold-500/20 active:scale-95 transition-all disabled:opacity-50"
              title="Capture real TradingView chart screenshot right now"
            >
              <Camera className={`w-4 h-4 ${isCapturing ? 'animate-spin' : ''}`} />
              <span>{isCapturing ? 'CAPTURING...' : 'CAPTURE NOW'}</span>
            </button>
          </div>
        </div>

        {/* 3 Status Gauges */}
        <div className="grid grid-cols-3 gap-2.5 text-xs">
          
          <div className="p-2.5 rounded-xl bg-dark-950/70 border border-dark-800">
            <div className="text-[10px] text-slate-400 font-medium mb-1">Feed Status</div>
            <div className="font-mono text-xs font-bold text-emerald-400 flex items-center gap-1">
              <Activity className="w-3 h-3 animate-pulse" />
              <span>LIVE STREAM</span>
            </div>
            <div className="text-[9px] text-slate-500 font-mono mt-0.5 truncate">
              {formatTime(marketData?.lastUpdated || new Date())}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-dark-950/70 border border-dark-800">
            <div className="text-[10px] text-slate-400 font-medium mb-1">Active Level</div>
            <div className="font-mono text-xs font-bold text-yellow-400 flex items-center gap-1 truncate">
              <ShieldAlert className="w-3 h-3" />
              <span className="truncate">{activeLevel}</span>
            </div>
            <div className="text-[9px] text-slate-500 font-mono mt-0.5">
              Auto-Calculated
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-dark-950/70 border border-dark-800">
            <div className="text-[10px] text-slate-400 font-medium mb-1">Last Screenshot</div>
            <div className="font-mono text-xs font-bold text-slate-200 flex items-center gap-1">
              <Clock className="w-3 h-3 text-gold-400" />
              <span>{lastScreenshotTime ? formatTime(lastScreenshotTime) : 'Ready'}</span>
            </div>
            <div className="text-[9px] text-slate-500 font-mono mt-0.5">
              Max 20 Stored
            </div>
          </div>

        </div>

      </div>

      {/* Bottom: Dynamic Screenshot Timeframe Switcher */}
      <div className="mt-4 pt-3 border-t border-dark-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-dark-950/50 p-2.5 rounded-xl">
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-gold-400" />
          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
            Screenshot Timeframe:
          </span>
        </div>

        <div className="flex items-center gap-1 flex-wrap">
          {TIMEFRAMES.map(tf => {
            const isActive = String(currentTimeframe).toUpperCase() === tf.value.toUpperCase();
            return (
              <button
                key={tf.value}
                type="button"
                onClick={() => onTimeframeChange && onTimeframeChange(tf.value)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold transition-all ${
                  isActive
                    ? 'bg-gold-500 text-black shadow-md shadow-gold-500/20 font-black scale-105'
                    : 'bg-dark-900 text-slate-400 border border-dark-700 hover:text-white'
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
