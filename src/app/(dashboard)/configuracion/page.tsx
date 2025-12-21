'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useConsultorio } from '@/contexts/ConsultorioContext';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Building2, User as UserIcon, Users, Save, Upload, Eye, EyeOff, Stethoscope, FileText, Plus, Trash2 } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { consultorioService } from '@/services/consultorio.service';
import { userService } from '@/services/user.service';
import Image from 'next/image';

const consultorioSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  openHour: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato inválido (HH:mm)').optional().or(z.literal('')),
  closeHour: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato inválido (HH:mm)').optional().or(z.literal('')),
});

const profileSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  cedulas: z.array(z.object({ value: z.string().min(1, 'La cédula no puede estar vacía') })).default([]),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Contraseña actual requerida'),
  newPassword: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirma tu nueva contraseña'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

const receptionistSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional().or(z.literal('')),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional().or(z.literal('')),
});

type ConsultorioFormData = z.infer<typeof consultorioSchema>;
type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;
type ReceptionistFormData = z.infer<typeof receptionistSchema>;

export default function ConfiguracionPage() {
  const { user, loading: authLoading } = useAuth();
  const { selectedConsultorio } = useConsultorio();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('consultorio');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<'template1' | 'template2' | 'template3' | 'template4' | 'template5'>('template1');

  const [clinicalHistoryConfig, setClinicalHistoryConfig] = useState({
    antecedentesHeredofamiliares: true,
    antecedentesPersonalesPatologicos: true,
    antecedentesPersonalesNoPatologicos: true,
    ginecoObstetricos: true,
  });

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'doctor')) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const consultorioId = selectedConsultorio?.id || selectedConsultorio?._id;

  const { data: consultorioData } = useQuery({
    queryKey: ['consultorio', consultorioId],
    queryFn: () => consultorioService.getConsultorioById(consultorioId || ''),
    enabled: !!consultorioId,
  });

  const { data: receptionistsData } = useQuery({
    queryKey: ['receptionists', consultorioId],
    queryFn: () => userService.getReceptionistsByConsultorio(consultorioId || ''),
    enabled: !!consultorioId,
  });

  const { data: clinicalHistoryConfigData } = useQuery({
    queryKey: ['consultorio-config', consultorioId],
    queryFn: () => consultorioService.getClinicalHistoryConfig(consultorioId || ''),
    enabled: !!consultorioId,
  });

  const {
    register: registerConsultorio,
    handleSubmit: handleSubmitConsultorio,
    reset: resetConsultorio,
    formState: { errors: errorsConsultorio },
  } = useForm<ConsultorioFormData>({
    resolver: zodResolver(consultorioSchema),
  });

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    reset: resetProfile,
    control: controlProfile,
    formState: { errors: errorsProfile },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const { fields: cedulasFields, append: appendCedula, remove: removeCedula } = useFieldArray({
    control: controlProfile,
    name: 'cedulas',
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: errorsPassword },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    if (consultorioData?.data) {
      console.log('📋 Consultorio data loaded:', {
        name: consultorioData.data.name,
        imageUrl: consultorioData.data.imageUrl,
        hasImage: !!consultorioData.data.imageUrl,
      });
      
      resetConsultorio({
        name: consultorioData.data.name,
        description: consultorioData.data.description || '',
        address: consultorioData.data.address || '',
        phone: consultorioData.data.phone || '',
        openHour: consultorioData.data.openHour || '',
        closeHour: consultorioData.data.closeHour || '',
      });
      
      // Always set image preview, use default if not available
      const imageUrl = consultorioData.data.imageUrl || 'https://miconsultorio.vercel.app/miconsultorio.svg';
      console.log('🖼️ Setting image preview to:', imageUrl);
      setImagePreview(imageUrl);
    }
  }, [consultorioData, resetConsultorio]);

  useEffect(() => {
    if (user) {
      resetProfile({
        name: user.name,
        email: user.email,
        cedulas: (user.cedulas || []).map(c => ({ value: c })),
      });
    }
  }, [user, resetProfile]);

  useEffect(() => {
    if (clinicalHistoryConfigData?.data) {
      setClinicalHistoryConfig(clinicalHistoryConfigData.data);
    }
  }, [clinicalHistoryConfigData]);

  useEffect(() => {
    if (consultorioData?.data?.recetaTemplate) {
      setSelectedTemplate(consultorioData.data.recetaTemplate as 'template1' | 'template2' | 'template3' | 'template4' | 'template5');
    }
  }, [consultorioData]);

  const updateConsultorioMutation = useMutation({
    mutationFn: (data: { formData: ConsultorioFormData; file?: File }) =>
      consultorioService.updateConsultorioBasicInfo(consultorioId || '', data.formData, data.file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultorio', consultorioId] });
      queryClient.invalidateQueries({ queryKey: ['consultorios'] });
      setSuccess('Consultorio actualizado exitosamente');
      setError('');
      setImageFile(null);
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Error al actualizar consultorio');
      setSuccess('');
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileFormData) => {
      const payload = {
        ...data,
        cedulas: data.cedulas.map(c => c.value),
      };
      return userService.updateOwnProfile(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      setSuccess('Perfil actualizado exitosamente');
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Error al actualizar perfil');
      setSuccess('');
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      userService.updateOwnPassword(data),
    onSuccess: () => {
      resetPassword();
      setSuccess('Contraseña actualizada exitosamente');
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Error al actualizar contraseña');
      setSuccess('');
    },
  });

  const updateReceptionistMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReceptionistFormData }) =>
      userService.updateReceptionist(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receptionists', consultorioId] });
      setSuccess('Recepcionista actualizado exitosamente');
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Error al actualizar recepcionista');
      setSuccess('');
    },
  });

  const updateClinicalHistoryConfigMutation = useMutation({
    mutationFn: () => consultorioService.updateClinicalHistoryConfig(consultorioId || '', clinicalHistoryConfig),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultorio-config', consultorioId] });
      queryClient.invalidateQueries({ queryKey: ['consultorio', consultorioId] });
      setSuccess('Configuración de historia clínica actualizada exitosamente');
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Error al actualizar configuración');
      setSuccess('');
    },
  });

  const updateRecetaTemplateMutation = useMutation({
    mutationFn: (template: 'template1' | 'template2' | 'template3' | 'template4' | 'template5') =>
      consultorioService.updateRecetaTemplate(consultorioId || '', template),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultorio', consultorioId] });
      setSuccess('Plantilla de receta actualizada exitosamente');
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Error al actualizar plantilla');
      setSuccess('');
    },
  });

  const onSubmitConsultorio = (data: ConsultorioFormData) => {
    setError('');
    setSuccess('');
    updateConsultorioMutation.mutate({ formData: data, file: imageFile || undefined });
  };

  const onSubmitProfile = (data: ProfileFormData) => {
    setError('');
    setSuccess('');
    updateProfileMutation.mutate(data);
  };

  const onSubmitPassword = (data: PasswordFormData) => {
    setError('');
    setSuccess('');
    updatePasswordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('La imagen no debe superar 10MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReceptionistSubmit = (receptionist: any) => {
    return (data: ReceptionistFormData) => {
      const cleanData: any = {};
      if (data.name) cleanData.name = data.name;
      if (data.email) cleanData.email = data.email;
      if (data.password) cleanData.password = data.password;

      if (Object.keys(cleanData).length === 0) {
        setError('Debes modificar al menos un campo');
        return;
      }

      setError('');
      setSuccess('');
      updateReceptionistMutation.mutate({ id: receptionist.id, data: cleanData });
    };
  };

  const onSubmitClinicalHistoryConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    updateClinicalHistoryConfigMutation.mutate();
  };

  const handleTemplateSelect = (template: 'template1' | 'template2' | 'template3' | 'template4' | 'template5') => {
    setSelectedTemplate(template);
    setError('');
    setSuccess('');
    updateRecetaTemplateMutation.mutate(template);
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-4 text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'doctor') {
    return null;
  }

  return (
    <div className="bg-background flex-1 flex flex-col min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 flex-1 w-full">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Configuración</h1>
          <p className="text-muted-foreground mt-2">
            Administra tu consultorio, perfil y equipo de trabajo
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-destructive/15 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-md bg-green-500/15 p-4 text-sm text-green-600 dark:text-green-400">
            {success}
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
            <TabsTrigger value="consultorio" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Consultorio</span>
            </TabsTrigger>
            <TabsTrigger value="recetas" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Recetas</span>
            </TabsTrigger>
            <TabsTrigger value="historia" className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4" />
              <span className="hidden sm:inline">Historia Clínica</span>
            </TabsTrigger>
            <TabsTrigger value="perfil" className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Mi Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="recepcionistas" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Recepcionistas</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="consultorio" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información del Consultorio</CardTitle>
                <CardDescription>
                  Actualiza los datos básicos de tu consultorio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitConsultorio(onSubmitConsultorio)} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="image">Imagen del Consultorio</Label>
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          {imagePreview ? (
                            <div className="relative h-32 w-32 rounded-lg overflow-hidden border-2 border-border">
                              <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="h-32 w-32 rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                              <Upload className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <Input
                            id="image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="cursor-pointer"
                          />
                          <p className="text-xs text-muted-foreground mt-2">
                            Si no subes una imagen, se usará el logo de la aplicación
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">
                          Nombre <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          {...registerConsultorio('name')}
                          id="name"
                          placeholder="Consultorio Central"
                        />
                        {errorsConsultorio.name && (
                          <p className="text-sm text-destructive">{errorsConsultorio.name.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Teléfono</Label>
                        <Input
                          {...registerConsultorio('phone')}
                          id="phone"
                          placeholder="+52 555 1234567"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Descripción</Label>
                      <Textarea
                        {...registerConsultorio('description')}
                        id="description"
                        placeholder="Breve descripción de tu consultorio..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Dirección</Label>
                      <Input
                        {...registerConsultorio('address')}
                        id="address"
                        placeholder="Av. Principal 123, Colonia Centro"
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="openHour">Hora de Apertura</Label>
                        <Input
                          {...registerConsultorio('openHour')}
                          id="openHour"
                          placeholder="09:00"
                          type="time"
                        />
                        {errorsConsultorio.openHour && (
                          <p className="text-sm text-destructive">{errorsConsultorio.openHour.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="closeHour">Hora de Cierre</Label>
                        <Input
                          {...registerConsultorio('closeHour')}
                          id="closeHour"
                          placeholder="18:00"
                          type="time"
                        />
                        {errorsConsultorio.closeHour && (
                          <p className="text-sm text-destructive">{errorsConsultorio.closeHour.message}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={updateConsultorioMutation.isPending}
                    className="w-full md:w-auto"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {updateConsultorioMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recetas" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Plantillas de Recetas Médicas</CardTitle>
                <CardDescription>
                  Selecciona la plantilla que deseas usar para generar tus recetas médicas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-5">
                    {/* Template 1 - Green Professional */}
                    <button
                      onClick={() => handleTemplateSelect('template1')}
                      disabled={updateRecetaTemplateMutation.isPending}
                      className={`relative group rounded-lg border-2 p-4 transition-all hover:shadow-lg ${
                        selectedTemplate === 'template1'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {selectedTemplate === 'template1' && (
                        <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      <div className="aspect-[3/4] rounded border-2 border-green-600 bg-white mb-3 overflow-hidden">
                        <div className="p-2 text-xs">
                          <div className="text-center mb-1">
                            <div className="font-bold text-green-600 text-[11px]">CONSULTORIO</div>
                            <div className="text-[9px] text-blue-600 italic">Dr. Nombre</div>
                          </div>
                          <div className="text-[8px] border-t border-b py-1 mb-1">
                            <div>Paciente: Nombre</div>
                          </div>
                          <div className="text-[8px] space-y-1">
                            <div className="font-semibold text-green-600">Diagnóstico</div>
                            <div className="bg-gray-50 p-1">Medicamento 1</div>
                          </div>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">Verde Profesional</div>
                        <div className="text-xs text-muted-foreground">Estilo clásico</div>
                      </div>
                    </button>

                    {/* Template 2 - Blue Professional */}
                    <button
                      onClick={() => handleTemplateSelect('template2')}
                      disabled={updateRecetaTemplateMutation.isPending}
                      className={`relative group rounded-lg border-2 p-4 transition-all hover:shadow-lg ${
                        selectedTemplate === 'template2'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {selectedTemplate === 'template2' && (
                        <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      <div className="aspect-[3/4] rounded border-2 border-blue-600 bg-white mb-3 overflow-hidden">
                        <div className="p-2 text-xs">
                          <div className="text-center mb-1">
                            <div className="font-bold text-blue-600 text-[11px]">CONSULTORIO</div>
                            <div className="text-[9px] text-blue-500 italic">Dr. Nombre</div>
                          </div>
                          <div className="text-[8px] border-t border-b py-1 mb-1">
                            <div>Paciente: Nombre</div>
                          </div>
                          <div className="text-[8px] space-y-1">
                            <div className="font-semibold text-blue-600">Diagnóstico</div>
                            <div className="bg-blue-50 p-1">Medicamento 1</div>
                          </div>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">Azul Profesional</div>
                        <div className="text-xs text-muted-foreground">Formal y confiable</div>
                      </div>
                    </button>

                    {/* Template 3 - Elegant Minimal */}
                    <button
                      onClick={() => handleTemplateSelect('template3')}
                      disabled={updateRecetaTemplateMutation.isPending}
                      className={`relative group rounded-lg border-2 p-4 transition-all hover:shadow-lg ${
                        selectedTemplate === 'template3'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {selectedTemplate === 'template3' && (
                        <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      <div className="aspect-[3/4] rounded border bg-white mb-3 overflow-hidden">
                        <div className="p-2 text-xs">
                          <div className="border-b border-gray-800 pb-1 mb-1">
                            <div className="font-semibold text-[10px]">Consultorio</div>
                          </div>
                          <div className="text-2xl font-light mb-1">℞</div>
                          <div className="text-[8px] space-y-1">
                            <div className="text-gray-500 uppercase text-[7px]">Paciente</div>
                            <div>Nombre</div>
                            <div className="border-t pt-1">
                              <div className="bg-gray-50 p-1 border-l-2 border-gray-800">Med 1</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">Minimalista</div>
                        <div className="text-xs text-muted-foreground">Simple y elegante</div>
                      </div>
                    </button>

                    {/* Template 4 - Purple Modern */}
                    <button
                      onClick={() => handleTemplateSelect('template4')}
                      disabled={updateRecetaTemplateMutation.isPending}
                      className={`relative group rounded-lg border-2 p-4 transition-all hover:shadow-lg ${
                        selectedTemplate === 'template4'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {selectedTemplate === 'template4' && (
                        <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      <div className="aspect-[3/4] rounded border bg-gradient-to-br from-purple-500 to-indigo-500 mb-3 overflow-hidden">
                        <div className="p-2 text-xs text-white">
                          <div className="text-center mb-1">
                            <div className="font-bold text-[11px]">CONSULTORIO</div>
                            <div className="text-[8px] bg-white/20 inline-block px-2 py-0.5 rounded-full mt-1">RECETA</div>
                          </div>
                          <div className="bg-white/10 rounded p-1 text-[8px] mb-1">
                            <div>Paciente: Nombre</div>
                          </div>
                          <div className="text-[8px]">
                            <div className="bg-white/90 text-purple-600 p-1 rounded">Medicamento</div>
                          </div>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">Morado Moderno</div>
                        <div className="text-xs text-muted-foreground">Contemporáneo</div>
                      </div>
                    </button>

                    {/* Template 5 - Coral Professional */}
                    <button
                      onClick={() => handleTemplateSelect('template5')}
                      disabled={updateRecetaTemplateMutation.isPending}
                      className={`relative group rounded-lg border-2 p-4 transition-all hover:shadow-lg ${
                        selectedTemplate === 'template5'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {selectedTemplate === 'template5' && (
                        <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      <div className="aspect-[3/4] rounded border-2 border-red-400 bg-white mb-3 overflow-hidden">
                        <div className="p-2 text-xs">
                          <div className="text-center mb-1">
                            <div className="font-bold text-red-500 text-[11px]">CONSULTORIO</div>
                            <div className="text-[9px] text-red-600 font-semibold">Dr. Nombre</div>
                          </div>
                          <div className="bg-red-50 border border-red-200 rounded p-1 text-[8px] mb-1">
                            Paciente: Nombre
                          </div>
                          <div className="text-center text-3xl text-red-100 my-1">℞</div>
                          <div className="text-[8px]">
                            <div className="bg-red-50 p-1 rounded border-l-2 border-red-500">Med 1</div>
                          </div>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">Coral Profesional</div>
                        <div className="text-xs text-muted-foreground">Cálido y acogedor</div>
                      </div>
                    </button>
                  </div>

                  {updateRecetaTemplateMutation.isPending && (
                    <div className="text-center text-sm text-muted-foreground">
                      Guardando plantilla seleccionada...
                    </div>
                  )}

                  <div className="rounded-lg bg-muted p-4">
                    <h4 className="font-semibold mb-2">💡 Información</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• La plantilla seleccionada se usará al generar recetas desde las citas</li>
                      <li>• Puedes cambiar la plantilla en cualquier momento</li>
                      <li>• Todas las plantillas incluyen los datos del consultorio, doctor y paciente</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historia" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Historia Clínica</CardTitle>
                <CardDescription>
                  Activa o desactiva las secciones del historial clínico que deseas utilizar en el registro de pacientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={onSubmitClinicalHistoryConfig} className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <Label htmlFor="antecedentesHeredofamiliares" className="text-base font-medium">
                          Antecedentes Heredofamiliares
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Diabetes, Hipertensión, Cáncer, Cardiopatías
                        </p>
                      </div>
                      <Switch
                        id="antecedentesHeredofamiliares"
                        checked={clinicalHistoryConfig.antecedentesHeredofamiliares}
                        onCheckedChange={(checked) =>
                          setClinicalHistoryConfig((prev) => ({ ...prev, antecedentesHeredofamiliares: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <Label htmlFor="antecedentesPersonalesPatologicos" className="text-base font-medium">
                          Antecedentes Personales Patológicos
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Cirugías, Hospitalizaciones
                        </p>
                      </div>
                      <Switch
                        id="antecedentesPersonalesPatologicos"
                        checked={clinicalHistoryConfig.antecedentesPersonalesPatologicos}
                        onCheckedChange={(checked) =>
                          setClinicalHistoryConfig((prev) => ({ ...prev, antecedentesPersonalesPatologicos: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <Label htmlFor="antecedentesPersonalesNoPatologicos" className="text-base font-medium">
                          Antecedentes Personales No Patológicos
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Tabaquismo, Alcoholismo, Actividad Física, Vacunas
                        </p>
                      </div>
                      <Switch
                        id="antecedentesPersonalesNoPatologicos"
                        checked={clinicalHistoryConfig.antecedentesPersonalesNoPatologicos}
                        onCheckedChange={(checked) =>
                          setClinicalHistoryConfig((prev) => ({ ...prev, antecedentesPersonalesNoPatologicos: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <Label htmlFor="ginecoObstetricos" className="text-base font-medium">
                          Gineco-obstétricos
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Embarazos, Partos, Cesáreas
                        </p>
                      </div>
                      <Switch
                        id="ginecoObstetricos"
                        checked={clinicalHistoryConfig.ginecoObstetricos}
                        onCheckedChange={(checked) =>
                          setClinicalHistoryConfig((prev) => ({ ...prev, ginecoObstetricos: checked }))
                        }
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={updateClinicalHistoryConfigMutation.isPending}
                    className="w-full md:w-auto"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {updateClinicalHistoryConfigMutation.isPending ? 'Guardando...' : 'Guardar Configuración'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="perfil" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información Personal</CardTitle>
                <CardDescription>
                  Actualiza tu nombre y email
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="profile-name">
                      Nombre <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      {...registerProfile('name')}
                      id="profile-name"
                      placeholder="Dr. Juan Pérez"
                    />
                    {errorsProfile.name && (
                      <p className="text-sm text-destructive">{errorsProfile.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profile-email">
                      Email <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      {...registerProfile('email')}
                      id="profile-email"
                      type="email"
                      placeholder="doctor@example.com"
                    />
                    {errorsProfile.email && (
                      <p className="text-sm text-destructive">{errorsProfile.email.message}</p>
                    )}
                  </div>

                  {user?.role === 'doctor' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-base">Cédulas Profesionales</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => appendCedula({ value: '' })}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Agregar Cédula
                        </Button>
                      </div>
                      
                      {cedulasFields.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                          No hay cédulas profesionales registradas. Haz clic en &quot;Agregar Cédula&quot; para añadir una.
                        </p>
                      )}

                      {cedulasFields.map((field, index) => (
                        <div key={field.id} className="flex gap-2">
                          <Input
                            {...registerProfile(`cedulas.${index}.value` as const)}
                            placeholder="Ej: 12345678"
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeCedula(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                      {errorsProfile.cedulas && (
                        <p className="text-sm text-destructive">
                          {errorsProfile.cedulas.message || 'Error en las cédulas'}
                        </p>
                      )}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="w-full md:w-auto"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {updateProfileMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cambiar Contraseña</CardTitle>
                <CardDescription>
                  Actualiza tu contraseña de acceso
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">
                      Contraseña Actual <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        {...registerPassword('currentPassword')}
                        id="currentPassword"
                        type={showCurrentPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {errorsPassword.currentPassword && (
                      <p className="text-sm text-destructive">{errorsPassword.currentPassword.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">
                      Nueva Contraseña <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        {...registerPassword('newPassword')}
                        id="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {errorsPassword.newPassword && (
                      <p className="text-sm text-destructive">{errorsPassword.newPassword.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      Confirmar Nueva Contraseña <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      {...registerPassword('confirmPassword')}
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                    />
                    {errorsPassword.confirmPassword && (
                      <p className="text-sm text-destructive">{errorsPassword.confirmPassword.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={updatePasswordMutation.isPending}
                    className="w-full md:w-auto"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {updatePasswordMutation.isPending ? 'Actualizando...' : 'Cambiar Contraseña'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recepcionistas" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recepcionistas del Consultorio</CardTitle>
                <CardDescription>
                  Gestiona los datos de tus recepcionistas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {receptionistsData?.data && receptionistsData.data.length > 0 ? (
                  <div className="space-y-6">
                    {receptionistsData.data.map((receptionist: any) => (
                      <ReceptionistForm
                        key={receptionist.id}
                        receptionist={receptionist}
                        onSubmit={handleReceptionistSubmit(receptionist)}
                        isLoading={updateReceptionistMutation.isPending}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No hay recepcionistas</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      No hay recepcionistas asignados a este consultorio
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function ReceptionistForm({
  receptionist,
  onSubmit,
  isLoading,
}: {
  receptionist: any;
  onSubmit: (data: ReceptionistFormData) => void;
  isLoading: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReceptionistFormData>({
    resolver: zodResolver(receptionistSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="border rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">{receptionist.name}</h3>
          <p className="text-sm text-muted-foreground">{receptionist.email}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`name-${receptionist.id}`}>Nombre</Label>
          <Input
            {...register('name')}
            id={`name-${receptionist.id}`}
            placeholder={receptionist.name}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor={`email-${receptionist.id}`}>Email</Label>
          <Input
            {...register('email')}
            id={`email-${receptionist.id}`}
            type="email"
            placeholder={receptionist.email}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`password-${receptionist.id}`}>Nueva Contraseña</Label>
        <Input
          {...register('password')}
          id={`password-${receptionist.id}`}
          type="password"
          placeholder="Dejar en blanco para no cambiar"
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Solo completa este campo si deseas cambiar la contraseña
        </p>
      </div>

      <Button type="submit" disabled={isLoading} size="sm">
        <Save className="mr-2 h-4 w-4" />
        {isLoading ? 'Guardando...' : 'Actualizar'}
      </Button>
    </form>
  );
}
