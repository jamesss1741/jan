import React from 'react';
import { AshokaChakra } from '../common/AshokaChakra';

export const AndroidAppHeader: React.FC = () => {
  return (
    <div className="w-full bg-white dark:bg-slate-900 border-b border-slate-200/90 dark:border-slate-800 shrink-0 select-none z-30 shadow-xs">
      {/* Main Clean Portal Header without flag ribbon or govt official badge */}
      <div className="px-4 py-3 flex items-center justify-between">
        
        {/* Emblem replaced directly with the Wheel (Chakra) & Official Portal Name */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-950/80 border border-[#000080]/20 dark:border-blue-700/40 flex items-center justify-center shrink-0 p-1 shadow-xs">
            <AshokaChakra className="w-full h-full" />
          </div>

          <div className="leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-sm sm:text-base text-slate-900 dark:text-white tracking-tight">
                जन औषधि <span className="text-[#046A38] dark:text-emerald-400 font-extrabold">• PMBJP</span>
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              Dept. of Pharmaceuticals, Ministry of Chemicals & Fertilizers
            </p>
          </div>
        </div>

        {/* Active Kendra Network Indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[10px] font-extrabold text-emerald-800 dark:text-emerald-300 shadow-2xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#046A38]" />
          </span>
          <span className="font-mono">20,149+ Kendras</span>
        </div>

      </div>
    </div>
  );
};
