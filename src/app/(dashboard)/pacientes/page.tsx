'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';
import { Search, Eye, Edit, Trash2, UserPlus, Users, X, CalendarPlus, Phone, Mail, User } from 'lucide-react';
import { pacienteService, Paciente } from '@/services/paciente.service';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ResponsiveTable } from '@/components/ResponsiveTable';

export default function PacientesPage() {
  const { user, loading: authLoading, logout } = useAuth();
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

  // Fetch all pacientes without server-side search
  const { data: pacientesData, isLoading } = useQuery({
    queryKey: ['pacientes'],
    queryFn: () => pacienteService.getAllPacientes(1, 1000, ''), // Get all pacientes
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => pacienteService.deletePaciente(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pacientes'] });
    },
  });

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`¿Estás seguro de eliminar al paciente ${name}?`)) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting paciente:', error);
      }
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page on search
  };

  const normalizeText = (text: string | null | undefined): string => {
    if (!text) return '';
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  };

  if (authLoading || isLoading) {
    return <div className="min-h-screen bg-background">
        <Navbar />

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Gestión de Pacientes</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Administra los pacientes del consultorio
            </p>
          </div>
          <Button onClick={() => router.push('/pacientes/nuevo')}>
            <UserPlus className="mr-2 h-4 w-4" />
            Nuevo Paciente
          </Button>
        </div>

          <Card className="flex items-center justify-center py-24">
            <LoadingSpinner
              delay={0}
              fullScreen={false}
              message="Cargando consultorios..."
            />
          </Card>
        </main>
      </div>;;
  }

  if (!user) {
    return null;
  }

  const allPacientes = pacientesData?.data || [];
  const filteredPacientes = search
    ? allPacientes.filter((paciente) => {
        const searchNormalized = normalizeText(search.trim());
        const fullNameNormalized = normalizeText(paciente.fullName);
        const phoneNormalized = normalizeText(paciente.phone);
        const emailNormalized = normalizeText(paciente.email);

        return (
          fullNameNormalized.includes(searchNormalized) ||
          phoneNormalized.includes(searchNormalized) ||
          emailNormalized.includes(searchNormalized)
        );
      })
    : allPacientes;

  const total = filteredPacientes.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const pacientes = filteredPacientes.slice(startIndex, endIndex);

  return (
    <div className="bg-background flex-1 flex flex-col">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-1">
        {/* Header con gradiente */}
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-rose-950/20 p-4 sm:p-6 shadow-lg border border-purple-100 dark:border-purple-900">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Gestión de Pacientes</h1>
              </div>
              <p className="text-sm text-muted-foreground">
                Administra los pacientes del consultorio
              </p>
            </div>
            <Button onClick={() => router.push('/pacientes/nuevo')} size="lg" className="bg-purple-600 hover:bg-purple-700 shadow-md w-full sm:w-auto">
              <UserPlus className="mr-2 h-5 w-5" />
              Nuevo Paciente
            </Button>
          </div>
        </div>

        <Card className="mb-6 shadow-md">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20">
            <CardTitle className="text-lg">Búsqueda de Pacientes</CardTitle>
            <CardDescription>Busca pacientes por nombre, teléfono o email</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar por nombre, teléfono o email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-10"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch('');
                      setPage(1);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Button type="submit">Buscar</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              Lista de Pacientes
            </CardTitle>
            <CardDescription>
              {total} paciente{total !== 1 ? 's' : ''} registrado{total !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pacientes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay pacientes registrados
              </div>
            ) : (
              <ResponsiveTable
                mobileCards={pacientes.map((paciente) => (
                  <Card key={paciente.id} className="border-l-4 border-l-purple-500">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-base font-semibold">
                            <User className="h-5 w-5 text-purple-600" />
                            <span>{paciente.fullName}</span>
                          </div>
                          {paciente.age && (
                            <p className="text-sm text-muted-foreground">{paciente.age} años</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        {paciente.phone && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            <span>{paciente.phone}</span>
                          </div>
                        )}
                        {paciente.email && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            <span className="truncate">{paciente.email}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => router.push(`/citas/nueva?pacienteId=${paciente.id}`)}
                        >
                          <CalendarPlus className="mr-2 h-4 w-4" />
                          Cita
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => router.push(`/pacientes/${paciente.id}`)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Ver
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => router.push(`/pacientes/${paciente.id}/editar`)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleDelete(paciente.id, paciente.fullName)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              >
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Nombre</th>
                        <th className="text-left py-3 px-4 font-medium">Edad</th>
                        <th className="text-left py-3 px-4 font-medium">Teléfono</th>
                        <th className="text-left py-3 px-4 font-medium">Email</th>
                        <th className="text-right py-3 px-4 font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pacientes.map((paciente) => (
                        <tr key={paciente.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4 font-medium">{paciente.fullName}</td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {paciente.age || '-'}
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {paciente.phone || '-'}
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {paciente.email || '-'}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/citas/nueva?pacienteId=${paciente.id}`)}
                                title="Crear cita"
                              >
                                <CalendarPlus className="h-4 w-4 text-primary" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/pacientes/${paciente.id}`)}
                                title="Ver detalles"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/pacientes/${paciente.id}/editar`)}
                                title="Editar paciente"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(paciente.id, paciente.fullName)}
                                disabled={deleteMutation.isPending}
                                title="Eliminar paciente"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
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
              <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Página {page} de {totalPages}
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
