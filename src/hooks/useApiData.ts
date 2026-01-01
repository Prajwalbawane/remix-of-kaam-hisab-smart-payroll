import { useState, useEffect, useCallback, useMemo } from 'react';
import { workersApi, attendanceApi, paymentsApi, healthApi } from '@/services/api';
import { Worker, AttendanceRecord, PaymentRecord, DailyQRCode } from '@/types';
import { useLocalStorage } from './useLocalStorage';

export function useApiData() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  // Local storage fallback
  const [localWorkers, setLocalWorkers] = useLocalStorage<Worker[]>('kaam-hisab-workers', []);
  const [localAttendance, setLocalAttendance] = useLocalStorage<AttendanceRecord[]>('kaam-hisab-attendance', []);
  const [localPayments, setLocalPayments] = useLocalStorage<PaymentRecord[]>('kaam-hisab-payments', []);
  const [dailyQR, setDailyQR] = useLocalStorage<DailyQRCode | null>('kaam-hisab-daily-qr', null);

  // Check if backend is online
  const checkBackendHealth = useCallback(async () => {
    try {
      await healthApi.check();
      setIsOnline(true);
      return true;
    } catch (err) {
      setIsOnline(false);
      return false;
    }
  }, []);

  // Fetch all data on mount
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    const online = await checkBackendHealth();
    
    if (!online) {
      // Use local storage data when offline
      setWorkers(localWorkers);
      setAttendance(localAttendance);
      setPayments(localPayments);
      setIsLoading(false);
      return;
    }

    try {
      const [workersRes, attendanceRes, paymentsRes] = await Promise.all([
        workersApi.getAll(),
        attendanceApi.getAll(),
        paymentsApi.getAll(),
      ]);

      // Handle different response formats
      const workersData = Array.isArray(workersRes) ? workersRes : (workersRes as any).workers || [];
      const attendanceData = Array.isArray(attendanceRes) ? attendanceRes : (attendanceRes as any).attendance || [];
      const paymentsData = Array.isArray(paymentsRes) ? paymentsRes : (paymentsRes as any).payments || [];

      // Transform API data to match our types
      const transformedWorkers = workersData.map((w: any) => ({
        id: w.id.toString(),
        name: w.name,
        phone: w.phone || '',
        workType: w.work_type || 'other',
        dailyRate: parseFloat(w.daily_rate) || 500,
        qrId: w.qr_id || `qr-${w.id}`,
        createdAt: new Date(w.created_at),
      }));

      const transformedAttendance = attendanceData.map((a: any) => ({
        id: a.id.toString(),
        workerId: a.worker_id.toString(),
        date: a.date,
        status: a.status,
        markedAt: new Date(a.marked_at || a.created_at),
        markedVia: a.marked_via || 'manual',
      }));

      const transformedPayments = paymentsData.map((p: any) => ({
        id: p.id.toString(),
        workerId: p.worker_id.toString(),
        amount: parseFloat(p.amount),
        type: p.type,
        date: p.date || new Date().toISOString().split('T')[0],
        note: p.notes || p.note || '',
        createdAt: new Date(p.created_at),
      }));

      setWorkers(transformedWorkers);
      setAttendance(transformedAttendance);
      setPayments(transformedPayments);

      // Also save to local storage for offline access
      setLocalWorkers(transformedWorkers);
      setLocalAttendance(transformedAttendance);
      setLocalPayments(transformedPayments);

    } catch (err: any) {
      setError(err.message);
      console.error('Failed to fetch data:', err);
      // Fall back to local storage on error
      setWorkers(localWorkers);
      setAttendance(localAttendance);
      setPayments(localPayments);
    } finally {
      setIsLoading(false);
    }
  }, [checkBackendHealth, localWorkers, localAttendance, localPayments, setLocalWorkers, setLocalAttendance, setLocalPayments]);

  useEffect(() => {
    fetchData();
  }, []);

  // Helper for generating IDs for offline mode
  const generateId = () => Math.random().toString(36).substring(2, 15);
  const generateQRId = () => `WKR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  // Add worker
  const addWorker = useCallback(async (worker: Omit<Worker, 'id' | 'createdAt' | 'qrId'>) => {
    if (isOnline) {
      try {
        const response = await workersApi.create({
          name: worker.name,
          work_type: worker.workType,
          daily_rate: worker.dailyRate,
          phone: worker.phone,
        });

        const workerData = response.worker || response;
        const newWorker: Worker = {
          id: workerData.id.toString(),
          name: workerData.name,
          phone: workerData.phone || '',
          workType: workerData.work_type || worker.workType,
          dailyRate: parseFloat(workerData.daily_rate) || worker.dailyRate,
          qrId: workerData.qr_id || `qr-${workerData.id}`,
          createdAt: new Date(workerData.created_at),
        };

        setWorkers(prev => [...prev, newWorker]);
        setLocalWorkers(prev => [...prev, newWorker]);
        return newWorker;
      } catch (err: any) {
        console.error('Failed to add worker:', err);
        throw err;
      }
    } else {
      // Offline mode - save to local storage
      const newWorker: Worker = {
        ...worker,
        id: generateId(),
        qrId: generateQRId(),
        createdAt: new Date(),
      };
      setWorkers(prev => [...prev, newWorker]);
      setLocalWorkers(prev => [...prev, newWorker]);
      return newWorker;
    }
  }, [isOnline, setLocalWorkers]);

  // Update worker
  const updateWorker = useCallback(async (id: string, updates: Partial<Worker>) => {
    if (isOnline) {
      try {
        const apiUpdates: any = {};
        if (updates.name) apiUpdates.name = updates.name;
        if (updates.workType) apiUpdates.work_type = updates.workType;
        if (updates.dailyRate) apiUpdates.daily_rate = updates.dailyRate;
        if (updates.phone) apiUpdates.phone = updates.phone;

        await workersApi.update(id, apiUpdates);
      } catch (err: any) {
        console.error('Failed to update worker:', err);
        throw err;
      }
    }

    setWorkers(prev => prev.map(w => (w.id === id ? { ...w, ...updates } : w)));
    setLocalWorkers(prev => prev.map(w => (w.id === id ? { ...w, ...updates } : w)));
  }, [isOnline, setLocalWorkers]);

  // Delete worker
  const deleteWorker = useCallback(async (id: string) => {
    if (isOnline) {
      try {
        await workersApi.delete(id);
      } catch (err: any) {
        console.error('Failed to delete worker:', err);
        throw err;
      }
    }

    setWorkers(prev => prev.filter(w => w.id !== id));
    setLocalWorkers(prev => prev.filter(w => w.id !== id));
  }, [isOnline, setLocalWorkers]);

  // Mark attendance
  const markAttendance = useCallback(async (
    workerId: string,
    status: AttendanceRecord['status'],
    markedVia: 'qr' | 'manual' = 'manual'
  ) => {
    const today = new Date().toISOString().split('T')[0];

    if (isOnline) {
      try {
        const response = await attendanceApi.mark({
          worker_id: workerId,
          date: today,
          status,
          marked_via: markedVia,
        });

        const attendanceData = response.attendance || response;
        const newRecord: AttendanceRecord = {
          id: attendanceData.id.toString(),
          workerId,
          date: today,
          status,
          markedAt: new Date(),
          markedVia,
        };

        setAttendance(prev => {
          const filtered = prev.filter(a => !(a.workerId === workerId && a.date === today));
          return [...filtered, newRecord];
        });
        setLocalAttendance(prev => {
          const filtered = prev.filter(a => !(a.workerId === workerId && a.date === today));
          return [...filtered, newRecord];
        });
      } catch (err: any) {
        console.error('Failed to mark attendance:', err);
        throw err;
      }
    } else {
      // Offline mode
      const newRecord: AttendanceRecord = {
        id: generateId(),
        workerId,
        date: today,
        status,
        markedAt: new Date(),
        markedVia,
      };

      setAttendance(prev => {
        const filtered = prev.filter(a => !(a.workerId === workerId && a.date === today));
        return [...filtered, newRecord];
      });
      setLocalAttendance(prev => {
        const filtered = prev.filter(a => !(a.workerId === workerId && a.date === today));
        return [...filtered, newRecord];
      });
    }
  }, [isOnline, setLocalAttendance]);

  // Get worker attendance
  const getWorkerAttendance = useCallback((
    workerId: string,
    startDate?: string,
    endDate?: string
  ) => {
    return attendance.filter(a => {
      if (a.workerId !== workerId) return false;
      if (startDate && a.date < startDate) return false;
      if (endDate && a.date > endDate) return false;
      return true;
    });
  }, [attendance]);

  // Get today's attendance
  const getTodayAttendance = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return attendance.filter(a => a.date === today);
  }, [attendance]);

  // Add payment
  const addPayment = useCallback(async (payment: Omit<PaymentRecord, 'id' | 'createdAt'>) => {
    const paymentDate = payment.date || new Date().toISOString().split('T')[0];

    if (isOnline) {
      try {
        const response = await paymentsApi.create({
          worker_id: payment.workerId,
          amount: payment.amount,
          type: payment.type,
          note: payment.note,
        });

        const paymentData = response.payment || response;
        const newPayment: PaymentRecord = {
          id: paymentData.id.toString(),
          workerId: payment.workerId,
          amount: parseFloat(paymentData.amount),
          type: paymentData.type,
          date: paymentData.date || paymentDate,
          note: paymentData.notes || payment.note || '',
          createdAt: new Date(paymentData.created_at),
        };

        setPayments(prev => [...prev, newPayment]);
        setLocalPayments(prev => [...prev, newPayment]);
        return newPayment;
      } catch (err: any) {
        console.error('Failed to add payment:', err);
        throw err;
      }
    } else {
      // Offline mode
      const newPayment: PaymentRecord = {
        ...payment,
        id: generateId(),
        date: paymentDate,
        createdAt: new Date(),
      };
      setPayments(prev => [...prev, newPayment]);
      setLocalPayments(prev => [...prev, newPayment]);
      return newPayment;
    }
  }, [isOnline, setLocalPayments]);

  // Get worker payments
  const getWorkerPayments = useCallback((workerId: string) => {
    return payments.filter(p => p.workerId === workerId);
  }, [payments]);

  // Get worker stats
  const getWorkerStats = useCallback((workerId: string) => {
    const worker = workers.find(w => w.id === workerId);
    if (!worker) return null;

    const workerAttendance = attendance.filter(a => a.workerId === workerId);
    const workerPayments = payments.filter(p => p.workerId === workerId);

    const presentDays = workerAttendance.filter(a => a.status === 'present').length;
    const halfDays = workerAttendance.filter(a => a.status === 'half-day').length;

    const totalEarnings = (presentDays * worker.dailyRate) + (halfDays * worker.dailyRate * 0.5);
    const totalAdvances = workerPayments
      .filter(p => p.type === 'advance')
      .reduce((sum, p) => sum + p.amount, 0);
    const totalPaid = workerPayments
      .filter(p => p.type === 'payment')
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      presentDays,
      halfDays,
      totalEarnings,
      totalAdvances,
      totalPaid,
      balance: totalEarnings - totalAdvances - totalPaid,
    };
  }, [workers, attendance, payments]);

  // Today stats
  const todayStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = attendance.filter(a => a.date === today);

    return {
      present: todayAttendance.filter(a => a.status === 'present').length,
      absent: workers.length - todayAttendance.length,
      halfDay: todayAttendance.filter(a => a.status === 'half-day').length,
      total: workers.length,
    };
  }, [attendance, workers]);

  // QR functionality
  const generateDailyQR = useCallback(() => {
    const today = new Date();
    const validFrom = new Date(today);
    validFrom.setHours(7, 0, 0, 0);
    
    const validUntil = new Date(today);
    validUntil.setHours(11, 0, 0, 0);

    const code = `KAAM-${today.toISOString().split('T')[0]}-${generateId()}`;
    const qr: DailyQRCode = { 
      code, 
      date: today.toISOString().split('T')[0],
      validFrom,
      validUntil,
      createdAt: today,
    };
    setDailyQR(qr);
    return qr;
  }, [setDailyQR]);

  const isQRValid = useCallback(() => {
    if (!dailyQR) return false;
    const today = new Date().toISOString().split('T')[0];
    return dailyQR.date === today;
  }, [dailyQR]);

  const markAttendanceViaQR = useCallback((code: string): { success: boolean; message: string; worker?: Worker } => {
    // Try to find worker by QR ID or by matching code pattern
    const worker = workers.find(w => w.qrId === code || code.includes(w.qrId));
    
    if (!worker) {
      // If code matches daily QR pattern, mark attendance for demo
      if (code.startsWith('KAAM-')) {
        return { success: false, message: 'Please scan your worker QR code' };
      }
      return { success: false, message: 'Worker not found' };
    }

    if (!isQRValid()) {
      return { success: false, message: 'QR code expired. Generate a new one.' };
    }

    // Mark attendance
    markAttendance(worker.id, 'present', 'qr').catch(console.error);
    return { success: true, message: 'Attendance marked successfully!', worker };
  }, [workers, isQRValid, markAttendance]);

  return {
    workers,
    attendance,
    payments,
    isLoading,
    error,
    isOnline,
    refetch: fetchData,
    addWorker,
    updateWorker,
    deleteWorker,
    markAttendance,
    getWorkerAttendance,
    getTodayAttendance,
    addPayment,
    getWorkerPayments,
    getWorkerStats,
    todayStats,
    dailyQR,
    generateDailyQR,
    isQRValid,
    markAttendanceViaQR,
  };
}
