'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';
import { pagoService, EstatusPago } from '@/services/pago.service';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit,
  DollarSign,
  CreditCard,
  Calendar,
  FileText,
  UserRound,
  Stethoscope,
  Building2,
  Trash2,
  Clock,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';

const estatusLabels: Record<EstatusPago, string> = {
  pagado: 'Pagado',
  pendiente: 'Pendiente',
};

const estatusVariants: Record<EstatusPago, 'default' | 'secondary'> = {
  pagado: 'default',
  pendiente: 'secondary',
};

const metodoLabels: Record<string, string> = {
  efectivo: 'Efectivo',
  tarjeta: 'Tarjeta',
  transferencia: 'Transferencia',
};

export default function PagoDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();
  const { confirm } = useConfirmDialog();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  const { data, isLoading } = useQuery({
    queryKey: ['pago', id],
    queryFn: () => pagoService.getPagoById(id),
    enabled: !!user && !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => pagoService.deletePago(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pagos'] });
      queryClient.invalidateQueries({ queryKey: ['citas'] });
      queryClient.invalidateQueries({ queryKey: ['paciente-history'] });
      if (data?.data?.citaId) {
        queryClient.invalidateQueries({ queryKey: ['cita', data.data.citaId] });
      }
      router.push('/pagos');
    },
  });

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: '¿Eliminar este pago?',
      text: 'Esta acción no se puede deshacer',
      confirmButtonText: 'Sí, eliminar',
    });

    if (confirmed) {
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

  const pago = data.data;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => {
              router.back();
              setTimeout(() => {
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }, 80);
            }}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Regresar
            </Button>
            {(user.role === 'admin' || user.role === 'doctor') && (
              <Button variant="outline" size="sm" onClick={() => router.push(`/pagos/${id}/editar`)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
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
            <Badge variant={estatusVariants[pago.estatus]} className="mt-1">
              {estatusLabels[pago.estatus]}
            </Badge>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Información del Pago
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Monto</p>
                <p className="text-2xl font-bold text-foreground">${pago.monto.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Método de Pago</p>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{metodoLabels[pago.metodo]}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fecha de Pago</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">
                    {new Date(pago.fechaPago).toLocaleDateString('es-MX', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              {pago.comentarios && (
                <div>
                  <p className="text-sm text-muted-foreground">Comentarios</p>
                  <div className="flex items-start gap-2">
                    <FileText className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{pago.comentarios}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {pago.cita && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Información de la Cita
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Paciente</p>
                  <div className="flex items-center gap-2">
                    <UserRound className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{pago.cita.paciente?.fullName || 'Sin paciente'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Doctor</p>
                  <div className="flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{pago.cita.doctor?.name || 'Sin doctor'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Consultorio</p>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{pago.cita.consultorio?.name || 'Sin consultorio'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha y Hora de la Cita</p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">
                      {new Date(pago.cita.date).toLocaleDateString('es-MX', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}{' '}
                      - {pago.cita.time}
                    </p>
                  </div>
                </div>
                <div className="pt-2">
                  <Link href={`/citas/${pago.citaId}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      Ver Cita Completa
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Información del Sistema</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Fecha de Creación</p>
              <p className="text-sm font-medium">
                {new Date(pago.createdAt).toLocaleString('es-MX', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Última Actualización</p>
              <p className="text-sm font-medium">
                {new Date(pago.updatedAt).toLocaleString('es-MX', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
