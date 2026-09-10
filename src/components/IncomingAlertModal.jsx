import React, { useEffect } from 'react';
import { 
  BellRing, 
  X, 
  LineChart, 
  Volume2, 
  Clock, 
  ArrowUpRight
} from 'lucide-react';
import { formatPrice, formatDateTime, getLevelColor } from '../utils/formatters';

export const IncomingAlertModal = ({ 
  alert, 
  onCancel, 
  onViewChart 
}) => {
  if (!alert) return null;

  const styling = getLevelColor(alert.level);
  const isResistance = alert.level?.startsWith('R');
  const isSupport = alert.level?.startsWith('S');
  const isCustom = !isResistance && !isSupport;

  // Handle escape key to cancel/dismiss
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  const targetPrice = alert.levelPrice || alert.customPrice || alert.targetPrice || alert.currentPrice;
  const currentPrice = alert.currentPrice || alert.price || targetPrice;
  const symbol = alert.symbol || 'XAUUSD';
  const displayName = alert.displayName || alert.symbol || 'Gold / USD Spot';
  const levelLabel = isCustom 
    ? (alert.level === 'CUSTOM' || !alert.level ? 'CUSTOM TARGET' : alert.level)
    : `${alert.level} PIVOT`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      {/* Glow aura */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[450px] h-[450px] bg-amber-500/15 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div 
        className="relative w-full max-w-lg rounded-3xl bg-slate-950 border-2 border-amber-500/60 shadow-[0_0_50px_rgba(245,158,11,0.25)] flex flex-col overflow-hidden animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Urgent Alert Banner */}
        <div className="px-6 py-3.5 bg-gradient-to-r from-amber-500/25 via-amber-500/10 to-amber-500/25 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-400 font-black text-xs tracking-wider uppercase">
              <BellRing className="w-4 h-4 animate-bounce" />
              <span>Price Touch Alert Triggered!</span>
            </div>
          </div>

          {/* Sound Visualizer Animation */}
          <div className="flex items-center gap-1 text-amber-400">
            <Volume2 className="w-4 h-4 mr-1 text-amber-400" />
            <div className="flex items-end gap-0.5 h-3">
              <span className="w-0.5 bg-amber-400 h-2 animate-pulse"></span>
              <span className="w-0.5 bg-amber-400 h-3 animate-pulse delay-75"></span>
              <span className="w-0.5 bg-amber-400 h-1.5 animate-pulse delay-150"></span>
              <span className="w-0.5 bg-amber-400 h-2.5 animate-pulse"></span>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-7 space-y-6">
          {/* Symbol & Level Badges */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-wider">
                  {symbol}
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
                  {levelLabel}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">
                {displayName}
              </p>
            </div>

            {/* Level Tag Pill */}
            <div className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider shadow ${
              isResistance ? 'bg-rose-500 text-white shadow-rose-500/20' : 
              isSupport ? 'bg-emerald-500 text-black shadow-emerald-500/20' : 
              'bg-amber-400 text-slate-950 shadow-amber-400/20'
            }`}>
              TOUCHED
            </div>
          </div>

          {/* Price Metrics Card */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 space-y-3.5 shadow-inner">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
                Touch Price:
              </span>
              <span className="text-3xl font-black font-mono text-amber-400 tracking-tight tabular-nums drop-shadow-sm">
                {formatPrice(currentPrice)}
              </span>
            </div>

            {targetPrice && targetPrice !== currentPrice && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                <span className="text-slate-400 font-medium">Target Level:</span>
                <span className="font-mono font-bold text-slate-200">
                  {formatPrice(targetPrice)}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
              <span className="text-slate-400 font-medium flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                Trigger Time:
              </span>
              <span className="font-mono text-slate-300 font-medium">
                {formatDateTime(alert.timestamp || alert.createdAt || new Date())}
              </span>
            </div>

            {alert.triggerReason && (
              <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 italic">
                {alert.triggerReason}
              </div>
            )}
          </div>

          {/* Action Buttons: Cancel and View Chart */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            {/* Cancel / Dismiss Button */}
            <button
              type="button"
              onClick={onCancel}
              className="py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600 font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <X className="w-4 h-4 text-slate-400" />
              <span>Cancel</span>
            </button>

            {/* View Chart Button */}
            <button
              type="button"
              onClick={() => onViewChart(alert)}
              className="py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all active:scale-[0.98] hover:shadow-amber-500/40"
            >
              <LineChart className="w-4 h-4" />
              <span>View Chart</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
