import React from 'react';
import { History, Calendar, CheckCircle, AlertTriangle } from 'lucide-react';
import { formatPrice } from '../utils/formatters';

export const PreviousLevelsTable = ({ previousSessions = [] }) => {
  if (!previousSessions || previousSessions.length === 0) {
    return (
      <div className="rounded-2xl bg-dark-900 border border-dark-700/80 p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <History className="w-4 h-4 text-gold-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            10 Previous Sessions (S2, S3, R2, R3 Historical Levels)
          </h3>
        </div>
        <div className="text-xs text-slate-500 font-mono py-4 text-center">
          Loading historical session pivot calculations...
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-dark-900 border border-dark-700/80 p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-gold-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            10 Previous Daily Sessions (S2, S3, R2, R3 Historical Levels)
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          Showing last {previousSessions.length} completed daily trading sessions
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-dark-800 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              <th className="pb-3 px-3">Date (UTC)</th>
              <th className="pb-3 px-3">Session High / Low</th>
              <th className="pb-3 px-3 text-yellow-400">R3 Level</th>
              <th className="pb-3 px-3 text-yellow-400">R2 Level</th>
              <th className="pb-3 px-3 text-yellow-400">S2 Level</th>
              <th className="pb-3 px-3 text-yellow-400">S3 Level</th>
              <th className="pb-3 px-3 text-right">Levels Touched</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-800/60">
            {previousSessions.map((s, idx) => {
              const touchedCount = (s.r3Touched ? 1 : 0) + (s.r2Touched ? 1 : 0) + (s.s2Touched ? 1 : 0) + (s.s3Touched ? 1 : 0);

              return (
                <tr key={s.date || idx} className="hover:bg-dark-850/50 transition-colors">
                  {/* Date */}
                  <td className="py-3 px-3 font-semibold text-slate-200 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>{s.date}</span>
                    {idx === 0 && (
                      <span className="ml-1 text-[9px] bg-gold-500/20 text-gold-300 px-1.5 py-0.5 rounded font-bold">
                        Yesterday
                      </span>
                    )}
                  </td>

                  {/* Day Range */}
                  <td className="py-3 px-3 text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <span className="text-emerald-400 font-bold">${formatPrice(s.dayHigh)}</span>
                      <span className="text-slate-600">/</span>
                      <span className="text-rose-400 font-bold">${formatPrice(s.dayLow)}</span>
                    </div>
                  </td>

                  {/* R3 */}
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      s.r3Touched
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40 font-black'
                        : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                    }`}>
                      ${formatPrice(s.r3)}
                    </span>
                  </td>

                  {/* R2 */}
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      s.r2Touched
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40 font-black'
                        : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                    }`}>
                      ${formatPrice(s.r2)}
                    </span>
                  </td>

                  {/* S2 */}
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      s.s2Touched
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40 font-black'
                        : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                    }`}>
                      ${formatPrice(s.s2)}
                    </span>
                  </td>

                  {/* S3 */}
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      s.s3Touched
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40 font-black'
                        : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                    }`}>
                      ${formatPrice(s.s3)}
                    </span>
                  </td>

                  {/* Touch Outcome */}
                  <td className="py-3 px-3 text-right">
                    {touchedCount > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-500/15 border border-red-500/30 text-red-300 font-bold text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        <span>{touchedCount} Level{touchedCount > 1 ? 's' : ''} Touched</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-dark-800 text-slate-400 text-[10px]">
                        <CheckCircle className="w-3 h-3 text-slate-500" />
                        <span>Untouched</span>
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
