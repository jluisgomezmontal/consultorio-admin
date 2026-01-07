import { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { db } from './db/schema';
import { pacienteRepository } from './db/repositories/paciente-repository';
import { citaRepository } from './db/repositories/cita-repository';
import { syncQueueRepository } from './db/repositories/sync-queue-repository';
import { v4 as uuidv4 } from 'uuid';

// Get consultorioId from localStorage (set by auth)
function getConsultorioId(): string {
  if (typeof window === 'undefined') return '';
  try {
    // First try to get from selectedConsultorioId in localStorage
    const selectedId = localStorage.getItem('selectedConsultorioId');
    if (selectedId) {
      console.log('[Offline Interceptor] Using selectedConsultorioId:', selectedId);
      return selectedId;
    }
    
    // Fallback to user object
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      const consultorioId = user.consultorio?._id || user.consultorioId || '';
      console.log('[Offline Interceptor] Using consultorioId from user:', consultorioId);
      return consultorioId;
    }
  } catch (e) {
    console.error('[Offline Interceptor] Error getting consultorioId:', e);
  }
  return '';
}

interface OfflineResponse {
  data: {
    success: boolean;
    data: any;
    message?: string;
  };
  status: number;
  statusText: string;
}

export async function handleOfflineRequest(
  config: InternalAxiosRequestConfig,
  isOnline: boolean
): Promise<OfflineResponse | null> {
  if (isOnline) return null;

  const { method, url, data: requestData } = config;
  const urlPath = url?.split('?')[0] || '';
  
  console.log('[Offline Interceptor] Handling offline request:', { method, urlPath });

  try {
    // PACIENTES
    if (urlPath.includes('/pacientes') && !urlPath.includes('/historial')) {
      const idMatch = urlPath.match(/\/pacientes\/([^/]+)$/);
      const pacienteId = idMatch ? idMatch[1] : null;

      // GET /pacientes (list)
      if (method?.toUpperCase() === 'GET' && !pacienteId) {
        const consultorioId = getConsultorioId();
        console.log('[Offline Interceptor] Getting all pacientes:', { consultorioId });
        const pacientes = await pacienteRepository.getAll(consultorioId);
        console.log('[Offline Interceptor] Found pacientes:', pacientes.length);
        return {
          data: {
            success: true,
            data: pacientes,
            page: 1,
            limit: pacientes.length,
            total: pacientes.length,
          },
          status: 200,
          statusText: 'OK',
        } as any;
      }

      // GET /pacientes/:id
      if (method?.toUpperCase() === 'GET' && pacienteId) {
        console.log('[Offline Interceptor] Getting paciente by id:', pacienteId);
        const paciente = await pacienteRepository.getById(pacienteId);
        console.log('[Offline Interceptor] Found paciente:', !!paciente);
        
        if (!paciente) {
          console.warn('[Offline Interceptor] Paciente not found in local DB. You need to access it while online first.');
          // Return null instead of error to allow graceful handling
          return null;
        }
        return {
          data: {
            success: true,
            data: paciente,
          },
          status: 200,
          statusText: 'OK',
        };
      }

      // POST /pacientes (create)
      if (method?.toUpperCase() === 'POST') {
        const consultorioId = getConsultorioId();
        console.log('[Offline Interceptor] Creating paciente offline:', { consultorioId, requestData });
        const newPaciente = await pacienteRepository.create({
          ...requestData,
          consultorioId,
        });
        console.log('[Offline Interceptor] Paciente created:', newPaciente);

        await syncQueueRepository.add({
          entity: 'paciente',
          action: 'CREATE',
          localId: newPaciente.id,
          data: { ...requestData, consultorioId },
          priority: 'medium',
        });

        return {
          data: {
            success: true,
            data: newPaciente,
            message: 'Paciente creado localmente. Se sincronizará al reconectar.',
          },
          status: 201,
          statusText: 'Created',
        };
      }

      // PUT /pacientes/:id (update)
      if (method?.toUpperCase() === 'PUT' && pacienteId) {
        const consultorioId = getConsultorioId();
        const updateData = { ...requestData, consultorioId };
        const updated = await pacienteRepository.update(pacienteId, updateData);
        
        console.log('[Offline Interceptor] Updating paciente:', { pacienteId, consultorioId });
        
        await syncQueueRepository.add({
          entity: 'paciente',
          action: 'UPDATE',
          localId: pacienteId,
          remoteId: pacienteId.startsWith('local_') ? undefined : pacienteId,
          data: updateData,
          priority: 'medium',
        });

        return {
          data: {
            success: true,
            data: updated,
            message: 'Paciente actualizado localmente. Se sincronizará al reconectar.',
          },
          status: 200,
          statusText: 'OK',
        };
      }

      // DELETE /pacientes/:id
      if (method?.toUpperCase() === 'DELETE' && pacienteId) {
        await pacienteRepository.delete(pacienteId);
        
        if (!pacienteId.startsWith('local_')) {
          await syncQueueRepository.add({
            entity: 'paciente',
            action: 'DELETE',
            localId: pacienteId,
            remoteId: pacienteId,
            priority: 'medium',
            data: undefined,
          });
        }

        return {
          data: {
            success: true,
            data: null,
            message: 'Paciente eliminado localmente.',
          },
          status: 200,
          statusText: 'OK',
        };
      }
    }

    // CITAS
    if (urlPath.includes('/citas')) {
      const idMatch = urlPath.match(/\/citas\/([^/]+)$/);
      const citaId = idMatch ? idMatch[1] : null;

      // GET /citas (list)
      if (method?.toUpperCase() === 'GET' && !citaId) {
        const consultorioId = getConsultorioId();
        const citas = await citaRepository.getAll(consultorioId);
        return {
          data: {
            success: true,
            data: citas,
            page: 1,
            limit: citas.length,
            total: citas.length,
          },
          status: 200,
          statusText: 'OK',
        } as any;
      }

      // GET /citas/:id
      if (method?.toUpperCase() === 'GET' && citaId) {
        console.log('[Offline Interceptor] Getting cita by id:', citaId);
        const cita = await citaRepository.getById(citaId);
        console.log('[Offline Interceptor] Found cita:', !!cita);
        
        if (!cita) {
          console.warn('[Offline Interceptor] Cita not found in local DB. You need to access it while online first.');
          // Return null instead of error to allow graceful handling
          return null;
        }
        return {
          data: {
            success: true,
            data: cita,
          },
          status: 200,
          statusText: 'OK',
        };
      }

      // POST /citas (create)
      if (method?.toUpperCase() === 'POST') {
        const consultorioId = getConsultorioId();
        const citaData = {
          ...requestData,
          consultorioId,
          estado: requestData.estado || 'pendiente',
        };
        const newCita = await citaRepository.create(citaData);

        await syncQueueRepository.add({
          entity: 'cita',
          action: 'CREATE',
          localId: newCita.id,
          data: citaData,
          priority: 'medium',
        });

        return {
          data: {
            success: true,
            data: newCita,
            message: 'Cita creada localmente. Se sincronizará al reconectar.',
          },
          status: 201,
          statusText: 'Created',
        };
      }

      // PUT /citas/:id (update)
      if (method?.toUpperCase() === 'PUT' && citaId) {
        const consultorioId = getConsultorioId();
        const updateData = { ...requestData, consultorioId };
        const updated = await citaRepository.update(citaId, updateData);
        
        console.log('[Offline Interceptor] Updating cita:', { citaId, consultorioId });
        
        await syncQueueRepository.add({
          entity: 'cita',
          action: 'UPDATE',
          localId: citaId,
          remoteId: citaId.startsWith('local_') ? undefined : citaId,
          data: updateData,
          priority: 'medium',
        });

        return {
          data: {
            success: true,
            data: updated,
            message: 'Cita actualizada localmente. Se sincronizará al reconectar.',
          },
          status: 200,
          statusText: 'OK',
        };
      }

      // DELETE /citas/:id
      if (method?.toUpperCase() === 'DELETE' && citaId) {
        await citaRepository.delete(citaId);
        
        if (!citaId.startsWith('local_')) {
          await syncQueueRepository.add({
            entity: 'cita',
            action: 'DELETE',
            localId: citaId,
            remoteId: citaId,
            priority: 'medium',
            data: undefined,
          });
        }

        return {
          data: {
            success: true,
            data: null,
            message: 'Cita eliminada localmente.',
          },
          status: 200,
          statusText: 'OK',
        };
      }
    }

    return null;
  } catch (error) {
    console.error('[Offline Interceptor] Error:', error);
    throw error;
  }
}

export function createOfflineError(message: string): AxiosError {
  const error = new Error(message) as any;
  error.isAxiosError = true;
  error.response = {
    status: 503,
    statusText: 'Service Unavailable',
    data: {
      success: false,
      message,
    },
    headers: {},
    config: {} as any,
  };
  return error as AxiosError;
}
