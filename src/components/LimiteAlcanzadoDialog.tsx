'use client';

import { AlertTriangle, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface LimiteAlcanzadoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titulo: string;
  mensaje: string;
  actual?: number;
  limite?: number;
  tipo?: string;
}

export function LimiteAlcanzadoDialog({
  open,
  onOpenChange,
  titulo,
  mensaje,
  actual,
  limite,
  tipo,
}: LimiteAlcanzadoDialogProps) {
  const router = useRouter();

  const handleUpgrade = () => {
    onOpenChange(false);
    router.push('/configuracion/paquetes');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/20">
            <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-500" />
          </div>
          <DialogTitle className="text-center">{titulo}</DialogTitle>
          <DialogDescription className="text-center">
            {mensaje}
          </DialogDescription>
        </DialogHeader>

        {actual !== undefined && limite !== undefined && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/20">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Uso actual:</span>
              <span className="font-semibold">
                {actual} / {limite}
              </span>
            </div>
          </div>
        )}

        <DialogFooter className="sm:justify-center">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Cerrar
          </Button>
          <Button
            onClick={handleUpgrade}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 sm:w-auto"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Actualizar plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
