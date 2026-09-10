import React, { useState, useEffect, useMemo } from 'react';
import { 
  Target, 
  Plus, 
  Trash2, 
  Check, 
  TrendingUp, 
  TrendingDown, 
  Sparkles,
  Sliders,
  ShieldCheck,
  Radio,
  AlertTriangle,
  Bell,
  BellRing,
  Volume2,
  VolumeX,
  Clock,
  Layers,
  Zap,
  Info
} from 'lucide-react';
import { formatNumber } from '../utils/formatters';
import { api } from '../services/api';

export const CustomLevelCard = ({
  activeSymbol = 'XAUUSD',
  marketData,
  activeAlerts = [],
  onAlertsChanged,
  telegramAlertsEnabled = true,
  onToggleTelegram,
  onAlertGenerated,
  isSoundEnabled = true,
  onToggleSound
}) => {
  const currentPrice = marketData?.price ? Number(marketData.price) : null;

  const [inputPrice, setInputPrice] = useState('');
  const [condition, setCondition] = useState('ANY');
  const [note, setNote] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isClearingAll, setIsClearingAll] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [hasNotifPermission, setHasNotifPermission] = useState(
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  );

  // Request browser notification permission
  const handleRequestNotifPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setHasNotifPermission(perm === 'granted');
        if (perm === 'granted') {
          new Notification('🔔 Price Alerts Active', {
            body: 'Desktop notifications enabled for market price touch alerts!',
            icon: '/favicon.ico'
          });
        }
      } catch (e) {}
    }
  };

  // Add new price alert
  const handleAddAlert = async (e) => {
    if (e) e.preventDefault();
    const targetPriceVal = parseFloat(inputPrice);

    if (isNaN(targetPriceVal) || targetPriceVal <= 0) {
      alert('Please enter a valid target price greater than 0.');
      return;
    }

    setIsAdding(true);
    try {
      const res = await api.createAlert({
        symbol: activeSymbol,
        targetPrice: targetPriceVal,
        condition,
        note: note.trim(),
        createdBy: 'WEB'
      });

      if (res.data?.data) {
        setInputPrice('');
        setNote('');
        if (onAlertsChanged) {
          onAlertsChanged();
        }
        setFeedbackMsg(`🎯 Target $${targetPriceVal.toFixed(2)} Armed & Synced!`);
        setTimeout(() => setFeedbackMsg(''), 3000);
      }
    } catch (err) {
      alert('Failed to add custom price alert: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsAdding(false);
    }
  };

  // Delete specific alert by ID
  const handleDeleteAlert = async (alertId) => {
    setDeletingId(alertId);
    try {
      await api.deleteAlertById(alertId, activeSymbol);
      if (onAlertsChanged) {
        onAlertsChanged();
      }
      setFeedbackMsg('🗑️ Alert Removed');
      setTimeout(() => setFeedbackMsg(''), 2500);
    } catch (err) {
      alert('Failed to delete alert: ' + (err.response?.data?.error || err.message));
    } finally {
      setDeletingId(null);
    }
  };

  // Clear all alerts for symbol
  const handleClearAll = async () => {
    if (!window.confirm(`Are you sure you want to clear all ${activeAlerts.length} alerts for ${activeSymbol}?`)) {
      return;
    }
    setIsClearingAll(true);
    try {
      await api.clearAllAlerts(activeSymbol);
      if (onAlertsChanged) {
        onAlertsChanged();
      }
      setFeedbackMsg(`🗑️ All alerts cleared for ${activeSymbol}`);
      setTimeout(() => setFeedbackMsg(''), 3000);
    } catch (err) {
      alert('Failed to clear alerts: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsClearingAll(false);
    }
  };

  // Quick preset actions
  const handleSetCurrentPrice = () => {
    if (currentPrice) {
      setInputPrice(currentPrice.toFixed(2));
    }
  };

  const handleAdjustPrice = (delta) => {
    const base = parseFloat(inputPrice) || currentPrice || 0;
    const newPrice = Math.max(0, base + delta);
    setInputPrice(newPrice.toFixed(2));
  };

  const handleAdjustPercent = (pctDelta) => {
    const base = parseFloat(inputPrice) || currentPrice || 0;
    const newPrice = Math.max(0, base * (1 + pctDelta / 100));
    setInputPrice(newPrice.toFixed(2));
  };

  // Test custom alert trigger
  const handleTestTrigger = async () => {
    const testPrice = parseFloat(inputPrice) || (activeAlerts.length > 0 ? activeAlerts[0].targetPrice : (currentPrice || 3450.50));
    setIsTesting(true);
    try {
      const res = await api.triggerTestAlert('CUSTOM', testPrice);
      if (res.data?.data && onAlertGenerated) {
        onAlertGenerated(res.data.data);
      }
    } catch (err) {
      alert('Failed to trigger test alert: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="rounded-3xl glass-panel p-6 shadow-2xl relative overflow-hidden transition-all duration-300 border-2 border-slate-800 bg-slate-950/80 flex flex-col h-full">
      {/* Glow Ambient Highlights */}
      <div className="absolute -top-24 -right-24 w-56 h-56 rounded-full blur-3xl pointer-events-none bg-amber-500/10" />
      <div className="absolute -bottom-24 -left-24 w-56 h-56 rounded-full blur-3xl pointer-events-none bg-emerald-500/10" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center border bg-amber-500/15 text-amber-400 border-amber-500/30 shadow-lg shadow-amber-500/10">
            <Target className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white uppercase tracking-wider">
                Multi-Alert Engine
              </h3>
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-[10px] font-mono font-bold text-amber-300">
                {activeSymbol}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-mono font-bold text-emerald-400">
                {activeAlerts.length} ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Auto-removes on price touch · Firebase Push & Telegram sync
            </p>
          </div>
        </div>

        {/* Action Badges / Controls */}
        <div className="flex items-center gap-2">
          {/* Web Push Notification Toggle */}
          <button
            onClick={handleRequestNotifPermission}
            title={hasNotifPermission ? 'Web Notifications Active' : 'Enable Web Notifications'}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              hasNotifPermission
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            {hasNotifPermission ? <BellRing className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
            <span>{hasNotifPermission ? 'Push On' : 'Enable Push'}</span>
          </button>

          {/* Sound Alarm Toggle */}
          {onToggleSound && (
            <button
              onClick={onToggleSound}
              title={isSoundEnabled ? 'Alarm Sound Enabled' : 'Alarm Sound Muted'}
              className={`p-1.5 rounded-xl border transition-all ${
                isSoundEnabled
                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/25'
                  : 'bg-slate-800 text-slate-500 border-slate-700'
              }`}
            >
              {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          )}

          {/* Clear All Button (when alerts exist) */}
          {activeAlerts.length > 0 && (
            <button
              onClick={handleClearAll}
              disabled={isClearingAll}
              className="px-2.5 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-semibold transition-all"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Feedback Toast Banner */}
      {feedbackMsg && (
        <div className="mb-4 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Create Alert Form Section */}
      <form onSubmit={handleAddAlert} className="space-y-4 mb-6 relative z-10 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Target Price Input */}
          <div className="flex-1 relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-base font-bold text-slate-400">
              $
            </span>
            <input
              type="number"
              step="any"
              placeholder={currentPrice ? currentPrice.toFixed(2) : "0.00"}
              value={inputPrice}
              onChange={(e) => setInputPrice(e.target.value)}
              className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-950/90 border border-slate-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-white font-mono text-base font-black tracking-wide tabular-nums outline-none transition-all placeholder:text-slate-600"
            />
          </div>

          {/* Condition Selector */}
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-slate-950/90 border border-slate-700 text-xs font-bold text-slate-200 focus:border-amber-400 outline-none"
          >
            <option value="ANY">⚡ Touch / Cross Any</option>
            <option value="CROSS_UP">↑ Cross Above</option>
            <option value="CROSS_DOWN">↓ Cross Below</option>
          </select>

          {/* Add Alert Submit Button */}
          <button
            type="submit"
            disabled={isAdding || !inputPrice}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{isAdding ? 'Adding...' : 'Add Alert'}</span>
          </button>
        </div>

        {/* Quick Helper Presets */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-1">Quick:</span>
          {currentPrice && (
            <button
              type="button"
              onClick={handleSetCurrentPrice}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-mono font-bold text-slate-300 border border-slate-700 transition-all"
            >
              Live (${currentPrice.toFixed(2)})
            </button>
          )}
          <button
            type="button"
            onClick={() => handleAdjustPrice(5)}
            className="px-2 py-1 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 text-[11px] font-mono font-bold text-emerald-400 border border-emerald-800/40 transition-all"
          >
            +$5
          </button>
          <button
            type="button"
            onClick={() => handleAdjustPrice(-5)}
            className="px-2 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-[11px] font-mono font-bold text-rose-400 border border-rose-800/40 transition-all"
          >
            -$5
          </button>
          <button
            type="button"
            onClick={() => handleAdjustPercent(0.5)}
            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-mono font-bold text-slate-300 border border-slate-700 transition-all"
          >
            +0.5%
          </button>
          <button
            type="button"
            onClick={() => handleAdjustPercent(-0.5)}
            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-mono font-bold text-slate-300 border border-slate-700 transition-all"
          >
            -0.5%
          </button>
          <button
            type="button"
            onClick={() => setInputPrice('')}
            className="px-2 py-1 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-[11px] font-mono text-slate-400 border border-slate-800 transition-all ml-auto"
          >
            Clear
          </button>
        </div>

        {/* Optional Label / Note */}
        <div className="pt-1">
          <input
            type="text"
            placeholder="Optional alert label / note (e.g. Take Profit 1, Breakout Entry)..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800 focus:border-slate-700 text-xs text-slate-300 placeholder:text-slate-600 outline-none"
          />
        </div>
      </form>

      {/* Active Alerts List Section */}
      <div className="flex-1 flex flex-col min-h-0 relative z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            Active Target Levels ({activeAlerts.length})
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            Auto-disappears on touch
          </span>
        </div>

        {activeAlerts.length === 0 ? (
          <div className="flex-1 min-h-[140px] flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-900/30 border border-dashed border-slate-800 text-center">
            <div className="w-10 h-10 rounded-full bg-slate-800/60 flex items-center justify-center text-slate-500 mb-2">
              <Target className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-400 mb-1">No Active Price Alerts</p>
            <p className="text-[11px] text-slate-600 max-w-xs">
              Enter target prices above to create multiple real-time alerts. When price touches, the alert fires and auto-removes.
            </p>
          </div>
        ) : (
          <div className="space-y-2 overflow-y-auto max-h-[260px] pr-1 scrollbar-thin scrollbar-thumb-slate-800">
            {activeAlerts.map((alertItem) => {
              const target = Number(alertItem.targetPrice);
              const diff = currentPrice ? currentPrice - target : 0;
              const absDiff = Math.abs(diff);
              const pct = currentPrice ? (absDiff / currentPrice) * 100 : 0;
              const isAbove = diff > 0;
              const isDeleting = deletingId === alertItem._id || deletingId === alertItem.id;

              return (
                <div
                  key={alertItem._id || alertItem.id || target}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border font-mono font-bold text-xs ${
                      isAbove
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                      {isAbove ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-black text-white tabular-nums tracking-wide">
                          ${target.toFixed(2)}
                        </span>
                        {alertItem.condition && alertItem.condition !== 'ANY' && (
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-bold text-slate-400 font-mono">
                            {alertItem.condition === 'CROSS_UP' ? 'Cross ↑' : 'Cross ↓'}
                          </span>
                        )}
                        {alertItem.note && (
                          <span className="text-[11px] text-slate-400 truncate max-w-[120px]" title={alertItem.note}>
                            · {alertItem.note}
                          </span>
                        )}
                      </div>

                      {currentPrice && (
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[11px] font-mono font-bold ${
                            isAbove ? 'text-rose-400' : 'text-emerald-400'
                          }`}>
                            {isAbove ? `-$${absDiff.toFixed(2)}` : `+$${absDiff.toFixed(2)}`} ({pct.toFixed(2)}%)
                          </span>
                          <span className="text-[10px] text-slate-600">
                            {isAbove ? 'below live price' : 'above live price'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteAlert(alertItem._id || alertItem.id)}
                    disabled={isDeleting}
                    title="Remove this alert"
                    className="p-2 rounded-lg bg-slate-800/60 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700/60 hover:border-rose-500/40 transition-all opacity-80 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Simulation & Test Console Trigger */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500 relative z-10">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Central Server Touch Engine</span>
        </div>

        <button
          type="button"
          onClick={handleTestTrigger}
          disabled={isTesting}
          className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-bold flex items-center gap-1.5 transition-all"
        >
          <Zap className="w-3 h-3 text-amber-400" />
          <span>{isTesting ? 'Testing...' : 'Simulate Test Touch'}</span>
        </button>
      </div>
    </div>
  );
};

export default CustomLevelCard;
