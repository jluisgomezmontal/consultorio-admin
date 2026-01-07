import { pacienteRepository } from '@/lib/db/repositories/paciente-repository';
import { citaRepository } from '@/lib/db/repositories/cita-repository';
import { syncQueueRepository } from '@/lib/db/repositories/sync-queue-repository';
import { metadataRepository } from '@/lib/db/repositories/metadata-repository';
import type { 
  CreatePacienteRequest, 
  UpdatePacienteRequest, 
  Paciente 
} from '@/services/paciente.service';
import type { 
  CreateCitaRequest, 
  UpdateCitaRequest, 
  Cita 
} from '@/services/cita.service';

export class OfflineServiceWrapper {
  async isOnline(): Promise<boolean> {
    return navigator.onLine;
  }

  async canWorkOffline(): Promise<boolean> {
    const authMetadata = await metadataRepository.getAuthMetadata();
    if (!authMetadata || !authMetadata.token) return false;

    const now = Date.now();
    const maxOfflineTime = parseInt(process.env.NEXT_PUBLIC_MAX_OFFLINE_TIME || '604800000', 10);
    const offlineTime = now - (authMetadata.lastOnlineTime || now);

    if (offlineTime > maxOfflineTime) return false;
    if (authMetadata.tokenExpiry && now > authMetadata.tokenExpiry) return false;

    return true;
  }

  async createPaciente(
    data: CreatePacienteRequest,
    online: boolean
  ): Promise<Paciente> {
    if (!online) {
      const canWork = await this.canWorkOffline();
      if (!canWork) {
        throw new Error('No se puede trabajar offline en este momento');
      }

      const localPaciente = await pacienteRepository.create(data);

      await syncQueueRepository.add({
        action: 'CREATE',
        entity: 'paciente',
        data,
        localId: localPaciente.id,
        priority: 'medium',
      });

      return localPaciente as unknown as Paciente;
    }

    throw new Error('Use el servicio normal cuando esté online');
  }

  async updatePaciente(
    id: string,
    data: UpdatePacienteRequest,
    online: boolean
  ): Promise<Paciente | undefined> {
    if (!online) {
      const canWork = await this.canWorkOffline();
      if (!canWork) {
        throw new Error('No se puede trabajar offline en este momento');
      }

      const updated = await pacienteRepository.update(id, data);
      
      if (updated) {
        await syncQueueRepository.add({
          action: 'UPDATE',
          entity: 'paciente',
          data: updated,
          localId: id,
          remoteId: id.startsWith('local_') ? undefined : id,
          priority: 'medium',
        });
      }

      return updated as unknown as Paciente;
    }

    throw new Error('Use el servicio normal cuando esté online');
  }

  async deletePaciente(id: string, online: boolean): Promise<boolean> {
    if (!online) {
      const canWork = await this.canWorkOffline();
      if (!canWork) {
        throw new Error('No se puede trabajar offline en este momento');
      }

      await pacienteRepository.delete(id);

      if (!id.startsWith('local_')) {
        await syncQueueRepository.add({
          action: 'DELETE',
          entity: 'paciente',
          data: { id },
          localId: id,
          remoteId: id,
          priority: 'low',
        });
      }

      return true;
    }

    throw new Error('Use el servicio normal cuando esté online');
  }

  async createCita(
    data: CreateCitaRequest,
    online: boolean
  ): Promise<Cita> {
    if (!online) {
      const canWork = await this.canWorkOffline();
      if (!canWork) {
        throw new Error('No se puede trabajar offline en este momento');
      }

      const today = new Date().toISOString().split('T')[0];
      const priority = data.date === today ? 'high' : 'medium';

      const citaData = {
        ...data,
        estado: data.estado || 'pendiente' as const,
      };
      const localCita = await citaRepository.create(citaData);

      await syncQueueRepository.add({
        action: 'CREATE',
        entity: 'cita',
        data: citaData,
        localId: localCita.id,
        priority,
      });

      return localCita as unknown as Cita;
    }

    throw new Error('Use el servicio normal cuando esté online');
  }

  async updateCita(
    id: string,
    data: UpdateCitaRequest,
    online: boolean
  ): Promise<Cita | undefined> {
    if (!online) {
      const canWork = await this.canWorkOffline();
      if (!canWork) {
        throw new Error('No se puede trabajar offline en este momento');
      }

      const updated = await citaRepository.update(id, data);
      
      if (updated) {
        const today = new Date().toISOString().split('T')[0];
        const priority = updated.date === today ? 'high' : 'medium';

        await syncQueueRepository.add({
          action: 'UPDATE',
          entity: 'cita',
          data: updated,
          localId: id,
          remoteId: id.startsWith('local_') ? undefined : id,
          priority,
        });
      }

      return updated as unknown as Cita;
    }

    throw new Error('Use el servicio normal cuando esté online');
  }

  async deleteCita(id: string, online: boolean): Promise<boolean> {
    if (!online) {
      const canWork = await this.canWorkOffline();
      if (!canWork) {
        throw new Error('No se puede trabajar offline en este momento');
      }

      await citaRepository.delete(id);

      if (!id.startsWith('local_')) {
        await syncQueueRepository.add({
          action: 'DELETE',
          entity: 'cita',
          data: { id },
          localId: id,
          remoteId: id,
          priority: 'low',
        });
      }

      return true;
    }

    throw new Error('Use el servicio normal cuando esté online');
  }

  async getPacientesOffline(consultorioId: string): Promise<Paciente[]> {
    const localPacientes = await pacienteRepository.getAll(consultorioId);
    return localPacientes as unknown as Paciente[];
  }

  async getCitasOffline(consultorioId: string): Promise<Cita[]> {
    const localCitas = await citaRepository.getAll(consultorioId);
    return localCitas as unknown as Cita[];
  }
}

export const offlineServiceWrapper = new OfflineServiceWrapper();
