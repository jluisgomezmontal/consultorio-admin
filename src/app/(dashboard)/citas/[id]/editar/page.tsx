'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';
import { ArrowLeft, Save, Plus, Trash2, User as UserIcon, Calendar, Stethoscope, FileText, Activity, Weight, Ruler, Heart, ChevronDown, ChevronUp } from 'lucide-react';
import { citaService, UpdateCitaRequest, CitaEstado, CitaResponse, Medicamento } from '@/services/cita.service';
import { pacienteService, Paciente } from '@/services/paciente.service';
import { userService, User } from '@/services/user.service';
import { consultorioService, Consultorio } from '@/services/consultorio.service';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const medicamentoSchema = z.object({
  nombre: z.string().min(1, 'Nombre del medicamento es requerido'),
  dosis: z.string().optional(),
  frecuencia: z.string().optional(),
  duracion: z.string().optional(),
  indicaciones: z.string().optional(),
});

const citaSchema = z.object({
  pacienteId: z.string().regex(objectIdRegex, { message: 'Selecciona un paciente válido' }),
  doctorId: z.string().regex(objectIdRegex, { message: 'Selecciona un doctor válido' }),
  consultorioId: z.string().regex(objectIdRegex, { message: 'Selecciona un consultorio válido' }),
  date: z.string().min(1, 'La fecha es obligatoria'),
  time: z.string().min(1, 'La hora es obligatoria'),
  motivo: z.string().optional(),
  weight: z.string().optional().refine((value) => value === undefined || value === '' || !isNaN(Number(value)), { message: 'Peso inválido' }),
  bloodPressure: z.string().optional(),
  height: z.string().optional().refine((value) => value === undefined || value === '' || !isNaN(Number(value)), { message: 'Altura inválida' }),
  waist: z.string().optional().refine((value) => value === undefined || value === '' || !isNaN(Number(value)), { message: 'Cintura inválida' }),
  hip: z.string().optional().refine((value) => value === undefined || value === '' || !isNaN(Number(value)), { message: 'Cadera inválida' }),
  currentCondition: z.string().optional(),
  physicalExam: z.string().optional(),
  diagnostico: z.string().optional(),
  tratamiento: z.string().optional(),
  medicamentos: z.array(medicamentoSchema).optional(),
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

export default function EditarCitaPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const [selectedConsultorioId, setSelectedConsultorioId] = useState<string>('');
  const [openSections, setOpenSections] = useState({
    appointmentInfo: true,
    vitalSigns: false,
    medicalEvaluation: false,
    diagnosisTreatment: false,
    medications: false,
    additionalNotes: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const isDoctor = user?.role === 'doctor' || user?.role === 'admin';

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
    reset,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CitaFormData>({
    resolver: zodResolver(citaSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'medicamentos',
  });

  const consultorioId = watch('consultorioId');

  // Update selected consultorio and clear doctor when consultorio changes
  useEffect(() => {
    if (consultorioId && consultorioId !== selectedConsultorioId) {
      setSelectedConsultorioId(consultorioId);
      // Only clear doctor if consultorio actually changed (not initial load)
      if (selectedConsultorioId) {
        setValue('doctorId', '');
      }
    }
  }, [consultorioId, selectedConsultorioId, setValue]);

  const { data: citaData, isLoading: isLoadingCita } = useQuery<CitaResponse>({
    queryKey: ['cita', id],
    queryFn: () => citaService.getCitaById(id),
    enabled: !!user && !!id,
  });

  useEffect(() => {
    if (citaData?.data) {
      const cita = citaData.data;
      setSelectedConsultorioId(cita.consultorioId);
      reset({
        pacienteId: cita.pacienteId,
        doctorId: cita.doctorId,
        consultorioId: cita.consultorioId,
        date: cita.date.substring(0, 10),
        time: cita.time,
        motivo: cita.motivo || '',
        weight: cita.weight ? String(cita.weight) : '',
        bloodPressure: cita.bloodPressure || '',
        height: cita.measurements?.height ? String(cita.measurements.height) : '',
        waist: cita.measurements?.waist ? String(cita.measurements.waist) : '',
        hip: cita.measurements?.hip ? String(cita.measurements.hip) : '',
        currentCondition: cita.currentCondition || '',
        physicalExam: cita.physicalExam || '',
        diagnostico: cita.diagnostico || '',
        tratamiento: cita.tratamiento || '',
        medicamentos: cita.medicamentos || [],
        estado: cita.estado,
        costo: cita.costo !== undefined && cita.costo !== null ? String(cita.costo) : '',
        notas: cita.notas || '',
      });
    }
  }, [citaData, reset]);

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

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateCitaRequest) => citaService.updateCita(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['citas'] });
      queryClient.invalidateQueries({ queryKey: ['cita', id] });
      router.push(`/citas/${id}`);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Error al actualizar la cita');
    },
  });

  const onSubmit = (data: CitaFormData) => {
    setError('');
    const payload: UpdateCitaRequest = {
      pacienteId: data.pacienteId,
      doctorId: data.doctorId,
      consultorioId: data.consultorioId,
      date: data.date,
      time: data.time,
      motivo: data.motivo || undefined,
      weight: data.weight ? Number(data.weight) : undefined,
      bloodPressure: data.bloodPressure || undefined,
      measurements: (data.height || data.waist || data.hip) ? {
        height: data.height ? Number(data.height) : undefined,
        waist: data.waist ? Number(data.waist) : undefined,
        hip: data.hip ? Number(data.hip) : undefined,
      } : undefined,
      currentCondition: data.currentCondition || undefined,
      physicalExam: data.physicalExam || undefined,
      diagnostico: data.diagnostico || undefined,
      tratamiento: data.tratamiento || undefined,
      medicamentos: data.medicamentos?.filter(m => m.nombre && m.nombre.trim() !== '').map(m => ({
        nombre: m.nombre!,
        dosis: m.dosis,
        frecuencia: m.frecuencia,
        duracion: m.duracion,
        indicaciones: m.indicaciones,
      })) || undefined,
      estado: data.estado,
      costo: data.costo ? Number(data.costo) : undefined,
      notas: data.notas || undefined,
    };
    updateMutation.mutate(payload);
  };

  if (
    authLoading ||
    isLoadingCita ||
    isLoadingPacientes ||
    isLoadingDoctores ||
    isLoadingConsultorios
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== 'admin' && user.role !== 'doctor' && user.role !== 'recepcionista') || !citaData?.data) {
    return null;
  }

  const pacientes = pacientesData?.data ?? [];
  const allDoctores = (doctoresData?.data ?? []).filter((item: User) => item.role === 'doctor');
  
  // Filter consultorios based on user role
  const allConsultorios = consultoriosData?.data ?? [];
  const consultorios = user.role === 'admin' 
    ? allConsultorios 
    : allConsultorios.filter((c: Consultorio) => user.consultoriosIds?.includes(c.id ?? ''));

  // Filter doctors based on selected consultorio
  const doctores = selectedConsultorioId
    ? allDoctores.filter((doctor: User) => 
        doctor.consultoriosIds?.includes(selectedConsultorioId)
      )
    : allDoctores;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          onClick={() => router.push(`/citas/${id}`)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a la Cita
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Editar Cita</CardTitle>
            <CardDescription>
              Actualiza la información de la cita
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="consultorioId">Consultorio *</Label>
                <select
                  id="consultorioId"
                  {...register('consultorioId')}
                  className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${errors.consultorioId ? 'border-destructive' : ''}`}
                >
                  <option value="">Selecciona un consultorio</option>
                  {consultorios.map((consultorio: Consultorio) => (
                    <option key={consultorio.id} value={consultorio.id}>
                      {consultorio.name}
                    </option>
                  ))}
                </select>
                {errors.consultorioId && (
                  <p className="text-sm text-destructive">{errors.consultorioId.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="date">Fecha *</Label>
                  <Input id="date" type="date" {...register('date')} className={errors.date ? 'border-destructive' : ''} />
                  {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Hora *</Label>
                  <Input id="time" type="time" {...register('time')} className={errors.time ? 'border-destructive' : ''} />
                  {errors.time && <p className="text-sm text-destructive">{errors.time.message}</p>}
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

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base">Medicamentos</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ nombre: '', dosis: '', frecuencia: '', duracion: '', indicaciones: '' })}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar Medicamento
                  </Button>
                </div>

                {fields.map((field, index) => (
                  <div key={field.id} className="border rounded-lg p-4 space-y-3 bg-muted/30">
                    <div className="flex items-start justify-between">
                      <span className="text-sm font-medium">Medicamento #{index + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor={`medicamentos.${index}.nombre`}>
                          Nombre del Medicamento <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          {...register(`medicamentos.${index}.nombre`)}
                          id={`medicamentos.${index}.nombre`}
                          placeholder="Ej: Amoxicilina 500mg"
                        />
                        {errors.medicamentos?.[index]?.nombre && (
                          <p className="text-sm text-destructive">
                            {errors.medicamentos[index]?.nombre?.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`medicamentos.${index}.dosis`}>Dosis</Label>
                        <Input
                          {...register(`medicamentos.${index}.dosis`)}
                          id={`medicamentos.${index}.dosis`}
                          placeholder="Ej: 1 tableta"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`medicamentos.${index}.frecuencia`}>Frecuencia</Label>
                        <Input
                          {...register(`medicamentos.${index}.frecuencia`)}
                          id={`medicamentos.${index}.frecuencia`}
                          placeholder="Ej: Cada 8 horas"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`medicamentos.${index}.duracion`}>Duración</Label>
                        <Input
                          {...register(`medicamentos.${index}.duracion`)}
                          id={`medicamentos.${index}.duracion`}
                          placeholder="Ej: 7 días"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`medicamentos.${index}.indicaciones`}>
                          Indicaciones Especiales
                        </Label>
                        <Input
                          {...register(`medicamentos.${index}.indicaciones`)}
                          id={`medicamentos.${index}.indicaciones`}
                          placeholder="Ej: Tomar con alimentos"
                        />
                      </div>
                    </div>
                  </div>
                ))}
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
                    min="0"
                    step="0.01"
                    {...register('costo')}
                    className={errors.costo ? 'border-destructive' : ''}
                  />
                  {errors.costo && <p className="text-sm text-destructive">{errors.costo.message}</p>}
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

              <div className="flex gap-4">
                <Button type="submit" disabled={updateMutation.isPending} className="flex-1">
                  <Save className="mr-2 h-4 w-4" />
                  {updateMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push(`/citas/${id}`)}>
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
