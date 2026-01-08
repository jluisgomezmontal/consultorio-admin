'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';
import { consultorioService, CreateConsultorioRequest } from '@/services/consultorio.service';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const consultorioSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  address: z.string().optional(),
  phone: z.string().optional(),
  description: z.string().optional(),
  openHour: z.string().optional(),
  closeHour: z.string().optional(),
});

type ConsultorioFormData = z.infer<typeof consultorioSchema>;

export default function NuevoConsultorioPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'admin') {
        router.push('/consultorios');
      }
    }
  }, [user, authLoading, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ConsultorioFormData>({
    resolver: zodResolver(consultorioSchema),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateConsultorioRequest) => consultorioService.createConsultorio(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultorios'] });
      router.push('/consultorios');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Error al crear consultorio');
    },
  });

  const onSubmit = (data: ConsultorioFormData) => {
    setError('');
    const payload: CreateConsultorioRequest = {
      name: data.name,
      address: data.address || undefined,
      phone: data.phone || undefined,
      description: data.description || undefined,
      openHour: data.openHour || undefined,
      closeHour: data.closeHour || undefined,
    };
    createMutation.mutate(payload);
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/consultorios')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Consultorios
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Nuevo Consultorio</CardTitle>
            <CardDescription>
              Registra un nuevo consultorio en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  {...register('name')}
                  id="name"
                  placeholder="Consultorio Central"
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <textarea
                  {...register('description')}
                  id="description"
                  rows={3}
                  placeholder="Descripción breve del consultorio"
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Dirección</Label>
                  <Input
                    {...register('address')}
                    id="address"
                    placeholder="Calle Principal 123, Colonia Centro"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    {...register('phone')}
                    id="phone"
                    placeholder="+52 555 1234567"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="openHour">Hora de Apertura</Label>
                  <Input
                    {...register('openHour')}
                    id="openHour"
                    type="time"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="closeHour">Hora de Cierre</Label>
                  <Input
                    {...register('closeHour')}
                    id="closeHour"
                    type="time"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {createMutation.isPending ? 'Guardando...' : 'Guardar Consultorio'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/consultorios')}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
