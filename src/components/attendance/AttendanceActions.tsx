import { Check, Clock, X } from 'lucide-react';
import { AttendanceRecord } from '@/types';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';

interface AttendanceActionsProps {
  currentStatus?: AttendanceRecord['status'];
  onMark: (status: AttendanceRecord['status']) => void;
}

export function AttendanceActions({ currentStatus, onMark }: AttendanceActionsProps) {
  const { t } = useLanguage();

  const actions = [
    { 
      status: 'present' as const, 
      label: t('markPresent'),
      icon: Check,
      color: 'bg-success text-success-foreground hover:bg-success/90',
      inactiveColor: 'bg-success/10 text-success border-success/30',
    },
    { 
      status: 'half-day' as const, 
      label: t('markHalfDay'),
      icon: Clock,
      color: 'bg-warning text-warning-foreground hover:bg-warning/90',
      inactiveColor: 'bg-warning/10 text-warning border-warning/30',
    },
    { 
      status: 'absent' as const, 
      label: t('markAbsent'),
      icon: X,
      color: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      inactiveColor: 'bg-destructive/10 text-destructive border-destructive/30',
    },
  ];

  return (
    <div className="flex gap-2">
      {actions.map((action) => {
        const Icon = action.icon;
        const isActive = currentStatus === action.status;
        
        return (
          <button
            key={action.status}
            onClick={() => onMark(action.status)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium transition-all active:scale-[0.97] border",
              isActive ? action.color : action.inactiveColor
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {action.label}
          </button>
        );
      })}
    </div>
  );
}
