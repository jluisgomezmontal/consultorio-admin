import { pacienteRepository } from './db/repositories/paciente-repository';
import { citaRepository } from './db/repositories/cita-repository';
import apiClient from './api-client';
import { LocalPaciente, LocalCita } from './db/schema';

/**
 * Preload data from server to IndexedDB for offline access
 */
export class OfflineDataSync {
  private isPreloading = false;

  /**
   * Preload all pacientes from server to IndexedDB
   */
  async preloadPacientes(consultorioId: string): Promise<void> {
    if (this.isPreloading) return;
    
    try {
      this.isPreloading = true;
      console.log('[Offline Data Sync] Preloading pacientes for consultorio:', consultorioId);
      
      // Fetch all pacientes from server (using large limit to get all)
      const response = await apiClient.get('/pacientes', {
        params: { page: 1, limit: 1000, search: '' }
      });
      
      if (response.data?.data && response.data.data.length > 0) {
        const pacientes = response.data.data;
        
        // Get existing local-only records (created offline, not yet synced)
        const existingLocal = await pacienteRepository.getAll(consultorioId);
        const localOnlyRecords = existingLocal.filter(p => p.localOnly && p.id.startsWith('local_'));
        
        console.log(`[Offline Data Sync] Found ${localOnlyRecords.length} local-only records`);
        
        // Convert to LocalPaciente format
        const localPacientes: LocalPaciente[] = pacientes.map((p: any) => ({
          id: p.id,
          fullName: p.fullName,
          consultorioId: p.consultorioId,
          birthDate: p.birthDate,
          age: p.age,
          gender: p.gender,
          phone: p.phone,
          email: p.email,
          address: p.address,
          bloodType: p.bloodType,
          medicalInsurance: p.medicalInsurance,
          emergencyContact: p.emergencyContact,
          medicalHistory: p.medicalHistory,
          allergies: p.allergies,
          notes: p.notes,
          clinicalHistory: p.clinicalHistory,
          createdAt: p.createdAt || new Date().toISOString(),
          updatedAt: p.updatedAt || new Date().toISOString(),
          syncStatus: 'synced' as const,
          localOnly: false,
        }));

        // Bulk upsert to IndexedDB (will overwrite existing non-local records)
        await pacienteRepository.bulkUpsert(localPacientes);
        console.log(`[Offline Data Sync] Preloaded ${localPacientes.length} pacientes to IndexedDB`);
        
        // Keep local-only records (they'll sync later)
        if (localOnlyRecords.length > 0) {
          console.log(`[Offline Data Sync] Preserving ${localOnlyRecords.length} local-only records for sync`);
        }
      }
    } catch (error) {
      console.error('[Offline Data Sync] Error preloading pacientes:', error);
    } finally {
      this.isPreloading = false;
    }
  }

  /**
   * Preload all citas from server to IndexedDB
   */
  async preloadCitas(consultorioId: string): Promise<void> {
    if (this.isPreloading) return;
    
    try {
      this.isPreloading = true;
      console.log('[Offline Data Sync] Preloading citas for consultorio:', consultorioId);
      
      // Fetch all citas from server
      const response = await apiClient.get('/citas');
      
      if (response.data?.data && response.data.data.length > 0) {
        const citas = response.data.data;
        
        // Get existing local-only records (created offline, not yet synced)
        const existingLocal = await citaRepository.getAll(consultorioId);
        const localOnlyRecords = existingLocal.filter(c => c.localOnly && c.id.startsWith('local_'));
        
        console.log(`[Offline Data Sync] Found ${localOnlyRecords.length} local-only citas`);
        
        // Convert to LocalCita format
        const localCitas: LocalCita[] = citas.map((c: any) => ({
          id: c.id,
          pacienteId: c.pacienteId,
          doctorId: c.doctorId,
          consultorioId: c.consultorioId,
          date: c.date,
          time: c.time,
          motivo: c.motivo,
          weight: c.weight,
          bloodPressure: c.bloodPressure,
          measurements: c.measurements,
          currentCondition: c.currentCondition,
          physicalExam: c.physicalExam,
          diagnostico: c.diagnostico,
          tratamiento: c.tratamiento,
          medicamentos: c.medicamentos,
          estado: c.estado,
          costo: c.costo,
          notas: c.notas,
          createdAt: c.createdAt || new Date().toISOString(),
          updatedAt: c.updatedAt || new Date().toISOString(),
          syncStatus: 'synced' as const,
          localOnly: false,
        }));

        // Bulk upsert to IndexedDB (will overwrite existing non-local records)
        await citaRepository.bulkUpsert(localCitas);
        console.log(`[Offline Data Sync] Preloaded ${localCitas.length} citas to IndexedDB`);
        
        // Keep local-only records (they'll sync later)
        if (localOnlyRecords.length > 0) {
          console.log(`[Offline Data Sync] Preserving ${localOnlyRecords.length} local-only citas for sync`);
        }
      }
    } catch (error) {
      console.error('[Offline Data Sync] Error preloading citas:', error);
    } finally {
      this.isPreloading = false;
    }
  }

  /**
   * Preload all data (pacientes and citas) for a consultorio
   */
  async preloadAll(consultorioId: string): Promise<void> {
    if (!consultorioId) {
      console.warn('[Offline Data Sync] No consultorioId provided, skipping preload');
      return;
    }

    console.log('[Offline Data Sync] Starting full data preload...');
    await Promise.all([
      this.preloadPacientes(consultorioId),
      this.preloadCitas(consultorioId),
    ]);
    console.log('[Offline Data Sync] Full data preload completed');
  }
}

export const offlineDataSync = new OfflineDataSync();
