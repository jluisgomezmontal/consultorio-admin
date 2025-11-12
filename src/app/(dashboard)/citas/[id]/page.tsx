'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';
import { citaService, CitaEstado } from '@/services/cita.service';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit,
  CalendarDays,
  Clock,
  Stethoscope,
  UserRound,
  Building2,
  FileText,
  ClipboardSignature,
  Coins,
  StickyNote,
  Trash2,
} from 'lucide-react';

const estadoLabels: Record<CitaEstado, string> = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  completada: 'Completada',
  cancelada: 'Cancelada',
};

export default function CitaDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  const { data, isLoading } = useQuery({
    queryKey: ['cita', id],
    queryFn: () => citaService.getCitaById(id),
    enabled: !!user && !!id,
  });

  const cancelMutation = useMutation({
    mutationFn: () => citaService.cancelCita(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['citas'] });
      queryClient.invalidateQueries({ queryKey: ['cita', id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => citaService.deleteCita(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['citas'] });
      router.push('/citas');
    },
  });

  const handleCancel = async () => {
    if (!data?.data) return;
    if (data.data.estado === 'cancelada' || data.data.estado === 'completada') return;

    if (confirm('¿Deseas cancelar esta cita?')) {
      await cancelMutation.mutateAsync();
    }
  };

  const handleDelete = async () => {
    if (confirm('¿Eliminar esta cita permanentemente?')) {
      await deleteMutation.mutateAsync();
    }
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

  if (!user || !data?.data) {
    return null;
  }

  const cita = data.data;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/citas">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Regresar
              </Button>
            </Link>
            {(user.role === 'admin' || user.role === 'doctor') && (
              <Button variant="outline" size="sm" onClick={() => router.push(`/citas/${id}/editar`)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Button>
            )}
            {(user.role === 'admin' || user.role === 'doctor') && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={cancelMutation.isPending || cita.estado === 'cancelada'}
              >
                Cancelar
              </Button>
            )}
            {user.role === 'admin' && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </Button>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm uppercase text-muted-foreground">Estado</p>
            <p className="text-lg font-semibold">{estadoLabels[cita.estado]}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <CalendarDays className="h-5 w-5" />
                Información de la cita
              </CardTitle>
              <CardDescription>
                Datos generales programados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <div>
                  <p className="text-foreground font-medium">
                    {new Date(cita.date).toLocaleDateString('es-MX', {
                      weekday: 'long',
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                  <p>{cita.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4" />
                <div>
                  <p className="text-foreground font-medium">Doctor</p>
                  <p>{cita.doctor?.name || 'Sin doctor asignado'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <UserRound className="h-4 w-4" />
                <div>
                  <p className="text-foreground font-medium">Paciente</p>
                  <p>{cita.paciente?.fullName || 'Sin paciente registrado'}</p>
                  {cita.paciente?.phone && <p className="text-xs">{cita.paciente.phone}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <div>
                  <p className="text-foreground font-medium">Consultorio</p>
                  <p>{cita.consultorio?.name || 'Sin consultorio asignado'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <FileText className="h-5 w-5" />
                Detalles médicos
              </CardTitle>
              <CardDescription>
                Información clínica de la cita
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div>
                <p className="text-foreground font-medium">Motivo</p>
                <p>{cita.motivo || 'Sin motivo registrado'}</p>
              </div>
              <div>
                <p className="text-foreground font-medium">Diagnóstico</p>
                <p>{cita.diagnostico || 'Sin diagnóstico registrado'}</p>
              </div>
              <div>
                <p className="text-foreground font-medium">Tratamiento</p>
                <p>{cita.tratamiento || 'Sin tratamiento registrado'}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Coins className="h-5 w-5" />
                Información de pagos
              </CardTitle>
              <CardDescription>
                Historial de pagos asociados a la cita
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              {cita.pagos && cita.pagos.length > 0 ? (
                cita.pagos.map((pago) => (
                  <div key={pago.id} className="rounded-lg border border-border p-3">
                    <p className="text-foreground font-medium">Monto: ${pago.monto.toFixed(2)}</p>
                    <p className="text-xs uppercase">Estado: {pago.estatus}</p>
                    <p className="text-xs">
                      Fecha: {new Date(pago.createdAt).toLocaleString('es-MX')}
                    </p>
                  </div>
                ))
              ) : (
                <p>No hay pagos registrados.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <ClipboardSignature className="h-5 w-5" />
                Notas adicionales
              </CardTitle>
              <CardDescription>
                Observaciones relacionadas con la cita
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <StickyNote className="h-4 w-4 mt-1" />
                <p>{cita.notas || 'Sin notas registradas.'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
