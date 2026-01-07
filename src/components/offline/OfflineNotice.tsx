'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, WifiOff } from 'lucide-react';

interface OfflineNoticeProps {
  message?: string;
}

/**
 * Component to show when data is not available offline
 * Displayed when user tries to access uncached data while offline
 */
export function OfflineNotice({ message }: OfflineNoticeProps) {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) {
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-[400px] px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-yellow-100 p-3">
            <WifiOff className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Sin conexión
        </h2>
        
        <div className="flex items-start gap-2 text-left bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-800">
            {message || 'Esta información no está disponible sin conexión. Necesitas acceder a ella al menos una vez mientras estás en línea para que se guarde en tu dispositivo.'}
          </p>
        </div>

        <div className="text-sm text-gray-600 space-y-2">
          <p>
            <strong>¿Qué puedes hacer?</strong>
          </p>
          <ul className="list-disc list-inside text-left space-y-1 ml-4">
            <li>Conectarte a internet y volver a intentarlo</li>
            <li>Navegar a otras secciones que ya visitaste en línea</li>
            <li>Crear nuevos pacientes o citas (se sincronizarán después)</li>
          </ul>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
