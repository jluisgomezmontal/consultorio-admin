'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Users as UsersIcon, UserPlus, Trash2, Edit, ArrowLeft, Mail, Shield, Building2 } from 'lucide-react';
import { userService, User } from '@/services/user.service';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClinicsDisplay } from '@/components/ClinicsDisplay';
import { ResponsiveTable } from '@/components/ResponsiveTable';
import { Badge } from '@/components/ui/badge';

export default function UsersPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (!authLoading && user && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const { data: usersData, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAllUsers(),
    enabled: !!user && user.role === 'admin',
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const handleDelete = async (id: string, userName: string) => {
    if (confirm(`¿Estás seguro de eliminar al usuario ${userName}?`)) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-4 text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  const users = usersData?.data || [];

  return (
    <div className="bg-background flex-1 flex flex-col">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-1">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Gestión de Usuarios</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Administra los usuarios del sistema
            </p>
          </div>
          <Button onClick={() => router.push('/register')}>
            <UserPlus className="mr-2 h-4 w-4" />
            Nuevo Usuario
          </Button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
            Error al cargar usuarios
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UsersIcon className="h-5 w-5" />
              Lista de Usuarios
            </CardTitle>
            <CardDescription>
              {users.length} usuario{users.length !== 1 ? 's' : ''} registrado{users.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay usuarios registrados
              </div>
            ) : (
              <ResponsiveTable
                mobileCards={users.map((u) => (
                  <Card key={u.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-base font-semibold">
                            <UsersIcon className="h-5 w-5 text-blue-600" />
                            <span>{u.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="capitalize">
                              <Shield className="mr-1 h-3 w-3" />
                              {u.role}
                            </Badge>
                            <Badge variant={u.isActive ? 'default' : 'destructive'}>
                              {u.isActive ? 'Activo' : 'Inactivo'}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span className="truncate">{u.email}</span>
                        </div>
                        {u.consultorios && u.consultorios.length > 0 && (
                          <div className="flex items-start gap-2 text-muted-foreground">
                            <Building2 className="h-4 w-4 mt-0.5" />
                            <div className="flex-1">
                              <ClinicsDisplay consultorios={u.consultorios} />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 pt-2 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => router.push(`/users/${u.id}`)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleDelete(u.id, u.name)}
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
                        <th className="text-left py-3 px-4 font-medium">Email</th>
                        <th className="text-left py-3 px-4 font-medium">Rol</th>
                        <th className="text-left py-3 px-4 font-medium">Estado</th>
                        <th className="text-left py-3 px-4 font-medium">Consultorios</th>
                        <th className="text-right py-3 px-4 font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">{u.name}</td>
                          <td className="py-3 px-4 text-muted-foreground">{u.email}</td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-primary/10 text-primary capitalize">
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={u.isActive ? 'default' : 'destructive'}>
                              {u.isActive ? 'Activo' : 'Inactivo'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <ClinicsDisplay consultorios={u.consultorios || []} />
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/users/${u.id}`)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(u.id, u.name)}
                                disabled={deleteMutation.isPending}
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
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
