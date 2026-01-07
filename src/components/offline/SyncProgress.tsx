'use client';

import { useOffline } from '@/contexts/OfflineContext';
import { Loader2 } from 'lucide-react';

export function SyncProgress() {
  const { syncStatus, pendingCount } = useOffline();

  if (syncStatus !== 'syncing' || pendingCount === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-[250px]">
      <div className="flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            Sincronizando datos
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {pendingCount} {pendingCount === 1 ? 'cambio' : 'cambios'} pendientes
          </p>
        </div>
      </div>
      <div className="mt-3 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{ width: '60%' }} />
      </div>
    </div>
  );
}
