/**
 * Componente: FlowHeader
 * 
 * Header reutilizable que muestra breadcrumbs y botón "Volver" para flujos de navegación.
 * Utiliza el hook useFlowNavigation para obtener la configuración de navegación.
 * 
 * @example
 * ```tsx
 * <FlowHeader
 *   pathname="/pacientes/123/editar"
 *   params={{ id: '123', patientName: 'Juan Pérez' }}
 * />
 * ```
 */

'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useFlowNavigation, UseFlowNavigationOptions } from '@/hooks/useFlowNavigation';
import { cn } from '@/lib/utils';

export interface FlowHeaderProps extends UseFlowNavigationOptions {
  /** Clase CSS adicional para el contenedor */
  className?: string;
  /** Ocultar el botón "Volver" */
  hideBackButton?: boolean;
  /** Ocultar los breadcrumbs */
  hideBreadcrumbs?: boolean;
  /** Contenido adicional a mostrar en el header (ej. acciones) */
  actions?: React.ReactNode;
  /** Variante del botón volver */
  backButtonVariant?: 'default' | 'ghost' | 'outline';
}

/**
 * Header con breadcrumbs y botón volver para flujos de navegación
 */
export function FlowHeader({
  pathname,
  params,
  overrideConfig,
  className,
  hideBackButton = false,
  hideBreadcrumbs = false,
  actions,
  backButtonVariant = 'ghost',
}: FlowHeaderProps) {
  const { breadcrumbs, backUrl, backLabel, navigateBack, hasNavigation } = useFlowNavigation({
    pathname,
    params,
    overrideConfig,
  });

  // Si no hay configuración de navegación, no renderizar nada
  if (!hasNavigation && !overrideConfig) {
    return null;
  }

  return (
    <div className={cn('flex flex-col gap-4 mb-6', className)}>
      {/* Breadcrumbs */}
      {!hideBreadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <BreadcrumbItem>
                  {item.isCurrentPage ? (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  ) : item.href ? (
                    <BreadcrumbLink asChild>
                      <Link href={item.href}>{item.label}</Link>
                    </BreadcrumbLink>
                  ) : (
                    <span>{item.label}</span>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      )}

      {/* Botón Volver y Acciones */}
      {(!hideBackButton || actions) && (
        <div className="flex items-center justify-between gap-4">
          {!hideBackButton && (
            <Button
              variant={backButtonVariant}
              onClick={navigateBack}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">{backLabel}</span>
              <span className="sm:hidden">Volver</span>
            </Button>
          )}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
    </div>
  );
}

/**
 * Componente simplificado que solo muestra el botón "Volver"
 * Útil cuando no necesitas breadcrumbs
 * 
 * @example
 * ```tsx
 * <BackButton pathname="/pacientes/123" params={{ id: '123' }} />
 * ```
 */
export function BackButton({
  pathname,
  params,
  overrideConfig,
  className,
  variant = 'ghost',
  children,
}: UseFlowNavigationOptions & {
  className?: string;
  variant?: 'default' | 'ghost' | 'outline';
  children?: React.ReactNode;
}) {
  const { backLabel, navigateBack } = useFlowNavigation({
    pathname,
    params,
    overrideConfig,
  });

  return (
    <Button
      variant={variant}
      onClick={navigateBack}
      className={cn('gap-2', className)}
    >
      <ArrowLeft className="h-4 w-4" />
      {children || backLabel}
    </Button>
  );
}

/**
 * Componente que solo muestra los breadcrumbs
 * Útil cuando necesitas breadcrumbs sin el botón volver
 * 
 * @example
 * ```tsx
 * <FlowBreadcrumbs pathname="/pacientes/123" params={{ id: '123' }} />
 * ```
 */
export function FlowBreadcrumbs({
  pathname,
  params,
  overrideConfig,
  className,
}: UseFlowNavigationOptions & {
  className?: string;
}) {
  const { breadcrumbs, hasNavigation } = useFlowNavigation({
    pathname,
    params,
    overrideConfig,
  });

  if (!hasNavigation || breadcrumbs.length === 0) {
    return null;
  }

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {breadcrumbs.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <BreadcrumbItem>
              {item.isCurrentPage ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : item.href ? (
                <BreadcrumbLink asChild>
                  <Link href={item.href}>{item.label}</Link>
                </BreadcrumbLink>
              ) : (
                <span>{item.label}</span>
              )}
            </BreadcrumbItem>
            {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
