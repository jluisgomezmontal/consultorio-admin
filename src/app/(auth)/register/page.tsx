'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { consultorioService } from '@/services/consultorio.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/Navbar';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  role: z.enum(['admin', 'doctor', 'recepcionista'], {
    required_error: 'Selecciona un rol',
  }),
  consultoriosIds: z.array(z.string().regex(objectIdRegex, 'Consultorio inválido')).optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
      role: undefined,
      consultoriosIds: [],
    },
  });

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        // Si no hay usuario autenticado, redirigir a login
        router.push('/login');
      } else if (user.role !== 'admin') {
        // Si el usuario no es admin, redirigir al dashboard
        router.push('/dashboard');
      }
    }
  }, [user, authLoading, router]);

  const { data: consultoriosData, isLoading: isLoadingConsultorios } = useQuery({
    queryKey: ['consultorios', 'options'],
    queryFn: () => consultorioService.getAllConsultorios(1, 100),
    enabled: !!user && user.role === 'admin',
  });

  const onSubmit: SubmitHandler<RegisterFormData> = async (data) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role,
        consultoriosIds: data.consultoriosIds,
      };
      await authService.register(payload);
      setSuccess('Usuario registrado exitosamente');
      router.push('/dashboard');
      reset();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || isLoadingConsultorios) {
    return (
      <div className="flex items-center justify-center bg-background">
                <Navbar />
      
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-4 text-sm text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  const consultorios = consultoriosData?.data ?? [];

  return (
    <div className="bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md space-y-4">
        <div className="flex flex-col gap-2 rounded-lg border bg-card p-4 shadow-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard')}
            className="w-fit justify-start gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al Dashboard
          </Button>
          <p className="text-xs text-muted-foreground">
            Solo administradores pueden acceder a esta sección.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Registrar Nuevo Usuario</CardTitle>
            <CardDescription>
              Solo administradores pueden crear nuevos usuarios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4 text-sm text-green-600 dark:text-green-400">
                  {success}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo</Label>
                <Input
                  {...register('name')}
                  type="text"
                  id="name"
                  placeholder="Juan Pérez"
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  {...register('email')}
                  type="email"
                  id="email"
                  placeholder="usuario@ejemplo.com"
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  {...register('password')}
                  type="password"
                  id="password"
                  placeholder="••••••••"
                  className={errors.password ? 'border-destructive' : ''}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Rol</Label>
                <select
                  {...register('role')}
                  id="role"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Seleccionar rol</option>
                  <option value="admin">Administrador</option>
                  <option value="doctor">Doctor</option>
                  <option value="recepcionista">Recepcionista</option>
                </select>
                {errors.role && (
                  <p className="text-sm text-destructive">{errors.role.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Consultorios asignados (Opcional)</Label>
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

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Registrando...' : 'Registrar Usuario'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
