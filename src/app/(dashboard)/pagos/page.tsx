'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';
import { pagoService, Pago, EstatusPago, PagosFilters } from '@/services/pago.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DollarSign, Eye, Pencil, Plus, Trash2, CreditCard, Calendar, UserRound } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ResponsiveTable } from '@/components/ResponsiveTable';

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
    if (confirm(`¿Eliminar el pago de $${pago.monto}?`)) {
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
        <Navbar />

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
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-1">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Gestión de Pagos</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Visualiza y administra los pagos del consultorio
            </p>
          </div>
          {(user.role === 'admin' || user.role === 'doctor' || user.role === 'recepcionista') && (
            <Button onClick={() => router.push('/pagos/nuevo')}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Pago
            </Button>
          )}
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <form onSubmit={handleFiltersSubmit} className="flex flex-col gap-4">
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                <select
                  value={estatusFilter}
                  onChange={(event) => setEstatusFilter(event.target.value as EstatusPago | 'todos')}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="todos">Todos los estados</option>
                  <option value="pagado">Pagado</option>
                  <option value="pendiente">Pendiente</option>
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClearFilters}
                  disabled={estatusFilter === 'todos' && dateFrom === today && !dateTo}
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
                  <Card key={pago.id} className="border-l-4 border-l-green-500">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-lg font-bold text-green-600">
                            <DollarSign className="h-5 w-5" />
                            <span>${pago.monto.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(pago.fechaPago).toLocaleDateString('es-MX', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>
                        <Badge variant={estatusVariants[pago.estatus]}>{estatusLabels[pago.estatus]}</Badge>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <UserRound className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{pago.cita?.paciente?.fullName || 'Sin paciente'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <CreditCard className="h-4 w-4" />
                          <span>{metodoLabels[pago.metodo]}</span>
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
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                            {new Date(pago.fechaPago).toLocaleDateString('es-MX', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm">
                            <span className="font-medium text-foreground">
                              {pago.cita?.paciente?.fullName || 'Sin paciente'}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-foreground">
                            ${pago.monto.toFixed(2)}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <CreditCard className="h-4 w-4" />
                              <span>{metodoLabels[pago.metodo]}</span>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <Badge variant={estatusVariants[pago.estatus]}>{estatusLabels[pago.estatus]}</Badge>
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
                              {(user.role === 'admin' || user.role === 'doctor') && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDelete(pago)}
                                    disabled={deleteMutation.isPending}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                                    Eliminar
                                  </Button>
                                )}
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
