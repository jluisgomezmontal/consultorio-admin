'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';
import { recetaService } from '@/services/receta.service';
import { useMutation } from '@tanstack/react-query';

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

  const generateRecetaMutation = useMutation({
    mutationFn: () =>
      recetaService.generateReceta({
        citaId,
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

      onOpenChange(false);
      setError('');
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Error al generar la receta');
    },
  });

  const handleGenerate = () => {
    setError('');
    generateRecetaMutation.mutate();
  };

  const handleClose = () => {
    if (!generateRecetaMutation.isPending) {
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

        <div className="space-y-6">
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">
              La receta se generará con la información de diagnóstico, medicamentos y notas guardadas en la cita.
            </p>
            <p className="text-sm text-muted-foreground">
              Asegúrate de que la cita tenga toda la información necesaria antes de generar la receta.
            </p>
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
            <Button onClick={handleGenerate} disabled={generateRecetaMutation.isPending}>
              <Download className="mr-2 h-4 w-4" />
              {generateRecetaMutation.isPending ? 'Generando PDF...' : 'Generar Receta PDF'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
