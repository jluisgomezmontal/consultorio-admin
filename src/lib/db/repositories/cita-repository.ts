import { db, LocalCita } from '../schema';
import { v4 as uuidv4 } from 'uuid';

export class CitaRepository {
  async getAll(consultorioId: string): Promise<LocalCita[]> {
    return await db.citas
      .where('consultorioId')
      .equals(consultorioId)
      .toArray();
  }

  async getById(id: string): Promise<LocalCita | undefined> {
    return await db.citas.get(id);
  }

  async getByPaciente(pacienteId: string): Promise<LocalCita[]> {
    return await db.citas
      .where('pacienteId')
      .equals(pacienteId)
      .toArray();
  }

  async getByDateRange(consultorioId: string, dateFrom: string, dateTo: string): Promise<LocalCita[]> {
    const allCitas = await this.getAll(consultorioId);
    return allCitas.filter(c => c.date >= dateFrom && c.date <= dateTo);
  }

  async getTodayCitas(consultorioId: string): Promise<LocalCita[]> {
    const today = new Date().toISOString().split('T')[0];
    return await db.citas
      .where('[consultorioId+date]')
      .equals([consultorioId, today])
      .toArray();
  }

  async create(cita: Omit<LocalCita, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>): Promise<LocalCita> {
    const now = new Date().toISOString();
    const newCita: LocalCita = {
      ...cita,
      id: `local_${uuidv4()}`,
      createdAt: now,
      updatedAt: now,
      syncStatus: 'pending',
      localOnly: true,
    };

    await db.citas.add(newCita);
    return newCita;
  }

  async update(id: string, updates: Partial<LocalCita>): Promise<LocalCita | undefined> {
    const existing = await this.getById(id);
    if (!existing) return undefined;

    const updated: LocalCita = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending',
    };

    await db.citas.put(updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    await db.citas.delete(id);
    return true;
  }

  async upsert(cita: LocalCita): Promise<void> {
    await db.citas.put(cita);
  }

  async bulkUpsert(citas: LocalCita[]): Promise<void> {
    await db.citas.bulkPut(citas);
  }

  async updateSyncStatus(id: string, status: 'synced' | 'pending' | 'failed'): Promise<void> {
    await db.citas.update(id, { syncStatus: status, localOnly: status !== 'synced' });
  }

  async updateRemoteId(localId: string, remoteId: string): Promise<void> {
    const cita = await this.getById(localId);
    if (!cita) return;

    await db.citas.delete(localId);
    
    const updated = {
      ...cita,
      id: remoteId,
      syncStatus: 'synced' as const,
      localOnly: false,
    };
    
    await db.citas.add(updated);
  }

  async getPendingSync(): Promise<LocalCita[]> {
    return await db.citas
      .where('syncStatus')
      .equals('pending')
      .toArray();
  }

  async clearAll(): Promise<void> {
    await db.citas.clear();
  }
}

export const citaRepository = new CitaRepository();
