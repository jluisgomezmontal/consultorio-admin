import apiClient from '@/lib/api-client';

export interface DashboardSummary {
  citasHoy: number;
  citasPendientes: number;
  totalPacientes: number;
  ingresosHoy: number;
}

export interface CitasPorEstado {
  estado: string;
  total: number;
}

export interface CitasPorDoctor {
  doctorId: string;
  doctorName: string;
  total: number;
}

export interface CitasPorMes {
  mes: string;
  total: number;
}

export interface CitasReport {
  totalCitas: number;
  citasPorEstado: CitasPorEstado[];
  citasPorDoctor: CitasPorDoctor[];
  citasPorMes: CitasPorMes[];
}

export interface PagosPorMetodo {
  metodo: string;
  total: number;
  cantidad: number;
}

export interface IngresosPorDoctor {
  id: string;
  doctor_name: string;
  total_pagos: number;
  total_ingresos: number;
}

export interface IngresosReport {
  totalIngresos: number;
  totalPagos: number;
  pagosPorMetodo: PagosPorMetodo[];
  ingresosPorDoctor: IngresosPorDoctor[];
}

export interface PacientesPorGenero {
  genero: string;
  total: number;
}

export interface PacientesReport {
  totalPacientes: number;
  nuevosPacientes: number;
  pacientesRecurrentes: number;
  pacientesPorGenero: PacientesPorGenero[];
}

export interface ReporteFilters {
  dateFrom?: string;
  dateTo?: string;
  consultorioId?: string;
  doctorId?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

class ReporteService {
  async getDashboardSummary(consultorioId?: string): Promise<ApiResponse<DashboardSummary>> {
    const response = await apiClient.get<ApiResponse<DashboardSummary>>('/reportes/dashboard', {
      params: consultorioId ? { consultorioId } : {},
    });
    return response.data;
  }

  async getCitasReport(filters: ReporteFilters = {}): Promise<ApiResponse<CitasReport>> {
    const response = await apiClient.get<ApiResponse<CitasReport>>('/reportes/citas', {
      params: filters,
    });
    return response.data;
  }

  async getIngresosReport(filters: ReporteFilters = {}): Promise<ApiResponse<IngresosReport>> {
    const response = await apiClient.get<ApiResponse<IngresosReport>>('/reportes/ingresos', {
      params: filters,
    });
    return response.data;
  }

  async getPacientesReport(consultorioId?: string): Promise<ApiResponse<PacientesReport>> {
    const response = await apiClient.get<ApiResponse<PacientesReport>>('/reportes/pacientes', {
      params: consultorioId ? { consultorioId } : {},
    });
    return response.data;
  }
}

export const reporteService = new ReporteService();
