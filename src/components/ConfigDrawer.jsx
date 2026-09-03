import React, { useState, useEffect } from 'react';
import { X, Save, RefreshCw, Sliders, CheckCircle2, Monitor, Sparkles } from 'lucide-react';
import { api } from '../services/api';

export const ConfigDrawer = ({ config, onClose, onConfigSaved }) => {
  const [formData, setFormData] = useState({
    r3: config?.r3 || 4657.02,
    r2: config?.r2 || 4580.75,
    s2: config?.s2 || 4333.97,
    s3: config?.s3 || 4257.70,
    autoCalculatePivot: config?.autoCalculatePivot || false,
    autoCalcIntervalMinutes: config?.autoCalcIntervalMinutes || 15,
    pivotType: config?.pivotType || 'FIBONACCI',
    tolerance: config?.tolerance || 0.20,
    retriggerDistance: config?.retriggerDistance || 1.00,
    telegramAlertsEnabled: config?.telegramAlertsEnabled !== false,
    customPriceAlertEnabled: config?.customPriceAlertEnabled || false,
    customPriceAlertTarget: config?.customPriceAlertTarget || '',
    enabled: config?.enabled !== false,
    tradingViewTicker: config?.tradingViewTicker || 'OANDA:XAUUSD',
    customChartUrl: config?.customChartUrl || 'https://www.tradingview.com/chart/hRhqMpmT/?symbol=OANDA%3AXAUUSD',
    chartTimeframe: config?.chartTimeframe || '5',
    chartRange: config?.chartRange || '1D',
    barSpacing: config?.barSpacing || 22
  });

  useEffect(() => {
    if (config) {
      setFormData(prev => ({
        ...prev,
        r3: config.r3 || prev.r3,
        r2: config.r2 || prev.r2,
        s2: config.s2 || prev.s2,
        s3: config.s3 || prev.s3,
        autoCalculatePivot: config.autoCalculatePivot !== undefined ? config.autoCalculatePivot : prev.autoCalculatePivot,
        autoCalcIntervalMinutes: config.autoCalcIntervalMinutes || prev.autoCalcIntervalMinutes || 15,
        customPriceAlertEnabled: config.customPriceAlertEnabled !== undefined ? config.customPriceAlertEnabled : prev.customPriceAlertEnabled,
        customPriceAlertTarget: config.customPriceAlertTarget !== undefined ? config.customPriceAlertTarget : prev.customPriceAlertTarget,
        chartTimeframe: config.chartTimeframe || prev.chartTimeframe,
        chartRange: config.chartRange || prev.chartRange,
        barSpacing: config.barSpacing || prev.barSpacing,
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
        symbol: config?.symbol,
        r3: parseFloat(formData.r3),
        r2: parseFloat(formData.r2),
        s2: parseFloat(formData.s2),
        s3: parseFloat(formData.s3),
        autoCalculatePivot: formData.autoCalculatePivot,
        autoCalcIntervalMinutes: parseInt(formData.autoCalcIntervalMinutes, 10) || 15,
        customPriceAlertEnabled: Boolean(formData.customPriceAlertEnabled),
        customPriceAlertTarget: formData.customPriceAlertTarget !== '' ? parseFloat(formData.customPriceAlertTarget) : 0,
        pivotType: formData.pivotType,
        tolerance: parseFloat(formData.tolerance),
        retriggerDistance: parseFloat(formData.retriggerDistance),
        telegramAlertsEnabled: formData.telegramAlertsEnabled,
        enabled: formData.enabled,
        tradingViewTicker: formData.tradingViewTicker,
        customChartUrl: formData.customChartUrl,
        chartTimeframe: String(formData.chartTimeframe),
        chartRange: String(formData.chartRange),
        barSpacing: parseInt(formData.barSpacing, 10) || 22
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
                  <div className="text-[10px] text-slate-400">Periodic auto-calculation & replacement</div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.autoCalculatePivot}
                  onChange={(e) => handleChange('autoCalculatePivot', e.target.checked)}
                  className="w-4 h-4 accent-gold-500 rounded cursor-pointer"
                />
              </div>

              {formData.autoCalculatePivot && (
                <div className="pt-2 border-t border-dark-800/80 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-300">Auto-Calc Interval</div>
                    <div className="text-[10px] text-slate-400">Recalculate & replace levels every</div>
                  </div>
                  <select
                    value={formData.autoCalcIntervalMinutes}
                    onChange={(e) => handleChange('autoCalcIntervalMinutes', parseInt(e.target.value, 10))}
                    className="px-2.5 py-1 rounded-lg bg-dark-900 border border-dark-700 text-xs font-semibold text-gold-400 focus:outline-none focus:border-gold-500 cursor-pointer"
                  >
                    <option value={15}>15 Minutes</option>
                    <option value={30}>30 Minutes</option>
                    <option value={60}>60 Minutes (1 Hour)</option>
                  </select>
                </div>
              )}
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

            {/* Custom Specific Target Price Alert */}
            <div className={`p-4 rounded-2xl border transition-all ${
              formData.customPriceAlertEnabled
                ? 'bg-amber-500/10 border-amber-500/40 shadow-lg shadow-amber-500/10'
                : 'bg-slate-950/70 border-slate-800'
            } space-y-3.5`}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <span>🎯</span> Custom Specific Price Alert
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {formData.customPriceAlertEnabled ? 'Alarm, notification & screenshot armed on touch' : 'Alert currently paused / disabled'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.customPriceAlertEnabled}
                    onChange={(e) => handleChange('customPriceAlertEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5.5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1.5">
                  Target Price ($ USD)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-amber-400 font-black text-sm font-mono">$</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 4410.00"
                    value={formData.customPriceAlertTarget}
                    onChange={(e) => handleChange('customPriceAlertTarget', e.target.value)}
                    className="w-full pl-8 pr-3 py-2.5 bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl text-sm font-mono font-black text-white focus:outline-none focus:ring-1 focus:ring-amber-400 transition-all tabular-nums"
                  />
                </div>
              </div>

              {/* Quick Adjustment Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-mono text-slate-400 font-bold">PRESETS:</span>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const res = await api.getTicker();
                      if (res.data?.data?.price) {
                        handleChange('customPriceAlertTarget', res.data.data.price.toFixed(2));
                      }
                    } catch (e) {}
                  }}
                  className="px-2 py-0.5 rounded-md bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-mono text-[10px] font-bold transition-all"
                >
                  ⚡ Live Price
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const base = parseFloat(formData.customPriceAlertTarget) || 0;
                    handleChange('customPriceAlertTarget', (base + 10).toFixed(2));
                  }}
                  className="px-2 py-0.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-emerald-400 font-mono text-[10px] font-bold transition-all"
                >
                  +10
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const base = parseFloat(formData.customPriceAlertTarget) || 0;
                    handleChange('customPriceAlertTarget', Math.max(0, base - 10).toFixed(2));
                  }}
                  className="px-2 py-0.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-rose-400 font-mono text-[10px] font-bold transition-all"
                >
                  -10
                </button>
              </div>
            </div>

            {/* Target Pivot Levels (R3, R2, S2, S3) */}
            <div className="p-3.5 rounded-xl bg-dark-950/70 border border-dark-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gold-400">
                  Target Price Levels (USD)
                </h4>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const tickerRes = await api.getTicker();
                      const tick = tickerRes.data?.data;
                      if (tick && tick.high24h && tick.low24h && tick.price) {
                        const h = tick.high24h;
                        const l = tick.low24h;
                        const c = tick.price;
                        const range = h - l;
                        const p = (h + l + c) / 3;

                        let r3, r2, s2, s3;
                        if (formData.pivotType === 'TRADITIONAL' || formData.pivotType === 'CLASSIC') {
                          r2 = p + range;
                          s2 = p - range;
                          r3 = h + 2 * (p - l);
                          s3 = l - 2 * (h - p);
                        } else if (formData.pivotType === 'CAMARILLA') {
                          r3 = c + range * 1.1 / 4;
                          r2 = c + range * 1.1 / 6;
                          s2 = c - range * 1.1 / 6;
                          s3 = c - range * 1.1 / 4;
                        } else {
                          r3 = p + 1.000 * range;
                          r2 = p + 0.618 * range;
                          s2 = p - 0.618 * range;
                          s3 = p - 1.000 * range;
                        }

                        setFormData(prev => ({
                          ...prev,
                          r3: parseFloat(r3.toFixed(2)),
                          r2: parseFloat(r2.toFixed(2)),
                          s2: parseFloat(s2.toFixed(2)),
                          s3: parseFloat(s3.toFixed(2))
                        }));
                      }
                    } catch (e) {
                      console.error('Auto calc failed', e);
                    }
                  }}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-xs font-bold text-amber-400 border border-amber-500/30 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Auto-Calc</span>
                </button>
              </div>

              {/* Pivot Formula Type Selector */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Pivot Calculation Formula
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'FIBONACCI', label: 'Fibonacci' },
                    { id: 'TRADITIONAL', label: 'Traditional' },
                    { id: 'CAMARILLA', label: 'Camarilla' }
                  ].map(pt => (
                    <button
                      key={pt.id}
                      type="button"
                      onClick={() => handleChange('pivotType', pt.id)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        formData.pivotType === pt.id
                          ? 'bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-500/20'
                          : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                      }`}
                    >
                      {pt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-amber-400 mb-1">
                    R3 Resistance
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.r3}
                    onChange={(e) => handleChange('r3', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-dark-900 border border-dark-800 text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-orange-400 mb-1">
                    R2 Resistance
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.r2}
                    onChange={(e) => handleChange('r2', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-dark-900 border border-dark-800 text-xs font-mono font-bold text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-emerald-400 mb-1">
                    S2 Support
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.s2}
                    onChange={(e) => handleChange('s2', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-dark-900 border border-dark-800 text-xs font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-teal-400 mb-1">
                    S3 Support
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.s3}
                    onChange={(e) => handleChange('s3', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-dark-900 border border-dark-800 text-xs font-mono font-bold text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
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
