import { db, AppMetadata } from '../schema';

export class MetadataRepository {
  async get(key: string): Promise<any | undefined> {
    const metadata = await db.metadata.get(key);
    return metadata?.value;
  }

  async set(key: string, value: any): Promise<void> {
    const metadata: AppMetadata = {
      key,
      value,
      updatedAt: Date.now(),
    };
    await db.metadata.put(metadata);
  }

  async delete(key: string): Promise<void> {
    await db.metadata.delete(key);
  }

  async clear(): Promise<void> {
    await db.metadata.clear();
  }

  async getAuthMetadata(): Promise<{
    token?: string;
    refreshToken?: string;
    tokenExpiry?: number;
    lastOnlineTime?: number;
    userId?: string;
    userEmail?: string;
    userName?: string;
    userRole?: string;
  } | undefined> {
    return await this.get('auth');
  }

  async setAuthMetadata(data: {
    token?: string;
    refreshToken?: string;
    tokenExpiry?: number;
    lastOnlineTime?: number;
    userId?: string;
    userEmail?: string;
    userName?: string;
    userRole?: string;
  }): Promise<void> {
    await this.set('auth', data);
  }

  async clearAuthMetadata(): Promise<void> {
    await this.delete('auth');
  }

  async getLastSyncTime(entity: string): Promise<number | undefined> {
    return await this.get(`lastSync_${entity}`);
  }

  async setLastSyncTime(entity: string, timestamp: number): Promise<void> {
    await this.set(`lastSync_${entity}`, timestamp);
  }
}

export const metadataRepository = new MetadataRepository();
