'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePaquete } from '@/hooks/usePaquete';
import { LimiteAlcanzadoDialog } from '@/components/LimiteAlcanzadoDialog';
import { handleApiError } from '@/lib/handleApiError';
import { toast } from '@/hooks/use-toast';

const userSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  role: z.enum(['doctor', 'recepcionista']),
});

type UserFormData = z.infer<typeof userSchema>;

export default function NuevoUsuarioPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { paqueteInfo, puedeCrearDoctor, puedeCrearRecepcionista } = usePaquete();
  const [showLimiteDialog, setShowLimiteDialog] = useState(false);
  const [limiteInfo, setLimiteInfo] = useState<{ tipo: string; actual: number; limite: number } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  const selectedRole = watch('role');

  const createMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      // Aquí iría tu servicio de usuarios
      // return await userService.createUser(data);
      throw new Error('Implementar userService.createUser');
    },
    onSuccess: () => {
      toast({
        title: 'Usuario creado',
        description: 'El usuario ha sido creado exitosamente',
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      router.push('/usuarios');
    },
    onError: (error) => {
      handleApiError(error, () => {
        setShowLimiteDialog(true);
      });
    },
  });

  const onSubmit = (data: UserFormData) => {
    // Verificar límites antes de enviar
    if (data.role === 'doctor' && !puedeCrearDoctor()) {
      setLimiteInfo({
        tipo: 'doctor',
        actual: paqueteInfo?.uso.doctores.actual || 0,
        limite: paqueteInfo?.uso.doctores.limite || 0,
      });
      setShowLimiteDialog(true);
      return;
    }

    if (data.role === 'recepcionista' && !puedeCrearRecepcionista()) {
      setLimiteInfo({
        tipo: 'recepcionista',
        actual: paqueteInfo?.uso.recepcionistas.actual || 0,
        limite: paqueteInfo?.uso.recepcionistas.limite || 0,
      });
      setShowLimiteDialog(true);
      return;
    }

    createMutation.mutate(data);
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Crear Nuevo Usuario
          </CardTitle>
          <CardDescription>
            Agrega un nuevo doctor o recepcionista a tu consultorio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo *</Label>
              <Input
                {...register('name')}
                id="name"
                placeholder="Dr. Juan Pérez"
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                {...register('email')}
                id="email"
                type="email"
                placeholder="doctor@ejemplo.com"
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña *</Label>
              <Input
                {...register('password')}
                id="password"
                type="password"
                placeholder="••••••••"
                className={errors.password ? 'border-destructive' : ''}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Rol *</Label>
              <Select
                onValueChange={(value) => setValue('role', value as 'doctor' | 'recepcionista')}
              >
                <SelectTrigger className={errors.role ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="doctor">
                    Doctor
                    {paqueteInfo && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({paqueteInfo.uso.doctores.actual}/{paqueteInfo.uso.doctores.limite})
                      </span>
                    )}
                  </SelectItem>
                  <SelectItem value="recepcionista">
                    Recepcionista
                    {paqueteInfo && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({paqueteInfo.uso.recepcionistas.actual}/{paqueteInfo.uso.recepcionistas.limite})
                      </span>
                    )}
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-destructive">{errors.role.message}</p>
              )}
            </div>

            {selectedRole && paqueteInfo && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/20">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {selectedRole === 'doctor' ? (
                    <>
                      Doctores disponibles: {paqueteInfo.uso.doctores.disponible} de {paqueteInfo.uso.doctores.limite}
                    </>
                  ) : (
                    <>
                      Recepcionistas disponibles: {paqueteInfo.uso.recepcionistas.disponible} de {paqueteInfo.uso.recepcionistas.limite}
                    </>
                  )}
                </p>
              </div>
            )}

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="flex-1"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Crear Usuario
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <LimiteAlcanzadoDialog
        open={showLimiteDialog}
        onOpenChange={setShowLimiteDialog}
        titulo="Límite de usuarios alcanzado"
        mensaje={`Has alcanzado el límite de ${limiteInfo?.tipo}s en tu plan ${paqueteInfo?.paquete.displayName}. Actualiza tu plan para agregar más usuarios.`}
        actual={limiteInfo?.actual}
        limite={limiteInfo?.limite}
        tipo={limiteInfo?.tipo}
      />
    </div>
  );
}
