'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { pagoService, Pago, EstatusPago, PagosFilters } from '@/services/pago.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DollarSign, Eye, Pencil, Plus, Trash2, CreditCard, Calendar, UserRound, TrendingUp, TrendingDown, Wallet, Receipt, Search, Filter, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ResponsiveTable } from '@/components/ResponsiveTable';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { formatLocalDate } from '@/lib/dateUtils';

const estatusLabels: Record<EstatusPago, string> = {
  pagado: 'Pagado',
  pendiente: 'Pendiente',
};

const estatusVariants: Record<EstatusPago, 'default' | 'secondary'> = {
  pagado: 'default',
  pendiente: 'secondary',
};

const metodoLabels: Record<string, string> = {
  efectivo: 'Efectivo',
  tarjeta: 'Tarjeta',
  transferencia: 'Transferencia',
};

type AppliedFilters = Omit<PagosFilters, 'page' | 'limit'>;

export default function PagosPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <LoadingSpinner delay={0} fullScreen={false} message="Cargando pagos..." />
        </div>
      }
    >
      <PagosContent />
    </Suspense>
  );
}

function PagosContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { confirm } = useConfirmDialog();
  const limit = 10;
  const today = new Date().toISOString().split('T')[0];
  const estatusParam = searchParams.get('estatus');
  const validEstatus: EstatusPago[] = ['pagado', 'pendiente'];
  const initialEstatus =
    estatusParam && validEstatus.includes(estatusParam as EstatusPago)
      ? (estatusParam as EstatusPago)
      : 'todos';
  const initialDateFrom = searchParams.get('dateFrom') ?? today;
  const initialDateTo = searchParams.get('dateTo') ?? today;
  const initialPageValue = Number(searchParams.get('page') ?? '1');
  const initialPage = Number.isNaN(initialPageValue) || initialPageValue < 1 ? 1 : initialPageValue;

  const [page, setPage] = useState(initialPage);
  const [estatusFilter, setEstatusFilter] = useState<EstatusPago | 'todos'>(initialEstatus);
  const [dateFrom, setDateFrom] = useState(initialDateFrom);
  const [dateTo, setDateTo] = useState(initialDateTo);
  const [showFilters, setShowFilters] = useState(false);

  const [appliedFilters, setAppliedFilters] = useState<AppliedFilters>(() => {
    const filters: AppliedFilters = {};
    if (initialEstatus !== 'todos') filters.estatus = initialEstatus as EstatusPago;
    if (initialDateFrom) filters.dateFrom = initialDateFrom;
    if (initialDateTo) filters.dateTo = initialDateTo;
    return filters;
  });

  const requestFilters = useMemo<PagosFilters>(() => {
    const filters: PagosFilters = { page, limit };
    if (appliedFilters.estatus) filters.estatus = appliedFilters.estatus;
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
    if (requestFilters.estatus) params.set('estatus', requestFilters.estatus);
    if (requestFilters.dateFrom) params.set('dateFrom', requestFilters.dateFrom);
    if (requestFilters.dateTo) params.set('dateTo', requestFilters.dateTo);

    const queryString = params.toString();
    router.replace(queryString ? `/pagos?${queryString}` : '/pagos', { scroll: false });
  }, [requestFilters, router, user]);

  const { data: pagosData, isLoading } = useQuery({
    queryKey: ['pagos', requestFilters],
    queryFn: () => pagoService.getAllPagos(requestFilters),
    enabled: !!user,
  });

  const pagosResult = pagosData;
  const pagoLimit = pagosResult?.limit ?? limit;
  const total = pagosResult?.total ?? 0;
  const pagos = pagosResult?.data ?? [];
  const totalPages = Math.max(1, Math.ceil(total / Math.max(pagoLimit, 1)));

  // Calcular estadísticas
  const totalPagado = pagos.filter(p => p.estatus === 'pagado').reduce((sum, p) => sum + p.monto, 0);
  const totalPendiente = pagos.filter(p => p.estatus === 'pendiente').reduce((sum, p) => sum + p.monto, 0);
  const cantidadPagados = pagos.filter(p => p.estatus === 'pagado').length;
  const cantidadPendientes = pagos.filter(p => p.estatus === 'pendiente').length;

  useEffect(() => {
    if (!pagosResult) return;
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [pagosResult, page, totalPages]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => pagoService.deletePago(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pagos'] });
    },
  });

  const handleDelete = async (pago: Pago) => {
    const confirmed = await confirm({
      title: '¿Eliminar pago?',
      text: `¿Estás seguro de eliminar el pago de $${pago.monto}? Esta acción no se puede deshacer.`,
      confirmButtonText: 'Sí, eliminar',
    });

    if (confirmed) {
      try {
        await deleteMutation.mutateAsync(pago.id);
      } catch (error) {
        console.error('Error eliminando el pago:', error);
      }
    }
  };

  const handleFiltersSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextFilters: AppliedFilters = {};
    if (estatusFilter !== 'todos') nextFilters.estatus = estatusFilter;
    if (dateFrom) nextFilters.dateFrom = dateFrom;
    if (dateTo) nextFilters.dateTo = dateTo;

    setAppliedFilters(nextFilters);
    setPage(1);
  };

  const handleClearFilters = () => {
    setEstatusFilter('todos');
    setDateFrom(today);
    setDateTo('');
    setAppliedFilters({ dateFrom: today });
    setPage(1);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold">Gestión de Pagos</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Visualiza y administra los pagos del consultorio
              </p>
            </div>
            {(user?.role === 'admin' || user?.role === 'doctor' || user?.role === 'recepcionista') && (
              <Button onClick={() => router.push('/pagos/nuevo')}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Pago
              </Button>
            )}
          </div>

          <Card className="flex items-center justify-center py-24">
            <LoadingSpinner
              delay={0}
              fullScreen={false}
              message="Cargando pagos..."
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
        {/* Header con estadísticas */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <Wallet className="h-8 w-8 text-primary" />
                Gestión de Pagos
              </h2>
              <p className="mt-2 text-muted-foreground">
                Visualiza y administra los pagos del consultorio
              </p>
            </div>
            {(user.role === 'admin' || user.role === 'doctor' || user.role === 'recepcionista') && (
              <Button onClick={() => router.push('/pagos/nuevo')} size="lg" className="shadow-lg">
                <Plus className="mr-2 h-5 w-5" />
                Nuevo Pago
              </Button>
            )}
          </div>

          {/* Tarjetas de estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Pagado</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      ${totalPagado.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {cantidadPagados} pago{cantidadPagados !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Pendiente</p>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      ${totalPendiente.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {cantidadPendientes} pago{cantidadPendientes !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <TrendingDown className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total General</p>
                    <p className="text-2xl font-bold">
                      ${(totalPagado + totalPendiente).toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {pagos.length} pago{pagos.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tasa de Cobro</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {pagos.length > 0 ? Math.round((cantidadPagados / pagos.length) * 100) : 0}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      de {pagos.length} total
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Receipt className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filtros mejorados */}
        <Card className="mb-6">
          <CardHeader className="cursor-pointer" onClick={() => setShowFilters(!showFilters)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Filtros</CardTitle>
                {(estatusFilter !== 'todos' || dateFrom || dateTo) && (
                  <Badge variant="secondary" className="ml-2">
                    {[estatusFilter !== 'todos' && 'Estado', dateFrom && 'Fecha desde', dateTo && 'Fecha hasta'].filter(Boolean).length} activo{[estatusFilter !== 'todos' && 'Estado', dateFrom && 'Fecha desde', dateTo && 'Fecha hasta'].filter(Boolean).length !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
              <Button variant="ghost" size="sm">
                {showFilters ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          {showFilters && (
            <CardContent className="pt-0">
              <form onSubmit={handleFiltersSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Estado</label>
                    <select
                      value={estatusFilter}
                      onChange={(event) => setEstatusFilter(event.target.value as EstatusPago | 'todos')}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="todos">Todos los estados</option>
                      <option value="pagado">✓ Pagado</option>
                      <option value="pendiente">⏳ Pendiente</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Fecha desde</label>
                    <Input
                      type="date"
                      value={dateFrom}
                      onChange={(event) => setDateFrom(event.target.value)}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Fecha hasta</label>
                    <Input
                      type="date"
                      value={dateTo}
                      onChange={(event) => setDateTo(event.target.value)}
                      className="h-10"
                      min={dateFrom || undefined}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button type="submit" className="gap-2">
                    <Search className="h-4 w-4" />
                    Aplicar filtros
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClearFilters}
                    disabled={estatusFilter === 'todos' && dateFrom === today && !dateTo}
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    Limpiar
                  </Button>
                </div>
              </form>
            </CardContent>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Lista de Pagos
            </CardTitle>
            <CardDescription>
              Revisa, edita o elimina los pagos registrados
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {pagos.length === 0 ? (
              <div className="px-6 py-8 text-center text-sm text-muted-foreground">
                No se encontraron pagos con los filtros seleccionados
              </div>
            ) : (
              <ResponsiveTable
                mobileCards={pagos.map((pago) => (
                  <Card key={pago.id} className={`overflow-hidden hover:shadow-lg transition-all duration-300 border-l-4 ${
                    pago.estatus === 'pagado' ? 'border-l-green-500' : 'border-l-orange-500'
                  }`}>
                    <CardContent className="p-5 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-lg ${
                              pago.estatus === 'pagado' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-orange-100 dark:bg-orange-900/30'
                            }`}>
                              <DollarSign className={`h-5 w-5 ${
                                pago.estatus === 'pagado' ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'
                              }`} />
                            </div>
                            <div>
                              <p className={`text-xl font-bold ${
                                pago.estatus === 'pagado' ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'
                              }`}>
                                ${pago.monto.toFixed(2)} MXN
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  {formatLocalDate(pago.fechaPago, {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <Badge className={`shrink-0 ${
                          pago.estatus === 'pagado' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                            : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                        }`}>
                          {estatusLabels[pago.estatus]}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                          <UserRound className="h-4 w-4 text-primary shrink-0" />
                          <span className="font-medium text-sm">{pago.cita?.paciente?.fullName || 'Sin paciente'}</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                          <CreditCard className="h-4 w-4 text-primary shrink-0" />
                          <span className="text-sm text-muted-foreground">{metodoLabels[pago.metodo]}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2 border-t">
                        <Button variant="outline" size="sm" className="flex-1" asChild>
                          <Link href={`/pagos/${pago.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver
                          </Link>
                        </Button>
                        {(user.role === 'admin' || user.role === 'doctor' || user.role === 'recepcionista') && (
                          <Button variant="outline" size="sm" className="flex-1" asChild>
                            <Link href={`/pagos/${pago.id}/editar`}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                            </Link>
                          </Button>
                        )}
                        {(user.role === 'admin' || user.role === 'doctor') && (
                          <Button
                            variant="destructive"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleDelete(pago)}
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
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Fecha
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Paciente
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Monto
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Método
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
                      {pagos.map((pago) => (
                        <tr key={pago.id} className="hover:bg-muted/50">
                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">
                                {formatLocalDate(pago.fechaPago, {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm">
                            <span className="font-medium text-foreground">
                              {pago.cita?.paciente?.fullName || 'Sin paciente'}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="flex items-center gap-2">
                              <DollarSign className={`h-4 w-4 ${
                                pago.estatus === 'pagado' ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'
                              }`} />
                              <span className={`text-sm font-bold ${
                                pago.estatus === 'pagado' ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'
                              }`}>
                                ${pago.monto.toFixed(2)}
                              </span>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <CreditCard className="h-4 w-4" />
                              <span>{metodoLabels[pago.metodo]}</span>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <Badge className={`${
                              pago.estatus === 'pagado' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                                : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                            }`}>
                              {estatusLabels[pago.estatus]}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-right text-sm">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/pagos/${pago.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Ver
                                </Link>
                              </Button>
                              {(user.role === 'admin' || user.role === 'doctor' || user.role === 'recepcionista') && (
                                  <Button variant="outline" size="sm" asChild>
                                    <Link href={`/pagos/${pago.id}/editar`}>
                                      <Pencil className="mr-2 h-4 w-4" />
                                      Editar
                                    </Link>
                                  </Button>
                                )}
                              {/* {(user.role === 'admin' || user.role === 'doctor') && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDelete(pago)}
                                    disabled={deleteMutation.isPending}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                                    Eliminar
                                  </Button>
                                )} */}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ResponsiveTable>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t px-6 py-4">
                <p className="text-sm text-muted-foreground">
                  Página {page} de {totalPages} • {total} pago{total !== 1 ? 's' : ''} en total
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
