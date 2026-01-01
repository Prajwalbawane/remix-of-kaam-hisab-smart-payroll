import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeScanner } from 'html5-qrcode';

interface UseQRScannerOptions {
  onScan: (result: string) => void;
  onError?: (error: string) => void;
}

export function useQRScanner({ onScan, onError }: UseQRScannerOptions) {
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerIdRef = useRef(`qr-reader-${Date.now()}`);

  const startScanning = useCallback(async () => {
    try {
      const html5QrCode = new Html5Qrcode(containerIdRef.current);
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          onScan(decodedText);
          // Don't stop automatically - let the parent component decide
        },
        (errorMessage) => {
          // Ignore scan errors (no QR detected yet)
        }
      );

      setIsScanning(true);
      setHasPermission(true);
    } catch (err: any) {
      console.error('QR Scanner error:', err);
      setHasPermission(false);
      onError?.(err.message || 'Failed to start camera');
    }
  }, [onScan, onError]);

  const stopScanning = useCallback(async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
      scannerRef.current = null;
      setIsScanning(false);
    }
  }, [isScanning]);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return {
    containerId: containerIdRef.current,
    isScanning,
    hasPermission,
    startScanning,
    stopScanning,
  };
}
