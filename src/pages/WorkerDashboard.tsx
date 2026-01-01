import { User, Calendar, IndianRupee, Clock, QrCode, LogOut, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/ui/stat-card';
import { useApiAuth } from '@/hooks/useApiAuth';
import { useApiData } from '@/hooks/useApiData';
import { useLanguage } from '@/hooks/useLanguage';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function WorkerDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useApiAuth();
  const { workers, getWorkerStats, getWorkerAttendance, isLoading } = useApiData();
  const { t, language } = useLanguage();

  const worker = workers.find(w => w.id === user?.worker_id);
  const stats = worker ? getWorkerStats(worker.id) : null;
  const recentAttendance = worker ? getWorkerAttendance(worker.id).slice(-7).reverse() : [];

  const locale = language === 'hi' ? 'hi-IN' : 'en-IN';
  const today = new Date().toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-foreground font-medium mb-2">Worker profile not found</p>
          <button
            onClick={handleLogout}
            className="text-primary hover:underline"
          >
            Go back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-6">
      <PageHeader 
        title={t('myDashboard')}
        subtitle={today}
        action={
          <button
            onClick={handleLogout}
            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        }
      />

      <div className="p-4 space-y-6">
        {/* Profile Card */}
        <div className="p-5 bg-card rounded-2xl border border-border shadow-card">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground">{worker.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                ₹{worker.dailyRate} / {t('day')}
              </p>
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <QrCode className="w-3 h-3" />
                ID: {worker.qrId}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {t('mySummary')}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                title={t('daysWorked')}
                value={stats.presentDays + (stats.halfDays * 0.5)}
                icon={Calendar}
                variant="primary"
              />
              <StatCard
                title={t('totalEarnings')}
                value={`₹${stats.totalEarnings.toLocaleString('en-IN')}`}
                icon={IndianRupee}
                variant="success"
              />
              <StatCard
                title={t('advances')}
                value={`₹${stats.totalAdvances.toLocaleString('en-IN')}`}
                icon={IndianRupee}
                variant="warning"
              />
              <StatCard
                title={t('balance')}
                value={`₹${Math.abs(stats.balance).toLocaleString('en-IN')}`}
                icon={IndianRupee}
                variant={stats.balance >= 0 ? 'success' : 'default'}
              />
            </div>
          </section>
        )}

        {/* Recent Attendance */}
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {t('recentAttendance')}
          </h3>
          {recentAttendance.length > 0 ? (
            <div className="space-y-2">
              {recentAttendance.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 bg-card rounded-xl border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      record.status === 'present' && "bg-success/10",
                      record.status === 'half-day' && "bg-warning/10",
                      record.status === 'absent' && "bg-destructive/10"
                    )}>
                      <Clock className={cn(
                        "w-5 h-5",
                        record.status === 'present' && "text-success",
                        record.status === 'half-day' && "text-warning",
                        record.status === 'absent' && "text-destructive"
                      )} />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground">
                        {new Date(record.date).toLocaleDateString(locale, {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        via {record.markedVia}
                      </p>
                    </div>
                  </div>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium",
                    record.status === 'present' && "bg-success/10 text-success",
                    record.status === 'half-day' && "bg-warning/10 text-warning",
                    record.status === 'absent' && "bg-destructive/10 text-destructive"
                  )}>
                    {record.status === 'present' ? t('present') : 
                     record.status === 'half-day' ? t('halfDay') : t('absent')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-card rounded-xl border border-border">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">{t('noAttendanceYet')}</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
