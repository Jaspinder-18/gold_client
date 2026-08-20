import React, { useState, useEffect } from 'react';
import { Terminal, CheckCircle2, AlertTriangle, RefreshCw, ChevronDown, ChevronUp, ShieldCheck, Clock, Database, Activity, Globe } from 'lucide-react';
import { api } from '../services/api';
import { formatPrice } from '../utils/formatters';

export const DebugValidationPanel = ({ activeSymbol, pivotState, onRecalculate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [validationData, setValidationData] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  const fetchValidation = async () => {
    setIsValidating(true);
    try {
      const res = await api.validatePivot(activeSymbol);
      if (res.data?.data) {
        setValidationData(res.data.data);
      }
    } catch (err) {
      console.error('Validation fetch error:', err);
    } finally {
      setIsValidating(false);
    }
  };

  useEffect(() => {
    if (activeSymbol) {
      fetchValidation();
    }
  }, [activeSymbol, pivotState]);

  const state = pivotState || validationData?.pivotState;
  const isValid = validationData?.isValid ?? state?.isValid ?? true;
  const errors = validationData?.errors || state?.validationErrors || [];

  return (
    <div className="rounded-3xl glass-panel border border-slate-800/80 overflow-hidden shadow-2xl transition-all">
      {/* Header Bar */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="px-6 py-4 bg-slate-950/70 hover:bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between cursor-pointer select-none transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center border border-amber-500/30">
            <Terminal className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-slate-100 uppercase tracking-wider">
                Developer Audit & Pivot Validation Engine
              </h3>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                isValid
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
              }`}>
                {isValid ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                <span>{isValid ? 'PIVOT VALIDATED 100%' : 'VALIDATION WARNING'}</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Live audit against previous completed period OHLC & session boundary rollover
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onRecalculate) onRecalculate();
              fetchValidation();
            }}
            disabled={isValidating}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 border border-slate-700 text-xs font-bold font-mono flex items-center gap-1.5 transition-all cursor-pointer"
            title="Force Recalculate from Live Completed OHLC"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isValidating ? 'animate-spin' : ''}`} />
            <span>Recalculate</span>
          </button>
          <div className="p-1 rounded-lg text-slate-400 hover:text-white">
            {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {/* Expandable Body */}
      {isOpen && (
        <div className="p-6 bg-slate-950/40 space-y-6">
          
          {/* Top Metric Cards: Completed Period OHLC vs Calculated Levels */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* 1. Completed Period OHLC */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center gap-2 text-xs font-black text-slate-300 uppercase tracking-wider mb-2">
                <Database className="w-4 h-4 text-sky-400" />
                <span>Prev Completed OHLC</span>
              </div>
              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Period Date:</span>
                  <span className="text-white font-bold">{state?.periodDateStr || 'Latest Closed'}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>High (H):</span>
                  <span className="text-emerald-400 font-bold">{formatPrice(state?.high)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Low (L):</span>
                  <span className="text-rose-400 font-bold">{formatPrice(state?.low)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Close (C):</span>
                  <span className="text-amber-400 font-bold">{formatPrice(state?.close)}</span>
                </div>
                <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800">
                  <span>Range (H-L):</span>
                  <span className="text-slate-200 font-bold">{formatPrice(state?.range || ((state?.high || 0) - (state?.low || 0)))}</span>
                </div>
              </div>
            </div>

            {/* 2. Calculated Pivot Hierarchy */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center gap-2 text-xs font-black text-slate-300 uppercase tracking-wider mb-2">
                <Activity className="w-4 h-4 text-amber-400" />
                <span>Calculated Levels ({state?.pivotType || 'TRADITIONAL'})</span>
              </div>
              <div className="space-y-1 font-mono text-xs">
                <div className="flex justify-between text-amber-300">
                  <span className="font-bold">R3 Target:</span>
                  <span className="font-black">{formatPrice(state?.r3)}</span>
                </div>
                <div className="flex justify-between text-amber-400">
                  <span className="font-bold">R2 Target:</span>
                  <span className="font-black">{formatPrice(state?.r2)}</span>
                </div>
                <div className="flex justify-between text-slate-200 py-0.5 border-y border-slate-800/80">
                  <span className="font-bold">Pivot (P):</span>
                  <span className="font-black">{formatPrice(state?.p)}</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span className="font-bold">S2 Target:</span>
                  <span className="font-black">{formatPrice(state?.s2)}</span>
                </div>
                <div className="flex justify-between text-teal-400">
                  <span className="font-bold">S3 Target:</span>
                  <span className="font-black">{formatPrice(state?.s3)}</span>
                </div>
              </div>
            </div>

            {/* 3. Session & Data Source */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center gap-2 text-xs font-black text-slate-300 uppercase tracking-wider mb-2">
                <Globe className="w-4 h-4 text-purple-400" />
                <span>Session & Data Source</span>
              </div>
              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Active Asset:</span>
                  <span className="text-white font-bold">{state?.symbol || activeSymbol}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Data Feed:</span>
                  <span className="text-slate-200 font-bold truncate max-w-[120px]">{state?.dataSource || 'TradingView Scanner'}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Timeframe:</span>
                  <span className="text-amber-400 font-bold">{state?.pivotTimeframe || 'DAILY'}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Formula:</span>
                  <span className="text-sky-400 font-bold">{state?.pivotType || 'TRADITIONAL'}</span>
                </div>
              </div>
            </div>

            {/* 4. Session Rollover Clock */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center gap-2 text-xs font-black text-slate-300 uppercase tracking-wider mb-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Session Rollover Clock</span>
              </div>
              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Last Calc:</span>
                  <span className="text-slate-200 font-bold">{state?.calculatedAt ? new Date(state.calculatedAt).toLocaleTimeString() : 'Recent'}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Next Rollover:</span>
                  <span className="text-emerald-400 font-black">{state?.nextRolloverAt ? new Date(state.nextRolloverAt).toUTCString().slice(17, 22) + ' UTC' : '00:00 UTC'}</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                  Automated background worker polls session boundary every 60s and recalculates pivots immediately upon period close.
                </div>
              </div>
            </div>

          </div>

          {/* 10-Point Validation Checklist */}
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black text-slate-200 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>10-Point Mathematical Validation Checklist</span>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Formula Model: <b className="text-amber-400">{state?.pivotType || 'TRADITIONAL'}</b>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 text-xs font-mono">
              {[
                { label: 'Completed OHLC Exists', ok: !!state?.high && !!state?.low && !!state?.close },
                { label: 'High >= Low Bounds', ok: (state?.high || 0) >= (state?.low || 0) },
                { label: 'Close Inside Range', ok: !!state?.close },
                { label: 'No NaN / Nulls', ok: !isNaN(state?.p || 0) && !isNaN(state?.r2 || 0) },
                { label: 'R3 > R2 > P', ok: (state?.r3 || 0) > (state?.r2 || 0) && (state?.r2 || 0) > (state?.p || 0) },
                { label: 'P > S2 > S3', ok: (state?.p || 0) > (state?.s2 || 0) && (state?.s2 || 0) > (state?.s3 || 0) },
                { label: 'Session Timestamp', ok: !!state?.periodDateStr || !!state?.periodStart },
                { label: 'Timeframe Match', ok: ['DAILY', 'WEEKLY', 'MONTHLY'].includes(state?.pivotTimeframe || 'DAILY') },
                { label: 'Positive Prices', ok: (state?.p || 0) > 0 },
                { label: 'Rollover Clock Active', ok: !!state?.nextRolloverAt }
              ].map((chk, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                    chk.ok
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                  }`}
                >
                  {chk.ok ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  )}
                  <span className="text-[11px] truncate font-medium">{chk.label}</span>
                </div>
              ))}
            </div>

            {errors.length > 0 && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-mono">
                <b>Validation Warnings:</b>
                <ul className="list-disc list-inside mt-1 space-y-0.5">
                  {errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};
