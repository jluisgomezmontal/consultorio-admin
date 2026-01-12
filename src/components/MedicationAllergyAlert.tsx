'use client';

import { MedicationAllergy } from '@/services/medicationAllergy.service';
import { AlertTriangle, X, Pill, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MedicationAllergyAlertProps {
  medicationName: string;
  matchedAllergies: MedicationAllergy[];
  onDismiss?: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  showActions?: boolean;
}

export function MedicationAllergyAlert({
  medicationName,
  matchedAllergies,
  onDismiss,
  onConfirm,
  onCancel,
  showActions = false,
}: MedicationAllergyAlertProps) {
  if (matchedAllergies.length === 0) return null;

  return (
    <div className="rounded-lg border-2 border-red-500 bg-red-50 dark:bg-red-950/20 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="rounded-full bg-red-500 p-2 animate-pulse">
            <AlertTriangle className="h-5 w-5 text-white" />
          </div>
        </div>
        
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="text-lg font-bold text-red-900 dark:text-red-100 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              ⚠️ ALERTA DE ALERGIA DETECTADA
            </h3>
            <p className="text-sm text-red-800 dark:text-red-200 mt-1">
              El paciente tiene alergia registrada a este medicamento
            </p>
          </div>

          <div className="bg-white dark:bg-red-900/30 rounded-lg p-3 border border-red-300 dark:border-red-700">
            <div className="flex items-center gap-2 mb-2">
              <Pill className="h-4 w-4 text-red-600 dark:text-red-400" />
              <span className="font-semibold text-red-900 dark:text-red-100">
                Medicamento ingresado:
              </span>
            </div>
            <p className="text-base font-bold text-red-700 dark:text-red-300 ml-6">
              {medicationName}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-red-900 dark:text-red-100">
              Alergias registradas que coinciden:
            </p>
            {matchedAllergies.map((allergy) => (
              <div
                key={allergy.id || (allergy as any)._id}
                className="bg-white dark:bg-red-900/30 rounded-lg p-3 border border-red-300 dark:border-red-700"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-bold text-red-900 dark:text-red-100">
                      {allergy.name}
                    </p>
                    {allergy.activeIngredient && (
                      <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                        <span className="font-medium">Ingrediente activo:</span> {allergy.activeIngredient}
                      </p>
                    )}
                    {allergy.commonBrands && allergy.commonBrands.length > 0 && (
                      <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                        <span className="font-medium">Marcas comerciales:</span>{' '}
                        {allergy.commonBrands.join(', ')}
                      </p>
                    )}
                    {allergy.description && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-2 italic">
                        {allergy.description}
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <div className="rounded-full bg-red-100 dark:bg-red-800 px-2 py-1">
                      <span className="text-xs font-semibold text-red-800 dark:text-red-200">
                        {allergy.category}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 rounded-lg p-3">
            <p className="text-sm text-amber-900 dark:text-amber-100 font-medium">
              ⚕️ <strong>Recomendación:</strong> Verifique con el paciente antes de prescribir este medicamento.
              Considere alternativas terapéuticas si es necesario.
            </p>
          </div>

          {showActions && (
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="destructive"
                onClick={onCancel}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar y Eliminar
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onConfirm}
                className="flex-1 border-amber-500 text-amber-700 hover:bg-amber-50 dark:border-amber-600 dark:text-amber-400 dark:hover:bg-amber-950/30"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Confirmar de Todas Formas
              </Button>
            </div>
          )}

          {onDismiss && !showActions && (
            <div className="flex justify-end pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className="text-red-700 hover:text-red-900 dark:text-red-300 dark:hover:text-red-100"
              >
                <X className="h-4 w-4 mr-1" />
                Cerrar
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
