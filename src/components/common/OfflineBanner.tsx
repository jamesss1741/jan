import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-md shrink-0 z-50">
      <div className="flex items-center gap-2">
        <WifiOff className="w-4 h-4 stroke-[2.5]" />
        <span>No Internet Connection • Offline PMBJP Rate Database Active</span>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="flex items-center gap-1 px-2.5 py-1 bg-slate-950 text-white rounded-lg text-[10px] font-bold"
      >
        <RefreshCw className="w-3 h-3" />
        <span>Retry</span>
      </button>
    </div>
  );
};
