'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';
import { ArrowLeft, Edit, Calendar, FileText } from 'lucide-react';
import { pacienteService } from '@/services/paciente.service';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

export default function PacienteDetailPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

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

  const { data: historyData } = useQuery({
    queryKey: ['paciente-history', id],
    queryFn: () => pacienteService.getPacienteHistory(id),
    enabled: !!user && !!id,
  });

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

  const paciente = pacienteData.data;
  const citas = historyData?.data?.citas || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push('/pacientes')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Pacientes
          </Button>
          <Button onClick={() => router.push(`/pacientes/${id}/editar`)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{paciente.fullName}</CardTitle>
                <CardDescription>
                  Paciente registrado el {new Date(paciente.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Edad</p>
                    <p className="text-base">{paciente.age || 'No especificada'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Género</p>
                    <p className="text-base capitalize">{paciente.gender || 'No especificado'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
                    <p className="text-base">{paciente.phone || 'No especificado'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="text-base">{paciente.email || 'No especificado'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Dirección</p>
                  <p className="text-base">{paciente.address || 'No especificada'}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Información Médica
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Historial Médico</p>
                  <p className="text-base whitespace-pre-wrap">
                    {paciente.medicalHistory || 'Sin historial médico registrado'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Alergias</p>
                  <p className="text-base whitespace-pre-wrap">
                    {paciente.allergies || 'Sin alergias registradas'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Notas</p>
                  <p className="text-base whitespace-pre-wrap">
                    {paciente.notes || 'Sin notas adicionales'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Historial de Citas
                </CardTitle>
                <CardDescription>
                  {citas.length} cita{citas.length !== 1 ? 's' : ''} registrada{citas.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {citas.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay citas registradas
                  </p>
                ) : (
                  <div className="space-y-3">
                    {citas.slice(0, 5).map((cita: any) => (
                      <div key={cita.id} className="border-l-2 border-primary pl-3 py-2">
                        <p className="text-sm font-medium">
                          {new Date(cita.date).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">{cita.time}</p>
                        <p className="text-xs text-muted-foreground capitalize">{cita.estado}</p>
                      </div>
                    ))}
                    {citas.length > 5 && (
                      <p className="text-xs text-muted-foreground text-center pt-2">
                        Y {citas.length - 5} más...
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href={`/citas/nueva?pacienteId=${id}`}>
                    <Calendar className="mr-2 h-4 w-4" />
                    Nueva Cita
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href={`/pacientes/${id}/historial`}>
                    <FileText className="mr-2 h-4 w-4" />
                    Ver Historial Completo
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
