/**
 * Color System - Paleta de colores de la aplicación
 * Basada en la identidad visual turquesa/cyan del logo
 * 
 * Uso: import { COLORS } from '@/lib/colors'
 * Ejemplo: className={COLORS.primary.bg}
 */

export const COLORS = {
  // Primary - Turquesa/Cyan (color principal del logo)
  primary: {
    border: 'border-cyan-500',
    borderL: 'border-l-cyan-500',
    bg: 'bg-cyan-100 dark:bg-cyan-900/20',
    bgHover: 'hover:bg-cyan-50 dark:hover:bg-cyan-950/20',
    borderHover: 'hover:border-cyan-300 dark:hover:border-cyan-700',
    text: 'text-cyan-600 dark:text-cyan-400',
    icon: 'text-cyan-600 dark:text-cyan-400',
  },

  // Secondary - Azul (complementario al turquesa)
  secondary: {
    border: 'border-blue-500',
    borderL: 'border-l-blue-500',
    bg: 'bg-blue-100 dark:bg-blue-900/20',
    bgHover: 'hover:bg-blue-50 dark:hover:bg-blue-950/20',
    borderHover: 'hover:border-blue-300 dark:hover:border-blue-700',
    text: 'text-blue-600 dark:text-blue-400',
    icon: 'text-blue-600 dark:text-blue-400',
  },

  // Accent - Teal (variación del turquesa)
  accent: {
    border: 'border-teal-500',
    borderL: 'border-l-teal-500',
    bg: 'bg-teal-100 dark:bg-teal-900/20',
    bgHover: 'hover:bg-teal-50 dark:hover:bg-teal-950/20',
    borderHover: 'hover:border-teal-300 dark:hover:border-teal-700',
    text: 'text-teal-600 dark:text-teal-400',
    icon: 'text-teal-600 dark:text-teal-400',
  },

  // Warning - Ámbar (para alertas y pendientes)
  warning: {
    border: 'border-amber-500',
    borderL: 'border-l-amber-500',
    bg: 'bg-amber-100 dark:bg-amber-900/20',
    bgHover: 'hover:bg-amber-50 dark:hover:bg-amber-950/20',
    borderHover: 'hover:border-amber-300 dark:hover:border-amber-700',
    text: 'text-amber-600 dark:text-amber-400',
    icon: 'text-amber-600 dark:text-amber-400',
  },

  // Success - Esmeralda (para pagos y éxito)
  success: {
    border: 'border-emerald-500',
    borderL: 'border-l-emerald-500',
    bg: 'bg-emerald-100 dark:bg-emerald-900/20',
    bgHover: 'hover:bg-emerald-50 dark:hover:bg-emerald-950/20',
    borderHover: 'hover:border-emerald-300 dark:hover:border-emerald-700',
    text: 'text-emerald-600 dark:text-emerald-400',
    icon: 'text-emerald-600 dark:text-emerald-400',
  },

  // Info - Índigo (para información y reportes)
  info: {
    border: 'border-indigo-500',
    borderL: 'border-l-indigo-500',
    bg: 'bg-indigo-100 dark:bg-indigo-900/20',
    bgHover: 'hover:bg-indigo-50 dark:hover:bg-indigo-950/20',
    borderHover: 'hover:border-indigo-300 dark:hover:border-indigo-700',
    text: 'text-indigo-600 dark:text-indigo-400',
    icon: 'text-indigo-600 dark:text-indigo-400',
  },

  // Danger - Rojo (para acciones destructivas)
  danger: {
    border: 'border-red-500',
    borderL: 'border-l-red-500',
    bg: 'bg-red-100 dark:bg-red-900/20',
    bgHover: 'hover:bg-red-50 dark:hover:bg-red-950/20',
    borderHover: 'hover:border-red-300 dark:hover:border-red-700',
    text: 'text-red-600 dark:text-red-400',
    icon: 'text-red-600 dark:text-red-400',
  },
} as const;

/**
 * Gradientes para Hero sections y banners
 */
export const GRADIENTS = {
  hero: 'bg-gradient-to-br from-cyan-500 via-teal-500 to-blue-600',
  heroAlt: 'bg-gradient-to-r from-cyan-600 to-blue-600',
  card: 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20',
} as const;

/**
 * Utilidades para combinar clases de colores
 */
export const getColorClasses = (
  colorKey: keyof typeof COLORS,
  variants: ('bg' | 'text' | 'border' | 'borderL' | 'icon' | 'bgHover' | 'borderHover')[]
) => {
  return variants.map(variant => COLORS[colorKey][variant]).join(' ');
};

/**
 * Mapeo de rutas a colores para consistencia en toda la app
 */
export const ROUTE_COLORS = {
  '/dashboard': 'primary',
  '/citas': 'primary',
  '/pacientes': 'secondary',
  '/pagos': 'success',
  '/reportes': 'info',
  '/configuracion': 'accent',
} as const;
