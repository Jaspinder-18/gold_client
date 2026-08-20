import React from 'react';
import { History, Eye, CheckCircle2, XCircle, Info, Image as ImageIcon, Camera, Trash2 } from 'lucide-react';
import { formatPrice, formatDateTime, getLevelColor } from '../utils/formatters';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const AlertHistoryTable = ({ alerts = [], onSelectAlert, onViewScreenshot, onDeleteAlert }) => {
  const visibleAlerts = alerts.slice(0, 6);

  return (
    <div className="rounded-3xl glass-panel overflow-hidden shadow-2xl flex flex-col border border-slate-800/80">
      {/* Header */}
      <div className="px-6 py-4 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center border border-amber-500/30">
            <History className="w-4 h-4 text-amber-400" />
          </div>
          <h3 className="text-sm font-black text-slate-100 uppercase tracking-wider">
            TradingView Alert Event History
          </h3>
        </div>
        <span className="text-xs font-mono font-semibold text-slate-400 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
          Showing Latest {visibleAlerts.length} Events (Max 6)
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800/80 text-[11px] font-black text-slate-400 uppercase tracking-wider bg-slate-950/40">
              <th className="py-3.5 px-5">TV Chart Screenshot</th>
              <th className="py-3.5 px-5">Level</th>
              <th className="py-3.5 px-5">Trigger Price</th>
              <th className="py-3.5 px-5">Target Level</th>
              <th className="py-3.5 px-5">Date / Time (UTC)</th>
              <th className="py-3.5 px-5">Telegram Status</th>
              <th className="py-3.5 px-5">Screenshot Status</th>
              <th className="py-3.5 px-5">Alert Message</th>
              <th className="py-3.5 px-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs font-medium">
            {visibleAlerts.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-16 text-center text-slate-500 font-mono">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <History className="w-8 h-8 text-slate-700 animate-pulse" />
                    <span>No alerts triggered yet. Monitoring S3, S2, R2, R3 levels in real-time.</span>
                  </div>
                </td>
              </tr>
            ) : (
              visibleAlerts.map(evt => {
                const styling = getLevelColor(evt.level);
                const isSent = evt.telegramStatus === 'SENT';
                const hasScreenshot = !!evt.screenshotPath;
                const screenshotUrl = evt.screenshotPath?.startsWith('http')
                  ? evt.screenshotPath
                  : `${API_BASE_URL}${evt.screenshotPath}`;

                return (
                  <tr
                    key={evt._id}
                    className="hover:bg-slate-900/60 transition-all duration-200 group cursor-pointer"
                    onClick={() => onSelectAlert(evt)}
                  >
                    {/* Real TradingView Chart Thumbnail */}
                    <td className="py-3 px-5">
                      {hasScreenshot ? (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewScreenshot(evt);
                          }}
                          className="relative w-22 h-13 rounded-xl overflow-hidden border border-slate-700 bg-slate-950 hover:border-amber-400 transition-all shadow-md group/thumb"
                          title="Click to view full TradingView screenshot"
                        >
                          <img
                            src={screenshotUrl}
                            alt={`TradingView ${evt.level}`}
                            className="w-full h-full object-cover object-center group-hover/thumb:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity">
                            <Eye className="w-4 h-4 text-amber-400" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-22 h-13 rounded-xl border border-dashed border-slate-800 bg-slate-950/60 flex items-center justify-center text-[10px] text-slate-600 font-mono">
                          NO IMAGE
                        </div>
                      )}
                    </td>

                    {/* Level */}
                    <td className="py-3.5 px-5 font-mono font-bold">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-black shadow-sm ${styling.badge}`}>
                          {evt.level}
                        </span>
                        {evt.isTest && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-extrabold">
                            TEST
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Trigger Price */}
                    <td className="py-3.5 px-5 font-mono font-black text-slate-100 text-sm tabular-nums">
                      {formatPrice(evt.triggerPrice)}
                    </td>

                    {/* Target Level */}
                    <td className="py-3.5 px-5 font-mono text-slate-300 font-semibold tabular-nums">
                      {formatPrice(evt.targetLevelPrice)}
                    </td>

                    {/* Timestamp */}
                    <td className="py-3.5 px-5 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                      {formatDateTime(evt.timestamp || evt.createdAt)}
                    </td>

                    {/* Telegram Status */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-1.5">
                        {isSent ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Delivered</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Failed</span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Screenshot Status */}
                    <td className="py-3.5 px-5">
                      {hasScreenshot ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          <Camera className="w-3.5 h-3.5" />
                          <span>Captured</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-900 text-slate-500 border border-slate-800">
                          Pending
                        </span>
                      )}
                    </td>

                    {/* Alert Message */}
                    <td className="py-3.5 px-5 max-w-xs truncate text-slate-400 font-mono text-[11px]">
                      {evt.message || `Level ${evt.level} touched at ${formatPrice(evt.triggerPrice)}`}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {hasScreenshot && (
                          <button
                            type="button"
                            onClick={() => onViewScreenshot(evt)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 border border-slate-700 transition-all cursor-pointer"
                            title="View Full Screenshot"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onSelectAlert(evt)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer"
                          title="View Alert Details"
                        >
                          <Info className="w-3.5 h-3.5" />
                        </button>
                        {onDeleteAlert && (
                          <button
                            type="button"
                            onClick={() => onDeleteAlert(evt._id)}
                            className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 hover:text-rose-200 border border-rose-900/50 transition-all cursor-pointer"
                            title="Delete Alert Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
