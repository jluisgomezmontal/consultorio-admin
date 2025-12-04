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
  role: string;
  consultoriosIds: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  consultorios?: Consultorio[];
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

  async deleteUser(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/users/${id}`);
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
