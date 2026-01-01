import { useState } from 'react';
import { QrCode, Users } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { QRCodeDisplay } from '@/components/qr/QRCodeDisplay';
import { QRScanner } from '@/components/qr/QRScanner';
import { useApiData } from '@/hooks/useApiData';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';

type ScanMode = 'owner' | 'worker';

export default function ScanPage() {
  const [mode, setMode] = useState<ScanMode>('owner');
  const { dailyQR, generateDailyQR, isQRValid, markAttendanceViaQR } = useApiData();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen">
      <PageHeader 
        title={t('attendanceQR')} 
        subtitle={t('scannerMode')}
      />

      <div className="p-4">
        {/* Mode Toggle */}
        <div className="flex gap-2 p-1 bg-muted rounded-xl mb-6">
          <button
            onClick={() => setMode('owner')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all",
              mode === 'owner' 
                ? "bg-card text-foreground shadow-card" 
                : "text-muted-foreground"
            )}
          >
            <QrCode className="w-4 h-4" />
            {t('ownerMode')} - {t('showQR')}
          </button>
          <button
            onClick={() => setMode('worker')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all",
              mode === 'worker' 
                ? "bg-card text-foreground shadow-card" 
                : "text-muted-foreground"
            )}
          >
            <Users className="w-4 h-4" />
            {t('workerMode')} - {t('scan')}
          </button>
        </div>

        {/* Content */}
        {mode === 'owner' ? (
          <QRCodeDisplay 
            qrCode={dailyQR}
            onGenerate={generateDailyQR}
            isValid={isQRValid()}
          />
        ) : (
          <QRScanner onScan={markAttendanceViaQR} />
        )}

        {/* Info Card */}
        <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-xl">
          <h3 className="font-semibold text-sm text-foreground mb-2">
            {mode === 'owner' ? t('ownerModeDesc') : t('workerModeDesc')}
          </h3>
        </div>
      </div>
    </div>
  );
}
