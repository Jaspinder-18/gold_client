import React from 'react';
import { Image, ExternalLink, Clock, Send, Camera, Trash2 } from 'lucide-react';
import { formatPrice, formatTime, getLevelColor } from '../utils/formatters';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const ScreenshotGallery = ({ alerts = [], onViewScreenshot, onDeleteScreenshot }) => {
  const alertsWithImages = alerts.filter(a => a.screenshotPath).slice(0, 6);

  if (alertsWithImages.length === 0) return null;

  return (
    <div className="rounded-2xl bg-dark-900 border border-dark-700/80 p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-gold-400" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            Recent TradingView Chart Screenshots
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          Showing Latest {alertsWithImages.length} Captures (Auto-Pruned to 6)
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {alertsWithImages.map(evt => {
          const styling = getLevelColor(evt.level);
          const screenshotUrl = evt.screenshotPath?.startsWith('http')
            ? evt.screenshotPath
            : `${API_BASE_URL}${evt.screenshotPath}`;

          return (
            <div
              key={evt._id}
              onClick={() => onViewScreenshot(evt)}
              className="group rounded-xl overflow-hidden bg-dark-950/80 border border-dark-800 hover:border-gold-500/50 transition-all duration-300 shadow-md cursor-pointer flex flex-col relative"
            >
              {/* Image Preview Thumbnail */}
              <div className="relative aspect-video w-full bg-dark-950 overflow-hidden border-b border-dark-800">
                <img
                  src={screenshotUrl}
                  alt={`TradingView ${evt.level} Chart`}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-950/80 via-transparent to-transparent"></div>

                <div className="absolute top-2 left-2">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded shadow ${styling.badge}`}>
                    {evt.level} TOUCHED
                  </span>
                </div>

                {/* Delete Button */}
                {onDeleteScreenshot && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Delete screenshot for ${evt.level} alert?`)) {
                        onDeleteScreenshot(evt._id);
                      }
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-rose-600 text-slate-300 hover:text-white transition-all shadow-md backdrop-blur-sm"
                    title="Delete Screenshot"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}

                <div className="absolute bottom-2 right-2 text-[10px] font-mono text-slate-300 bg-dark-900/80 px-2 py-0.5 rounded border border-dark-700/80 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTime(evt.timestamp || evt.createdAt)}
                </div>
              </div>

              {/* Card Meta */}
              <div className="p-3 flex flex-col justify-between flex-1">
                <div className="flex items-baseline justify-between mb-1.5">
                  <div className="font-mono text-xs font-bold text-white">
                    {formatPrice(evt.currentPrice)}
                  </div>
                  <div className="font-mono text-[11px] text-slate-400">
                    Level: ${evt.levelPrice?.toFixed(2)}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-dark-800/80 text-[10px]">
                  <span className={`flex items-center gap-1 font-semibold ${
                    evt.telegramStatus === 'SENT' ? 'text-emerald-400' : 'text-slate-400'
                  }`}>
                    <Send className="w-3 h-3" />
                    {evt.telegramStatus === 'SENT' ? 'Telegram Sent' : 'Saved Local'}
                  </span>

                  <span className="text-gold-400 group-hover:text-gold-300 font-medium flex items-center gap-1 font-mono">
                    VIEW FULL
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
