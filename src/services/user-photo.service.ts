import apiClient from '@/lib/api-client';

export interface UserPhotoUploadResponse {
  success: boolean;
  data: {
    photoUrl: string;
    s3Key: string;
  };
}

export interface UserPhotoDeleteResponse {
  success: boolean;
  message: string;
}

class UserPhotoService {
  async uploadPhoto(file: File): Promise<UserPhotoUploadResponse> {
    const formData = new FormData();
    formData.append('photo', file);
    
    const response = await apiClient.post('/user-photos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async deletePhoto(s3Key: string): Promise<UserPhotoDeleteResponse> {
    const response = await apiClient.delete('/user-photos/delete', {
      data: { s3Key },
    });
    return response.data;
  }

  async updateMyPhoto(photoUrl: string, photoS3Key: string): Promise<UserPhotoUploadResponse> {
    const response = await apiClient.put('/user-photos/my-photo', {
      photoUrl,
      photoS3Key,
    });
    return response.data;
  }

  async deleteMyPhoto(): Promise<UserPhotoDeleteResponse> {
    const response = await apiClient.delete('/user-photos/my-photo');
    return response.data;
  }
}

export const userPhotoService = new UserPhotoService();
