import { toast } from '@/hooks/use-toast';

interface ApiError {
  response?: {
    data?: {
      message?: string;
      limiteAlcanzado?: boolean;
      featureNoDisponible?: boolean;
      suscripcionVencida?: boolean;
      limite?: {
        tipo: string;
        actual: number;
        maximo: number;
      };
    };
  };
  message?: string;
}

export function handleApiError(error: any, onLimiteAlcanzado?: () => void, onFeatureNoDisponible?: () => void) {
  const apiError = error as ApiError;
  
  // Límite alcanzado
  if (apiError.response?.data?.limiteAlcanzado) {
    toast({
      title: 'Límite alcanzado',
      description: apiError.response.data.message || 'Has alcanzado el límite de tu plan actual',
      variant: 'destructive',
    });
    
    if (onLimiteAlcanzado) {
      onLimiteAlcanzado();
    }
    return;
  }

  // Feature no disponible
  if (apiError.response?.data?.featureNoDisponible) {
    toast({
      title: 'Función no disponible',
      description: apiError.response.data.message || 'Esta función no está disponible en tu plan actual',
      variant: 'destructive',
    });
    
    if (onFeatureNoDisponible) {
      onFeatureNoDisponible();
    }
    return;
  }

  // Suscripción vencida
  if (apiError.response?.data?.suscripcionVencida) {
    toast({
      title: 'Suscripción vencida',
      description: apiError.response.data.message || 'Tu suscripción ha vencido',
      variant: 'destructive',
    });
    return;
  }

  // Error genérico
  toast({
    title: 'Error',
    description: apiError.response?.data?.message || apiError.message || 'Ha ocurrido un error',
    variant: 'destructive',
  });
}
