import React from 'react';
import { Target, ShieldAlert, CheckCircle, Clock, Sparkles, RefreshCw } from 'lucide-react';
import { formatPrice } from '../utils/formatters';

export const PivotLevelsGrid = ({ config, alertStates, currentPrice, onAutoCalc, isAutoCalculating }) => {
  // Strictly only the 4 levels: R3, R2, S2, S3
  const levels = [
    { key: 'r3', name: 'R3', label: 'Resistance 3', price: config?.r3 || 4657.02, type: 'RESISTANCE' },
    { key: 'r2', name: 'R2', label: 'Resistance 2', price: config?.r2 || 4580.75, type: 'RESISTANCE' },
    { key: 's2', name: 'S2', label: 'Support 2', price: config?.s2 || 4333.97, type: 'SUPPORT' },
    { key: 's3', name: 'S3', label: 'Support 3', price: config?.s3 || 4257.70, type: 'SUPPORT' }
  ];

  return (
    <div className="h-full flex flex-col justify-between rounded-2xl bg-dark-900 border border-dark-700/80 p-5 shadow-2xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-yellow-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Target Levels (R3, R2, S2, S3)
          </h3>
          {onAutoCalc && (
            <button
              type="button"
              onClick={onAutoCalc}
              disabled={isAutoCalculating}
              title="Recalculate Fibonacci levels live from current market prices"
              className="ml-1 px-2 py-0.5 rounded-md bg-gold-500/20 hover:bg-gold-500/30 text-[10px] font-bold text-gold-400 border border-gold-500/40 flex items-center gap-1 transition-all active:scale-95 disabled:opacity-50"
            >
              {isAutoCalculating ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <Sparkles className="w-3 h-3 text-gold-400" />
              )}
              <span>{isAutoCalculating ? 'Calc...' : 'Auto-Calc'}</span>
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span className="flex items-center gap-1 text-yellow-400">
            <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
            Ready
          </span>
          <span className="flex items-center gap-1 text-red-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            Touched
          </span>
          <span className="flex items-center gap-1 text-blue-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Previous
          </span>
        </div>
      </div>

      {/* 2x2 Grid of the 4 Levels */}
      <div className="grid grid-cols-2 gap-3 flex-1">
        {levels.map(lvl => {
          const state = alertStates?.[lvl.name] || { status: 'READY' };
          const distance = currentPrice ? Math.abs(currentPrice - lvl.price) : null;
          const isNear = distance != null && distance <= (config?.tolerance || 0.20);
          
          // Color logic:
          // 1. Current Touch -> RED & BOLD
          // 2. Previous Touch -> BLUE
          // 3. Ready / Untouched -> YELLOW
          const isCurrentlyTouched = state.status === 'TRIGGERED' || isNear;
          const isPreviouslyTouched = state.status === 'PREVIOUSLY_TOUCHED' && !isCurrentlyTouched;

          return (
            <div
              key={lvl.name}
              className={`relative rounded-xl p-3.5 border transition-all duration-300 flex flex-col justify-between ${
                isCurrentlyTouched
                  ? 'bg-red-500/20 border-2 border-red-500 shadow-xl shadow-red-500/30 ring-2 ring-red-500/60 animate-pulse'
                  : isPreviouslyTouched
                  ? 'bg-blue-500/15 border-2 border-blue-500 shadow-lg shadow-blue-500/20'
                  : 'bg-dark-950/70 border-yellow-500/40 hover:border-yellow-400'
              }`}
            >
              {/* Level Badge Header */}
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2.5 py-0.5 rounded font-black tracking-wider ${
                  isCurrentlyTouched
                    ? 'bg-red-600 text-white shadow-md'
                    : isPreviouslyTouched
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/40'
                }`}>
                  {lvl.name}
                </span>

                {/* State Pill */}
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  isCurrentlyTouched
                    ? 'bg-red-500 text-white animate-bounce'
                    : isPreviouslyTouched
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/50'
                    : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                }`}>
                  {isCurrentlyTouched ? (
                    <>
                      <ShieldAlert className="w-3 h-3" />
                      <span>TOUCHED</span>
                    </>
                  ) : isPreviouslyTouched ? (
                    <>
                      <Clock className="w-3 h-3 text-blue-400" />
                      <span>PREVIOUS</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-3 h-3 text-yellow-400" />
                      <span>READY</span>
                    </>
                  )}
                </span>
              </div>

              {/* Level Price */}
              <div className="my-2">
                <div className={`font-mono text-xl tracking-tight ${
                  isCurrentlyTouched
                    ? 'font-black text-red-400 text-2xl'
                    : isPreviouslyTouched
                    ? 'font-extrabold text-blue-300'
                    : 'font-bold text-yellow-300'
                }`}>
                  {formatPrice(lvl.price)}
                </div>
                <div className="text-[11px] text-slate-400 font-medium">
                  {lvl.label}
                </div>
              </div>

              {/* Distance from Current Price */}
              <div className="pt-2 border-t border-dark-800/80 flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-500">Distance:</span>
                <span className={
                  isCurrentlyTouched
                    ? 'text-red-400 font-black text-sm'
                    : isPreviouslyTouched
                    ? 'text-blue-300 font-bold'
                    : 'text-yellow-400 font-semibold'
                }>
                  {distance != null ? `$${distance.toFixed(2)}` : '--'}
                </span>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
