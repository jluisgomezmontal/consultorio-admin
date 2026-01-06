'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/Navbar';
import { ArrowLeft, Calendar, DollarSign, User, MapPin, Clock, Stethoscope, FileText, TrendingUp, Activity, CheckCircle2, XCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { pacienteService } from '@/services/paciente.service';
import { useQuery } from '@tanstack/react-query';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { formatLocalDate } from '@/lib/dateUtils';

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
        {/* Header profesional */}
        <div className="mb-8 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8 border shadow-sm">
          <Button
            variant="ghost"
            onClick={() => router.push(`/pacientes/${id}`)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Paciente
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <Activity className="h-8 w-8 text-primary" />
                Historial Médico Completo
              </h1>
              <p className="text-muted-foreground text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                {paciente.fullName}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="bg-card rounded-lg px-5 py-3 text-center border shadow-sm">
                <p className="text-muted-foreground text-xs font-medium mb-1">Total de Citas</p>
                <p className="text-2xl font-bold">{citas.length}</p>
              </div>
              <div className="bg-card rounded-lg px-5 py-3 text-center border shadow-sm">
                <p className="text-muted-foreground text-xs font-medium mb-1">Completadas</p>
                <p className="text-2xl font-bold">
                  {citas.filter((c: any) => c.estado === 'completada').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {citas.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="py-16 text-center">
              <div className="mx-auto w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                <Calendar className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No hay citas registradas</h3>
              <p className="text-muted-foreground">Este paciente aún no tiene citas en el historial</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6 relative">
            {/* Timeline vertical */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border hidden md:block" />
            
            {citas.map((cita: any, index: number) => {
              const totalPagado = cita.pagos?.reduce(
                (sum: number, pago: any) => sum + (pago.estatus === 'pagado' ? pago.monto : 0),
                0
              ) || 0;
              const totalPendiente = cita.pagos?.reduce(
                (sum: number, pago: any) => sum + (pago.estatus === 'pendiente' ? pago.monto : 0),
                0
              ) || 0;

              return (
                <div key={cita.id} className="relative md:ml-16 group">
                  {/* Timeline dot */}
                  <div className="absolute -left-8 top-8 hidden md:flex items-center justify-center">
                    <div className={`w-4 h-4 rounded-full border-4 border-background ${
                      cita.estado === 'completada' ? 'bg-green-500' :
                      cita.estado === 'confirmada' ? 'bg-blue-500' :
                      cita.estado === 'cancelada' ? 'bg-red-500' :
                      'bg-yellow-500'
                    } shadow-lg`} />
                  </div>
                  
                  <Card className="overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                    <CardHeader className="bg-muted/50 border-b">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              cita.estado === 'completada' ? 'bg-green-100 dark:bg-green-900/30' :
                              cita.estado === 'confirmada' ? 'bg-blue-100 dark:bg-blue-900/30' :
                              cita.estado === 'cancelada' ? 'bg-red-100 dark:bg-red-900/30' :
                              'bg-yellow-100 dark:bg-yellow-900/30'
                            }`}>
                              {cita.estado === 'completada' ? <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" /> :
                               cita.estado === 'confirmada' ? <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" /> :
                               cita.estado === 'cancelada' ? <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" /> :
                               <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />}
                            </div>
                            <div>
                              <CardTitle className="text-xl font-bold">
                                {formatLocalDate(cita.date, {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </CardTitle>
                              <CardDescription className="flex flex-wrap items-center gap-3 mt-1">
                                <span className="flex items-center gap-1.5 font-medium">
                                  <Clock className="h-4 w-4" />
                                  {cita.time}
                                </span>
                                {cita.consultorio && (
                                  <span className="flex items-center gap-1.5">
                                    <MapPin className="h-4 w-4" />
                                    {cita.consultorio.name}
                                  </span>
                                )}
                              </CardDescription>
                            </div>
                          </div>
                        </div>
                        <Badge className={`shrink-0 px-3 py-1 text-xs font-medium ${
                          cita.estado === 'completada' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          cita.estado === 'confirmada' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                          cita.estado === 'cancelada' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {estadoLabels[cita.estado as keyof typeof estadoLabels] || cita.estado}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-5 pt-6">
                      {/* Información principal con iconos */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted border">
                          <Stethoscope className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Doctor</p>
                            <p className="text-sm font-medium">{cita.doctor?.name || 'No especificado'}</p>
                          </div>
                        </div>
                        {cita.costo !== undefined && cita.costo !== null && (
                          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted border">
                            <DollarSign className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                            <div>
                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Costo</p>
                              <p className="text-sm font-bold">${cita.costo.toFixed(2)} MXN</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {cita.motivo && (
                        <div className="p-4 rounded-lg bg-muted border">
                          <div className="flex items-start gap-3">
                            <FileText className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                            <div className="flex-1">
                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Motivo de Consulta</p>
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">{cita.motivo}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {(cita.diagnostico || cita.tratamiento) && (
                        <div className="p-4 rounded-lg bg-muted border">
                          <div className="space-y-3">
                            {cita.diagnostico && (
                              <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Diagnóstico</p>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{cita.diagnostico}</p>
                              </div>
                            )}
                            {cita.tratamiento && (
                              <div className={cita.diagnostico ? 'pt-3 border-t' : ''}>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Tratamiento</p>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{cita.tratamiento}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {cita.notas && (
                        <div className="p-4 rounded-lg bg-muted border">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Notas Adicionales</p>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{cita.notas}</p>
                        </div>
                      )}

                      {cita.pagos && cita.pagos.length > 0 && (
                        <div className="p-4 rounded-lg bg-muted border">
                          <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            <p className="text-sm font-semibold">Información de Pagos</p>
                          </div>
                          <div className="space-y-3">
                            {cita.pagos.map((pago: any) => (
                              <div
                                key={pago.id}
                                className="flex items-center justify-between rounded-lg bg-card border p-3"
                              >
                                <div className="space-y-1">
                                  <p className="font-bold text-base">
                                    ${pago.monto.toFixed(2)} MXN
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
                            <div className="flex justify-between pt-3 border-t text-sm font-semibold">
                              <span>Total Pagado:</span>
                              <span className="text-green-600 dark:text-green-400">${totalPagado.toFixed(2)}</span>
                            </div>
                            {totalPendiente > 0 && (
                              <div className="flex justify-between text-sm font-semibold">
                                <span>Total Pendiente:</span>
                                <span className="text-orange-600 dark:text-orange-400">${totalPendiente.toFixed(2)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-3 pt-4 border-t">
                        <Button
                          onClick={() => router.push(`/citas/${cita.id}`)}
                          className="flex-1"
                        >
                          Ver Detalles Completos
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
