import React, { useState, useEffect, useMemo } from 'react';
import { 
  Target, 
  Zap, 
  Trash2, 
  Check, 
  TrendingUp, 
  TrendingDown, 
  Sparkles,
  Sliders,
  ShieldCheck,
  Radio,
  AlertTriangle
} from 'lucide-react';
import { formatNumber } from '../utils/formatters';
import { api } from '../services/api';

export const CustomLevelCard = ({
  activeSymbol = 'XAUUSD',
  marketData,
  config,
  alertStates,
  pivotState,
  telegramAlertsEnabled = true,
  onToggleTelegram,
  onConfigUpdated,
  onAlertGenerated
}) => {
  const currentPrice = marketData?.price ? Number(marketData.price) : null;
  const isEnabled = Boolean(config?.customPriceAlertEnabled);
  const savedTarget = config?.customPriceAlertTarget ? Number(config.customPriceAlertTarget) : 0;
  const statusStr = config?.customPriceAlertStatus || (isEnabled && savedTarget > 0 ? 'ACTIVE' : 'INACTIVE');

  const [inputPrice, setInputPrice] = useState(savedTarget > 0 ? savedTarget.toString() : '');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Synchronize when external config changes from other devices or DB load
  useEffect(() => {
    if (savedTarget > 0) {
      setInputPrice(savedTarget.toString());
    } else {
      setInputPrice('');
    }
  }, [savedTarget, activeSymbol]);

  // Determine alert status
  const isTriggered = statusStr === 'TRIGGERED';
  const isActive = isEnabled && savedTarget > 0 && statusStr === 'ACTIVE';
  const isInactive = !isEnabled || savedTarget <= 0 || statusStr === 'INACTIVE';

  // Target price numeric
  const targetNum = parseFloat(inputPrice) || savedTarget;

  // Real-time distance calculation
  const distanceInfo = useMemo(() => {
    if (!currentPrice || !targetNum || targetNum <= 0) return null;
    const diff = currentPrice - targetNum;
    const absDiff = Math.abs(diff);
    const pct = (absDiff / currentPrice) * 100;
    const tolerance = Number(config?.tolerance || 0.20);
    const isWithinTolerance = absDiff <= tolerance;
    const isAbove = diff > 0;

    return {
      absDiff,
      diff,
      pct,
      isWithinTolerance,
      isAbove
    };
  }, [currentPrice, targetNum, config?.tolerance]);

  // Handle Set / Update Alert (Persists in Online Database & Broadcasts to all devices)
  const handleSetAlert = async () => {
    const targetPriceVal = parseFloat(inputPrice);

    if (isNaN(targetPriceVal) || targetPriceVal <= 0) {
      alert('Please enter a valid target price greater than 0.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await api.setCustomPriceAlert({
        symbol: activeSymbol,
        targetPrice: targetPriceVal,
        enabled: true
      });

      if (res.data?.data) {
        if (onConfigUpdated) {
          onConfigUpdated({
            customPriceAlertEnabled: true,
            customPriceAlertTarget: targetPriceVal,
            customPriceAlertStatus: 'ACTIVE'
          });
        }
        setFeedbackMsg('🎯 Alert Armed & Synced to All Devices!');
        setTimeout(() => setFeedbackMsg(''), 3000);
      }
    } catch (err) {
      alert('Failed to set custom price alert: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Delete Alert (Removes from Online Database, Removes White Line, Broadcasts to all devices)
  const handleDeleteAlert = async () => {
    setIsDeleting(true);
    try {
      const res = await api.deleteCustomPriceAlert(activeSymbol);
      if (res.data?.success) {
        setInputPrice('');
        if (onConfigUpdated) {
          onConfigUpdated({
            customPriceAlertEnabled: false,
            customPriceAlertTarget: 0,
            customPriceAlertStatus: 'INACTIVE'
          });
        }
        setFeedbackMsg('🗑️ Alert Deleted & Removed from All Devices');
        setTimeout(() => setFeedbackMsg(''), 3000);
      }
    } catch (err) {
      alert('Failed to delete custom alert: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsDeleting(false);
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

  // Test custom alert trigger
  const handleTestTrigger = async () => {
    const testPrice = parseFloat(inputPrice) || currentPrice || 3450.50;
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
    <div className={`rounded-3xl glass-panel p-6 shadow-2xl relative overflow-hidden transition-all duration-300 border-2 ${
      isTriggered
        ? 'border-rose-500/80 bg-gradient-to-b from-rose-950/40 to-slate-950/80 shadow-rose-500/10'
        : isActive
        ? 'border-emerald-500/60 bg-gradient-to-b from-emerald-950/20 to-slate-950/80 shadow-emerald-500/10'
        : 'border-slate-800 bg-slate-950/70'
    }`}>
      {/* Glow Ambient Highlights */}
      <div className={`absolute -top-24 -right-24 w-56 h-56 rounded-full blur-3xl pointer-events-none transition-all duration-500 ${
        isTriggered ? 'bg-rose-500/20' : isActive ? 'bg-emerald-500/15' : 'bg-slate-500/5'
      }`} />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-all ${
            isTriggered
              ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-lg shadow-rose-500/20'
              : isActive
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-lg shadow-emerald-500/20'
              : 'bg-slate-800/80 text-slate-400 border-slate-700'
          }`}>
            <Target className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white uppercase tracking-wider">
                Custom Price Alert System
              </h3>
              <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[10px] font-mono font-bold text-slate-300">
                {activeSymbol}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Online shared database alert · Synchronized across all devices in real-time
            </p>
          </div>
        </div>

        {/* Status Indicator Badge */}
        <div className="flex items-center gap-2">
          {isTriggered ? (
            <span className="px-3.5 py-1.5 rounded-xl bg-rose-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-rose-500/30 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
              TARGET TOUCHED
            </span>
          ) : isActive ? (
            <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              ACTIVE & MONITORING
            </span>
          ) : (
            <span className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-400 border border-slate-700 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-500"></span>
              STANDBY / OFF
            </span>
          )}
        </div>
      </div>

      {/* Main Input & Control Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* Left Side: Price Input & Presets */}
        <div className="lg:col-span-7 space-y-4">
          <div>
            <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
              Custom Target Price ($ USD)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-emerald-400 font-black text-xl font-mono">
                $
              </span>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 3450.50"
                value={inputPrice}
                onChange={(e) => setInputPrice(e.target.value)}
                className="w-full pl-9 pr-4 py-3.5 bg-slate-900/90 border border-slate-700/80 focus:border-emerald-400 rounded-2xl text-2xl font-mono font-black text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/30 transition-all tabular-nums shadow-inner"
              />
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-400 mr-1 flex items-center gap-1">
              <Sliders className="w-3 h-3" /> Quick:
            </span>
            <button
              type="button"
              onClick={handleSetCurrentPrice}
              className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold transition-all active:scale-95 flex items-center gap-1"
            >
              <Zap className="w-3.5 h-3.5" /> ⚡ Live Price
            </button>
            <button
              type="button"
              onClick={() => handleAdjustPrice(5)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-emerald-400 font-mono text-xs font-bold transition-all active:scale-95"
            >
              +5
            </button>
            <button
              type="button"
              onClick={() => handleAdjustPrice(10)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-emerald-400 font-mono text-xs font-bold transition-all active:scale-95"
            >
              +10
            </button>
            <button
              type="button"
              onClick={() => handleAdjustPrice(25)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-emerald-400 font-mono text-xs font-bold transition-all active:scale-95"
            >
              +25
            </button>
            <button
              type="button"
              onClick={() => handleAdjustPrice(-5)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-rose-400 font-mono text-xs font-bold transition-all active:scale-95"
            >
              -5
            </button>
            <button
              type="button"
              onClick={() => handleAdjustPrice(-10)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-rose-400 font-mono text-xs font-bold transition-all active:scale-95"
            >
              -10
            </button>
            <button
              type="button"
              onClick={() => handleAdjustPrice(-25)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-rose-400 font-mono text-xs font-bold transition-all active:scale-95"
            >
              -25
            </button>
          </div>
        </div>

        {/* Right Side: Real-Time Distance & Direction Box */}
        <div className="lg:col-span-5 flex flex-col justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>LIVE DISTANCE METER:</span>
              <span className="font-bold text-white">
                Spot: ${currentPrice ? currentPrice.toFixed(2) : '---'}
              </span>
            </div>

            {distanceInfo ? (
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black font-mono text-white tabular-nums">
                    ${distanceInfo.absDiff.toFixed(2)}
                  </span>
                  <span className="text-xs font-bold font-mono text-emerald-400">
                    ({distanceInfo.pct.toFixed(2)}% away)
                  </span>
                </div>

                {/* Direction Tag */}
                <div className="flex items-center gap-2 text-xs font-mono font-bold">
                  {distanceInfo.isWithinTolerance ? (
                    <span className="text-rose-400 flex items-center gap-1">
                      <Radio className="w-3.5 h-3.5 animate-pulse" /> At Target Level!
                    </span>
                  ) : distanceInfo.isAbove ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" /> Market is Above Target
                    </span>
                  ) : (
                    <span className="text-rose-400 flex items-center gap-1">
                      <TrendingDown className="w-3.5 h-3.5" /> Market is Below Target
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-3 text-xs font-mono text-slate-500 italic">
                Enter target price above to calculate live distance meter...
              </div>
            )}
          </div>

          {/* Chart Indicator Notice & Telegram Toggle */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 text-[11px] font-mono text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-white border border-slate-300 inline-block shadow-sm"></span>
              <span>Displays as <strong>WHITE line</strong></span>
            </div>

            {/* Direct Telegram Switch */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-mono">Telegram Alerts:</span>
              <button
                type="button"
                onClick={onToggleTelegram}
                className={`px-2.5 py-0.5 rounded-lg border text-[10px] font-mono font-bold transition-all cursor-pointer ${
                  telegramAlertsEnabled
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                    : 'bg-slate-950 text-slate-500 border-slate-800'
                }`}
              >
                {telegramAlertsEnabled ? '✈️ ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Action Buttons Row */}
      <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3">
          {/* SET / UPDATE ALERT BUTTON */}
          <button
            type="button"
            onClick={handleSetAlert}
            disabled={isSaving || !inputPrice}
            className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-lg ${
              isActive
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
            }`}
          >
            {isSaving ? (
              <>
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                <span>Saving to Online DB...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>{isActive ? 'UPDATE ALERT' : 'SET ALERT'}</span>
              </>
            )}
          </button>

          {/* DELETE ALERT BUTTON */}
          {savedTarget > 0 && (
            <button
              type="button"
              onClick={handleDeleteAlert}
              disabled={isDeleting}
              className="px-5 py-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-400 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isDeleting ? (
                <span>Deleting...</span>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  <span>DELETE ALERT</span>
                </>
              )}
            </button>
          )}

          {/* Feedback Message */}
          {feedbackMsg && (
            <span className="text-xs font-bold font-mono text-emerald-400 animate-fade-in">
              {feedbackMsg}
            </span>
          )}
        </div>

        {/* TEST ALERT BUTTON */}
        <button
          type="button"
          onClick={handleTestTrigger}
          disabled={isTesting}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{isTesting ? 'Testing...' : 'TEST ALERT'}</span>
        </button>
      </div>

    </div>
  );
};
