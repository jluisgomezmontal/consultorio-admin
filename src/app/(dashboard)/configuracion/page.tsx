'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useConsultorio } from '@/contexts/ConsultorioContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Building2, User as UserIcon, Users, Save, Upload, Eye, EyeOff, Stethoscope, FileText, Plus, Trash2, AlertCircle, ShieldAlert, Calendar, Download, FileJson, FileSpreadsheet } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { consultorioService } from '@/services/consultorio.service';
import { userService } from '@/services/user.service';
import { usePaquete } from '@/hooks/usePaquete';
import Image from 'next/image';
import { UserPhotoUpload } from '@/components/UserPhotoUpload';
import { TeamMemberPhotoUpload } from '@/components/TeamMemberPhotoUpload';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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

const createReceptionistSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type ConsultorioFormData = z.infer<typeof consultorioSchema>;
type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;
type ReceptionistFormData = z.infer<typeof receptionistSchema>;
type CreateReceptionistFormData = z.infer<typeof createReceptionistSchema>;

export default function ConfiguracionPage() {
  const { user, loading: authLoading } = useAuth();
  const { selectedConsultorio } = useConsultorio();
  const { paqueteInfo, refetch: refetchPaquete } = usePaquete();
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
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteReceptionistId, setDeleteReceptionistId] = useState<string | null>(null);
  const [equipoSubTab, setEquipoSubTab] = useState<'doctores' | 'recepcionistas'>('doctores');
  const [isCreateDoctorDialogOpen, setIsCreateDoctorDialogOpen] = useState(false);
  const [deleteDoctorId, setDeleteDoctorId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const [clinicalHistoryConfig, setClinicalHistoryConfig] = useState({
    antecedentesHeredofamiliares: true,
    antecedentesPersonalesPatologicos: true,
    antecedentesPersonalesNoPatologicos: true,
    ginecoObstetricos: true,
  });

  const [permissions, setPermissions] = useState({
    allowReceptionistViewClinicalSummary: false,
  });

  const [appointmentSectionsConfig, setAppointmentSectionsConfig] = useState({
    signosVitales: true,
    evaluacionMedica: true,
    diagnosticoTratamiento: true,
    medicamentos: true,
    notasAdicionales: true,
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

  const { data: doctorsData } = useQuery({
    queryKey: ['doctors', consultorioId],
    queryFn: () => userService.getDoctorsByConsultorio(consultorioId || ''),
    enabled: !!consultorioId,
  });

  const { data: clinicalHistoryConfigData } = useQuery({
    queryKey: ['consultorio-config', consultorioId],
    queryFn: () => consultorioService.getClinicalHistoryConfig(consultorioId || ''),
    enabled: !!consultorioId,
  });

  const { data: appointmentSectionsConfigData } = useQuery({
    queryKey: ['consultorio-appointment-sections-config', consultorioId],
    queryFn: () => consultorioService.getAppointmentSectionsConfig(consultorioId || ''),
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
      const imageUrl = consultorioData.data.imageUrl || 'https://miconsultorioapp.com/miconsultorio.svg';
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
    if (appointmentSectionsConfigData?.data) {
      setAppointmentSectionsConfig(appointmentSectionsConfigData.data);
    }
  }, [appointmentSectionsConfigData]);

  useEffect(() => {
    if (consultorioData?.data?.recetaTemplate) {
      setSelectedTemplate(consultorioData.data.recetaTemplate as 'template1' | 'template2' | 'template3' | 'template4' | 'template5');
    }
  }, [consultorioData]);

  useEffect(() => {
    if (consultorioData?.data?.permissions) {
      setPermissions(consultorioData.data.permissions);
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

  const updatePermissionsMutation = useMutation({
    mutationFn: () => consultorioService.updatePermissions(consultorioId || '', permissions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultorio', consultorioId] });
      setSuccess('Permisos actualizados exitosamente');
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Error al actualizar permisos');
      setSuccess('');
    },
  });

  const updateAppointmentSectionsConfigMutation = useMutation({
    mutationFn: () => consultorioService.updateAppointmentSectionsConfig(consultorioId || '', appointmentSectionsConfig),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultorio-appointment-sections-config', consultorioId] });
      queryClient.invalidateQueries({ queryKey: ['consultorio', consultorioId] });
      setSuccess('Configuración de secciones de cita actualizada exitosamente');
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Error al actualizar configuración de secciones');
      setSuccess('');
    },
  });

  const createReceptionistMutation = useMutation({
    mutationFn: (data: CreateReceptionistFormData) =>
      userService.createReceptionist({
        name: data.name,
        email: data.email,
        password: data.password,
        consultoriosIds: [consultorioId || ''],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receptionists', consultorioId] });
      refetchPaquete();
      setSuccess('Miembro del equipo creado exitosamente');
      setError('');
      setIsCreateDialogOpen(false);
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Error al crear miembro del equipo');
      setSuccess('');
    },
  });

  const deleteReceptionistMutation = useMutation({
    mutationFn: (id: string) => userService.deleteReceptionist(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receptionists', consultorioId] });
      refetchPaquete();
      setSuccess('Miembro del equipo eliminado exitosamente');
      setError('');
      setDeleteReceptionistId(null);
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Error al eliminar miembro del equipo');
      setSuccess('');
      setDeleteReceptionistId(null);
    },
  });

  const createDoctorMutation = useMutation({
    mutationFn: (data: CreateReceptionistFormData) =>
      userService.createDoctor({
        name: data.name,
        email: data.email,
        password: data.password,
        consultoriosIds: [consultorioId || ''],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors', consultorioId] });
      refetchPaquete();
      setSuccess('Doctor creado exitosamente');
      setError('');
      setIsCreateDoctorDialogOpen(false);
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Error al crear doctor');
      setSuccess('');
    },
  });

  const updateDoctorMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReceptionistFormData }) =>
      userService.updateDoctor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors', consultorioId] });
      setSuccess('Doctor actualizado exitosamente');
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Error al actualizar doctor');
      setSuccess('');
    },
  });

  const deleteDoctorMutation = useMutation({
    mutationFn: (id: string) => userService.deleteDoctor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors', consultorioId] });
      refetchPaquete();
      setSuccess('Doctor eliminado exitosamente');
      setError('');
      setDeleteDoctorId(null);
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Error al eliminar doctor');
      setSuccess('');
      setDeleteDoctorId(null);
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

  const handleExportJSON = async () => {
    if (!consultorioId) return;
    try {
      setIsExporting(true);
      setError('');
      await consultorioService.exportDataAsJSON(consultorioId);
      setSuccess('Datos exportados exitosamente en formato JSON');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al exportar datos');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async () => {
    if (!consultorioId) return;
    try {
      setIsExporting(true);
      setError('');
      await consultorioService.exportDataAsExcel(consultorioId);
      setSuccess('Datos exportados exitosamente en formato Excel');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al exportar datos');
    } finally {
      setIsExporting(false);
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

  const handleDoctorSubmit = (doctor: any) => {
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
      updateDoctorMutation.mutate({ id: doctor.id, data: cleanData });
    };
  };

  const onSubmitClinicalHistoryConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    updateClinicalHistoryConfigMutation.mutate();
  };

  const onSubmitAppointmentSectionsConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    updateAppointmentSectionsConfigMutation.mutate();
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
    <div className="bg-background flex-1 flex flex-col min-h-screen overflow-x-hidden">
      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8 flex-1 w-full overflow-x-hidden">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Configuración</h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <div className="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto">
            <TabsList className="inline-flex w-auto lg:grid lg:w-full lg:grid-cols-5 h-auto flex-nowrap">
              <TabsTrigger value="consultorio" className="flex items-center gap-2 whitespace-nowrap px-3 sm:px-4">
                <Building2 className="h-4 w-4 flex-shrink-0" />
                <span>Consultorio</span>
              </TabsTrigger>
              <TabsTrigger value="recetas" className="flex items-center gap-2 whitespace-nowrap px-3 sm:px-4">
                <FileText className="h-4 w-4 flex-shrink-0" />
                <span>Recetas</span>
              </TabsTrigger>
              <TabsTrigger value="historia" className="flex items-center gap-2 whitespace-nowrap px-3 sm:px-4">
                <Stethoscope className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline">Clínica y Permisos</span>
                <span className="sm:hidden">Clínica</span>
              </TabsTrigger>
              <TabsTrigger value="perfil" className="flex items-center gap-2 whitespace-nowrap px-3 sm:px-4">
                <UserIcon className="h-4 w-4 flex-shrink-0" />
                <span>Mi Perfil</span>
              </TabsTrigger>
              <TabsTrigger value="recepcionistas" className="flex items-center gap-2 whitespace-nowrap px-3 sm:px-4">
                <Users className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline">Equipo</span>
                <span className="sm:hidden">Equipo</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="consultorio" className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader className="space-y-1 sm:space-y-1.5">
                <CardTitle className="text-xl sm:text-2xl">Información del Consultorio</CardTitle>
                <CardDescription className="text-sm">
                  Actualiza los datos básicos de tu consultorio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitConsultorio(onSubmitConsultorio)} className="space-y-4 sm:space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="image" className="text-sm sm:text-base">Imagen del Consultorio</Label>
                      <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                        <div className="flex-shrink-0 mx-auto sm:mx-0">
                          {imagePreview ? (
                            <div className="relative h-24 w-24 sm:h-32 sm:w-32 rounded-lg overflow-hidden border-2 border-border">
                              <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                              <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 w-full">
                          <Input
                            id="image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="cursor-pointer text-sm"
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

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Exportar Datos del Consultorio</CardTitle>
                <CardDescription>
                  Descarga todos los datos asociados al consultorio para migración o respaldo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <div className="mb-4">
                      <h3 className="font-medium mb-1">Formato JSON</h3>
                      <p className="text-sm text-muted-foreground">
                        Exporta todos los datos en formato JSON para migración o integración con otros sistemas
                      </p>
                    </div>
                    <Button
                      onClick={handleExportJSON}
                      disabled={isExporting}
                      variant="outline"
                      className="w-full sm:w-auto"
                    >
                      <FileJson className="mr-2 h-4 w-4" />
                      {isExporting ? 'Exportando...' : 'Exportar como JSON'}
                    </Button>
                  </div>

                  {/* <div className="rounded-lg border p-4">
                    <div className="mb-4">
                      <h3 className="font-medium mb-1">Formato Excel</h3>
                      <p className="text-sm text-muted-foreground">
                        Exporta todos los datos en formato Excel (.xlsx) para análisis y visualización
                      </p>
                    </div>
                    <Button
                      onClick={handleExportExcel}
                      disabled={isExporting}
                      variant="outline"
                      className="w-full sm:w-auto"
                    >
                      <FileSpreadsheet className="mr-2 h-4 w-4" />
                      {isExporting ? 'Exportando...' : 'Exportar como Excel'}
                    </Button>
                  </div> */}

                  <div className="rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-4">
                    <div className="flex gap-2">
                      <Download className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">Datos incluidos en la exportación</h4>
                        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                          <li>• Información del consultorio</li>
                          <li>• Pacientes y sus historias clínicas</li>
                          <li>• Citas y consultas médicas</li>
                          <li>• Usuarios y personal médico</li>
                          <li>• Alergias a medicamentos</li>
                          <li>• Pagos y transacciones</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
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
                <div className="space-y-4 sm:space-y-6">
                  <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                    {/* Template 1 - Green Professional */}
                    <button
                      onClick={() => handleTemplateSelect('template1')}
                      disabled={updateRecetaTemplateMutation.isPending}
                      className={`relative group rounded-lg border-2 p-3 sm:p-4 transition-all hover:shadow-lg ${
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
                      <div className="aspect-[3/2] rounded bg-white mb-2 sm:mb-3 overflow-hidden border-l-4 border-l-[#3eb8c4] border border-gray-200">
                        <div className="p-1.5 sm:p-2 text-xs">
                          <div className="flex items-center gap-1 mb-1 pb-1 border-b border-gray-200">
                            <div className="w-3 h-3 rounded-full bg-[#3eb8c4] flex-shrink-0"></div>
                            <div className="flex-1">
                              <div className="font-semibold text-[9px] text-gray-800">Consultorio</div>
                              <div className="text-[8px] text-[#3eb8c4] font-medium">Dr. Nombre</div>
                            </div>
                          </div>
                          <div className="text-[7px] bg-gray-50 rounded px-1 py-0.5 mb-1">
                            <span className="text-gray-500">Paciente:</span> <span className="font-medium">José García</span>
                          </div>
                          <div className="text-[7px] space-y-0.5">
                            <div className="font-semibold text-gray-700 uppercase text-[6px] tracking-wide">Prescripción</div>
                            <div className="border-l-2 border-[#3eb8c4] bg-gray-50 pl-1 py-0.5">
                              <div className="font-medium text-gray-800">Amoxicilina</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-sm sm:text-base">Turquesa Lateral</div>
                        <div className="text-xs text-muted-foreground hidden sm:block">Moderno y limpio</div>
                      </div>
                    </button>

                    {/* Template 2 - Blue Professional */}
                    <button
                      onClick={() => handleTemplateSelect('template2')}
                      disabled={updateRecetaTemplateMutation.isPending}
                      className={`relative group rounded-lg border-2 p-3 sm:p-4 transition-all hover:shadow-lg ${
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
                      <div className="aspect-[3/2] rounded bg-white mb-2 sm:mb-3 overflow-hidden border-l-4 border-l-[#3eb8c4] border border-gray-200">
                        <div className="p-1.5 sm:p-2 text-xs">
                          <div className="flex items-center gap-1 mb-1 pb-1 border-b border-gray-200">
                            <div className="w-4 h-4 rounded bg-[#3eb8c4] flex-shrink-0"></div>
                            <div className="flex-1 text-center">
                              <div className="font-semibold text-[9px] text-gray-800">Consultorio</div>
                              <div className="text-[8px] text-[#3eb8c4] font-medium">Dr. Nombre</div>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-0.5 text-[6px] bg-gray-50 rounded p-1 mb-1">
                            <div><span className="text-gray-500">Paciente</span></div>
                            <div><span className="text-gray-500">Edad</span></div>
                            <div><span className="text-gray-500">Fecha</span></div>
                          </div>
                          <div className="text-[7px] space-y-0.5">
                            <div className="font-semibold text-gray-700 uppercase text-[6px]">Prescripción</div>
                            <div className="border-l-2 border-[#3eb8c4] bg-gray-50 pl-1 py-0.5 text-[6px]">
                              <div className="font-medium">Ibuprofeno</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-sm sm:text-base">Turquesa Centrado</div>
                        <div className="text-xs text-muted-foreground hidden sm:block">Compacto y elegante</div>
                      </div>
                    </button>

                    {/* Template 3 - Elegant Minimal */}
                    <button
                      onClick={() => handleTemplateSelect('template3')}
                      disabled={updateRecetaTemplateMutation.isPending}
                      className={`relative group rounded-lg border-2 p-3 sm:p-4 transition-all hover:shadow-lg ${
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
                      <div className="aspect-[3/2] rounded bg-white mb-2 sm:mb-3 overflow-hidden border-l-4 border-l-[#4dd4e0] border border-gray-200">
                        <div className="p-1.5 sm:p-2 text-xs">
                          <div className="flex items-center gap-1 mb-1 pb-1 border-b border-gray-200">
                            <div className="w-3 h-3 rounded-full bg-[#4dd4e0] flex-shrink-0"></div>
                            <div className="flex-1">
                              <div className="font-semibold text-[9px] text-gray-800">Consultorio</div>
                              <div className="text-[8px] text-[#4dd4e0] font-medium">Dr. Nombre</div>
                            </div>
                          </div>
                          <div className="text-[7px] bg-gray-50 rounded px-1 py-0.5 mb-1">
                            <span className="text-gray-500">Paciente:</span> <span className="font-medium">Ana López</span>
                          </div>
                          <div className="text-[7px] space-y-0.5">
                            <div className="font-semibold text-gray-700 uppercase text-[6px] tracking-wide">Prescripción</div>
                            <div className="border-l-2 border-[#4dd4e0] bg-gray-50 pl-1 py-0.5">
                              <div className="font-medium text-gray-800">Paracetamol</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-sm sm:text-base">Turquesa Brillante</div>
                        <div className="text-xs text-muted-foreground hidden sm:block">Dark mode style</div>
                      </div>
                    </button>

                    {/* Template 4 - Purple Modern */}
                    <button
                      onClick={() => handleTemplateSelect('template4')}
                      disabled={updateRecetaTemplateMutation.isPending}
                      className={`relative group rounded-lg border-2 p-3 sm:p-4 transition-all hover:shadow-lg ${
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
                      <div className="aspect-[3/2] rounded bg-white mb-2 sm:mb-3 overflow-hidden border-2 border-gray-200">
                        <div className="p-1.5 sm:p-2 text-xs">
                          <div className="flex items-center gap-1 mb-1 pb-0.5 border-b border-gray-200">
                            <div className="w-3 h-3 rounded-full bg-gray-300 flex-shrink-0"></div>
                            <div className="flex-1">
                              <div className="font-semibold text-[9px] text-gray-800">Consultorio</div>
                              <div className="text-[8px] text-gray-600 font-medium">Dr. Nombre</div>
                            </div>
                          </div>
                          <div className="grid grid-cols-4 gap-0.5 text-[6px] py-0.5 mb-0.5">
                            <div className="text-gray-500">Paciente</div>
                            <div className="text-gray-500">Edad</div>
                            <div className="text-gray-500">Sexo</div>
                            <div className="text-gray-500">Fecha</div>
                          </div>
                          <div className="text-[7px] space-y-0.5">
                            <div className="font-semibold text-gray-600 uppercase text-[6px]">Prescripción</div>
                            <div className="text-[6px] text-gray-700">
                              <div className="font-medium">Loratadina</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-sm sm:text-base">Bordes Sutiles</div>
                        <div className="text-xs text-muted-foreground hidden sm:block">Minimalista light</div>
                      </div>
                    </button>

                    {/* Template 5 - Coral Professional */}
                    <button
                      onClick={() => handleTemplateSelect('template5')}
                      disabled={updateRecetaTemplateMutation.isPending}
                      className={`relative group rounded-lg border-2 p-3 sm:p-4 transition-all hover:shadow-lg ${
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
                      <div className="aspect-[3/2] rounded bg-white mb-2 sm:mb-3 overflow-hidden border border-gray-100">
                        <div className="p-1.5 sm:p-2 text-xs">
                          <div className="flex items-center gap-1 mb-1">
                            <div className="w-3 h-3 rounded-full bg-gray-200 flex-shrink-0"></div>
                            <div className="flex-1">
                              <div className="font-medium text-[9px] text-gray-900">Consultorio</div>
                              <div className="text-[8px] text-gray-600">Dr. Nombre</div>
                            </div>
                          </div>
                          <div className="flex gap-2 text-[6px] py-0.5 mb-0.5 border-b border-gray-100">
                            <div className="text-gray-400 uppercase">Paciente</div>
                            <div className="text-gray-400 uppercase">Edad</div>
                          </div>
                          <div className="text-[7px] space-y-0.5">
                            <div className="font-semibold text-gray-400 uppercase text-[6px] tracking-wider">Prescripción</div>
                            <div className="text-[6px] text-gray-800">
                              <div className="font-medium">Cetirizina</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-sm sm:text-base">Ultra Minimalista</div>
                        <div className="text-xs text-muted-foreground hidden sm:block">Máxima limpieza</div>
                      </div>
                    </button>
                  </div>

                  {updateRecetaTemplateMutation.isPending && (
                    <div className="text-center text-sm text-muted-foreground">
                      Guardando plantilla seleccionada...
                    </div>
                  )}

                  <div className="rounded-lg bg-muted p-3 sm:p-4">
                    <h4 className="font-semibold mb-2 text-sm sm:text-base">💡 Información</h4>
                    <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
                      <li>• La plantilla seleccionada se usará al generar recetas desde las citas</li>
                      <li>• Puedes cambiar la plantilla en cualquier momento</li>
                      <li>• Todas las plantillas incluyen los datos del consultorio, doctor y paciente</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historia" className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader className="space-y-1 sm:space-y-1.5">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl sm:text-2xl">Secciones de Historia Clínica</CardTitle>
                    <CardDescription className="text-sm mt-1">
                      Personaliza qué información deseas capturar en el registro de pacientes
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={onSubmitClinicalHistoryConfig} className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg border p-3 sm:p-4 gap-3 hover:bg-accent/50 transition-colors">
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <Label htmlFor="antecedentesHeredofamiliares" className="text-sm font-medium cursor-pointer">
                          Antecedentes Heredofamiliares
                        </Label>
                        <p className="text-xs text-muted-foreground">
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

                    <div className="flex items-center justify-between rounded-lg border p-3 sm:p-4 gap-3 hover:bg-accent/50 transition-colors">
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <Label htmlFor="antecedentesPersonalesPatologicos" className="text-sm font-medium cursor-pointer">
                          Antecedentes Personales Patológicos
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Cirugías, Hospitalizaciones, Enfermedades Previas
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

                    <div className="flex items-center justify-between rounded-lg border p-3 sm:p-4 gap-3 hover:bg-accent/50 transition-colors">
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <Label htmlFor="antecedentesPersonalesNoPatologicos" className="text-sm font-medium cursor-pointer">
                          Antecedentes Personales No Patológicos
                        </Label>
                        <p className="text-xs text-muted-foreground">
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

                    <div className="flex items-center justify-between rounded-lg border p-3 sm:p-4 gap-3 hover:bg-accent/50 transition-colors">
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <Label htmlFor="ginecoObstetricos" className="text-sm font-medium cursor-pointer">
                          Gineco-obstétricos
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Embarazos, Partos, Cesáreas, Menstruación
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

                  <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between pt-2 border-t">
                    <p className="text-sm text-muted-foreground">
                      Los cambios se aplicarán al registro de nuevos pacientes
                    </p>
                    <Button
                      type="submit"
                      disabled={updateClinicalHistoryConfigMutation.isPending}
                      className="w-full sm:w-auto"
                    >
                      {updateClinicalHistoryConfigMutation.isPending ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Guardar Configuración
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

           

            <Card>
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg sm:text-xl">Secciones de Información de Citas</CardTitle>
                    <CardDescription className="text-sm mt-1">
                      Controla qué secciones se muestran al editar una cita
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={onSubmitAppointmentSectionsConfig} className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg border p-3 sm:p-4 gap-3 hover:bg-accent/50 transition-colors">
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <Label htmlFor="signosVitales" className="text-sm font-medium cursor-pointer">
                          Signos Vitales
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Peso, Presión Arterial, Altura, Cintura, Cadera
                        </p>
                      </div>
                      <Switch
                        id="signosVitales"
                        checked={appointmentSectionsConfig.signosVitales}
                        onCheckedChange={(checked) =>
                          setAppointmentSectionsConfig((prev) => ({ ...prev, signosVitales: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-3 sm:p-4 gap-3 hover:bg-accent/50 transition-colors">
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <Label htmlFor="evaluacionMedica" className="text-sm font-medium cursor-pointer">
                          Evaluación Médica
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Padecimiento Actual, Exploración Física
                        </p>
                      </div>
                      <Switch
                        id="evaluacionMedica"
                        checked={appointmentSectionsConfig.evaluacionMedica}
                        onCheckedChange={(checked) =>
                          setAppointmentSectionsConfig((prev) => ({ ...prev, evaluacionMedica: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-3 sm:p-4 gap-3 hover:bg-accent/50 transition-colors">
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <Label htmlFor="diagnosticoTratamiento" className="text-sm font-medium cursor-pointer">
                          Diagnóstico y Tratamiento
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Diagnóstico, Plan de Tratamiento
                        </p>
                      </div>
                      <Switch
                        id="diagnosticoTratamiento"
                        checked={appointmentSectionsConfig.diagnosticoTratamiento}
                        onCheckedChange={(checked) =>
                          setAppointmentSectionsConfig((prev) => ({ ...prev, diagnosticoTratamiento: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-3 sm:p-4 gap-3 hover:bg-accent/50 transition-colors">
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <Label htmlFor="medicamentos" className="text-sm font-medium cursor-pointer">
                          Medicamentos
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Lista de medicamentos recetados
                        </p>
                      </div>
                      <Switch
                        id="medicamentos"
                        checked={appointmentSectionsConfig.medicamentos}
                        onCheckedChange={(checked) =>
                          setAppointmentSectionsConfig((prev) => ({ ...prev, medicamentos: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-3 sm:p-4 gap-3 hover:bg-accent/50 transition-colors">
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <Label htmlFor="notasAdicionales" className="text-sm font-medium cursor-pointer">
                          Notas Adicionales
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Observaciones y notas generales
                        </p>
                      </div>
                      <Switch
                        id="notasAdicionales"
                        checked={appointmentSectionsConfig.notasAdicionales}
                        onCheckedChange={(checked) =>
                          setAppointmentSectionsConfig((prev) => ({ ...prev, notasAdicionales: checked }))
                        }
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between pt-2 border-t">
                    <p className="text-sm text-muted-foreground">
                      Las secciones desactivadas no se mostrarán al editar citas
                    </p>
                    <Button
                      type="submit"
                      disabled={updateAppointmentSectionsConfigMutation.isPending}
                      className="w-full sm:w-auto"
                    >
                      {updateAppointmentSectionsConfigMutation.isPending ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Guardar Configuración
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
             <Card>
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg sm:text-xl">Permisos de Visualización</CardTitle>
                    <CardDescription className="text-sm mt-1">
                      Controla qué información médica puede ver tu equipo de recepción
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 p-4">
                  <div className="flex items-start gap-3 mb-4">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                        Información importante sobre privacidad
                      </p>
                      <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                        Por defecto, solo los doctores pueden ver y editar información médica sensible. Activa esta opción solo si confías en tu equipo de recepción.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-amber-200 dark:border-amber-800">
                    <div className="flex-1 min-w-0">
                      <Label htmlFor="allowReceptionistViewClinicalSummary" className="text-sm font-medium cursor-pointer">
                        Permitir a recepción ver resumen clínico
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Los recepcionistas podrán <strong>ver</strong> (no editar): evaluación médica, diagnóstico y tratamiento
                      </p>
                    </div>
                    <Switch
                      id="allowReceptionistViewClinicalSummary"
                      checked={permissions.allowReceptionistViewClinicalSummary}
                      onCheckedChange={(checked) => {
                        setPermissions((prev) => ({ ...prev, allowReceptionistViewClinicalSummary: checked }));
                        updatePermissionsMutation.mutate();
                      }}
                      disabled={updatePermissionsMutation.isPending}
                      className="flex-shrink-0"
                    />
                  </div>
                  
                  {updatePermissionsMutation.isPending && (
                    <div className="flex items-center gap-2 mt-3 text-xs text-amber-600 dark:text-amber-400">
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Actualizando permisos...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="perfil" className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader className="space-y-1 sm:space-y-1.5">
                <CardTitle className="text-xl sm:text-2xl">Foto de Perfil</CardTitle>
                <CardDescription className="text-sm">
                  Agrega o actualiza tu foto de perfil
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center py-6">
                {user && (
                  <UserPhotoUpload
                    currentPhotoUrl={user.photoUrl}
                    currentS3Key={user.photoS3Key}
                    userName={user.name}
                    onPhotoChange={() => {
                      queryClient.invalidateQueries({ queryKey: ['user'] });
                    }}
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="space-y-1 sm:space-y-1.5">
                <CardTitle className="text-xl sm:text-2xl">Información Personal</CardTitle>
                <CardDescription className="text-sm">
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
              <CardHeader className="space-y-1 sm:space-y-1.5">
                <CardTitle className="text-xl sm:text-2xl">Cambiar Contraseña</CardTitle>
                <CardDescription className="text-sm">
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

          <TabsContent value="recepcionistas" className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader className="space-y-1 sm:space-y-1.5">
                <CardTitle className="text-xl sm:text-2xl">Equipo del Consultorio</CardTitle>
                <CardDescription className="text-sm mt-1">
                  Gestiona los doctores y recepcionistas de tu consultorio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={equipoSubTab} onValueChange={(value) => setEquipoSubTab(value as 'doctores' | 'recepcionistas')} className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="doctores">Doctores</TabsTrigger>
                    <TabsTrigger value="recepcionistas">Recepcionistas</TabsTrigger>
                  </TabsList>

                  <TabsContent value="doctores" className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1">
                        {paqueteInfo && (
                          <div className="rounded-lg border bg-muted/50 p-3">
                            <div className="flex items-start gap-3">
                              <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                              <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium">
                                  Límite de doctores: {paqueteInfo.uso.doctores.actual} / {paqueteInfo.uso.doctores.limite}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {paqueteInfo.uso.doctores.disponible > 0
                                    ? `Puedes agregar ${paqueteInfo.uso.doctores.disponible} doctor(es) más`
                                    : 'Has alcanzado el límite de tu plan. Actualiza tu suscripción para agregar más doctores.'}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <Dialog open={isCreateDoctorDialogOpen} onOpenChange={setIsCreateDoctorDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            disabled={!paqueteInfo || paqueteInfo.uso.doctores.disponible <= 0}
                            className="w-full sm:w-auto"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Agregar Doctor
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                          <DialogHeader>
                            <DialogTitle>Agregar Doctor</DialogTitle>
                            <DialogDescription>
                              Crea un nuevo doctor para tu consultorio
                            </DialogDescription>
                          </DialogHeader>
                          <CreateReceptionistForm
                            onSubmit={(data) => createDoctorMutation.mutate(data)}
                            isLoading={createDoctorMutation.isPending}
                            onCancel={() => setIsCreateDoctorDialogOpen(false)}
                          />
                        </DialogContent>
                      </Dialog>
                    </div>

                    {doctorsData?.data && doctorsData.data.length > 0 ? (
                      <div className="space-y-4">
                        {doctorsData.data.map((doctor: any) => (
                          <TeamMemberForm
                            key={doctor.id}
                            member={doctor}
                            memberType="doctor"
                            onSubmit={handleDoctorSubmit(doctor)}
                            onDelete={() => setDeleteDoctorId(doctor.id)}
                            isLoading={updateDoctorMutation.isPending}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Stethoscope className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">No hay doctores</h3>
                        <p className="text-sm text-muted-foreground mt-2">
                          Agrega doctores a tu consultorio para que puedan atender pacientes
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="recepcionistas" className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1">
                        {paqueteInfo && (
                          <div className="rounded-lg border bg-muted/50 p-3">
                            <div className="flex items-start gap-3">
                              <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                              <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium">
                                  Límite de recepcionistas: {paqueteInfo.uso.recepcionistas.actual} / {paqueteInfo.uso.recepcionistas.limite}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {paqueteInfo.uso.recepcionistas.disponible > 0
                                    ? `Puedes agregar ${paqueteInfo.uso.recepcionistas.disponible} recepcionista(s) más`
                                    : 'Has alcanzado el límite de tu plan. Actualiza tu suscripción para agregar más recepcionistas.'}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            disabled={!paqueteInfo || paqueteInfo.uso.recepcionistas.disponible <= 0}
                            className="w-full sm:w-auto"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Agregar Recepcionista
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                          <DialogHeader>
                            <DialogTitle>Agregar Recepcionista</DialogTitle>
                            <DialogDescription>
                              Crea un nuevo recepcionista para tu consultorio
                            </DialogDescription>
                          </DialogHeader>
                          <CreateReceptionistForm
                            onSubmit={(data) => createReceptionistMutation.mutate(data)}
                            isLoading={createReceptionistMutation.isPending}
                            onCancel={() => setIsCreateDialogOpen(false)}
                          />
                        </DialogContent>
                      </Dialog>
                    </div>

                    {receptionistsData?.data && receptionistsData.data.length > 0 ? (
                      <div className="space-y-4">
                        {receptionistsData.data.map((receptionist: any) => (
                          <TeamMemberForm
                            key={receptionist.id}
                            member={receptionist}
                            memberType="recepcionista"
                            onSubmit={handleReceptionistSubmit(receptionist)}
                            onDelete={() => setDeleteReceptionistId(receptionist.id)}
                            isLoading={updateReceptionistMutation.isPending}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">No hay recepcionistas</h3>
                        <p className="text-sm text-muted-foreground mt-2">
                          Agrega recepcionistas a tu consultorio para que te ayuden con la gestión
                        </p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <AlertDialog open={!!deleteReceptionistId} onOpenChange={(open) => !open && setDeleteReceptionistId(null)}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Se eliminará permanentemente este recepcionista y perderá acceso al sistema.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteReceptionistId && deleteReceptionistMutation.mutate(deleteReceptionistId)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={!!deleteDoctorId} onOpenChange={(open) => !open && setDeleteDoctorId(null)}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Se eliminará permanentemente este doctor y perderá acceso al sistema.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteDoctorId && deleteDoctorMutation.mutate(deleteDoctorId)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function TeamMemberForm({
  member,
  memberType,
  onSubmit,
  onDelete,
  isLoading,
}: {
  member: any;
  memberType: 'doctor' | 'recepcionista';
  onSubmit: (data: ReceptionistFormData) => void;
  onDelete: () => void;
  isLoading: boolean;
}) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReceptionistFormData>({
    resolver: zodResolver(receptionistSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="border rounded-lg p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
        <div className="flex-shrink-0">
          <TeamMemberPhotoUpload
            userId={member.id}
            currentPhotoUrl={member.photoUrl}
            currentS3Key={member.photoS3Key}
            userName={member.name}
            onPhotoChange={() => {
              queryClient.invalidateQueries({ queryKey: ['users', 'consultorio'] });
            }}
          />
        </div>
        
        <div className="flex-1 min-w-0 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-semibold truncate">{member.name}</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary whitespace-nowrap">
                {memberType === 'doctor' ? 'Doctor' : 'Recepcionista'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground truncate mt-1">{member.email}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="border-t pt-4"></div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`name-${member.id}`}>Nombre</Label>
          <Input
            {...register('name')}
            id={`name-${member.id}`}
            placeholder={member.name}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor={`email-${member.id}`}>Email</Label>
          <Input
            {...register('email')}
            id={`email-${member.id}`}
            type="email"
            placeholder={member.email}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`password-${member.id}`}>Nueva Contraseña</Label>
        <Input
          {...register('password')}
          id={`password-${member.id}`}
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

function CreateReceptionistForm({
  onSubmit,
  onCancel,
  isLoading,
}: {
  onSubmit: (data: CreateReceptionistFormData) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateReceptionistFormData>({
    resolver: zodResolver(createReceptionistSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="create-name">
          Nombre <span className="text-destructive">*</span>
        </Label>
        <Input
          {...register('name')}
          id="create-name"
          placeholder="Ej: María González"
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="create-email">
          Email <span className="text-destructive">*</span>
        </Label>
        <Input
          {...register('email')}
          id="create-email"
          type="email"
          placeholder="maria@ejemplo.com"
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="create-password">
          Contraseña <span className="text-destructive">*</span>
        </Label>
        <Input
          {...register('password')}
          id="create-password"
          type="password"
          placeholder="Mínimo 6 caracteres"
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creando...' : 'Crear Miembro'}
        </Button>
      </DialogFooter>
    </form>
  );
}
