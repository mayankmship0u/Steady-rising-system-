import React from 'react';
import { useOnlineStatus } from '../../hooks/usePWAInstall';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-950/90 px-3.5 py-1 text-xs font-medium text-amber-200 shadow-neon-amber backdrop-blur-md animate-bounce">
      <WifiOff className="w-3.5 h-3.5 text-amber-400" />
      <span>Offline Mode — Operating on Local Shadow Storage</span>
    </div>
  );
};
