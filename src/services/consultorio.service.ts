import apiClient from '@/lib/api-client';

export interface ClinicalHistoryConfig {
  antecedentesHeredofamiliares: boolean;
  antecedentesPersonalesPatologicos: boolean;
  antecedentesPersonalesNoPatologicos: boolean;
  ginecoObstetricos: boolean;
}

export interface ConsultorioPermissions {
  allowReceptionistViewClinicalSummary: boolean;
}

export interface AppointmentSectionsConfig {
  signosVitales: boolean;
  evaluacionMedica: boolean;
  diagnosticoTratamiento: boolean;
  medicamentos: boolean;
  notasAdicionales: boolean;
}

export interface Consultorio {
  id: string;
  _id?: string; // MongoDB ID for compatibility
  name: string;
  address?: string;
  phone?: string;
  description?: string;
  openHour?: string;
  closeHour?: string;
  imageUrl?: string;
  s3ImageKey?: string;
  recetaTemplate?: 'template1' | 'template2' | 'template3' | 'template4' | 'template5';
  clinicalHistoryConfig?: ClinicalHistoryConfig;
  permissions?: ConsultorioPermissions;
  appointmentSectionsConfig?: AppointmentSectionsConfig;
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

export interface UpdateConsultorioBasicInfoRequest {
  name?: string;
  description?: string;
  address?: string;
  phone?: string;
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

  async getClinicalHistoryConfig(id: string): Promise<{ success: boolean; data: ClinicalHistoryConfig }> {
    const response = await apiClient.get<{ success: boolean; data: ClinicalHistoryConfig }>(`/consultorios/${id}/clinical-history-config`);
    return response.data;
  }

  async updateClinicalHistoryConfig(id: string, config: ClinicalHistoryConfig): Promise<ConsultorioResponse> {
    const response = await apiClient.put<ConsultorioResponse>(`/consultorios/${id}/clinical-history-config`, config);
    return response.data;
  }

  async updateConsultorioBasicInfo(id: string, data: UpdateConsultorioBasicInfoRequest, imageFile?: File): Promise<ConsultorioResponse> {
    const formData = new FormData();
    
    Object.keys(data).forEach((key) => {
      const value = data[key as keyof UpdateConsultorioBasicInfoRequest];
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    if (imageFile) {
      formData.append('image', imageFile);
    }

    const response = await apiClient.put<ConsultorioResponse>(`/consultorios/${id}/basic-info`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async updateRecetaTemplate(id: string, template: 'template1' | 'template2' | 'template3' | 'template4' | 'template5'): Promise<ConsultorioResponse> {
    const response = await apiClient.put<ConsultorioResponse>(`/consultorios/${id}/receta-template`, {
      recetaTemplate: template,
    });
    return response.data;
  }

  async updatePermissions(id: string, permissions: ConsultorioPermissions): Promise<ConsultorioResponse> {
    const response = await apiClient.put<ConsultorioResponse>(`/consultorios/${id}/permissions`, {
      permissions,
    });
    return response.data;
  }

  async getAppointmentSectionsConfig(id: string): Promise<{ success: boolean; data: AppointmentSectionsConfig }> {
    const response = await apiClient.get<{ success: boolean; data: AppointmentSectionsConfig }>(`/consultorios/${id}/appointment-sections-config`);
    return response.data;
  }

  async updateAppointmentSectionsConfig(id: string, config: AppointmentSectionsConfig): Promise<ConsultorioResponse> {
    const response = await apiClient.put<ConsultorioResponse>(`/consultorios/${id}/appointment-sections-config`, config);
    return response.data;
  }

  async exportDataAsJSON(id: string): Promise<void> {
    const response = await apiClient.get(`/consultorios/${id}/export?format=json`);
    
    const jsonString = JSON.stringify(response.data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `consultorio-export-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  async exportDataAsExcel(id: string): Promise<void> {
    const response = await apiClient.get(`/consultorios/${id}/export?format=excel`, {
      responseType: 'blob',
    });
    
    const blob = new Blob([response.data], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `consultorio-export-${Date.now()}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

export const consultorioService = new ConsultorioService();
