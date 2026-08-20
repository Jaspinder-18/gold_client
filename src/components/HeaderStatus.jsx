import React from 'react';
import { Activity, Radio, ShieldCheck, Send, Database, Sliders, PlayCircle, Search, ChevronDown } from 'lucide-react';

export const HeaderStatus = ({
  activeSymbol = 'XAUUSD',
  symbolConfig = {},
  systemHealth,
  isSocketConnected,
  onOpenSymbolSearch,
  onOpenTestConsole,
  onOpenSettings
}) => {
  const marketFeed = systemHealth?.marketFeed || {};
  const tg = systemHealth?.telegram || {};

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40 px-4 lg:px-8 py-3.5 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        {/* Brand & Market Identity + Symbol Switcher Button */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/25 ring-2 ring-amber-400/40 transform hover:scale-105 transition-all duration-300">
            <Activity className="w-6 h-6 text-slate-950 font-black stroke-[2.8]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onOpenSymbolSearch}
                className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-amber-400/60 transition-all cursor-pointer group"
                title="Click to search and change trading symbol"
              >
                <Search className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="text-base font-black text-white font-mono">{activeSymbol}</span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {symbolConfig?.assetType || 'ASSET'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
              </button>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="w-1.5 h-1.5 -ml-3.5 rounded-full bg-emerald-400"></span>
                LIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2 mt-1 font-medium">
              <span className="text-slate-300 font-semibold">{symbolConfig?.displayName || 'Multi-Asset Stream'}</span>
              <span className="text-amber-500/50">•</span>
              <span className="text-slate-400 font-mono text-[11px]">{symbolConfig?.exchange || 'OANDA'}</span>
              <span className="text-amber-500/50">•</span>
              <span className="text-amber-400/90 font-semibold">Dynamic Pivot Levels</span>
            </p>
          </div>
        </div>

        {/* System Health Indicators */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          
          {/* Market Feed Status */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-semibold transition-all duration-300 ${
            marketFeed.connected
              ? 'bg-slate-900/80 text-emerald-300 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
              : 'bg-rose-950/40 text-rose-300 border-rose-800/60'
          }`}>
            <span className={`w-2 h-2 rounded-full ${marketFeed.connected ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-rose-500'}`}></span>
            <span>Market Feed</span>
          </div>

          {/* WebSocket Status */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-semibold transition-all duration-300 ${
            isSocketConnected
              ? 'bg-slate-900/80 text-slate-200 border-slate-700/80'
              : 'bg-rose-950/40 text-rose-300 border-rose-800/60'
          }`}>
            <Radio className={`w-3.5 h-3.5 ${isSocketConnected ? 'text-emerald-400' : 'text-rose-400'}`} />
            <span>WebSocket</span>
          </div>

          {/* Alert Engine Status */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 text-slate-200 border border-slate-700/80 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Alert Engine</span>
          </div>

          {/* Telegram Status */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-semibold ${
            tg.connected !== false
              ? 'bg-slate-900/80 text-slate-200 border-slate-700/80'
              : 'bg-amber-950/40 text-amber-300 border-amber-800/60'
          }`} title={tg.botUsername ? `@${tg.botUsername}` : 'Telegram Bot'}>
            <Send className="w-3.5 h-3.5 text-sky-400" />
            <span>Telegram Bot</span>
          </div>

          {/* Database Status */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 text-slate-200 border border-slate-700/80 font-semibold">
            <Database className="w-3.5 h-3.5 text-purple-400" />
            <span>MongoDB</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 ml-1.5">
            <button
              onClick={onOpenTestConsole}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-extrabold transition-all duration-200 shadow-lg shadow-amber-500/25 active:scale-95 cursor-pointer"
            >
              <PlayCircle className="w-4 h-4 text-slate-950 stroke-[2.5]" />
              <span>Test Alert</span>
            </button>

            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 hover:border-amber-500/40 transition-all duration-200 shadow-sm cursor-pointer active:scale-95"
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
