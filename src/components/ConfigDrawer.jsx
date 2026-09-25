import React, { useState, useEffect } from 'react';
import { X, Save, RefreshCw, Sliders, CheckCircle2, Monitor, Layers, Send, Volume2, Play, Square, BellRing, Smartphone, ShieldCheck, LogIn, Bell, BellOff, User } from 'lucide-react';
import { api } from '../services/api';
import { authService } from '../services/auth';
import { audioAlert, ALERT_SOUND_OPTIONS } from '../utils/audioAlert';

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

export const ConfigDrawer = ({ config, activeSymbol = 'XAUUSD', isOpen, onClose, onSave, currentUser, onOpenAuthModal }) => {
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
  const [selectedSound, setSelectedSound] = useState(audioAlert.soundType);
  const [soundVolume, setSoundVolume] = useState(audioAlert.volume);
  const [soundEnabled, setSoundEnabled] = useState(audioAlert.enabled);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isUpdatingNotif, setIsUpdatingNotif] = useState(false);

  const handleTogglePushNotifications = async () => {
    if (!currentUser?.email) return;
    const currentEnabled = currentUser.notificationsEnabled !== false;
    const nextVal = !currentEnabled;
    setIsUpdatingNotif(true);
    try {
      await authService.updateNotifications(nextVal);
    } catch (err) {
      console.error('Failed to toggle notifications:', err);
    } finally {
      setIsUpdatingNotif(false);
    }
  };

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
    setSelectedSound(audioAlert.soundType);
    setSoundVolume(audioAlert.volume);
    setSoundEnabled(audioAlert.enabled);
  }, [config, activeSymbol]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTogglePreview = (soundId) => {
    if (isPreviewing) {
      audioAlert.stop();
      setIsPreviewing(false);
    } else {
      setIsPreviewing(true);
      audioAlert.playAlarm({ typeOverride: soundId, durationSeconds: 3 });
      setTimeout(() => {
        setIsPreviewing(false);
      }, 3200);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    // Save audio settings locally
    audioAlert.setSoundType(selectedSound);
    audioAlert.setVolume(soundVolume);
    audioAlert.setEnabled(soundEnabled);

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
            
            {/* Multi-Device Account & Notification Sync */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-amber-950/20 border border-amber-500/30 space-y-3.5 shadow-lg shadow-amber-500/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400 font-mono">
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  <span>Multi-Device Sync Account</span>
                </div>
                {currentUser && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                    {currentUser.activeDevicesCount ? `${currentUser.activeDevicesCount} Linked` : 'Synced'}
                  </span>
                )}
              </div>

              {currentUser ? (
                <div className="space-y-3">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-white truncate">
                        {currentUser.fullName || 'Trading Terminal Trader'}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono truncate">
                        {currentUser.email}
                      </div>
                    </div>
                    <div className="text-[10px] font-bold text-amber-400 font-mono bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                      WEB ID
                    </div>
                  </div>

                  {/* Push Notifications Toggle */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <div>
                      <div className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                        {currentUser.notificationsEnabled !== false ? (
                          <Bell className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <BellOff className="w-3.5 h-3.5 text-slate-500" />
                        )}
                        <span>Push Notifications & Alarms</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Syncs ON / OFF state with all mobile devices
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isUpdatingNotif}
                      onClick={handleTogglePushNotifications}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black font-mono transition-all cursor-pointer ${
                        currentUser.notificationsEnabled !== false
                          ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {isUpdatingNotif ? '...' : (currentUser.notificationsEnabled !== false ? 'ON' : 'OFF')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2.5">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Log in with the same email as your Android & iOS app so all price targets and notification settings stay synchronized.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onOpenAuthModal) onOpenAuthModal();
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black font-mono text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Sign In / Create Account (Sync)</span>
                  </button>
                </div>
              )}
            </div>

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

            {/* Simplified Alarm Sound Settings (3 Sounds, 1 Vibrate, 1 Device Sound) */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400">
                  <Volume2 className="w-4 h-4 text-amber-400" />
                  <span>Alarm Sound Settings</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={soundEnabled}
                    onChange={(e) => setSoundEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>

              {/* Sound Options List */}
              <div className="space-y-2">
                {ALERT_SOUND_OPTIONS.map((opt) => {
                  const isSelected = selectedSound === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setSelectedSound(opt.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500/50 text-white shadow-sm'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-amber-400 bg-amber-400' : 'border-slate-600'
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950"></div>}
                        </div>
                        <span className="text-xs font-mono font-bold">{opt.label}</span>
                      </div>

                      {opt.id !== 'VIBRATE_ONLY' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTogglePreview(opt.id);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition-colors"
                          title="Preview Alarm Sound"
                        >
                          {isPreviewing && selectedSound === opt.id ? (
                            <Square className="w-3.5 h-3.5 fill-amber-400" />
                          ) : (
                            <Play className="w-3.5 h-3.5 fill-amber-400" />
                          )}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Volume Slider */}
              <div className="pt-2 border-t border-slate-800">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-mono font-bold text-slate-300">
                    Alarm Volume
                  </label>
                  <span className="text-xs font-mono text-amber-400 font-bold">
                    {Math.round(soundVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={soundVolume}
                  onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
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
