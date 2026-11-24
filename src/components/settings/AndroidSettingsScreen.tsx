import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Language } from '../../types';
import { AshokaChakra } from '../common/AshokaChakra';
import { NOTIFICATION_TONES, NotificationTone, playReminderTone } from '../../utils/soundEffects';
import {
  Settings, User, Moon, Sun, Globe, Type, BellRing, Volume2,
  ShieldCheck, PhoneCall, Trash2, LogOut, Info, Check, Sparkles,
  Building2, ExternalLink, Download, FileText, AlertTriangle, HeartPulse,
  BadgeCheck, Globe2, Eye, EyeOff, Copy, KeyRound, Share2, Clock,
  RefreshCw, Users
} from 'lucide-react';

export const AndroidSettingsScreen: React.FC = () => {
  const {
    userSession,
    logout,
    theme,
    setTheme,
    language,
    setLanguage,
    seniorMode,
    setSeniorMode,
    basket,
    reminders,
    clearBasket,
    showToast,
    t
  } = useApp();

  const [selectedTone, setSelectedTone] = useState<NotificationTone>('bell');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDevConfirm, setShowDevConfirm] = useState(false);

  // Profile credentials state
  const [showProfilePassword, setShowProfilePassword] = useState(false);

  // Referral OTP state & countdown
  const [referralOtp, setReferralOtp] = useState<string | null>(null);
  const [otpSecondsLeft, setOtpSecondsLeft] = useState<number>(0);

  useEffect(() => {
    if (otpSecondsLeft <= 0) return;
    const interval = setInterval(() => {
      setOtpSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [otpSecondsLeft]);

  const handleGenerateReferralOtp = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setReferralOtp(code);
    setOtpSecondsLeft(600); // 10 minutes (600 seconds)
    showToast(`Referral OTP ${code} generated! Valid for 10 minutes.`, 'success');
  };

  const formatOtpTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Triple-tap on Settings header shortcut
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const DEV_PORTAL_URL = 'https://janaushadhi.gov.in/';

  const handleSettingsHeaderTap = useCallback(() => {
    tapCountRef.current += 1;
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);

    if (tapCountRef.current >= 3) {
      tapCountRef.current = 0;
      setShowDevConfirm(true);
    } else {
      tapTimerRef.current = setTimeout(() => {
        tapCountRef.current = 0;
      }, 800);
    }
  }, []);

  const languages: { code: Language; name: string; native: string }[] = [
    { code: 'EN', name: 'English', native: 'English' },
    { code: 'HI', name: 'Hindi', native: 'हिन्दी' },
    { code: 'KN', name: 'Kannada', native: 'ಕನ್ನಡ' }
  ];

  const handlePlayTone = (toneId: NotificationTone) => {
    setSelectedTone(toneId);
    setIsPlayingAudio(true);
    playReminderTone(toneId);
    showToast(`Playing tone: ${toneId}`, 'info');
    setTimeout(() => setIsPlayingAudio(false), 1200);
  };

  const handleExportData = () => {
    try {
      const data = {
        exportDate: new Date().toISOString(),
        user: userSession?.name || 'Citizen',
        totalPrescriptions: basket.length,
        prescriptions: basket.map(b => ({
          code: b.medicine.pmbjpCode,
          name: b.medicine.genericName,
          salt: b.medicine.saltComposition,
          pack: b.medicine.packSize,
          janAushadhiMrp: b.medicine.janAushadhiMrp,
          strips: b.quantityStrips,
          dosage: b.dosagePattern
        })),
        reminders: reminders.map(r => ({
          medicine: r.medicineName,
          time: r.specificTime,
          dosage: r.dosage,
          active: r.isActive
        }))
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PMBJP_Prescription_Backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Prescription backup exported successfully!', 'success');
    } catch {
      showToast('Export failed. Please check permissions.', 'warning');
    }
  };

  return (
    <div className="w-full space-y-4 pb-8">
      
      {/* Settings Screen Header — Triple-tap to access Developer Portal */}
      <div className="space-y-0.5" onClick={handleSettingsHeaderTap}>
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#000080] dark:text-blue-400 uppercase tracking-wider select-none">
          <Settings className="w-4 h-4 text-[#FF671F]" />
          <span>Application Settings</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white select-none">
          Settings &amp; Preferences
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Configure language, appearance, notification alerts, and citizen services.
        </p>
      </div>

      {/* Developer Portal Confirmation Dialog */}
      {showDevConfirm && (
        <div className="fixed inset-0 z-[999] bg-black/50 flex items-center justify-center p-6" onClick={() => setShowDevConfirm(false)}>
          <div
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-[#000080] dark:text-blue-400">
              <ExternalLink className="w-5 h-5" />
              <span className="text-sm font-bold">Open Official PMBJP Portal?</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              You are about to open the official Government of India PMBJP Central Portal (janaushadhi.gov.in) in a new browser tab.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDevConfirm(false)}
                className="flex-1 py-2.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowDevConfirm(false);
                  window.open(DEV_PORTAL_URL, '_blank', 'noopener,noreferrer');
                  showToast('PMBJP portal opened in new tab', 'info');
                }}
                className="flex-1 py-2.5 text-xs font-bold bg-[#000080] text-white rounded-xl shadow-sm"
              >
                Open Portal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Profile Card & Citizen Credentials */}
      {userSession && (
        <div className="space-y-3">
          {/* Profile Summary Header Card */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src={userSession.avatarUrl}
                alt={userSession.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-[#000080]/30"
              />
              <div>
                <div className="font-bold text-sm text-slate-900 dark:text-white">
                  {userSession.name}
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  {userSession.email}
                </div>
                <div className="inline-flex items-center gap-1 text-[10px] font-bold text-[#046A38] dark:text-emerald-400 mt-0.5">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Verified PMBJP Citizen Profile</span>
                </div>
              </div>
            </div>
          </div>

          {/* Citizen Credentials: View ID & Password Card */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-blue-50/70 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/30 border border-blue-200/90 dark:border-blue-900/60 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-[#000080] dark:text-blue-400 uppercase tracking-wider">
                <KeyRound className="w-4 h-4 text-[#FF671F]" />
                <span>Citizen ID &amp; App Credentials</span>
              </div>
              <span className="text-[10px] font-mono font-bold bg-[#000080]/10 text-[#000080] dark:bg-blue-900/40 dark:text-blue-300 px-2.5 py-0.5 rounded-full border border-[#000080]/20">
                ACTIVE SESSION
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Citizen ID Box */}
              <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Citizen ID Number
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-sm text-[#000080] dark:text-blue-400 tracking-wide">
                    {userSession.citizenId || 'PMBJP-849201'}
                  </span>
                  <button
                    onClick={() => {
                      const idToCopy = userSession.citizenId || 'PMBJP-849201';
                      navigator.clipboard.writeText(idToCopy);
                      showToast(`Citizen ID (${idToCopy}) copied!`, 'success');
                    }}
                    className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-[#000080] dark:hover:text-blue-400 transition active:scale-95"
                    title="Copy Citizen ID"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* App Password Box with Eye Toggle */}
              <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  App Password
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-sm text-slate-900 dark:text-white tracking-wider">
                    {showProfilePassword ? (userSession.appPassword || 'pmbjp2026') : '••••••••••••'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setShowProfilePassword(!showProfilePassword)}
                      className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition active:scale-95"
                      title={showProfilePassword ? 'Hide password' : 'View password'}
                    >
                      {showProfilePassword ? (
                        <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                      ) : (
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        const passToCopy = userSession.appPassword || 'pmbjp2026';
                        navigator.clipboard.writeText(passToCopy);
                        showToast('App Password copied to clipboard!', 'success');
                      }}
                      className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-[#000080] dark:hover:text-blue-400 transition active:scale-95"
                      title="Copy Password"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal">
              You can view and copy your official Citizen ID and Password here to sign back into Jan Aushadhi on any device.
            </p>
          </div>
        </div>
      )}

      {/* Citizen Referral - Generate OTP Feature */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-white via-emerald-50/30 to-blue-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            <Users className="w-4 h-4 text-[#046A38]" />
            <span>Referral - Generate OTP</span>
          </div>
          <span className="text-[10px] font-black bg-emerald-50 text-[#046A38] dark:bg-emerald-950/60 dark:text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            KENDRA BENEFIT
          </span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Generate a dynamic 6-digit verification OTP for Kendra counter subsidy billing or refer friends &amp; family to unlock generic drug savings.
        </p>

        {!referralOtp ? (
          <button
            onClick={handleGenerateReferralOtp}
            className="w-full py-3.5 rounded-2xl bg-[#046A38] hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Generate 6-Digit Referral OTP</span>
          </button>
        ) : (
          <div className="space-y-3 p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-emerald-200 dark:border-emerald-900/60 shadow-xs">
            {/* Top OTP Display Row */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Active Referral Code
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-2xl sm:text-3xl font-black font-mono tracking-widest text-[#000080] dark:text-blue-400">
                    {referralOtp.slice(0, 3)} {referralOtp.slice(3, 6)}
                  </span>
                </div>
              </div>

              {/* Countdown Timer Badge */}
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Valid For
                </span>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-xs font-mono font-bold text-[#046A38] dark:text-emerald-300 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-[#046A38] animate-ping" />
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatOtpTimer(otpSecondsLeft)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 dark:border-slate-700/60">
              {/* 1. Copy OTP */}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(referralOtp);
                  showToast(`Referral OTP ${referralOtp} copied!`, 'success');
                }}
                className="py-2.5 px-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </button>

              {/* 2. Share on WhatsApp */}
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `PMBJP Jan Aushadhi Citizen Referral OTP: ${referralOtp}. Valid for 10 minutes at any Kendra counter for generic medicine subsidies. Download portal: https://janaushadhi.gov.in/`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-2 rounded-xl bg-[#046A38] hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 shadow-xs"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </a>

              {/* 3. Regenerate OTP */}
              <button
                onClick={handleGenerateReferralOtp}
                className="py-2.5 px-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-[#000080] dark:text-blue-300 border border-blue-200 dark:border-blue-900 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>New OTP</span>
              </button>
            </div>

            <div className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl border border-slate-200/60 dark:border-slate-800">
              Present this 6-digit code at any Jan Aushadhi Kendra counter for priority billing &amp; beneficiary verification.
            </div>
          </div>
        )}
      </div>

      {/* 1. Appearance: Light Mode (Default) / Dark Mode */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
          <Sun className="w-4 h-4 text-[#FF671F]" />
          <span>Appearance & Theme</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setTheme('light')}
            className={`p-3 rounded-2xl border text-left transition flex items-center gap-3 ${
              theme === 'light'
                ? 'bg-orange-50/70 border-[#FF671F] shadow-xs ring-2 ring-[#FF671F]/20'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-[#FF671F] flex items-center justify-center">
              <Sun className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Light Mode</div>
              <div className="text-[10px] text-slate-500">Official Tricolor (Default)</div>
            </div>
          </button>

          <button
            onClick={() => setTheme('dark')}
            className={`p-3 rounded-2xl border text-left transition flex items-center gap-3 ${
              theme === 'dark'
                ? 'bg-slate-800 border-[#000080] dark:border-blue-500 shadow-xs ring-2 ring-blue-500/20'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-slate-700 text-blue-400 flex items-center justify-center">
              <Moon className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Dark Mode</div>
              <div className="text-[10px] text-slate-500">OLED Slate Black</div>
            </div>
          </button>
        </div>
      </div>

      {/* 2. Language Selection */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
          <Globe className="w-4 h-4 text-[#000080] dark:text-blue-400" />
          <span>Language (भाषा / ಭಾಷೆ)</span>
        </div>

        <div className="space-y-1.5">
          {languages.map(lang => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                showToast(`Language set to ${lang.name}`, 'success');
              }}
              className={`w-full p-3 rounded-2xl border flex items-center justify-between text-xs font-semibold transition ${
                language === lang.code
                  ? 'bg-blue-50 dark:bg-blue-950/60 border-[#000080] dark:border-blue-500 text-[#000080] dark:text-blue-200'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">{lang.native}</span>
                <span className="text-slate-400 text-xs">({lang.name})</span>
              </div>
              {language === lang.code && (
                <div className="w-5 h-5 rounded-full bg-[#000080] dark:bg-blue-500 text-white flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Emergency & Healthcare SOS Directory */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            <HeartPulse className="w-4 h-4 text-rose-600" />
            <span>National Emergency & SOS Helplines</span>
          </div>
          <span className="text-[10px] font-black bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 px-2 py-0.5 rounded-full border border-rose-200">
            24x7 TOLL-FREE
          </span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          One-tap emergency call to national ambulance and government health desks.
        </p>

        <div className="grid grid-cols-2 gap-2">
          <a
            href="tel:108"
            className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 transition block text-left"
          >
            <div className="flex items-center justify-between">
              <span className="text-lg font-black font-mono text-rose-600">108</span>
              <PhoneCall className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">National Ambulance</div>
            <div className="text-[10px] text-slate-500">Medical Emergency SOS</div>
          </a>

          <a
            href="tel:1075"
            className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition block text-left"
          >
            <div className="flex items-center justify-between">
              <span className="text-lg font-black font-mono text-[#000080] dark:text-blue-400">1075</span>
              <PhoneCall className="w-4 h-4 text-[#000080] dark:text-blue-400" />
            </div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">National Health Desk</div>
            <div className="text-[10px] text-slate-500">Ministry of Health (MoHFW)</div>
          </a>

          <a
            href="tel:18001808080"
            className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition block text-left"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black font-mono text-[#046A38] dark:text-emerald-400">1800-180-8080</span>
              <PhoneCall className="w-4 h-4 text-[#046A38]" />
            </div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">PMBJP Toll-Free</div>
            <div className="text-[10px] text-slate-500">Kendra & Drug Inquiries</div>
          </a>

          <a
            href="tel:14567"
            className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition block text-left"
          >
            <div className="flex items-center justify-between">
              <span className="text-lg font-black font-mono text-amber-600">14567</span>
              <PhoneCall className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">Senior Citizen Elderline</div>
            <div className="text-[10px] text-slate-500">Elderly Citizen Care</div>
          </a>
        </div>
      </div>

      {/* 4. Dosage Reminder Alert Tone Selector & Synth */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            <Volume2 className="w-4 h-4 text-[#000080] dark:text-blue-400" />
            <span>Dosage Notification Tone</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 font-bold">
            WEB AUDIO SYNTH
          </span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Select and test the acoustic alert tone for scheduled prescription pill reminders.
        </p>

        <div className="space-y-1.5">
          {NOTIFICATION_TONES.map(tone => (
            <div
              key={tone.id}
              className={`p-3 rounded-2xl border flex items-center justify-between transition ${
                selectedTone === tone.id
                  ? 'bg-blue-50/70 dark:bg-blue-950/40 border-[#000080] dark:border-blue-500'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="flex-1 pr-2">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {tone.name}
                </div>
                <div className="text-[10px] text-slate-500">
                  {tone.description}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handlePlayTone(tone.id)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1 active:scale-95 transition"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedTone(tone.id);
                    showToast(`Alert tone set to ${tone.name}`, 'success');
                  }}
                  className={`p-1.5 rounded-xl transition ${
                    selectedTone === tone.id
                      ? 'bg-[#000080] text-white'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Prescription Data Backup & Export */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
          <Download className="w-4 h-4 text-[#046A38]" />
          <span>Prescription Vault & Backup</span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Export your current prescriptions ({basket.length} items) and active reminders ({reminders.length} scheduled) for safekeeping or sharing with your doctor.
        </p>

        <button
          onClick={handleExportData}
          className="w-full py-2.5 rounded-2xl bg-[#000080] hover:bg-blue-900 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition"
        >
          <Download className="w-4 h-4" />
          <span>Export Prescription Backup (.JSON)</span>
        </button>
      </div>

      {/* 6. Text Size / Senior Citizen Mode */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            <Type className="w-4 h-4 text-[#FF671F]" />
            <span>Senior Citizen Mode (Large Text)</span>
          </div>
          <span className="text-[10px] font-bold text-[#046A38] font-mono">
            {seniorMode ? '+18% SCALE' : 'NORMAL'}
          </span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Enlarges typography and expands touch targets for elderly citizens.
        </p>

        <div className="flex gap-2">
          <button
            onClick={() => setSeniorMode(false)}
            className={`flex-1 py-2.5 rounded-2xl text-xs font-bold border transition ${
              !seniorMode
                ? 'bg-[#000080] text-white border-[#000080] shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            Standard Size
          </button>
          <button
            onClick={() => setSeniorMode(true)}
            className={`flex-1 py-2.5 rounded-2xl text-xs font-bold border transition ${
              seniorMode
                ? 'bg-[#FF671F] text-white border-[#FF671F] shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            Large Text (A+)
          </button>
        </div>
      </div>

      {/* 7. Offline Database & Storage Management */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-[#046A38]" />
          <span>Offline Database & Storage</span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs space-y-1">
          <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
            <span>Verified PMBJP Catalog:</span>
            <span className="text-[#000080] dark:text-blue-400 font-mono">2,453 Formulations Cached</span>
          </div>
          <div className="flex justify-between text-slate-500 text-[11px]">
            <span>Offline Availability:</span>
            <span className="text-[#046A38] font-bold">100% Ready (Zero Net Required)</span>
          </div>
        </div>

        <button
          onClick={() => {
            clearBasket();
            showToast('Prescription cart cleared successfully', 'info');
          }}
          className="w-full py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition flex items-center justify-center gap-2"
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-500" />
          <span>Clear Prescription Cart History</span>
        </button>
      </div>

      {/* 8. REDESIGNED: Official Government of India PMBJP Portal Card */}
      <div className="rounded-3xl bg-gradient-to-br from-white via-slate-50/80 to-blue-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Subtle Tricolor Micro-Accent Top Line */}
        <div className="h-1 w-full bg-gradient-to-r from-[#FF671F] via-[#000080] to-[#046A38]" />

        <div className="p-4 sm:p-5 space-y-3.5">
          {/* Header Row: Chakra Emblem + Official Nomenclature */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-800 border border-[#000080]/20 dark:border-blue-900/40 shadow-xs flex items-center justify-center p-1.5 shrink-0">
                <AshokaChakra className="w-full h-full text-[#000080]" />
              </div>
              <div className="leading-tight">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FF671F] block">
                  भारत सरकार • Govt. of India
                </span>
                <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                  PMBJP Official Portal
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  Dept. of Pharmaceuticals, Ministry of Chemicals & Fertilizers
                </p>
              </div>
            </div>

            {/* Version Badge */}
            <div className="shrink-0 text-right">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold text-[#046A38] dark:text-emerald-300 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-[#046A38] animate-pulse" />
                v4.0.0
              </span>
            </div>
          </div>

          {/* Core Mission Statement */}
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            <strong>Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP)</strong> is an initiative by the Department of Pharmaceuticals, Ministry of Chemicals & Fertilizers, Government of India, dedicated to making high-quality generic medicines accessible and affordable to every citizen.
          </p>

          {/* Official Verification Highlights Grid */}
          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80 text-center">
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="block text-[11px] font-black font-mono text-[#000080] dark:text-blue-400">
                2,453+
              </span>
              <span className="text-[9px] text-slate-500 font-medium">Formulations</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="block text-[11px] font-black font-mono text-[#046A38] dark:text-emerald-400">
                20,149+
              </span>
              <span className="text-[9px] text-slate-500 font-medium">Active Kendras</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="block text-[11px] font-black font-mono text-[#FF671F]">
                50%–90%
              </span>
              <span className="text-[9px] text-slate-500 font-medium">Price Savings</span>
            </div>
          </div>

          {/* Quick Footer Links */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
            <a
              href="https://janaushadhi.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-bold text-[#000080] dark:text-blue-400 hover:underline"
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>janaushadhi.gov.in</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <span className="text-slate-400 font-medium text-[10px]">
              Toll-Free: <strong className="text-slate-600 dark:text-slate-300 font-mono">1800-180-8080</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 9. Log Out Button with Confirmation */}
      {userSession && (
        <div>
          {!showLogoutConfirm ? (
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full py-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 font-bold text-xs transition flex items-center justify-center gap-2 shadow-xs active:scale-[0.98]"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out of Jan Aushadhi</span>
            </button>
          ) : (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 space-y-3 text-center">
              <div className="text-xs font-bold text-rose-800 dark:text-rose-200">
                Are you sure you want to log out of your session?
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-2 text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    logout();
                  }}
                  className="flex-1 py-2 text-xs font-bold bg-rose-600 text-white rounded-xl shadow-xs"
                >
                  Yes, Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
