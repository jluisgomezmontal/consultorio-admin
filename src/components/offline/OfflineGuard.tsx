'use client';

import { useOffline } from '@/contexts/OfflineContext';
import { ReactNode } from 'react';
import { WifiOff, Lock } from 'lucide-react';

interface OfflineGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  requireOnline?: boolean;
  customMessage?: string;
}

export function OfflineGuard({ 
  children, 
  fallback, 
  requireOnline = false,
  customMessage 
}: OfflineGuardProps) {
  const { isOnline, isBlocked, blockReason } = useOffline();

  if (isBlocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
        <div className="bg-red-100 dark:bg-red-900/20 rounded-full p-4 mb-4">
          <Lock className="h-12 w-12 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Acceso Bloqueado
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
          {blockReason}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Reconectar
        </button>
      </div>
    );
  }

  if (requireOnline && !isOnline) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] p-8 text-center">
        <div className="bg-yellow-100 dark:bg-yellow-900/20 rounded-full p-4 mb-4">
          <WifiOff className="h-12 w-12 text-yellow-600 dark:text-yellow-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Conexión Requerida
        </h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md">
          {customMessage || 'Esta función requiere conexión a internet. Por favor, conéctese para continuar.'}
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
