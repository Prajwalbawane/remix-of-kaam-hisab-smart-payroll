import { useEffect, useState, useRef } from 'react';
import { QrCode, RefreshCw, Clock, Download } from 'lucide-react';
import { DailyQRCode } from '@/types';
import { cn } from '@/lib/utils';
import QRCode from 'qrcode';

interface QRCodeDisplayProps {
  qrCode: DailyQRCode | null;
  onGenerate: () => void;
  isValid: boolean;
}

export function QRCodeDisplay({ qrCode, onGenerate, isValid }: QRCodeDisplayProps) {
  const [timeLeft, setTimeLeft] = useState('');
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!qrCode) return;

    const updateTime = () => {
      const now = new Date();
      const validUntil = new Date(qrCode.validUntil);
      const diff = validUntil.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeLeft('Expired');
        return;
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${hours}h ${minutes}m left`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [qrCode]);

  // Generate QR code image
  useEffect(() => {
    if (!qrCode || !isValid) {
      setQrImageUrl(null);
      return;
    }

    const generateQRImage = async () => {
      try {
        const url = await QRCode.toDataURL(qrCode.code, {
          width: 256,
          margin: 2,
          color: {
            dark: '#0F766E',
            light: '#FFFFFF',
          },
          errorCorrectionLevel: 'H',
        });
        setQrImageUrl(url);
      } catch (err) {
        console.error('Error generating QR code:', err);
      }
    };

    generateQRImage();
  }, [qrCode, isValid]);

  const handleDownloadQR = () => {
    if (!qrImageUrl || !qrCode) return;
    
    const link = document.createElement('a');
    link.download = `attendance-qr-${qrCode.date}.png`;
    link.href = qrImageUrl;
    link.click();
  };

  const today = new Date().toLocaleDateString('mr-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="flex flex-col items-center p-6 animate-scale-in">
      {/* Date Display */}
      <p className="text-sm text-muted-foreground mb-4">{today}</p>

      {/* QR Code Container */}
      <div className={cn(
        "relative p-6 bg-card rounded-2xl border-2 transition-all",
        isValid ? "border-primary shadow-qr animate-qr-glow" : "border-border shadow-card"
      )}>
        {isValid && qrImageUrl ? (
          <>
            {/* Real QR Code */}
            <div className="w-48 h-48 rounded-lg overflow-hidden bg-card flex items-center justify-center">
              <img 
                src={qrImageUrl} 
                alt="Attendance QR Code" 
                className="w-full h-full object-contain"
              />
            </div>

            {/* Time Remaining */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1 bg-success text-success-foreground rounded-full text-xs font-medium">
              <Clock className="w-3 h-3" />
              {timeLeft}
            </div>
          </>
        ) : (
          <div className="w-48 h-48 bg-muted rounded-lg flex flex-col items-center justify-center gap-3">
            <QrCode className="w-16 h-16 text-muted-foreground" />
            <p className="text-sm text-muted-foreground text-center">
              आजचा QR code<br />तयार करा
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex gap-3">
        <button
          onClick={onGenerate}
          className={cn(
            "flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all active:scale-[0.98]",
            isValid 
              ? "bg-muted text-muted-foreground hover:bg-muted/80"
              : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-elevated"
          )}
        >
          <RefreshCw className="w-4 h-4" />
          {isValid ? 'नवीन QR बनवा' : 'आजचा QR बनवा'}
        </button>

        {isValid && qrImageUrl && (
          <button
            onClick={handleDownloadQR}
            className="flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-sm bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            Save
          </button>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 text-center space-y-1">
        <p className="text-xs text-muted-foreground">
          कामगारांना हा QR स्कॅन करायला सांगा
        </p>
        <p className="text-xs text-muted-foreground">
          Valid: 7 AM - 11 AM
        </p>
        {qrCode && isValid && (
          <p className="text-[10px] text-muted-foreground mt-2 font-mono">
            Code: {qrCode.code.slice(-12)}
          </p>
        )}
      </div>
    </div>
  );
}
