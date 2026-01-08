'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useConsultorio } from '@/contexts/ConsultorioContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  Activity,
  CheckCircle2,
  Clock,
  XCircle,
  Filter,
  X,
  Stethoscope,
  Wallet,
  PieChart,
  TrendingDown,
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
  const [showFilters, setShowFilters] = useState(false);

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

  // Auto-select doctor if only one is available
  useEffect(() => {
    if (doctores.length === 1 && !filters.doctorId) {
      setFilters(prev => ({
        ...prev,
        doctorId: doctores[0].id,
      }));
    }
  }, [doctores.length, filters.doctorId]);

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
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            Reportes y Estadísticas
          </h2>
          <p className="mt-2 text-muted-foreground">
            Visualiza el desempeño del consultorio en tiempo real
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader className="cursor-pointer" onClick={() => setShowFilters(!showFilters)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Filtros</CardTitle>
                <CardDescription className="ml-2">Personaliza el rango de datos</CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                {showFilters ? <X className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          {showFilters && (
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
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
              <Button variant="outline" onClick={handleClearFilters} className="gap-2">
                <X className="h-4 w-4" />
                Limpiar Filtros
              </Button>
            </div>
          </CardContent>
          )}
        </Card>

        {/* Tarjetas de estadísticas principales */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Citas</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {citas?.totalCitas ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    En el período seleccionado
                  </p>
                </div>
                <div className="h-14 w-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Calendar className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Ingresos</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    ${ingresos?.totalIngresos?.toFixed(2) ?? '0.00'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {ingresos?.totalPagos ?? 0} pago{(ingresos?.totalPagos ?? 0) !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="h-14 w-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <DollarSign className="h-7 w-7 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Pacientes</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {totalPacientes}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Registrados en el sistema
                  </p>
                </div>
                <div className="h-14 w-14 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Users className="h-7 w-7 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Promedio por Cita</p>
                  <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                    ${(citas?.totalCitas ?? 0) > 0 ? ((ingresos?.totalIngresos ?? 0) / (citas?.totalCitas ?? 1)).toFixed(2) : '0.00'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ingreso promedio
                  </p>
                </div>
                <div className="h-14 w-14 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <TrendingUp className="h-7 w-7 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 dark:from-slate-800/50 dark:to-blue-900/20 border-b">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Citas por Estado
              </CardTitle>
              <CardDescription>Distribución de citas en el período</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {citas?.citasPorEstado && citas.citasPorEstado.length > 0 ? (
                  citas.citasPorEstado.map((item) => {
                    const percentage = ((item.total / (citas?.totalCitas ?? 1)) * 100).toFixed(0);
                    const color = 
                      item.estado === 'completada' ? 'bg-green-500' :
                      item.estado === 'confirmada' ? 'bg-blue-500' :
                      item.estado === 'cancelada' ? 'bg-red-500' : 'bg-yellow-500';
                    return (
                      <div key={item.estado} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {item.estado === 'completada' && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                            {item.estado === 'confirmada' && <Activity className="h-4 w-4 text-blue-600" />}
                            {item.estado === 'cancelada' && <XCircle className="h-4 w-4 text-red-600" />}
                            {item.estado === 'pendiente' && <Clock className="h-4 w-4 text-yellow-600" />}
                            <span className="text-sm font-medium capitalize">{item.estado}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground">{percentage}%</span>
                            <span className="text-sm font-bold">{item.total}</span>
                          </div>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No hay datos disponibles</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-green-50/50 dark:from-slate-800/50 dark:to-green-900/20 border-b">
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                Ingresos por Método de Pago
              </CardTitle>
              <CardDescription>Distribución de métodos de cobro</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {ingresos?.pagosPorMetodo && ingresos.pagosPorMetodo.length > 0 ? (
                  ingresos.pagosPorMetodo.map((item) => {
                    const percentage = ((item.total / (ingresos?.totalIngresos ?? 1)) * 100).toFixed(0);
                    return (
                      <div key={item.metodo} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium capitalize">{item.metodo}</span>
                          <div className="text-right">
                            <div className="text-sm font-bold text-green-600 dark:text-green-400">${item.total.toFixed(2)}</div>
                            <div className="text-xs text-muted-foreground">
                              {item.cantidad} pago{item.cantidad !== 1 ? 's' : ''} • {percentage}%
                            </div>
                          </div>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No hay datos disponibles</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-purple-50/50 dark:from-slate-800/50 dark:to-purple-900/20 border-b">
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-primary" />
                Citas por Doctor
              </CardTitle>
              <CardDescription>Rendimiento de cada doctor</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {citas?.citasPorDoctor && citas.citasPorDoctor.length > 0 ? (
                  citas.citasPorDoctor.map((item) => {
                    const percentage = ((item.total / (citas?.totalCitas ?? 1)) * 100).toFixed(0);
                    return (
                      <div key={item.doctorId} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{item.doctorName}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground">{percentage}%</span>
                            <span className="text-sm font-bold">{item.total}</span>
                          </div>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500 transition-all duration-500" style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No hay datos disponibles</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-emerald-50/50 dark:from-slate-800/50 dark:to-emerald-900/20 border-b">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Ingresos por Doctor
              </CardTitle>
              <CardDescription>Generación de ingresos por profesional</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {ingresos?.ingresosPorDoctor && ingresos.ingresosPorDoctor.length > 0 ? (
                  ingresos.ingresosPorDoctor.map((item) => {
                    const percentage = ((item.total_ingresos / (ingresos?.totalIngresos ?? 1)) * 100).toFixed(0);
                    return (
                      <div key={item.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{item.doctor_name}</span>
                          <div className="text-right">
                            <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                              ${item.total_ingresos.toFixed(2)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {item.total_pagos} pago{item.total_pagos !== 1 ? 's' : ''} • {percentage}%
                            </div>
                          </div>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No hay datos disponibles</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 hover:shadow-lg transition-shadow">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-indigo-50/50 dark:from-slate-800/50 dark:to-indigo-900/20 border-b">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Estadísticas de Pacientes
            </CardTitle>
            <CardDescription>Información demográfica y comportamiento</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="p-4 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-100 dark:border-indigo-800">
                <p className="text-sm font-medium text-muted-foreground mb-2">Pacientes Recurrentes</p>
                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{pacientes?.pacientesRecurrentes ?? 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Con más de una cita</p>
              </div>
              <div className="md:col-span-2 p-4 rounded-lg bg-muted/50 border">
                <p className="mb-4 text-sm font-medium text-muted-foreground">Distribución por Género</p>
                <div className="grid grid-cols-2 gap-4">
                  {pacientes?.pacientesPorGenero && pacientes.pacientesPorGenero.length > 0 ? (
                    pacientes.pacientesPorGenero.map((item) => {
                      const percentage = ((item.total / totalPacientes) * 100).toFixed(0);
                      return (
                        <div key={item.genero} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium capitalize">{item.genero}</span>
                            <span className="text-sm font-bold">{item.total}</span>
                          </div>
                          <div className="h-2 bg-background rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${percentage}%` }} />
                          </div>
                          <p className="text-xs text-muted-foreground">{percentage}% del total</p>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground col-span-2 text-center py-4">No hay datos disponibles</p>
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
