'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/Navbar';
import { ArrowLeft, Calendar, DollarSign, User, MapPin, Clock } from 'lucide-react';
import { pacienteService } from '@/services/paciente.service';
import { useQuery } from '@tanstack/react-query';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const estadoLabels = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  completada: 'Completada',
  cancelada: 'Cancelada',
};

const estadoVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pendiente: 'secondary',
  confirmada: 'default',
  completada: 'outline',
  cancelada: 'destructive',
};

const estatusPagoLabels = {
  pagado: 'Pagado',
  pendiente: 'Pendiente',
};

export default function PacienteHistorialPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const { data: historyData, isLoading } = useQuery({
    queryKey: ['paciente-history', id],
    queryFn: () => pacienteService.getPacienteHistory(id),
    enabled: !!user && !!id,
  });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-24">
            <LoadingSpinner
              delay={0}
              fullScreen={false}
              message="Cargando historial..."
            />
          </div>
        </main>
      </div>
    );
  }

  if (!user || !historyData) {
    return null;
  }

  const paciente = historyData.data;
  const citas = paciente.citas || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push(`/pacientes/${id}`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Paciente
          </Button>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold">Historial Completo</h1>
          <p className="mt-2 text-muted-foreground">
            <User className="inline h-4 w-4 mr-1" />
            {paciente.fullName}
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Resumen de Citas
            </CardTitle>
            <CardDescription>
              Total de {citas.length} cita{citas.length !== 1 ? 's' : ''} registrada{citas.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
        </Card>

        {citas.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Calendar className="mx-auto h-12 w-12 mb-4 opacity-20" />
              <p>No hay citas registradas para este paciente</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {citas.map((cita: any) => {
              const totalPagado = cita.pagos?.reduce(
                (sum: number, pago: any) => sum + (pago.estatus === 'pagado' ? pago.monto : 0),
                0
              ) || 0;
              const totalPendiente = cita.pagos?.reduce(
                (sum: number, pago: any) => sum + (pago.estatus === 'pendiente' ? pago.monto : 0),
                0
              ) || 0;

              return (
                <Card key={cita.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">
                          {new Date(cita.date).toLocaleDateString('es-MX', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {cita.time}
                          </span>
                          {cita.consultorio && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {cita.consultorio.name}
                            </span>
                          )}
                        </CardDescription>
                      </div>
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                        cita.estado === 'completada' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        cita.estado === 'confirmada' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                        cita.estado === 'cancelada' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {estadoLabels[cita.estado as keyof typeof estadoLabels] || cita.estado}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Doctor</p>
                        <p className="text-sm">{cita.doctor?.name || 'No especificado'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Tipo de Cita</p>
                        <p className="text-sm capitalize">{cita.tipo || 'No especificado'}</p>
                      </div>
                    </div>

                    {cita.motivo && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Motivo</p>
                        <p className="text-sm whitespace-pre-wrap">{cita.motivo}</p>
                      </div>
                    )}

                    {cita.notas && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Notas</p>
                        <p className="text-sm whitespace-pre-wrap">{cita.notas}</p>
                      </div>
                    )}

                    {cita.pagos && cita.pagos.length > 0 && (
                      <div className="border-t pt-4">
                        <p className="text-sm font-medium mb-3 flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Información de Pagos
                        </p>
                        <div className="space-y-2">
                          {cita.pagos.map((pago: any) => (
                            <div
                              key={pago.id}
                              className="flex items-center justify-between rounded-lg border border-border p-3 text-sm"
                            >
                              <div className="space-y-1">
                                <p className="font-medium">
                                  ${pago.monto.toFixed(2)}
                                </p>
                                <p className="text-xs text-muted-foreground capitalize">
                                  {pago.metodo}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(pago.fechaPago).toLocaleDateString('es-MX')}
                                </p>
                              </div>
                              <Badge
                                variant={pago.estatus === 'pagado' ? 'default' : 'secondary'}
                              >
                                {estatusPagoLabels[pago.estatus as keyof typeof estatusPagoLabels]}
                              </Badge>
                            </div>
                          ))}
                          <div className="flex justify-between pt-2 border-t text-sm font-medium">
                            <span>Total Pagado:</span>
                            <span className="text-green-600">${totalPagado.toFixed(2)}</span>
                          </div>
                          {totalPendiente > 0 && (
                            <div className="flex justify-between text-sm font-medium">
                              <span>Total Pendiente:</span>
                              <span className="text-orange-600">${totalPendiente.toFixed(2)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/citas/${cita.id}`)}
                      >
                        Ver Detalles
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
