import { useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { toast } from '@/hooks/use-toast';

interface ReminderSettings {
  enabled: boolean;
  time: string; // HH:MM format
  lastShown: string | null; // Date string
}

export function useReminders() {
  const [settings, setSettings] = useLocalStorage<ReminderSettings>('kaam-hisab-reminders', {
    enabled: false,
    time: '07:00',
    lastShown: null,
  });

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      toast({
        title: 'Notifications not supported',
        description: 'Your browser does not support notifications',
        variant: 'destructive',
      });
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }, []);

  const enableReminders = useCallback(async () => {
    const hasPermission = await requestPermission();
    if (hasPermission) {
      setSettings(prev => ({ ...prev, enabled: true }));
      toast({
        title: 'Reminders enabled',
        description: `You'll receive daily reminders at ${settings.time}`,
      });
      return true;
    }
    return false;
  }, [requestPermission, settings.time, setSettings]);

  const disableReminders = useCallback(() => {
    setSettings(prev => ({ ...prev, enabled: false }));
    toast({
      title: 'Reminders disabled',
      description: 'Daily reminders have been turned off',
    });
  }, [setSettings]);

  const setReminderTime = useCallback((time: string) => {
    setSettings(prev => ({ ...prev, time }));
  }, [setSettings]);

  const showNotification = useCallback((title: string, body: string) => {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'kaam-hisab-reminder',
        requireInteraction: true,
      });
    }
  }, []);

  // Check for reminder time
  useEffect(() => {
    if (!settings.enabled) return;

    const checkReminder = () => {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const currentTime = now.toTimeString().slice(0, 5);

      // Check if it's time for reminder and we haven't shown it today
      if (currentTime === settings.time && settings.lastShown !== today) {
        showNotification(
          'काम हिशाब - हजेरी Reminder',
          'आजची हजेरी भरायला विसरू नका! Tap to mark attendance.'
        );
        setSettings(prev => ({ ...prev, lastShown: today }));
      }
    };

    // Check every minute
    const interval = setInterval(checkReminder, 60000);
    checkReminder(); // Check immediately

    return () => clearInterval(interval);
  }, [settings.enabled, settings.time, settings.lastShown, showNotification, setSettings]);

  return {
    settings,
    enableReminders,
    disableReminders,
    setReminderTime,
    requestPermission,
    showNotification,
  };
}
