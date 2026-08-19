import React from 'react';
import { Compass, ArrowUp, ArrowDown, AlertCircle } from 'lucide-react';
import { formatNumber } from '../utils/formatters';

export const LevelDistanceMonitor = ({ distances, currentPrice, config }) => {
  const targetLevels = ['R3', 'R2', 'S2', 'S3'];
  const tolerance = config?.tolerance || 0.20;

  return (
    <div className="rounded-2xl bg-dark-900 border border-dark-700/80 p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-yellow-400" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            Live Proximity & Level Distances (S2, S3, R2, R3)
          </h3>
        </div>
        <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>Real-Time Proximity Radar</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {targetLevels.map(key => {
          const item = distances?.[key.toLowerCase()] || {
            level: key,
            target: config?.[key.toLowerCase()] || 0,
            distance: 0,
            percentage: '0.00'
          };
          const isAbove = key.startsWith('R');
          const distVal = parseFloat(item.distance || 0);
          const isNear = Math.abs(distVal) <= tolerance;

          // Proximity score (0% to 100%) within 15 USD
          const maxScale = 15;
          const progress = Math.max(0, Math.min(100, 100 - (Math.abs(distVal) / maxScale) * 100));

          return (
            <div
              key={key}
              className={`rounded-xl p-4 border transition-all duration-300 ${
                isNear
                  ? 'bg-red-500/20 border-2 border-red-500 ring-2 ring-red-500/50 shadow-lg shadow-red-500/20 animate-pulse'
                  : 'bg-dark-950/70 border-yellow-500/40 hover:border-yellow-400'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded font-black ${
                    isNear
                      ? 'bg-red-600 text-white shadow-md'
                      : 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/40'
                  }`}>
                    {key}
                  </span>
                  <span className={`text-xs font-mono font-bold ${
                    isNear ? 'text-white' : 'text-yellow-300'
                  }`}>
                    ${formatNumber(item.target)}
                  </span>
                </div>

                <div className={`flex items-center gap-0.5 text-xs font-mono font-bold ${
                  isNear ? 'text-red-400' : isAbove ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {isAbove ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />}
                  <span>{isNear ? 'TOUCH ALERT' : (isAbove ? 'RESISTANCE' : 'SUPPORT')}</span>
                </div>
              </div>

              {/* Distance Figure */}
              <div className="my-2 flex items-baseline justify-between">
                <div>
                  <div className="text-[11px] text-slate-400 font-medium">Distance to {key}</div>
                  <div className={`text-2xl font-mono tracking-tight ${
                    isNear ? 'font-black text-red-400' : 'font-bold text-white'
                  }`}>
                    {distVal > 0 ? '+' : ''}${Math.abs(distVal).toFixed(2)}
                  </div>
                </div>

                <div className="text-right font-mono text-xs text-slate-400">
                  <div className={isNear ? 'text-red-400 font-bold' : ''}>{item.percentage}%</div>
                  <div className="text-[10px] text-slate-500">of price</div>
                </div>
              </div>

              {/* Proximity Gauge Bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mb-1">
                  <span>Proximity Gauge</span>
                  <span className="text-slate-400 font-semibold">{Math.round(progress)}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-dark-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isNear ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : progress > 50 ? 'bg-yellow-400' : 'bg-yellow-500/70'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
