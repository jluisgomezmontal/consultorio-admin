import { metadataRepository } from '@/lib/db/repositories/metadata-repository';
import { db } from '@/lib/db/schema';

const MAX_OFFLINE_TIME = parseInt(process.env.NEXT_PUBLIC_MAX_OFFLINE_TIME || '604800000', 10);

export interface AuthMetadata {
  token: string;
  refreshToken: string;
  tokenExpiry: number;
  lastOnlineTime: number;
  userId: string;
  userEmail: string;
  userName: string;
  userRole: string;
}

export class OfflineAuth {
  async saveAuthData(
    token: string,
    refreshToken: string,
    user: { id: string; email: string; name: string; role: string }
  ): Promise<void> {
    const tokenExpiry = this.extractTokenExpiry(token);
    
    const authMetadata: AuthMetadata = {
      token,
      refreshToken,
      tokenExpiry,
      lastOnlineTime: Date.now(),
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      userRole: user.role,
    };

    await metadataRepository.setAuthMetadata(authMetadata);
  }

  async updateLastOnlineTime(): Promise<void> {
    const currentAuth = await metadataRepository.getAuthMetadata();
    if (currentAuth) {
      await metadataRepository.setAuthMetadata({
        ...currentAuth,
        lastOnlineTime: Date.now(),
      });
    }
  }

  async updateTokens(token: string, refreshToken: string): Promise<void> {
    const currentAuth = await metadataRepository.getAuthMetadata();
    if (currentAuth) {
      const tokenExpiry = this.extractTokenExpiry(token);
      await metadataRepository.setAuthMetadata({
        ...currentAuth,
        token,
        refreshToken,
        tokenExpiry,
        lastOnlineTime: Date.now(),
      });
    }
  }

  async canWorkOffline(): Promise<{
    allowed: boolean;
    reason?: string;
  }> {
    const authMetadata = await metadataRepository.getAuthMetadata();
    
    if (!authMetadata || !authMetadata.token) {
      return {
        allowed: false,
        reason: 'No hay sesión iniciada. Por favor, conéctese a internet para iniciar sesión.',
      };
    }

    const now = Date.now();
    const offlineTime = now - authMetadata.lastOnlineTime;

    if (offlineTime > MAX_OFFLINE_TIME) {
      return {
        allowed: false,
        reason: `Ha estado sin conexión por más de ${Math.floor(MAX_OFFLINE_TIME / (24 * 60 * 60 * 1000))} días. Por favor, conéctese a internet para continuar.`,
      };
    }

    if (now > authMetadata.tokenExpiry) {
      return {
        allowed: false,
        reason: 'Su sesión ha expirado. Por favor, conéctese a internet para renovar su sesión.',
      };
    }

    return { allowed: true };
  }

  async getOfflineUser(): Promise<{
    id: string;
    email: string;
    name: string;
    role: string;
  } | null> {
    const authMetadata = await metadataRepository.getAuthMetadata();
    
    if (!authMetadata) return null;

    return {
      id: authMetadata.userId,
      email: authMetadata.userEmail,
      name: authMetadata.userName,
      role: authMetadata.userRole,
    };
  }

  async clearAuthData(): Promise<void> {
    await metadataRepository.clearAuthMetadata();
    
    await db.pacientes.clear();
    await db.citas.clear();
    await db.syncQueue.clear();
  }

  private extractTokenExpiry(token: string): number {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp ? payload.exp * 1000 : Date.now() + 24 * 60 * 60 * 1000;
    } catch (error) {
      console.error('Error extracting token expiry:', error);
      return Date.now() + 24 * 60 * 60 * 1000;
    }
  }

  async isTokenValid(): Promise<boolean> {
    const authMetadata = await metadataRepository.getAuthMetadata();
    if (!authMetadata || !authMetadata.token) return false;

    const now = Date.now();
    return now < authMetadata.tokenExpiry;
  }

  async getToken(): Promise<string | null> {
    const authMetadata = await metadataRepository.getAuthMetadata();
    return authMetadata?.token || null;
  }

  async getRefreshToken(): Promise<string | null> {
    const authMetadata = await metadataRepository.getAuthMetadata();
    return authMetadata?.refreshToken || null;
  }
}

export const offlineAuth = new OfflineAuth();
