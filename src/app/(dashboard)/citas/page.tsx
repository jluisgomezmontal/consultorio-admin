'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { citaService, Cita, CitaEstado, CitasFilters } from '@/services/cita.service';
import { userService } from '@/services/user.service';
import { consultorioService } from '@/services/consultorio.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, Clock, Eye, Pencil, Plus, Search, Stethoscope, Trash2, UserRound, Building2, DollarSign, Phone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ResponsiveTable } from '@/components/ResponsiveTable';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { formatLocalDate } from '@/lib/dateUtils';
import { PhoneDisplay } from '@/components/PhoneDisplay';

const estadoLabels: Record<CitaEstado, string> = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  completada: 'Completada',
  cancelada: 'Cancelada',
};

const estadoVariants: Record<CitaEstado, 'secondary' | 'default' | 'destructive' | 'outline'> = {
  pendiente: 'secondary',
  confirmada: 'default',
  completada: 'outline',
  cancelada: 'destructive',
};

type AppliedFilters = Omit<CitasFilters, 'page' | 'limit'>;

export default function CitasPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <LoadingSpinner delay={0} fullScreen={false} message="Cargando citas..." />
        </div>
      }
    >
      <CitasContent />
    </Suspense>
  );
}

function CitasContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { confirm } = useConfirmDialog();
  const limit = 10;
  const todayDate = useMemo(() => {
    const nowDate = new Date();
    const localMidnight = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate());
    return localMidnight.toISOString().split('T')[0];
  }, []);
  const estadoParam = searchParams.get('estado');
  const validEstados: CitaEstado[] = ['pendiente', 'confirmada', 'completada', 'cancelada'];
  const initialEstado =
    estadoParam && validEstados.includes(estadoParam as CitaEstado)
      ? (estadoParam as CitaEstado)
      : 'todos';
  const initialDoctorId = searchParams.get('doctorId') ?? '';
  const initialConsultorioId = searchParams.get('consultorioId') ?? '';
  const initialDateFrom = searchParams.get('dateFrom') ?? todayDate;
  const initialDateTo = searchParams.get('dateTo') ?? '';
  const initialSearch = searchParams.get('search') ?? '';
  const initialPageValue = Number(searchParams.get('page') ?? '1');
  const initialPage = Number.isNaN(initialPageValue) || initialPageValue < 1 ? 1 : initialPageValue;

  const [page, setPage] = useState(initialPage);
  const [searchValue, setSearchValue] = useState(initialSearch);
  const [estadoFilter, setEstadoFilter] = useState<CitaEstado | 'todos'>(initialEstado);
  const [doctorFilter, setDoctorFilter] = useState(initialDoctorId);
  const [consultorioFilter, setConsultorioFilter] = useState(initialConsultorioId);
  const [dateFrom, setDateFrom] = useState(initialDateFrom);
  const [dateTo, setDateTo] = useState(initialDateTo);

  const [appliedFilters, setAppliedFilters] = useState<AppliedFilters>(() => {
    const filters: AppliedFilters = {};
    if (initialSearch) filters.search = initialSearch;
    if (initialEstado !== 'todos') filters.estado = initialEstado as CitaEstado;
    if (initialDoctorId) filters.doctorId = initialDoctorId;
    if (initialConsultorioId) filters.consultorioId = initialConsultorioId;
    if (initialDateFrom) filters.dateFrom = initialDateFrom;
    if (initialDateTo) filters.dateTo = initialDateTo;
    return filters;
  });

  const isDefaultFilters = useMemo(() => {
    return (
      searchValue.trim() === '' &&
      estadoFilter === 'todos' &&
      !doctorFilter &&
      !consultorioFilter &&
      dateFrom === todayDate &&
      !dateTo
    );
  }, [searchValue, estadoFilter, doctorFilter, consultorioFilter, dateFrom, dateTo, todayDate]);

  const requestFilters = useMemo<CitasFilters>(() => {
    const filters: CitasFilters = { page, limit };
    if (appliedFilters.search) filters.search = appliedFilters.search;
    if (appliedFilters.estado) filters.estado = appliedFilters.estado;
    if (appliedFilters.doctorId) filters.doctorId = appliedFilters.doctorId;
    if (appliedFilters.consultorioId) filters.consultorioId = appliedFilters.consultorioId;
    if (appliedFilters.dateFrom) filters.dateFrom = appliedFilters.dateFrom;
    if (appliedFilters.dateTo) filters.dateTo = appliedFilters.dateTo;
    return filters;
  }, [appliedFilters, page, limit]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;

    const params = new URLSearchParams();
    if (requestFilters.page && requestFilters.page > 1) {
      params.set('page', requestFilters.page.toString());
    }
    if (requestFilters.search) params.set('search', requestFilters.search);
    if (requestFilters.estado) params.set('estado', requestFilters.estado);
    if (requestFilters.doctorId) params.set('doctorId', requestFilters.doctorId);
    if (requestFilters.consultorioId) params.set('consultorioId', requestFilters.consultorioId);
    if (requestFilters.dateFrom) params.set('dateFrom', requestFilters.dateFrom);
    if (requestFilters.dateTo) params.set('dateTo', requestFilters.dateTo);

    const queryString = params.toString();
    router.replace(queryString ? `/citas?${queryString}` : '/citas', { scroll: false });
  }, [requestFilters, router, user]);

  const { data: doctoresData } = useQuery({
    queryKey: ['doctores'],
    queryFn: () => userService.getDoctors(),
    enabled: !!user,
  });

  const { data: consultoriosData } = useQuery({
    queryKey: ['consultorios', 'options'],
    queryFn: () => consultorioService.getAllConsultorios(1, 100),
    enabled: !!user,
  });

  const { data: citasData, isLoading } = useQuery({
    queryKey: ['citas', requestFilters],
    queryFn: () => citaService.getAllCitas(requestFilters),
    enabled: !!user,
  });

  const citasResult = citasData;
  const citaLimit = citasResult?.limit ?? limit;
  const total = citasResult?.total ?? 0;
  const citas = citasResult?.data ?? [];
  const totalPages = Math.max(1, Math.ceil(total / Math.max(citaLimit, 1)));
  console.log(citas)
  useEffect(() => {
    if (!citasResult) return;
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [citasResult, page, totalPages]);

  const doctors = doctoresData?.data ?? [];
  const consultorios = consultoriosData?.data ?? [];

  const cancelMutation = useMutation({
    mutationFn: (id: string) => citaService.cancelCita(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['citas'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => citaService.deleteCita(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['citas'] });
    },
  });

  const handleCancel = async (cita: Cita) => {
    if (cita.estado === 'cancelada' || cita.estado === 'completada') return;

    const confirmed = await confirm({
      title: '¿Cancelar esta cita?',
      text: `Cita del ${formatLocalDate(cita.date)} a las ${cita.time}`,
      confirmButtonText: 'Sí, cancelar',
      confirmButtonColor: '#f59e0b',
    });

    if (confirmed) {
      try {
        await cancelMutation.mutateAsync(cita.id);
      } catch (error) {
        console.error('Error cancelando la cita:', error);
      }
    }
  };

  const handleDelete = async (cita: Cita) => {
    const confirmed = await confirm({
      title: '¿Eliminar esta cita?',
      text: `Cita del ${formatLocalDate(cita.date)} a las ${cita.time}. Esta acción no se puede deshacer.`,
      confirmButtonText: 'Sí, eliminar',
    });

    if (confirmed) {
      try {
        await deleteMutation.mutateAsync(cita.id);
      } catch (error) {
        console.error('Error eliminando la cita:', error);
      }
    }
  };

  const handleFiltersSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextFilters: AppliedFilters = {};
    const trimmedSearch = searchValue.trim();
    if (trimmedSearch) nextFilters.search = trimmedSearch;
    if (estadoFilter !== 'todos') nextFilters.estado = estadoFilter;
    if (doctorFilter) nextFilters.doctorId = doctorFilter;
    if (consultorioFilter) nextFilters.consultorioId = consultorioFilter;
    if (dateFrom) nextFilters.dateFrom = dateFrom;
    if (dateTo) nextFilters.dateTo = dateTo;

    setAppliedFilters(nextFilters);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearchValue('');
    setEstadoFilter('todos');
    setDoctorFilter('');
    setConsultorioFilter('');
    setDateFrom(todayDate);
    setDateTo('');
    setAppliedFilters({ dateFrom: todayDate });
    setPage(1);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 ">
          <Card className="flex items-center justify-center py-24">
            <LoadingSpinner
              delay={0}
              fullScreen={false}
              message="Cargando citas..."
            />
          </Card>
        </main>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="bg-background flex-1 flex flex-col">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-1">
        {/* Header con gradiente */}
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/20 dark:via-emerald-950/20 dark:to-teal-950/20 p-6 shadow-lg border border-green-100 dark:border-green-900">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CalendarDays className="h-5 w-5 md:h-6 md:w-6 text-green-600 dark:text-green-400" />
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">Gestión de Citas</h1>
              </div>
              <p className="text-sm text-muted-foreground">
                Visualiza y administra las citas del consultorio
              </p>
            </div>
            {(user.role === 'admin' || user.role === 'doctor' || user.role === 'recepcionista') && (
              <Button onClick={() => router.push('/citas/nueva')} size="lg" className="bg-green-600 hover:bg-green-700 shadow-md">
                <Plus className="mr-2 h-5 w-5" />
                Nueva Cita
              </Button>
            )}
          </div>
        </div>

        <Card className="mb-6 shadow-md">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20">
            <CardTitle className="text-lg">Filtros de Búsqueda</CardTitle>
            <CardDescription>Filtra las citas por diferentes criterios</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleFiltersSubmit} className="flex flex-col gap-4">
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Buscar por paciente, doctor, consultorio o motivo..."
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={estadoFilter}
                  onChange={(event) => setEstadoFilter(event.target.value as CitaEstado | 'todos')}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="todos">Todos los estados</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="confirmada">Confirmada</option>
                  <option value="completada">Completada</option>
                  <option value="cancelada">Cancelada</option>
                </select>
                <select
                  value={doctorFilter}
                  onChange={(event) => setDoctorFilter(event.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Todos los doctores</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name}
                    </option>
                  ))}
                </select>
                <select
                  value={consultorioFilter}
                  onChange={(event) => setConsultorioFilter(event.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Todos los consultorios</option>
                  {consultorios.map((consultorio) => (
                    <option key={consultorio.id} value={consultorio.id}>
                      {consultorio.name}
                    </option>
                  ))}
                </select>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(event) => setDateFrom(event.target.value)}
                  className="h-10"
                />
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(event) => setDateTo(event.target.value)}
                  className="h-10"
                  min={dateFrom || undefined}
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button type="submit">Aplicar filtros</Button>
                <Button type="button" variant="outline" onClick={handleClearFilters}
                  disabled={isDefaultFilters}
                >
                  Limpiar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Lista de Citas
            </CardTitle>
            <CardDescription>
              Revisa, edita o actualiza el estado de tus citas
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {citas.length === 0 ? (
              <div className="px-6 py-8 text-center text-sm text-muted-foreground">
                No se encontraron citas con los filtros seleccionados
              </div>
            ) : (
              <ResponsiveTable
                mobileCards={citas.map((cita) => (
                  <Card key={cita.id} className="border-l-4 border-l-green-500">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <Clock className="h-4 w-4 text-green-600" />
                            <span>
                              {formatLocalDate(cita.date, {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                            <span className="text-muted-foreground">•</span>
                            <span>{cita.time}</span>
                          </div>
                        </div>
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                          cita.estado === 'completada' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          cita.estado === 'confirmada' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                          cita.estado === 'cancelada' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {estadoLabels[cita.estado]}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <UserRound className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{cita.paciente?.fullName || 'Sin paciente'}</span>
                        </div>
                        {cita.paciente?.phone && (
                          <div className="flex items-center gap-2">
                            <PhoneDisplay phone={cita.paciente.phone} className="text-sm" />
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Stethoscope className="h-4 w-4" />
                          <span>{cita.doctor?.name || 'Sin doctor asignado'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Building2 className="h-4 w-4" />
                          <span>{cita.consultorio?.name || 'Sin consultorio'}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2 border-t">
                        {(cita.estado === 'completada' && (cita.pagos?.length ?? 0) === 0) && (
                          <Button size="sm" className="flex-1" asChild>
                            <Link href={`/pagos/nuevo?citaId=${cita.id}`}>
                              <DollarSign className="mr-2 h-4 w-4" />
                              Pagar
                            </Link>
                          </Button>
                        )}
                        <Button variant="outline" size="sm" className="flex-1" asChild>
                          <Link href={`/citas/${cita.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver
                          </Link>
                        </Button>
                        {user.role === 'admin' && (
                          <Button
                            variant="destructive"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleDelete(cita)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              >
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Fecha | Hora
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Paciente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Doctor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Consultorio
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-card">
                    {citas.map((cita) => (
                      <tr key={cita.id} className="hover:bg-muted/50">
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <div className="flex flex-col">
                              <span className="font-medium text-foreground">
                                {formatLocalDate(cita.date, {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                              <span>{cita.time}</span>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <UserRound className="h-4 w-4" />
                            <div className="flex flex-col">
                              <span className="font-medium text-foreground">
                                {cita.paciente?.fullName || 'Sin paciente'}
                              </span>
                              {cita.paciente?.phone && (
                                <div className="text-xs">
                                  <PhoneDisplay phone={cita.paciente.phone} className="text-xs" />
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Stethoscope className="h-4 w-4" />
                            <span>{cita.doctor?.name || 'Sin doctor asignado'}</span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            <span>{cita.consultorio?.name || 'Sin consultorio'}</span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${
                            cita.estado === 'completada' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                            cita.estado === 'confirmada' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                            cita.estado === 'cancelada' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}>
                            {estadoLabels[cita.estado]}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm">
                          <div className="flex justify-end gap-2">
                            {(cita.estado === 'completada' && (cita.pagos?.length ?? 0) === 0) && (
                              <Button size="sm" asChild>
                                <Link href={`/pagos/nuevo?citaId=${cita.id}`}>
                                  <DollarSign className="mr-2 h-4 w-4" />
                                  Pagar
                                </Link>
                              </Button>
                            )}
                            {user.role === 'admin' && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(cita)}
                                disabled={deleteMutation.isPending}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                              </Button>
                            )}
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/citas/${cita.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                Ver
                              </Link>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ResponsiveTable>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
          <div>
            Mostrando {citas.length} de {total} citas
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
            >
              Anterior
            </Button>
            <span>
              Página {page} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
