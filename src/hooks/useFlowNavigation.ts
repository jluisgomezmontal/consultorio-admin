/**
 * Custom Hook: useFlowNavigation
 * 
 * Hook para manejar la navegación semántica en flujos de la aplicación.
 * Proporciona breadcrumbs y navegación "Volver" sin depender de router.back()
 * 
 * @example
 * ```tsx
 * const { breadcrumbs, backUrl, backLabel, navigateBack } = useFlowNavigation({
 *   pathname: '/pacientes/123/editar',
 *   params: { id: '123', patientName: 'Juan Pérez' }
 * });
 * ```
 */

import { useRouter } from 'next/navigation';
import { useMemo, useCallback } from 'react';
import { getNavigationConfig } from '@/config/navigation.config';
import { BreadcrumbItem, NavigationConfig } from '@/types/navigation.types';

export interface UseFlowNavigationOptions {
  /** Ruta actual (pathname) */
  pathname: string;
  /** Parámetros dinámicos para la ruta (ej. id, nombre del paciente, etc.) */
  params?: Record<string, any>;
  /** Configuración manual que sobrescribe la configuración por defecto */
  overrideConfig?: Partial<NavigationConfig>;
}

export interface UseFlowNavigationReturn {
  /** Lista de breadcrumbs para renderizar */
  breadcrumbs: BreadcrumbItem[];
  /** URL a la que navega el botón "Volver" */
  backUrl: string;
  /** Texto del botón "Volver" */
  backLabel: string;
  /** Función para navegar hacia atrás programáticamente */
  navigateBack: () => void;
  /** Indica si hay configuración de navegación disponible */
  hasNavigation: boolean;
}

/**
 * Hook para manejar navegación semántica en flujos
 */
export function useFlowNavigation({
  pathname,
  params,
  overrideConfig,
}: UseFlowNavigationOptions): UseFlowNavigationReturn {
  const router = useRouter();

  // Obtener configuración de navegación
  const config = useMemo(() => {
    const baseConfig = getNavigationConfig(pathname, params);
    
    if (!baseConfig) {
      return null;
    }

    // Aplicar overrides si existen
    if (overrideConfig) {
      return {
        ...baseConfig,
        ...overrideConfig,
        breadcrumbs: overrideConfig.breadcrumbs || baseConfig.breadcrumbs,
      };
    }

    return baseConfig;
  }, [pathname, params, overrideConfig]);

  // Función para navegar hacia atrás
  const navigateBack = useCallback(() => {
    if (config?.backUrl) {
      router.push(config.backUrl);
    }
  }, [config, router]);

  // Valores por defecto si no hay configuración
  if (!config) {
    return {
      breadcrumbs: [],
      backUrl: '/dashboard',
      backLabel: 'Volver',
      navigateBack: () => router.push('/dashboard'),
      hasNavigation: false,
    };
  }

  return {
    breadcrumbs: config.breadcrumbs,
    backUrl: config.backUrl,
    backLabel: config.backLabel || 'Volver',
    navigateBack,
    hasNavigation: true,
  };
}

/**
 * Hook simplificado para obtener solo la función de navegación hacia atrás
 * Útil cuando no necesitas renderizar breadcrumbs
 * 
 * @example
 * ```tsx
 * const navigateBack = useNavigateBack('/pacientes/123', { id: '123' });
 * ```
 */
export function useNavigateBack(pathname: string, params?: Record<string, any>) {
  const { navigateBack } = useFlowNavigation({ pathname, params });
  return navigateBack;
}
