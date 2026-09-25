import React, { useState, useEffect, useCallback } from 'react';
import { 
  Smartphone, 
  Laptop, 
  Globe, 
  Trash2, 
  RefreshCw, 
  Copy, 
  Check, 
  ShieldCheck, 
  AlertTriangle, 
  LogIn, 
  Bell, 
  BellOff, 
  Send, 
  ExternalLink,
  Info
} from 'lucide-react';
import { authService } from '../services/auth';
import { api } from '../services/api';

export const DevicesTab = ({ 
  currentUser, 
  onOpenAuthModal, 
  onBackToTerminal 
}) => {
  const [devices, setDevices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [copiedToken, setCopiedToken] = useState(null);
  const [deletingToken, setDeletingToken] = useState(null);
  const [testingToken, setTestingToken] = useState(null);

  const fetchDevices = useCallback(async () => {
    if (!currentUser || !currentUser.email) {
      setDevices([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await authService.getDevices();
      if (res.success) {
        setDevices(res.devices || []);
      } else {
        setErrorMessage(res.error || 'Failed to load registered devices.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error communicating with authentication server.');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  // Copy FCM token to clipboard
  const handleCopy = (token) => {
    if (!token) return;
    navigator.clipboard.writeText(token);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  // Remove / Unlink device
  const handleRemoveDevice = async (device) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to remove this device (${device.deviceName || 'Device'})?\n\nIt will immediately stop receiving real-time alarm push notifications.`
    );
    if (!confirmDelete) return;

    setDeletingToken(device.token);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await authService.removeDevice(device.token);
      if (res.success) {
        setSuccessMessage(`Device removed successfully.`);
        setDevices(prev => prev.filter(d => d.token !== device.token));
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        setErrorMessage(res.error || 'Failed to remove device.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Network error removing device.');
    } finally {
      setDeletingToken(null);
    }
  };

  // Test push to specific device
  const handleTestPush = async (token) => {
    setTestingToken(token);
    try {
      const res = await api.testFcmPush(token);
      if (res.data?.success) {
        alert('Test notification sent successfully! Check your device for sound and visual alert.');
      } else {
        alert(`Test push failed: ${res.data?.error || 'Unknown error'}`);
      }
    } catch (err) {
      alert(`Failed to send test push: ${err.response?.data?.error || err.message}`);
    } finally {
      setTestingToken(null);
    }
  };

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Active recently';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'Active recently';
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Active recently';
    }
  };

  // Helper for platform icon
  const getPlatformIcon = (platform = '') => {
    const p = String(platform).toUpperCase();
    if (p.includes('IOS') || p.includes('APPLE')) {
      return <Smartphone className="w-5 h-5 text-sky-400" />;
    }
    if (p.includes('WEB') || p.includes('CHROME') || p.includes('BROWSER')) {
      return <Globe className="w-5 h-5 text-indigo-400" />;
    }
    return <Smartphone className="w-5 h-5 text-emerald-400" />;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
      
      {/* Top Banner & Control Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 lg:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Smartphone className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-xl lg:text-2xl font-black text-white tracking-wide">
                  Registered Devices & FCM Tokens
                </h1>
                <p className="text-xs lg:text-sm text-slate-400 mt-0.5">
                  Manage all mobile and web terminals synchronized to your ID for real-time sound alarms.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchDevices}
              disabled={isLoading || !currentUser}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs font-mono font-bold transition-all cursor-pointer disabled:opacity-50 shadow-md"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
              <span>Refresh</span>
            </button>

            {onBackToTerminal && (
              <button
                type="button"
                onClick={onBackToTerminal}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-mono font-black transition-all cursor-pointer shadow-md"
              >
                <span>Back to Terminal</span>
              </button>
            )}
          </div>
        </div>

        {/* User Account / Sync Summary Bar */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
              {currentUser?.email ? currentUser.email[0].toUpperCase() : '?'}
            </div>
            <div className="overflow-hidden">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">
                Synchronized Account
              </span>
              <span className="text-xs font-mono font-bold text-white truncate block">
                {currentUser?.email || 'Not Signed In'}
              </span>
            </div>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
              {devices.length}
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">
                Active Devices Linked
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400 block">
                {devices.length === 1 ? '1 Device Ready' : `${devices.length} Devices Ready`}
              </span>
            </div>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 font-bold">
              {currentUser?.notificationsEnabled !== false ? (
                <Bell className="w-5 h-5 text-emerald-400" />
              ) : (
                <BellOff className="w-5 h-5 text-rose-400" />
              )}
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">
                Push Alarms Status
              </span>
              <span className={`text-xs font-mono font-bold block ${
                currentUser?.notificationsEnabled !== false ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {currentUser?.notificationsEnabled !== false ? 'ENABLED (LOUD SOUND)' : 'DISABLED'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Notices */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-3">
          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* If Not Logged In Notice */}
      {!currentUser && (
        <div className="bg-slate-900/60 border border-amber-500/30 rounded-3xl p-8 text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <LogIn className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-bold text-white">Sign In to View Registered Devices</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Log into your Gold Trading account to see all mobile and web terminals currently registered with your Firebase Cloud Messaging (FCM) tokens.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenAuthModal}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-black text-xs font-mono shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In / Create Account</span>
          </button>
        </div>
      )}

      {/* Devices List */}
      {currentUser && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                Connected Devices List
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono font-bold">
                {devices.length} Total
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
              FCM tokens automatically expire or rotate after unlinking
            </span>
          </div>

          {isLoading ? (
            <div className="p-12 text-center bg-slate-900/40 rounded-3xl border border-slate-800 space-y-3">
              <RefreshCw className="w-6 h-6 text-amber-400 animate-spin mx-auto" />
              <p className="text-xs font-mono text-slate-400">Loading registered devices...</p>
            </div>
          ) : devices.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/40 rounded-3xl border border-slate-800 space-y-3">
              <Smartphone className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-slate-300">No Devices Registered Yet</p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Open the Gold Mobile App on Android or iOS and log into this exact account (<span className="text-amber-400/90 font-mono">{currentUser.email}</span>) to register your phone for instant sound push alerts.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {devices.map((device, idx) => {
                const isCopied = copiedToken === device.token;
                const isDeleting = deletingToken === device.token;
                const isTesting = testingToken === device.token;

                return (
                  <div
                    key={device.token || idx}
                    className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800/90 hover:border-slate-700/80 rounded-2xl p-5 lg:p-6 transition-all duration-200 shadow-xl space-y-4"
                  >
                    {/* Device Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center shadow-inner">
                          {getPlatformIcon(device.platform)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-white font-mono">
                              {device.deviceName || 'Personal Terminal'}
                            </h3>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold uppercase">
                              {device.platform || 'ANDROID'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span>{formatDate(device.lastActiveAt)}</span>
                          </p>
                        </div>
                      </div>

                      {/* Device Action Buttons */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleTestPush(device.token)}
                          disabled={isTesting || isDeleting}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 text-xs font-mono font-bold transition-all cursor-pointer disabled:opacity-50"
                          title="Send a test notification to this specific device"
                        >
                          <Send className={`w-3.5 h-3.5 ${isTesting ? 'animate-pulse text-sky-400' : ''}`} />
                          <span>{isTesting ? 'Sending...' : 'Test Sound'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemoveDevice(device)}
                          disabled={isDeleting}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-mono font-bold transition-all cursor-pointer disabled:opacity-50"
                          title="Unlink this device from receiving push notifications"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                          <span>{isDeleting ? 'Removing...' : 'Remove Device'}</span>
                        </button>
                      </div>
                    </div>

                    {/* FCM Token Display with One-Click Copy */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                          Firebase Cloud Messaging Token:
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {device.token ? `${device.token.length} chars` : 'No token'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 bg-slate-950/90 border border-slate-800 rounded-xl p-2.5">
                        <div className="font-mono text-xs text-amber-300/90 truncate flex-1 select-all px-1">
                          {device.token || 'Token not registered'}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(device.token)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex-shrink-0 ${
                            isCopied
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                          }`}
                          title="Copy full token to clipboard"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-400" />
                              <span>Copy Token</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Info note at bottom */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-3 text-xs text-slate-400 font-mono">
        <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-slate-200">How Multi-Device Alarm Sync works:</strong> When any trading level (Custom Target, R3, R2, S2, S3) is triggered, our backend broadcasts a high-priority push notification with sound (<code className="text-amber-300">gold_loud_alarm_channel_v7</code>) to all registered device tokens simultaneously. If you remove a device here, it will no longer receive alerts until logged in again.
        </p>
      </div>

    </div>
  );
};
