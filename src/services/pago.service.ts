import apiClient from '@/lib/api-client';

export type MetodoPago = 'efectivo' | 'tarjeta' | 'transferencia';
export type EstatusPago = 'pagado' | 'pendiente';

export interface Pago {
  id: string;
  citaId: string;
  monto: number;
  metodo: MetodoPago;
  fechaPago: string;
  estatus: EstatusPago;
  comentarios?: string;
  createdAt: string;
  updatedAt: string;
  cita?: {
    id: string;
    date: string;
    time: string;
    paciente?: {
      id: string;
      fullName: string;
    };
    doctor?: {
      id: string;
      name: string;
    };
    consultorio?: {
      id: string;
      name: string;
    };
  };
}

export interface CreatePagoRequest {
  citaId: string;
  monto: number;
  metodo: MetodoPago;
  fechaPago?: string;
  estatus?: EstatusPago;
  comentarios?: string;
}

export interface UpdatePagoRequest {
  monto?: number;
  metodo?: MetodoPago;
  fechaPago?: string;
  estatus?: EstatusPago;
  comentarios?: string;
}

export interface PagosFilters {
  page?: number;
  limit?: number;
  citaId?: string;
  estatus?: EstatusPago;
  dateFrom?: string;
  dateTo?: string;
}

export interface PagosResponse {
  success: boolean;
  data: Pago[];
  page: number;
  limit: number;
  total: number;
}

export interface PagoResponse {
  success: boolean;
  data: Pago;
}

export interface IncomeReport {
  totalIngresos: number;
  totalPagado: number;
  totalPendiente: number;
  pagosPorMetodo: {
    efectivo: number;
    tarjeta: number;
    transferencia: number;
  };
  pagosPorEstatus: {
    pagado: number;
    pendiente: number;
  };
}

export interface IncomeReportResponse {
  success: boolean;
  data: IncomeReport;
}

class PagoService {
  async getAllPagos(filters: PagosFilters = {}): Promise<PagosResponse> {
    const response = await apiClient.get<PagosResponse>('/pagos', {
      params: filters,
    });
    return response.data;
  }

  async getPagoById(id: string): Promise<PagoResponse> {
    const response = await apiClient.get<PagoResponse>(`/pagos/${id}`);
    return response.data;
  }

  async getIncomeReport(params: {
    dateFrom?: string;
    dateTo?: string;
    doctorId?: string;
    consultorioId?: string;
  } = {}): Promise<IncomeReportResponse> {
    const response = await apiClient.get<IncomeReportResponse>('/pagos/ingresos', {
      params,
    });
    return response.data;
  }

  async createPago(data: CreatePagoRequest): Promise<PagoResponse> {
    const response = await apiClient.post<PagoResponse>('/pagos', data);
    return response.data;
  }

  async updatePago(id: string, data: UpdatePagoRequest): Promise<PagoResponse> {
    const response = await apiClient.put<PagoResponse>(`/pagos/${id}`, data);
    return response.data;
  }

  async deletePago(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/pagos/${id}`);
    return response.data;
  }
}

export const pagoService = new PagoService();
