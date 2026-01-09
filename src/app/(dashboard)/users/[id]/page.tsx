'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState as useStateReact } from 'react';
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
import { ArrowLeft, Save, Lock, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { Switch } from '@/components/ui/switch';

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
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isActive, setIsActive] = useState(true);

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
      
      setIsActive(apiUser.isActive ?? true);
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

  const updatePasswordMutation = useMutation({
    mutationFn: (password: string) => userService.updatePassword(userId, password),
    onSuccess: () => {
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError('');
      alert('Contraseña actualizada exitosamente');
    },
    onError: (error: any) => {
      setPasswordError(error?.response?.data?.message || 'Error al actualizar contraseña');
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (isActive: boolean) => userService.toggleUserStatus(userId, isActive),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      setIsActive(response.data.isActive);
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

  const handlePasswordUpdate = () => {
    setPasswordError('');
    
    if (!newPassword || !confirmPassword) {
      setPasswordError('Ambos campos son obligatorios');
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }
    
    updatePasswordMutation.mutate(newPassword);
  };

  const handleToggleStatus = (checked: boolean) => {
    toggleStatusMutation.mutate(checked);
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
      <main className="mx-auto max-w-3xl px-4 py-4 sm:py-8 sm:px-6 lg:px-8">
        <Button variant="ghost" onClick={() => router.push('/users')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> 
          <span className="hidden sm:inline">Volver a Usuarios</span>
          <span className="sm:hidden">Volver</span>
        </Button>

        <div className="space-y-4 sm:space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">Editar Usuario</CardTitle>
            <CardDescription className="text-sm">Actualiza la información del usuario y sus consultorios asignados</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
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

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button type="submit" className="flex-1 w-full" disabled={updateMutation.isPending}>
                  <Save className="mr-2 h-4 w-4" />
                  {updateMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
                </Button>
                <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => router.push('/users')}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-xl sm:text-2xl">Cambiar Contraseña</CardTitle>
            </div>
            <CardDescription className="text-sm">Actualiza la contraseña del usuario</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nueva Contraseña</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo 6 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Repite la contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              {passwordError && (
                <p className="text-sm text-destructive">{passwordError}</p>
              )}

              <Button
                type="button"
                onClick={handlePasswordUpdate}
                disabled={updatePasswordMutation.isPending}
                className="w-full sm:w-auto"
              >
                <Lock className="mr-2 h-4 w-4" />
                {updatePasswordMutation.isPending ? 'Actualizando...' : 'Actualizar Contraseña'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-xl sm:text-2xl">Estado de la Cuenta</CardTitle>
            </div>
            <CardDescription className="text-sm">
              Activar o desactivar el acceso del usuario a la aplicación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="user-status" className="text-base font-medium">
                  {isActive ? 'Cuenta Activa' : 'Cuenta Desactivada'}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {isActive
                    ? 'El usuario puede iniciar sesión y usar la aplicación'
                    : 'El usuario no puede iniciar sesión. Contactar al administrador.'}
                </p>
              </div>
              <Switch
                id="user-status"
                checked={isActive}
                onCheckedChange={handleToggleStatus}
                disabled={toggleStatusMutation.isPending}
              />
            </div>
            {!isActive && (
              <div className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                <p className="font-medium">⚠️ Cuenta desactivada</p>
                <p className="mt-1">
                  Este usuario no podrá iniciar sesión ni realizar acciones en la aplicación.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </main>
    </div>
  );
}
