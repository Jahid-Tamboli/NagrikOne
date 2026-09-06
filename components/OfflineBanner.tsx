'use client';

import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) return null;

  return (
    <aside aria-label="Network status" className="fixed top-0 inset-x-0 z-[100] animate-fadeIn">
      {!isOnline ? (
        <div className="bg-amber-600 text-slate-950 px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 shadow-lg">
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>You&apos;re currently offline. NOVA AI and case drafts will sync once your internet is restored.</span>
        </div>
      ) : (
        <div className="bg-emerald-600 text-slate-950 px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 shadow-lg">
          <Wifi className="w-4 h-4 shrink-0" />
          <span>Connection restored! You are back online.</span>
        </div>
      )}
    </aside>
  );
}
