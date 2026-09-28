import React, { useState, useEffect, useCallback } from 'react';
import { 
  Smartphone, 
  Laptop, 
  Globe, 
  Trash2, 
  RefreshCw, 
  ShieldCheck, 
  AlertTriangle, 
  LogIn, 
  Bell, 
  BellOff, 
  Send, 
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import { authService } from '../services/auth';
import { api } from '../services/api';
import { webFirebase } from '../services/firebase';

export const DevicesTab = ({ 
  currentUser, 
  onOpenAuthModal, 
  onBackToTerminal 
}) => {
  const [devices, setDevices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [deletingDeviceId, setDeletingDeviceId] = useState(null);
  const [togglingDeviceId, setTogglingDeviceId] = useState(null);
  const [testingDeviceId, setTestingDeviceId] = useState(null);
  const currentDeviceId = webFirebase.getDeviceId();

  const fetchDevices = useCallback(async () => {
    if (!currentUser) {
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

  // Toggle notification status for a specific device
  const handleToggleDeviceNotifications = async (device) => {
    const nextStatus = !device.notificationsEnabled;
    const targetId = device.deviceId || device.id;
    setTogglingDeviceId(targetId);

    try {
      const res = await authService.toggleDeviceNotifications(targetId, nextStatus);
      if (res.success) {
        setDevices(prev => prev.map(d => {
          if ((d.deviceId && d.deviceId === targetId) || d.id === targetId) {
            return { ...d, notificationsEnabled: nextStatus };
          }
          return d;
        }));
        setSuccessMessage(`Notifications for "${device.deviceName || 'Device'}" set to ${nextStatus ? 'ON' : 'OFF'}.`);
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setErrorMessage(res.error || 'Failed to update notification setting.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error updating device notification setting.');
    } finally {
      setTogglingDeviceId(null);
    }
  };

  // Remove / Unlink device
  const handleRemoveDevice = async (device) => {
    const targetId = device.deviceId || device.id;
    const isCurrent = targetId === currentDeviceId;
    const confirmMessage = isCurrent
      ? `This is your CURRENT browser terminal!\n\nRemoving it will unregister push notifications from this browser.\n\nAre you sure?`
      : `Are you sure you want to remove "${device.deviceName || 'Device'}"?\n\nIt will immediately stop receiving real-time price touch notifications.`;

    const confirmDelete = window.confirm(confirmMessage);
    if (!confirmDelete) return;

    setDeletingDeviceId(targetId);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await authService.removeDevice(targetId);
      if (res.success) {
        setSuccessMessage(`Device "${device.deviceName || 'Device'}" removed successfully.`);
        setDevices(prev => prev.filter(d => (d.deviceId || d.id) !== targetId));
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        setErrorMessage(res.error || 'Failed to remove device.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Network error removing device.');
    } finally {
      setDeletingDeviceId(null);
    }
  };

  // Test push to specific device
  const handleTestPush = async (device) => {
    const targetId = device.deviceId || device.id;
    setTestingDeviceId(targetId);
    try {
      const res = await api.testDevicePush(targetId);
      if (res.data?.success) {
        alert(`Test push notification dispatched to "${device.deviceName}". Check your device for sound and alert.`);
      } else {
        alert(`Test push note: ${res.data?.error || 'Sent'}`);
      }
    } catch (err) {
      alert(`Test push note: ${err.response?.data?.error || err.message}`);
    } finally {
      setTestingDeviceId(null);
    }
  };

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Active just now';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'Active just now';
      const now = Date.now();
      const diffMin = Math.floor((now - d.getTime()) / 60000);
      if (diffMin < 1) return 'Just now';
      if (diffMin < 60) return `${diffMin} min ago`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
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
                  Connected Devices
                </h1>
                <p className="text-xs lg:text-sm text-slate-400 mt-0.5">
                  All mobile and web terminals currently linked to your profile for price alert delivery.
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
                Logged-In Profile
              </span>
              <span className="text-sm font-bold text-white truncate block font-mono">
                {currentUser?.email || 'Not logged in'}
              </span>
            </div>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">
                Active Terminals
              </span>
              <span className="text-sm font-black text-emerald-400 font-mono">
                {devices.length} {devices.length === 1 ? 'Device' : 'Devices'} Connected
              </span>
            </div>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">
                Isolation Policy
              </span>
              <span className="text-xs font-bold text-slate-300">
                100% Private to your ID
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Success / Error Banners */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2 animate-fade-in">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
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
              Device-specific push notifications with independent mute switches
            </span>
          </div>

          {isLoading ? (
            <div className="p-12 text-center bg-slate-900/40 rounded-3xl border border-slate-800 space-y-3">
              <RefreshCw className="w-6 h-6 text-amber-400 animate-spin mx-auto" />
              <p className="text-xs font-mono text-slate-400">Loading connected devices...</p>
            </div>
          ) : devices.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/40 rounded-3xl border border-slate-800 space-y-3">
              <Smartphone className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-slate-300">No Devices Registered Yet</p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Open the Gold Mobile App or another browser and log in with this account (<span className="text-amber-400 font-mono">{currentUser.email}</span>) to register your device.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {devices.map((device, idx) => {
                const targetId = device.deviceId || device.id || `dev_${idx}`;
                const isCurrent = targetId === currentDeviceId || device.deviceId === currentDeviceId;
                const isDeleting = deletingDeviceId === targetId;
                const isToggling = togglingDeviceId === targetId;
                const isTesting = testingDeviceId === targetId;
                const isNotify = device.notificationsEnabled !== false;

                return (
                  <div
                    key={targetId}
                    className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800/90 hover:border-slate-700/80 rounded-2xl p-5 lg:p-6 transition-all duration-200 shadow-xl space-y-4"
                  >
                    {/* Device Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center shadow-inner">
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
                            {isCurrent && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold uppercase">
                                This Device
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mt-1">
                            <span className="flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full ${isNotify ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`}></span>
                              <span>Last active: {formatDate(device.lastActiveAt)}</span>
                            </span>
                            {device.browser && (
                              <span className="text-slate-500 text-[11px]">· {device.browser}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Device Action Buttons */}
                      <div className="flex items-center gap-2.5 self-end sm:self-center flex-wrap">
                        {/* Notification Toggle Button */}
                        <button
                          type="button"
                          onClick={() => handleToggleDeviceNotifications(device)}
                          disabled={isToggling}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer disabled:opacity-50 ${
                            isNotify
                              ? 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
                              : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-400'
                          }`}
                          title={`Click to turn push notifications ${isNotify ? 'OFF' : 'ON'} for this device`}
                        >
                          {isNotify ? (
                            <>
                              <Bell className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Notifications: ON</span>
                            </>
                          ) : (
                            <>
                              <BellOff className="w-3.5 h-3.5 text-slate-500" />
                              <span>Notifications: OFF</span>
                            </>
                          )}
                        </button>

                        {/* Test Push */}
                        <button
                          type="button"
                          onClick={() => handleTestPush(device)}
                          disabled={isTesting || isDeleting}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 text-xs font-mono font-bold transition-all cursor-pointer disabled:opacity-50"
                          title="Send a test notification to this specific device"
                        >
                          <Send className={`w-3.5 h-3.5 ${isTesting ? 'animate-pulse text-sky-400' : ''}`} />
                          <span>{isTesting ? 'Testing...' : 'Test Sound'}</span>
                        </button>

                        {/* Remove Device */}
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
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
