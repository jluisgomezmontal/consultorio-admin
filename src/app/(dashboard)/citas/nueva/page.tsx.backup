'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useConsultorio } from '@/contexts/ConsultorioContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';
import { ArrowLeft, Save } from 'lucide-react';
import { citaService, CreateCitaRequest, CitaEstado } from '@/services/cita.service';
import { pacienteService, Paciente } from '@/services/paciente.service';
import { userService, User } from '@/services/user.service';
import { consultorioService, Consultorio } from '@/services/consultorio.service';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const citaSchema = z.object({
  pacienteId: z.string().regex(objectIdRegex, { message: 'Selecciona un paciente válido' }),
  doctorId: z.string().regex(objectIdRegex, { message: 'Selecciona un doctor válido' }),
  consultorioId: z.string().regex(objectIdRegex, { message: 'Selecciona un consultorio válido' }),
  date: z.string().min(1, 'La fecha es obligatoria'),
  time: z.string().min(1, 'La hora es obligatoria'),
  motivo: z.string().optional(),
  diagnostico: z.string().optional(),
  tratamiento: z.string().optional(),
  estado: z.enum(['pendiente', 'confirmada', 'completada', 'cancelada']).default('pendiente'),
  costo: z
    .string()
    .optional()
    .refine((value) => value === undefined || value === '' || !isNaN(Number(value)), {
      message: 'Costo inválido',
    }),
  notas: z.string().optional(),
});

type CitaFormData = z.infer<typeof citaSchema>;

const estadoOptions: { value: CitaEstado; label: string }[] = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'confirmada', label: 'Confirmada' },
  { value: 'completada', label: 'Completada' },
  { value: 'cancelada', label: 'Cancelada' },
];

export default function NuevaCitaPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <LoadingSpinner delay={0} fullScreen={false} message="Cargando formulario de cita..." />
        </div>
      }
    >
      <NuevaCitaContent />
    </Suspense>
  );
}

function NuevaCitaContent() {
  const { user, loading: authLoading } = useAuth();
  const { selectedConsultorio } = useConsultorio();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const [selectedConsultorioId, setSelectedConsultorioId] = useState<string>('');
  const pacienteIdFromQuery = searchParams.get('pacienteId');

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'admin' && user.role !== 'doctor' && user.role !== 'recepcionista') {
        router.push('/citas');
      }
    }
  }, [authLoading, user, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CitaFormData>({
    resolver: zodResolver(citaSchema),
    defaultValues: {
      estado: 'pendiente',
      pacienteId: pacienteIdFromQuery || undefined,
    },
  });

  const consultorioId = watch('consultorioId');

  // Update selected consultorio and clear doctor when consultorio changes
  useEffect(() => {
    console.log(consultorioId,selectedConsultorioId)
    if (consultorioId !== selectedConsultorioId) {
      setSelectedConsultorioId(consultorioId);
      setValue('doctorId', ''); // Clear doctor selection when consultorio changes
    }
  }, [consultorioId, selectedConsultorioId, setValue]);

  useEffect(() => {
    if (pacienteIdFromQuery) {
      setValue('pacienteId', pacienteIdFromQuery);
    }
  }, [pacienteIdFromQuery, setValue]);

  // Auto-select consultorio activo
  useEffect(() => {
    const id = selectedConsultorio?.id || selectedConsultorio?._id;
    if (id && !consultorioId) {
      setValue('consultorioId', id);
    }
  }, [selectedConsultorio, consultorioId, setValue]);

  const { data: pacientesData, isLoading: isLoadingPacientes } = useQuery({
    queryKey: ['pacientes', 'options'],
    queryFn: () => pacienteService.getAllPacientes(1, 1000),
    enabled: !!user,
  });

  const { data: doctoresData, isLoading: isLoadingDoctores } = useQuery({
    queryKey: ['doctores', 'options'],
    queryFn: () => userService.getDoctors(),
    enabled: !!user,
  });

  const { data: consultoriosData, isLoading: isLoadingConsultorios } = useQuery({
    queryKey: ['consultorios', 'options'],
    queryFn: () => consultorioService.getAllConsultorios(1, 1000),
    enabled: !!user,
  });

  // Prepare data for auto-selection logic
  const pacientes = pacientesData?.data ?? [];
  const allDoctores = (doctoresData?.data ?? []).filter((item: User) => item.role === 'doctor');
  const allConsultorios = consultoriosData?.data ?? [];
  const consultorios = user?.role === 'admin' 
    ? allConsultorios 
    : allConsultorios.filter((c: Consultorio) => user?.consultoriosIds?.includes(c.id || c._id || ''));

  // Filter doctors based on selected consultorio
  const doctores = selectedConsultorioId
    ? allDoctores.filter((doctor: User) => doctor.consultoriosIds?.includes(selectedConsultorioId))
    : allDoctores;

  // Auto-select doctor if only one is available
  const doctorId = watch('doctorId');
  useEffect(() => {
    if (doctores.length === 1 && !doctorId) {
      setValue('doctorId', doctores[0].id);
    }
  }, [doctores, doctorId, setValue]);

  const createMutation = useMutation({
    mutationFn: (payload: CreateCitaRequest) => citaService.createCita(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['citas'] });
      router.push('/citas');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Error al crear la cita');
    },
  });

  const onSubmit = (data: CitaFormData) => {
    setError('');
    const payload: CreateCitaRequest = {
      pacienteId: data.pacienteId,
      doctorId: data.doctorId,
      consultorioId: data.consultorioId,
      date: data.date,
      time: data.time,
      motivo: data.motivo || undefined,
      diagnostico: data.diagnostico || undefined,
      tratamiento: data.tratamiento || undefined,
      estado: data.estado,
      costo: data.costo ? Number(data.costo) : undefined,
      notas: data.notas || undefined,
    };
    createMutation.mutate(payload);
  };

  if (authLoading || isLoadingPacientes || isLoadingDoctores || isLoadingConsultorios) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== 'admin' && user.role !== 'doctor' && user.role !== 'recepcionista')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/citas')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Citas
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Nueva Cita</CardTitle>
            <CardDescription>
              Registra una nueva cita en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="pacienteId">Paciente *</Label>
                  <select
                    id="pacienteId"
                    {...register('pacienteId')}
                    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${errors.pacienteId ? 'border-destructive' : ''}`}
                  >
                    <option value="">Selecciona un paciente</option>
                    {pacientes.map((paciente: Paciente) => (
                      <option key={paciente.id} value={paciente.id}>
                        {paciente.fullName}
                      </option>
                    ))}
                  </select>
                  {errors.pacienteId && (
                    <p className="text-sm text-destructive">{errors.pacienteId.message}</p>
                  )}
                </div>
              <div className="space-y-2">
                <Label htmlFor="consultorioId">Consultorio *</Label>
                <select
                  id="consultorioId"
                  {...register('consultorioId')}
                  className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${errors.consultorioId ? 'border-destructive' : ''}`}
                >
                  <option value="">Selecciona un consultorio</option>
                  {consultorios.map((consultorio: Consultorio) => {
                    const id = consultorio.id || consultorio._id;
                    return (
                      <option key={id} value={id}>
                        {consultorio.name}
                      </option>
                    );
                  })}
                </select>
                {errors.consultorioId && (
                  <p className="text-sm text-destructive">{errors.consultorioId.message}</p>
                )}
              </div>

              </div>

                <div className="space-y-2">
                  <Label htmlFor="doctorId">Doctor *</Label>
                  <select
                    id="doctorId"
                    {...register('doctorId')}
                    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${errors.doctorId ? 'border-destructive' : ''}`}
                  >
                    <option value="">Selecciona un doctor</option>
                    {doctores.map((doctor: User) => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.name}
                      </option>
                    ))}
                  </select>
                  {errors.doctorId && (
                    <p className="text-sm text-destructive">{errors.doctorId.message}</p>
                  )}
                </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="date">Fecha *</Label>
                  <Input
                    id="date"
                    type="date"
                    {...register('date')}
                    className={errors.date ? 'border-destructive' : ''}
                  />
                  {errors.date && (
                    <p className="text-sm text-destructive">{errors.date.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Hora *</Label>
                  <Input
                    id="time"
                    type="time"
                    {...register('time')}
                    className={errors.time ? 'border-destructive' : ''}
                  />
                  {errors.time && (
                    <p className="text-sm text-destructive">{errors.time.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="motivo">Motivo</Label>
                <textarea
                  id="motivo"
                  {...register('motivo')}
                  rows={2}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Motivo de la consulta"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="diagnostico">Diagnóstico</Label>
                <textarea
                  id="diagnostico"
                  {...register('diagnostico')}
                  rows={2}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Diagnóstico del paciente"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tratamiento">Tratamiento</Label>
                <textarea
                  id="tratamiento"
                  {...register('tratamiento')}
                  rows={2}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Tratamiento recomendado"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <select
                    id="estado"
                    {...register('estado')}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {estadoOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="costo">Costo (MXN)</Label>
                  <Input
                    id="costo"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('costo')}
                    className={errors.costo ? 'border-destructive' : ''}
                  />
                  {errors.costo && (
                    <p className="text-sm text-destructive">{errors.costo.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notas">Notas</Label>
                <textarea
                  id="notas"
                  {...register('notas')}
                  rows={2}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Notas adicionales"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button type="submit" disabled={createMutation.isPending} className="flex-1">
                  <Save className="mr-2 h-4 w-4" />
                  {createMutation.isPending ? 'Guardando...' : 'Guardar Cita'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.push('/citas')}
                  disabled={createMutation.isPending}
                  className="sm:w-auto"
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
