import apiClient from '@/lib/api-client';
import { MedicationAllergy } from './medicationAllergy.service';

export interface AntecedentesHeredofamiliares {
  diabetes?: boolean;
  hipertension?: boolean;
  cancer?: boolean;
  cardiopatias?: boolean;
  otros?: string;
}

export interface AntecedentesPersonalesPatologicos {
  cirugias?: string;
  hospitalizaciones?: string;
}

export interface AntecedentesPersonalesNoPatologicos {
  tabaquismo?: boolean;
  alcoholismo?: boolean;
  actividadFisica?: string;
  vacunas?: string;
}

export interface GinecoObstetricos {
  embarazos?: number;
  partos?: number;
  cesareas?: number;
}

export interface ClinicalHistory {
  antecedentesHeredofamiliares?: AntecedentesHeredofamiliares;
  antecedentesPersonalesPatologicos?: AntecedentesPersonalesPatologicos;
  antecedentesPersonalesNoPatologicos?: AntecedentesPersonalesNoPatologicos;
  ginecoObstetricos?: GinecoObstetricos;
}

export interface EmergencyContact {
  name?: string;
  relationship?: string;
  phone?: string;
}

export interface MedicalInsurance {
  insurer?: string;
  policyNumber?: string;
  holderName?: string;
  relationship?: 'Titular' | 'Esposo(a)' | 'Hijo(a)' | 'Otro';
}

export interface Paciente {
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
  medicalInsurance?: MedicalInsurance;
  emergencyContact?: EmergencyContact;
  medicalHistory?: string;
  allergies?: string;
  medicationAllergies?: MedicationAllergy[];
  notes?: string;
  clinicalHistory?: ClinicalHistory;
  photoUrl?: string;
  photoS3Key?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePacienteRequest {
  fullName: string;
  consultorioId: string;
  birthDate?: string;
  age?: number;
  gender?: 'masculino' | 'femenino' | 'otro';
  phone?: string;
  email?: string;
  address?: string;
  bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  medicalInsurance?: MedicalInsurance;
  emergencyContact?: EmergencyContact;
  medicalHistory?: string;
  allergies?: string;
  medicationAllergies?: string[];
  notes?: string;
  clinicalHistory?: ClinicalHistory;
  photoUrl?: string;
  photoS3Key?: string;
}

export interface UpdatePacienteRequest {
  fullName?: string;
  birthDate?: string;
  age?: number;
  gender?: 'masculino' | 'femenino' | 'otro';
  phone?: string;
  email?: string;
  address?: string;
  bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  medicalInsurance?: MedicalInsurance;
  emergencyContact?: EmergencyContact;
  medicalHistory?: string;
  allergies?: string;
  medicationAllergies?: string[];
  notes?: string;
  clinicalHistory?: ClinicalHistory;
  photoUrl?: string;
  photoS3Key?: string;
}

export interface PacientesResponse {
  success: boolean;
  data: Paciente[];
  page: number;
  limit: number;
  total: number;
  message?: string;
}

export interface PacienteResponse {
  success: boolean;
  data: Paciente;
  message?: string;
}

export interface PacienteHistoryResponse {
  success: boolean;
  data: Paciente & {
    citas: any[];
  };
}

class PacienteService {
  async getAllPacientes(page = 1, limit = 10, search = ''): Promise<PacientesResponse> {
    const response = await apiClient.get<PacientesResponse>('/pacientes', {
      params: { page, limit, search },
    });
    return response.data;
  }

  async searchPacientes(query: string): Promise<{ success: boolean; data: Paciente[] }> {
    const response = await apiClient.get('/pacientes/search', {
      params: { q: query },
    });
    return response.data;
  }

  async getPacienteById(id: string): Promise<PacienteResponse> {
    const response = await apiClient.get<PacienteResponse>(`/pacientes/${id}`);
    return response.data;
  }

  async getPacienteHistory(id: string): Promise<PacienteHistoryResponse> {
    const response = await apiClient.get<PacienteHistoryResponse>(`/pacientes/${id}/historial`);
    return response.data;
  }

  async createPaciente(data: CreatePacienteRequest): Promise<PacienteResponse> {
    const response = await apiClient.post<PacienteResponse>('/pacientes', data);
    return response.data;
  }

  async updatePaciente(id: string, data: UpdatePacienteRequest): Promise<PacienteResponse> {
    const response = await apiClient.put<PacienteResponse>(`/pacientes/${id}`, data);
    return response.data;
  }

  async deletePaciente(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/pacientes/${id}`);
    return response.data;
  }

  async uploadPhoto(file: File): Promise<{ success: boolean; data: { photoUrl: string; s3Key: string } }> {
    const formData = new FormData();
    formData.append('photo', file);
    
    const response = await apiClient.post('/pacientes-photo/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async deletePhoto(s3Key: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete('/pacientes-photo/delete', {
      data: { s3Key },
    });
    return response.data;
  }
}

export const pacienteService = new PacienteService();
