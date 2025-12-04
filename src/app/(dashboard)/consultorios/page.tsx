'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';
import { consultorioService, Consultorio } from '@/services/consultorio.service';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, Edit, Eye, Plus, Search, Trash2, Clock, Phone, MapPin, Users, Calendar } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ResponsiveTable } from '@/components/ResponsiveTable';

const normalizeText = (text: string | null | undefined) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

export default function ConsultoriosPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const limit = 10;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const { data: consultoriosData, isLoading } = useQuery({
    queryKey: ['consultorios'],
    queryFn: () => consultorioService.getAllConsultorios(1, 1000),
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => consultorioService.deleteConsultorio(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultorios'] });
    },
  });

  const handleDelete = async (id: string, name: string) => {
    if (!user || user.role !== 'admin') return;

    if (confirm(`¿Estás seguro de eliminar el consultorio "${name}"?`)) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting consultorio:', error);
      }
    }
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setPage(1);
  };

  if (authLoading || isLoading) {
    return <div className="min-h-screen bg-background">
        <Navbar />

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Gestionar Consultorios</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Administra los consultorios del sistema y sus detalles principales
            </p>
          </div>
          {user?.role === 'admin' && (
            <Button onClick={() => router.push('/consultorios/nuevo')}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Consultorio
            </Button>
          )}
        </div>

          <Card className="flex items-center justify-center py-24">
            <LoadingSpinner
              delay={0}
              fullScreen={false}
              message="Cargando consultorios..."
            />
          </Card>
        </main>
      </div>;
  }

  if (!user) {
    return null;
  }

  const allConsultorios = consultoriosData?.data || [];
  const filteredConsultorios = search
    ? allConsultorios.filter((consultorio) => {
        const term = normalizeText(search.trim());
        return (
          normalizeText(consultorio.name).includes(term) ||
          normalizeText(consultorio.address).includes(term) ||
          normalizeText(consultorio.phone).includes(term)
        );
      })
    : allConsultorios;

  const total = filteredConsultorios.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const startIndex = (page - 1) * limit;
  const consultorios = filteredConsultorios.slice(startIndex, startIndex + limit);

  return (
    <div className="bg-background flex-1 flex flex-col">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-1">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Gestionar Consultorios</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Administra los consultorios del sistema y sus detalles principales
            </p>
          </div>
          {user.role === 'admin' && (
            <Button onClick={() => router.push('/consultorios/nuevo')}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Consultorio
            </Button>
          )}
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar por nombre, dirección o teléfono..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">Buscar</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Lista de Consultorios
            </CardTitle>
            <CardDescription>
              Gestión completa de consultorios registrados
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {consultorios.length === 0 ? (
              <div className="px-6 py-8 text-center text-sm text-muted-foreground">
                No se encontraron consultorios
              </div>
            ) : (
              <ResponsiveTable
                mobileCards={consultorios.map((consultorio) => (
                  <Card key={consultorio.id} className="border-l-4 border-l-orange-500">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2 text-base font-semibold">
                            <Building2 className="h-5 w-5 text-orange-600" />
                            <span>{consultorio.name}</span>
                          </div>
                          {consultorio.description && (
                            <p className="text-sm text-muted-foreground">{consultorio.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        {consultorio.address && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{consultorio.address}</span>
                          </div>
                        )}
                        {consultorio.phone && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            <span>{consultorio.phone}</span>
                          </div>
                        )}
                        {consultorio.openHour && consultorio.closeHour && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{consultorio.openHour} - {consultorio.closeHour}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-muted-foreground pt-2">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{consultorio._count?.users ?? 0} usuarios</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{consultorio._count?.citas ?? 0} citas</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2 border-t">
                        <Button variant="outline" size="sm" className="flex-1" asChild>
                          <Link href={`/consultorios/${consultorio.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver
                          </Link>
                        </Button>
                        {user.role === 'admin' && (
                          <>
                            <Button variant="outline" size="sm" className="flex-1" asChild>
                              <Link href={`/consultorios/${consultorio.id}/editar`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </Link>
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleDelete(consultorio.id, consultorio.name)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </Button>
                          </>
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
                          Nombre
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Ubicación
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Contacto
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Horario
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Estadísticas
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-card">
                      {consultorios.map((consultorio) => (
                        <tr key={consultorio.id} className="hover:bg-muted/50">
                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="font-medium text-sm">{consultorio.name}</div>
                            {consultorio.description && (
                              <div className="text-xs text-muted-foreground line-clamp-1">
                                {consultorio.description}
                              </div>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              {consultorio.address || 'Sin dirección registrada'}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              {consultorio.phone || 'Sin teléfono'}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              {consultorio.openHour && consultorio.closeHour
                                ? `${consultorio.openHour} - ${consultorio.closeHour}`
                                : 'Horario no definido'}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                            <div className="flex flex-col">
                              <span>
                                Usuarios: {consultorio._count?.users ?? 0}
                              </span>
                              <span>
                                Citas: {consultorio._count?.citas ?? 0}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right text-sm">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/consultorios/${consultorio.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Ver
                                </Link>
                              </Button>
                              {user.role === 'admin' && (
                                <>
                                  <Button variant="outline" size="sm" asChild>
                                    <Link href={`/consultorios/${consultorio.id}/editar`}>
                                      <Edit className="mr-2 h-4 w-4" />
                                      Editar
                                    </Link>
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDelete(consultorio.id, consultorio.name)}
                                    disabled={deleteMutation.isPending}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Eliminar
                                  </Button>
                                </>
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
          </CardContent>
        </Card>

        <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
          <div>
            Mostrando {consultorios.length} de {total} consultorios
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
