'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';
import { consultorioService } from '@/services/consultorio.service';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Edit, MapPin, Phone, Clock, Users, BarChart3, CalendarDays, Stethoscope } from 'lucide-react';
import Link from 'next/link';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(value);

export default function ConsultorioDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const { data, isLoading } = useQuery({
    queryKey: ['consultorio', id, 'summary'],
    queryFn: () => consultorioService.getConsultorioSummary(id),
    enabled: !!user && !!id,
  });

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

  if (!user || !data) {
    return null;
  }

  const consultorio = data.data.consultorio;
  const stats = data.data.statistics;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <Link href="/consultorios">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Regresar
                </Button>
              </Link>
              {user.role === 'admin' && (
                <Button variant="outline" size="sm" onClick={() => router.push(`/consultorios/${id}/editar`)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Button>
              )}
            </div>
            <h1 className="mt-4 text-3xl font-bold">{consultorio.name}</h1>
            {consultorio.description && (
              <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
                {consultorio.description}
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-xl">Información General</CardTitle>
              <CardDescription>
                Datos principales del consultorio
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-xs uppercase text-muted-foreground">Ubicación</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {consultorio.address || 'Sin dirección registrada'}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase text-muted-foreground">Teléfono</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {consultorio.phone || 'Sin teléfono registrado'}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase text-muted-foreground">Horario</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {consultorio.openHour && consultorio.closeHour
                    ? `${consultorio.openHour} - ${consultorio.closeHour}`
                    : 'Horario no definido'}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase text-muted-foreground">Creado</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(consultorio.createdAt).toLocaleDateString('es-MX', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <BarChart3 className="h-5 w-5" />
                Resumen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <CalendarDays className="h-4 w-4" /> Total de citas
                </span>
                <span className="font-semibold">{stats.totalCitas}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" /> Citas hoy
                </span>
                <span className="font-semibold">{stats.citasHoy}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" /> Citas pendientes
                </span>
                <span className="font-semibold">{stats.citasPendientes}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" /> Total pacientes
                </span>
                <span className="font-semibold">{stats.totalPacientes}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Stethoscope className="h-4 w-4" /> Doctores activos
                </span>
                <span className="font-semibold">{stats.totalDoctors}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" /> Equipo total
                </span>
                <span className="font-semibold">{stats.totalStaff}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <BarChart3 className="h-4 w-4" /> Ingresos acumulados
                </span>
                <span className="font-semibold">{formatCurrency(stats.totalIngresos)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-xl">Personal Registrado</CardTitle>
            <CardDescription>
              Usuarios asociados al consultorio
            </CardDescription>
          </CardHeader>
          <CardContent>
            {consultorio.users.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay usuarios asignados a este consultorio.
              </p>
            ) : (
              <div className="space-y-3">
                {consultorio.users.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                    <span className="text-xs uppercase text-muted-foreground">
                      {member.role}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
