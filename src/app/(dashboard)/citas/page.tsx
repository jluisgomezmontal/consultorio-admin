'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';
import { citaService, Cita, CitaEstado } from '@/services/cita.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, Clock, Eye, Pencil, Plus, Search, Stethoscope, Trash2, UserRound, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/LoadingSpinner';

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

const normalizeText = (value: string | null | undefined) =>
  value
    ? value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
    : '';

export default function CitasPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<CitaEstado | 'todos'>('todos');
  const limit = 10;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  const { data: citasData, isLoading } = useQuery({
    queryKey: ['citas'],
    queryFn: () => citaService.getAllCitas({ page: 1, limit: 1000 }),
    enabled: !!user,
  });

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

    if (confirm(`¿Cancelar la cita del ${new Date(cita.date).toLocaleDateString()} a las ${cita.time}?`)) {
      try {
        await cancelMutation.mutateAsync(cita.id);
      } catch (error) {
        console.error('Error cancelando la cita:', error);
      }
    }
  };

  const handleDelete = async (cita: Cita) => {
    if (confirm(`¿Eliminar la cita del ${new Date(cita.date).toLocaleDateString()} a las ${cita.time}?`)) {
      try {
        await deleteMutation.mutateAsync(cita.id);
      } catch (error) {
        console.error('Error eliminando la cita:', error);
      }
    }
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setPage(1);
  };

  const allCitas = citasData?.data || [];
  const filteredCitas = useMemo(() => {
    const term = normalizeText(search.trim());

    return allCitas.filter((cita) => {
      const matchesEstado = estadoFilter === 'todos' || cita.estado === estadoFilter;
      if (!matchesEstado) return false;

      if (!term) return true;

      const pacienteName = normalizeText(cita.paciente?.fullName);
      const doctorName = normalizeText(cita.doctor?.name);
      const consultorioName = normalizeText(cita.consultorio?.name);
      const motivo = normalizeText(cita.motivo);

      return [pacienteName, doctorName, consultorioName, motivo].some((value) =>
        value.includes(term)
      );
    });
  }, [allCitas, estadoFilter, search]);

  const total = filteredCitas.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const citas = filteredCitas.slice((page - 1) * limit, page * limit);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold">Gestión de Citas</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Visualiza y administra las citas del consultorio
              </p>
            </div>
            {(user?.role === 'admin' || user?.role === 'doctor') && (
              <Button onClick={() => router.push('/citas/nueva')}>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Cita
              </Button>
            )}
          </div>

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
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Gestión de Citas</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Visualiza y administra las citas del consultorio
            </p>
          </div>
          {(user.role === 'admin' || user.role === 'doctor') && (
            <Button onClick={() => router.push('/citas/nueva')}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Cita
            </Button>
          )}
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar por paciente, doctor, consultorio o motivo..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={estadoFilter}
                onChange={(event) => {
                  setEstadoFilter(event.target.value as CitaEstado | 'todos');
                  setPage(1);
                }}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="todos">Todos los estados</option>
                <option value="pendiente">Pendiente</option>
                <option value="confirmada">Confirmada</option>
                <option value="completada">Completada</option>
                <option value="cancelada">Cancelada</option>
              </select>
              <Button type="submit">Buscar</Button>
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
            <div className="overflow-x-auto">
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
                  {citas.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-sm text-muted-foreground">
                        No se encontraron citas con los filtros seleccionados
                      </td>
                    </tr>
                  ) : (
                    citas.map((cita) => (
                      <tr key={cita.id} className="hover:bg-muted/50">
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <div className="flex flex-col">
                              <span className="font-medium text-foreground">
                                {new Date(cita.date).toLocaleDateString('es-MX', {
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
                                <span className="text-xs">{cita.paciente.phone}</span>
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
                          <Badge variant={estadoVariants[cita.estado]}>{estadoLabels[cita.estado]}</Badge>
                        </td>
                        <td className="px-6 py-4 text-right text-sm">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/citas/${cita.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                Ver
                              </Link>
                            </Button>
                            {(user.role === 'admin' || user.role === 'doctor') && (
                              <>
                                <Button variant="outline" size="sm" asChild>
                                  <Link href={`/citas/${cita.id}/editar`}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Editar
                                  </Link>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCancel(cita)}
                                  disabled={cancelMutation.isPending || cita.estado === 'cancelada'}
                                >
                                  Cancelar
                                </Button>
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
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
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
