'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
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
  Download,
} from 'lucide-react';
import { jsPDF } from 'jspdf';

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
  const [selectedEstado, setSelectedEstado] = useState<CitaEstado>('pendiente');
  const [estadoError, setEstadoError] = useState('');

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

  useEffect(() => {
    if (data?.data?.estado) {
      setSelectedEstado(data.data.estado);
    }
  }, [data?.data?.estado]);

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

  const updateEstadoMutation = useMutation({
    mutationFn: (nuevoEstado: CitaEstado) => citaService.updateCita(id, { estado: nuevoEstado }),
    onSuccess: (_, nuevoEstado) => {
      queryClient.invalidateQueries({ queryKey: ['citas'] });
      queryClient.invalidateQueries({ queryKey: ['cita', id] });
      setEstadoError('');
      setSelectedEstado(nuevoEstado);
    },
    onError: (error: any) => {
      setEstadoError(error?.response?.data?.message || 'No se pudo actualizar el estado de la cita');
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

  const handleEstadoUpdate = async () => {
    if (!cita) return;
    if (selectedEstado === cita.estado) return;
    await updateEstadoMutation.mutateAsync(selectedEstado);
  };

  const handleExportPDF = () => {
    if (!cita) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 20;

    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumen de Cita Médica', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Consultorio info
    if (cita.consultorio?.name) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(cita.consultorio.name, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 6;
      if (cita.consultorio.address) {
        doc.setFontSize(10);
        doc.text(cita.consultorio.address, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 6;
      }
      if (cita.consultorio.phone) {
        doc.text(`Tel: ${cita.consultorio.phone}`, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 10;
      }
    }
    yPosition += 5;

    // Line separator
    doc.setLineWidth(0.5);
    doc.line(15, yPosition, pageWidth - 15, yPosition);
    yPosition += 10;

    // Patient info
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Información del Paciente', 15, yPosition);
    yPosition += 8;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nombre: ${cita.paciente?.fullName || 'No especificado'}`, 15, yPosition);
    yPosition += 6;
    if (cita.paciente?.phone) {
      doc.text(`Teléfono: ${cita.paciente.phone}`, 15, yPosition);
      yPosition += 6;
    }
    if (cita.paciente?.age) {
      doc.text(`Edad: ${cita.paciente.age} años`, 15, yPosition);
      yPosition += 6;
    }
    yPosition += 5;

    // Appointment info
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Detalles de la Cita', 15, yPosition);
    yPosition += 8;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const fechaFormateada = new Date(cita.date).toLocaleDateString('es-MX', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
    doc.text(`Fecha: ${fechaFormateada}`, 15, yPosition);
    yPosition += 6;
    doc.text(`Hora: ${cita.time}`, 15, yPosition);
    yPosition += 6;
    doc.text(`Doctor: ${cita.doctor?.name || 'No especificado'}`, 15, yPosition);
    yPosition += 6;
    doc.text(`Estado: ${estadoLabels[cita.estado]}`, 15, yPosition);
    yPosition += 10;

    // Medical details
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Información Médica', 15, yPosition);
    yPosition += 8;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    if (cita.motivo) {
      doc.text('Motivo de consulta:', 15, yPosition);
      yPosition += 6;
      const motivoLines = doc.splitTextToSize(cita.motivo, pageWidth - 30);
      doc.text(motivoLines, 15, yPosition);
      yPosition += motivoLines.length * 6 + 4;
    }

    if (cita.diagnostico) {
      doc.text('Diagnóstico:', 15, yPosition);
      yPosition += 6;
      const diagnosticoLines = doc.splitTextToSize(cita.diagnostico, pageWidth - 30);
      doc.text(diagnosticoLines, 15, yPosition);
      yPosition += diagnosticoLines.length * 6 + 4;
    }

    if (cita.tratamiento) {
      doc.text('Tratamiento:', 15, yPosition);
      yPosition += 6;
      const tratamientoLines = doc.splitTextToSize(cita.tratamiento, pageWidth - 30);
      doc.text(tratamientoLines, 15, yPosition);
      yPosition += tratamientoLines.length * 6 + 4;
    }

    if (cita.notas) {
      doc.text('Notas adicionales:', 15, yPosition);
      yPosition += 6;
      const notasLines = doc.splitTextToSize(cita.notas, pageWidth - 30);
      doc.text(notasLines, 15, yPosition);
      yPosition += notasLines.length * 6 + 4;
    }

    // Cost
    if (cita.costo !== undefined && cita.costo !== null) {
      yPosition += 5;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Costo de consulta: $${cita.costo.toFixed(2)} MXN`, 15, yPosition);
    }

    // Footer
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text(
      `Generado el ${new Date().toLocaleDateString('es-MX')} a las ${new Date().toLocaleTimeString('es-MX')}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );

    // Save PDF
    const fileName = `Cita_${cita.paciente?.fullName.replace(/\s+/g, '_')}_${new Date(cita.date).toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
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
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <Download className="mr-2 h-4 w-4" />
              Exportar PDF
            </Button>
            {(user.role === 'admin' || user.role === 'doctor' || user.role === 'recepcionista') && (
              <Button variant="outline" size="sm" onClick={() => router.push(`/citas/${id}/editar`)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Button>
            )}
            {(cita.estado === 'completada') && (
              <Button variant="link" size="sm" asChild>
                <Link href={`/pagos/nuevo?citaId=${id}`}>
                  <Coins className="mr-2 h-4 w-4" />
                  Registrar pago
                </Link>
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
            {(user.role === 'admin' || user.role === 'doctor' || user.role === 'recepcionista') && (
              <div className="mt-2 flex flex-col gap-2 items-end">
                <div className="flex items-center gap-2">
                  <select
                    value={selectedEstado}
                    onChange={(event) => setSelectedEstado(event.target.value as CitaEstado)}
                    className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                  >
                    {Object.entries(estadoLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <Button
                    size="sm"
                    onClick={handleEstadoUpdate}
                    disabled={selectedEstado === cita.estado || updateEstadoMutation.isPending}
                  >
                    {updateEstadoMutation.isPending ? 'Actualizando...' : 'Actualizar estado'}
                  </Button>
                </div>
                {estadoError && <p className="text-xs text-destructive">{estadoError}</p>}
              </div>
            )}
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
