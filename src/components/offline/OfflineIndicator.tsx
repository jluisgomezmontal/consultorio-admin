'use client';

import { useOffline } from '@/contexts/OfflineContext';
import { AlertCircle, CheckCircle2, Cloud, CloudOff, RefreshCw, WifiOff } from 'lucide-react';
import { useState, useEffect } from 'react';

export function OfflineIndicator() {
  const { isOnline, connectionStatus, syncStatus, pendingCount, triggerSync } = useOffline();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showBadge, setShowBadge] = useState(true);

  useEffect(() => {
    if (isOnline && syncStatus === 'idle' && pendingCount === 0) {
      const timer = setTimeout(() => {
        setIsCollapsed(true);
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setIsCollapsed(false);
    }
  }, [isOnline, syncStatus, pendingCount]);

  useEffect(() => {
    setShowBadge(true);
  }, [isOnline, connectionStatus, syncStatus]);

  if (!showBadge) return null;

  const getStatusConfig = () => {
    if (!isOnline) {
      return {
        icon: <WifiOff className="h-4 w-4" />,
        text: 'Sin conexión a internet',
        subtext: 'Los cambios se guardarán localmente',
        bgColor: 'bg-red-500',
        textColor: 'text-white',
      };
    }

    if (syncStatus === 'syncing') {
      return {
        icon: <RefreshCw className="h-4 w-4 animate-spin" />,
        text: 'Sincronizando datos...',
        subtext: `${pendingCount} cambios pendientes`,
        bgColor: 'bg-yellow-500',
        textColor: 'text-white',
      };
    }

    if (syncStatus === 'error') {
      return {
        icon: <AlertCircle className="h-4 w-4" />,
        text: 'Error al sincronizar',
        subtext: 'Haga clic para reintentar',
        bgColor: 'bg-red-500',
        textColor: 'text-white',
        clickable: true,
      };
    }

    if (connectionStatus === 'reconnecting' || pendingCount > 0) {
      return {
        icon: <Cloud className="h-4 w-4" />,
        text: 'Conectado',
        subtext: pendingCount > 0 ? `${pendingCount} cambios pendientes` : 'Sincronizando...',
        bgColor: 'bg-blue-500',
        textColor: 'text-white',
      };
    }

    return {
      icon: <CheckCircle2 className="h-4 w-4" />,
      text: 'Conectado y actualizado',
      subtext: 'Todos los datos están sincronizados',
      bgColor: 'bg-green-500',
      textColor: 'text-white',
    };
  };

  const config = getStatusConfig();

  const handleClick = () => {
    if (config.clickable) {
      triggerSync();
    }
  };

  if (isCollapsed && isOnline && pendingCount === 0) {
    return (
      <div 
        className="fixed top-4 right-4 z-[9999] cursor-pointer"
        onClick={() => setIsCollapsed(false)}
      >
        <div className={`${config.bgColor} ${config.textColor} rounded-full p-2 shadow-lg`}>
          {config.icon}
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`fixed top-20 right-4 z-[9999] ${config.bgColor} ${config.textColor} rounded-lg shadow-lg p-4 min-w-[300px] ${config.clickable ? 'cursor-pointer' : ''}`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{config.text}</p>
          <p className="text-xs mt-1 opacity-90">{config.subtext}</p>
        </div>
        {isOnline && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowBadge(false);
            }}
            className="flex-shrink-0 hover:opacity-70 text-xs"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
