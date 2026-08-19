import React from 'react';
import { X, Download, Send, AlertCircle, Info, Calendar, DollarSign, Crosshair, ZoomIn, Trash2 } from 'lucide-react';
import { formatPrice, formatDateTime, getLevelColor } from '../utils/formatters';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const ScreenshotModal = ({ alert, onClose, onDeleteAlert }) => {
  if (!alert) return null;

  const styling = getLevelColor(alert.level);
  const isResistance = alert.level?.startsWith('R');
  const screenshotUrl = alert.screenshotPath?.startsWith('http')
    ? alert.screenshotPath
    : `${API_BASE_URL}${alert.screenshotPath}`;

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete this screenshot for ${alert.level}?`)) {
      if (onDeleteAlert) {
        onDeleteAlert(alert._id);
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-5xl max-h-[94vh] overflow-y-auto rounded-2xl bg-dark-900 border border-dark-700 shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="p-4 sm:px-6 bg-dark-850 border-b border-dark-800 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <span className={`text-xs font-black px-2.5 py-1 rounded shadow ${styling.badge}`}>
              {alert.level} TOUCHED
            </span>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Gold (XAU/USD)</span>
                <span className="font-mono text-gold-400">{formatPrice(alert.currentPrice)}</span>
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                {formatDateTime(alert.timestamp || alert.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {alert.screenshotPath && (
              <a
                href={screenshotUrl}
                download={`gold-tradingview-${alert.level}-${Date.now()}.png`}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-dark-800 hover:bg-dark-700 text-slate-300 hover:text-white border border-dark-700 transition-colors flex items-center gap-1.5 text-xs font-mono"
                title="Download Real TradingView Screenshot"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download</span>
              </a>
            )}

            {onDeleteAlert && (
              <button
                type="button"
                onClick={handleDelete}
                className="p-2 rounded-lg bg-rose-950/40 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-800/60 transition-colors flex items-center gap-1.5 text-xs font-mono"
                title="Delete this screenshot"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-dark-800 hover:bg-dark-700 text-slate-400 hover:text-white border border-dark-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-6">
          
          {/* Real TradingView Chart Screenshot Preview */}
          {alert.screenshotPath ? (
            <div className="rounded-xl overflow-hidden border border-dark-800 bg-dark-950 shadow-inner group relative">
              <img
                src={screenshotUrl}
                alt="Actual TradingView Alert Chart Screenshot"
                className="w-full h-auto object-contain max-h-[560px] mx-auto select-none"
              />
              <div className="absolute top-3 right-3 bg-dark-950/80 backdrop-blur px-3 py-1 rounded-md border border-dark-700 text-[11px] font-mono text-slate-300 flex items-center gap-1">
                <ZoomIn className="w-3.5 h-3.5 text-gold-400" />
                <span>Actual TradingView Capture</span>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-slate-500 font-mono border border-dashed border-dark-800 rounded-xl">
              Screenshot not available for this event.
            </div>
          )}

          {/* Section: Alert Event Rationale & Metrics */}
          <div className="rounded-xl bg-dark-950/80 border border-dark-800 p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-gold-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Alert Trigger Rationale & Dispatch Details
              </h3>
            </div>

            {/* Rationale description */}
            <p className="text-xs text-slate-300 leading-relaxed font-sans mb-4 bg-dark-900/60 p-3 rounded-lg border border-dark-800 font-mono">
              {alert.triggerReason || `Gold XAU/USD touched the ${alert.level} ${isResistance ? 'resistance' : 'support'} level at $${alert.levelPrice?.toFixed(2)}.`}
            </p>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-dark-900 border border-dark-800">
                <span className="text-slate-500 block text-[10px]">Target Level</span>
                <span className="font-bold text-white">{alert.level} (${alert.levelPrice?.toFixed(2)})</span>
              </div>

              <div className="p-2.5 rounded-lg bg-dark-900 border border-dark-800">
                <span className="text-slate-500 block text-[10px]">Trigger Price</span>
                <span className="font-bold text-emerald-400">${alert.currentPrice?.toFixed(2)}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-dark-900 border border-dark-800">
                <span className="text-slate-500 block text-[10px]">Tolerance</span>
                <span className="font-bold text-amber-400">±${alert.tolerance?.toFixed(2) || '0.20'}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-dark-900 border border-dark-800">
                <span className="text-slate-500 block text-[10px]">Telegram Status</span>
                <span className={`font-bold ${alert.telegramStatus === 'SENT' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {alert.telegramStatus === 'SENT' ? '✓ SENT WITH TV PHOTO' : (alert.telegramStatus || 'PENDING')}
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
