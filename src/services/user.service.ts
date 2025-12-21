import apiClient from '@/lib/api-client';

export interface Consultorio {
  id?: string;
  name: string;
  address?: string;
  phone?: string;
  description?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'doctor' | 'recepcionista';
  consultoriosIds: string[];
  consultorios?: Consultorio[];
  cedulas?: string[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: string;
  consultoriosIds: string[];
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: string;
  consultoriosIds?: string[];
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  cedulas?: string[];
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateReceptionistRequest {
  name?: string;
  email?: string;
  password?: string;
}

export interface UsersResponse {
  success: boolean;
  data: User[];
  message?: string;
}

export interface UserResponse {
  success: boolean;
  data: User;
  message?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

class UserService {
  async getAllUsers(): Promise<UsersResponse> {
    const response = await apiClient.get<UsersResponse>('/users');
    return response.data;
  }

  async getDoctors(): Promise<UsersResponse> {
    const response = await apiClient.get<UsersResponse>('/users/doctors');
    return response.data;
  }

  async getUserById(id: string): Promise<UserResponse> {
    const response = await apiClient.get<UserResponse>(`/users/${id}`);
    return response.data;
  }

  async createUser(data: CreateUserRequest): Promise<UserResponse> {
    const response = await apiClient.post<UserResponse>('/users', data);
    return response.data;
  }

  async updateUser(id: string, data: UpdateUserRequest): Promise<UserResponse> {
    const response = await apiClient.put<UserResponse>(`/users/${id}`, data);
    return response.data;
  }

  async deleteUser(id: string): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/users/${id}`);
    return response.data;
  }

  async updateOwnProfile(data: UpdateProfileRequest): Promise<ApiResponse<User>> {
    const response = await apiClient.put<ApiResponse<User>>('/users/me/profile', data);
    return response.data;
  }

  async updateOwnPassword(data: UpdatePasswordRequest): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.put<ApiResponse<{ message: string }>>('/users/me/password', data);
    return response.data;
  }

  async getReceptionistsByConsultorio(consultorioId: string): Promise<ApiResponse<User[]>> {
    const response = await apiClient.get<ApiResponse<User[]>>('/users/receptionists', {
      params: { consultorioId },
    });
    return response.data;
  }

  async updateReceptionist(id: string, data: UpdateReceptionistRequest): Promise<ApiResponse<User>> {
    const response = await apiClient.put<ApiResponse<User>>(`/users/receptionists/${id}`, data);
    return response.data;
  }

  async updatePassword(id: string, password: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.patch(`/users/${id}/password`, { password });
    return response.data;
  }

  async toggleUserStatus(id: string, isActive: boolean): Promise<UserResponse> {
    const response = await apiClient.patch<UserResponse>(`/users/${id}/status`, { isActive });
    return response.data;
  }
}

export const userService = new UserService();
