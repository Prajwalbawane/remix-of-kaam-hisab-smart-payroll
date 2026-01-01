import { User, Phone, Briefcase, IndianRupee, ChevronRight } from 'lucide-react';
import { Worker, AttendanceRecord } from '@/types';
import { WORK_TYPES } from '@/types';
import { cn } from '@/lib/utils';

interface WorkerCardProps {
  worker: Worker;
  todayAttendance?: AttendanceRecord;
  stats?: {
    presentDays: number;
    balance: number;
  };
  onClick?: () => void;
  showStats?: boolean;
}

export function WorkerCard({ worker, todayAttendance, stats, onClick, showStats = true }: WorkerCardProps) {
  const workType = WORK_TYPES.find(t => t.value === worker.workType);
  
  const getStatusColor = (status?: AttendanceRecord['status']) => {
    switch (status) {
      case 'present': return 'bg-success text-success-foreground';
      case 'half-day': return 'bg-warning text-warning-foreground';
      case 'absent': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status?: AttendanceRecord['status']) => {
    switch (status) {
      case 'present': return 'हजर';
      case 'half-day': return 'अर्धा दिवस';
      case 'absent': return 'गैरहजर';
      default: return 'Pending';
    }
  };

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-4 bg-card rounded-xl border border-border shadow-card hover:shadow-elevated transition-all active:scale-[0.99] text-left"
    >
      {/* Avatar */}
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        <User className="w-6 h-6 text-primary" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-foreground truncate">{worker.name}</h3>
          <span className={cn(
            "px-2 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0",
            getStatusColor(todayAttendance?.status)
          )}>
            {getStatusLabel(todayAttendance?.status)}
          </span>
        </div>
        
        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Briefcase className="w-3 h-3" />
            {workType?.labelMr || worker.workType}
          </span>
          <span className="flex items-center gap-1">
            <IndianRupee className="w-3 h-3" />
            {worker.dailyRate}/day
          </span>
        </div>

        {showStats && stats && (
          <div className="flex items-center gap-4 mt-2 text-xs">
            <span className="text-success font-medium">
              {stats.presentDays} दिवस
            </span>
            <span className={cn(
              "font-medium",
              stats.balance >= 0 ? "text-success" : "text-destructive"
            )}>
              ₹{Math.abs(stats.balance).toLocaleString('en-IN')} {stats.balance < 0 ? 'देणे' : 'बाकी'}
            </span>
          </div>
        )}
      </div>

      <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
    </button>
  );
}
