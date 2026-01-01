const API_BASE_URL = 'http://localhost:3001/api';

// Get auth token from localStorage
function getAuthToken(): string | null {
  const token = localStorage.getItem('kaam-hisab-token');
  return token ? JSON.parse(token) : null;
}

// Set auth token
export function setAuthToken(token: string | null): void {
  if (token) {
    localStorage.setItem('kaam-hisab-token', JSON.stringify(token));
  } else {
    localStorage.removeItem('kaam-hisab-token');
  }
}

// API request helper
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || error.error || 'Request failed');
  }
  
  return response.json();
}

// Auth API
export const authApi = {
  register: (data: { name: string; phone: string; password: string; role: 'owner' | 'worker' }) =>
    apiRequest<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  login: (phone: string, password: string) =>
    apiRequest<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password }),
    }),
    
  me: () => apiRequest<{ user: any }>('/auth/me'),
};

// Workers API
export const workersApi = {
  getAll: () => apiRequest<any[]>('/workers'),
  
  getById: (id: string) => apiRequest<any>(`/workers/${id}`),
  
  create: (data: { name: string; work_type: string; daily_rate: number; phone?: string }) =>
    apiRequest<any>('/workers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  update: (id: string, data: Partial<{ name: string; work_type: string; daily_rate: number; phone?: string }>) =>
    apiRequest<any>(`/workers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    
  delete: (id: string) =>
    apiRequest<{ message: string }>(`/workers/${id}`, {
      method: 'DELETE',
    }),
};

// Attendance API
export const attendanceApi = {
  getAll: (params?: { worker_id?: string; start_date?: string; end_date?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.worker_id) searchParams.append('worker_id', params.worker_id);
    if (params?.start_date) searchParams.append('start_date', params.start_date);
    if (params?.end_date) searchParams.append('end_date', params.end_date);
    const query = searchParams.toString();
    return apiRequest<any[]>(`/attendance${query ? `?${query}` : ''}`);
  },
  
  mark: (data: { worker_id: string; date: string; status: 'present' | 'absent' | 'half-day'; marked_via?: string }) =>
    apiRequest<any>('/attendance', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Payments API
export const paymentsApi = {
  getAll: (params?: { worker_id?: string; start_date?: string; end_date?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.worker_id) searchParams.append('worker_id', params.worker_id);
    if (params?.start_date) searchParams.append('start_date', params.start_date);
    if (params?.end_date) searchParams.append('end_date', params.end_date);
    const query = searchParams.toString();
    return apiRequest<any[]>(`/payments${query ? `?${query}` : ''}`);
  },
  
  create: (data: { worker_id: string; amount: number; type: 'payment' | 'advance'; note?: string; date?: string }) =>
    apiRequest<any>('/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<{ amount: number; type: 'payment' | 'advance'; note?: string; date?: string }>) =>
    apiRequest<any>(`/payments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest<{ message: string }>(`/payments/${id}`, {
      method: 'DELETE',
    }),
};

// Dashboard API
export const dashboardApi = {
  getStats: () => apiRequest<{
    totalWorkers: number;
    presentToday: number;
    monthlyEarnings: number;
    monthlyPayments: number;
  }>('/reports/dashboard'),
};

// Health check
export const healthApi = {
  check: () => apiRequest<{ status: string; timestamp: string }>('/health'),
};
