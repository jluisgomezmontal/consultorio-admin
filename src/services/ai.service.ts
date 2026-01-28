import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface MedicamentoSuggestion {
  nombre: string;
  dosis?: string;
  frecuencia?: string;
  duracion?: string;
  indicaciones?: string;
}

export interface TreatmentSuggestion {
  tratamiento: string;
  medicamentos: MedicamentoSuggestion[];
  notas?: string;
  advertencias?: string[];
}

export interface SuggestTreatmentRequest {
  diagnostico: string;
  pacienteId?: string;
}

class AIService {
  async suggestTreatment(data: SuggestTreatmentRequest): Promise<TreatmentSuggestion> {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/ai/suggest-treatment`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  }
}

export const aiService = new AIService();
