import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useConsultorio } from '@/contexts/ConsultorioContext';
import { offlineDataSync } from '@/lib/offline-data-sync';

/**
 * Hook to automatically preload data to IndexedDB when online
 * This ensures data is available when going offline
 */
export function useOfflineDataPreload() {
  const { user, isAuthenticated } = useAuth();
  const { selectedConsultorio } = useConsultorio();

  useEffect(() => {
    // Only preload if authenticated and has selected consultorio
    if (!isAuthenticated || !user || !selectedConsultorio) {
      return;
    }

    const consultorioId = selectedConsultorio.id || selectedConsultorio._id;
    if (!consultorioId) {
      return;
    }

    // Check if online
    if (typeof window !== 'undefined' && navigator.onLine) {
      console.log('[useOfflineDataPreload] User online, preloading data...');
      offlineDataSync.preloadAll(consultorioId).catch(error => {
        console.error('[useOfflineDataPreload] Preload failed:', error);
      });
    }

    // Listen for online events to preload when reconnecting
    const handleOnline = () => {
      console.log('[useOfflineDataPreload] Connection restored, preloading data...');
      offlineDataSync.preloadAll(consultorioId).catch(error => {
        console.error('[useOfflineDataPreload] Preload on reconnect failed:', error);
      });
    };

    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [isAuthenticated, user, selectedConsultorio]);
}
