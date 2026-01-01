import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Phone, Briefcase, IndianRupee, Calendar, Plus, Trash2, QrCode, Download, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/ui/stat-card';
import { AttendanceActions } from '@/components/attendance/AttendanceActions';
import { useApiData } from '@/hooks/useApiData';
import { generateWorkerPDFReport } from '@/utils/pdfExport';
import { WORK_TYPES } from '@/types';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function WorkerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    workers, 
    attendance, 
    payments,
    getWorkerStats, 
    getWorkerAttendance,
    getWorkerPayments,
    markAttendance,
    addPayment,
    deleteWorker,
    isLoading,
  } = useApiData();

  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentType, setPaymentType] = useState<'advance' | 'payment'>('advance');
  const [paymentNote, setPaymentNote] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const worker = workers.find(w => w.id === id);
  if (!worker) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Worker not found</p>
      </div>
    );
  }

  const stats = getWorkerStats(worker.id);
  const workerAttendance = getWorkerAttendance(worker.id);
  const workerPayments = getWorkerPayments(worker.id);
  const workType = WORK_TYPES.find(t => t.value === worker.workType);
  
  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.find(a => a.workerId === worker.id && a.date === today);

  const handleAddPayment = () => {
    if (!paymentAmount) return;
    
    addPayment({
      workerId: worker.id,
      amount: parseInt(paymentAmount),
      type: paymentType,
      date: today,
      note: paymentNote || undefined,
    });
    
    setPaymentAmount('');
    setPaymentNote('');
    setShowPaymentForm(false);
    
    toast({
      title: paymentType === 'advance' ? 'Advance Added' : 'Payment Recorded',
      description: `₹${parseInt(paymentAmount).toLocaleString('en-IN')} ${paymentType} recorded`,
    });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this worker?')) {
      deleteWorker(worker.id);
      navigate('/workers');
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const fileName = generateWorkerPDFReport(
        worker,
        workerAttendance,
        workerPayments,
        stats
      );
      
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
    <div className="min-h-screen pb-24">
      <PageHeader 
        title={worker.name}
        showBack
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50"
            >
              {isExporting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={handleDelete}
              className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        }
      />

      <div className="p-4 space-y-6">
        {/* Worker Info Card */}
        <div className="p-4 bg-card rounded-xl border border-border shadow-card">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-foreground">{worker.name}</h2>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  {workType?.labelMr || worker.workType}
                </span>
                <span className="flex items-center gap-1">
                  <IndianRupee className="w-4 h-4" />
                  {worker.dailyRate}/day
                </span>
              </div>
              {worker.phone && (
                <p className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  {worker.phone}
                </p>
              )}
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <QrCode className="w-3 h-3" />
                ID: {worker.qrId}
              </div>
            </div>
          </div>
        </div>

        {/* Today's Attendance */}
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            आजची हजेरी
          </h3>
          <div className="p-4 bg-card rounded-xl border border-border shadow-card">
            <AttendanceActions
              currentStatus={todayAttendance?.status}
              onMark={(status) => markAttendance(worker.id, status)}
            />
            {todayAttendance && (
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Marked via {todayAttendance.markedVia} at{' '}
                {new Date(todayAttendance.markedAt).toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            )}
          </div>
        </section>

        {/* Stats */}
        {stats && (
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Summary
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                title="Total Days"
                value={stats.presentDays + (stats.halfDays * 0.5)}
                icon={Calendar}
                variant="primary"
              />
              <StatCard
                title="Total Earnings"
                value={`₹${stats.totalEarnings.toLocaleString('en-IN')}`}
                icon={IndianRupee}
                variant="success"
              />
              <StatCard
                title="Advances"
                value={`₹${stats.totalAdvances.toLocaleString('en-IN')}`}
                icon={IndianRupee}
                variant="warning"
              />
              <StatCard
                title="Balance"
                value={`₹${Math.abs(stats.balance).toLocaleString('en-IN')}`}
                icon={IndianRupee}
                variant={stats.balance >= 0 ? 'success' : 'default'}
              />
            </div>
          </section>
        )}

        {/* Payment Form */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Payments & Advances
            </h3>
            <button
              onClick={() => setShowPaymentForm(!showPaymentForm)}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <Plus className="w-3 h-3" />
              Add
            </button>
          </div>

          {showPaymentForm && (
            <div className="p-4 bg-card rounded-xl border border-border shadow-card space-y-3 animate-slide-up">
              <div className="flex gap-2">
                <button
                  onClick={() => setPaymentType('advance')}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
                    paymentType === 'advance'
                      ? "bg-warning text-warning-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  Advance
                </button>
                <button
                  onClick={() => setPaymentType('payment')}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
                    paymentType === 'payment'
                      ? "bg-success text-success-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  Payment
                </button>
              </div>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Amount (₹)"
                className="w-full px-4 py-3 bg-muted rounded-xl border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <input
                type="text"
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                placeholder="Note (optional)"
                className="w-full px-4 py-3 bg-muted rounded-xl border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                onClick={handleAddPayment}
                className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium text-sm hover:bg-primary/90 transition-all"
              >
                Add {paymentType === 'advance' ? 'Advance' : 'Payment'}
              </button>
            </div>
          )}

          {/* Payment History */}
          {workerPayments.length > 0 ? (
            <div className="space-y-2">
              {workerPayments.slice(-5).reverse().map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 bg-card rounded-xl border border-border"
                >
                  <div>
                    <p className={cn(
                      "font-medium text-sm",
                      payment.type === 'advance' ? "text-warning" : "text-success"
                    )}>
                      {payment.type === 'advance' ? 'Advance' : 'Payment'}
                    </p>
                    <p className="text-xs text-muted-foreground">{payment.date}</p>
                  </div>
                  <p className="font-semibold">₹{payment.amount.toLocaleString('en-IN')}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No payments yet
            </p>
          )}
        </section>

        {/* Attendance History */}
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Attendance History
          </h3>
          {workerAttendance.length > 0 ? (
            <div className="space-y-2">
              {workerAttendance.slice(-7).reverse().map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-3 bg-card rounded-xl border border-border"
                >
                  <div>
                    <p className="font-medium text-sm text-foreground">
                      {new Date(record.date).toLocaleDateString('en-IN', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      via {record.markedVia}
                    </p>
                  </div>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium",
                    record.status === 'present' && "bg-success/10 text-success",
                    record.status === 'half-day' && "bg-warning/10 text-warning",
                    record.status === 'absent' && "bg-destructive/10 text-destructive"
                  )}>
                    {record.status === 'present' ? 'हजर' : record.status === 'half-day' ? 'अर्धा' : 'गैरहजर'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No attendance records
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
