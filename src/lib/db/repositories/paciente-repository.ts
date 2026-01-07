import { db, LocalPaciente } from '../schema';
import { v4 as uuidv4 } from 'uuid';

export class PacienteRepository {
  async getAll(consultorioId: string): Promise<LocalPaciente[]> {
    return await db.pacientes
      .where('consultorioId')
      .equals(consultorioId)
      .toArray();
  }

  async getById(id: string): Promise<LocalPaciente | undefined> {
    return await db.pacientes.get(id);
  }

  async search(consultorioId: string, query: string): Promise<LocalPaciente[]> {
    const allPacientes = await this.getAll(consultorioId);
    const lowerQuery = query.toLowerCase();
    
    return allPacientes.filter(p => 
      p.fullName.toLowerCase().includes(lowerQuery) ||
      p.phone?.toLowerCase().includes(lowerQuery) ||
      p.email?.toLowerCase().includes(lowerQuery)
    );
  }

  async create(paciente: Omit<LocalPaciente, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>): Promise<LocalPaciente> {
    const now = new Date().toISOString();
    const newPaciente: LocalPaciente = {
      ...paciente,
      id: `local_${uuidv4()}`,
      createdAt: now,
      updatedAt: now,
      syncStatus: 'pending',
      localOnly: true,
    };

    await db.pacientes.add(newPaciente);
    return newPaciente;
  }

  async update(id: string, updates: Partial<LocalPaciente>): Promise<LocalPaciente | undefined> {
    const existing = await this.getById(id);
    if (!existing) return undefined;

    const updated: LocalPaciente = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending',
    };

    await db.pacientes.put(updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    await db.pacientes.delete(id);
    return true;
  }

  async upsert(paciente: LocalPaciente): Promise<void> {
    await db.pacientes.put(paciente);
  }

  async bulkUpsert(pacientes: LocalPaciente[]): Promise<void> {
    await db.pacientes.bulkPut(pacientes);
  }

  async updateSyncStatus(id: string, status: 'synced' | 'pending' | 'failed'): Promise<void> {
    await db.pacientes.update(id, { syncStatus: status, localOnly: status !== 'synced' });
  }

  async updateRemoteId(localId: string, remoteId: string): Promise<void> {
    const paciente = await this.getById(localId);
    if (!paciente) return;

    await db.pacientes.delete(localId);
    
    const updated = {
      ...paciente,
      id: remoteId,
      syncStatus: 'synced' as const,
      localOnly: false,
    };
    
    await db.pacientes.add(updated);
  }

  async getPendingSync(): Promise<LocalPaciente[]> {
    return await db.pacientes
      .where('syncStatus')
      .equals('pending')
      .toArray();
  }

  async clearAll(): Promise<void> {
    await db.pacientes.clear();
  }
}

export const pacienteRepository = new PacienteRepository();
