'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { usePaquete } from '@/hooks/usePaquete';
import { Loader2 } from 'lucide-react';

export function PlanGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { paqueteInfo, isLoading, planVencido, estaVencido } = usePaquete();

  const rutasExcluidas = [
    '/plan-vencido',
    '/configuracion/paquetes',
  ];

  const esRutaExcluida = rutasExcluidas.some(ruta => pathname?.startsWith(ruta));

  useEffect(() => {
    if (!isLoading && paqueteInfo) {
      const vencido = planVencido() || estaVencido();
      
      if (vencido && !esRutaExcluida) {
        router.push('/plan-vencido');
      }
    }
  }, [isLoading, paqueteInfo, planVencido, estaVencido, esRutaExcluida, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const vencido = planVencido() || estaVencido();
  
  if (vencido && !esRutaExcluida) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
}
