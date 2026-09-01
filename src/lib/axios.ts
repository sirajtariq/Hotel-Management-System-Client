import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { toast } from '@/components/ui/ToastProvider';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL  //|| 'http://127.0.0.1:8000/api/v1';


export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor: attach Auth token & Tenant header
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    const tenantId = localStorage.getItem('active_tenant_id');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (tenantId) {
      config.headers['X-Tenant-ID'] = tenantId;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

let last403Time = 0;

// Response interceptor: handle 403 forbidden & 401 unauth with automatic refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // 403 Forbidden Interceptor with fixed ID deduplication & debounce
    if (error.response?.status === 403) {
      const now = Date.now();
      if (now - last403Time > 1500) {
        last403Time = now;
        const data = error.response?.data as any;
        const message =
          data?.message ||
          data?.detail ||
          'You do not have permission to perform this action.';
        toast.error(message, { id: 'forbidden-toast-alert' });
      }
      return Promise.reject(error);
    }

    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const requestUrl = originalRequest?.url || '';

    // Ignore 401 interceptor logic for token authentication & refresh endpoints
    const isTokenEndpoint = requestUrl.includes('/users/token');

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isTokenEndpoint) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_BASE_URL}/users/token/refresh/`, {
            refresh: refreshToken,
          });

          localStorage.setItem('access_token', data.access);
          originalRequest.headers.Authorization = `Bearer ${data.access}`;
          return apiClient(originalRequest);
        } catch {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('active_tenant_id');
        }
      } else {
        localStorage.removeItem('access_token');
      }
    }

    return Promise.reject(error);
  }
);

