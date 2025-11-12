'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';
import { ArrowLeft, Save } from 'lucide-react';
import { pagoService, CreatePagoRequest, MetodoPago, EstatusPago } from '@/services/pago.service';
import { citaService } from '@/services/cita.service';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const pagoSchema = z.object({
  citaId: z.string().uuid({ message: 'Selecciona una cita válida' }),
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
  estatus: z.enum(['pagado', 'pendiente']).default('pendiente'),
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

export default function NuevoPagoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <LoadingSpinner delay={0} fullScreen={false} message="Cargando formulario de pago..." />
        </div>
      }
    >
      <NuevoPagoContent />
    </Suspense>
  );
}

function NuevoPagoContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const citaIdFromQuery = searchParams.get('citaId');

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'admin' && user.role !== 'doctor') {
        router.push('/pagos');
      }
    }
  }, [authLoading, user, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<PagoFormData>({
    resolver: zodResolver(pagoSchema),
    defaultValues: {
      estatus: 'pendiente',
      metodo: 'efectivo',
      citaId: citaIdFromQuery || undefined,
      fechaPago: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    if (citaIdFromQuery) {
      setValue('citaId', citaIdFromQuery);
    }
  }, [citaIdFromQuery, setValue]);

  const { data: citasData, isLoading: isLoadingCitas } = useQuery({
    queryKey: ['citas', 'options'],
    queryFn: () => citaService.getAllCitas({ page: 1, limit: 1000 }),
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreatePagoRequest) => pagoService.createPago(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pagos'] });
      router.push('/pagos');
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Error al crear el pago');
    },
  });

  const onSubmit = (data: PagoFormData) => {
    setError('');
    const payload: CreatePagoRequest = {
      citaId: data.citaId,
      monto: Number(data.monto),
      metodo: data.metodo,
      estatus: data.estatus,
      fechaPago: data.fechaPago,
      comentarios: data.comentarios,
    };
    createMutation.mutate(payload);
  };

  if (authLoading || isLoadingCitas) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const citas = citasData?.data || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.push('/pagos')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Regresar
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Registrar Nuevo Pago</CardTitle>
            <CardDescription>Completa los datos del pago</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="citaId">
                  Cita <span className="text-destructive">*</span>
                </Label>
                <select
                  id="citaId"
                  {...register('citaId')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Selecciona una cita</option>
                  {citas.map((cita) => (
                    <option key={cita.id} value={cita.id}>
                      {cita.paciente?.fullName} - {new Date(cita.date).toLocaleDateString('es-MX')} {cita.time}
                    </option>
                  ))}
                </select>
                {errors.citaId && (
                  <p className="text-sm text-destructive">{errors.citaId.message}</p>
                )}
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
                  onClick={() => router.push('/pagos')}
                  disabled={createMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  <Save className="mr-2 h-4 w-4" />
                  {createMutation.isPending ? 'Guardando...' : 'Guardar Pago'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
