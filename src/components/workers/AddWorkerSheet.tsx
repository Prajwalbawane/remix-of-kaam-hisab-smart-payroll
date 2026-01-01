import { useState } from 'react';
import { X, User, Briefcase, IndianRupee, Phone } from 'lucide-react';
import { WORK_TYPES, WorkType } from '@/types';
import { cn } from '@/lib/utils';

interface AddWorkerSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (worker: { name: string; workType: string; dailyRate: number; phone?: string }) => void;
}

export function AddWorkerSheet({ isOpen, onClose, onAdd }: AddWorkerSheetProps) {
  const [name, setName] = useState('');
  const [workType, setWorkType] = useState<WorkType>('construction');
  const [dailyRate, setDailyRate] = useState('500');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    onAdd({
      name: name.trim(),
      workType,
      dailyRate: parseInt(dailyRate) || 500,
      phone: phone.trim() || undefined,
    });
    
    // Reset form
    setName('');
    setWorkType('construction');
    setDailyRate('500');
    setPhone('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div className="absolute bottom-0 left-0 right-0 bg-background rounded-t-2xl shadow-elevated animate-slide-up max-w-lg mx-auto safe-bottom">
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="w-10 h-1 bg-muted rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-4 border-b border-border">
          <h2 className="text-lg font-semibold">नवीन कामगार</h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              नाव
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="कामगाराचे नाव"
              className="w-full px-4 py-3 bg-muted rounded-xl border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              required
            />
          </div>

          {/* Work Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-muted-foreground" />
              काम
            </label>
            <div className="grid grid-cols-3 gap-2">
              {WORK_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setWorkType(type.value)}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-all",
                    workType === type.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {type.labelMr}
                </button>
              ))}
            </div>
          </div>

          {/* Daily Rate */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-muted-foreground" />
              रोजगारी (₹/दिवस)
            </label>
            <input
              type="number"
              value={dailyRate}
              onChange={(e) => setDailyRate(e.target.value)}
              placeholder="500"
              className="w-full px-4 py-3 bg-muted rounded-xl border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              min="0"
            />
          </div>

          {/* Phone (Optional) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              फोन नंबर (optional)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="9876543210"
              className="w-full px-4 py-3 bg-muted rounded-xl border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold text-base shadow-elevated hover:bg-primary/90 transition-all active:scale-[0.99]"
          >
            कामगार जोडा
          </button>
        </form>
      </div>
    </div>
  );
}
