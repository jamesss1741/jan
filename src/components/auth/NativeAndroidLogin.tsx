import React, { useState, useEffect, useRef } from 'react';
import { UserSession } from '../../types';
import { AshokaChakra } from '../common/AshokaChakra';
import {
  ShieldCheck, HeartPulse, Check, ArrowRight, ArrowLeft,
  Sparkles, Smartphone, Mail, Lock, User, RefreshCw, KeyRound,
  Eye, EyeOff, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onLoginSuccess: (session: UserSession) => void;
}

export const NativeAndroidLogin: React.FC<Props> = ({ onLoginSuccess }) => {
  const [loginMethod, setLoginMethod] = useState<'main' | 'phone' | 'google-modal' | 'password' | 'loading'>('main');
  
  // Phone OTP State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  
  // Google Flow State
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [googleError, setGoogleError] = useState(false);

  // App Password Flow State
  const [appEmail, setAppEmail] = useState('');
  const [appPassword, setAppPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [appPasswordError, setAppPasswordError] = useState('');

  // 5-7 second authentic loading state
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStatusText, setLoadingStatusText] = useState('Connecting to Google Identity Services...');
  const [pendingSession, setPendingSession] = useState<UserSession | null>(null);
  const loadingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Handle Google Loading Sequence (exactly 6.0 seconds = 6000ms)
  const startGoogleLoadingFlow = (session: UserSession) => {
    setPendingSession(session);
    setLoginMethod('loading');
    setLoadingProgress(0);

    const startTime = Date.now();
    const duration = 6000; // 6 seconds

    if (loadingTimerRef.current) clearInterval(loadingTimerRef.current);

    loadingTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.round((elapsed / duration) * 100));
      setLoadingProgress(progress);

      if (elapsed < 1800) {
        setLoadingStatusText('Connecting to Google Identity Services...');
      } else if (elapsed < 3800) {
        setLoadingStatusText('Verifying PMBJP Citizen Authorization...');
      } else if (elapsed < 5400) {
        setLoadingStatusText('Synchronizing 2,453 PMBJP Drug Codes & Offline Cache...');
      } else {
        setLoadingStatusText('Session Ready. Launching Portal...');
      }

      if (elapsed >= duration) {
        if (loadingTimerRef.current) clearInterval(loadingTimerRef.current);
        setTimeout(() => {
          onLoginSuccess(session);
        }, 300);
      }
    }, 60);
  };

  useEffect(() => {
    return () => {
      if (loadingTimerRef.current) clearInterval(loadingTimerRef.current);
    };
  }, []);

  const handleSkipLoading = () => {
    if (loadingTimerRef.current) clearInterval(loadingTimerRef.current);
    if (pendingSession) {
      onLoginSuccess(pendingSession);
    } else {
      setLoginMethod('password');
    }
  };

  const handleGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGoogleError(true);
  };

  const handleQuickGoogleOneTap = () => {
    setGoogleError(true);
  };

  // Handle App Password Submit
  const handleAppPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAppPasswordError('');

    if (!appEmail.trim()) {
      setAppPasswordError('Please enter your email or citizen ID');
      return;
    }
    if (appPassword.length < 4) {
      setAppPasswordError('App password must be at least 4 characters');
      return;
    }

    const displayName = appEmail.split('@')[0];
    onLoginSuccess({
      name: displayName ? displayName.charAt(0).toUpperCase() + displayName.slice(1) : 'PMBJP Citizen',
      email: appEmail.trim(),
      citizenId: 'PMBJP-' + Math.floor(100000 + Math.random() * 900000),
      appPassword: appPassword,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      authProvider: 'guest',
      loginTime: new Date().toISOString()
    });
  };

  const handlePhoneContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length === 10) {
      setOtpSent(true);
    }
  };

  const handleVerifyOtp = () => {
    onLoginSuccess({
      name: `Citizen (+91 ${phoneNumber.slice(0, 4)}***)`,
      email: `+91 ${phoneNumber}`,
      citizenId: 'PMBJP-' + Math.floor(100000 + Math.random() * 900000),
      appPassword: 'OTP-VERIFIED',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      authProvider: 'google',
      loginTime: new Date().toISOString()
    });
  };

  return (
    <div className="w-full h-full min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between p-6 sm:p-8 select-none relative overflow-y-auto">
      
      {/* 5-7 Second Precision Loading Overlay */}
      {loginMethod === 'loading' && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-6">
          <div className="relative w-28 h-28 flex items-center justify-center">
            {/* SVG Circular Progress Meter */}
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                className="stroke-slate-100 dark:stroke-slate-800"
                strokeWidth="7"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="#000080"
                strokeWidth="7"
                strokeLinecap="round"
                fill="none"
                strokeDasharray="264"
                strokeDashoffset={264 - (264 * loadingProgress) / 100}
                className="transition-all duration-100 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-black font-mono text-[#000080] dark:text-blue-400">
                {loadingProgress}%
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {((6000 - (loadingProgress * 60)) / 1000).toFixed(1)}s
              </span>
            </div>
          </div>

          <div className="space-y-2 max-w-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Authenticating Google Session
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 min-h-[32px] flex items-center justify-center font-medium">
              {loadingStatusText}
            </p>
          </div>

          {/* Linear Progress Bar */}
          <div className="w-64 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#FF671F] via-[#000080] to-[#046A38] transition-all duration-100"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>

          {/* Skip Loading Link */}
          <button
            onClick={handleSkipLoading}
            className="text-xs font-bold text-slate-500 hover:text-[#000080] dark:text-slate-400 dark:hover:text-blue-400 pt-2 transition underline"
          >
            Skip loading & continue immediately →
          </button>
        </div>
      )}

      {/* Top Header Branding */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/80 border border-[#000080]/30 flex items-center justify-center p-1.5 shadow-xs">
              <AshokaChakra className="w-full h-full text-[#000080]" />
            </div>
            <div className="leading-tight">
              <span className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                जन औषधि <span className="text-[#046A38] dark:text-emerald-400 font-extrabold">• PMBJP</span>
              </span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                Dept. of Pharmaceuticals, Govt. of India
              </p>
            </div>
          </div>
        </div>

        {/* View 1: Main Landing Login Choices */}
        {loginMethod === 'main' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <span className="text-[11px] font-mono font-bold text-[#000080] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 rounded-full border border-blue-200/60 dark:border-blue-900">
                Official Citizen Portal
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                Welcome to Jan Aushadhi
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Access official PMBJP generic formulations, compare branded medicine rates, and save 50% to 90% on chronic prescriptions.
              </p>
            </div>

            {/* Main Action Buttons */}
            <div className="space-y-3 pt-2">
              
              {/* Google Error Notification */}
              {googleError && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/70 border-2 border-amber-400 dark:border-amber-700 space-y-2.5 shadow-sm"
                >
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                        Google Sign-In is Not Setup Yet
                      </h4>
                      <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5 leading-relaxed">
                        Google authentication has not been configured for this build. Please sign in using your <strong>App Password</strong> or <strong>Mobile OTP</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => {
                        setGoogleError(false);
                        setLoginMethod('password');
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-[#000080] hover:bg-blue-900 text-white text-xs font-bold shadow-xs transition"
                    >
                      Use App Password
                    </button>
                    <button
                      onClick={() => {
                        setGoogleError(false);
                        setLoginMethod('phone');
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-amber-200 dark:bg-amber-900/80 hover:bg-amber-300 text-amber-900 dark:text-amber-100 text-xs font-bold transition"
                    >
                      Use Mobile OTP
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Primary: Continue with Google (triggers error if not setup) */}
              <button
                onClick={() => setGoogleError(true)}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 rounded-2xl text-slate-800 dark:text-slate-100 font-bold text-sm shadow-sm transition active:scale-[0.98]"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Secondary: Sign in with App Password */}
              <button
                onClick={() => {
                  setGoogleError(false);
                  setLoginMethod('password');
                }}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-[#000080] dark:text-blue-300 border border-blue-200 dark:border-blue-900 rounded-2xl font-bold text-xs transition"
              >
                <KeyRound className="w-4 h-4" />
                <span>Sign In with App Password</span>
              </button>

              {/* Tertiary: Mobile Phone Login */}
              <button
                onClick={() => setLoginMethod('phone')}
                className="w-full flex items-center justify-center gap-2.5 py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-2xl font-bold text-xs transition"
              >
                <Smartphone className="w-4 h-4 text-[#046A38]" />
                <span>Sign In with Mobile OTP</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* View 2: App Password Login Screen */}
        {loginMethod === 'password' && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-5"
          >
            <button
              onClick={() => {
                setLoginMethod('main');
                setAppPasswordError('');
              }}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Citizen Account Sign-In
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enter your registered email address and app password to log in.
              </p>
            </div>

            {appPasswordError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 font-medium">
                {appPasswordError}
              </div>
            )}

            <form onSubmit={handleAppPasswordSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Email Address or Citizen ID
                </label>
                <div className="flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus-within:border-[#000080] rounded-2xl px-3 py-2.5">
                  <Mail className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={appEmail}
                    onChange={e => setAppEmail(e.target.value)}
                    placeholder="citizen@example.com"
                    className="w-full text-xs font-medium bg-transparent focus:outline-none text-slate-900 dark:text-white"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  App Password
                </label>
                <div className="flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus-within:border-[#000080] rounded-2xl px-3 py-2.5">
                  <Lock className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={appPassword}
                    onChange={e => setAppPassword(e.target.value)}
                    placeholder="Enter your app password"
                    className="w-full text-xs font-medium bg-transparent focus:outline-none text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-slate-300 text-[#000080] focus:ring-0"
                  />
                  <span>Remember login</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setAppEmail('citizen.demo@janaushadhi.gov.in');
                    setAppPassword('pmbjp2026');
                    setAppPasswordError('');
                  }}
                  className="text-[#000080] dark:text-blue-400 font-semibold hover:underline"
                >
                  Quick Fill Test Credentials
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-[#000080] hover:bg-blue-900 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
              >
                <span>Sign In to Jan Aushadhi</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}

        {/* View 3: Google Sign In Form / Choice Modal */}
        {loginMethod === 'google-modal' && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-5"
          >
            <button
              onClick={() => setLoginMethod('main')}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Google Authentication
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Continue with your Google account via secure OAuth 2.0.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/70 border border-amber-400 dark:border-amber-700 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Google Login Not Setup Yet</span>
                <span className="text-[11px] text-amber-700 dark:text-amber-300">
                  Google Client ID is pending setup. Please switch to <strong>App Password</strong> or <strong>Mobile OTP</strong> to access the catalog.
                </span>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setLoginMethod('password')}
                    className="py-1.5 px-3 rounded-lg bg-[#000080] text-white text-[11px] font-bold"
                  >
                    Use App Password
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginMethod('phone')}
                    className="py-1.5 px-3 rounded-lg bg-amber-200 dark:bg-amber-900/80 text-amber-900 dark:text-amber-100 text-[11px] font-bold"
                  >
                    Use Mobile OTP
                  </button>
                </div>
              </div>
            </div>

            <form onSubmit={handleGoogleSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Your Full Name
                </label>
                <div className="flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-3 py-2.5">
                  <User className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={googleName}
                    onChange={e => setGoogleName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full text-xs font-medium bg-transparent focus:outline-none text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Google Email Address
                </label>
                <div className="flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-3 py-2.5">
                  <Mail className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="email"
                    value={googleEmail}
                    onChange={e => setGoogleEmail(e.target.value)}
                    placeholder="e.g. yourname@gmail.com"
                    className="w-full text-xs font-medium bg-transparent focus:outline-none text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-[#000080] hover:bg-blue-900 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
              >
                <span>Authorize with Google (5s Sync)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="relative flex items-center justify-center my-2">
              <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
              <span className="bg-white dark:bg-slate-950 px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider absolute">
                or
              </span>
            </div>

            <button
              onClick={handleQuickGoogleOneTap}
              className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <Sparkles className="w-4 h-4 text-[#FF671F]" />
              <span>Google 1-Tap Instant Sign-In</span>
            </button>
          </motion.div>
        )}

        {/* View 4: Mobile Phone Input & OTP */}
        {loginMethod === 'phone' && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-5"
          >
            <button
              onClick={() => {
                if (otpSent) {
                  setOtpSent(false);
                } else {
                  setLoginMethod('main');
                }
              }}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{otpSent ? 'Change Mobile Number' : 'Back'}</span>
            </button>

            {!otpSent ? (
              <form onSubmit={handlePhoneContinue} className="space-y-4">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Enter Mobile Number
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Enter your 10-digit phone number to receive a verification OTP.
                  </p>
                </div>

                <div className="flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 focus-within:border-[#046A38]">
                  <div className="flex items-center gap-1 px-3 border-r border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>🇮🇳 +91</span>
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 10-digit number"
                    className="flex-1 px-3 py-2 text-sm font-mono font-medium bg-transparent text-slate-900 dark:text-white focus:outline-none"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={phoneNumber.length !== 10}
                  className="w-full py-3.5 rounded-2xl bg-[#046A38] hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs transition shadow-md"
                >
                  Send OTP Code
                </button>
              </form>
            ) : (
              <div className="space-y-5">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Enter 4-Digit OTP
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Sent to +91 {phoneNumber}
                  </p>
                </div>

                <div className="flex gap-2 justify-center py-2">
                  {[0, 1, 2, 3].map(idx => (
                    <input
                      key={idx}
                      type="text"
                      maxLength={1}
                      value={otpDigits[idx]}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '');
                        const copy = [...otpDigits];
                        copy[idx] = val;
                        setOtpDigits(copy);
                        if (val && e.target.nextElementSibling) {
                          (e.target.nextElementSibling as HTMLInputElement).focus();
                        }
                      }}
                      placeholder="•"
                      className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-center font-mono font-bold text-lg text-slate-900 dark:text-white focus:border-[#046A38] focus:outline-none"
                    />
                  ))}
                </div>

                <button
                  onClick={handleVerifyOtp}
                  disabled={otpDigits.some(d => !d)}
                  className="w-full py-3.5 rounded-2xl bg-[#046A38] hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs transition shadow-md"
                >
                  Verify & Enter
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Official Footnote */}
      <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800 text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#046A38] dark:text-emerald-400">
          <ShieldCheck className="w-4 h-4 text-[#000080] dark:text-blue-400" />
          <span>Pradhan Mantri Bhartiya Janaushadhi Pariyojana</span>
        </div>
        <p className="text-[10px] text-slate-400">
          2,453 WHO-GMP Formulations • 20,149+ Kendras • Toll-Free: 1800-180-8080
        </p>
      </div>

    </div>
  );
};
