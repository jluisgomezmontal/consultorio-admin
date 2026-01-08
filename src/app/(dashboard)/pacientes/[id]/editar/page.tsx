'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, User, Phone, Heart, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { pacienteService, UpdatePacienteRequest, ClinicalHistory } from '@/services/paciente.service';
import { consultorioService } from '@/services/consultorio.service';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClinicalHistoryForm } from '@/components/ClinicalHistoryForm';
import { PatientPhotoUpload } from '@/components/PatientPhotoUpload';

const pacienteSchema = z.object({
  fullName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  birthDate: z.string().optional(),
  age: z.number().int().positive('La edad debe ser un número positivo').optional().or(z.literal('')),
  gender: z.enum(['masculino', 'femenino', 'otro']).optional().or(z.literal('')),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  address: z.string().optional(),
  bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional().or(z.literal('')),
  insuranceInsurer: z.string().optional(),
  insurancePolicyNumber: z.string().optional(),
  insuranceHolderName: z.string().optional(),
  insuranceRelationship: z.enum(['Titular', 'Esposo(a)', 'Hijo(a)', 'Otro']).optional().or(z.literal('')),
  emergencyContactName: z.string().optional(),
  emergencyContactRelationship: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  medicalHistory: z.string().optional(),
  allergies: z.string().optional(),
  notes: z.string().optional(),
});

type PacienteFormData = z.infer<typeof pacienteSchema>;

export default function EditarPacientePage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const [clinicalHistory, setClinicalHistory] = useState<ClinicalHistory>({});
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoS3Key, setPhotoS3Key] = useState('');
  const [openSections, setOpenSections] = useState({
    personalInfo: true,
    contactInfo: true,
    medicalInfo: false,
    emergencyContact: false,
    additionalInfo: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const { data: pacienteData, isLoading } = useQuery({
    queryKey: ['paciente', id],
    queryFn: () => pacienteService.getPacienteById(id),
    enabled: !!user && !!id,
  });

  const consultorioId = pacienteData?.data?.consultorioId;

  const { data: configData } = useQuery({
    queryKey: ['consultorio-config', consultorioId],
    queryFn: () => consultorioService.getClinicalHistoryConfig(consultorioId || ''),
    enabled: !!consultorioId,
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PacienteFormData>({
    resolver: zodResolver(pacienteSchema),
  });

  const birthDate = watch('birthDate');
  useEffect(() => {
    if (birthDate) {
      const calculatedAge = calculateAge(birthDate);
      setValue('age', calculatedAge);
    }
  }, [birthDate, setValue]);

  useEffect(() => {
    if (pacienteData?.data) {
      reset({
        fullName: pacienteData.data.fullName,
        birthDate: pacienteData.data.birthDate ? new Date(pacienteData.data.birthDate).toISOString().split('T')[0] : '',
        age: pacienteData.data.age || ('' as any),
        gender: pacienteData.data.gender || ('' as any),
        phone: pacienteData.data.phone || '',
        email: pacienteData.data.email || '',
        address: pacienteData.data.address || '',
        bloodType: pacienteData.data.bloodType || ('' as any),
        insuranceInsurer: pacienteData.data.medicalInsurance?.insurer || '',
        insurancePolicyNumber: pacienteData.data.medicalInsurance?.policyNumber || '',
        insuranceHolderName: pacienteData.data.medicalInsurance?.holderName || '',
        insuranceRelationship: pacienteData.data.medicalInsurance?.relationship || ('' as any),
        emergencyContactName: pacienteData.data.emergencyContact?.name || '',
        emergencyContactRelationship: pacienteData.data.emergencyContact?.relationship || '',
        emergencyContactPhone: pacienteData.data.emergencyContact?.phone || '',
        medicalHistory: pacienteData.data.medicalHistory || '',
        allergies: pacienteData.data.allergies || '',
        notes: pacienteData.data.notes || '',
      });
      setClinicalHistory(pacienteData.data.clinicalHistory || {});
      setPhotoUrl(pacienteData.data.photoUrl || '');
      setPhotoS3Key(pacienteData.data.photoS3Key || '');
    }
  }, [pacienteData, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: UpdatePacienteRequest) => pacienteService.updatePaciente(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paciente', id] });
      queryClient.invalidateQueries({ queryKey: ['pacientes'] });
      router.push(`/pacientes/${id}`);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Error al actualizar paciente');
    },
  });

  const onSubmit = (data: PacienteFormData) => {
    setError('');
    const payload: UpdatePacienteRequest = {
      fullName: data.fullName,
      birthDate: data.birthDate || undefined,
      age: data.age ? Number(data.age) : undefined,
      gender: data.gender || undefined,
      phone: data.phone || undefined,
      email: data.email || undefined,
      address: data.address || undefined,
      bloodType: data.bloodType || undefined,
      medicalInsurance: (data.insuranceInsurer || data.insurancePolicyNumber || data.insuranceHolderName || data.insuranceRelationship) ? {
        insurer: data.insuranceInsurer || undefined,
        policyNumber: data.insurancePolicyNumber || undefined,
        holderName: data.insuranceHolderName || undefined,
        relationship: data.insuranceRelationship || undefined,
      } : undefined,
      emergencyContact: (data.emergencyContactName || data.emergencyContactRelationship || data.emergencyContactPhone) ? {
        name: data.emergencyContactName || undefined,
        relationship: data.emergencyContactRelationship || undefined,
        phone: data.emergencyContactPhone || undefined,
      } : undefined,
      medicalHistory: data.medicalHistory || undefined,
      allergies: data.allergies || undefined,
      notes: data.notes || undefined,
      clinicalHistory,
      photoUrl: photoUrl || undefined,
      photoS3Key: photoS3Key || undefined,
    };
    updateMutation.mutate(payload);
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-4 text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user || !pacienteData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          onClick={() => router.push(`/pacientes/${id}`)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al Paciente
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Editar Paciente</CardTitle>
            <CardDescription>
              Actualiza la información del paciente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
                  {error}
                </div>
              )}

              {/* Información Personal */}
              <div className="rounded-lg border bg-card">
                <button
                  type="button"
                  onClick={() => toggleSection('personalInfo')}
                  className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors rounded-t-lg"
                >
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Información Personal</span>
                  </div>
                  {openSections.personalInfo ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
                {openSections.personalInfo && (
                  <div className="space-y-4 p-4 pt-0">
                    <div className="space-y-2">
                      <Label>Foto del Paciente</Label>
                      <PatientPhotoUpload
                        currentPhotoUrl={photoUrl}
                        currentS3Key={photoS3Key}
                        onPhotoChange={(url, key) => {
                          setPhotoUrl(url);
                          setPhotoS3Key(key);
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fullName">Nombre Completo *</Label>
                      <Input
                        {...register('fullName')}
                        id="fullName"
                        placeholder="Juan Pérez García"
                        className={errors.fullName ? 'border-destructive' : ''}
                      />
                      {errors.fullName && (
                        <p className="text-sm text-destructive">{errors.fullName.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
                        <Input
                          {...register('birthDate')}
                          id="birthDate"
                          type="date"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="age">
                          Edad {birthDate && <span className="text-xs text-muted-foreground">(calculada automáticamente)</span>}
                        </Label>
                        <Input
                          {...register('age', { valueAsNumber: true })}
                          id="age"
                          type="number"
                          placeholder={birthDate ? "Calculada automáticamente" : "35"}
                          disabled={!!birthDate}
                          className={errors.age ? 'border-destructive' : ''}
                        />
                        {errors.age && (
                          <p className="text-sm text-destructive">{errors.age.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="gender">Género</Label>
                        <select
                          {...register('gender')}
                          id="gender"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <option value="">Seleccionar</option>
                          <option value="masculino">Masculino</option>
                          <option value="femenino">Femenino</option>
                          <option value="otro">Otro</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Información de Contacto */}
              <div className="rounded-lg border bg-card">
                <button
                  type="button"
                  onClick={() => toggleSection('contactInfo')}
                  className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors rounded-t-lg"
                >
                  <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Información de Contacto</span>
                  </div>
                  {openSections.contactInfo ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
                {openSections.contactInfo && (
                  <div className="space-y-4 p-4 pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Teléfono</Label>
                        <Input
                          {...register('phone')}
                          id="phone"
                          type="tel"
                          placeholder="+52 555 1234567"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          {...register('email')}
                          id="email"
                          type="email"
                          placeholder="paciente@ejemplo.com"
                          className={errors.email ? 'border-destructive' : ''}
                        />
                        {errors.email && (
                          <p className="text-sm text-destructive">{errors.email.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Dirección</Label>
                      <Input
                        {...register('address')}
                        id="address"
                        placeholder="Calle Principal 123, Colonia Centro"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Información Médica */}
              <div className="rounded-lg border bg-card">
                <button
                  type="button"
                  onClick={() => toggleSection('medicalInfo')}
                  className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors rounded-t-lg"
                >
                  <div className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Información Médica</span>
                    <span className="text-xs text-muted-foreground">(Opcional)</span>
                  </div>
                  {openSections.medicalInfo ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
                {openSections.medicalInfo && (
                  <div className="space-y-4 p-4 pt-0">
                    <div className="space-y-2">
                      <Label htmlFor="bloodType">Tipo de Sangre</Label>
                      <select
                        {...register('bloodType')}
                        id="bloodType"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="">Seleccionar</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>

                    <div className="space-y-3 pt-2">
                      <Label className="text-base font-semibold">Seguro Médico</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="insuranceInsurer">Aseguradora</Label>
                          <Input
                            {...register('insuranceInsurer')}
                            id="insuranceInsurer"
                            placeholder="Nombre de la aseguradora"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="insurancePolicyNumber">Número de Póliza</Label>
                          <Input
                            {...register('insurancePolicyNumber')}
                            id="insurancePolicyNumber"
                            placeholder="Número de póliza"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="insuranceHolderName">Nombre del Titular</Label>
                          <Input
                            {...register('insuranceHolderName')}
                            id="insuranceHolderName"
                            placeholder="Nombre completo del titular"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="insuranceRelationship">Parentesco del Paciente</Label>
                          <select
                            {...register('insuranceRelationship')}
                            id="insuranceRelationship"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          >
                            <option value="">Seleccionar</option>
                            <option value="Titular">Titular</option>
                            <option value="Esposo(a)">Esposo(a)</option>
                            <option value="Hijo(a)">Hijo(a)</option>
                            <option value="Otro">Otro</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="medicalHistory">Historial Médico</Label>
                      <textarea
                        {...register('medicalHistory')}
                        id="medicalHistory"
                        rows={3}
                        placeholder="Antecedentes médicos relevantes..."
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="allergies">Alergias</Label>
                      <textarea
                        {...register('allergies')}
                        id="allergies"
                        rows={2}
                        placeholder="Alergias conocidas..."
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Contacto de Emergencia */}
              <div className="rounded-lg border bg-card">
                <button
                  type="button"
                  onClick={() => toggleSection('emergencyContact')}
                  className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors rounded-t-lg"
                >
                  <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Contacto de Emergencia</span>
                    <span className="text-xs text-muted-foreground">(Opcional)</span>
                  </div>
                  {openSections.emergencyContact ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
                {openSections.emergencyContact && (
                  <div className="space-y-4 p-4 pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="emergencyContactName">Nombre del Contacto</Label>
                        <Input
                          {...register('emergencyContactName')}
                          id="emergencyContactName"
                          placeholder="María García"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="emergencyContactRelationship">Parentesco</Label>
                        <Input
                          {...register('emergencyContactRelationship')}
                          id="emergencyContactRelationship"
                          placeholder="Madre, Esposo/a, Hermano/a..."
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactPhone">Teléfono de Emergencia</Label>
                      <Input
                        {...register('emergencyContactPhone')}
                        id="emergencyContactPhone"
                        type="tel"
                        placeholder="+52 555 9876543"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Notas Adicionales */}
              <div className="rounded-lg border bg-card">
                <button
                  type="button"
                  onClick={() => toggleSection('additionalInfo')}
                  className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors rounded-t-lg"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Notas Adicionales</span>
                    <span className="text-xs text-muted-foreground">(Opcional)</span>
                  </div>
                  {openSections.additionalInfo ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
                {openSections.additionalInfo && (
                  <div className="space-y-4 p-4 pt-0">
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notas</Label>
                      <textarea
                        {...register('notes')}
                        id="notes"
                        rows={3}
                        placeholder="Notas adicionales sobre el paciente..."
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      />
                    </div>
                  </div>
                )}
              </div>

              <ClinicalHistoryForm
                clinicalHistory={clinicalHistory}
                onClinicalHistoryChange={setClinicalHistory}
                config={configData?.data}
              />

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex-1"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {updateMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/pacientes/${id}`)}
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
