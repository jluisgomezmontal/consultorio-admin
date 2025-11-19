'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { consultorioService } from '@/services/consultorio.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';
import { ArrowLeft, Save } from 'lucide-react';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const userSchema = z.object({
  name: z.string().min(2, 'El nombre es obligatorio'),
  email: z.string().email('Correo inválido'),
  role: z.enum(['admin', 'doctor', 'recepcionista']),
  consultoriosIds: z
    .array(z.string().regex(objectIdRegex, 'Consultorio inválido'))
    .min(1, 'Selecciona al menos un consultorio'),
});

type UserFormData = z.infer<typeof userSchema>;

export default function EditUserPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const userId = params?.id || '';

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'recepcionista',
      consultoriosIds: [],
    },
  });

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'admin') {
        router.push('/dashboard');
      }
    }
  }, [authLoading, user, router]);

  const { data: userData, isLoading: isLoadingUser } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => userService.getUserById(userId),
    enabled: !!user && !!userId && user.role === 'admin',
  });

  const { data: consultoriosData, isLoading: isLoadingConsultorios } = useQuery({
    queryKey: ['consultorios', 'options'],
    queryFn: () => consultorioService.getAllConsultorios(1, 100),
    enabled: !!user && user.role === 'admin',
  });

  useEffect(() => {
    if (userData?.data) {
      const apiUser = userData.data;
      // Ensure consultoriosIds is always an array of strings
      const consultoriosIds = Array.isArray(apiUser.consultoriosIds)
        ? apiUser.consultoriosIds.map((id: unknown) => {
            if (typeof id === 'string') return id;
            if (id && typeof id === 'object' && '_id' in id) return String((id as { _id: unknown })._id);
            return String(id);
          })
        : [];
      
      reset({
        name: apiUser.name,
        email: apiUser.email,
        role: apiUser.role as UserFormData['role'],
        consultoriosIds: consultoriosIds.filter(Boolean),
      });
    }
  }, [userData, reset]);

  const updateMutation = useMutation({
    mutationFn: (payload: UserFormData) => userService.updateUser(userId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      router.push('/users');
    },
  });

  const onSubmit = (data: UserFormData) => {
    // Ensure consultoriosIds is always a clean array of strings
    const payload: UserFormData = {
      ...data,
      consultoriosIds: Array.isArray(data.consultoriosIds) 
        ? data.consultoriosIds.filter(Boolean)
        : [],
    };

    console.log('Submitting user update payload:', payload);
    updateMutation.mutate(payload);
  };

  if (authLoading || isLoadingUser || isLoadingConsultorios) {
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

  const consultorios = consultoriosData?.data ?? [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Button variant="ghost" onClick={() => router.push('/users')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Usuarios
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Editar Usuario</CardTitle>
            <CardDescription>Actualiza la información del usuario y sus consultorios asignados</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" placeholder="Nombre completo" {...register('name')} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo</Label>
                <Input id="email" type="email" placeholder="correo@ejemplo.com" {...register('email')} />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Rol</Label>
                <select id="role" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" {...register('role')}>
                  <option value="admin">Administrador</option>
                  <option value="doctor">Doctor</option>
                  <option value="recepcionista">Recepcionista</option>
                </select>
                {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Consultorios asignados</Label>
                <Controller
                  control={control}
                  name="consultoriosIds"
                  render={({ field }) => {
                    const currentValues = Array.isArray(field.value) ? field.value : [];

                    const toggleValue = (consultorioId: string, checked: boolean) => {
                      if (checked) {
                        field.onChange(Array.from(new Set([...currentValues, consultorioId])));
                      } else {
                        field.onChange(currentValues.filter((value) => value !== consultorioId));
                      }
                    };

                    return (
                      <div className="space-y-2 rounded-md border border-input p-3">
                        {consultorios.length === 0 && (
                          <p className="text-sm text-muted-foreground">No hay consultorios disponibles</p>
                        )}
                        {consultorios.map((consultorio) => {
                          const checkboxId = `consultorio-${consultorio.id}`;
                          const checked = currentValues.includes(consultorio.id);
                          return (
                            <label key={consultorio.id} htmlFor={checkboxId} className="flex items-center gap-2 text-sm">
                              <input
                                id={checkboxId}
                                type="checkbox"
                                className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                                checked={checked}
                                onChange={(event) => toggleValue(consultorio.id, event.target.checked)}
                                onBlur={field.onBlur}
                              />
                              <span className="font-medium text-foreground">{consultorio.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    );
                  }}
                />
                {errors.consultoriosIds && (
                  <p className="text-sm text-destructive">{errors.consultoriosIds.message}</p>
                )}
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1" disabled={updateMutation.isPending}>
                  <Save className="mr-2 h-4 w-4" />
                  {updateMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push('/users')}>
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
