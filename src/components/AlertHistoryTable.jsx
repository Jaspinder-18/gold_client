import React from 'react';
import { History, Eye, CheckCircle2, XCircle, Info, Image as ImageIcon, Camera, Trash2 } from 'lucide-react';
import { formatPrice, formatDateTime, getLevelColor } from '../utils/formatters';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const AlertHistoryTable = ({ alerts = [], onSelectAlert, onViewScreenshot, onDeleteAlert }) => {
  const visibleAlerts = alerts.slice(0, 6);

  return (
    <div className="rounded-2xl bg-dark-900 border border-dark-700/80 overflow-hidden shadow-xl flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 bg-dark-850 border-b border-dark-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-gold-400" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            TradingView Alert Event History
          </h3>
        </div>
        <span className="text-xs font-mono text-slate-400">
          Showing Latest {visibleAlerts.length} Events (Max 6)
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-dark-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-dark-950/40">
              <th className="py-3 px-4">TV Chart Screenshot</th>
              <th className="py-3 px-4">Level</th>
              <th className="py-3 px-4">Trigger Price</th>
              <th className="py-3 px-4">Target Level</th>
              <th className="py-3 px-4">Date / Time (UTC)</th>
              <th className="py-3 px-4">Telegram Status</th>
              <th className="py-3 px-4">Screenshot Status</th>
              <th className="py-3 px-4">Alert Message</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-800/60 text-xs">
            {visibleAlerts.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-500 font-mono">
                  No alerts triggered yet. Monitoring S3, S2, R2, R3 levels in real-time.
                </td>
              </tr>
            ) : (
              alerts.map(evt => {
                const styling = getLevelColor(evt.level);
                const isSent = evt.telegramStatus === 'SENT';
                const hasScreenshot = !!evt.screenshotPath;
                const screenshotUrl = evt.screenshotPath?.startsWith('http')
                  ? evt.screenshotPath
                  : `${API_BASE_URL}${evt.screenshotPath}`;

                return (
                  <tr
                    key={evt._id}
                    className="hover:bg-dark-850/50 transition-colors group cursor-pointer"
                    onClick={() => onSelectAlert(evt)}
                  >
                    {/* Real TradingView Chart Thumbnail */}
                    <td className="py-3 px-4">
                      {hasScreenshot ? (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewScreenshot(evt);
                          }}
                          className="relative w-20 h-12 rounded-lg overflow-hidden border border-dark-700 bg-dark-950 hover:border-gold-500/60 transition-all shadow-md group/thumb"
                          title="Click to view full TradingView screenshot"
                        >
                          <img
                            src={screenshotUrl}
                            alt={`TradingView ${evt.level}`}
                            className="w-full h-full object-cover object-center group-hover/thumb:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity">
                            <Eye className="w-3.5 h-3.5 text-gold-400" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-20 h-12 rounded-lg border border-dashed border-dark-700 bg-dark-950 flex items-center justify-center text-[10px] text-slate-600 font-mono">
                          NO IMAGE
                        </div>
                      )}
                    </td>

                    {/* Level */}
                    <td className="py-3.5 px-4 font-mono font-bold">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2.5 py-0.5 rounded text-[11px] font-extrabold ${styling.badge}`}>
                          {evt.level}
                        </span>
                        {evt.isTest && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            TEST
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Trigger Price */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-100">
                      {formatPrice(evt.currentPrice)}
                    </td>

                    {/* Level Target Price */}
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      ${evt.levelPrice?.toFixed(2)}
                    </td>

                    {/* Date / Time */}
                    <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                      {formatDateTime(evt.timestamp || evt.createdAt)}
                    </td>

                    {/* Telegram Status */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isSent
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}>
                        {isSent ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{isSent ? '✓ SENT' : 'FAILED'}</span>
                      </span>
                    </td>

                    {/* Screenshot Status */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        hasScreenshot
                          ? 'bg-gold-500/10 text-gold-400 border border-gold-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        <Camera className="w-3 h-3" />
                        <span>{hasScreenshot ? 'CAPTURED' : 'PENDING'}</span>
                      </span>
                    </td>

                    {/* Alert Message Snippet */}
                    <td className="py-3.5 px-4 max-w-xs truncate font-mono text-[11px] text-slate-400" title={evt.triggerReason}>
                      {evt.triggerReason || `${evt.level} level touched @ $${evt.currentPrice?.toFixed(2)}`}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectAlert(evt);
                          }}
                          className="inline-flex items-center gap-1 text-[11px] text-slate-300 hover:text-white bg-dark-800 hover:bg-dark-700 px-2.5 py-1 rounded border border-dark-700 transition-colors font-medium"
                          title="View Full TradingView Screenshot & Alert Details"
                        >
                          <Eye className="w-3 h-3 text-gold-400" />
                          <span>Inspect</span>
                        </button>

                        {onDeleteAlert && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Delete screenshot for ${evt.level}?`)) {
                                onDeleteAlert(evt._id);
                              }
                            }}
                            className="p-1 rounded bg-dark-800 hover:bg-rose-600 text-slate-400 hover:text-white border border-dark-700 transition-colors"
                            title="Delete Screenshot"
                          >
                            <Trash2 className="w-3 h-3" />
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
