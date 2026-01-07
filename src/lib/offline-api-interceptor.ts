import { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { db } from './db/schema';
import { pacienteRepository } from './db/repositories/paciente-repository';
import { citaRepository } from './db/repositories/cita-repository';
import { syncQueueRepository } from './db/repositories/sync-queue-repository';
import { v4 as uuidv4 } from 'uuid';

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

  try {
    // PACIENTES
    if (urlPath.includes('/pacientes') && !urlPath.includes('/historial')) {
      const idMatch = urlPath.match(/\/pacientes\/([^/]+)$/);
      const pacienteId = idMatch ? idMatch[1] : null;

      // GET /pacientes (list)
      if (method?.toUpperCase() === 'GET' && !pacienteId) {
        const consultorioIdParam = config.params?.consultorioId || 'all';
        const pacientes = await pacienteRepository.getAll(consultorioIdParam);
        return {
          data: {
            success: true,
            data: pacientes,
          } as any,
          status: 200,
          statusText: 'OK',
        };
      }

      // GET /pacientes/:id
      if (method?.toUpperCase() === 'GET' && pacienteId) {
        const paciente = await pacienteRepository.getById(pacienteId);
        if (!paciente) {
          throw new Error('Paciente no encontrado en modo offline');
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
        const localId = `local_${uuidv4()}`;
        const newPaciente = await pacienteRepository.create({
          ...requestData,
          id: localId,
        });

        await syncQueueRepository.add({
          entity: 'paciente',
          action: 'CREATE',
          localId,
          data: requestData,
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
        const updated = await pacienteRepository.update(pacienteId, requestData);
        
        await syncQueueRepository.add({
          entity: 'paciente',
          action: 'UPDATE',
          localId: pacienteId,
          remoteId: pacienteId.startsWith('local_') ? undefined : pacienteId,
          data: requestData,
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
        const consultorioIdParam = config.params?.consultorioId || 'all';
        const citas = await citaRepository.getAll(consultorioIdParam);
        return {
          data: {
            success: true,
            data: citas,
          } as any,
          status: 200,
          statusText: 'OK',
        };
      }

      // GET /citas/:id
      if (method?.toUpperCase() === 'GET' && citaId) {
        const cita = await citaRepository.getById(citaId);
        if (!cita) {
          throw new Error('Cita no encontrada en modo offline');
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
        const localId = `local_${uuidv4()}`;
        const citaData = {
          ...requestData,
          estado: requestData.estado || 'pendiente',
        };
        const newCita = await citaRepository.create({
          ...citaData,
          id: localId,
        });

        await syncQueueRepository.add({
          entity: 'cita',
          action: 'CREATE',
          localId,
          data: requestData,
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
        const updated = await citaRepository.update(citaId, requestData);
        
        await syncQueueRepository.add({
          entity: 'cita',
          action: 'UPDATE',
          localId: citaId,
          remoteId: citaId.startsWith('local_') ? undefined : citaId,
          data: requestData,
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
