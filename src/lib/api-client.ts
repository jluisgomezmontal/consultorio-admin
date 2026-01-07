import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { handleOfflineRequest, createOfflineError } from './offline-api-interceptor';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Check if offline and handle request locally
      const isOnline = navigator.onLine;
      if (!isOnline) {
        try {
          const offlineResponse = await handleOfflineRequest(config, false);
          if (offlineResponse) {
            // Cancel the request and return offline response
            const cancelError: any = new Error('Offline mode - using local data');
            cancelError.isOfflineResponse = true;
            cancelError.offlineResponse = offlineResponse;
            return Promise.reject(cancelError);
          }
          
          // If no offline response, it means data is not cached
          // Allow the request to fail naturally (will show network error)
          console.warn('[API Client] Data not available offline, request will fail');
        } catch (error) {
          console.error('[API Client] Offline error:', error);
          // Don't reject here, let it try the network request which will fail naturally
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling and token refresh
apiClient.interceptors.response.use(
  async (response) => {
    // Cache successful GET requests to IndexedDB for offline access
    if (response.config.method?.toUpperCase() === 'GET' && response.status === 200) {
      try {
        const url = response.config.url || '';
        
        // Cache pacientes
        if (url.includes('/pacientes/') && !url.includes('/historial')) {
          const idMatch = url.match(/\/pacientes\/([^/?]+)/);
          if (idMatch && response.data?.data) {
            const { pacienteRepository } = await import('./db/repositories/paciente-repository');
            const paciente = response.data.data;
            await pacienteRepository.upsert({
              ...paciente,
              id: paciente.id,
              syncStatus: 'synced',
              localOnly: false,
            });
            console.log('[Cache] Paciente cached:', paciente.id);
          }
        }
        
        // Cache citas
        if (url.includes('/citas/')) {
          const idMatch = url.match(/\/citas\/([^/?]+)/);
          if (idMatch && response.data?.data) {
            const { citaRepository } = await import('./db/repositories/cita-repository');
            const cita = response.data.data;
            await citaRepository.upsert({
              ...cita,
              id: cita.id,
              syncStatus: 'synced',
              localOnly: false,
            });
            console.log('[Cache] Cita cached:', cita.id);
          }
        }
        
        // Cache list responses
        if (url.includes('/pacientes') && !url.includes('/pacientes/')) {
          if (response.data?.data && Array.isArray(response.data.data)) {
            const { pacienteRepository } = await import('./db/repositories/paciente-repository');
            const pacientes = response.data.data.map((p: any) => ({
              ...p,
              id: p.id,
              syncStatus: 'synced' as const,
              localOnly: false,
            }));
            await pacienteRepository.bulkUpsert(pacientes);
            console.log('[Cache] Pacientes list cached:', pacientes.length);
          }
        }
        
        if (url.includes('/citas') && !url.includes('/citas/')) {
          if (response.data?.data && Array.isArray(response.data.data)) {
            const { citaRepository } = await import('./db/repositories/cita-repository');
            const citas = response.data.data.map((c: any) => ({
              ...c,
              id: c.id,
              syncStatus: 'synced' as const,
              localOnly: false,
            }));
            await citaRepository.bulkUpsert(citas);
            console.log('[Cache] Citas list cached:', citas.length);
          }
        }
      } catch (cacheError) {
        // Don't fail the request if caching fails
        console.warn('[Cache] Error caching response:', cacheError);
      }
    }
    
    return response;
  },
  async (error: any) => {
    // Handle offline responses
    if (error.isOfflineResponse && error.offlineResponse) {
      return Promise.resolve(error.offlineResponse);
    }

    const axiosError = error as AxiosError;
    const originalRequest = axiosError.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Check if account is deactivated
    if (axiosError.response?.status === 401) {
      const errorMessage = (axiosError.response?.data as any)?.message || '';
      if (errorMessage.includes('deactivated') || errorMessage.includes('desactivada')) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        if (typeof window !== 'undefined') {
          window.location.href = '/login?deactivated=true';
        }
        return Promise.reject(axiosError);
      }
    }

    if (axiosError.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          { refreshToken }
        );

        const { accessToken, refreshToken: newRefreshToken } = data.data;
        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        processQueue(null);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(axiosError);
  }
);

export default apiClient;
