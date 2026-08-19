import React, { useState } from 'react';
import { X, Play, Send, CheckCircle2, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { getLevelColor } from '../utils/formatters';

export const TestConsoleModal = ({ config, onClose, onAlertGenerated }) => {
  const [selectedLevel, setSelectedLevel] = useState('R2');
  const [customPrice, setCustomPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTestingTelegram, setIsTestingTelegram] = useState(false);
  const [responseLog, setResponseLog] = useState(null);

  const levels = ['R3', 'R2', 'S2', 'S3'];

  const handleRunTest = async () => {
    setIsSubmitting(true);
    setResponseLog(null);
    try {
      const price = customPrice ? parseFloat(customPrice) : undefined;
      const res = await api.triggerTestAlert(selectedLevel, price);
      setResponseLog({
        type: 'success',
        message: `Alert pipeline triggered for ${selectedLevel}!`,
        data: res.data?.data
      });
      if (onAlertGenerated && res.data?.data) {
        onAlertGenerated(res.data.data);
      }
    } catch (err) {
      setResponseLog({
        type: 'error',
        message: err.response?.data?.error || err.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestTelegramBot = async () => {
    setIsTestingTelegram(true);
    try {
      const res = await api.testTelegram();
      setResponseLog({
        type: 'success',
        message: 'Telegram test message delivered successfully to chat -5428923029!'
      });
    } catch (err) {
      setResponseLog({
        type: 'error',
        message: 'Telegram test failed: ' + (err.response?.data?.error || err.message)
      });
    } finally {
      setIsTestingTelegram(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-2xl bg-dark-900 border border-dark-700 shadow-2xl p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-dark-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gold-500/10 text-gold-400 border border-gold-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Alert Engine Test Console
              </h3>
              <p className="text-xs text-slate-400">
                Trigger full pipeline (Chart → Screenshot → Telegram → DB)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-slate-400 hover:text-white border border-dark-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="py-5 space-y-5">
          
          {/* Level Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Select Test Alert Level
            </label>
            <div className="grid grid-cols-4 gap-2">
              {levels.map(lvl => {
                const styling = getLevelColor(lvl);
                const isSelected = selectedLevel === lvl;
                const price = config?.[lvl.toLowerCase()] || 0;

                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => {
                      setSelectedLevel(lvl);
                      setCustomPrice(price ? price.toString() : '');
                    }}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-0.5 ${
                      isSelected
                        ? 'bg-gold-500 text-black border-gold-400 shadow-lg shadow-gold-500/20'
                        : 'bg-dark-950/70 border-dark-800 text-slate-300 hover:border-dark-700'
                    }`}
                  >
                    <span>{lvl}</span>
                    <span className={`text-[10px] font-mono ${isSelected ? 'text-black/80 font-bold' : 'text-slate-400'}`}>
                      ${price.toFixed(2)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Simulated Price Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Simulated Touch Price (USD)
            </label>
            <input
              type="number"
              step="0.01"
              value={customPrice}
              onChange={(e) => setCustomPrice(e.target.value)}
              placeholder={`Default: $${config?.[selectedLevel.toLowerCase()]?.toFixed(2) || '4442.30'}`}
              className="w-full px-3.5 py-2.5 rounded-xl bg-dark-950 border border-dark-800 text-slate-100 font-mono text-sm focus:outline-none focus:border-gold-500 transition-colors"
            />
          </div>

          {/* Action Trigger Button */}
          <button
            type="button"
            onClick={handleRunTest}
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-black font-extrabold text-sm shadow-lg shadow-gold-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Running Alert Pipeline...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Trigger {selectedLevel} Alert Pipeline</span>
              </>
            )}
          </button>

          {/* Telegram Ping Button */}
          <div className="pt-3 border-t border-dark-800 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Verify Telegram Bot connection:</span>
            <button
              type="button"
              onClick={handleTestTelegramBot}
              disabled={isTestingTelegram}
              className="px-3 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-sky-400 font-mono text-xs border border-dark-700 flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {isTestingTelegram ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
              <span>Ping Bot</span>
            </button>
          </div>

          {/* Result Feedback Banner */}
          {responseLog && (
            <div className={`p-3 rounded-xl border text-xs font-mono ${
              responseLog.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}>
              <div className="flex items-center gap-2 font-bold mb-1">
                {responseLog.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{responseLog.message}</span>
              </div>
              {responseLog.data && (
                <div className="text-[10px] text-slate-400 mt-1 pl-6">
                  Event ID: {responseLog.data._id} · Screenshot: {responseLog.data.screenshotPath}
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
