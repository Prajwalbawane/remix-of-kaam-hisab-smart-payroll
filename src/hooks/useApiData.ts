import { useState, useEffect, useCallback, useMemo } from 'react';
import { workersApi, attendanceApi, paymentsApi, dashboardApi } from '@/services/api';
import { Worker, AttendanceRecord, PaymentRecord } from '@/types';

export function useApiData() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all data on mount
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [workersData, attendanceData, paymentsData] = await Promise.all([
        workersApi.getAll(),
        attendanceApi.getAll(),
        paymentsApi.getAll(),
      ]);

      // Transform API data to match our types
      setWorkers(workersData.map((w: any) => ({
        id: w.id.toString(),
        name: w.name,
        phone: w.phone,
        workType: w.work_type,
        dailyRate: w.daily_rate,
        qrId: w.qr_id || `qr-${w.id}`,
        createdAt: new Date(w.created_at),
      })));

      setAttendance(attendanceData.map((a: any) => ({
        id: a.id.toString(),
        workerId: a.worker_id.toString(),
        date: a.date,
        status: a.status,
        markedAt: new Date(a.marked_at || a.created_at),
        markedVia: a.marked_via || 'manual',
      })));

      setPayments(paymentsData.map((p: any) => ({
        id: p.id.toString(),
        workerId: p.worker_id.toString(),
        amount: p.amount,
        type: p.type,
        date: p.date || p.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        note: p.note,
        createdAt: new Date(p.created_at),
      })));
    } catch (err: any) {
      setError(err.message);
      console.error('Failed to fetch data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Add worker
  const addWorker = useCallback(async (worker: Omit<Worker, 'id' | 'createdAt' | 'qrId'>) => {
    try {
      const response = await workersApi.create({
        name: worker.name,
        work_type: worker.workType,
        daily_rate: worker.dailyRate,
        phone: worker.phone,
      });

      const newWorker: Worker = {
        id: response.id.toString(),
        name: response.name,
        phone: response.phone,
        workType: response.work_type,
        dailyRate: response.daily_rate,
        qrId: response.qr_id || `qr-${response.id}`,
        createdAt: response.created_at,
      };

      setWorkers(prev => [...prev, newWorker]);
      return newWorker;
    } catch (err: any) {
      console.error('Failed to add worker:', err);
      throw err;
    }
  }, []);

  // Update worker
  const updateWorker = useCallback(async (id: string, updates: Partial<Worker>) => {
    try {
      const apiUpdates: any = {};
      if (updates.name) apiUpdates.name = updates.name;
      if (updates.workType) apiUpdates.work_type = updates.workType;
      if (updates.dailyRate) apiUpdates.daily_rate = updates.dailyRate;
      if (updates.phone) apiUpdates.phone = updates.phone;

      await workersApi.update(id, apiUpdates);

      setWorkers(prev =>
        prev.map(w => (w.id === id ? { ...w, ...updates } : w))
      );
    } catch (err: any) {
      console.error('Failed to update worker:', err);
      throw err;
    }
  }, []);

  // Delete worker
  const deleteWorker = useCallback(async (id: string) => {
    try {
      await workersApi.delete(id);
      setWorkers(prev => prev.filter(w => w.id !== id));
    } catch (err: any) {
      console.error('Failed to delete worker:', err);
      throw err;
    }
  }, []);

  // Mark attendance
  const markAttendance = useCallback(async (
    workerId: string,
    status: AttendanceRecord['status'],
    markedVia: 'qr' | 'manual' = 'manual'
  ) => {
    const today = new Date().toISOString().split('T')[0];
    
    try {
      const response = await attendanceApi.mark({
        worker_id: workerId,
        date: today,
        status,
        marked_via: markedVia,
      });

      const newRecord: AttendanceRecord = {
        id: response.id.toString(),
        workerId,
        date: today,
        status,
        markedAt: new Date(),
        markedVia,
      };

      setAttendance(prev => {
        // Remove existing record for same worker and date
        const filtered = prev.filter(
          a => !(a.workerId === workerId && a.date === today)
        );
        return [...filtered, newRecord];
      });
    } catch (err: any) {
      console.error('Failed to mark attendance:', err);
      throw err;
    }
  }, []);

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
    try {
      const response = await paymentsApi.create({
        worker_id: payment.workerId,
        amount: payment.amount,
        type: payment.type,
        note: payment.note,
      });

      const newPayment: PaymentRecord = {
        id: response.id.toString(),
        workerId: payment.workerId,
        amount: response.amount,
        type: response.type,
        date: response.date || new Date().toISOString().split('T')[0],
        note: response.note,
        createdAt: new Date(response.created_at),
      };

      setPayments(prev => [...prev, newPayment]);
      return newPayment;
    } catch (err: any) {
      console.error('Failed to add payment:', err);
      throw err;
    }
  }, []);

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
      absent: todayAttendance.filter(a => a.status === 'absent').length,
      halfDay: todayAttendance.filter(a => a.status === 'half-day').length,
      total: workers.length,
    };
  }, [attendance, workers]);

  // QR functionality (kept local for now)
  const [dailyQR, setDailyQR] = useState<{ code: string; date: string; validFrom: Date; validUntil: Date; createdAt: Date } | null>(null);

  const generateDailyQR = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const code = `KAAM-${today}-${Math.random().toString(36).substr(2, 9)}`;
    const qr = { 
      code, 
      date: today,
      validFrom: now,
      validUntil: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      createdAt: now,
    };
    setDailyQR(qr);
    return qr;
  }, []);

  const isQRValid = useCallback(() => {
    if (!dailyQR) return false;
    const today = new Date().toISOString().split('T')[0];
    return dailyQR.date === today;
  }, [dailyQR]);

  const markAttendanceViaQR = useCallback((workerQrId: string): { success: boolean; message: string; worker?: Worker } => {
    const worker = workers.find(w => w.qrId === workerQrId);
    if (!worker) {
      return { success: false, message: 'Worker not found' };
    }

    if (!isQRValid()) {
      return { success: false, message: 'QR code expired' };
    }

    // Mark attendance synchronously in state, API call happens in background
    markAttendance(worker.id, 'present', 'qr').catch(console.error);
    return { success: true, message: 'Attendance marked', worker };
  }, [workers, isQRValid, markAttendance]);

  return {
    workers,
    attendance,
    payments,
    isLoading,
    error,
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
