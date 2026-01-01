import { useState } from 'react';
import { IndianRupee, Plus, Loader2, ArrowUpRight, ArrowDownLeft, Search } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useApiData } from '@/hooks/useApiData';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function PaymentsPage() {
  const { workers, payments, addPayment, isLoading } = useApiData();
  const { t, language } = useLanguage();
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('');
  const [paymentType, setPaymentType] = useState<'advance' | 'payment'>('advance');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const locale = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-IN';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleAddPayment = () => {
    if (!selectedWorkerId || !amount) return;
    
    addPayment({
      workerId: selectedWorkerId,
      amount: parseFloat(amount),
      type: paymentType,
      note: note || undefined,
      date: new Date().toISOString().split('T')[0],
    });
    
    setShowAddPayment(false);
    setSelectedWorkerId('');
    setAmount('');
    setNote('');
  };

  // Get recent payments sorted by date
  const recentPayments = [...payments]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 20);

  const getWorkerName = (workerId: string) => {
    return workers.find(w => w.id === workerId)?.name || 'Unknown';
  };

  // Calculate totals
  const totalAdvances = payments.filter(p => p.type === 'advance').reduce((sum, p) => sum + p.amount, 0);
  const totalPayments = payments.filter(p => p.type === 'payment').reduce((sum, p) => sum + p.amount, 0);

  const filteredWorkers = workers.filter(w => 
    w.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <PageHeader 
        title={t('advancePayment')} 
        subtitle={t('recordAdvance')}
        showBack
      />

      <div className="p-4 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-warning/10 border border-warning/20 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <ArrowUpRight className="w-4 h-4 text-warning" />
              <span className="text-xs font-medium text-warning">{t('advance')}</span>
            </div>
            <p className="text-xl font-bold text-foreground">₹{totalAdvances.toLocaleString(locale)}</p>
          </div>
          <div className="p-4 bg-success/10 border border-success/20 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <ArrowDownLeft className="w-4 h-4 text-success" />
              <span className="text-xs font-medium text-success">{t('payment')}</span>
            </div>
            <p className="text-xl font-bold text-foreground">₹{totalPayments.toLocaleString(locale)}</p>
          </div>
        </div>

        {/* Add Payment Button */}
        <Button
          onClick={() => setShowAddPayment(true)}
          className="w-full flex items-center justify-center gap-2 py-6"
        >
          <Plus className="w-5 h-5" />
          {t('addPayment')}
        </Button>

        {/* Recent Payments */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {t('payments')}
          </h2>

          {recentPayments.length === 0 ? (
            <div className="p-12 text-center bg-card rounded-xl border border-border">
              <IndianRupee className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-foreground font-medium mb-1">{t('noPaymentRecords')}</p>
              <p className="text-sm text-muted-foreground">
                {t('recordAdvance')}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 bg-card rounded-xl border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      payment.type === 'advance' ? "bg-warning/10" : "bg-success/10"
                    )}>
                      {payment.type === 'advance' ? (
                        <ArrowUpRight className="w-5 h-5 text-warning" />
                      ) : (
                        <ArrowDownLeft className="w-5 h-5 text-success" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground">
                        {getWorkerName(payment.workerId)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(payment.date).toLocaleDateString(locale, {
                          day: 'numeric',
                          month: 'short',
                        })}
                        {payment.note && ` • ${payment.note}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "font-semibold",
                      payment.type === 'advance' ? "text-warning" : "text-success"
                    )}>
                      {payment.type === 'advance' ? '-' : '+'}₹{payment.amount.toLocaleString(locale)}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase">
                      {payment.type === 'advance' ? t('advance') : t('payment')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Add Payment Dialog */}
      <Dialog open={showAddPayment} onOpenChange={setShowAddPayment}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('addPayment')}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            {/* Worker Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {t('workers')}
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t('searchWorkers')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="max-h-40 overflow-y-auto space-y-1 border border-border rounded-lg p-2">
                {filteredWorkers.map((worker) => (
                  <button
                    key={worker.id}
                    onClick={() => setSelectedWorkerId(worker.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left",
                      selectedWorkerId === worker.id
                        ? "bg-primary/10 border border-primary/20"
                        : "hover:bg-muted"
                    )}
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-semibold text-primary">
                        {worker.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground">{worker.name}</p>
                      <p className="text-xs text-muted-foreground">₹{worker.dailyRate}/{t('day')}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {t('payment')} {t('workType')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPaymentType('advance')}
                  className={cn(
                    "p-3 rounded-xl border-2 transition-all text-center",
                    paymentType === 'advance'
                      ? "border-warning bg-warning/10 text-warning"
                      : "border-border bg-card text-muted-foreground hover:border-warning/50"
                  )}
                >
                  <ArrowUpRight className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm font-medium">{t('advance')}</span>
                </button>
                <button
                  onClick={() => setPaymentType('payment')}
                  className={cn(
                    "p-3 rounded-xl border-2 transition-all text-center",
                    paymentType === 'payment'
                      ? "border-success bg-success/10 text-success"
                      : "border-border bg-card text-muted-foreground hover:border-success/50"
                  )}
                >
                  <ArrowDownLeft className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm font-medium">{t('payment')}</span>
                </button>
              </div>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {t('amount')}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                <Input
                  type="number"
                  placeholder={t('enterAmount')}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Note */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {t('note')} <span className="text-muted-foreground">({t('optional')})</span>
              </label>
              <Input
                placeholder={t('note')}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowAddPayment(false)}
                className="flex-1"
              >
                {t('cancel')}
              </Button>
              <Button
                onClick={handleAddPayment}
                disabled={!selectedWorkerId || !amount}
                className="flex-1"
              >
                {t('save')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
