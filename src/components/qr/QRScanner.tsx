import { useState, useEffect, useCallback } from 'react';
import { Camera, CheckCircle, XCircle, QrCode, AlertCircle } from 'lucide-react';
import { Worker } from '@/types';
import { useQRScanner } from '@/hooks/useQRScanner';
import { cn } from '@/lib/utils';

interface QRScannerProps {
  onScan: (code: string) => { success: boolean; message: string; worker?: Worker };
}

type ScanState = 'idle' | 'scanning' | 'success' | 'error' | 'no-permission';

export function QRScanner({ onScan }: QRScannerProps) {
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [message, setMessage] = useState('');
  const [scannedWorker, setScannedWorker] = useState<Worker | null>(null);

  const handleQRDetected = useCallback((decodedText: string) => {
    const result = onScan(decodedText);
    
    if (result.success) {
      setScanState('success');
      setMessage(result.message);
      setScannedWorker(result.worker || null);
    } else {
      setScanState('error');
      setMessage(result.message);
      setScannedWorker(result.worker || null);
    }
    
    // Reset after 3 seconds
    setTimeout(() => {
      setScanState('idle');
      setMessage('');
      setScannedWorker(null);
    }, 3000);
  }, [onScan]);

  const handleScanError = useCallback((error: string) => {
    setScanState('no-permission');
    setMessage(error);
  }, []);

  const { containerId, isScanning, hasPermission, startScanning, stopScanning } = useQRScanner({
    onScan: handleQRDetected,
    onError: handleScanError,
  });

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      stopScanning();
    };
  }, [stopScanning]);

  const handleStartScan = async () => {
    setScanState('scanning');
    await startScanning();
  };

  const handleStopScan = async () => {
    await stopScanning();
    setScanState('idle');
  };

  return (
    <div className="flex flex-col items-center p-6 animate-scale-in">
      {/* Scanner Frame */}
      <div className="relative w-72 h-72 mb-6">
        <div className={cn(
          "absolute inset-0 rounded-2xl border-2 overflow-hidden transition-all",
          scanState === 'success' && "border-success bg-success/5",
          scanState === 'error' && "border-destructive bg-destructive/5",
          scanState === 'scanning' && "border-primary",
          scanState === 'no-permission' && "border-warning bg-warning/5",
          scanState === 'idle' && "border-border bg-muted/30"
        )}>
          {/* Camera view */}
          {isScanning && scanState === 'scanning' && (
            <div id={containerId} className="absolute inset-0" />
          )}

          {/* Overlay states */}
          {!isScanning && scanState === 'idle' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4">
                <Camera className="w-16 h-16 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">
                  कॅमेरा तयार आहे
                </p>
              </div>
            </div>
          )}
          
          {scanState === 'no-permission' && (
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="text-center space-y-4">
                <AlertCircle className="w-16 h-16 text-warning mx-auto" />
                <div>
                  <p className="text-sm font-medium text-warning">Camera Access Needed</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Please allow camera access to scan QR codes
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {scanState === 'success' && (
            <div className="absolute inset-0 flex items-center justify-center bg-success/10">
              <div className="text-center space-y-4 animate-scale-in">
                <CheckCircle className="w-20 h-20 text-success mx-auto" />
                <div>
                  <p className="text-lg font-semibold text-success">हजेरी लागली!</p>
                  {scannedWorker && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {scannedWorker.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {scanState === 'error' && (
            <div className="absolute inset-0 flex items-center justify-center bg-destructive/10">
              <div className="text-center space-y-4 animate-scale-in">
                <XCircle className="w-20 h-20 text-destructive mx-auto" />
                <div>
                  <p className="text-lg font-semibold text-destructive">Error</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {message}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Corner brackets for scanning state */}
          {(scanState === 'idle' || scanState === 'scanning') && !isScanning && (
            <>
              <div className="absolute top-4 left-4 w-10 h-10 border-l-4 border-t-4 border-primary rounded-tl-lg" />
              <div className="absolute top-4 right-4 w-10 h-10 border-r-4 border-t-4 border-primary rounded-tr-lg" />
              <div className="absolute bottom-4 left-4 w-10 h-10 border-l-4 border-b-4 border-primary rounded-bl-lg" />
              <div className="absolute bottom-4 right-4 w-10 h-10 border-r-4 border-b-4 border-primary rounded-br-lg" />
            </>
          )}
        </div>

        {/* Scanning indicator */}
        {isScanning && scanState === 'scanning' && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1.5 bg-primary text-primary-foreground rounded-full text-xs font-medium animate-pulse">
            <div className="w-2 h-2 bg-primary-foreground rounded-full animate-ping" />
            Scanning...
          </div>
        )}
      </div>

      {/* Scan Button */}
      {scanState === 'idle' && !isScanning && (
        <button
          onClick={handleStartScan}
          className="flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-medium text-base shadow-elevated transition-all active:scale-[0.98] hover:bg-primary/90"
        >
          <QrCode className="w-5 h-5" />
          हजेरी स्कॅन करा
        </button>
      )}

      {isScanning && scanState === 'scanning' && (
        <button
          onClick={handleStopScan}
          className="flex items-center gap-2 px-8 py-4 bg-muted text-muted-foreground rounded-xl font-medium text-base transition-all active:scale-[0.98] hover:bg-muted/80"
        >
          Stop Scanning
        </button>
      )}

      {scanState === 'no-permission' && (
        <button
          onClick={handleStartScan}
          className="flex items-center gap-2 px-8 py-4 bg-warning text-warning-foreground rounded-xl font-medium text-base transition-all active:scale-[0.98] hover:bg-warning/90"
        >
          Try Again
        </button>
      )}

      {/* Instructions */}
      <div className="mt-6 text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          मालकाचा QR code स्कॅन करा
        </p>
        <p className="text-xs text-muted-foreground">
          Scan window: 7 AM - 11 AM
        </p>
      </div>
    </div>
  );
}
