import React from 'react';
import { History, Eye, CheckCircle2, XCircle, Trash2, Target } from 'lucide-react';
import { formatPrice, formatDateTime } from '../utils/formatters';

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
            Custom Price Alert Event History
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
              <th className="py-3.5 px-5">Chart Screenshot</th>
              <th className="py-3.5 px-5">Symbol</th>
              <th className="py-3.5 px-5">Custom Target</th>
              <th className="py-3.5 px-5">Triggered Price</th>
              <th className="py-3.5 px-5">Status</th>
              <th className="py-3.5 px-5">Date / Time (UTC)</th>
              <th className="py-3.5 px-5">Telegram</th>
              <th className="py-3.5 px-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs font-medium">
            {visibleAlerts.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center text-slate-500 font-mono">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Target className="w-8 h-8 text-slate-700 animate-pulse" />
                    <span>No alerts triggered yet. Monitoring active custom price in real-time.</span>
                  </div>
                </td>
              </tr>
            ) : (
              visibleAlerts.map(evt => {
                const isSent = evt.telegramStatus === 'SENT';
                const hasScreenshot = !!evt.screenshotPath;
                const screenshotUrl = evt.screenshotPath?.startsWith('http')
                  ? evt.screenshotPath
                  : `${API_BASE_URL}${evt.screenshotPath}`;

                const customPriceVal = evt.customPrice || evt.levelPrice || evt.currentPrice;
                const triggerPriceVal = evt.triggerPrice || evt.currentPrice;

                return (
                  <tr
                    key={evt._id || evt.eventId}
                    className="hover:bg-slate-900/60 transition-all duration-200 group cursor-pointer"
                    onClick={() => onSelectAlert(evt)}
                  >
                    {/* Chart Thumbnail */}
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
                            alt={`Chart ${evt.symbol}`}
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

                    {/* Symbol */}
                    <td className="py-3.5 px-5 font-mono font-bold">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-slate-800 text-white border border-slate-700 shadow-sm">
                          {evt.symbol || 'XAUUSD'}
                        </span>
                        {evt.isTest && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-extrabold">
                            TEST
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Custom Target */}
                    <td className="py-3.5 px-5 font-mono font-black text-amber-400 text-sm tabular-nums">
                      ${Number(customPriceVal).toFixed(2)}
                    </td>

                    {/* Triggered Price */}
                    <td className="py-3.5 px-5 font-mono text-slate-100 font-bold tabular-nums">
                      ${Number(triggerPriceVal).toFixed(2)}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-5">
                      <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-black uppercase tracking-wider">
                        {evt.status || 'TRIGGERED'}
                      </span>
                    </td>

                    {/* Timestamp */}
                    <td className="py-3.5 px-5 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                      {formatDateTime(evt.triggeredAt || evt.timestamp || evt.createdAt)}
                    </td>

                    {/* Telegram Status */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-1.5">
                        {isSent ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Sent</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                            <span>{evt.telegramStatus || 'Pending'}</span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Delete Action */}
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('Delete this alert screenshot and event?')) {
                            onDeleteAlert(evt._id || evt.eventId);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 transition-all active:scale-95"
                        title="Delete alert from online database"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
