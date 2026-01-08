import apiClient from '@/lib/api-client';

export interface Paquete {
  id: string;
  nombre: string;
  displayName: string;
  descripcion: string;
  precio: {
    mensual: number;
    anual: number;
  };
  stripePriceIds?: {
    mensual?: string;
    anual?: string;
  };
  limites: {
    consultorios: number;
    doctores: number;
    recepcionistas: number;
    pacientes: number | null;
    citas: number | null;
  };
  features: {
    uploadDocumentos: boolean;
    uploadImagenes: boolean;
    reportesAvanzados: boolean;
    integraciones: boolean;
    soportePrioritario: boolean;
  };
  activo: boolean;
  orden: number;
}

export interface Suscripcion {
  estado: 'activa' | 'vencida' | 'cancelada' | 'trial';
  fechaInicio: string;
  fechaVencimiento?: string;
  tipoPago: 'mensual' | 'anual';
}

export interface ConsultorioPaqueteInfo {
  paquete: {
    nombre: string;
    displayName: string;
    descripcion: string;
  };
  suscripcion: Suscripcion;
  uso: {
    doctores: {
      actual: number;
      limite: number;
      disponible: number;
    };
    recepcionistas: {
      actual: number;
      limite: number;
      disponible: number;
    };
  };
  features: {
    uploadDocumentos: boolean;
    uploadImagenes: boolean;
    reportesAvanzados: boolean;
    integraciones: boolean;
    soportePrioritario: boolean;
  };
}

export interface VerificacionLimite {
  permitido: boolean;
  actual: number;
  limite: number;
  mensaje: string;
}

export interface VerificacionFeature {
  permitido: boolean;
  feature: string;
  paquete: string;
  mensaje: string;
}

class PaqueteService {
  async getAllPaquetes(): Promise<{ success: boolean; data: Paquete[] }> {
    const response = await apiClient.get('/paquetes');
    return response.data;
  }

  async getMiPaquete(): Promise<{ success: boolean; data: ConsultorioPaqueteInfo }> {
    const response = await apiClient.get('/paquetes/mi-paquete');
    return response.data;
  }

  async verificarLimite(tipo: 'doctor' | 'recepcionista' | 'consultorio'): Promise<{ success: boolean; data: VerificacionLimite }> {
    const response = await apiClient.get(`/paquetes/verificar-limite/${tipo}`);
    return response.data;
  }

  async verificarFeature(feature: string): Promise<{ success: boolean; data: VerificacionFeature }> {
    const response = await apiClient.get(`/paquetes/verificar-feature/${feature}`);
    return response.data;
  }

  async actualizarPaquete(paquete: string, tipoPago: 'mensual' | 'anual'): Promise<{ success: boolean; data: any; message: string }> {
    const response = await apiClient.put('/paquetes/actualizar', { paquete, tipoPago });
    return response.data;
  }

  async inicializarPaquetes(): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post('/paquetes/inicializar');
    return response.data;
  }

  async getPaqueteById(id: string): Promise<{ success: boolean; data: Paquete }> {
    const response = await apiClient.get(`/paquetes/admin/paquetes/${id}`);
    return response.data;
  }

  async crearPaquete(data: Partial<Paquete>): Promise<{ success: boolean; data: Paquete; message: string }> {
    const response = await apiClient.post('/paquetes/admin/paquetes', data);
    return response.data;
  }

  async actualizarPaqueteById(id: string, data: Partial<Paquete>): Promise<{ success: boolean; data: Paquete; message: string }> {
    const response = await apiClient.put(`/paquetes/admin/paquetes/${id}`, data);
    return response.data;
  }

  async eliminarPaquete(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/paquetes/admin/paquetes/${id}`);
    return response.data;
  }

  async getAllConsultoriosConPaquete(): Promise<{ success: boolean; data: any[] }> {
    const response = await apiClient.get('/paquetes/admin/consultorios');
    return response.data;
  }

  async actualizarPaqueteConsultorio(
    consultorioId: string,
    data: { paquete: string; tipoPago?: string; estado?: string; fechaVencimiento?: string }
  ): Promise<{ success: boolean; data: any; message: string }> {
    const response = await apiClient.put(`/paquetes/admin/consultorios/${consultorioId}`, data);
    return response.data;
  }
}

export const paqueteService = new PaqueteService();
