'use client';

import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface SyncStatusBadgeProps {
  status: 'synced' | 'pending' | 'failed';
  showLabel?: boolean;
}

export function SyncStatusBadge({ status, showLabel = false }: SyncStatusBadgeProps) {
  const config = {
    synced: {
      icon: <CheckCircle2 className="h-4 w-4" />,
      label: 'Sincronizado',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    pending: {
      icon: <Clock className="h-4 w-4" />,
      label: 'Pendiente',
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
    },
    failed: {
      icon: <AlertCircle className="h-4 w-4" />,
      label: 'Error',
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
    },
  }[status];

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md ${config.bgColor}`}>
      <span className={config.color}>{config.icon}</span>
      {showLabel && (
        <span className={`text-xs font-medium ${config.color}`}>
          {config.label}
        </span>
      )}
    </div>
  );
}
