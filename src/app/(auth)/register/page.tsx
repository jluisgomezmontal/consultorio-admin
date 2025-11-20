'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/Navbar';

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  role: z.enum(['admin', 'doctor', 'secretaria'], {
    required_error: 'Selecciona un rol',
  }),
  consultorioId: z.string().optional(),
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
    reset,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
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

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await authService.register(data);
      setSuccess('Usuario registrado exitosamente');
      reset();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
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
                  <option value="secretaria">Secretaria</option>
                </select>
                {errors.role && (
                  <p className="text-sm text-destructive">{errors.role.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="consultorioId">ID Consultorio (Opcional)</Label>
                <Input
                  {...register('consultorioId')}
                  type="text"
                  id="consultorioId"
                  placeholder="ID del consultorio"
                />
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
