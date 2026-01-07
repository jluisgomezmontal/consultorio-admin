'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { metadataRepository } from '@/lib/db/repositories/metadata-repository';
import { syncQueueRepository } from '@/lib/db/repositories/sync-queue-repository';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';
export type ConnectionStatus = 'online' | 'offline' | 'reconnecting';

interface OfflineContextType {
  isOnline: boolean;
  connectionStatus: ConnectionStatus;
  syncStatus: SyncStatus;
  pendingCount: number;
  canWorkOffline: boolean;
  isBlocked: boolean;
  blockReason?: string;
  triggerSync: () => Promise<void>;
  refreshPendingCount: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

const MAX_OFFLINE_TIME = parseInt(process.env.NEXT_PUBLIC_MAX_OFFLINE_TIME || '604800000', 10);

export function OfflineProvider({ children }: { children: ReactNode }) {
  const { isOnline, wasOffline } = useOnlineStatus();
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('online');
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [pendingCount, setPendingCount] = useState(0);
  const [canWorkOffline, setCanWorkOffline] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockReason, setBlockReason] = useState<string | undefined>();

  const checkOfflinePermissions = useCallback(async () => {
    try {
      const authMetadata = await metadataRepository.getAuthMetadata();
      
      if (!authMetadata || !authMetadata.token) {
        setCanWorkOffline(false);
        setIsBlocked(true);
        setBlockReason('No hay sesión iniciada. Por favor, conéctese a internet para continuar.');
        return false;
      }

      const now = Date.now();
      const offlineTime = now - (authMetadata.lastOnlineTime || now);

      if (offlineTime > MAX_OFFLINE_TIME) {
        setCanWorkOffline(false);
        setIsBlocked(true);
        setBlockReason('Ha estado sin conexión por más de 7 días. Por favor, conéctese a internet para continuar.');
        return false;
      }

      if (authMetadata.tokenExpiry && now > authMetadata.tokenExpiry) {
        setCanWorkOffline(false);
        setIsBlocked(true);
        setBlockReason('Su sesión ha expirado. Por favor, conéctese a internet para renovar su sesión.');
        return false;
      }

      setCanWorkOffline(true);
      setIsBlocked(false);
      setBlockReason(undefined);
      return true;
    } catch (error) {
      console.error('Error checking offline permissions:', error);
      setCanWorkOffline(false);
      return false;
    }
  }, []);

  const refreshPendingCount = useCallback(async () => {
    try {
      const count = await syncQueueRepository.getPendingCount();
      setPendingCount(count);
    } catch (error) {
      console.error('Error refreshing pending count:', error);
    }
  }, []);

  const triggerSync = useCallback(async () => {
    if (!isOnline) {
      console.log('Cannot sync while offline');
      return;
    }

    setSyncStatus('syncing');
    
    try {
      const { syncManager } = await import('@/services/offline/sync-manager');
      await syncManager.processSyncQueue();
      
      await metadataRepository.setAuthMetadata({
        ...(await metadataRepository.getAuthMetadata()),
        lastOnlineTime: Date.now(),
      });

      await refreshPendingCount();
      setSyncStatus('synced');
      
      setTimeout(() => {
        setSyncStatus('idle');
      }, 3000);
    } catch (error) {
      console.error('Sync error:', error);
      setSyncStatus('error');
      
      setTimeout(() => {
        setSyncStatus('idle');
      }, 5000);
    }
  }, [isOnline, refreshPendingCount]);

  useEffect(() => {
    if (isOnline) {
      setConnectionStatus('online');
      
      if (wasOffline) {
        setConnectionStatus('reconnecting');
        triggerSync();
      }
      
      metadataRepository.setAuthMetadata({
        ...(metadataRepository.getAuthMetadata() as any),
        lastOnlineTime: Date.now(),
      });
    } else {
      setConnectionStatus('offline');
      checkOfflinePermissions();
    }
  }, [isOnline, wasOffline, triggerSync, checkOfflinePermissions]);

  useEffect(() => {
    if (!isOnline) {
      const interval = setInterval(() => {
        checkOfflinePermissions();
      }, 60000);

      return () => clearInterval(interval);
    }
  }, [isOnline, checkOfflinePermissions]);

  useEffect(() => {
    refreshPendingCount();
    
    const interval = setInterval(refreshPendingCount, 10000);
    return () => clearInterval(interval);
  }, [refreshPendingCount]);

  useEffect(() => {
    if (isOnline && syncStatus === 'idle' && pendingCount > 0) {
      const autoSyncInterval = setInterval(() => {
        triggerSync();
      }, parseInt(process.env.NEXT_PUBLIC_SYNC_INTERVAL || '30000', 10));

      return () => clearInterval(autoSyncInterval);
    }
  }, [isOnline, syncStatus, pendingCount, triggerSync]);

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        connectionStatus,
        syncStatus,
        pendingCount,
        canWorkOffline,
        isBlocked,
        blockReason,
        triggerSync,
        refreshPendingCount,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
}

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};
