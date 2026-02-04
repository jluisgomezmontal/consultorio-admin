/**
 * Sistema de navegación semántica para flujos de la aplicación
 * 
 * Este sistema permite definir rutas de navegación explícitas y predecibles
 * sin depender del historial del navegador (router.back())
 */

/**
 * Representa un elemento individual del breadcrumb
 */
export interface BreadcrumbItem {
  /** Texto que se muestra en el breadcrumb */
  label: string;
  /** Ruta a la que navega al hacer clic (undefined = página actual) */
  href?: string;
  /** Indica si es la página actual (no clickeable) */
  isCurrentPage?: boolean;
}

/**
 * Configuración de navegación para una página específica
 */
export interface NavigationConfig {
  /** Lista de breadcrumbs para mostrar */
  breadcrumbs: BreadcrumbItem[];
  /** Ruta a la que navega el botón "Volver" */
  backUrl: string;
  /** Texto opcional para el botón volver (default: "Volver") */
  backLabel?: string;
}

/**
 * Función que genera la configuración de navegación dinámicamente
 * Útil cuando necesitas datos del contexto (ej. nombre del paciente)
 */
export type NavigationConfigFactory = (params?: Record<string, any>) => NavigationConfig;

/**
 * Tipos de flujos disponibles en la aplicación
 * Agregar nuevos flujos aquí para mantener type-safety
 */
export type FlowType = 
  | 'pacientes'
  | 'citas'
  | 'pagos'
  | 'reportes'
  | 'configuracion'
  | 'expedientes';

/**
 * Mapa de configuraciones de navegación por flujo
 * Cada flujo puede tener múltiples rutas con sus respectivas configuraciones
 */
export type FlowNavigationMap = {
  [K in FlowType]?: {
    [route: string]: NavigationConfig | NavigationConfigFactory;
  };
};
