import React from 'react';
import { Target, Sparkles, RefreshCw, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatPrice } from '../utils/formatters';

export const PivotLevelsGrid = ({ config, pivotState, currentPrice, onAutoCalc, isAutoCalculating }) => {
  // Reference Pivot Levels: R3, R2, S2, S3
  const levels = [
    { key: 'r3', name: 'R3', label: 'Resistance 3', price: pivotState?.r3 ?? config?.r3 ?? 0, type: 'RESISTANCE' },
    { key: 'r2', name: 'R2', label: 'Resistance 2', price: pivotState?.r2 ?? config?.r2 ?? 0, type: 'RESISTANCE' },
    { key: 's2', name: 'S2', label: 'Support 2', price: pivotState?.s2 ?? config?.s2 ?? 0, type: 'SUPPORT' },
    { key: 's3', name: 'S3', label: 'Support 3', price: pivotState?.s3 ?? config?.s3 ?? 0, type: 'SUPPORT' }
  ];

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
                Reference Pivot Levels (R3, R2, S2, S3)
              </h3>
            </div>
            {onAutoCalc && (
              <button
                type="button"
                onClick={onAutoCalc}
                disabled={isAutoCalculating}
                title="Recalculate from verified completed OHLC"
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
            <span className="flex items-center gap-1.5 text-amber-300 font-semibold px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              Visual Reference Lines (Yellow)
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
            {config?.autoCalculatePivot !== false && (
              <span className="text-amber-300/90 font-medium">
                Auto-Calc: <strong className="text-amber-400">{config?.autoCalcIntervalMinutes || 15}m</strong>
              </span>
            )}
            <span>Next Rollover: <strong className="text-amber-400">{pivotState?.nextRolloverAt ? new Date(pivotState.nextRolloverAt).toUTCString().slice(17, 22) + ' UTC' : '22:00 UTC'}</strong></span>
          </div>
        </div>
      </div>

      {/* 2x2 Grid of the 4 Reference Levels */}
      <div className="grid grid-cols-2 gap-3.5 flex-1">
        {levels.map(lvl => {
          const isResistance = lvl.type === 'RESISTANCE';
          const distance = currentPrice && lvl.price ? Math.abs(currentPrice - lvl.price) : null;
          const diffPct = currentPrice && lvl.price ? ((lvl.price - currentPrice) / currentPrice) * 100 : null;

          return (
            <div
              key={lvl.name}
              className="relative rounded-2xl p-4 border transition-all duration-300 flex flex-col justify-between bg-slate-950/70 border-slate-800/80 hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/5"
            >
              {/* Level Badge Header */}
              <div className="flex items-center justify-between">
                <span className="text-xs px-2.5 py-1 rounded-lg font-black tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  {lvl.name}
                </span>

                <span className="text-[10px] font-mono text-slate-400">
                  {lvl.label}
                </span>
              </div>

              {/* Center: Large Formatted Target Price */}
              <div className="my-3">
                <div className="text-2xl font-black font-mono tracking-tight text-white tabular-nums">
                  ${Number(lvl.price).toFixed(2)}
                </div>
                <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1 mt-0.5">
                  {distance !== null ? (
                    <>
                      <span>Δ ${distance.toFixed(2)}</span>
                      <span className={`font-bold ${diffPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        ({diffPct >= 0 ? '+' : ''}{diffPct.toFixed(2)}%)
                      </span>
                    </>
                  ) : (
                    <span>Reference Level</span>
                  )}
                </div>
              </div>

              {/* Bottom: Type Tag */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="flex items-center gap-1">
                  {isResistance ? (
                    <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                  {lvl.type}
                </span>
                <span className="text-amber-400 font-bold">Chart: Yellow Line</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span>Formula: {pivotState?.pivotType || config?.pivotType || 'Fibonacci'} Standard</span>
        <span>HLC Reference: ${pivotState?.high?.toFixed(2) || '---'} / ${pivotState?.low?.toFixed(2) || '---'} / ${pivotState?.close?.toFixed(2) || '---'}</span>
      </div>
    </div>
  );
};
