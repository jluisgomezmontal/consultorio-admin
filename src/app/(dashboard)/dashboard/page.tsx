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

      <main className="mx-auto max-w-7xl px-4 py-4 sm:py-8 sm:px-6 lg:px-8 flex-1">
        {/* Hero Section */}
        <div className="mb-4 sm:mb-8 overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 shadow-2xl">
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            <div className="flex flex-col justify-center p-4 sm:p-8 text-white">
              <div className="inline-flex items-center gap-2 mb-2 sm:mb-4">
                <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-xs sm:text-sm font-medium opacity-90">Sistema Activo</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">
                Bienvenido, {user.name}
              </h1>
              <p className="text-base sm:text-lg md:text-xl opacity-90 mb-2 sm:mb-4">
                Panel de Control
              </p>
              <p className="text-xs sm:text-sm opacity-80 max-w-md">
                Gestiona citas, pacientes y consultorios de manera eficiente desde un solo lugar
              </p>
            </div>
            <div className="relative hidden h-48 sm:h-64 md:block">
              <Image
                src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?q=80&w=1200&auto=format&fit=crop"
                alt="Equipo médico"
                fill
                className="object-cover opacity-90"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-indigo-600/20"></div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-4 sm:mb-8">
          <Link href={`/citas?dateFrom=${new Date().toISOString().split('T')[0]}&dateTo=${new Date().toISOString().split('T')[0]}`}>
            <Card className="hover:shadow-xl transition-all hover:-translate-y-1 border-l-4 border-l-blue-500 cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Citas Hoy
                </CardTitle>
                <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">{summary?.citasHoy ?? 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Programadas para hoy
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/citas?estado=pendiente">
            <Card className="hover:shadow-xl transition-all hover:-translate-y-1 border-l-4 border-l-yellow-500 cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Citas Pendientes
                </CardTitle>
                <div className="p-1.5 sm:p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="text-2xl sm:text-3xl font-bold text-yellow-600 dark:text-yellow-400">{summary?.citasPendientes ?? 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Por confirmar
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/pacientes">
            <Card className="hover:shadow-xl transition-all hover:-translate-y-1 border-l-4 border-l-purple-500 cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Total Pacientes
                </CardTitle>
                <div className="p-1.5 sm:p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">{totalPacientes}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Registrados
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/pagos">
            <Card className="hover:shadow-xl transition-all hover:-translate-y-1 border-l-4 border-l-green-500 cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Ingresos Hoy
                </CardTitle>
                <div className="p-1.5 sm:p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">${summary?.ingresosHoy?.toFixed(2) ?? '0.00'}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Pagos recibidos
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Quick Actions */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Acciones Rápidas</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Accede rápidamente a las funciones más utilizadas
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              <Button variant="outline" className="h-20 sm:h-24 flex-col hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:border-blue-300 dark:hover:border-blue-700 transition-all hover:shadow-md" asChild>
                <Link href="/citas/nueva">
                  <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg mb-1 sm:mb-2">
                    <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-center">
                    Nueva Cita
                  </span>
                </Link>
              </Button>
              <Button variant="outline" className="h-20 sm:h-24 flex-col hover:bg-purple-50 dark:hover:bg-purple-950/20 hover:border-purple-300 dark:hover:border-purple-700 transition-all hover:shadow-md" asChild>
                <Link href="/pacientes/nuevo">
                  <div className="p-1.5 sm:p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg mb-1 sm:mb-2">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-center">
                    Nuevo Paciente
                  </span>
                </Link>
              </Button>
              <Button variant="outline" className="h-20 sm:h-24 flex-col hover:bg-green-50 dark:hover:bg-green-950/20 hover:border-green-300 dark:hover:border-green-700 transition-all hover:shadow-md" asChild>
                <Link href="/citas">
                  <div className="p-1.5 sm:p-2 bg-green-100 dark:bg-green-900/20 rounded-lg mb-1 sm:mb-2">
                    <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-center">
                    Ver Calendario
                  </span>
                </Link>
              </Button>
              <Button variant="outline" className="h-20 sm:h-24 flex-col hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:border-orange-300 dark:hover:border-orange-700 transition-all hover:shadow-md" asChild>
                <Link href={user.role !== 'recepcionista' ? '/reportes' : '/pagos'}>
                  <div className="p-1.5 sm:p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg mb-1 sm:mb-2">
                    <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-center">
                    {user.role !== 'recepcionista' ? 'Reportes' : 'Pagos'}
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
