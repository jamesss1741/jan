import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { NativeAndroidLogin } from './components/auth/NativeAndroidLogin';
import { AndroidAppHeader } from './components/layout/AndroidAppHeader';
import { AndroidBottomBar } from './components/layout/AndroidBottomBar';
import { OfflineBanner } from './components/common/OfflineBanner';
import { AndroidHomeScreen } from './components/finder/AndroidHomeScreen';
import { AndroidSubstitutesScreen } from './components/scanner/AndroidSubstitutesScreen';
import { SalesAnalyticsTab } from './components/analytics/SalesAnalyticsTab';
import { PrescriptionBasketTab } from './components/basket/PrescriptionBasketTab';
import { AndroidSettingsScreen } from './components/settings/AndroidSettingsScreen';
import { ToastContainer } from './components/common/Toast';
import { Smartphone, Monitor } from 'lucide-react';

export const AppContent: React.FC = () => {
  const { userSession, login, activeTab } = useApp();
  const [deviceFrameMode, setDeviceFrameMode] = useState<'phone' | 'fullscreen'>('fullscreen');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-0 antialiased selection:bg-[#046A38] selection:text-white relative">
      
      {/* Desktop Device View Mode Switcher */}
      <div className="fixed top-2 right-2 hidden md:flex items-center gap-1 z-50">
        <div className="bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 p-1 rounded-2xl flex items-center gap-1 shadow-lg backdrop-blur-md text-xs font-semibold">
          <button
            onClick={() => setDeviceFrameMode('phone')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl transition ${
              deviceFrameMode === 'phone'
                ? 'bg-[#000080] text-white shadow-sm font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile Frame</span>
          </button>
          <button
            onClick={() => setDeviceFrameMode('fullscreen')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl transition ${
              deviceFrameMode === 'fullscreen'
                ? 'bg-[#000080] text-white shadow-sm font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Full Screen</span>
          </button>
        </div>
      </div>

      {/* Main Container / Full Screen Experience */}
      <div
        className={`w-full transition-all duration-300 flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden ${
          deviceFrameMode === 'phone'
            ? 'md:max-w-[420px] md:h-[860px] md:rounded-[48px] md:border-[10px] md:border-slate-800 md:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] relative my-4'
            : 'w-full min-h-screen relative'
        }`}
      >
        {/* Android Punch Hole Camera on Desktop Phone Frame */}
        {deviceFrameMode === 'phone' && (
          <div className="hidden md:block absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-900 rounded-full z-50 ring-2 ring-slate-800/80 pointer-events-none" />
        )}

        {/* Safe area spacer for native device status bar */}
        <div className="h-1.5 w-full shrink-0" />

        {/* Offline Detection Banner */}
        <OfflineBanner />

        {/* Application Body */}
        {!userSession ? (
          <div className="flex-1 overflow-hidden flex flex-col">
            <NativeAndroidLogin onLoginSuccess={session => login(session)} />
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
            {/* Top Official PMBJP Tricolor Header */}
            <AndroidAppHeader />

            {/* Scrollable Screen Workspace with generous padding bottom for the floating pill nav */}
            <main className="flex-1 overflow-y-auto px-4 py-3 min-w-0 pb-28">
              {activeTab === 'finder' && <AndroidHomeScreen />}
              {activeTab === 'scanner' && <AndroidSubstitutesScreen />}
              {activeTab === 'analytics' && <SalesAnalyticsTab />}
              {activeTab === 'basket' && <PrescriptionBasketTab />}
              {activeTab === 'reminders' && <AndroidSettingsScreen />}
            </main>

            {/* Fixed Floating Pill Bottom Navigation Bar */}
            <AndroidBottomBar />
          </div>
        )}
      </div>

      {/* Global Toast Alerts */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return <AppContent />;
}
