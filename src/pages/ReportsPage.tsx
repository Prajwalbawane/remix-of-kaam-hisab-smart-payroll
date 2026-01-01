import { useState } from 'react';
import { Calendar, IndianRupee, Users, TrendingUp, Download, FileText, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/ui/stat-card';
import { useApiData } from '@/hooks/useApiData';
import { useLanguage } from '@/hooks/useLanguage';
import { generatePDFReport } from '@/utils/pdfExport';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type ReportPeriod = 'week' | 'month';

export default function ReportsPage() {
  const [period, setPeriod] = useState<ReportPeriod>('week');
  const [isExporting, setIsExporting] = useState(false);
  const { workers, attendance, payments, getWorkerStats, isLoading } = useApiData();
  const { t } = useLanguage();

  // Calculate totals
  const totalEarnings = workers.reduce((sum, w) => {
    const stats = getWorkerStats(w.id);
    return sum + (stats?.totalEarnings || 0);
  }, 0);

  const totalAdvances = workers.reduce((sum, w) => {
    const stats = getWorkerStats(w.id);
    return sum + (stats?.totalAdvances || 0);
  }, 0);

  const totalPaid = workers.reduce((sum, w) => {
    const stats = getWorkerStats(w.id);
    return sum + (stats?.totalPaid || 0);
  }, 0);

  const totalBalance = totalEarnings - totalAdvances - totalPaid;

  const totalPresentDays = attendance.filter(a => a.status === 'present').length;
  const totalHalfDays = attendance.filter(a => a.status === 'half-day').length;
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleExportPDF = async () => {
    if (workers.length === 0) {
      toast({
        title: t('noDataAvailable'),
        description: t('addWorker'),
        variant: 'destructive',
      });
      return;
    }

    setIsExporting(true);
    try {
      const fileName = generatePDFReport({
        workers,
        attendance,
        payments,
        getWorkerStats,
      }, period);
      
      toast({
        title: 'Report Downloaded',
        description: `${fileName} has been saved`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export Failed',
        description: 'Could not generate PDF report',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <PageHeader 
        title={t('reports')} 
        subtitle={t('summary')}
        action={
          <button 
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            PDF
          </button>
        }
      />

      <div className="p-4 space-y-6">
        {/* Period Toggle */}
        <div className="flex gap-2 p-1 bg-muted rounded-xl">
          <button
            onClick={() => setPeriod('week')}
            className={cn(
              "flex-1 py-2.5 rounded-lg text-sm font-medium transition-all",
              period === 'week' 
                ? "bg-card text-foreground shadow-card" 
                : "text-muted-foreground"
            )}
          >
            {t('thisWeek')}
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={cn(
              "flex-1 py-2.5 rounded-lg text-sm font-medium transition-all",
              period === 'month' 
                ? "bg-card text-foreground shadow-card" 
                : "text-muted-foreground"
            )}
          >
            {t('thisMonth')}
          </button>
        </div>

        {/* Export Info */}
        <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl">
          <FileText className="w-5 h-5 text-primary flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">{t('exportPDF')}</p>
            <p className="text-xs text-muted-foreground">{t('exportData')}</p>
          </div>
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isExporting ? '...' : 'Export'}
          </button>
        </div>

        {/* Summary Stats */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {t('summary')}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              title={t('totalEarnings')}
              value={`₹${totalEarnings.toLocaleString('en-IN')}`}
              icon={TrendingUp}
              variant="success"
            />
            <StatCard
              title={t('advanceGiven')}
              value={`₹${totalAdvances.toLocaleString('en-IN')}`}
              icon={IndianRupee}
              variant="warning"
            />
            <StatCard
              title={t('balanceDue')}
              value={`₹${totalBalance.toLocaleString('en-IN')}`}
              icon={IndianRupee}
              variant={totalBalance >= 0 ? 'primary' : 'default'}
            />
            <StatCard
              title={t('totalDaysWorked')}
              value={totalPresentDays + (totalHalfDays * 0.5)}
              icon={Calendar}
              variant="default"
            />
          </div>
        </section>

        {/* Worker-wise Report */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {t('workerWise')}
          </h2>
          
          {workers.length === 0 ? (
            <div className="p-8 text-center bg-card rounded-xl border border-border">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                {t('noDataAvailable')}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {workers.map((worker) => {
                const stats = getWorkerStats(worker.id);
                if (!stats) return null;
                
                return (
                  <div
                    key={worker.id}
                    className="p-4 bg-card rounded-xl border border-border shadow-card"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {worker.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{worker.name}</p>
                          <p className="text-xs text-muted-foreground">
                            ₹{worker.dailyRate}/day
                          </p>
                        </div>
                      </div>
                      <div className={cn(
                        "text-right",
                        stats.balance >= 0 ? "text-success" : "text-destructive"
                      )}>
                        <p className="text-lg font-bold">
                          ₹{Math.abs(stats.balance).toLocaleString('en-IN')}
                        </p>
                        <p className="text-xs">
                          {stats.balance >= 0 ? t('due') : t('balance')}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 pt-3 border-t border-border">
                      <div className="text-center">
                        <p className="text-lg font-semibold text-foreground">{stats.presentDays}</p>
                        <p className="text-[10px] text-muted-foreground">{t('days')}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold text-success">
                          ₹{(stats.totalEarnings / 1000).toFixed(1)}k
                        </p>
                        <p className="text-[10px] text-muted-foreground">{t('totalEarnings')}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold text-warning">
                          ₹{(stats.totalAdvances / 1000).toFixed(1)}k
                        </p>
                        <p className="text-[10px] text-muted-foreground">{t('advance')}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold text-primary">
                          ₹{(stats.totalPaid / 1000).toFixed(1)}k
                        </p>
                        <p className="text-[10px] text-muted-foreground">{t('payment')}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Ad Banner Placeholder */}
        <div className="p-4 bg-muted/50 rounded-xl border border-dashed border-border text-center">
          <p className="text-xs text-muted-foreground">Advertisement</p>
        </div>
      </div>
    </div>
  );
}
