'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useConsultorio } from '@/contexts/ConsultorioContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';
import { Users, Calendar, Building2, Clock, DollarSign, FileText } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { reporteService } from '@/services/reporte.service';
import { pacienteService } from '@/services/paciente.service';
import { useQuery } from '@tanstack/react-query';

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const { selectedConsultorio, isLoading: consultorioLoading } = useConsultorio();
  const router = useRouter();

  // Helper to get consultorio ID (handles both id and _id)
  const getConsultorioId = (consultorio: typeof selectedConsultorio) => {
    return consultorio?.id || consultorio?._id;
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const consultorioId = getConsultorioId(selectedConsultorio);

  const { data: dashboardData, isLoading: isLoadingDashboard } = useQuery({
    queryKey: ['dashboard-summary', consultorioId],
    queryFn: () => {
      const id = user?.role === 'admin' ? undefined : consultorioId;
      return reporteService.getDashboardSummary(id);
    },
    enabled: !!user && (user.role === 'admin' || !!selectedConsultorio),
  });

  // Get pacientes count from the same endpoint that filters correctly
  const { data: pacientesData } = useQuery({
    queryKey: ['pacientes', 'dashboard', consultorioId],
    queryFn: () => pacienteService.getAllPacientes(1, 1000),
    enabled: !!user && (user.role === 'admin' || !!selectedConsultorio),
  });

  const summary = dashboardData?.data;
  const totalPacientes = pacientesData?.data?.length || 0;
  if (loading || isLoadingDashboard) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="bg-background flex-1 flex flex-col">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-1">
        <div className="mb-8 overflow-hidden rounded-lg bg-gradient-to-r from-primary to-primary/80">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col justify-center p-8 text-primary-foreground">
              <h2 className="text-3xl font-bold">
                Bienvenido, {user.name}
              </h2>
              <p className="mt-2 text-lg opacity-90">
                Panel de control del sistema
              </p>
              <p className="mt-4 text-sm opacity-80">
                Gestiona citas, pacientes y consultorios de manera eficiente
              </p>
            </div>
            <div className="relative hidden h-64 md:block">
              <Image
                src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?q=80&w=1200&auto=format&fit=crop"
                alt="Equipo médico"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Citas Hoy
              </CardTitle>
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary?.citasHoy ?? 0}</div>
              <p className="text-xs text-muted-foreground">
                Programadas para hoy
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Citas Pendientes
              </CardTitle>
              <Clock className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary?.citasPendientes ?? 0}</div>
              <p className="text-xs text-muted-foreground">
                Por confirmar
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Pacientes
              </CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPacientes}</div>
              <p className="text-xs text-muted-foreground">
                Registrados
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ingresos Hoy
              </CardTitle>
              <DollarSign className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${summary?.ingresosHoy?.toFixed(2) ?? '0.00'}</div>
              <p className="text-xs text-muted-foreground">
                Pagos recibidos
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>
              Accede rápidamente a las funciones más utilizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Button variant="outline" className="h-20 flex-col" asChild>
                <Link href="/citas/nueva">
                  <Clock className="h-6 w-6 mb-2" />
                  <span className="text-sm font-medium">
                    Nueva Cita
                  </span>
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex-col" asChild>
                <Link href="/pacientes/nuevo">
                  <Users className="h-6 w-6 mb-2" />
                  <span className="text-sm font-medium">
                    Nuevo Paciente
                  </span>
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex-col" asChild>
                <Link href="/citas">
                  <Calendar className="h-6 w-6 mb-2" />
                  <span className="text-sm font-medium">
                    Ver Calendario
                  </span>
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex-col" asChild>
                <Link href="/reportes">
                  <FileText className="h-6 w-6 mb-2" />
                  <span className="text-sm font-medium">
                    Reportes
                  </span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
