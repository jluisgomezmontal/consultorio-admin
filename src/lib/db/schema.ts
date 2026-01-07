import Dexie, { Table } from 'dexie';

export interface SyncQueueItem {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: 'paciente' | 'cita';
  data: any;
  localId: string;
  remoteId?: string;
  timestamp: number;
  retries: number;
  status: 'pending' | 'syncing' | 'failed' | 'completed';
  error?: string;
  priority: 'high' | 'medium' | 'low';
}

export interface LocalPaciente {
  id: string;
  fullName: string;
  consultorioId: string;
  birthDate?: string;
  age?: number;
  gender?: 'masculino' | 'femenino' | 'otro';
  phone?: string;
  email?: string;
  address?: string;
  bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  medicalInsurance?: any;
  emergencyContact?: any;
  medicalHistory?: string;
  allergies?: string;
  notes?: string;
  clinicalHistory?: any;
  createdAt: string;
  updatedAt: string;
  localOnly?: boolean;
  syncStatus: 'synced' | 'pending' | 'failed';
}

export interface LocalCita {
  id: string;
  pacienteId: string;
  doctorId: string;
  consultorioId: string;
  date: string;
  time: string;
  motivo?: string;
  weight?: number;
  bloodPressure?: string;
  measurements?: any;
  currentCondition?: string;
  physicalExam?: string;
  diagnostico?: string;
  tratamiento?: string;
  medicamentos?: any[];
  estado: 'pendiente' | 'confirmada' | 'completada' | 'cancelada';
  costo?: number;
  notas?: string;
  createdAt: string;
  updatedAt: string;
  localOnly?: boolean;
  syncStatus: 'synced' | 'pending' | 'failed';
}

export interface AppMetadata {
  key: string;
  value: any;
  updatedAt: number;
}

export class ConsultorioDB extends Dexie {
  pacientes!: Table<LocalPaciente, string>;
  citas!: Table<LocalCita, string>;
  syncQueue!: Table<SyncQueueItem, string>;
  metadata!: Table<AppMetadata, string>;

  constructor() {
    super('ConsultorioDB');
    
    this.version(1).stores({
      pacientes: 'id, fullName, consultorioId, syncStatus, updatedAt',
      citas: 'id, pacienteId, doctorId, consultorioId, date, estado, syncStatus, updatedAt',
      syncQueue: 'id, entity, status, priority, timestamp',
      metadata: 'key',
    });
  }
}

export const db = new ConsultorioDB();
