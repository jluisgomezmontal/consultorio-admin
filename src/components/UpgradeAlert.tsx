'use client';

import { AlertCircle, Sparkles } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface UpgradeAlertProps {
  titulo?: string;
  mensaje: string;
  tipo?: 'limite' | 'feature';
  className?: string;
}

export function UpgradeAlert({ 
  titulo = 'Actualiza tu plan',
  mensaje, 
  tipo = 'feature',
  className = ''
}: UpgradeAlertProps) {
  const router = useRouter();

  return (
    <Alert className={`border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/20 ${className}`}>
      <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
      <AlertTitle className="text-amber-900 dark:text-amber-100">
        {titulo}
      </AlertTitle>
      <AlertDescription className="text-amber-800 dark:text-amber-200">
        <p className="mb-3">{mensaje}</p>
        <Button
          onClick={() => router.push('/configuracion/paquetes')}
          size="sm"
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Ver planes disponibles
        </Button>
      </AlertDescription>
    </Alert>
  );
}
