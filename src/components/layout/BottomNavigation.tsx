import { Home, QrCode, FileText, Settings, Users } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export function BottomNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isOwner } = useAuth();

  // Different nav items based on role
  const ownerNavItems = [
    { path: '/', icon: Home, labelKey: 'home' as const },
    { path: '/workers', icon: Users, labelKey: 'workers' as const },
    { path: '/scan', icon: QrCode, labelKey: 'scan' as const },
    { path: '/reports', icon: FileText, labelKey: 'reports' as const },
    { path: '/settings', icon: Settings, labelKey: 'settings' as const },
  ];

  const workerNavItems = [
    { path: '/', icon: Home, labelKey: 'home' as const },
    { path: '/scan', icon: QrCode, labelKey: 'scan' as const },
    { path: '/settings', icon: Settings, labelKey: 'settings' as const },
  ];

  const navItems = isOwner ? ownerNavItems : workerNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-bottom z-50">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-0.5 transition-colors",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-lg transition-colors",
                isActive && "bg-primary/10"
              )}>
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-medium">{t(item.labelKey)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
