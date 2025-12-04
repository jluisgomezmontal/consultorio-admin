import apiClient from '@/lib/api-client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: string;
  consultoriosIds?: string[];
}

export interface Consultorio {
  id?: string;
  _id?: string; // MongoDB ID for compatibility
  name: string;
  address?: string;
  phone?: string;
  description?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive?: boolean;
  consultoriosIds?: string[];
  consultorios?: Consultorio[];
}

export interface LoginResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    user: User;
  };
  message: string;
}

export interface UserResponse {
  success: boolean;
  data: User;
}

export interface RefreshTokenResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
  };
  message: string;
}

class AuthService {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);
    return response.data;
  }

  async register(data: RegisterRequest): Promise<UserResponse> {
    const response = await apiClient.post<UserResponse>('/auth/register', data);
    return response.data;
  }

  async getCurrentUser(): Promise<UserResponse> {
    const response = await apiClient.get<UserResponse>('/auth/me');
    return response.data;
  }

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  }

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  }
}

export const authService = new AuthService();
