import { useQuery } from '@tanstack/react-query';
import { paqueteService } from '@/services/paquete.service';
import { useAuth } from '@/contexts/AuthContext';

export function usePaquete() {
  const { user } = useAuth();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['mi-paquete', user?.id],
    queryFn: () => paqueteService.getMiPaquete(),
    enabled: !!user,
    staleTime: 1 * 60 * 1000, // 1 minuto - reducido para refrescar más rápido
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const paqueteInfo = data?.data;

  // Helper functions
  const puedeCrearDoctor = () => {
    if (!paqueteInfo) return false;
    return paqueteInfo.uso.doctores.disponible > 0;
  };

  const puedeCrearRecepcionista = () => {
    if (!paqueteInfo) return false;
    return paqueteInfo.uso.recepcionistas.disponible > 0;
  };

  const tieneFeature = (feature: keyof typeof paqueteInfo.features) => {
    if (!paqueteInfo) return false;
    return paqueteInfo.features[feature] === true;
  };

  const esPaquete = (nombre: 'basico' | 'profesional' | 'clinica') => {
    if (!paqueteInfo) return false;
    return paqueteInfo.paquete.nombre === nombre;
  };

  const suscripcionActiva = () => {
    if (!paqueteInfo) return false;
    return paqueteInfo.suscripcion.estado === 'activa' || paqueteInfo.suscripcion.estado === 'trial';
  };

  const planVencido = () => {
    if (!paqueteInfo) return false;
    return paqueteInfo.suscripcion.estado === 'vencida';
  };

  const estaVencido = () => {
    if (!paqueteInfo || !paqueteInfo.suscripcion.fechaVencimiento) return false;
    const fechaVencimiento = new Date(paqueteInfo.suscripcion.fechaVencimiento);
    return fechaVencimiento < new Date();
  };

  return {
    paqueteInfo,
    isLoading,
    error,
    refetch,
    // Helpers
    puedeCrearDoctor,
    puedeCrearRecepcionista,
    tieneFeature,
    esPaquete,
    suscripcionActiva,
    planVencido,
    estaVencido,
  };
}

export function usePaquetes() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['paquetes'],
    queryFn: () => paqueteService.getAllPaquetes(),
    staleTime: 10 * 60 * 1000, // 10 minutos
  });

  return {
    paquetes: data?.data || [],
    isLoading,
    error,
  };
}
