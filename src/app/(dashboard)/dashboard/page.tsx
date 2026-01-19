'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useConsultorio } from '@/contexts/ConsultorioContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, Building2, Clock, DollarSign, FileText } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { reporteService } from '@/services/reporte.service';
import { pacienteService } from '@/services/paciente.service';
import { useQuery } from '@tanstack/react-query';
import { COLORS, GRADIENTS } from '@/lib/colors';

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
      <main className="mx-auto max-w-7xl px-4 py-4 sm:py-8 sm:px-6 lg:px-8 flex-1">
        {/* Hero Section */}
        <div className="mb-4 sm:mb-8 overflow-hidden rounded-xl sm:rounded-2xl bg-card border shadow-lg">
          <div className="h-1.5 bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-500"></div>
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
              <div className="inline-flex items-center gap-2 mb-3 sm:mb-4">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">Sistema Activo</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 text-foreground">
                Bienvenido, <span className="text-cyan-600 dark:text-cyan-400">{user.name}</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground mb-3 sm:mb-4">
                Panel de Control
              </p>
              <p className="text-sm sm:text-base text-muted-foreground/80 max-w-md">
                Gestiona citas, pacientes y consultorios de manera eficiente desde un solo lugar
              </p>
            </div>
            <div className="relative hidden md:block min-h-[200px] lg:min-h-[240px]">
              <Image
                src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?q=80&w=1200&auto=format&fit=crop"
                alt="Equipo médico"
                fill
                className="object-cover rounded-r-xl"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-card/80 rounded-r-xl"></div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-4 sm:mb-8">
          <Link href={`/citas?dateFrom=${new Date().toISOString().split('T')[0]}&dateTo=${new Date().toISOString().split('T')[0]}`}>
            <Card className={`hover:shadow-xl transition-all hover:-translate-y-1 border-l-4 ${COLORS.primary.borderL} cursor-pointer`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Citas Hoy
                </CardTitle>
                <div className={`p-1.5 sm:p-2 ${COLORS.primary.bg} rounded-lg`}>
                  <Calendar className={`h-4 w-4 sm:h-5 sm:w-5 ${COLORS.primary.icon}`} />
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className={`text-2xl sm:text-3xl font-bold ${COLORS.primary.text}`}>{summary?.citasHoy ?? 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Programadas para hoy
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/citas?estado=pendiente">
            <Card className={`hover:shadow-xl transition-all hover:-translate-y-1 border-l-4 ${COLORS.warning.borderL} cursor-pointer`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Citas Pendientes
                </CardTitle>
                <div className={`p-1.5 sm:p-2 ${COLORS.warning.bg} rounded-lg`}>
                  <Clock className={`h-4 w-4 sm:h-5 sm:w-5 ${COLORS.warning.icon}`} />
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className={`text-2xl sm:text-3xl font-bold ${COLORS.warning.text}`}>{summary?.citasPendientes ?? 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Todas las pendientes
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/pacientes">
            <Card className={`hover:shadow-xl transition-all hover:-translate-y-1 border-l-4 ${COLORS.secondary.borderL} cursor-pointer`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Total Pacientes
                </CardTitle>
                <div className={`p-1.5 sm:p-2 ${COLORS.secondary.bg} rounded-lg`}>
                  <Users className={`h-4 w-4 sm:h-5 sm:w-5 ${COLORS.secondary.icon}`} />
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className={`text-2xl sm:text-3xl font-bold ${COLORS.secondary.text}`}>{totalPacientes}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Registrados
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/pagos">
            <Card className={`hover:shadow-xl transition-all hover:-translate-y-1 border-l-4 ${COLORS.success.borderL} cursor-pointer`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Ingresos Hoy
                </CardTitle>
                <div className={`p-1.5 sm:p-2 ${COLORS.success.bg} rounded-lg`}>
                  <DollarSign className={`h-4 w-4 sm:h-5 sm:w-5 ${COLORS.success.icon}`} />
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className={`text-2xl sm:text-3xl font-bold ${COLORS.success.text}`}>${summary?.ingresosHoy?.toFixed(2) ?? '0.00'}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Pagos recibidos
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Quick Actions */}
        <Card className="shadow-lg">
          <CardHeader className={`${GRADIENTS.card} p-4 sm:p-6`}>
            <CardTitle className="text-lg sm:text-xl">Acciones Rápidas</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Accede rápidamente a las funciones más utilizadas
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              <Button variant="outline" className={`h-20 sm:h-24 flex-col ${COLORS.primary.bgHover} ${COLORS.primary.borderHover} transition-all hover:shadow-md`} asChild>
                <Link href="/citas/nueva">
                  <div className={`p-1.5 sm:p-2 ${COLORS.primary.bg} rounded-lg mb-1 sm:mb-2`}>
                    <Clock className={`h-5 w-5 sm:h-6 sm:w-6 ${COLORS.primary.icon}`} />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-center">
                    Nueva Cita
                  </span>
                </Link>
              </Button>
              <Button variant="outline" className={`h-20 sm:h-24 flex-col ${COLORS.secondary.bgHover} ${COLORS.secondary.borderHover} transition-all hover:shadow-md`} asChild>
                <Link href="/pacientes/nuevo">
                  <div className={`p-1.5 sm:p-2 ${COLORS.secondary.bg} rounded-lg mb-1 sm:mb-2`}>
                    <Users className={`h-5 w-5 sm:h-6 sm:w-6 ${COLORS.secondary.icon}`} />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-center">
                    Nuevo Paciente
                  </span>
                </Link>
              </Button>
              <Button variant="outline" className={`h-20 sm:h-24 flex-col ${COLORS.primary.bgHover} ${COLORS.primary.borderHover} transition-all hover:shadow-md`} asChild>
                <Link href="/citas">
                  <div className={`p-1.5 sm:p-2 ${COLORS.primary.bg} rounded-lg mb-1 sm:mb-2`}>
                    <Calendar className={`h-5 w-5 sm:h-6 sm:w-6 ${COLORS.primary.icon}`} />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-center">
                    Ver Calendario
                  </span>
                </Link>
              </Button>
              <Button variant="outline" className={`h-20 sm:h-24 flex-col ${COLORS.info.bgHover} ${COLORS.info.borderHover} transition-all hover:shadow-md`} asChild>
                <Link href={user.role !== 'recepcionista' ? '/reportes' : '/pagos'}>
                  <div className={`p-1.5 sm:p-2 ${COLORS.info.bg} rounded-lg mb-1 sm:mb-2`}>
                    <FileText className={`h-5 w-5 sm:h-6 sm:w-6 ${COLORS.info.icon}`} />
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
