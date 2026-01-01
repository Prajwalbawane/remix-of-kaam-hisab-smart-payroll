import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, QrCode, TrendingUp, Clock, IndianRupee, Calendar, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/ui/stat-card';
import { ActionCard } from '@/components/ui/action-card';
import { QRCodeDisplay } from '@/components/qr/QRCodeDisplay';
import { useApiData } from '@/hooks/useApiData';
import { useLanguage } from '@/hooks/useLanguage';

export default function HomePage() {
  const navigate = useNavigate();
  const { workers, todayStats, dailyQR, generateDailyQR, isQRValid, isLoading } = useApiData();
  const { t, language } = useLanguage();
  const [showQR, setShowQR] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const locale = language === 'hi' ? 'hi-IN' : 'en-IN';
  const today = new Date().toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <PageHeader 
        title={t('appName')} 
        subtitle={today}
      />

      <div className="p-4 space-y-6">
        {/* Today's Stats */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {t('todayAttendance')}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              title={t('totalWorkers')}
              value={todayStats.total}
              icon={Users}
              variant="primary"
            />
            <StatCard
              title={t('present')}
              value={todayStats.present}
              icon={Clock}
              variant="success"
            />
            <StatCard
              title={t('halfDay')}
              value={todayStats.halfDay}
              icon={Calendar}
              variant="warning"
            />
            <StatCard
              title={t('absent')}
              value={todayStats.absent}
              icon={Users}
              variant="default"
            />
          </div>
        </section>

        {/* Quick Actions */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {t('quickActions')}
          </h2>
          <div className="space-y-2">
            <ActionCard
              title={t('todayQRCode')}
              description={t('scanQRForAttendance')}
              icon={QrCode}
              variant="primary"
              onClick={() => setShowQR(true)}
            />
            <ActionCard
              title={t('markAttendance')}
              description={t('manualAttendance')}
              icon={Clock}
              onClick={() => navigate('/attendance')}
            />
            <ActionCard
              title={t('advancePayment')}
              description={t('recordAdvance')}
              icon={IndianRupee}
              onClick={() => navigate('/payments')}
            />
          </div>
        </section>

        {/* Recent Activity */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {t('workersSection')}
            </h2>
            <button 
              onClick={() => navigate('/workers')}
              className="text-xs font-medium text-primary hover:underline"
            >
              {t('viewAll')}
            </button>
          </div>

          {workers.length === 0 ? (
            <div className="p-8 text-center bg-card rounded-xl border border-border">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                {t('noWorkersYet')}
              </p>
              <button
                onClick={() => navigate('/workers')}
                className="mt-3 text-sm font-medium text-primary hover:underline"
              >
                {t('addWorker')}
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {workers.slice(0, 3).map((worker) => (
                <div
                  key={worker.id}
                  className="flex items-center justify-between p-3 bg-card rounded-xl border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">
                        {worker.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground">{worker.name}</p>
                      <p className="text-xs text-muted-foreground">₹{worker.dailyRate}/day</p>
                    </div>
                  </div>
                  <TrendingUp className="w-4 h-4 text-success" />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 z-50 animate-fade-in">
          <div 
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
            onClick={() => setShowQR(false)}
          />
          <div className="absolute inset-4 top-20 bg-background rounded-2xl shadow-elevated max-w-lg mx-auto overflow-hidden animate-scale-in">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold">{t('todayQRCode')}</h2>
              <button
                onClick={() => setShowQR(false)}
                className="p-2 -mr-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
              >
                ✕
              </button>
            </div>
            <QRCodeDisplay 
              qrCode={dailyQR}
              onGenerate={generateDailyQR}
              isValid={isQRValid()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
