'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Plus, Trash2, Download } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { recetaService, type Medicamento } from '@/services/receta.service';
import { useMutation } from '@tanstack/react-query';

const medicamentoSchema = z.object({
  nombre: z.string().min(1, 'Nombre del medicamento es requerido'),
  dosis: z.string().optional(),
  frecuencia: z.string().optional(),
  duracion: z.string().optional(),
  indicaciones: z.string().optional(),
});

const recetaSchema = z.object({
  diagnostico: z.string().min(1, 'El diagnóstico es requerido'),
  indicaciones: z.string().optional(),
  medicamentos: z.array(medicamentoSchema).min(1, 'Debe agregar al menos un medicamento'),
});

type RecetaFormData = z.infer<typeof recetaSchema>;

interface GenerarRecetaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  citaId: string;
  pacienteNombre: string;
}

export function GenerarRecetaDialog({
  open,
  onOpenChange,
  citaId,
  pacienteNombre,
}: GenerarRecetaDialogProps) {
  const [error, setError] = useState('');

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RecetaFormData>({
    resolver: zodResolver(recetaSchema),
    defaultValues: {
      diagnostico: '',
      indicaciones: '',
      medicamentos: [{ nombre: '', dosis: undefined, frecuencia: undefined, duracion: undefined, indicaciones: undefined }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'medicamentos',
  });

  const generateRecetaMutation = useMutation({
    mutationFn: (data: RecetaFormData) =>
      recetaService.generateReceta({
        citaId,
        diagnostico: data.diagnostico,
        medicamentos: data.medicamentos.map(med => ({
          nombre: med.nombre,
          dosis: med.dosis || undefined,
          frecuencia: med.frecuencia || undefined,
          duracion: med.duracion || undefined,
          indicaciones: med.indicaciones || undefined,
        })),
        indicaciones: data.indicaciones,
      }),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `receta-${pacienteNombre.replace(/\s/g, '_')}-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      reset();
      onOpenChange(false);
      setError('');
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Error al generar la receta');
    },
  });

  const onSubmit = (data: RecetaFormData) => {
    setError('');
    generateRecetaMutation.mutate(data);
  };

  const handleClose = () => {
    if (!generateRecetaMutation.isPending) {
      reset();
      setError('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generar Receta Médica
          </DialogTitle>
          <DialogDescription>
            Paciente: <strong>{pacienteNombre}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="diagnostico">
              Diagnóstico <span className="text-destructive">*</span>
            </Label>
            <Textarea
              {...register('diagnostico')}
              id="diagnostico"
              placeholder="Ej: Infección de vías respiratorias superiores"
              rows={3}
            />
            {errors.diagnostico && (
              <p className="text-sm text-destructive">{errors.diagnostico.message}</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base">
                Medicamentos <span className="text-destructive">*</span>
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({ nombre: '', dosis: undefined, frecuencia: undefined, duracion: undefined, indicaciones: undefined })
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Agregar Medicamento
              </Button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <span className="text-sm font-medium">Medicamento #{index + 1}</span>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor={`medicamentos.${index}.nombre`}>
                      Nombre del Medicamento <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      {...register(`medicamentos.${index}.nombre`)}
                      id={`medicamentos.${index}.nombre`}
                      placeholder="Ej: Amoxicilina 500mg"
                    />
                    {errors.medicamentos?.[index]?.nombre && (
                      <p className="text-sm text-destructive">
                        {errors.medicamentos[index]?.nombre?.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`medicamentos.${index}.dosis`}>Dosis</Label>
                    <Input
                      {...register(`medicamentos.${index}.dosis`)}
                      id={`medicamentos.${index}.dosis`}
                      placeholder="Ej: 1 tableta"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`medicamentos.${index}.frecuencia`}>Frecuencia</Label>
                    <Input
                      {...register(`medicamentos.${index}.frecuencia`)}
                      id={`medicamentos.${index}.frecuencia`}
                      placeholder="Ej: Cada 8 horas"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`medicamentos.${index}.duracion`}>Duración</Label>
                    <Input
                      {...register(`medicamentos.${index}.duracion`)}
                      id={`medicamentos.${index}.duracion`}
                      placeholder="Ej: 7 días"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`medicamentos.${index}.indicaciones`}>
                      Indicaciones Especiales
                    </Label>
                    <Input
                      {...register(`medicamentos.${index}.indicaciones`)}
                      id={`medicamentos.${index}.indicaciones`}
                      placeholder="Ej: Tomar con alimentos"
                    />
                  </div>
                </div>
              </div>
            ))}

            {errors.medicamentos?.root && (
              <p className="text-sm text-destructive">{errors.medicamentos.root.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="indicaciones">Indicaciones Generales</Label>
            <Textarea
              {...register('indicaciones')}
              id="indicaciones"
              placeholder="Ej: Reposo relativo, abundantes líquidos, evitar cambios bruscos de temperatura..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={generateRecetaMutation.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={generateRecetaMutation.isPending}>
              <Download className="mr-2 h-4 w-4" />
              {generateRecetaMutation.isPending ? 'Generando PDF...' : 'Generar Receta PDF'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
