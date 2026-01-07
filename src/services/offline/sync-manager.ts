import { syncQueueRepository } from '@/lib/db/repositories/sync-queue-repository';
import { pacienteRepository } from '@/lib/db/repositories/paciente-repository';
import { citaRepository } from '@/lib/db/repositories/cita-repository';
import { SyncQueueItem } from '@/lib/db/schema';
import { conflictResolver } from './conflict-resolver';
import apiClient from '@/lib/api-client';

const MAX_RETRIES = parseInt(process.env.NEXT_PUBLIC_MAX_SYNC_RETRIES || '5', 10);

export class SyncManager {
  private isSyncing = false;

  async processSyncQueue(): Promise<void> {
    if (this.isSyncing) {
      console.log('Sync already in progress');
      return;
    }

    this.isSyncing = true;

    try {
      const pendingItems = await syncQueueRepository.getPendingByPriority();
      
      if (pendingItems.length === 0) {
        console.log('No items to sync');
        return;
      }

      console.log(`Syncing ${pendingItems.length} items...`);

      for (const item of pendingItems) {
        await this.syncItem(item);
      }

      await syncQueueRepository.clearCompleted();
    } finally {
      this.isSyncing = false;
    }
  }

  private async syncItem(item: SyncQueueItem): Promise<void> {
    try {
      await syncQueueRepository.updateStatus(item.id, 'syncing');

      if (item.retries >= MAX_RETRIES) {
        await syncQueueRepository.updateStatus(
          item.id,
          'failed',
          'Máximo de reintentos alcanzado - requiere atención manual'
        );
        return;
      }

      switch (item.entity) {
        case 'paciente':
          await this.syncPaciente(item);
          break;
        case 'cita':
          await this.syncCita(item);
          break;
        default:
          console.error('Unknown entity type:', item.entity);
      }
    } catch (error) {
      console.error(`Error syncing item ${item.id}:`, error);
      await syncQueueRepository.incrementRetries(item.id);
      await syncQueueRepository.updateStatus(
        item.id,
        'pending',
        error instanceof Error ? error.message : 'Error desconocido'
      );
    }
  }

  private async syncPaciente(item: SyncQueueItem): Promise<void> {
    const { action, data, localId } = item;

    try {
      if (action === 'CREATE') {
        const response = await apiClient.post('/pacientes', data);
        const remoteId = response.data.data.id;

        await pacienteRepository.updateRemoteId(localId, remoteId);
        await syncQueueRepository.updateRemoteId(item.id, remoteId);
        
        console.log(`✅ Paciente creado: ${localId} → ${remoteId}`);
      } else if (action === 'UPDATE') {
        const remoteId = item.remoteId || localId;
        
        try {
          const remoteResponse = await apiClient.get(`/pacientes/${remoteId}`);
          const remoteData = remoteResponse.data.data;
          
          const localData = await pacienteRepository.getById(localId);
          
          if (localData && conflictResolver.detectConflict(localData, remoteData)) {
            const resolution = conflictResolver.resolveByTimestamp(localData, remoteData);
            conflictResolver.logConflict('paciente', remoteId, resolution);
            
            if (resolution.action === 'push') {
              await apiClient.put(`/pacientes/${remoteId}`, data);
              await pacienteRepository.updateSyncStatus(localId, 'synced');
            } else {
              await pacienteRepository.upsert({
                ...remoteData,
                id: localId,
                syncStatus: 'synced',
                localOnly: false,
              });
            }
          } else {
            await apiClient.put(`/pacientes/${remoteId}`, data);
            await pacienteRepository.updateSyncStatus(localId, 'synced');
          }
        } catch (error: any) {
          if (error.response?.status === 404) {
            await apiClient.post('/pacientes', data);
            console.log(`⚠️ Paciente no encontrado, creado nuevamente`);
          } else {
            throw error;
          }
        }

        await syncQueueRepository.updateStatus(item.id, 'completed');
        console.log(`✅ Paciente actualizado: ${remoteId}`);
      } else if (action === 'DELETE') {
        const remoteId = item.remoteId || localId;
        
        try {
          await apiClient.delete(`/pacientes/${remoteId}`);
          console.log(`✅ Paciente eliminado: ${remoteId}`);
        } catch (error: any) {
          if (error.response?.status === 404) {
            console.log(`⚠️ Paciente ya eliminado en servidor`);
          } else {
            throw error;
          }
        }
        
        await syncQueueRepository.updateStatus(item.id, 'completed');
      }
    } catch (error) {
      throw error;
    }
  }

  private async syncCita(item: SyncQueueItem): Promise<void> {
    const { action, data, localId } = item;

    try {
      if (action === 'CREATE') {
        const response = await apiClient.post('/citas', data);
        const remoteId = response.data.data.id;

        await citaRepository.updateRemoteId(localId, remoteId);
        await syncQueueRepository.updateRemoteId(item.id, remoteId);
        
        console.log(`✅ Cita creada: ${localId} → ${remoteId}`);
      } else if (action === 'UPDATE') {
        const remoteId = item.remoteId || localId;
        
        try {
          const remoteResponse = await apiClient.get(`/citas/${remoteId}`);
          const remoteData = remoteResponse.data.data;
          
          const localData = await citaRepository.getById(localId);
          
          if (localData && conflictResolver.detectConflict(localData, remoteData)) {
            const resolution = conflictResolver.resolveByTimestamp(localData, remoteData);
            conflictResolver.logConflict('cita', remoteId, resolution);
            
            if (resolution.action === 'push') {
              await apiClient.put(`/citas/${remoteId}`, data);
              await citaRepository.updateSyncStatus(localId, 'synced');
            } else {
              await citaRepository.upsert({
                ...remoteData,
                id: localId,
                syncStatus: 'synced',
                localOnly: false,
              });
            }
          } else {
            await apiClient.put(`/citas/${remoteId}`, data);
            await citaRepository.updateSyncStatus(localId, 'synced');
          }
        } catch (error: any) {
          if (error.response?.status === 404) {
            await apiClient.post('/citas', data);
            console.log(`⚠️ Cita no encontrada, creada nuevamente`);
          } else {
            throw error;
          }
        }

        await syncQueueRepository.updateStatus(item.id, 'completed');
        console.log(`✅ Cita actualizada: ${remoteId}`);
      } else if (action === 'DELETE') {
        const remoteId = item.remoteId || localId;
        
        try {
          await apiClient.delete(`/citas/${remoteId}`);
          console.log(`✅ Cita eliminada: ${remoteId}`);
        } catch (error: any) {
          if (error.response?.status === 404) {
            console.log(`⚠️ Cita ya eliminada en servidor`);
          } else {
            throw error;
          }
        }
        
        await syncQueueRepository.updateStatus(item.id, 'completed');
      }
    } catch (error) {
      throw error;
    }
  }

  async forceSyncAll(): Promise<void> {
    console.log('🔄 Forcing full sync...');
    await this.processSyncQueue();
  }

  async getSyncStatus(): Promise<{
    pending: number;
    syncing: number;
    failed: number;
    completed: number;
  }> {
    const all = await syncQueueRepository.getAll();
    
    return {
      pending: all.filter(i => i.status === 'pending').length,
      syncing: all.filter(i => i.status === 'syncing').length,
      failed: all.filter(i => i.status === 'failed').length,
      completed: all.filter(i => i.status === 'completed').length,
    };
  }
}

export const syncManager = new SyncManager();
