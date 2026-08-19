import React, { useState, useEffect } from 'react';
import { X, Save, RefreshCw, Sliders, CheckCircle2, Monitor, Sparkles } from 'lucide-react';
import { api } from '../services/api';

export const ConfigDrawer = ({ config, onClose, onConfigSaved }) => {
  const [formData, setFormData] = useState({
    r3: config?.r3 || 4473.76,
    r2: config?.r2 || 4432.84,
    s2: config?.s2 || 4300.45,
    s3: config?.s3 || 4259.54,
    autoCalculatePivot: config?.autoCalculatePivot !== false,
    pivotType: config?.pivotType || 'FIBONACCI',
    tolerance: config?.tolerance || 0.20,
    retriggerDistance: config?.retriggerDistance || 1.00,
    telegramAlertsEnabled: config?.telegramAlertsEnabled !== false,
    enabled: config?.enabled !== false,
    tradingViewTicker: config?.tradingViewTicker || 'OANDA:XAUUSD',
    customChartUrl: config?.customChartUrl || '',
    chartTimeframe: config?.chartTimeframe || '5',
    chartRange: config?.chartRange || '2D'
  });

  useEffect(() => {
    if (config) {
      setFormData(prev => ({
        ...prev,
        r3: config.r3 || prev.r3,
        r2: config.r2 || prev.r2,
        s2: config.s2 || prev.s2,
        s3: config.s3 || prev.s3,
        chartTimeframe: config.chartTimeframe || prev.chartTimeframe,
        chartRange: config.chartRange || prev.chartRange,
        tolerance: config.tolerance !== undefined ? config.tolerance : prev.tolerance,
        retriggerDistance: config.retriggerDistance !== undefined ? config.retriggerDistance : prev.retriggerDistance,
        tradingViewTicker: config.tradingViewTicker || prev.tradingViewTicker,
        customChartUrl: config.customChartUrl || prev.customChartUrl
      }));
    }
  }, [config]);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const payload = {
        r3: parseFloat(formData.r3),
        r2: parseFloat(formData.r2),
        s2: parseFloat(formData.s2),
        s3: parseFloat(formData.s3),
        autoCalculatePivot: formData.autoCalculatePivot,
        pivotType: formData.pivotType,
        tolerance: parseFloat(formData.tolerance),
        retriggerDistance: parseFloat(formData.retriggerDistance),
        telegramAlertsEnabled: formData.telegramAlertsEnabled,
        enabled: formData.enabled,
        tradingViewTicker: formData.tradingViewTicker,
        customChartUrl: formData.customChartUrl,
        chartTimeframe: formData.chartTimeframe,
        chartRange: formData.chartRange
      };

      const res = await api.updateConfig(payload);
      setSaveSuccess(true);
      if (onConfigSaved && res.data?.data) {
        onConfigSaved(res.data.data);
      }
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      alert('Failed to save configuration: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-dark-900 border-l border-dark-700 h-full overflow-y-auto p-6 flex flex-col justify-between shadow-2xl">
        
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-dark-800 mb-5">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-gold-400" />
              <h3 className="text-base font-bold text-white">System Settings</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-slate-400 hover:text-white border border-dark-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form id="configForm" onSubmit={handleSave} className="space-y-4">
            
            {/* Global Engine Toggles */}
            <div className="p-3.5 rounded-xl bg-dark-950/70 border border-dark-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-200">Alert Engine Active</div>
                  <div className="text-[10px] text-slate-400">Monitor level touches continuously</div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.enabled}
                  onChange={(e) => handleChange('enabled', e.target.checked)}
                  className="w-4 h-4 accent-gold-500 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-dark-800/80">
                <div>
                  <div className="text-xs font-bold text-slate-200">Telegram Notifications</div>
                  <div className="text-[10px] text-slate-400">Send real TradingView photos to Telegram</div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.telegramAlertsEnabled}
                  onChange={(e) => handleChange('telegramAlertsEnabled', e.target.checked)}
                  className="w-4 h-4 accent-gold-500 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-dark-800/80">
                <div>
                  <div className="text-xs font-bold text-slate-200">Live Auto-Update Levels</div>
                  <div className="text-[10px] text-slate-400">Automatically recalculate when market range shifts</div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.autoCalculatePivot}
                  onChange={(e) => handleChange('autoCalculatePivot', e.target.checked)}
                  className="w-4 h-4 accent-gold-500 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* TradingView Chart Settings */}
            <div className="p-3.5 rounded-xl bg-dark-950/70 border border-dark-800 space-y-3">
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-gold-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-gold-400">
                  TradingView Chart Engine
                </h4>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  TradingView Ticker Symbol
                </label>
                <input
                  type="text"
                  value={formData.tradingViewTicker}
                  onChange={(e) => handleChange('tradingViewTicker', e.target.value)}
                  placeholder="e.g. OANDA:XAUUSD"
                  className="w-full px-3 py-2 rounded-lg bg-dark-900 border border-dark-800 text-xs font-mono text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Optional Custom Chart Layout URL
                </label>
                <input
                  type="text"
                  value={formData.customChartUrl}
                  onChange={(e) => handleChange('customChartUrl', e.target.value)}
                  placeholder="https://www.tradingview.com/chart/LAYOUT_ID/"
                  className="w-full px-3 py-2 rounded-lg bg-dark-900 border border-dark-800 text-xs font-mono text-white focus:outline-none focus:border-gold-500"
                />
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Leave blank to use the built-in TradingView Advanced Real-Time Chart widget.
                </span>
              </div>

              {/* Screenshot Chart Range (1 Day, 2 Days, 3 Days, 5 Days) */}
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1.5">
                  Screenshot Chart History Range
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: '1D', label: '1 Day' },
                    { value: '2D', label: '2 Days' },
                    { value: '3D', label: '3 Days' },
                    { value: '5D', label: '5 Days' }
                  ].map(r => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => handleChange('chartRange', r.value)}
                      className={`py-2 px-2 rounded-lg text-xs font-mono font-bold transition-all ${
                        formData.chartRange === r.value
                          ? 'bg-gold-500 text-black shadow-md shadow-gold-500/20 font-black scale-[1.02]'
                          : 'bg-dark-900 text-slate-400 border border-dark-800 hover:text-white'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
                <span className="text-[10px] text-slate-500 block mt-1">
                  Controls how many days of clean candlesticks appear in screenshot captures (volume & other indicators removed).
                </span>
              </div>

              {/* Dynamic Bar Spacing (Candle Width & Zoom) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-medium text-slate-300">
                    Candle Bar Spacing (Zoom & Width)
                  </label>
                  <span className="text-xs font-mono font-bold text-gold-400">
                    {formData.barSpacing || 22}px
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[
                    { value: 10, label: 'Compact' },
                    { value: 16, label: 'Standard' },
                    { value: 22, label: 'Wide' },
                    { value: 30, label: 'Zoom+' }
                  ].map(b => (
                    <button
                      key={b.value}
                      type="button"
                      onClick={() => handleChange('barSpacing', b.value)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-mono font-bold transition-all ${
                        (formData.barSpacing || 22) === b.value
                          ? 'bg-gold-500 text-black shadow-md shadow-gold-500/20 font-black scale-[1.02]'
                          : 'bg-dark-900 text-slate-400 border border-dark-800 hover:text-white'
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
                <input
                  type="range"
                  min="6"
                  max="40"
                  step="1"
                  value={formData.barSpacing || 22}
                  onChange={(e) => handleChange('barSpacing', parseInt(e.target.value, 10))}
                  className="w-full accent-gold-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 block mt-1">
                  Adjust candle thickness and horizontal zoom dynamically for all screenshot captures.
                </span>
              </div>
            </div>

            {/* Threshold Rules */}
            <div className="p-3.5 rounded-xl bg-dark-950/70 border border-dark-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gold-400">
                Touch & Re-Trigger Thresholds
              </h4>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Level Touch Tolerance (USD)
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={formData.tolerance}
                  onChange={(e) => handleChange('tolerance', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-dark-900 border border-dark-800 text-xs font-mono text-white focus:outline-none focus:border-gold-500"
                />
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  e.g. ±0.20 triggers when price is within 20 cents of level
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Anti-Duplicate Reset Distance (USD)
                </label>
                <input
                  type="number"
                  step="0.10"
                  value={formData.retriggerDistance}
                  onChange={(e) => handleChange('retriggerDistance', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-dark-900 border border-dark-800 text-xs font-mono text-white focus:outline-none focus:border-gold-500"
                />
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Price must move away by this amount before re-triggering
                </span>
              </div>
            </div>

            {/* Automatic Dynamic Levels Information Banner */}
            <div className="p-3.5 rounded-xl bg-dark-950/70 border border-dark-800 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-gold-500/10 text-gold-400 border border-gold-500/20">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">
                  Automatic Dynamic Pivot Engine
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  R3, R2, S2, and S3 levels are automatically synchronized and updated directly from live market movements in real time. Manual entry is disabled.
                </p>
              </div>
            </div>

          </form>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-dark-800 space-y-2">
          {saveSuccess && (
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Settings Saved & Active!</span>
            </div>
          )}

          <button
            type="submit"
            form="configForm"
            disabled={isSaving}
            className="w-full py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-gold-500/20 active:scale-95 transition-all disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Configuration</span>
          </button>
        </div>

      </div>
    </div>
  );
};
