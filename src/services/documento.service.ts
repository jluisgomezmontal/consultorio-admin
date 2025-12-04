import apiClient from '@/lib/api-client';

export interface Documento {
  id: string;
  _id?: string;
  nombre: string;
  descripcion?: string;
  tipo: 'receta' | 'laboratorio' | 'imagen' | 'estudio' | 'consentimiento' | 'historial' | 'otro';
  url: string;
  downloadUrl?: string;
  s3Key: string;
  mimeType: string;
  tamanio: number;
  citaId: string;
  pacienteId: string;
  consultorioId: string;
  uploadedBy: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DocumentosResponse {
  success: boolean;
  data: Documento[];
}

export interface DocumentoResponse {
  success: boolean;
  data: Documento;
  message?: string;
}

export interface DocumentosPaginatedResponse {
  success: boolean;
  documentos: Documento[];
  total: number;
  page: number;
  totalPages: number;
}

export interface UploadDocumentoRequest {
  file: File;
  citaId: string;
  pacienteId: string;
  tipo: Documento['tipo'];
  nombre?: string;
  descripcion?: string;
}

class DocumentoService {
  /**
   * Subir un documento
   */
  async uploadDocumento(data: UploadDocumentoRequest): Promise<DocumentoResponse> {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('citaId', data.citaId);
    formData.append('pacienteId', data.pacienteId);
    formData.append('tipo', data.tipo);
    if (data.nombre) formData.append('nombre', data.nombre);
    if (data.descripcion) formData.append('descripcion', data.descripcion);

    const response = await apiClient.post<DocumentoResponse>('/documentos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  /**
   * Obtener documentos por cita
   */
  async getDocumentosByCita(citaId: string): Promise<DocumentosResponse> {
    const response = await apiClient.get<DocumentosResponse>(`/documentos/cita/${citaId}`);
    return response.data;
  }

  /**
   * Obtener documentos por paciente
   */
  async getDocumentosByPaciente(
    pacienteId: string,
    page = 1,
    limit = 20
  ): Promise<DocumentosPaginatedResponse> {
    const response = await apiClient.get<DocumentosPaginatedResponse>(
      `/documentos/paciente/${pacienteId}`,
      {
        params: { page, limit },
      }
    );
    return response.data;
  }

  /**
   * Obtener documento por ID
   */
  async getDocumentoById(id: string): Promise<DocumentoResponse> {
    const response = await apiClient.get<DocumentoResponse>(`/documentos/${id}`);
    return response.data;
  }

  /**
   * Eliminar documento
   */
  async deleteDocumento(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/documentos/${id}`);
    return response.data;
  }

  /**
   * Actualizar información del documento
   */
  async updateDocumento(
    id: string,
    data: { nombre?: string; descripcion?: string; tipo?: Documento['tipo'] }
  ): Promise<DocumentoResponse> {
    const response = await apiClient.put<DocumentoResponse>(`/documentos/${id}`, data);
    return response.data;
  }

  /**
   * Descargar documento
   */
  downloadDocumento(downloadUrl: string, fileName: string) {
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const documentoService = new DocumentoService();
