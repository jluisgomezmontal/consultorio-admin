import apiClient from '@/lib/api-client';

export interface MedicationAllergy {
  id: string;
  name: string;
  category: 'Antibióticos' | 'Analgésicos' | 'Antiinflamatorios' | 'Antihistamínicos' | 'Anestésicos' | 'Anticonvulsivantes' | 'Cardiovasculares' | 'Insulinas' | 'Otros';
  activeIngredient?: string;
  commonBrands?: string[];
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MedicationAllergiesResponse {
  success: boolean;
  data: MedicationAllergy[];
  page: number;
  limit: number;
  total: number;
  message?: string;
}

export interface MedicationAllergyResponse {
  success: boolean;
  data: MedicationAllergy;
  message?: string;
}

export interface MedicationAllergiesByCategoryResponse {
  success: boolean;
  data: Record<string, MedicationAllergy[]>;
  message?: string;
}

class MedicationAllergyService {
  async getAllMedicationAllergies(
    page = 1,
    limit = 50,
    search = '',
    category = ''
  ): Promise<MedicationAllergiesResponse> {
    const response = await apiClient.get<MedicationAllergiesResponse>('/medication-allergies', {
      params: { page, limit, search, category },
    });
    return response.data;
  }

  async getMedicationAllergyById(id: string): Promise<MedicationAllergyResponse> {
    const response = await apiClient.get<MedicationAllergyResponse>(`/medication-allergies/${id}`);
    return response.data;
  }

  async getMedicationsByCategory(): Promise<MedicationAllergiesByCategoryResponse> {
    const response = await apiClient.get<MedicationAllergiesByCategoryResponse>('/medication-allergies/by-category');
    return response.data;
  }

  async getPacienteMedicationAllergies(pacienteId: string): Promise<{ success: boolean; data: MedicationAllergy[] }> {
    const response = await apiClient.get(`/medication-allergies/pacientes/${pacienteId}`);
    return response.data;
  }

  async addMedicationAllergyToPaciente(
    pacienteId: string,
    medicationAllergyId: string
  ): Promise<{ success: boolean; data: any; message: string }> {
    const response = await apiClient.post(
      `/medication-allergies/pacientes/${pacienteId}/${medicationAllergyId}`
    );
    return response.data;
  }

  async removeMedicationAllergyFromPaciente(
    pacienteId: string,
    medicationAllergyId: string
  ): Promise<{ success: boolean; data: any; message: string }> {
    const response = await apiClient.delete(
      `/medication-allergies/pacientes/${pacienteId}/${medicationAllergyId}`
    );
    return response.data;
  }
}

export const medicationAllergyService = new MedicationAllergyService();
