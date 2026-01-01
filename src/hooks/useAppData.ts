import { useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { Worker, AttendanceRecord, PaymentRecord, DailyQRCode } from '@/types';

const generateId = () => Math.random().toString(36).substring(2, 15);
const generateQRId = () => `WKR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

export function useAppData() {
  const [workers, setWorkers] = useLocalStorage<Worker[]>('kaam-hisab-workers', []);
  const [attendance, setAttendance] = useLocalStorage<AttendanceRecord[]>('kaam-hisab-attendance', []);
  const [payments, setPayments] = useLocalStorage<PaymentRecord[]>('kaam-hisab-payments', []);
  const [dailyQR, setDailyQR] = useLocalStorage<DailyQRCode | null>('kaam-hisab-daily-qr', null);
  const [userRole, setUserRole] = useLocalStorage<'owner' | 'worker'>('kaam-hisab-role', 'owner');

  // Worker operations
  const addWorker = (worker: Omit<Worker, 'id' | 'createdAt' | 'qrId'>) => {
    const newWorker: Worker = {
      ...worker,
      id: generateId(),
      qrId: generateQRId(),
      createdAt: new Date(),
    };
    setWorkers(prev => [...prev, newWorker]);
    return newWorker;
  };

  const updateWorker = (id: string, updates: Partial<Worker>) => {
    setWorkers(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
  };

  const deleteWorker = (id: string) => {
    setWorkers(prev => prev.filter(w => w.id !== id));
  };

  // Attendance operations
  const markAttendance = (workerId: string, status: AttendanceRecord['status'], markedVia: 'qr' | 'manual' = 'manual') => {
    const today = new Date().toISOString().split('T')[0];
    const existing = attendance.find(a => a.workerId === workerId && a.date === today);
    
    if (existing) {
      setAttendance(prev => prev.map(a => 
        a.id === existing.id ? { ...a, status, markedAt: new Date() } : a
      ));
    } else {
      const newRecord: AttendanceRecord = {
        id: generateId(),
        workerId,
        date: today,
        status,
        markedAt: new Date(),
        markedVia,
      };
      setAttendance(prev => [...prev, newRecord]);
    }
  };

  const getWorkerAttendance = (workerId: string, startDate?: string, endDate?: string) => {
    return attendance.filter(a => {
      if (a.workerId !== workerId) return false;
      if (startDate && a.date < startDate) return false;
      if (endDate && a.date > endDate) return false;
      return true;
    });
  };

  const getTodayAttendance = () => {
    const today = new Date().toISOString().split('T')[0];
    return attendance.filter(a => a.date === today);
  };

  // Payment operations
  const addPayment = (payment: Omit<PaymentRecord, 'id' | 'createdAt'>) => {
    const newPayment: PaymentRecord = {
      ...payment,
      id: generateId(),
      createdAt: new Date(),
    };
    setPayments(prev => [...prev, newPayment]);
    return newPayment;
  };

  const getWorkerPayments = (workerId: string) => {
    return payments.filter(p => p.workerId === workerId);
  };

  // QR Code operations
  const generateDailyQR = () => {
    const today = new Date();
    const validFrom = new Date(today);
    validFrom.setHours(7, 0, 0, 0);
    
    const validUntil = new Date(today);
    validUntil.setHours(11, 0, 0, 0);

    const newQR: DailyQRCode = {
      code: `KAAM-${today.toISOString().split('T')[0]}-${generateId()}`,
      date: today.toISOString().split('T')[0],
      validFrom,
      validUntil,
      createdAt: today,
    };
    
    setDailyQR(newQR);
    return newQR;
  };

  const isQRValid = () => {
    if (!dailyQR) return false;
    const today = new Date().toISOString().split('T')[0];
    return dailyQR.date === today;
  };

  const markAttendanceViaQR = (workerQrId: string) => {
    const worker = workers.find(w => w.qrId === workerQrId);
    if (!worker) return { success: false, message: 'Worker not found' };
    
    const today = new Date().toISOString().split('T')[0];
    const existing = attendance.find(a => a.workerId === worker.id && a.date === today);
    
    if (existing) {
      return { success: false, message: 'Attendance already marked', worker };
    }
    
    markAttendance(worker.id, 'present', 'qr');
    return { success: true, message: 'Attendance marked successfully', worker };
  };

  // Calculate worker stats
  const getWorkerStats = (workerId: string) => {
    const worker = workers.find(w => w.id === workerId);
    if (!worker) return null;

    const workerAttendance = getWorkerAttendance(workerId);
    const workerPayments = getWorkerPayments(workerId);
    
    const presentDays = workerAttendance.filter(a => a.status === 'present').length;
    const halfDays = workerAttendance.filter(a => a.status === 'half-day').length;
    
    const totalEarnings = (presentDays * worker.dailyRate) + (halfDays * worker.dailyRate * 0.5);
    const totalAdvances = workerPayments.filter(p => p.type === 'advance').reduce((sum, p) => sum + p.amount, 0);
    const totalPaid = workerPayments.filter(p => p.type === 'payment').reduce((sum, p) => sum + p.amount, 0);
    const balance = totalEarnings - totalAdvances - totalPaid;

    return {
      presentDays,
      halfDays,
      totalEarnings,
      totalAdvances,
      totalPaid,
      balance,
    };
  };

  // Summary stats
  const todayStats = useMemo(() => {
    const todayAttendance = getTodayAttendance();
    return {
      present: todayAttendance.filter(a => a.status === 'present').length,
      absent: workers.length - todayAttendance.length,
      halfDay: todayAttendance.filter(a => a.status === 'half-day').length,
      total: workers.length,
    };
  }, [attendance, workers]);

  return {
    // Data
    workers,
    attendance,
    payments,
    dailyQR,
    userRole,
    todayStats,
    
    // Worker operations
    addWorker,
    updateWorker,
    deleteWorker,
    
    // Attendance operations
    markAttendance,
    getWorkerAttendance,
    getTodayAttendance,
    markAttendanceViaQR,
    
    // Payment operations
    addPayment,
    getWorkerPayments,
    
    // QR operations
    generateDailyQR,
    isQRValid,
    
    // Stats
    getWorkerStats,
    
    // Role
    setUserRole,
  };
}
