import { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { healthApi } from '@/services/api';

export function ConnectionStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        await healthApi.check();
        setIsConnected(true);
      } catch {
        setIsConnected(false);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Check every 30s

    return () => clearInterval(interval);
  }, []);

  if (isConnected === null) return null;

  return (
    <div className={`fixed bottom-20 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium shadow-lg transition-all ${
      isConnected 
        ? 'bg-green-500/20 text-green-600 border border-green-500/30' 
        : 'bg-red-500/20 text-red-600 border border-red-500/30'
    }`}>
      {isConnected ? (
        <>
          <Wifi className="h-3.5 w-3.5" />
          <span>Backend Connected</span>
        </>
      ) : (
        <>
          <WifiOff className="h-3.5 w-3.5" />
          <span>Backend Offline</span>
        </>
      )}
    </div>
  );
}
