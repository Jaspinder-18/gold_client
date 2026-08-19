import React from 'react';
import { Activity, Radio, ShieldCheck, Send, Database, Sliders, PlayCircle } from 'lucide-react';

export const HeaderStatus = ({
  systemHealth,
  isSocketConnected,
  onOpenTestConsole,
  onOpenSettings
}) => {
  const marketFeed = systemHealth?.marketFeed || {};
  const tg = systemHealth?.telegram || {};
  const db = systemHealth?.database || {};
  const alertEngine = systemHealth?.alertEngine || {};

  return (
    <header className="border-b border-dark-800 bg-dark-900/90 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        {/* Brand & Market Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-500 to-amber-600 flex items-center justify-center shadow-lg shadow-gold-500/20 ring-1 ring-gold-400/40">
            <Activity className="w-6 h-6 text-black font-extrabold stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-1.5">
                GOLD <span className="text-gold-400 font-mono">XAU/USD</span> TERMINAL
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                LIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <span>TradingView Feed</span>
              <span>•</span>
              <span>R3 · R2 · S2 · S3 Pivot Engine</span>
            </p>
          </div>
        </div>

        {/* System Health Indicators */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          
          {/* Market Feed Status */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-medium ${
            marketFeed.connected
              ? 'bg-dark-850 text-slate-200 border-dark-700'
              : 'bg-rose-950/40 text-rose-300 border-rose-800/60'
          }`}>
            <span className={`w-2 h-2 rounded-full ${marketFeed.connected ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-rose-500'}`}></span>
            <span>Market Feed</span>
          </div>

          {/* WebSocket Status */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-medium ${
            isSocketConnected
              ? 'bg-dark-850 text-slate-200 border-dark-700'
              : 'bg-rose-950/40 text-rose-300 border-rose-800/60'
          }`}>
            <Radio className={`w-3.5 h-3.5 ${isSocketConnected ? 'text-emerald-400' : 'text-rose-400'}`} />
            <span>WebSocket</span>
          </div>

          {/* Alert Engine Status */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-dark-850 text-slate-200 border border-dark-700 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-gold-400" />
            <span>Alert Engine</span>
          </div>

          {/* Telegram Status */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-medium ${
            tg.connected !== false
              ? 'bg-dark-850 text-slate-200 border-dark-700'
              : 'bg-amber-950/40 text-amber-300 border-amber-800/60'
          }`} title={tg.botUsername ? `@${tg.botUsername}` : 'Telegram Bot'}>
            <Send className="w-3.5 h-3.5 text-sky-400" />
            <span>Telegram Bot</span>
          </div>

          {/* Database Status */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-dark-850 text-slate-200 border border-dark-700 font-medium">
            <Database className="w-3.5 h-3.5 text-purple-400" />
            <span>MongoDB</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 ml-1">
            <button
              onClick={onOpenTestConsole}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold-500 hover:bg-gold-400 text-black font-bold transition-all shadow-md shadow-gold-500/20 active:scale-95"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Test Alert</span>
            </button>

            <button
              onClick={onOpenSettings}
              className="p-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-slate-300 hover:text-white border border-dark-700 transition-colors"
              title="System Configuration"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </header>
  );
};
