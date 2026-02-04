/**
 * Configuración centralizada de navegación para todos los flujos
 * 
 * Este archivo define las rutas de navegación semántica para cada flujo de la aplicación.
 * Cada entrada especifica los breadcrumbs y la ruta de retorno para una página específica.
 * 
 * IMPORTANTE: No usar router.back() - todas las navegaciones deben ser explícitas.
 */

import { FlowNavigationMap } from '@/types/navigation.types';

export const navigationConfig: FlowNavigationMap = {
  /**
   * FLUJO: PACIENTES
   * Rutas: /pacientes, /pacientes/nuevo, /pacientes/[id], /pacientes/[id]/editar, /pacientes/[id]/historial
   */
  pacientes: {
    // Lista de pacientes (página principal)
    '/pacientes': {
      breadcrumbs: [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Pacientes', isCurrentPage: true },
      ],
      backUrl: '/dashboard',
    },

    // Crear nuevo paciente
    '/pacientes/nuevo': {
      breadcrumbs: [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Pacientes', href: '/pacientes' },
        { label: 'Nuevo Paciente', isCurrentPage: true },
      ],
      backUrl: '/pacientes',
      backLabel: 'Volver a Pacientes',
    },

    // Detalle de paciente (requiere parámetros dinámicos)
    '/pacientes/[id]': (params) => ({
      breadcrumbs: [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Pacientes', href: '/pacientes' },
        { label: params?.patientName || 'Detalle', isCurrentPage: true },
      ],
      backUrl: '/pacientes',
      backLabel: 'Volver a Pacientes',
    }),

    // Editar paciente
    '/pacientes/[id]/editar': (params) => ({
      breadcrumbs: [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Pacientes', href: '/pacientes' },
        { label: params?.patientName || 'Paciente', href: `/pacientes/${params?.id}` },
        { label: 'Editar', isCurrentPage: true },
      ],
      backUrl: `/pacientes/${params?.id}`,
      backLabel: 'Volver al Detalle',
    }),

    // Historial clínico del paciente
    '/pacientes/[id]/historial': (params) => ({
      breadcrumbs: [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Pacientes', href: '/pacientes' },
        { label: params?.patientName || 'Paciente', href: `/pacientes/${params?.id}` },
        { label: 'Historial Clínico', isCurrentPage: true },
      ],
      backUrl: `/pacientes/${params?.id}`,
      backLabel: 'Volver al Detalle',
    }),
  },

  /**
   * FLUJO: CITAS
   * Rutas: /citas, /citas/nueva, /citas/[id], /citas/[id]/editar
   */
  citas: {
    // Lista de citas (página principal)
    '/citas': {
      breadcrumbs: [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Citas', isCurrentPage: true },
      ],
      backUrl: '/dashboard',
    },

    // Crear nueva cita
    '/citas/nueva': {
      breadcrumbs: [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Citas', href: '/citas' },
        { label: 'Nueva Cita', isCurrentPage: true },
      ],
      backUrl: '/citas',
      backLabel: 'Volver a Citas',
    },

    // Detalle de cita (requiere parámetros dinámicos)
    '/citas/[id]': (params) => ({
      breadcrumbs: [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Citas', href: '/citas' },
        { 
          label: params?.citaInfo 
            ? `Cita - ${params.citaInfo}` 
            : 'Detalle de Cita', 
          isCurrentPage: true 
        },
      ],
      backUrl: '/citas',
      backLabel: 'Volver a Citas',
    }),

    // Editar cita
    '/citas/[id]/editar': (params) => ({
      breadcrumbs: [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Citas', href: '/citas' },
        { 
          label: params?.citaInfo || 'Cita', 
          href: `/citas/${params?.id}` 
        },
        { label: 'Editar', isCurrentPage: true },
      ],
      backUrl: `/citas/${params?.id}`,
      backLabel: 'Volver a la Cita',
    }),
  },

  /**
   * FLUJO: PAGOS
   * Rutas: /pagos, /pagos/nuevo, /pagos/[id], /pagos/[id]/editar
   */
  pagos: {
    // Lista de pagos (página principal)
    '/pagos': {
      breadcrumbs: [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Pagos', isCurrentPage: true },
      ],
      backUrl: '/dashboard',
    },

    // Registrar nuevo pago
    '/pagos/nuevo': {
      breadcrumbs: [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Pagos', href: '/pagos' },
        { label: 'Nuevo Pago', isCurrentPage: true },
      ],
      backUrl: '/pagos',
      backLabel: 'Volver a Pagos',
    },

    // Detalle de pago (requiere parámetros dinámicos)
    '/pagos/[id]': (params) => ({
      breadcrumbs: [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Pagos', href: '/pagos' },
        { 
          label: params?.pagoInfo 
            ? `Pago - ${params.pagoInfo}` 
            : 'Detalle de Pago', 
          isCurrentPage: true 
        },
      ],
      backUrl: '/pagos',
      backLabel: 'Volver a Pagos',
    }),

    // Editar pago
    '/pagos/[id]/editar': (params) => ({
      breadcrumbs: [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Pagos', href: '/pagos' },
        { 
          label: params?.pagoInfo || 'Pago', 
          href: `/pagos/${params?.id}` 
        },
        { label: 'Editar', isCurrentPage: true },
      ],
      backUrl: `/pagos/${params?.id}`,
      backLabel: 'Volver al Pago',
    }),
  },

  /**
   * FLUJO: REPORTES
   * Rutas: /reportes
   */
  reportes: {
    // Página de reportes
    '/reportes': {
      breadcrumbs: [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Reportes', isCurrentPage: true },
      ],
      backUrl: '/dashboard',
    },
  },

  /**
   * FLUJO: CONFIGURACIÓN
   * Rutas: /configuracion, /configuracion/paquetes
   */
  configuracion: {
    // Página principal de configuración
    '/configuracion': {
      breadcrumbs: [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Configuración', isCurrentPage: true },
      ],
      backUrl: '/dashboard',
    },

    // Gestión de paquetes
    '/configuracion/paquetes': {
      breadcrumbs: [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Configuración', href: '/configuracion' },
        { label: 'Mi Plan', isCurrentPage: true },
      ],
      backUrl: '/configuracion',
      backLabel: 'Volver a Configuración',
    },
  },
};

/**
 * Función helper para obtener la configuración de navegación de una ruta
 * 
 * @param pathname - Ruta actual (ej. '/pacientes/123/editar')
 * @param params - Parámetros dinámicos (ej. { id: '123', patientName: 'Juan Pérez' })
 * @returns Configuración de navegación o null si no se encuentra
 */
export function getNavigationConfig(
  pathname: string,
  params?: Record<string, any>
): import('@/types/navigation.types').NavigationConfig | null {
  // Intentar match exacto primero
  for (const flow in navigationConfig) {
    const flowConfig = navigationConfig[flow as keyof typeof navigationConfig];
    if (!flowConfig) continue;

    // Match exacto
    if (flowConfig[pathname]) {
      const config = flowConfig[pathname];
      return typeof config === 'function' ? config(params) : config;
    }

    // Match con parámetros dinámicos (ej. /pacientes/[id])
    for (const route in flowConfig) {
      const pattern = route.replace(/\[([^\]]+)\]/g, '([^/]+)');
      const regex = new RegExp(`^${pattern}$`);
      
      if (regex.test(pathname)) {
        const config = flowConfig[route];
        return typeof config === 'function' ? config(params) : config;
      }
    }
  }

  return null;
}
