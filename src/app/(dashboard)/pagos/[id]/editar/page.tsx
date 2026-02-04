'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { FlowHeader } from '@/components/FlowHeader';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Save } from 'lucide-react';
import { pagoService, UpdatePagoRequest, MetodoPago, EstatusPago } from '@/services/pago.service';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const pagoSchema = z.object({
  monto: z
    .string()
    .min(1, 'El monto es obligatorio')
    .refine((value) => !isNaN(Number(value)) && Number(value) > 0, {
      message: 'El monto debe ser un número positivo',
    }),
  metodo: z.enum(['efectivo', 'tarjeta', 'transferencia'], {
    errorMap: () => ({ message: 'Selecciona un método de pago válido' }),
  }),
  fechaPago: z.string().optional(),
  estatus: z.enum(['pagado', 'pendiente']),
  comentarios: z.string().optional(),
});

type PagoFormData = z.infer<typeof pagoSchema>;

const metodoOptions: { value: MetodoPago; label: string }[] = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'tarjeta', label: 'Tarjeta' },
  { value: 'transferencia', label: 'Transferencia' },
];

const estatusOptions: { value: EstatusPago; label: string }[] = [
  { value: 'pagado', label: 'Pagado' },
  { value: 'pendiente', label: 'Pendiente' },
];

export default function EditarPagoPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'admin' && user.role !== 'doctor' && user.role !== 'recepcionista') {
        router.push('/pagos');
      }
    }
  }, [authLoading, user, router]);

  const { data: pagoData, isLoading } = useQuery({
    queryKey: ['pago', id],
    queryFn: () => pagoService.getPagoById(id),
    enabled: !!user && !!id,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PagoFormData>({
    resolver: zodResolver(pagoSchema),
  });

  useEffect(() => {
    if (pagoData?.data) {
      const pago = pagoData.data;
      reset({
        monto: pago.monto.toString(),
        metodo: pago.metodo,
        fechaPago: pago.fechaPago.split('T')[0],
        estatus: pago.estatus,
        comentarios: pago.comentarios || '',
      });
    }
  }, [pagoData, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: UpdatePagoRequest) => pagoService.updatePago(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pagos'] });
      queryClient.invalidateQueries({ queryKey: ['pago', id] });
      queryClient.invalidateQueries({ queryKey: ['citas'] });
      queryClient.invalidateQueries({ queryKey: ['paciente-history'] });
      if (pagoData?.data?.citaId) {
        queryClient.invalidateQueries({ queryKey: ['cita', pagoData.data.citaId] });
      }
      router.push(`/pagos/${id}`);
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Error al actualizar el pago');
    },
  });

  const onSubmit = (data: PagoFormData) => {
    setError('');
    const payload: UpdatePagoRequest = {
      monto: Number(data.monto),
      metodo: data.metodo,
      estatus: data.estatus,
      fechaPago: data.fechaPago,
      comentarios: data.comentarios,
    };
    updateMutation.mutate(payload);
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user || !pagoData?.data) {
    return null;
  }

  const pago = pagoData.data;

  const pagoInfo = pago.cita?.paciente?.fullName 
    ? `${pago.cita.paciente.fullName} - $${pago.monto}` 
    : `$${pago.monto}`;

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <FlowHeader
          pathname={`/pagos/${id}/editar`}
          params={{ id, pagoInfo }}
        />

        <Card>
          <CardHeader>
            <CardTitle>Editar Pago</CardTitle>
            <CardDescription>Actualiza la información del pago</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label>Cita Asociada</Label>
                <div className="rounded-md border border-input bg-muted/50 px-3 py-2 text-sm">
                  {pago.cita?.paciente?.fullName} -{' '}
                  {new Date(pago.cita?.date || '').toLocaleDateString('es-MX')}{' '}
                  {pago.cita?.time}
                </div>
                <p className="text-xs text-muted-foreground">
                  La cita asociada no se puede cambiar
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="monto">
                    Monto <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="monto"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register('monto')}
                  />
                  {errors.monto && (
                    <p className="text-sm text-destructive">{errors.monto.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metodo">
                    Método de Pago <span className="text-destructive">*</span>
                  </Label>
                  <select
                    id="metodo"
                    {...register('metodo')}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {metodoOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.metodo && (
                    <p className="text-sm text-destructive">{errors.metodo.message}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fechaPago">Fecha de Pago</Label>
                  <Input id="fechaPago" type="date" {...register('fechaPago')} />
                  {errors.fechaPago && (
                    <p className="text-sm text-destructive">{errors.fechaPago.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estatus">Estado</Label>
                  <select
                    id="estatus"
                    {...register('estatus')}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {estatusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.estatus && (
                    <p className="text-sm text-destructive">{errors.estatus.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comentarios">Comentarios</Label>
                <textarea
                  id="comentarios"
                  rows={3}
                  {...register('comentarios')}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Notas adicionales sobre el pago..."
                />
                {errors.comentarios && (
                  <p className="text-sm text-destructive">{errors.comentarios.message}</p>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/pagos/${id}`)}
                  disabled={updateMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  <Save className="mr-2 h-4 w-4" />
                  {updateMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
