import apiClient from '@/lib/api-client';

export interface Medicamento {
  nombre: string;
  dosis?: string;
  frecuencia?: string;
  duracion?: string;
  indicaciones?: string;
}

export interface GenerateRecetaRequest {
  citaId: string;
  diagnostico: string;
  medicamentos: Medicamento[];
  indicaciones?: string;
}

class RecetaService {
  async generateReceta(data: GenerateRecetaRequest): Promise<Blob> {
    const response = await apiClient.post('/recetas/generate', data, {
      responseType: 'blob',
    });
    return response.data;
  }

  async previewTemplate(templateName: 'template1' | 'template2' | 'template3' | 'template4' | 'template5'): Promise<string> {
    const response = await apiClient.get<string>('/recetas/preview-template', {
      params: { templateName },
    });
    return response.data;
  }
}

export const recetaService = new RecetaService();
