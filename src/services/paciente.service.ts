import apiClient from '@/lib/api-client';

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
  medicalInsurance?: string;
  emergencyContact?: EmergencyContact;
  medicalHistory?: string;
  allergies?: string;
  notes?: string;
  clinicalHistory?: ClinicalHistory;
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
  medicalInsurance?: string;
  emergencyContact?: EmergencyContact;
  medicalHistory?: string;
  allergies?: string;
  notes?: string;
  clinicalHistory?: ClinicalHistory;
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
  medicalInsurance?: string;
  emergencyContact?: EmergencyContact;
  medicalHistory?: string;
  allergies?: string;
  notes?: string;
  clinicalHistory?: ClinicalHistory;
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
}

export const pacienteService = new PacienteService();
