import React from 'react';
import { useApp } from '../../context/AppContext';
import { Home, Repeat, FileSpreadsheet, ShoppingBag, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

export const AndroidBottomBar: React.FC = () => {
  const { activeTab, setActiveTab, basket, t } = useApp();

  const tabs = [
    { id: 'finder' as const, label: t('tabHome') || 'Home', icon: Home, badge: null },
    { id: 'scanner' as const, label: t('tabSubstitutes') || 'Substitutes', icon: Repeat, badge: null },
    { id: 'analytics' as const, label: t('tabPrices') || 'Rates', icon: FileSpreadsheet, badge: null },
    { id: 'basket' as const, label: t('tabBasket') || 'Prescription', icon: ShoppingBag, badge: basket.length > 0 ? basket.length : null },
    { id: 'reminders' as const, label: t('tabSettings') || 'Settings', icon: Settings, badge: null },
  ];

  return (
    <div className="fixed bottom-3 left-3 right-3 max-w-md mx-auto z-50 select-none">
      <div className="rounded-full bg-white/98 dark:bg-slate-900/98 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-800 shadow-[0_12px_36px_-6px_rgba(0,0,128,0.2)] px-1.5 py-1.5 flex items-center justify-between">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex flex-col items-center justify-center py-1 px-1 relative group transition-all shrink-0 min-w-0"
              aria-label={tab.label}
            >
              {/* Material You Style Pill Indicator behind Icon */}
              <div className="relative w-12 h-7 flex items-center justify-center">
                {isActive && (
                  <motion.div
                    layoutId="androidM3Pill"
                    className="absolute inset-0 bg-[#000080] dark:bg-blue-600 rounded-full -z-10 shadow-sm shadow-[#000080]/30"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  />
                )}

                <Icon
                  className={`w-4 h-4 transition-transform group-active:scale-90 ${
                    isActive
                      ? 'text-white stroke-[2.5]'
                      : 'text-slate-500 dark:text-slate-400 stroke-[1.8]'
                  }`}
                />

                {tab.badge !== null && (
                  <span className="absolute -top-1 -right-1 min-w-[15px] h-3.5 bg-[#FF671F] text-white text-[8px] font-black font-mono rounded-full flex items-center justify-center px-1 shadow-xs ring-1 ring-white dark:ring-slate-900">
                    {tab.badge}
                  </span>
                )}
              </div>

              {/* Tab Name Label: Explicit High Contrast (#000080 Navy Blue when active in Light Mode, Bold Blue in Dark Mode) */}
              <span
                className={`text-[9.5px] mt-0.5 tracking-tight transition-colors truncate max-w-full block text-center ${
                  isActive
                    ? 'text-[#000080] dark:text-blue-300 font-black'
                    : 'text-slate-600 dark:text-slate-400 font-medium'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
