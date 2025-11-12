import apiClient from '@/lib/api-client';

export type CitaEstado = 'pendiente' | 'confirmada' | 'completada' | 'cancelada';

export interface CitaPaciente {
  id: string;
  fullName: string;
  phone?: string;
  email?: string;
}

export interface CitaDoctor {
  id: string;
  name: string;
  email?: string;
  role?: string;
}

export interface CitaConsultorio {
  id: string;
  name: string;
}

export interface Cita {
  id: string;
  pacienteId: string;
  doctorId: string;
  consultorioId: string;
  date: string;
  time: string;
  motivo?: string;
  diagnostico?: string;
  tratamiento?: string;
  estado: CitaEstado;
  costo?: number;
  notas?: string;
  createdAt: string;
  updatedAt: string;
  paciente?: CitaPaciente;
  doctor?: CitaDoctor;
  consultorio?: CitaConsultorio;
  pagos?: {
    id: string;
    monto: number;
    estatus: string;
    createdAt: string;
  }[];
}

export interface CreateCitaRequest {
  pacienteId: string;
  doctorId: string;
  consultorioId: string;
  date: string;
  time: string;
  motivo?: string;
  diagnostico?: string;
  tratamiento?: string;
  estado?: CitaEstado;
  costo?: number;
  notas?: string;
}

export interface UpdateCitaRequest {
  pacienteId?: string;
  doctorId?: string;
  consultorioId?: string;
  date?: string;
  time?: string;
  motivo?: string;
  diagnostico?: string;
  tratamiento?: string;
  estado?: CitaEstado;
  costo?: number;
  notas?: string;
}

export interface CitasFilters {
  page?: number;
  limit?: number;
  doctorId?: string;
  pacienteId?: string;
  consultorioId?: string;
  estado?: CitaEstado;
  dateFrom?: string;
  dateTo?: string;
}

export interface CitasResponse {
  success: boolean;
  data: Cita[];
  page: number;
  limit: number;
  total: number;
}

export interface CitaResponse {
  success: boolean;
  data: Cita;
}

export interface CalendarCita {
  id: string;
  date: string;
  time: string;
  motivo?: string;
  estado: CitaEstado;
  paciente: {
    id: string;
    fullName: string;
    phone?: string;
  };
  doctor: {
    id: string;
    name: string;
  };
}

export interface CalendarResponse {
  success: boolean;
  data: CalendarCita[];
}

class CitaService {
  async getAllCitas(filters: CitasFilters = {}): Promise<CitasResponse> {
    const response = await apiClient.get<CitasResponse>('/citas', {
      params: filters,
    });
    return response.data;
  }

  async getCitaById(id: string): Promise<CitaResponse> {
    const response = await apiClient.get<CitaResponse>(`/citas/${id}`);
    return response.data;
  }

  async getCalendar(params: { doctorId?: string; consultorioId?: string; month?: number; year?: number } = {}): Promise<CalendarResponse> {
    const response = await apiClient.get<CalendarResponse>('/citas/calendario', {
      params,
    });
    return response.data;
  }

  async createCita(data: CreateCitaRequest): Promise<CitaResponse> {
    const response = await apiClient.post<CitaResponse>('/citas', data);
    return response.data;
  }

  async updateCita(id: string, data: UpdateCitaRequest): Promise<CitaResponse> {
    const response = await apiClient.put<CitaResponse>(`/citas/${id}`, data);
    return response.data;
  }

  async cancelCita(id: string): Promise<CitaResponse> {
    const response = await apiClient.patch<CitaResponse>(`/citas/${id}/cancelar`);
    return response.data;
  }

  async deleteCita(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/citas/${id}`);
    return response.data;
  }
}

export const citaService = new CitaService();
