import React, { useState, useRef, useEffect } from 'react';
import { 
  Activity, 
  Sliders, 
  Search, 
  ChevronDown, 
  User, 
  LogIn, 
  LogOut, 
  Bell, 
  BellOff, 
  Smartphone, 
  ShieldCheck, 
  Sparkles,
  Check
} from 'lucide-react';

export const HeaderStatus = ({
  activeSymbol = 'XAUUSD',
  symbolConfig = {},
  telegramAlertsEnabled = true,
  onToggleTelegram,
  onOpenSymbolSearch,
  onOpenSettings,
  currentUser = null,
  onOpenAuthModal,
  onLogout,
  onToggleNotifications,
  activeTab = 'terminal',
  onTabChange
}) => {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  // Compute initials
  const initials = currentUser?.fullName
    ? currentUser.fullName
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : (currentUser?.email ? currentUser.email[0].toUpperCase() : 'U');

  const notificationsActive = currentUser?.notificationsEnabled !== false;

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40 px-4 lg:px-8 py-3.5 shadow-2xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand & Market Identity + Symbol Switcher Button */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/25 ring-2 ring-amber-400/40 transform hover:scale-105 transition-all duration-300">
            <Activity className="w-6 h-6 text-slate-950 font-black stroke-[2.8]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onOpenSymbolSearch}
                className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-amber-400/60 transition-all cursor-pointer group"
                title="Click to search and change trading symbol"
              >
                <Search className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="text-base font-black text-white font-mono">{activeSymbol}</span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {symbolConfig?.assetType || 'ASSET'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
              </button>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="w-1.5 h-1.5 -ml-3.5 rounded-full bg-emerald-400"></span>
                LIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2 mt-1 font-medium">
              <span className="text-slate-300 font-semibold">{symbolConfig?.displayName || 'Multi-Asset Stream'}</span>
              <span className="text-amber-500/50">•</span>
              <span className="text-slate-400 font-mono text-[11px]">{symbolConfig?.exchange || 'OANDA'}</span>
              <span className="text-amber-500/50">•</span>
              <span className="text-amber-400/90 font-semibold">Custom Price Alerts</span>
            </p>
          </div>
        </div>

        {/* Central Navigation Tabs (Terminal vs Connected Devices) */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-2xl border border-slate-800 shadow-inner">
          <button
            type="button"
            onClick={() => onTabChange && onTabChange('terminal')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === 'terminal'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-black shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Terminal</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange && onTabChange('devices')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === 'devices'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-black shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Devices</span>
            {currentUser?.activeDevicesCount ? (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold leading-none ${
                activeTab === 'devices'
                  ? 'bg-slate-950 text-amber-400'
                  : 'bg-amber-500/20 text-amber-300'
              }`}>
                {currentUser.activeDevicesCount}
              </span>
            ) : null}
          </button>
        </div>

        {/* Right Side: Telegram Toggle + User Auth Profile + Settings Button */}
        <div className="flex items-center gap-2.5">
          {/* Telegram One-Click ON/OFF Toggle Button */}
          <button
            type="button"
            onClick={onToggleTelegram}
            className={`hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl border transition-all duration-200 shadow-md cursor-pointer active:scale-95 text-xs font-mono font-black ${
              telegramAlertsEnabled
                ? 'bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border-sky-500/40 shadow-sky-500/10'
                : 'bg-slate-900/90 hover:bg-slate-800 text-slate-400 border-slate-700/80 hover:text-slate-200'
            }`}
            title={`Telegram notifications are currently ${telegramAlertsEnabled ? 'ENABLED' : 'DISABLED'}. Click to toggle.`}
          >
            <span className={`w-2 h-2 rounded-full ${telegramAlertsEnabled ? 'bg-sky-400 animate-pulse' : 'bg-slate-600'}`}></span>
            <span>TELEGRAM:</span>
            <span className={`font-black ${telegramAlertsEnabled ? 'text-sky-300' : 'text-slate-500'}`}>
              {telegramAlertsEnabled ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* User Account Button (Logged in vs Sign In) */}
          {currentUser ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-amber-500/40 hover:border-amber-400 transition-all cursor-pointer shadow-md group"
                title={`Logged in as ${currentUser.email}. Click for account details.`}
              >
                {/* Avatar Badge */}
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-slate-950 font-black text-xs font-mono shadow-sm">
                  {initials}
                </div>

                <div className="text-left hidden md:block">
                  <div className="text-xs font-bold text-slate-200 font-mono leading-none truncate max-w-[120px]">
                    {currentUser.fullName || currentUser.email.split('@')[0]}
                  </div>
                  <div className="text-[10px] text-amber-400/90 flex items-center gap-1 font-mono mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>{currentUser.activeDevicesCount ? `${currentUser.activeDevicesCount} dev` : 'Synced'}</span>
                  </div>
                </div>

                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400 transition-transform" />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 animate-fade-in space-y-3.5 ring-1 ring-amber-500/20">
                  {/* Account Header */}
                  <div className="pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-slate-950 font-black text-sm font-mono shadow">
                        {initials}
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-xs font-bold text-white truncate">
                          {currentUser.fullName || 'Trading Terminal User'}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate font-mono">
                          {currentUser.email}
                        </div>
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-[11px] bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                      <span className="text-slate-400 font-mono flex items-center gap-1.5">
                        <Smartphone className="w-3 h-3 text-amber-400" />
                        Multi-Device ID:
                      </span>
                      <span className="text-emerald-400 font-bold font-mono flex items-center gap-1">
                        <Check className="w-3 h-3" /> Active
                      </span>
                    </div>
                  </div>

                  {/* Multi-Device Push Notifications ON/OFF Toggle */}
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/90 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold font-mono uppercase text-slate-300 flex items-center gap-1.5">
                        {notificationsActive ? (
                          <Bell className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <BellOff className="w-3.5 h-3.5 text-slate-500" />
                        )}
                        Push Alarms:
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          if (onToggleNotifications) {
                            onToggleNotifications(!notificationsActive);
                          }
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                          notificationsActive
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {notificationsActive ? 'ON' : 'OFF'}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      Controls alarms & pushes across all mobile & web devices logged into this email.
                    </p>
                  </div>

                  {/* Connected Devices Manager Link */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      if (onTabChange) onTabChange('devices');
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-amber-500/15 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-amber-300 text-xs font-mono font-bold flex items-center justify-between transition-all cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                      <span>Manage FCM Devices</span>
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold">
                      {currentUser.activeDevicesCount || 0}
                    </span>
                  </button>

                  {/* Sign Out Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      if (onLogout) onLogout();
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-rose-500/15 border border-slate-800 hover:border-rose-500/40 text-slate-300 hover:text-rose-300 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-400" />
                    <span>Sign Out (This Terminal)</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 via-amber-400/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-amber-400/50 hover:border-amber-400 text-amber-300 hover:text-amber-200 transition-all duration-200 shadow-md shadow-amber-500/10 cursor-pointer active:scale-95 text-xs font-black font-mono"
              title="Sign in with your Email to sync targets and alerts across all your devices"
            >
              <LogIn className="w-3.5 h-3.5 text-amber-400" />
              <span>Sign In / Sync</span>
            </button>
          )}

          {/* Settings Button */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 hover:border-amber-500/40 transition-all duration-200 shadow-sm cursor-pointer active:scale-95 text-xs font-bold font-mono"
            title="Screenshot & Alert Settings"
          >
            <Sliders className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>

      </div>
    </header>
  );
};
