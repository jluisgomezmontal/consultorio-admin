'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePaquete, usePaquetes } from '@/hooks/usePaquete';
import { AlertCircle, Loader2, Sparkles, Shield, Lock } from 'lucide-react';
import { stripeService } from '@/services/stripe.service';
import { useToast } from '@/hooks/use-toast';
import { formatLocalDate } from '@/lib/dateUtils';
import { useState } from 'react';

export default function PlanVencidoPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { paqueteInfo, isLoading: paqueteLoading, planVencido, estaVencido } = usePaquete();
  const { paquetes, isLoading: paquetesLoading } = usePaquetes();
  const [loadingCheckout, setLoadingCheckout] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  // Si el plan NO está vencido, redirigir al dashboard
  useEffect(() => {
    if (!paqueteLoading && paqueteInfo && !planVencido() && !estaVencido()) {
      router.push('/');
    }
  }, [paqueteLoading, paqueteInfo, planVencido, estaVencido, router]);

  const handleRenovar = async (paqueteNombre: string, tipoPago: 'mensual' | 'anual' = 'anual') => {
    try {
      setLoadingCheckout(`${paqueteNombre}-${tipoPago}`);
      
      const { data } = await stripeService.createCheckoutSession(paqueteNombre, tipoPago);
      
      window.location.href = data.url;
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      const errorMessage = error.response?.data?.message || 'No se pudo iniciar el proceso de pago';
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      setLoadingCheckout(null);
    }
  };

  if (authLoading || paqueteLoading || paquetesLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user || !paqueteInfo) return null;

  const esLicencia = paqueteInfo.paquete.nombre === 'licencia';
  const paqueteActual = paquetes.find(p => p.nombre === paqueteInfo.paquete.nombre);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 min-h-screen flex items-center justify-center">
      <div className="max-w-4xl w-full">
        {/* Alerta de Plan Vencido */}
        <Card className="mb-10 overflow-hidden border-red-300 bg-gradient-to-br from-red-50 to-orange-50/50 shadow-2xl dark:border-red-800 dark:from-red-950/60 dark:to-red-900/30">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500 shadow-lg">
              <Lock className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="mb-3 text-3xl font-bold text-red-900 dark:text-red-100">
              {esLicencia ? 'Mantenimiento Vencido' : 'Plan Vencido'}
            </CardTitle>
            <CardDescription className="text-lg text-red-800 dark:text-red-200">
              {esLicencia 
                ? `Tu mantenimiento venció el ${formatLocalDate(paqueteInfo.suscripcion.fechaVencimiento)}. Renueva tu mantenimiento anual para continuar usando el sistema.`
                : `Tu plan venció el ${formatLocalDate(paqueteInfo.suscripcion.fechaVencimiento)}. Renueva tu suscripción para continuar usando todas las funcionalidades.`
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pb-8">
            <div className="flex items-center justify-center gap-2 text-red-700 dark:text-red-300">
              <AlertCircle className="h-5 w-5" />
              <p className="font-semibold">
                El acceso al sistema está bloqueado hasta que renueves tu {esLicencia ? 'mantenimiento' : 'plan'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Plan Actual */}
        {paqueteActual && (
          <Card className="overflow-hidden border-2 border-primary shadow-xl">
            <CardHeader className="space-y-4 bg-gradient-to-br from-primary/5 to-primary/10">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="mb-2 text-2xl font-bold">{paqueteActual.displayName}</CardTitle>
                  <CardDescription className="text-base">{paqueteActual.descripcion}</CardDescription>
                </div>
                <Badge className="bg-red-500">
                  Vencido
                </Badge>
              </div>
              <div className="border-t pt-4">
                {esLicencia ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold tracking-tight">${paqueteActual.precio.anual}</span>
                    <span className="text-lg text-muted-foreground">/año</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold tracking-tight">${paqueteActual.precio.mensual}</span>
                      <span className="text-lg text-muted-foreground">/mes</span>
                    </div>
                    {paqueteActual.precio.anual > 0 && (
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100">
                          Ahorra 17%
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          ${paqueteActual.precio.anual}/año
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
              <div className="space-y-3">
                <h4 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  Incluye
                </h4>
                <ul className="grid gap-2 sm:grid-cols-2">
                  <li className="flex items-center gap-2 text-sm">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                      <span className="text-xs font-bold text-green-600 dark:text-green-400">✓</span>
                    </div>
                    <span>{paqueteActual.limites.doctores} doctor{paqueteActual.limites.doctores > 1 ? 'es' : ''}</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                      <span className="text-xs font-bold text-green-600 dark:text-green-400">✓</span>
                    </div>
                    <span>{paqueteActual.limites.recepcionistas} recepcionista{paqueteActual.limites.recepcionistas > 1 ? 's' : ''}</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                      <span className="text-xs font-bold text-green-600 dark:text-green-400">✓</span>
                    </div>
                    <span>Pacientes ilimitados</span>
                  </li>
                  {paqueteActual.features.uploadDocumentos && (
                    <li className="flex items-center gap-2 text-sm">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                        <span className="text-xs font-bold text-green-600 dark:text-green-400">✓</span>
                      </div>
                      <span>Subida de documentos</span>
                    </li>
                  )}
                  {paqueteActual.features.uploadImagenes && (
                    <li className="flex items-center gap-2 text-sm">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                        <span className="text-xs font-bold text-green-600 dark:text-green-400">✓</span>
                      </div>
                      <span>Subida de imágenes</span>
                    </li>
                  )}
                  {paqueteActual.features.reportesAvanzados && (
                    <li className="flex items-center gap-2 text-sm">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                        <span className="text-xs font-bold text-green-600 dark:text-green-400">✓</span>
                      </div>
                      <span>Reportes avanzados</span>
                    </li>
                  )}
                </ul>
              </div>

              <div className="border-t pt-6">
                {esLicencia ? (
                  <Button
                    onClick={() => handleRenovar(paqueteActual.nombre, 'anual')}
                    disabled={!!loadingCheckout}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-lg py-6"
                    size="lg"
                  >
                    {loadingCheckout === `${paqueteActual.nombre}-anual` ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-5 w-5" />
                        Renovar Mantenimiento Anual - ${paqueteActual.precio.anual}
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <Button
                      onClick={() => handleRenovar(paqueteActual.nombre, 'mensual')}
                      disabled={!!loadingCheckout}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-lg py-6"
                      size="lg"
                    >
                      {loadingCheckout === `${paqueteActual.nombre}-mensual` ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Procesando...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-5 w-5" />
                          Renovar Plan Mensual - ${paqueteActual.precio.mensual}/mes
                        </>
                      )}
                    </Button>
                    {paqueteActual.precio.anual > 0 && (
                      <Button
                        onClick={() => handleRenovar(paqueteActual.nombre, 'anual')}
                        disabled={!!loadingCheckout}
                        variant="outline"
                        className="w-full border-2 border-green-500 text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950 text-lg py-6"
                        size="lg"
                      >
                        {loadingCheckout === `${paqueteActual.nombre}-anual` ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Procesando...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-5 w-5" />
                            Renovar Plan Anual - ${paqueteActual.precio.anual}/año (Ahorra 17%)
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>¿Necesitas ayuda? Contacta a soporte técnico</p>
        </div>
      </div>
    </div>
  );
}
