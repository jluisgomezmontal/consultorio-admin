'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useConsultorio } from '@/contexts/ConsultorioContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';
import { reporteService, ReporteFilters } from '@/services/reporte.service';
import { consultorioService, Consultorio } from '@/services/consultorio.service';
import { userService, User } from '@/services/user.service';
import { pacienteService } from '@/services/paciente.service';
import { useQuery } from '@tanstack/react-query';
import {
  FileText,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function ReportesPage() {
  const { user, loading: authLoading } = useAuth();
  const { selectedConsultorio } = useConsultorio();
  const router = useRouter();
  
  // Generate list of months (last 12 months)
  const generateMonthOptions = () => {
    const months = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = date.toISOString().slice(0, 7);
      const label = date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long' });
      months.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) });
    }
    return months;
  };

  const monthOptions = generateMonthOptions();
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  // Calculate date range from selected month
  const getMonthDateRange = (month: string) => {
    const [year, monthNum] = month.split('-');
    const firstDay = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
    const lastDay = new Date(parseInt(year), parseInt(monthNum), 0);
    return {
      dateFrom: firstDay.toISOString().split('T')[0],
      dateTo: lastDay.toISOString().split('T')[0],
    };
  };

  const dateRange = getMonthDateRange(selectedMonth);
  const [filters, setFilters] = useState<ReporteFilters>({
    dateFrom: dateRange.dateFrom,
    dateTo: dateRange.dateTo,
  });

  // Update date range when month changes
  useEffect(() => {
    const range = getMonthDateRange(selectedMonth);
    setFilters(prev => ({
      ...prev,
      dateFrom: range.dateFrom,
      dateTo: range.dateTo,
    }));
  }, [selectedMonth]);

  // Set consultorio filter when selectedConsultorio changes (for non-admin users)
  useEffect(() => {
    if (user && user.role !== 'admin' && selectedConsultorio) {
      setFilters(prev => ({
        ...prev,
        consultorioId: selectedConsultorio.id || selectedConsultorio._id,
      }));
    }
  }, [user, selectedConsultorio]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
    // Redirect receptionist to dashboard - they don't have access to reports
    if (!authLoading && user && user.role === 'recepcionista') {
      router.push('/dashboard');
    }
  }, [authLoading, user, router]);

  const { data: consultoriosData } = useQuery({
    queryKey: ['consultorios', 'options'],
    queryFn: () => consultorioService.getAllConsultorios(1, 1000),
    enabled: !!user && user.role !== 'recepcionista',
  });

  const { data: doctoresData } = useQuery({
    queryKey: ['doctores', 'options'],
    queryFn: () => userService.getDoctors(),
    enabled: !!user && user.role !== 'recepcionista',
  });

  const { data: citasReport, isLoading: isLoadingCitas } = useQuery({
    queryKey: ['reportes-citas', filters],
    queryFn: () => reporteService.getCitasReport(filters),
    enabled: !!user && user.role !== 'recepcionista',
  });

  const { data: ingresosReport, isLoading: isLoadingIngresos } = useQuery({
    queryKey: ['reportes-ingresos', filters],
    queryFn: () => reporteService.getIngresosReport(filters),
    enabled: !!user && user.role !== 'recepcionista',
  });

  const { data: pacientesReport, isLoading: isLoadingPacientes } = useQuery({
    queryKey: ['reportes-pacientes', filters.consultorioId],
    queryFn: () => reporteService.getPacientesReport(filters.consultorioId),
    enabled: !!user && user.role !== 'recepcionista',
  });

  // Get actual pacientes count (same as dashboard)
  const { data: pacientesData } = useQuery({
    queryKey: ['pacientes', 'reportes', selectedConsultorio?.id || selectedConsultorio?._id],
    queryFn: () => pacienteService.getAllPacientes(1, 1000),
    enabled: !!user && user.role !== 'recepcionista',
  });

  // Filter consultorios based on user role
  const allConsultorios = consultoriosData?.data || [];
  const consultorios = user?.role === 'admin' 
    ? allConsultorios 
    : allConsultorios.filter((c: Consultorio) => user?.consultoriosIds?.includes(c.id || c._id || ''));

  // Filter doctors based on selected consultorio
  const allDoctores = (doctoresData?.data || []).filter((item: User) => item.role === 'doctor');
  const doctores = filters.consultorioId
    ? allDoctores.filter((doctor: User) => doctor.consultoriosIds?.includes(filters.consultorioId))
    : allDoctores;

  // Get actual total pacientes count
  const totalPacientes = pacientesData?.data?.length || 0;

  const handleFilterChange = (key: keyof ReporteFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const handleClearFilters = () => {
    setSelectedMonth(currentMonth);
    const range = getMonthDateRange(currentMonth);
    const baseFilters: ReporteFilters = {
      dateFrom: range.dateFrom,
      dateTo: range.dateTo,
    };
    
    // Keep consultorio filter for non-admin users
    if (user?.role !== 'admin' && selectedConsultorio) {
      baseFilters.consultorioId = selectedConsultorio.id || selectedConsultorio._id;
    }
    
    setFilters(baseFilters);
  };

  if (authLoading || isLoadingCitas || isLoadingIngresos || isLoadingPacientes) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold">Reportes y Estadísticas</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Visualiza el desempeño del consultorio
            </p>
          </div>
          <Card className="flex items-center justify-center py-24">
            <LoadingSpinner delay={0} fullScreen={false} message="Cargando reportes..." />
          </Card>
        </main>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const citas = citasReport?.data;
  const ingresos = ingresosReport?.data;
  const pacientes = pacientesReport?.data;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold">Reportes y Estadísticas</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Visualiza el desempeño del consultorio
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Personaliza el rango de datos a visualizar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="month">Mes</Label>
                <select
                  id="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {monthOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="consultorioId">Consultorio</Label>
                <select
                  id="consultorioId"
                  value={filters.consultorioId || ''}
                  onChange={(e) => handleFilterChange('consultorioId', e.target.value)}
                  disabled={user?.role !== 'admin'}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Todos</option>
                  {consultorios.map((consultorio: Consultorio) => {
                    const id = consultorio.id || consultorio._id;
                    return (
                      <option key={id} value={id}>
                        {consultorio.name}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="doctorId">Doctor</Label>
                <select
                  id="doctorId"
                  value={filters.doctorId || ''}
                  onChange={(e) => handleFilterChange('doctorId', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="">Todos</option>
                  {doctores.map((doctor: User) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4">
              <Button variant="outline" onClick={handleClearFilters}>
                Limpiar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Citas</CardTitle>
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{citas?.totalCitas ?? 0}</div>
              <p className="text-xs text-muted-foreground">En el período seleccionado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Ingresos</CardTitle>
              <DollarSign className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${ingresos?.totalIngresos?.toFixed(2) ?? '0.00'}
              </div>
              <p className="text-xs text-muted-foreground">
                {ingresos?.totalPagos ?? 0} pagos realizados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pacientes</CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPacientes}</div>
              <p className="text-xs text-muted-foreground">
                Registrados en el sistema
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Citas por Estado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {citas?.citasPorEstado && citas.citasPorEstado.length > 0 ? (
                  citas.citasPorEstado.map((item) => (
                    <div key={item.estado} className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{item.estado}</span>
                      <span className="text-sm text-muted-foreground">{item.total}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No hay datos disponibles</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Ingresos por Método de Pago
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ingresos?.pagosPorMetodo && ingresos.pagosPorMetodo.length > 0 ? (
                  ingresos.pagosPorMetodo.map((item) => (
                    <div key={item.metodo} className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{item.metodo}</span>
                      <div className="text-right">
                        <div className="text-sm font-semibold">${item.total.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.cantidad} pago{item.cantidad !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No hay datos disponibles</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Citas por Doctor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {citas?.citasPorDoctor && citas.citasPorDoctor.length > 0 ? (
                  citas.citasPorDoctor.map((item) => (
                    <div key={item.doctorId} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.doctorName}</span>
                      <span className="text-sm text-muted-foreground">{item.total}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No hay datos disponibles</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Ingresos por Doctor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ingresos?.ingresosPorDoctor && ingresos.ingresosPorDoctor.length > 0 ? (
                  ingresos.ingresosPorDoctor.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.doctor_name}</span>
                      <div className="text-right">
                        <div className="text-sm font-semibold">
                          ${item.total_ingresos.toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.total_pagos} pago{item.total_pagos !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No hay datos disponibles</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Estadísticas de Pacientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Pacientes Recurrentes</p>
                <p className="text-2xl font-bold">{pacientes?.pacientesRecurrentes ?? 0}</p>
              </div>
              <div className="md:col-span-2">
                <p className="mb-2 text-sm text-muted-foreground">Por Género</p>
                <div className="flex flex-wrap gap-4">
                  {pacientes?.pacientesPorGenero && pacientes.pacientesPorGenero.length > 0 ? (
                    pacientes.pacientesPorGenero.map((item) => (
                      <div key={item.genero} className="flex items-center gap-2">
                        <span className="text-sm font-medium capitalize">{item.genero}:</span>
                        <span className="text-sm text-muted-foreground">{item.total}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No hay datos disponibles</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
