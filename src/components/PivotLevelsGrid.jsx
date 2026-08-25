import React from 'react';
import { Target, ShieldAlert, CheckCircle, Clock, Sparkles, RefreshCw, Calendar, History, ArrowRight } from 'lucide-react';
import { formatPrice } from '../utils/formatters';

export const PivotLevelsGrid = ({ config, pivotState, alertStates, currentPrice, onAutoCalc, isAutoCalculating }) => {
  // Strictly only the 4 levels: R3, R2, S2, S3
  const levels = [
    { key: 'r3', name: 'R3', label: 'Resistance 3', price: pivotState?.r3 ?? config?.r3 ?? 0, type: 'RESISTANCE' },
    { key: 'r2', name: 'R2', label: 'Resistance 2', price: pivotState?.r2 ?? config?.r2 ?? 0, type: 'RESISTANCE' },
    { key: 's2', name: 'S2', label: 'Support 2', price: pivotState?.s2 ?? config?.s2 ?? 0, type: 'SUPPORT' },
    { key: 's3', name: 'S3', label: 'Support 3', price: pivotState?.s3 ?? config?.s3 ?? 0, type: 'SUPPORT' }
  ];

  const prev = pivotState?.previousLevels;
  const currentPeriodStr = pivotState?.pivotPeriod || pivotState?.periodDateStr || 'Today';

  return (
    <div className="h-full flex flex-col justify-between rounded-3xl glass-panel p-6 shadow-2xl relative overflow-hidden">
      {/* Subtle top-right ambient gold flare */}
      <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>

      {/* Header with Active Pivot Period & Rollover Info */}
      <div className="space-y-3 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center border border-amber-500/30">
              <Target className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Target Levels (R3, R2, S2, S3)
              </h3>
            </div>
            {onAutoCalc && (
              <button
                type="button"
                onClick={onAutoCalc}
                disabled={isAutoCalculating}
                title="Force recalculate from verified completed OHLC"
                className="ml-2 px-3 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-xs font-black text-amber-400 border border-amber-500/40 flex items-center gap-1.5 transition-all duration-200 active:scale-95 disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {isAutoCalculating ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>{isAutoCalculating ? 'Recalculating...' : 'Recalculate'}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-amber-300 font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              Ready
            </span>
            <span className="flex items-center gap-1.5 text-rose-300 font-black px-2 py-0.5 rounded-md bg-rose-500/15 border border-rose-500/30">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              Touched
            </span>
            <span className="flex items-center gap-1.5 text-blue-300 font-bold px-2 py-0.5 rounded-md bg-blue-500/15 border border-blue-500/25">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              Previous
            </span>
          </div>
        </div>

        {/* Pivot Period Meta Banner */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">PIVOT PERIOD:</span>
            <span className="text-white font-black">{currentPeriodStr}</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
              ACTIVE
            </span>
          </div>
          <div className="flex items-center gap-3 text-slate-400 text-[11px]">
            <span>Next Rollover: <strong className="text-amber-400">{pivotState?.nextRolloverAt ? new Date(pivotState.nextRolloverAt).toUTCString().slice(17, 22) + ' UTC' : '22:00 UTC'}</strong></span>
          </div>
        </div>
      </div>

      {/* 2x2 Grid of the 4 Levels */}
      <div className="grid grid-cols-2 gap-3.5 flex-1">
        {levels.map(lvl => {
          const rawState = alertStates?.[lvl.name];
          const stateStatus = typeof rawState === 'string' ? rawState : (rawState?.status || 'READY');
          const touchCount = typeof rawState === 'object' ? (rawState?.touchCount || 0) : 0;
          const distance = currentPrice ? Math.abs(currentPrice - lvl.price) : null;
          const isNear = distance != null && distance <= (config?.tolerance || 0.20);
          
          const isCompleted = stateStatus === 'COMPLETED' || touchCount >= 2;
          const isCurrentlyTouched = (stateStatus === 'TRIGGERED' || isNear) && !isCompleted;
          const isPreviouslyTouched = stateStatus === 'PREVIOUSLY_TOUCHED' && !isCurrentlyTouched && !isCompleted;

          return (
            <div
              key={lvl.name}
              className={`relative rounded-2xl p-4 border transition-all duration-300 flex flex-col justify-between ${
                isCompleted
                  ? 'bg-purple-950/30 border-2 border-purple-500/60 shadow-lg shadow-purple-950/20'
                  : isCurrentlyTouched
                  ? 'bg-rose-500/15 border-2 border-rose-500 shadow-xl shadow-rose-500/30 ring-2 ring-rose-500/50 animate-pulse'
                  : isPreviouslyTouched
                  ? 'bg-blue-500/10 border-2 border-blue-500/80 shadow-lg shadow-blue-500/20'
                  : 'bg-slate-950/70 border-slate-800/80 hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/5'
              }`}
            >
              {/* Level Badge Header */}
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2.5 py-1 rounded-lg font-black tracking-wider ${
                  isCompleted
                    ? 'bg-purple-700 text-white shadow-md'
                    : isCurrentlyTouched
                    ? 'bg-rose-600 text-white shadow-md'
                    : isPreviouslyTouched
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                }`}>
                  {lvl.name}
                </span>

                {/* State Pill */}
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
                  isCompleted
                    ? 'bg-purple-500/25 text-purple-300 border border-purple-500/50'
                    : isCurrentlyTouched
                    ? 'bg-rose-500 text-white shadow-md animate-bounce'
                    : isPreviouslyTouched
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                    : 'bg-amber-500/10 text-amber-300 border border-amber-500/25'
                }`}>
                  {isCompleted ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-purple-400" />
                      <span>2/2 TOUCHES (LOCKED)</span>
                    </>
                  ) : isCurrentlyTouched ? (
                    <>
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>TOUCHED {touchCount > 0 ? `(${touchCount}/2)` : ''}</span>
                    </>
                  ) : isPreviouslyTouched ? (
                    <>
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      <span>PREVIOUS (1/2)</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
                      <span>READY {touchCount === 1 ? '(1/2)' : '(0/2)'}</span>
                    </>
                  )}
                </span>
              </div>

              {/* Level Price */}
              <div className="my-2.5">
                <div className={`font-mono text-2xl tracking-tight tabular-nums ${
                  isCurrentlyTouched
                    ? 'font-black text-rose-400 text-3xl'
                    : isPreviouslyTouched
                    ? 'font-extrabold text-blue-300'
                    : 'font-extrabold text-amber-300'
                }`}>
                  {formatPrice(lvl.price)}
                </div>
                <div className="text-xs text-slate-400 font-medium mt-0.5">
                  {lvl.label}
                </div>
              </div>

              {/* Distance from Current Price */}
              <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 font-medium">Distance:</span>
                <span className={`tabular-nums ${
                  isCurrentlyTouched
                    ? 'text-rose-400 font-black text-sm'
                    : isPreviouslyTouched
                    ? 'text-blue-300 font-extrabold'
                    : 'text-amber-400 font-bold'
                }`}>
                  {distance != null ? `$${distance.toFixed(2)}` : '--'}
                </span>
              </div>

            </div>
          );
        })}
      </div>

      {/* Previous Period Historical Reference Comparison (if available) */}
      {prev && (
        <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/40 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-1.5 text-slate-300">
            <History className="w-3 h-3 text-blue-400" />
            <span className="font-bold">PREV PERIOD ({prev.periodDateStr || 'Yesterday'}):</span>
          </div>
          <div className="flex items-center gap-3">
            <span>R3: <strong className="text-slate-200">{formatPrice(prev.r3)}</strong></span>
            <span>R2: <strong className="text-slate-200">{formatPrice(prev.r2)}</strong></span>
            <span>S2: <strong className="text-slate-200">{formatPrice(prev.s2)}</strong></span>
            <span>S3: <strong className="text-slate-200">{formatPrice(prev.s3)}</strong></span>
          </div>
        </div>
      )}

    </div>
  );
};
