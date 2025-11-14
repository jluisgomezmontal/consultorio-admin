import apiClient from '@/lib/api-client';

export interface Paciente {
  id: string;
  fullName: string;
  age?: number;
  gender?: 'masculino' | 'femenino' | 'otro';
  phone?: string;
  email?: string;
  address?: string;
  medicalHistory?: string;
  allergies?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePacienteRequest {
  fullName: string;
  age?: number;
  gender?: 'masculino' | 'femenino' | 'otro';
  phone?: string;
  email?: string;
  address?: string;
  medicalHistory?: string;
  allergies?: string;
  notes?: string;
}

export interface UpdatePacienteRequest {
  fullName?: string;
  age?: number;
  gender?: 'masculino' | 'femenino' | 'otro';
  phone?: string;
  email?: string;
  address?: string;
  medicalHistory?: string;
  allergies?: string;
  notes?: string;
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
