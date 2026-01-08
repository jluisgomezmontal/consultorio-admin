'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';
import { consultorioService } from '@/services/consultorio.service';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Switch } from '@/components/ui/switch';

export default function ConfiguracionConsultorioPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [config, setConfig] = useState({
    antecedentesHeredofamiliares: true,
    antecedentesPersonalesPatologicos: true,
    antecedentesPersonalesNoPatologicos: true,
    ginecoObstetricos: true,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
    if (!authLoading && user && user.role !== 'doctor' && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const { data: configData, isLoading } = useQuery({
    queryKey: ['consultorio-config', id],
    queryFn: () => consultorioService.getClinicalHistoryConfig(id),
    enabled: !!user && !!id,
  });

  useEffect(() => {
    if (configData?.data) {
      setConfig(configData.data);
    }
  }, [configData]);

  const updateMutation = useMutation({
    mutationFn: () => consultorioService.updateClinicalHistoryConfig(id, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultorio-config', id] });
      queryClient.invalidateQueries({ queryKey: ['consultorio', id] });
      setSuccess('Configuración actualizada correctamente');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Error al actualizar configuración');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    updateMutation.mutate();
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

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          onClick={() => router.push(`/consultorios/${id}`)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al Consultorio
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Configuración de Historia Clínica</CardTitle>
            <CardDescription>
              Activa o desactiva las secciones del historial clínico que deseas utilizar en el registro de pacientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4 text-sm text-green-600">
                  {success}
                </div>
              )}

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
                    checked={config.antecedentesHeredofamiliares}
                    onCheckedChange={(checked) =>
                      setConfig((prev) => ({ ...prev, antecedentesHeredofamiliares: checked }))
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
                    checked={config.antecedentesPersonalesPatologicos}
                    onCheckedChange={(checked) =>
                      setConfig((prev) => ({ ...prev, antecedentesPersonalesPatologicos: checked }))
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
                    checked={config.antecedentesPersonalesNoPatologicos}
                    onCheckedChange={(checked) =>
                      setConfig((prev) => ({ ...prev, antecedentesPersonalesNoPatologicos: checked }))
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
                    checked={config.ginecoObstetricos}
                    onCheckedChange={(checked) =>
                      setConfig((prev) => ({ ...prev, ginecoObstetricos: checked }))
                    }
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex-1"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {updateMutation.isPending ? 'Guardando...' : 'Guardar Configuración'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/consultorios/${id}`)}
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
