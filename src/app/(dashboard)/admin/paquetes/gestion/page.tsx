'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Edit, Trash2, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { paqueteService, Paquete } from '@/services/paquete.service';

export default function GestionPaquetesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPaquete, setSelectedPaquete] = useState<Paquete | null>(null);
  const [formData, setFormData] = useState<Partial<Paquete>>({
    nombre: 'basico',
    displayName: '',
    descripcion: '',
    precio: { mensual: 0, anual: 0 },
    limites: {
      consultorios: 1,
      doctores: 1,
      recepcionistas: 1,
      pacientes: null,
      citas: null,
    },
    features: {
      uploadDocumentos: false,
      uploadImagenes: false,
      reportesAvanzados: false,
      integraciones: false,
      soportePrioritario: false,
    },
    stripePriceIds: {
      mensual: '',
      anual: '',
    },
    activo: true,
    orden: 1,
  });

  const { data: paquetes, isLoading } = useQuery({
    queryKey: ['admin-paquetes'],
    queryFn: async () => {
      const response = await paqueteService.getAllPaquetes();
      return response.data;
    },
    enabled: user?.role === 'admin',
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<Paquete>) => {
      console.log('🚀 Sending create request with data:', data);
      const response = await paqueteService.crearPaquete(data);
      console.log('✅ Create response:', response);
      return response;
    },
    onSuccess: (data) => {
      console.log('🎉 Create success:', data);
      toast({
        title: 'Paquete creado',
        description: 'El paquete ha sido creado exitosamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-paquetes'] });
      setDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      console.error('❌ Create error:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error data:', error.response?.data);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo crear el paquete',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Paquete> }) => {
      return await paqueteService.actualizarPaqueteById(id, data);
    },
    onSuccess: () => {
      toast({
        title: 'Paquete actualizado',
        description: 'El paquete ha sido actualizado exitosamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-paquetes'] });
      setDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo actualizar el paquete',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await paqueteService.eliminarPaquete(id);
    },
    onSuccess: () => {
      toast({
        title: 'Paquete eliminado',
        description: 'El paquete ha sido eliminado exitosamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-paquetes'] });
      setDeleteDialogOpen(false);
      setSelectedPaquete(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo eliminar el paquete',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      nombre: 'basico',
      displayName: '',
      descripcion: '',
      precio: { mensual: 0, anual: 0 },
      limites: {
        consultorios: 1,
        doctores: 1,
        recepcionistas: 1,
        pacientes: null,
        citas: null,
      },
      features: {
        uploadDocumentos: false,
        uploadImagenes: false,
        reportesAvanzados: false,
        integraciones: false,
        soportePrioritario: false,
      },
      stripePriceIds: {
        mensual: '',
        anual: '',
      },
      activo: true,
      orden: 1,
    });
    setSelectedPaquete(null);
  };

  const handleCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleEdit = (paquete: Paquete) => {
    setSelectedPaquete(paquete);
    setFormData(paquete);
    setDialogOpen(true);
  };

  const handleDelete = (paquete: Paquete) => {
    setSelectedPaquete(paquete);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = () => {
    console.log('🔍 handleSubmit called');
    console.log('📦 formData:', formData);
    console.log('✏️ selectedPaquete:', selectedPaquete);
    
    if (selectedPaquete) {
      console.log('🔄 Updating paquete...');
      updateMutation.mutate({ id: selectedPaquete.id, data: formData });
    } else {
      console.log('➕ Creating new paquete...');
      createMutation.mutate(formData);
    }
  };

  const confirmDelete = () => {
    if (selectedPaquete) {
      deleteMutation.mutate(selectedPaquete.id);
    }
  };

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Gestión de Paquetes</h1>
          <p className="text-muted-foreground">
            Crea, edita y elimina los paquetes disponibles en la plataforma
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Crear Paquete
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {paquetes?.map((paquete) => (
          <Card key={paquete.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle>{paquete.displayName}</CardTitle>
                    <CardDescription className="mt-1">
                      {paquete.nombre}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant={paquete.activo ? 'default' : 'secondary'}>
                  {paquete.activo ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{paquete.descripcion}</p>
              
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-sm mb-2">Precios</h4>
                  <div className="text-sm space-y-1">
                    <div>Mensual: ${paquete.precio.mensual}</div>
                    <div>Anual: ${paquete.precio.anual}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">Límites</h4>
                  <div className="text-sm space-y-1">
                    <div>Doctores: {paquete.limites.doctores}</div>
                    <div>Recepcionistas: {paquete.limites.recepcionistas}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">Features</h4>
                  <div className="flex flex-wrap gap-1">
                    {paquete.features.uploadDocumentos && (
                      <Badge variant="outline" className="text-xs">Documentos</Badge>
                    )}
                    {paquete.features.uploadImagenes && (
                      <Badge variant="outline" className="text-xs">Imágenes</Badge>
                    )}
                    {paquete.features.reportesAvanzados && (
                      <Badge variant="outline" className="text-xs">Reportes</Badge>
                    )}
                    {paquete.features.integraciones && (
                      <Badge variant="outline" className="text-xs">Integraciones</Badge>
                    )}
                    {paquete.features.soportePrioritario && (
                      <Badge variant="outline" className="text-xs">Soporte VIP</Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button onClick={() => handleEdit(paquete)} variant="outline" size="sm" className="flex-1">
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Button>
                <Button onClick={() => handleDelete(paquete)} variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPaquete ? 'Editar Paquete' : 'Crear Paquete'}</DialogTitle>
            <DialogDescription>
              {selectedPaquete ? 'Modifica la información del paquete' : 'Completa los datos del nuevo paquete'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre (ID)</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value as any })}
                  placeholder="basico"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="displayName">Nombre para mostrar</Label>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="Básico"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Descripción del paquete"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="precioMensual">Precio Mensual ($)</Label>
                <Input
                  id="precioMensual"
                  type="number"
                  value={formData.precio?.mensual}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    precio: { ...formData.precio!, mensual: Number(e.target.value) }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="precioAnual">Precio Anual ($)</Label>
                <Input
                  id="precioAnual"
                  type="number"
                  value={formData.precio?.anual}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    precio: { ...formData.precio!, anual: Number(e.target.value) }
                  })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Stripe Price IDs (Opcional)</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Configura estos IDs para habilitar pagos con Stripe. Déjalos vacíos si no usarás Stripe.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stripePriceMensual">Price ID Mensual</Label>
                  <Input
                    id="stripePriceMensual"
                    value={formData.stripePriceIds?.mensual || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      stripePriceIds: { ...formData.stripePriceIds, mensual: e.target.value }
                    })}
                    placeholder="price_xxxxxxxxxxxxx"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stripePriceAnual">Price ID Anual</Label>
                  <Input
                    id="stripePriceAnual"
                    value={formData.stripePriceIds?.anual || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      stripePriceIds: { ...formData.stripePriceIds, anual: e.target.value }
                    })}
                    placeholder="price_xxxxxxxxxxxxx"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Límites de Recursos</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="consultorios">Límite Consultorios</Label>
                  <Input
                    id="consultorios"
                    type="number"
                    value={formData.limites?.consultorios}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      limites: { ...formData.limites!, consultorios: Number(e.target.value) }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctores">Límite Doctores</Label>
                  <Input
                    id="doctores"
                    type="number"
                    value={formData.limites?.doctores}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      limites: { ...formData.limites!, doctores: Number(e.target.value) }
                    })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recepcionistas">Límite Recepcionistas</Label>
                  <Input
                    id="recepcionistas"
                    type="number"
                    value={formData.limites?.recepcionistas}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      limites: { ...formData.limites!, recepcionistas: Number(e.target.value) }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pacientes">Límite Pacientes (0 = ilimitado)</Label>
                  <Input
                    id="pacientes"
                    type="number"
                    value={formData.limites?.pacientes || 0}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      limites: { ...formData.limites!, pacientes: Number(e.target.value) || null }
                    })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="citas">Límite Citas Mensuales (0 = ilimitado)</Label>
                <Input
                  id="citas"
                  type="number"
                  value={formData.limites?.citas || 0}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    limites: { ...formData.limites!, citas: Number(e.target.value) || null }
                  })}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Features</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="uploadDocumentos" className="font-normal">Upload Documentos</Label>
                  <Switch
                    id="uploadDocumentos"
                    checked={formData.features?.uploadDocumentos}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      features: { ...formData.features!, uploadDocumentos: checked }
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="uploadImagenes" className="font-normal">Upload Imágenes</Label>
                  <Switch
                    id="uploadImagenes"
                    checked={formData.features?.uploadImagenes}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      features: { ...formData.features!, uploadImagenes: checked }
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="reportesAvanzados" className="font-normal">Reportes Avanzados</Label>
                  <Switch
                    id="reportesAvanzados"
                    checked={formData.features?.reportesAvanzados}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      features: { ...formData.features!, reportesAvanzados: checked }
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="integraciones" className="font-normal">Integraciones</Label>
                  <Switch
                    id="integraciones"
                    checked={formData.features?.integraciones}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      features: { ...formData.features!, integraciones: checked }
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="soportePrioritario" className="font-normal">Soporte Prioritario</Label>
                  <Switch
                    id="soportePrioritario"
                    checked={formData.features?.soportePrioritario}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      features: { ...formData.features!, soportePrioritario: checked }
                    })}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="orden">Orden</Label>
                <Input
                  id="orden"
                  type="number"
                  value={formData.orden}
                  onChange={(e) => setFormData({ ...formData, orden: Number(e.target.value) })}
                />
              </div>
              <div className="flex items-center space-x-2 pt-8">
                <Switch
                  id="activo"
                  checked={formData.activo}
                  onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })}
                />
                <Label htmlFor="activo">Paquete Activo</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {selectedPaquete ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Estás seguro?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. Se eliminará el paquete "{selectedPaquete?.displayName}".
              Solo se puede eliminar si ningún consultorio lo está usando.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              variant="destructive"
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
