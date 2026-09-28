import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  ShieldCheck, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  KeyRound, 
  Sparkles, 
  Smartphone, 
  Laptop, 
  Globe, 
  TrendingUp, 
  BarChart3, 
  BellRing, 
  Cpu, 
  Wifi, 
  Zap, 
  Check,
  Layers,
  Clock
} from 'lucide-react';
import { authService } from '../services/auth';

export const AuthPage = ({ onAuthSuccess }) => {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register' | 'forgot'
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberTerminal, setRememberTerminal] = useState(true);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // Forgot password form state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotPassword, setForgotPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Live simulated market tick ticker for terminal showcase
  const [simulatedPrice, setSimulatedPrice] = useState(2736.85);
  const [priceChangeDirection, setPriceChangeDirection] = useState('up'); // 'up' | 'down'

  useEffect(() => {
    const interval = setInterval(() => {
      const delta = (Math.random() * 0.40 - 0.18);
      setSimulatedPrice(prev => {
        const next = parseFloat((prev + delta).toFixed(2));
        setPriceChangeDirection(next >= prev ? 'up' : 'down');
        return next;
      });
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const resetMessages = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    resetMessages();
  };

  // Password strength calculation for registration
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-700' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 1: return { score: 1, label: 'Weak', color: 'bg-rose-500' };
      case 2: return { score: 2, label: 'Fair', color: 'bg-amber-500' };
      case 3: return { score: 3, label: 'Good', color: 'bg-sky-400' };
      case 4: return { score: 4, label: 'Strong', color: 'bg-emerald-400' };
      default: return { score: 0, label: '', color: 'bg-slate-700' };
    }
  };

  const passwordStrength = getPasswordStrength(regPassword);

  // Submit Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    resetMessages();

    if (!loginEmail.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!loginPassword) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.login({
        email: loginEmail,
        password: loginPassword
      });

      if (res.success) {
        setSuccessMessage(`Welcome back, ${res.user.fullName || 'Trader'}! Initializing workspace...`);
        setTimeout(() => {
          if (onAuthSuccess) onAuthSuccess(res.user);
        }, 600);
      } else {
        setErrorMessage(res.error || 'Invalid email or password.');
      }
    } catch (err) {
      setErrorMessage('Connection error. Please check server status.');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Registration
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    resetMessages();

    if (!regName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!regEmail.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.register({
        fullName: regName,
        email: regEmail,
        password: regPassword,
        confirmPassword: regConfirmPassword
      });

      if (res.success) {
        setSuccessMessage(`Account created! Connecting terminal as ${res.user.email}...`);
        setTimeout(() => {
          if (onAuthSuccess) onAuthSuccess(res.user);
        }, 700);
      } else {
        setErrorMessage(res.error || 'Registration failed. Please check your details.');
      }
    } catch (err) {
      setErrorMessage('Network connection error during registration.');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Password Reset
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    resetMessages();

    if (!forgotEmail.trim()) {
      setErrorMessage('Please enter your registered email address.');
      return;
    }
    if (!forgotPassword || forgotPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters.');
      return;
    }
    if (forgotPassword !== forgotConfirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.resetPassword({
        email: forgotEmail,
        newPassword: forgotPassword,
        confirmPassword: forgotConfirmPassword
      });

      if (res.success) {
        setSuccessMessage('Password reset successfully! Launching terminal...');
        setTimeout(() => {
          if (onAuthSuccess) onAuthSuccess(res.user);
        }, 700);
      } else {
        setErrorMessage(res.error || 'Failed to reset password.');
      }
    } catch (err) {
      setErrorMessage('Network error during password reset.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#020617] text-slate-100 flex flex-col justify-between selection:bg-amber-400 selection:text-slate-950 relative overflow-x-hidden font-sans">
      
      {/* Background Ambient Glows & Tech Grids */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 -right-40 w-[550px] h-[550px] bg-amber-600/5 rounded-full blur-[150px]" />
        <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] bg-sky-500/5 rounded-full blur-[140px]" />
        
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{
            backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
            backgroundSize: '48px 48px'
          }} 
        />
      </div>

      {/* Top Universal Navbar */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/20 ring-1 ring-amber-400/40">
            <Activity className="w-5 h-5 text-slate-950 stroke-[2.8]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-sm text-white tracking-widest">GOLD ALERT TERMINAL</span>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-[10px] font-mono font-bold text-amber-400">
                PRO v2.4
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono hidden sm:block">Institutional Multi-Asset Real-Time Price Alarms</p>
          </div>
        </div>

        {/* Live System Status Beacon */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-emerald-400 font-bold">ALL SYSTEMS LIVE</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5 text-slate-400 text-[11px]">
            <Wifi className="w-3.5 h-3.5 text-amber-400" />
            <span>28ms Engine Ping</span>
          </div>
        </div>
      </header>

      {/* Main Dual-Column Content */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 lg:py-8 flex items-center">
        <div className="w-full grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* LEFT COLUMN: Terminal Showcase & Feature Highlights (7 Cols on desktop) */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-4 lg:space-y-5">
            
            {/* Pill Header */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 font-mono text-xs font-bold mb-4 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>CROSS-PLATFORM TRADING SUITE</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                High-Precision Spot Gold & Multi-Asset <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent">Alarm Terminal.</span>
              </h1>
              
              <p className="text-slate-400 text-sm sm:text-base mt-3 leading-relaxed max-w-xl">
                Real-time tick monitoring with non-repainting completed Fibonacci pivot levels, custom multi-price touch alerts, automated high-res TradingView captures, and instant mobile sync.
              </p>
            </div>

            {/* Interactive Live Ticker & Fibonacci Ladder Card */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-2xl backdrop-blur-xl relative overflow-hidden group hover:border-amber-500/40 transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                  <span className="font-mono font-black text-sm text-white">XAU / USD</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">Spot Gold</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    OANDA LIVE
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-slate-400">Spread:</span>
                  <span className="text-slate-200 font-bold">0.12</span>
                </div>
              </div>

              {/* Price Row */}
              <div className="py-4 flex items-baseline justify-between">
                <div>
                  <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Live Spot Tick</div>
                  <div className="flex items-baseline gap-3 mt-1">
                    <span className={`text-3xl sm:text-4xl font-black font-mono tracking-tight tabular-nums transition-colors duration-300 ${
                      priceChangeDirection === 'up' ? 'text-amber-400' : 'text-amber-300'
                    }`}>
                      ${simulatedPrice.toFixed(2)}
                    </span>
                    <span className="flex items-center text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +1.45% (+$38.90)
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Completed Period</div>
                  <div className="text-xs font-mono text-slate-200 mt-1 font-semibold">DAILY (D1) EOD FIXED</div>
                </div>
              </div>

              {/* Fibonacci Mini Ladder Preview */}
              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800/70 font-mono text-[11px]">
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center">
                  <div className="text-rose-400 font-bold">R3 RESIST</div>
                  <div className="text-white font-bold tabular-nums mt-0.5">$2,754.20</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center">
                  <div className="text-rose-400/80 font-bold">R2 TARGET</div>
                  <div className="text-white font-bold tabular-nums mt-0.5">$2,745.10</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center">
                  <div className="text-emerald-400/80 font-bold">S2 SUPPORT</div>
                  <div className="text-white font-bold tabular-nums mt-0.5">$2,719.80</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center">
                  <div className="text-emerald-400 font-bold">S3 FLOOR</div>
                  <div className="text-white font-bold tabular-nums mt-0.5">$2,710.40</div>
                </div>
              </div>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid sm:grid-cols-3 gap-3.5 pt-1">
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/70 hover:border-slate-700 transition-all">
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-2.5">
                  <Smartphone className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white font-mono">Single ID Multi-Device</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Log in once with the same email on Android, iOS & Web for unified alarm routing.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/70 hover:border-slate-700 transition-all">
                <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-2.5">
                  <Layers className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white font-mono">Completed EOD Pivots</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Calculated strictly from completed trading period OHLC with 0% live tick distortion.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/70 hover:border-slate-700 transition-all">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2.5">
                  <BellRing className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white font-mono">Instant Touch Alarms</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Sub-50ms tick crossing detection with Playwright HD chart snapshots on touch.
                </p>
              </div>
            </div>

            {/* Platform Badges */}
            <div className="flex items-center gap-6 pt-2 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400" />
                <span>Web Push & Service Worker</span>
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400" />
                <span>Android & iOS Cloud Messaging</span>
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400" />
                <span>Telegram Bot Dispatch</span>
              </span>
            </div>

          </div>

          {/* RIGHT COLUMN: Modern Dedicated Auth Form Portal (5 Cols on desktop) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-md bg-slate-900/80 border border-slate-800/90 shadow-2xl shadow-black/90 rounded-3xl p-6 sm:p-7 backdrop-blur-2xl relative overflow-hidden ring-1 ring-amber-500/20">
              
              {/* Card Top Light Accent */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent blur-sm" />

              {/* Portal Header */}
              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/25 ring-2 ring-amber-400/30 shrink-0">
                  <ShieldCheck className="w-5 h-5 text-slate-950 stroke-[2.5]" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-white tracking-wide uppercase font-mono">
                    Terminal Access
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Sign in to sync your active price alerts & levels
                  </p>
                </div>
              </div>

              {/* Multi-Device Synchronize Callout Banner */}
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 mb-4">
                <div className="p-1 rounded-lg bg-amber-500/20 text-amber-400 mt-0.5 shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="text-[11px] leading-relaxed text-amber-200/90 font-medium">
                  <span className="font-bold text-amber-300">Single ID Multi-Device Sync:</span> Use the <span className="underline decoration-amber-400 font-bold">same email</span> as your mobile app to receive instant alarms, push notifications & sync targets everywhere.
                </div>
              </div>

              {/* Tab Selector: Sign In / Create Account / Reset */}
              {activeTab !== 'forgot' ? (
                <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-950 border border-slate-800 mb-4">
                  <button
                    type="button"
                    onClick={() => handleTabSwitch('login')}
                    className={`py-2.5 text-xs font-bold font-mono rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      activeTab === 'login'
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                    }`}
                  >
                    <span>Sign In</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTabSwitch('register')}
                    className={`py-2.5 text-xs font-bold font-mono rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      activeTab === 'register'
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                    }`}
                  >
                    <span>Create Account</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between px-1 mb-6">
                  <span className="text-xs font-bold font-mono text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5" /> Reset Password
                  </span>
                  <button
                    type="button"
                    onClick={() => handleTabSwitch('login')}
                    className="text-xs text-slate-400 hover:text-amber-300 underline font-mono cursor-pointer transition-colors"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              )}

              {/* Feedback Alerts */}
              {errorMessage && (
                <div role="alert" className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-300 mb-5 animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span className="font-semibold">{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div role="status" className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-300 mb-5 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span className="font-semibold">{successMessage}</span>
                </div>
              )}

              {/* FORM 1: SIGN IN */}
              {activeTab === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label 
                      htmlFor="login-email" 
                      className="block text-[11px] font-bold font-mono uppercase tracking-wider text-slate-300 mb-1.5"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="login-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="e.g. trader@gmail.com"
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label 
                        htmlFor="login-password" 
                        className="text-[11px] font-bold font-mono uppercase tracking-wider text-slate-300"
                      >
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => handleTabSwitch('forgot')}
                        className="text-[11px] text-amber-400 hover:text-amber-300 hover:underline font-mono cursor-pointer transition-colors"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="login-password"
                        name="password"
                        type={showLoginPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                        title={showLoginPassword ? 'Hide password' : 'Show password'}
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Terminal Checkbox */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input 
                        type="checkbox"
                        checked={rememberTerminal}
                        onChange={(e) => setRememberTerminal(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-400/40 focus:ring-offset-0 cursor-pointer accent-amber-500"
                      />
                      <span className="text-xs text-slate-400 font-mono">Keep authenticated (30 days)</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black font-mono text-sm tracking-wide shadow-lg shadow-amber-500/25 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                  >
                    {isLoading ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        Authenticating...
                      </span>
                    ) : (
                      <>
                        <span>Sign In & Sync Terminal</span>
                        <ArrowRight className="w-4 h-4 stroke-[2.8]" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* FORM 2: CREATE ACCOUNT */}
              {activeTab === 'register' && (
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  <div>
                    <label 
                      htmlFor="reg-name" 
                      className="block text-[11px] font-bold font-mono uppercase tracking-wider text-slate-300 mb-1"
                    >
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="reg-name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="e.g. Alex Trader"
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label 
                      htmlFor="reg-email" 
                      className="block text-[11px] font-bold font-mono uppercase tracking-wider text-slate-300 mb-1"
                    >
                      Email Address (Universal Sync ID)
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="reg-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="e.g. alex@gmail.com"
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label 
                      htmlFor="reg-password" 
                      className="block text-[11px] font-bold font-mono uppercase tracking-wider text-slate-300 mb-1"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="reg-password"
                        name="new-password"
                        type={showRegPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={6}
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                        title={showRegPassword ? 'Hide password' : 'Show password'}
                      >
                        {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {regPassword.length > 0 && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 grid grid-cols-4 gap-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full ${passwordStrength.score >= 1 ? passwordStrength.color : 'bg-transparent'}`} />
                          <div className={`h-full ${passwordStrength.score >= 2 ? passwordStrength.color : 'bg-transparent'}`} />
                          <div className={`h-full ${passwordStrength.score >= 3 ? passwordStrength.color : 'bg-transparent'}`} />
                          <div className={`h-full ${passwordStrength.score >= 4 ? passwordStrength.color : 'bg-transparent'}`} />
                        </div>
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          {passwordStrength.label}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label 
                      htmlFor="reg-confirm-password" 
                      className="block text-[11px] font-bold font-mono uppercase tracking-wider text-slate-300 mb-1"
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="reg-confirm-password"
                        name="confirm-password"
                        type={showRegConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={6}
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                        title={showRegConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black font-mono text-sm tracking-wide shadow-lg shadow-amber-500/25 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                  >
                    {isLoading ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        Creating Account...
                      </span>
                    ) : (
                      <>
                        <span>Create Account & Launch</span>
                        <ArrowRight className="w-4 h-4 stroke-[2.8]" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* FORM 3: FORGOT PASSWORD */}
              {activeTab === 'forgot' && (
                <form onSubmit={handleResetSubmit} className="space-y-3.5">
                  <div>
                    <label 
                      htmlFor="forgot-email" 
                      className="block text-[11px] font-bold font-mono uppercase tracking-wider text-slate-300 mb-1"
                    >
                      Registered Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="forgot-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="e.g. trader@gmail.com"
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label 
                      htmlFor="forgot-new-password" 
                      className="block text-[11px] font-bold font-mono uppercase tracking-wider text-slate-300 mb-1"
                    >
                      New Password (Min 6 Characters)
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="forgot-new-password"
                        name="new-password"
                        type={showForgotPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={forgotPassword}
                        onChange={(e) => setForgotPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={6}
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(!showForgotPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                      >
                        {showForgotPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label 
                      htmlFor="forgot-confirm-password" 
                      className="block text-[11px] font-bold font-mono uppercase tracking-wider text-slate-300 mb-1"
                    >
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="forgot-confirm-password"
                        name="confirm-password"
                        type={showForgotConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={forgotConfirmPassword}
                        onChange={(e) => setForgotConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={6}
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowForgotConfirmPassword(!showForgotConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                        title={showForgotConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showForgotConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black font-mono text-sm tracking-wide shadow-lg shadow-amber-500/25 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                  >
                    {isLoading ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        Updating Password...
                      </span>
                    ) : (
                      <>
                        <span>Reset Password & Enter</span>
                        <ArrowRight className="w-4 h-4 stroke-[2.8]" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Form Footer */}
              <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>256-Bit SSL Encrypted</span>
                </span>
                <span>JWT Persistent Session</span>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Modern Bottom Status Bar */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-xl px-4 sm:px-8 py-3 text-[11px] font-mono text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-4">
          <span className="text-slate-300 font-semibold">GOLD & MULTI-ASSET TERMINAL</span>
          <span className="text-slate-600">•</span>
          <span>WebSocket Stream</span>
          <span className="text-slate-600">•</span>
          <span>FCM v1 Device Unicast</span>
        </div>
        <div className="flex items-center gap-4 text-slate-500">
          <span>OANDA XAUUSD Feed</span>
          <span>© 2026 Alert Terminal Inc.</span>
        </div>
      </footer>

    </div>
  );
};
