import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface UseQRScannerOptions {
  onScan: (result: string) => void;
  onError?: (error: string) => void;
}

export function useQRScanner({ onScan, onError }: UseQRScannerOptions) {
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerIdRef = useRef(`qr-reader-${Date.now()}`);

  // Request camera permission explicitly (for laptops/desktops)
  const requestPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      // Stop the stream immediately - we just wanted to trigger the permission prompt
      stream.getTracks().forEach(track => track.stop());
      setHasPermission(true);
      return true;
    } catch (err: any) {
      console.error('Camera permission denied:', err);
      setHasPermission(false);
      onError?.('Camera permission denied. Please allow camera access in your browser settings.');
      return false;
    }
  }, [onError]);

  const startScanning = useCallback(async () => {
    try {
      // First, try to get permission if we don't have it
      if (hasPermission === null || hasPermission === false) {
        const granted = await requestPermission();
        if (!granted) {
          return;
        }
      }

      const html5QrCode = new Html5Qrcode(containerIdRef.current);
      scannerRef.current = html5QrCode;

      // Get available cameras
      const cameras = await Html5Qrcode.getCameras();
      
      if (cameras && cameras.length === 0) {
        throw new Error('No cameras found on this device');
      }

      // Use the back camera if available, otherwise use the first camera
      const cameraConfig = cameras.length > 1 
        ? { facingMode: "environment" }
        : { deviceId: cameras[0].id };

      await html5QrCode.start(
        cameraConfig,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          onScan(decodedText);
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
      
      // Provide user-friendly error messages
      let errorMessage = 'Failed to start camera';
      if (err.name === 'NotAllowedError' || err.message?.includes('Permission')) {
        errorMessage = 'Camera permission denied. Please click "Request Camera Permission" to allow access.';
      } else if (err.name === 'NotFoundError' || err.message?.includes('No cameras')) {
        errorMessage = 'No camera found on this device.';
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'Camera is in use by another application.';
      }
      
      onError?.(errorMessage);
    }
  }, [onScan, onError, hasPermission, requestPermission]);

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
    requestPermission,
  };
}
