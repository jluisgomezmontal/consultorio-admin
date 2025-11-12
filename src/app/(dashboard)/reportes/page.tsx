'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';
import { reporteService, ReporteFilters } from '@/services/reporte.service';
import { consultorioService } from '@/services/consultorio.service';
import { userService } from '@/services/user.service';
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
  const router = useRouter();
  const today = new Date().toISOString().split('T')[0];
  const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .split('T')[0];

  const [filters, setFilters] = useState<ReporteFilters>({
    dateFrom: firstDayOfMonth,
    dateTo: today,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  const { data: consultoriosData } = useQuery({
    queryKey: ['consultorios', 'options'],
    queryFn: () => consultorioService.getAllConsultorios(1, 1000),
    enabled: !!user,
  });

  const { data: doctoresData } = useQuery({
    queryKey: ['doctores', 'options'],
    queryFn: () => userService.getDoctors(),
    enabled: !!user,
  });

  const { data: citasReport, isLoading: isLoadingCitas } = useQuery({
    queryKey: ['reportes-citas', filters],
    queryFn: () => reporteService.getCitasReport(filters),
    enabled: !!user,
  });

  const { data: ingresosReport, isLoading: isLoadingIngresos } = useQuery({
    queryKey: ['reportes-ingresos', filters],
    queryFn: () => reporteService.getIngresosReport(filters),
    enabled: !!user,
  });

  const { data: pacientesReport, isLoading: isLoadingPacientes } = useQuery({
    queryKey: ['reportes-pacientes', filters.consultorioId],
    queryFn: () => reporteService.getPacientesReport(filters.consultorioId),
    enabled: !!user,
  });

  const consultorios = consultoriosData?.data || [];
  const doctores = doctoresData?.data || [];

  const handleFilterChange = (key: keyof ReporteFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      dateFrom: firstDayOfMonth,
      dateTo: today,
    });
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="dateFrom">Fecha Desde</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateTo">Fecha Hasta</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  min={filters.dateFrom || undefined}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="consultorioId">Consultorio</Label>
                <select
                  id="consultorioId"
                  value={filters.consultorioId || ''}
                  onChange={(e) => handleFilterChange('consultorioId', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="">Todos</option>
                  {consultorios.map((consultorio) => (
                    <option key={consultorio.id} value={consultorio.id}>
                      {consultorio.name}
                    </option>
                  ))}
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
                  {doctores.map((doctor) => (
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
              <div className="text-2xl font-bold">{pacientes?.totalPacientes ?? 0}</div>
              <p className="text-xs text-muted-foreground">
                {pacientes?.nuevosPacientes ?? 0} nuevos (últimos 30 días)
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
