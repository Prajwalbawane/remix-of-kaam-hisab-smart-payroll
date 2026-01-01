import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Bell, Shield, HelpCircle, Info, ChevronRight, Trash2, Clock, BellRing, BellOff, Check, LogOut } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useApiData } from '@/hooks/useApiData';
import { useReminders } from '@/hooks/useReminders';
import { useLanguage, Language } from '@/hooks/useLanguage';
import { useApiAuth } from '@/hooks/useApiAuth';
import { cn } from '@/lib/utils';

interface SettingItemProps {
  icon: React.ElementType;
  title: string;
  description?: string;
  onClick?: () => void;
  trailing?: React.ReactNode;
  variant?: 'default' | 'destructive';
}

function SettingItem({ icon: Icon, title, description, onClick, trailing, variant = 'default' }: SettingItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-4 bg-card rounded-xl border border-border hover:bg-muted/50 transition-colors text-left",
        variant === 'destructive' && "border-destructive/20 hover:bg-destructive/5"
      )}
    >
      <div className={cn(
        "p-2 rounded-lg",
        variant === 'destructive' ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
      )}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <p className={cn(
          "font-medium text-sm",
          variant === 'destructive' ? "text-destructive" : "text-foreground"
        )}>
          {title}
        </p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      {trailing || <ChevronRight className="w-5 h-5 text-muted-foreground" />}
    </button>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { workers } = useApiData();
  const { settings: reminderSettings, enableReminders, disableReminders, setReminderTime, showNotification } = useReminders();
  const { language, setLanguage, t, languageNames, languageNamesNative, availableLanguages } = useLanguage();
  const { user, logout, isOwner } = useApiAuth();
  const [showTimeSelector, setShowTimeSelector] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const timeOptions = [
    { value: '06:00', label: '6:00 AM' },
    { value: '06:30', label: '6:30 AM' },
    { value: '07:00', label: '7:00 AM' },
    { value: '07:30', label: '7:30 AM' },
    { value: '08:00', label: '8:00 AM' },
    { value: '08:30', label: '8:30 AM' },
    { value: '09:00', label: '9:00 AM' },
  ];

  const handleReminderToggle = async () => {
    if (reminderSettings.enabled) {
      disableReminders();
    } else {
      await enableReminders();
    }
  };

  const handleTestReminder = () => {
    showNotification(
      `${t('appName')} - Test Reminder`,
      'This is a test notification. Daily reminders are working!'
    );
  };

  return (
    <div className="min-h-screen">
      <PageHeader 
        title={t('settings')} 
        subtitle={languageNames[language]}
      />

      <div className="p-4 space-y-6">
      {/* User Info & Logout */}
        <section className="space-y-3">
          <div className="p-4 bg-card rounded-xl border border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-semibold text-primary">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-foreground">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {isOwner ? t('owner') : t('worker')}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-destructive bg-destructive/10 rounded-lg hover:bg-destructive/20 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">{t('logout')}</span>
              </button>
            </div>
          </div>
        </section>

        {/* Daily Reminders */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {t('dailyReminders')}
          </h2>
          
          <div className="p-4 bg-card rounded-xl border border-border space-y-4">
            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  reminderSettings.enabled ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                )}>
                  {reminderSettings.enabled ? (
                    <BellRing className="w-5 h-5" />
                  ) : (
                    <BellOff className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm text-foreground">{t('dailyAttendanceReminder')}</p>
                  <p className="text-xs text-muted-foreground">
                    {reminderSettings.enabled ? t('remindersActive') : t('remindersOff')}
                  </p>
                </div>
              </div>
              <button
                onClick={handleReminderToggle}
                className={cn(
                  "relative w-12 h-7 rounded-full transition-colors",
                  reminderSettings.enabled ? "bg-success" : "bg-muted"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform",
                  reminderSettings.enabled ? "translate-x-6" : "translate-x-1"
                )} />
              </button>
            </div>

            {/* Time Selector */}
            {reminderSettings.enabled && (
              <>
                <div className="pt-3 border-t border-border">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {t('reminderTime')}
                    </p>
                    <button
                      onClick={() => setShowTimeSelector(!showTimeSelector)}
                      className="text-sm font-medium text-primary"
                    >
                      {timeOptions.find(opt => opt.value === reminderSettings.time)?.label || reminderSettings.time}
                    </button>
                  </div>
                  
                  {showTimeSelector && (
                    <div className="grid grid-cols-4 gap-2 mt-3 animate-fade-in">
                      {timeOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setReminderTime(option.value);
                            setShowTimeSelector(false);
                          }}
                          className={cn(
                            "py-2 rounded-lg text-xs font-medium transition-all",
                            reminderSettings.time === option.value
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Test Button */}
                <button
                  onClick={handleTestReminder}
                  className="w-full py-2 text-sm font-medium text-primary border border-primary/20 rounded-lg hover:bg-primary/5 transition-colors"
                >
                  {t('testNotification')}
                </button>
              </>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            {t('reminderDescription')}
          </p>
        </section>

        {/* Language Selection */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {t('general')}
          </h2>
          <div className="space-y-2">
            <div className="p-4 bg-card rounded-xl border border-border">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setShowLanguageSelector(!showLanguageSelector)}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">{t('language')}</p>
                    <p className="text-xs text-muted-foreground">{languageNames[language]}</p>
                  </div>
                </div>
                <ChevronRight className={cn(
                  "w-5 h-5 text-muted-foreground transition-transform",
                  showLanguageSelector && "rotate-90"
                )} />
              </div>
              
              {showLanguageSelector && (
                <div className="mt-4 pt-4 border-t border-border space-y-2 animate-fade-in">
                  {availableLanguages.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setLanguage(lang);
                        setShowLanguageSelector(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between p-3 rounded-lg transition-colors",
                        language === lang 
                          ? "bg-primary/10 text-primary" 
                          : "bg-muted/50 text-foreground hover:bg-muted"
                      )}
                    >
                      <span className="text-sm font-medium">{languageNamesNative[lang]}</span>
                      {language === lang && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <SettingItem
              icon={Bell}
              title={t('notifications')}
              description={t('remindersAlerts')}
            />
          </div>
        </section>

        {/* Data & Privacy */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {t('dataPrivacy')}
          </h2>
          <div className="space-y-2">
            <SettingItem
              icon={Shield}
              title={t('dataBackup')}
              description={t('exportData')}
            />
            <SettingItem
              icon={Trash2}
              title={t('deleteAllData')}
              description={t('removeAllRecords')}
              variant="destructive"
            />
          </div>
        </section>

        {/* Help */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {t('helpInfo')}
          </h2>
          <div className="space-y-2">
            <SettingItem
              icon={HelpCircle}
              title={t('howToUse')}
              description={t('guideFAQ')}
            />
            <SettingItem
              icon={Info}
              title={t('about')}
              description="Version 1.0.0"
            />
          </div>
        </section>

        {/* Stats */}
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
          <h3 className="font-semibold text-sm text-foreground mb-3">{t('appStats')}</h3>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{workers.length}</p>
              <p className="text-xs text-muted-foreground">{t('workers')}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-success">100%</p>
              <p className="text-xs text-muted-foreground">{t('offlineReady')}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-4">
          <p className="text-xs text-muted-foreground">
            {t('madeWithLove')}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">
            {t('appName')} v1.0.0
          </p>
        </div>
      </div>
    </div>
  );
}
