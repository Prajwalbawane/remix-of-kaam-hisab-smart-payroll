import { cn } from '@/lib/utils';
import { LucideIcon, ChevronRight } from 'lucide-react';

interface ActionCardProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  onClick?: () => void;
  variant?: 'default' | 'primary' | 'accent';
  showArrow?: boolean;
  className?: string;
}

const variantStyles = {
  default: 'bg-card hover:bg-muted/50',
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  accent: 'bg-accent text-accent-foreground hover:bg-accent/90',
};

const iconBgStyles = {
  default: 'bg-muted',
  primary: 'bg-primary-foreground/20',
  accent: 'bg-accent-foreground/20',
};

export function ActionCard({ 
  title, 
  description, 
  icon: Icon, 
  onClick,
  variant = 'default',
  showArrow = true,
  className 
}: ActionCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-4 rounded-xl border border-border shadow-card transition-all active:scale-[0.98]",
        variantStyles[variant],
        className
      )}
    >
      <div className={cn("p-2.5 rounded-lg", iconBgStyles[variant])}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 text-left">
        <p className="font-medium text-sm">{title}</p>
        {description && (
          <p className={cn(
            "text-xs mt-0.5",
            variant === 'default' ? 'text-muted-foreground' : 'opacity-80'
          )}>
            {description}
          </p>
        )}
      </div>
      {showArrow && (
        <ChevronRight className={cn(
          "w-5 h-5",
          variant === 'default' ? 'text-muted-foreground' : 'opacity-70'
        )} />
      )}
    </button>
  );
}
