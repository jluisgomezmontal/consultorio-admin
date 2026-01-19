'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { citaService, CitaEstado } from '@/services/cita.service';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useConsultorioPermissions } from '@/hooks/useConsultorioPermissions';
import {
  ArrowLeft,
  Edit,
  CalendarDays,
  Clock,
  Stethoscope,
  UserRound,
  Building2,
  FileText,
  ClipboardSignature,
  Coins,
  StickyNote,
  Trash2,
  Download,
  ExternalLink,
  Activity,
  Weight,
  Heart,
  Ruler,
  ChevronDown,
  Thermometer,
  Droplet,
  Calculator,
  ChevronUp,
  DollarSign,
} from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { formatLocalDate } from '@/lib/dateUtils';
import { DocumentUploader } from '@/components/DocumentUploader';
import { DocumentList } from '@/components/DocumentList';
import { GenerarRecetaDialog } from '@/components/GenerarRecetaDialog';
import { documentoService } from '@/services/documento.service';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';

const estadoLabels: Record<CitaEstado, string> = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  completada: 'Completada',
  cancelada: 'Cancelada',
};

export default function CitaDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();
  const [recetaDialogOpen, setRecetaDialogOpen] = useState(false);
  const { confirm } = useConfirmDialog();
  const [selectedEstado, setSelectedEstado] = useState<CitaEstado>('pendiente');
  const [estadoError, setEstadoError] = useState('');
  const [openSections, setOpenSections] = useState({
    vitalSigns: true,
    medicalEvaluation: true,
    diagnosisTreatment: true,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const { canViewClinicalInfo } = useConsultorioPermissions();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  // Refrescar datos cuando se vuelve a la página (por ejemplo, después de crear un pago)
  useEffect(() => {
    const handleFocus = () => {
      queryClient.invalidateQueries({ queryKey: ['cita', id] });
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [id, queryClient]);

  const { data, isLoading } = useQuery({
    queryKey: ['cita', id],
    queryFn: () => citaService.getCitaById(id),
    enabled: !!user && !!id,
  });

  const { data: documentosData, refetch: refetchDocumentos } = useQuery({
    queryKey: ['documentos', id],
    queryFn: () => documentoService.getDocumentosByCita(id),
    enabled: !!user && !!id,
  });

  useEffect(() => {
    if (data?.data?.estado) {
      setSelectedEstado(data.data.estado);
    }
  }, [data?.data?.estado]);

  const cancelMutation = useMutation({
    mutationFn: () => citaService.cancelCita(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['citas'] });
      queryClient.invalidateQueries({ queryKey: ['cita', id] });
      queryClient.invalidateQueries({ queryKey: ['paciente-history'] });
      if (data?.data?.paciente?.id) {
        queryClient.invalidateQueries({ queryKey: ['paciente', data.data.paciente.id] });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => citaService.deleteCita(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['citas'] });
      queryClient.invalidateQueries({ queryKey: ['paciente-history'] });
      if (data?.data?.paciente?.id) {
        queryClient.invalidateQueries({ queryKey: ['paciente', data.data.paciente.id] });
      }
      router.push('/citas');
    },
  });

  const updateEstadoMutation = useMutation({
    mutationFn: (nuevoEstado: CitaEstado) => citaService.updateCita(id, { estado: nuevoEstado }),
    onSuccess: (_, nuevoEstado) => {
      queryClient.invalidateQueries({ queryKey: ['citas'] });
      queryClient.invalidateQueries({ queryKey: ['cita', id] });
      queryClient.invalidateQueries({ queryKey: ['paciente-history'] });
      if (data?.data?.paciente?.id) {
        queryClient.invalidateQueries({ queryKey: ['paciente', data.data.paciente.id] });
      }
      setEstadoError('');
      setSelectedEstado(nuevoEstado);
    },
    onError: (error: any) => {
      setEstadoError(error?.response?.data?.message || 'No se pudo actualizar el estado de la cita');
    },
  });

  // const handleCancel = async () => {
  //   if (!data?.data) return;
  //   if (data.data.estado === 'cancelada' || data.data.estado === 'completada') return;

  //   const confirmed = await confirm({
  //     title: '¿Cancelar esta cita?',
  //     text: 'Esta acción cambiará el estado de la cita a cancelada',
  //     confirmButtonText: 'Sí, cancelar',
  //     confirmButtonColor: '#f59e0b',
  //   });

  //   if (confirmed) {
  //     await cancelMutation.mutateAsync();
  //   }
  // };

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: '¿Eliminar esta cita?',
      text: 'Esta acción no se puede deshacer',
      confirmButtonText: 'Sí, eliminar',
    });

    if (confirmed) {
      await deleteMutation.mutateAsync();
    }
  };

  const handleEstadoUpdate = async () => {
    if (!cita) return;
    if (selectedEstado === cita.estado) return;
    await updateEstadoMutation.mutateAsync(selectedEstado);
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user || !data?.data) {
    return null;
  }

  const cita = data.data;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header con gradiente */}
        <div className="mb-8 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-6 border border-blue-100 dark:border-blue-900 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Button variant="ghost" size="sm" className="hover:bg-white/50 dark:hover:bg-gray-800/50" onClick={() => {
                  router.back();
                  setTimeout(() => {
                    window.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    });
                  }, 80);
                }}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Citas
                </Button>
                {cita.paciente?.id && (
                  <Link href={`/pacientes/${cita.paciente.id}`}>
                    <Button variant="ghost" size="sm" className="hover:bg-white/50 dark:hover:bg-gray-800/50">
                      <UserRound className="mr-2 h-4 w-4" />
                      Ver Paciente
                      <ExternalLink className="ml-2 h-3 w-3" />
                    </Button>
                  </Link>
                )}
              </div>
              <h1 className="text-2xl font-bold text-foreground break-words">Detalle de Cita</h1>
              <p className="text-sm text-muted-foreground mt-1 break-words">
                {cita.paciente?.fullName} • {formatLocalDate(cita.date)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {(user.role === 'doctor' || user.role === 'admin') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRecetaDialogOpen(true)}
                  className="bg-white dark:bg-gray-800"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Generar Receta</span>
                  <span className="sm:hidden">Receta</span>
                </Button>
              )}
              {(user.role === 'admin' || user.role === 'doctor' || user.role === 'recepcionista') && (
                <Button variant="outline" size="sm" onClick={() => router.push(`/citas/${id}/editar`)} className="bg-white dark:bg-gray-800">
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Button>
              )}
              {(cita.estado === 'completada') && (
                <Button variant="default" size="sm" asChild className="bg-green-600 hover:bg-green-700">
                  <Link href={`/pagos/nuevo?citaId=${id}`}>
                    <Coins className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Registrar pago</span>
                    <span className="sm:hidden">Pago</span>
                  </Link>
                </Button>
              )}
              {user.role === 'admin' && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Eliminar</span>
                  <span className="sm:hidden">Borrar</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Badge de Estado */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">Estado:</span>
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${cita.estado === 'completada' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
              cita.estado === 'confirmada' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                cita.estado === 'cancelada' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
              }`}>
              {estadoLabels[cita.estado]}
            </span>
          </div>
          <div className="text-right">
            {(user.role === 'admin' || user.role === 'doctor' || user.role === 'recepcionista') && (
              <div className="flex flex-col gap-2 items-end">
                <div className="flex items-center gap-2">
                  <select
                    value={selectedEstado}
                    onChange={(event) => setSelectedEstado(event.target.value as CitaEstado)}
                    className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                  >
                    {Object.entries(estadoLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <Button
                    size="sm"
                    onClick={handleEstadoUpdate}
                    disabled={selectedEstado === cita.estado || updateEstadoMutation.isPending}
                  >
                    {updateEstadoMutation.isPending ? 'Actualizando...' : 'Actualizar'}
                  </Button>
                </div>
                {estadoError && <p className="text-xs text-destructive">{estadoError}</p>}
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
              <CardTitle className="flex items-center gap-2 text-xl">
                <CalendarDays className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Información de la cita
              </CardTitle>  
              <CardDescription>
                Datos generales programados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Fecha y Hora</p>
                  <p className="text-foreground font-semibold">
                    {formatLocalDate(cita.date, {
                      weekday: 'long',
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground">{cita.time}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <UserRound className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Paciente</p>
                  <p className="text-foreground font-semibold">{cita.paciente?.fullName || 'Sin paciente registrado'}</p>
                  {cita.paciente?.phone && <p className="text-sm text-muted-foreground mt-1">{cita.paciente.phone}</p>}
                  {cita.paciente?.id && (
                    <Link href={`/pacientes/${cita.paciente.id}`} className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mt-1 inline-flex items-center gap-1">
                      Ver perfil completo
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              </div>
                            {cita.motivo && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Motivo de Consulta</p>
                    <p className="text-foreground break-words">{cita.motivo}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
              <CardTitle className="flex items-center gap-2 text-xl">
                <CalendarDays className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Información de la consulta
              </CardTitle>
              <CardDescription>
                Detalles de la consulta programada
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <Stethoscope className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Doctor</p>
                  <p className="text-foreground font-semibold">{cita.doctor?.name || 'Sin doctor asignado'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <Building2 className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Consultorio</p>
                  <p className="text-foreground font-semibold">{cita.consultorio?.name || 'Sin consultorio asignado'}</p>
                </div>
              </div>

              {cita.costo !== undefined && cita.costo !== null && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800">
                  <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Costo de la Consulta</p>
                    <p className="text-foreground font-bold text-lg">${cita.costo.toFixed(2)} MXN</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>


        </div>

        {/* Sección de Evaluación Médica */}
        <Card className="shadow-md hover:shadow-lg transition-shadow mt-6">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
            <button
              type="button"
              onClick={() => toggleSection('vitalSigns')}
              className="w-full flex items-center justify-between text-left"
            >
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
                  Signos Vitales
                </CardTitle>
                <CardDescription>
                  Mediciones y datos antropométricos
                </CardDescription>
              </div>
              {openSections.vitalSigns ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
          </CardHeader>
          {openSections.vitalSigns && (
            <CardContent className="space-y-4 pt-6">
              {(cita.weight || cita.bloodPressure || cita.heartRate || cita.temperature || cita.oxygenSaturation || cita.bmi || cita.measurements?.height || cita.measurements?.waist || cita.measurements?.hip) ? (
                <>
                  {/* Signos Vitales Principales */}
                  {(cita.temperature || cita.heartRate || cita.bloodPressure || cita.oxygenSaturation) && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Signos Vitales</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {cita.temperature && (
                          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                            <Thermometer className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Temperatura</p>
                              <p className="text-foreground font-semibold">{cita.temperature} °C</p>
                            </div>
                          </div>
                        )}
                        {cita.heartRate && (
                          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                            <Activity className="h-5 w-5 text-red-500 mt-0.5" />
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Frecuencia Cardíaca</p>
                              <p className="text-foreground font-semibold">{cita.heartRate} lpm</p>
                            </div>
                          </div>
                        )}
                        {cita.bloodPressure && (
                          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                            <Heart className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Presión Arterial</p>
                              <p className="text-foreground font-semibold">{cita.bloodPressure} mmHg</p>
                            </div>
                          </div>
                        )}
                        {cita.oxygenSaturation && (
                          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                            <Droplet className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Saturación de Oxígeno</p>
                              <p className="text-foreground font-semibold">{cita.oxygenSaturation}% SpO₂</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Medidas Antropométricas */}
                  {(cita.weight || cita.measurements?.height || cita.measurements?.waist || cita.measurements?.hip) && (
                    <div className="space-y-3 pt-4 border-t">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Medidas Antropométricas</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {cita.weight && (
                          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                            <Weight className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Peso</p>
                              <p className="text-foreground font-semibold">{cita.weight} kg</p>
                            </div>
                          </div>
                        )}
                        {cita.measurements?.height && (
                          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                            <Ruler className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Altura</p>
                              <p className="text-foreground font-semibold">{cita.measurements.height} cm</p>
                            </div>
                          </div>
                        )}
                        {cita.measurements?.waist && (
                          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                            <Ruler className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Cintura</p>
                              <p className="text-foreground font-semibold">{cita.measurements.waist} cm</p>
                            </div>
                          </div>
                        )}
                        {cita.measurements?.hip && (
                          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                            <Ruler className="h-5 w-5 text-pink-600 dark:text-pink-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Cadera</p>
                              <p className="text-foreground font-semibold">{cita.measurements.hip} cm</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : null}
              
              {/* BMI Display */}
              {cita.bmi && (
                <div className="rounded-lg border-2 border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20 p-4 mt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-green-500/10">
                      <Calculator className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-900 dark:text-green-100">
                        Índice de Masa Corporal (IMC)
                      </p>
                      <p className="text-xs text-green-700 dark:text-green-300 mt-0.5">
                        Calculado automáticamente
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={
                        `text-2xl font-bold ${
                          cita.bmi < 18.5 ? 'text-blue-600 dark:text-blue-400' :
                          cita.bmi >= 18.5 && cita.bmi < 25 ? 'text-green-600 dark:text-green-400' :
                          cita.bmi >= 25 && cita.bmi < 30 ? 'text-yellow-600 dark:text-yellow-400' :
                          'text-red-600 dark:text-red-400'
                        }`
                      }>
                        {cita.bmi.toFixed(2)}
                      </p>
                      <p className={
                        `text-sm font-medium ${
                          cita.bmi < 18.5 ? 'text-blue-600 dark:text-blue-400' :
                          cita.bmi >= 18.5 && cita.bmi < 25 ? 'text-green-600 dark:text-green-400' :
                          cita.bmi >= 25 && cita.bmi < 30 ? 'text-yellow-600 dark:text-yellow-400' :
                          'text-red-600 dark:text-red-400'
                        }`
                      }>
                        {
                          cita.bmi < 18.5 ? 'Bajo peso' :
                          cita.bmi >= 18.5 && cita.bmi < 25 ? 'Normal' :
                          cita.bmi >= 25 && cita.bmi < 30 ? 'Sobrepeso' :
                          'Obesidad'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {!(cita.weight || cita.bloodPressure || cita.heartRate || cita.temperature || cita.oxygenSaturation || cita.bmi || cita.measurements?.height || cita.measurements?.waist || cita.measurements?.hip) && (
                <div className="text-center py-6 text-muted-foreground">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No se registraron signos vitales</p>
                </div>
              )}
            </CardContent>
          )}
        </Card>
        {/* Sección de Evaluación Médica */}
        {canViewClinicalInfo && (cita.currentCondition || cita.physicalExam) && (
          <Card className="shadow-md hover:shadow-lg transition-shadow mt-6">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20">
              <button
                type="button"
                onClick={() => toggleSection('medicalEvaluation')}
                className="w-full flex items-center justify-between text-left"
              >
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Stethoscope className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    Evaluación Médica
                  </CardTitle>
                  <CardDescription>
                    Padecimiento actual y exploración física
                  </CardDescription>
                </div>
                {openSections.medicalEvaluation ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
            </CardHeader>
            {openSections.medicalEvaluation && (
              <CardContent className="space-y-4 pt-6">
                {cita.currentCondition && (
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2 font-semibold">Padecimiento Actual</p>
                    <p className="text-foreground break-words whitespace-pre-wrap">{cita.currentCondition}</p>
                  </div>
                )}
                {cita.physicalExam && (
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2 font-semibold">Exploración Física</p>
                    <p className="text-foreground break-words whitespace-pre-wrap">{cita.physicalExam}</p>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        )}

        {/* Sección de Diagnóstico y Tratamiento */}
        {canViewClinicalInfo && (
        <Card className="shadow-md hover:shadow-lg transition-shadow mt-6">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
            <button
              type="button"
              onClick={() => toggleSection('diagnosisTreatment')}
              className="w-full flex items-center justify-between text-left"
            >
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  Diagnóstico y Tratamiento
                </CardTitle>
                <CardDescription>
                  Plan terapéutico y medicamentos
                </CardDescription>
              </div>
              {openSections.diagnosisTreatment ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
          </CardHeader>
          {openSections.diagnosisTreatment && (
            <CardContent className="space-y-5 pt-6">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Diagnóstico</p>
                <p className="text-foreground break-words whitespace-pre-wrap">{cita.diagnostico || 'Sin diagnóstico registrado'}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Tratamiento</p>
                <p className="text-foreground break-words whitespace-pre-wrap">{cita.tratamiento || 'Sin tratamiento registrado'}</p>
              </div>
              {cita.medicamentos && cita.medicamentos.length > 0 && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Medicamentos Prescritos</p>
                  <div className="space-y-3">
                    {cita.medicamentos.map((med, index) => (
                      <div key={index} className="border-l-2 border-amber-500 pl-3 py-2 bg-background/50 rounded-r">
                        <p className="font-semibold text-foreground mb-1 break-words">{index + 1}. {med.nombre}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                          {med.dosis && <p className="break-words"><span className="font-medium">Dosis:</span> {med.dosis}</p>}
                          {med.frecuencia && <p className="break-words"><span className="font-medium">Frecuencia:</span> {med.frecuencia}</p>}
                          {med.duracion && <p className="break-words"><span className="font-medium">Duración:</span> {med.duracion}</p>}
                        </div>
                        {med.indicaciones && (
                          <p className="text-sm text-muted-foreground mt-2 italic break-words">
                            <span className="font-medium">Indicaciones:</span> {med.indicaciones}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          )}
        </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-2 mt-6">
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Coins className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                    Información de pagos
                  </CardTitle>
                  <CardDescription>
                    Historial de pagos asociados a la cita
                  </CardDescription>
                </div>
                {cita.estado === 'completada' && (
                  <Button size="sm" asChild className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
                    <Link href={`/pagos/nuevo?citaId=${id}`}>
                      <Coins className="mr-2 h-4 w-4" />
                      Registrar Pago
                    </Link>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-6">
              {cita.pagos && cita.pagos.length > 0 ? (
                cita.pagos.map((pago) => (
                  <Link href={`/pagos/${pago.id}`} key={pago.id}>
                    <div key={pago.id} className="rounded-lg border border-border p-4 bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-foreground font-semibold text-lg">${pago.monto.toFixed(2)} MXN</p>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${pago.estatus === 'completado' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          pago.estatus === 'pendiente' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                          }`}>
                          {pago.estatus}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(pago.createdAt).toLocaleString('es-MX')}
                      </p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-3">No hay pagos registrados.</p>
                  {cita.estado === 'completada' && (
                    <Button size="sm" asChild variant="outline">
                      <Link href={`/pagos/nuevo?citaId=${id}`}>
                        <Coins className="mr-2 h-4 w-4" />
                        Crear primer pago
                      </Link>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
              <CardTitle className="flex items-center gap-2 text-xl">
                <ClipboardSignature className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                Notas adicionales
              </CardTitle>
              <CardDescription>
                Observaciones relacionadas con la cita
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <StickyNote className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                <p className="text-foreground break-words">{cita.notas || 'Sin notas registradas.'}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sección de Documentos */}
        <div className="mt-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <DocumentUploader
              citaId={id}
              pacienteId={cita.paciente?.id || ''}
              onUploadSuccess={() => {
                refetchDocumentos();
              }}
            />
            {documentosData?.data && (
              <DocumentList
                documentos={documentosData.data}
                onDelete={() => {
                  refetchDocumentos();
                }}
              />
            )}
          </div>
        </div>
      </main>

      {cita && (
        <GenerarRecetaDialog
          open={recetaDialogOpen}
          onOpenChange={setRecetaDialogOpen}
          citaId={id}
          pacienteNombre={cita.paciente?.fullName || 'Paciente'}
        />
      )}
    </div>
  );
}
