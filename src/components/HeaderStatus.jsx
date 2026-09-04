import React from 'react';
import { Activity, Sliders, Search, ChevronDown } from 'lucide-react';

export const HeaderStatus = ({
  activeSymbol = 'XAUUSD',
  symbolConfig = {},
  telegramAlertsEnabled = true,
  onToggleTelegram,
  onOpenSymbolSearch,
  onOpenSettings
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40 px-4 lg:px-8 py-3.5 shadow-2xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
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
              <span className="text-amber-400/90 font-semibold">Custom Price Alerts</span>
            </p>
          </div>
        </div>

        {/* Right Side: Telegram Quick ON/OFF Toggle + Settings Button */}
        <div className="flex items-center gap-2.5">
          {/* Telegram One-Click ON/OFF Toggle Button */}
          <button
            type="button"
            onClick={onToggleTelegram}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border transition-all duration-200 shadow-md cursor-pointer active:scale-95 text-xs font-mono font-black ${
              telegramAlertsEnabled
                ? 'bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border-sky-500/40 shadow-sky-500/10'
                : 'bg-slate-900/90 hover:bg-slate-800 text-slate-400 border-slate-700/80 hover:text-slate-200'
            }`}
            title={`Telegram notifications are currently ${telegramAlertsEnabled ? 'ENABLED' : 'DISABLED'}. Click to toggle.`}
          >
            <span className={`w-2 h-2 rounded-full ${telegramAlertsEnabled ? 'bg-sky-400 animate-pulse' : 'bg-slate-600'}`}></span>
            <span>TELEGRAM:</span>
            <span className={`font-black ${telegramAlertsEnabled ? 'text-sky-300' : 'text-slate-500'}`}>
              {telegramAlertsEnabled ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Settings Button */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 hover:border-amber-500/40 transition-all duration-200 shadow-sm cursor-pointer active:scale-95 text-xs font-bold font-mono"
            title="Screenshot & Alert Settings"
          >
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>Settings</span>
          </button>
        </div>

      </div>
    </header>
  );
};
