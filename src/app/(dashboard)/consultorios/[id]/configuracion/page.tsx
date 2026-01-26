'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Download, FileJson, FileSpreadsheet } from 'lucide-react';
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
  const [isExporting, setIsExporting] = useState(false);

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

  const handleExportJSON = async () => {
    try {
      setIsExporting(true);
      setError('');
      await consultorioService.exportDataAsJSON(id);
      setSuccess('Datos exportados exitosamente en formato JSON');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al exportar datos');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      setError('');
      await consultorioService.exportDataAsExcel(id);
      setSuccess('Datos exportados exitosamente en formato Excel');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al exportar datos');
    } finally {
      setIsExporting(false);
    }
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

        <Card className="mt-6">
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

              <div className="rounded-lg border p-4">
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
              </div>

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
      </main>
    </div>
  );
}
