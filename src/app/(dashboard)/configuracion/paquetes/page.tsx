'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePaquete, usePaquetes } from '@/hooks/usePaquete';
import { Check, Sparkles, Loader2, ExternalLink, ChevronDown, AlertCircle, CheckCircle2, X, Zap, Shield, TrendingUp } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { stripeService } from '@/services/stripe.service';
import { useToast } from '@/hooks/use-toast';
import { formatLocalDate } from '@/lib/dateUtils';

function PaquetesPageContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { paqueteInfo, isLoading: paqueteLoading, refetch } = usePaquete();
  const { paquetes, isLoading: paquetesLoading } = usePaquetes();
  const [loadingCheckout, setLoadingCheckout] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');

    if (success) {
      toast({
        title: '¡Pago exitoso!',
        description: 'Tu suscripción ha sido activada. Los cambios se reflejarán en unos momentos.',
      });
      refetch();
      router.replace('/configuracion/paquetes');
    }

    if (canceled) {
      toast({
        title: 'Pago cancelado',
        description: 'No se realizó ningún cargo. Puedes intentarlo de nuevo cuando quieras.',
        variant: 'destructive',
      });
      router.replace('/configuracion/paquetes');
    }
  }, [searchParams, toast, refetch, router]);

  const handleUpgrade = async (paqueteNombre: string, tipoPago: 'mensual' | 'anual' = 'mensual') => {
    try {
      setLoadingCheckout(`${paqueteNombre}-${tipoPago}`);

      const { data } = await stripeService.createCheckoutSession(paqueteNombre, tipoPago);

      window.location.href = data.url;
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      const errorMessage = error.response?.data?.message || 'No se pudo iniciar el proceso de pago';

      // Check if it's a Stripe configuration error
      if (errorMessage.includes('Price ID no configurado')) {
        toast({
          title: 'Stripe no configurado',
          description: 'Los pagos en línea aún no están disponibles. Contacta al administrador para actualizar tu plan manualmente.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
      setLoadingCheckout(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { data } = await stripeService.createCustomerPortal();

      // Abre en una nueva pestaña
      window.open(data.url, '_blank', 'noopener,noreferrer');

    } catch (error: any) {
      console.error('Error creating customer portal:', error);
      toast({
        title: 'Error',
        description:
          error.response?.data?.message ||
          'No se pudo abrir el portal de suscripción',
        variant: 'destructive',
      });
    }
  };

  if (authLoading || paqueteLoading || paquetesLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return null;

  const paqueteActual = paqueteInfo?.paquete.nombre;
  const suscripcionActiva = paqueteInfo?.suscripcion.estado === 'activa';
  const fechaVencimiento = paqueteInfo?.suscripcion.fechaVencimiento ? new Date(paqueteInfo.suscripcion.fechaVencimiento) : null;
  const estaVencida = fechaVencimiento && fechaVencimiento < new Date();
  const esLicencia = paqueteActual === 'licencia';

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-12 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
          <Sparkles className="h-4 w-4" />
          Planes flexibles para tu consultorio
        </div>
        <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
          Planes y Precios
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Elige el plan que mejor se adapte a las necesidades de tu consultorio.
          Cambia o cancela en cualquier momento.
        </p>
      </div>

      {paqueteInfo && suscripcionActiva && (
        <Card className="mb-10 overflow-hidden border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 shadow-lg dark:border-blue-900 dark:from-blue-950/40 dark:to-blue-900/20">
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-blue-500 p-3">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="mb-1 text-2xl text-blue-900 dark:text-blue-100">
                    Plan Actual: {paqueteInfo.paquete.displayName}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                      Activo
                    </Badge>
                    <span className="text-sm text-blue-700 dark:text-blue-300">
                      {esLicencia
                        ? `Mantenimiento ${estaVencida ? 'venció' : 'vence'} el ${formatLocalDate(paqueteInfo.suscripcion.fechaVencimiento)}`
                        : `${estaVencida ? 'Venció el ' : 'Vence el '}${formatLocalDate(paqueteInfo.suscripcion.fechaVencimiento)}`
                      }
                    </span>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleManageSubscription}
                className="border-blue-300 bg-white hover:bg-blue-50 dark:border-blue-700 dark:bg-blue-950"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Gestionar Suscripción
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="mb-2 font-semibold text-blue-900 dark:text-blue-100">Uso de Límites</h3>
                <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                  <div className="flex justify-between">
                    <span>Doctores:</span>
                    <span className="font-medium">
                      {paqueteInfo.uso.doctores.actual} / {paqueteInfo.uso.doctores.limite}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Recepcionistas:</span>
                    <span className="font-medium">
                      {paqueteInfo.uso.recepcionistas.actual} / {paqueteInfo.uso.recepcionistas.limite}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="mb-2 font-semibold text-blue-900 dark:text-blue-100">Funcionalidades</h3>
                <div className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                  <div className="flex items-center gap-2">
                    {paqueteInfo.features.uploadDocumentos ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <span className="h-4 w-4" />
                    )}
                    <span>Subida de documentos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {paqueteInfo.features.uploadImagenes ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <span className="h-4 w-4" />
                    )}
                    <span>Subida de imágenes</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {paqueteInfo && !suscripcionActiva && (
        <Card className="mb-10 overflow-hidden border-red-200 bg-gradient-to-br from-red-50 to-orange-50/50 shadow-lg dark:border-red-900 dark:from-red-950/40 dark:to-red-900/20">
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-red-500 p-3">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="mb-2 text-2xl text-red-900 dark:text-red-100">
                  Suscripción {paqueteInfo.suscripcion.estado === 'vencida' ? 'Vencida' : 'Inactiva'}
                </CardTitle>
                <p className="text-red-800 dark:text-red-200">
                  {paqueteInfo.suscripcion.estado === 'vencida' && fechaVencimiento
                    ? `Tu suscripción venció el ${formatLocalDate(paqueteInfo.suscripcion.fechaVencimiento)}. Renueva tu plan para continuar usando todas las funcionalidades.`
                    : 'Tu suscripción no está activa. Selecciona un plan para activar tu cuenta.'}
                </p>
                <div className="mt-3 flex items-center gap-2 text-sm font-medium text-red-700 dark:text-red-300">
                  <Zap className="h-4 w-4" />
                  Selecciona un plan abajo para reactivar tu cuenta
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      <div className="mb-6 flex items-center justify-center gap-2">
        <div className="h-px flex-1 bg-border"></div>
        <span className="text-sm font-medium text-muted-foreground mb-5">Planes Disponibles</span>
        <div className="h-px flex-1 bg-border"></div>
      </div>

      <div className={`grid gap-6 ${paqueteActual === 'licencia' ? 'md:grid-cols-1 max-w-md mx-auto' : 'md:grid-cols-3'}`}>
        {(paqueteActual === 'licencia'
          ? paquetes.filter(p => p.nombre === 'licencia')
          : paquetes.slice(0, 3)
        ).map((paquete) => {
          const esActual = suscripcionActiva && paquete.nombre === paqueteActual;
          const esUpgrade = paquete.orden > (paquetes.find(p => p.nombre === paqueteActual)?.orden || 0);
          const puedeContratar = !suscripcionActiva || esUpgrade; // Puede contratar si no está activa o es upgrade
          const isLoading = loadingCheckout === `${paquete.nombre}-mensual`;

          return (
            <Card
              key={paquete.id}
              className={`relative transition-all duration-300 ${esActual
                  ? 'border-2 border-blue-500 shadow-lg scale-105'
                  : 'hover:scale-105 hover:shadow-xl hover:border-primary/50'
                }`}
            >
              {esActual && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500">
                  Plan Actual
                </Badge>
              )}
              {paquete.nombre === 'profesional' && !esActual && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500">
                  <Sparkles className="mr-1 h-3 w-3" />
                  Recomendado
                </Badge>
              )}

              <CardHeader className="space-y-4">
                <div>
                  <CardTitle className="mb-2 text-2xl font-bold">{paquete.displayName}</CardTitle>
                  <CardDescription className="text-base">{paquete.descripcion}</CardDescription>
                </div>
                <div className="border-t pt-4">
                  {paquete.precio.mensual === 0 ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold tracking-tight">Gratis</span>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold tracking-tight">${paquete.precio.mensual}</span>
                      <span className="text-lg text-muted-foreground">/mes</span>
                    </div>
                  )}
                  {paquete.precio.mensual > 0 && paquete.precio.anual > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100">
                        Ahorra 17%
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        ${paquete.precio.anual}/año
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-3 border-t pt-4">
                  <h4 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    Incluye
                  </h4>
                  <ul className="space-y-2.5">
                    <li className="flex items-center gap-3 text-sm">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                        <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                      </div>
                      <span>{paquete.limites.doctores} doctor{paquete.limites.doctores > 1 ? 'es' : ''}</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                        <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                      </div>
                      <span>{paquete.limites.recepcionistas} recepcionista{paquete.limites.recepcionistas > 1 ? 's' : ''}</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                        <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                      </div>
                      <span>Pacientes ilimitados</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm">
                      {paquete.features.uploadDocumentos ? (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                          <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                        </div>
                      ) : (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                          <X className="h-3 w-3 text-gray-400" />
                        </div>
                      )}
                      <span className={!paquete.features.uploadDocumentos ? 'text-muted-foreground' : ''}>
                        Subida de documentos
                      </span>
                    </li>
                    <li className="flex items-center gap-3 text-sm">
                      {paquete.features.uploadImagenes ? (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                          <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                        </div>
                      ) : (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                          <X className="h-3 w-3 text-gray-400" />
                        </div>
                      )}
                      <span className={!paquete.features.uploadImagenes ? 'text-muted-foreground' : ''}>
                        Subida de imágenes
                      </span>
                    </li>
                    <li className="flex items-center gap-3 text-sm">
                      {paquete.features.reportesAvanzados ? (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                          <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                        </div>
                      ) : (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                          <X className="h-3 w-3 text-gray-400" />
                        </div>
                      )}
                      <span className={!paquete.features.reportesAvanzados ? 'text-muted-foreground' : ''}>
                        Reportes avanzados
                      </span>
                    </li>
                  </ul>
                </div>
              </CardContent>

              <CardFooter className="flex gap-2 border-t pt-6">
                {esActual ? (
                  <Button disabled className="w-full">
                    Plan Actual
                  </Button>
                ) : puedeContratar ? (
                  paquete.nombre === 'licencia' ? (
                    <Button
                      onClick={() => handleUpgrade(paquete.nombre, 'anual')}
                      disabled={!!loadingCheckout}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                    >
                      {loadingCheckout === `${paquete.nombre}-anual` ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Procesando...
                        </>
                      ) : (
                        <>Renovar Mantenimiento Anual</>
                      )}
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={() => handleUpgrade(paquete.nombre, 'mensual')}
                        disabled={!!loadingCheckout}
                        className={`flex-1 ${!suscripcionActiva
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                            : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                          }`}
                      >
                        {loadingCheckout === `${paquete.nombre}-mensual` ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Procesando...
                          </>
                        ) : (
                          <>
                            {!suscripcionActiva ? (
                              <>Activar Mensual</>
                            ) : (
                              <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Pagar Mensual
                              </>
                            )}
                          </>
                        )}
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            disabled={!!loadingCheckout}
                            variant="outline"
                            size="icon"
                            className={
                              !suscripcionActiva
                                ? 'border-blue-500 text-blue-600 hover:bg-blue-50'
                                : 'border-amber-500 text-amber-600 hover:bg-amber-50'
                            }
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleUpgrade(paquete.nombre, 'mensual')}
                            disabled={!!loadingCheckout}
                          >
                            <div className="flex flex-col">
                              <span className="font-semibold">Pago Mensual</span>
                              <span className="text-xs text-muted-foreground">
                                ${paquete.precio.mensual}/mes
                              </span>
                            </div>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleUpgrade(paquete.nombre, 'anual')}
                            disabled={!!loadingCheckout}
                          >
                            <div className="flex flex-col">
                              <span className="font-semibold">Pago Anual</span>
                              <span className="text-xs text-muted-foreground">
                                ${paquete.precio.anual}/año (ahorra {Math.round(((paquete.precio.mensual * 12 - paquete.precio.anual) / (paquete.precio.mensual * 12)) * 100)}%)
                              </span>
                            </div>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  )
                ) : (
                  <Button variant="outline" disabled className="w-full">
                    No disponible
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default function PaquetesPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <PaquetesPageContent />
    </Suspense>
  );
}
