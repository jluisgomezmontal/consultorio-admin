'use client';

import { MedicationAllergy } from '@/services/medicationAllergy.service';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Pill } from 'lucide-react';

interface MedicationAllergyDisplayProps {
  allergies: MedicationAllergy[];
  className?: string;
}

export function MedicationAllergyDisplay({ allergies, className = '' }: MedicationAllergyDisplayProps) {
  if (!allergies || allergies.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Pill className="h-5 w-5" />
            Alergias a Medicamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Sin alergias registradas</p>
        </CardContent>
      </Card>
    );
  }

  const groupedByCategory = allergies.reduce((acc, allergy) => {
    if (!acc[allergy.category]) {
      acc[allergy.category] = [];
    }
    acc[allergy.category].push(allergy);
    return acc;
  }, {} as Record<string, MedicationAllergy[]>);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          Alergias a Medicamentos ({allergies.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(groupedByCategory).map(([category, meds]) => (
          <div key={category}>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">{category}</h4>
            <div className="flex flex-wrap gap-2">
              {meds.map((med, index) => (
                <div key={med.id || (med as any)._id || `${category}-${index}`} className="inline-block">
                  <Badge
                    variant="destructive"
                    className="px-3 py-1.5 text-sm flex flex-col items-start"
                  >
                    <span className="font-medium">{med.name}</span>
                    {/* {med.activeIngredient && (
                      <span className="text-xs opacity-90 mt-0.5">{med.activeIngredient}</span>
                    )} */}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
