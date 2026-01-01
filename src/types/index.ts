export interface Worker {
  id: string;
  name: string;
  workType: string;
  dailyRate: number;
  phone?: string;
  createdAt: Date;
  qrId: string;
}

export interface AttendanceRecord {
  id: string;
  workerId: string;
  date: string;
  status: 'present' | 'absent' | 'half-day';
  markedAt: Date;
  markedVia: 'qr' | 'manual';
}

export interface PaymentRecord {
  id: string;
  workerId: string;
  amount: number;
  type: 'advance' | 'payment';
  date: string;
  note?: string;
  createdAt: Date;
}

export interface DailyQRCode {
  code: string;
  date: string;
  validFrom: Date;
  validUntil: Date;
  createdAt: Date;
}

export type WorkType = 
  | 'construction'
  | 'furniture'
  | 'driver'
  | 'factory'
  | 'farm'
  | 'helper'
  | 'other';

export const WORK_TYPES: { value: WorkType; label: string; labelMr: string }[] = [
  { value: 'construction', label: 'Construction', labelMr: 'बांधकाम' },
  { value: 'furniture', label: 'Furniture', labelMr: 'फर्निचर' },
  { value: 'driver', label: 'Driver', labelMr: 'ड्रायव्हर' },
  { value: 'factory', label: 'Factory', labelMr: 'कारखाना' },
  { value: 'farm', label: 'Farm Labour', labelMr: 'शेती' },
  { value: 'helper', label: 'Helper', labelMr: 'मदतनीस' },
  { value: 'other', label: 'Other', labelMr: 'इतर' },
];
