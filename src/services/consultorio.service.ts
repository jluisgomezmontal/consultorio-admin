import apiClient from '@/lib/api-client';

export interface Consultorio {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  description?: string;
  openHour?: string;
  closeHour?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    users: number;
    citas: number;
  };
}

export interface ConsultorioSummary {
  consultorio: Consultorio & {
    users: {
      id: string;
      name: string;
      email: string;
      role: string;
    }[];
  };
  statistics: {
    totalCitas: number;
    citasHoy: number;
    citasPendientes: number;
    totalPacientes: number;
    totalIngresos: number;
    totalDoctors: number;
    totalStaff: number;
  };
}

export interface ConsultoriosResponse {
  success: boolean;
  data: Consultorio[];
  page: number;
  limit: number;
  total: number;
}

export interface ConsultorioResponse {
  success: boolean;
  data: Consultorio;
}

export interface ConsultorioSummaryResponse {
  success: boolean;
  data: ConsultorioSummary;
}

export interface CreateConsultorioRequest {
  name: string;
  address?: string;
  phone?: string;
  description?: string;
  openHour?: string;
  closeHour?: string;
}

export interface UpdateConsultorioRequest {
  name?: string;
  address?: string;
  phone?: string;
  description?: string;
  openHour?: string;
  closeHour?: string;
}

class ConsultorioService {
  async getAllConsultorios(page = 1, limit = 10): Promise<ConsultoriosResponse> {
    const response = await apiClient.get<ConsultoriosResponse>('/consultorios', {
      params: { page, limit },
    });
    return response.data;
  }

  async getConsultorioById(id: string): Promise<ConsultorioResponse> {
    const response = await apiClient.get<ConsultorioResponse>(`/consultorios/${id}`);
    return response.data;
  }

  async getConsultorioSummary(id: string): Promise<ConsultorioSummaryResponse> {
    const response = await apiClient.get<ConsultorioSummaryResponse>(`/consultorios/${id}/resumen`);
    return response.data;
  }

  async createConsultorio(data: CreateConsultorioRequest): Promise<ConsultorioResponse> {
    const response = await apiClient.post<ConsultorioResponse>('/consultorios', data);
    return response.data;
  }

  async updateConsultorio(id: string, data: UpdateConsultorioRequest): Promise<ConsultorioResponse> {
    const response = await apiClient.put<ConsultorioResponse>(`/consultorios/${id}`, data);
    return response.data;
  }

  async deleteConsultorio(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/consultorios/${id}`);
    return response.data;
  }
}

export const consultorioService = new ConsultorioService();
