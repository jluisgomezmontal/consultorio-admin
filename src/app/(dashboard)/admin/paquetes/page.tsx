'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Building2, Users, UserCog, Calendar, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import apiClient from '@/lib/api-client';

interface Consultorio {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  paquete: string;
  suscripcion: {
    estado: string;
    fechaInicio: string;
    fechaVencimiento?: string;
    tipoPago: string;
  };
  paqueteInfo: {
    displayName: string;
    limites: {
      doctores: number;
      recepcionistas: number;
    };
  };
  uso: {
    doctores: number;
    recepcionistas: number;
  };
  createdAt: string;
}

interface UpdatePaqueteData {
  paquete: string;
  tipoPago: string;
  estado: string;
  fechaVencimiento?: string;
}

export default function AdminPaquetesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedConsultorio, setSelectedConsultorio] = useState<Consultorio | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<UpdatePaqueteData>({
    paquete: '',
    tipoPago: 'mensual',
    estado: 'activa',
    fechaVencimiento: '',
  });

  const { data: consultorios, isLoading } = useQuery({
    queryKey: ['admin-consultorios-paquetes'],
    queryFn: async () => {
      const response = await apiClient.get('/paquetes/admin/consultorios');
      return response.data.data as Consultorio[];
    },
    enabled: user?.role === 'admin',
  });

  const updateMutation = useMutation({
    mutationFn: async ({ consultorioId, data }: { consultorioId: string; data: UpdatePaqueteData }) => {
      const response = await apiClient.put(`/paquetes/admin/consultorios/${consultorioId}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: 'Paquete actualizado',
        description: 'El paquete del consultorio ha sido actualizado exitosamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-consultorios-paquetes'] });
      setDialogOpen(false);
      setSelectedConsultorio(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo actualizar el paquete',
        variant: 'destructive',
      });
    },
  });

  // Verificar que es admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (!user || user.role !== 'admin') {
    return null;
  }

  const handleEdit = (consultorio: Consultorio) => {
    setSelectedConsultorio(consultorio);
    setFormData({
      paquete: consultorio.paquete,
      tipoPago: consultorio.suscripcion.tipoPago,
      estado: consultorio.suscripcion.estado,
      fechaVencimiento: consultorio.suscripcion.fechaVencimiento 
        ? new Date(consultorio.suscripcion.fechaVencimiento).toISOString().split('T')[0]
        : '',
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!selectedConsultorio) return;

    const dataToSend: UpdatePaqueteData = {
      paquete: formData.paquete,
      tipoPago: formData.tipoPago,
      estado: formData.estado,
    };

    if (formData.fechaVencimiento) {
      dataToSend.fechaVencimiento = formData.fechaVencimiento;
    }

    updateMutation.mutate({
      consultorioId: selectedConsultorio._id,
      data: dataToSend,
    });
  };

  const getPaqueteBadge = (paquete: string) => {
    const colors = {
      basico: 'bg-gray-100 text-gray-800 border-gray-300',
      profesional: 'bg-blue-100 text-blue-800 border-blue-300',
      clinica: 'bg-purple-100 text-purple-800 border-purple-300',
    };
    return colors[paquete as keyof typeof colors] || colors.basico;
  };

  const getEstadoBadge = (estado: string) => {
    const colors = {
      activa: 'bg-green-100 text-green-800 border-green-300',
      trial: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      vencida: 'bg-red-100 text-red-800 border-red-300',
      cancelada: 'bg-gray-100 text-gray-800 border-gray-300',
    };
    return colors[estado as keyof typeof colors] || colors.activa;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Administración de Paquetes</h1>
        <p className="text-muted-foreground">
          Gestiona los paquetes y suscripciones de todos los consultorios
        </p>
      </div>

      <div className="grid gap-6">
        {consultorios?.map((consultorio) => (
          <Card key={consultorio._id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{consultorio.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {consultorio.email}
                      {consultorio.phone && ` • ${consultorio.phone}`}
                    </CardDescription>
                  </div>
                </div>
                <Button onClick={() => handleEdit(consultorio)} size="sm">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Editar Paquete
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <h3 className="mb-3 font-semibold text-sm text-muted-foreground">Paquete Actual</h3>
                  <div className="space-y-2">
                    <Badge className={getPaqueteBadge(consultorio.paquete)}>
                      {consultorio.paqueteInfo?.displayName || consultorio.paquete}
                    </Badge>
                    <Badge className={getEstadoBadge(consultorio.suscripcion.estado)}>
                      {consultorio.suscripcion.estado}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      Pago: {consultorio.suscripcion.tipoPago}
                    </div>
                    {consultorio.suscripcion.fechaVencimiento && (
                      <div className="text-sm text-muted-foreground">
                        Vence: {new Date(consultorio.suscripcion.fechaVencimiento).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 font-semibold text-sm text-muted-foreground">Límites del Paquete</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>Doctores: {consultorio.paqueteInfo?.limites.doctores || 'Ilimitado'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserCog className="h-4 w-4 text-muted-foreground" />
                      <span>Recepcionistas: {consultorio.paqueteInfo?.limites.recepcionistas || 'Ilimitado'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 font-semibold text-sm text-muted-foreground">Uso Actual</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">
                        {consultorio.uso.doctores} doctores
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserCog className="h-4 w-4 text-purple-600" />
                      <span className="font-medium">
                        {consultorio.uso.recepcionistas} recepcionistas
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Creado: {new Date(consultorio.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Actualizar Paquete</DialogTitle>
            <DialogDescription>
              Modifica el paquete y suscripción de {selectedConsultorio?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="paquete">Paquete</Label>
              <Select
                value={formData.paquete}
                onValueChange={(value) => setFormData({ ...formData, paquete: value })}
              >
                <SelectTrigger id="paquete">
                  <SelectValue placeholder="Selecciona un paquete" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basico">Básico</SelectItem>
                  <SelectItem value="profesional">Profesional</SelectItem>
                  <SelectItem value="clinica">Clínica</SelectItem>
                  <SelectItem value="licencia">Licencia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select
                value={formData.estado}
                onValueChange={(value) => setFormData({ ...formData, estado: value })}
              >
                <SelectTrigger id="estado">
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activa">Activa</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="vencida">Vencida</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipoPago">Tipo de Pago</Label>
              <Select
                value={formData.tipoPago}
                onValueChange={(value) => setFormData({ ...formData, tipoPago: value })}
              >
                <SelectTrigger id="tipoPago">
                  <SelectValue placeholder="Selecciona tipo de pago" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mensual">Mensual</SelectItem>
                  <SelectItem value="anual">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaVencimiento">Fecha de Vencimiento</Label>
              <Input
                id="fechaVencimiento"
                type="date"
                value={formData.fechaVencimiento}
                onChange={(e) => setFormData({ ...formData, fechaVencimiento: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Actualizar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
