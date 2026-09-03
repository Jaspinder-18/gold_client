import React, { useState, useEffect } from 'react';
import { X, Save, RefreshCw, Sliders, CheckCircle2, Monitor, Layers, Send } from 'lucide-react';
import { api } from '../services/api';

const TIMEFRAMES = [
  { value: '1', label: '1M (1 Minute)' },
  { value: '3', label: '3M (3 Minutes)' },
  { value: '5', label: '5M (5 Minutes)' },
  { value: '15', label: '15M (15 Minutes - Standard)' },
  { value: '30', label: '30M (30 Minutes)' },
  { value: '60', label: '1H (1 Hour)' },
  { value: '240', label: '4H (4 Hours)' },
  { value: 'D', label: '1D (Daily)' }
];

export const ConfigDrawer = ({ config, activeSymbol = 'XAUUSD', isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    chartTimeframe: config?.chartTimeframe || '15',
    chartRange: config?.chartRange || '1D',
    barSpacing: config?.barSpacing || 22,
    tolerance: config?.tolerance || 0.20,
    telegramAlertsEnabled: config?.telegramAlertsEnabled !== false,
    tradingViewTicker: config?.tradingViewTicker || `OANDA:${activeSymbol}`,
    customChartUrl: config?.customChartUrl || ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (config) {
      setFormData({
        chartTimeframe: config.chartTimeframe || '15',
        chartRange: config.chartRange || '1D',
        barSpacing: config.barSpacing || 22,
        tolerance: config.tolerance !== undefined ? config.tolerance : 0.20,
        telegramAlertsEnabled: config.telegramAlertsEnabled !== false,
        tradingViewTicker: config.tradingViewTicker || `OANDA:${activeSymbol}`,
        customChartUrl: config.customChartUrl || ''
      });
    }
  }, [config, activeSymbol]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const payload = {
        symbol: activeSymbol,
        chartTimeframe: String(formData.chartTimeframe),
        chartRange: String(formData.chartRange),
        barSpacing: parseInt(formData.barSpacing, 10) || 22,
        tolerance: parseFloat(formData.tolerance) || 0.20,
        telegramAlertsEnabled: Boolean(formData.telegramAlertsEnabled),
        tradingViewTicker: String(formData.tradingViewTicker),
        customChartUrl: String(formData.customChartUrl)
      };

      const res = await api.updateConfig(payload);
      setSaveSuccess(true);
      if (onSave && res.data?.data) {
        onSave(res.data.data);
      }
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      alert('Failed to save settings: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-slate-950 border-l border-slate-800 h-full overflow-y-auto p-6 flex flex-col justify-between shadow-2xl">
        
        {/* Top Header */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-wider">
                  Screenshot & Alert Settings
                </h3>
                <span className="text-xs font-mono font-bold text-slate-400">
                  Active Symbol: <strong className="text-amber-400">{activeSymbol}</strong>
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form id="settingsForm" onSubmit={handleSubmit} className="py-5 space-y-6">
            
            {/* Chart Screenshot Settings */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400">
                <Layers className="w-4 h-4" />
                <span>TradingView Chart Screenshot Engine</span>
              </div>

              {/* Timeframe Selector */}
              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 mb-1.5">
                  Screenshot Timeframe Interval
                </label>
                <select
                  value={formData.chartTimeframe}
                  onChange={(e) => handleChange('chartTimeframe', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  {TIMEFRAMES.map(tf => (
                    <option key={tf.value} value={tf.value}>
                      {tf.label}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-500 block mt-1">
                  Chart screenshots captured on price touch will use this exact timeframe.
                </span>
              </div>

              {/* Chart Range */}
              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 mb-1.5">
                  Visible Chart Range
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['1D', '5D', '1M'].map(rng => (
                    <button
                      key={rng}
                      type="button"
                      onClick={() => handleChange('chartRange', rng)}
                      className={`py-2 px-3 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                        formData.chartRange === rng
                          ? 'bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-500/20'
                          : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                      }`}
                    >
                      {rng}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bar Spacing / Zoom */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-mono font-bold text-slate-300">
                    Candlestick Zoom / Width
                  </label>
                  <span className="text-xs font-mono text-amber-400 font-black">
                    {formData.barSpacing}px
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="40"
                  step="2"
                  value={formData.barSpacing}
                  onChange={(e) => handleChange('barSpacing', Number(e.target.value))}
                  className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              </div>
            </div>

            {/* Price Touch Tolerance & Telegram Notifications */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400">
                <Send className="w-4 h-4 text-sky-400" />
                <span>Price Touch & Notifications</span>
              </div>

              {/* Touch Tolerance */}
              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 mb-1.5">
                  Price Touch Tolerance ($ USD)
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={formData.tolerance}
                  onChange={(e) => handleChange('tolerance', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-400"
                />
                <span className="text-[10px] text-slate-500 block mt-1">
                  e.g. ±0.20 triggers when market price is within 20 cents of custom target.
                </span>
              </div>

              {/* Telegram Alerts Toggle */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  <div className="text-xs font-mono font-bold text-white">Telegram Photo Alerts</div>
                  <div className="text-[10px] text-slate-400">Send chart screenshot to Telegram chat</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.telegramAlertsEnabled}
                    onChange={(e) => handleChange('telegramAlertsEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>
            </div>

          </form>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          {saveSuccess && (
            <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Settings Saved & Synced Online!</span>
            </div>
          )}

          <button
            type="submit"
            form="settingsForm"
            disabled={isSaving}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isSaving ? 'Saving...' : 'Save Screenshot Settings'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
