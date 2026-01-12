'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { medicationAllergyService, MedicationAllergy } from '@/services/medicationAllergy.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Search, Pill, AlertCircle } from 'lucide-react';

interface MedicationAllergySelectorProps {
  selectedAllergies: string[];
  onChange: (allergies: string[]) => void;
  disabled?: boolean;
}

export function MedicationAllergySelector({
  selectedAllergies,
  onChange,
  disabled = false,
}: MedicationAllergySelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const { data: medicationsData, isLoading } = useQuery({
    queryKey: ['medications-by-category'],
    queryFn: () => medicationAllergyService.getMedicationsByCategory(),
  });

  const medications = medicationsData?.data || {};
  const categories = Object.keys(medications);

  const filteredMedications = selectedCategory
    ? { [selectedCategory]: medications[selectedCategory] || [] }
    : medications;

  const searchFilteredMedications = Object.entries(filteredMedications).reduce(
    (acc, [category, meds]) => {
      const filtered = meds.filter(
        (med) =>
          med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          med.activeIngredient?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          med.commonBrands?.some((brand) => brand.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      if (filtered.length > 0) {
        acc[category] = filtered;
      }
      return acc;
    },
    {} as Record<string, MedicationAllergy[]>
  );

  const selectedMedicationsDetails = selectedAllergies
    .map((id) => {
      for (const category of Object.values(medications)) {
        const found = category.find((med) => med.id === id);
        if (found) return found;
      }
      return null;
    })
    .filter(Boolean) as MedicationAllergy[];

  const handleToggleMedication = (medicationId: string) => {
    if (disabled) return;
    
    if (selectedAllergies.includes(medicationId)) {
      onChange(selectedAllergies.filter((id) => id !== medicationId));
    } else {
      onChange([...selectedAllergies, medicationId]);
    }
  };

  const handleRemoveMedication = (medicationId: string) => {
    if (disabled) return;
    onChange(selectedAllergies.filter((id) => id !== medicationId));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-semibold flex items-center gap-2">
          <Pill className="h-5 w-5" />
          Alergias a Medicamentos
        </Label>
        <p className="text-sm text-muted-foreground mt-1">
          Selecciona los medicamentos a los que el paciente es alérgico
        </p>
      </div>

      {selectedMedicationsDetails.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              Alergias Seleccionadas ({selectedMedicationsDetails.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {selectedMedicationsDetails.map((med) => (
                <Badge
                  key={med.id}
                  variant="destructive"
                  className="px-3 py-1.5 text-sm flex items-center gap-2"
                >
                  {med.name}
                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMedication(med.id)}
                      className="ml-1 hover:bg-destructive-foreground/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar medicamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
              disabled={disabled}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={selectedCategory === '' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('')}
            disabled={disabled}
          >
            Todas
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              type="button"
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              disabled={disabled}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      <div className="border rounded-lg max-h-96 overflow-y-auto">
        {Object.entries(searchFilteredMedications).length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Pill className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No se encontraron medicamentos</p>
          </div>
        ) : (
          <div className="divide-y">
            {Object.entries(searchFilteredMedications).map(([category, meds]) => (
              <div key={category} className="p-4">
                <h3 className="font-semibold text-sm text-muted-foreground mb-3">{category}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {meds.map((med) => {
                    const isSelected = selectedAllergies.includes(med.id);
                    return (
                      <button
                        key={med.id}
                        type="button"
                        onClick={() => handleToggleMedication(med.id)}
                        disabled={disabled}
                        className={`text-left p-3 rounded-lg border transition-colors ${
                          isSelected
                            ? 'bg-destructive/10 border-destructive text-destructive'
                            : 'bg-background hover:bg-muted border-border'
                        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div className="font-medium text-sm">{med.name}</div>
                        {med.activeIngredient && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {med.activeIngredient}
                          </div>
                        )}
                        {med.commonBrands && med.commonBrands.length > 0 && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {med.commonBrands.slice(0, 2).join(', ')}
                            {med.commonBrands.length > 2 && '...'}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
