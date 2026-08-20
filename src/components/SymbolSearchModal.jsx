import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Check, Globe, TrendingUp, Cpu, BarChart2, DollarSign, Layers } from 'lucide-react';
import { api } from '../services/api';

const ASSET_TABS = [
  { id: 'ALL', label: 'All Assets', icon: Layers },
  { id: 'COMMODITY', label: 'Commodities', icon: DollarSign },
  { id: 'CRYPTO', label: 'Crypto', icon: Cpu },
  { id: 'FOREX', label: 'Forex', icon: Globe },
  { id: 'INDEX', label: 'Indices', icon: BarChart2 },
  { id: 'STOCK', label: 'Stocks', icon: TrendingUp }
];

export const SymbolSearchModal = ({ isOpen, onClose, activeSymbol, onSelectSymbol }) => {
  const [query, setQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('ALL');
  const [symbols, setSymbols] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      loadSymbols();
    }
  }, [isOpen, selectedTab]);

  const loadSymbols = async () => {
    setIsLoading(true);
    try {
      const res = await api.searchSymbols(query, selectedTab);
      if (res.data?.data) {
        setSymbols(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load symbols:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQueryChange = async (e) => {
    const val = e.target.value;
    setQuery(val);
    try {
      const res = await api.searchSymbols(val, selectedTab);
      if (res.data?.data) {
        setSymbols(res.data.data);
      }
    } catch (err) {}
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-950/95 border border-slate-800/90 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        
        {/* Search Header */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-900/50 flex items-center gap-3">
          <Search className="w-5 h-5 text-amber-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleQueryChange}
            placeholder="Search symbol (e.g. Gold, XAU, BTC, Nifty, EURUSD, Apple, NASDAQ)..."
            className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 text-sm font-semibold outline-none"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); loadSymbols(); }}
              className="p-1 rounded-md text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Asset Category Filter Pills */}
        <div className="px-4 py-2.5 bg-slate-900/40 border-b border-slate-800/60 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {ASSET_TABS.map(tab => {
            const Icon = tab.icon;
            const isSel = selectedTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSel
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 font-black scale-[1.02]'
                    : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Symbol Results List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 divide-y divide-slate-800/40">
          {isLoading ? (
            <div className="py-16 text-center text-slate-500 font-mono text-xs">
              <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Searching verified assets...
            </div>
          ) : symbols.length === 0 ? (
            <div className="py-16 text-center text-slate-500 font-mono text-xs">
              No matching assets found for "{query}".
            </div>
          ) : (
            symbols.map(sym => {
              const isActive = (activeSymbol || '').toUpperCase() === sym.symbol.toUpperCase();
              
              const badgeColors = {
                COMMODITY: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
                CRYPTO: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
                FOREX: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
                INDEX: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
                STOCK: 'bg-sky-500/15 text-sky-400 border-sky-500/30'
              };

              return (
                <div
                  key={sym.symbol}
                  onClick={() => {
                    onSelectSymbol(sym.symbol);
                    onClose();
                  }}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer group ${
                    isActive
                      ? 'bg-amber-500/10 border-amber-500/50 shadow-md shadow-amber-500/10'
                      : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-850 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs font-mono border ${
                      isActive
                        ? 'bg-amber-400 text-slate-950 border-amber-400'
                        : 'bg-slate-800 text-slate-200 border-slate-700 group-hover:border-amber-400/50'
                    }`}>
                      {sym.symbol.slice(0, 4)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white font-mono">{sym.symbol}</span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${badgeColors[sym.assetType] || 'bg-slate-800 text-slate-300'}`}>
                          {sym.assetType}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {sym.exchange}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 font-medium mt-0.5">
                        {sym.displayName} • <span className="text-slate-500">{sym.provider}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right font-mono hidden sm:block">
                      <div className="text-[11px] text-slate-400">TV: {sym.tradingViewTicker}</div>
                      <div className="text-[10px] text-slate-500">Session Close: {sym.sessionCloseUtc} UTC</div>
                    </div>
                    {isActive ? (
                      <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs shadow-md">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>ACTIVE</span>
                      </div>
                    ) : (
                      <button className="px-3 py-1.5 rounded-xl bg-slate-800 group-hover:bg-amber-400/20 group-hover:text-amber-300 text-slate-300 border border-slate-700 text-xs font-bold transition-all">
                        SELECT
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-900/60 border-t border-slate-800/80 text-center text-[11px] font-mono text-slate-400">
          Tip: Selecting a symbol instantly updates live ticks, completed period OHLC, dynamic pivot levels, and TradingView alerts.
        </div>
      </div>
    </div>
  );
};
