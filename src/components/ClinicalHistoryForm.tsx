'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ClinicalHistory } from '@/services/paciente.service';
import { ClinicalHistoryConfig } from '@/services/consultorio.service';

interface ClinicalHistoryFormProps {
  clinicalHistory: ClinicalHistory;
  onClinicalHistoryChange: (history: ClinicalHistory) => void;
  config?: ClinicalHistoryConfig;
}

export function ClinicalHistoryForm({
  clinicalHistory,
  onClinicalHistoryChange,
  config = {
    antecedentesHeredofamiliares: true,
    antecedentesPersonalesPatologicos: true,
    antecedentesPersonalesNoPatologicos: true,
    ginecoObstetricos: true,
  },
}: ClinicalHistoryFormProps) {
  const [openSections, setOpenSections] = useState({
    antecedentesHeredofamiliares: false,
    antecedentesPersonalesPatologicos: false,
    antecedentesPersonalesNoPatologicos: false,
    ginecoObstetricos: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const updateHeredofamiliares = (field: string, value: boolean | string) => {
    onClinicalHistoryChange({
      ...clinicalHistory,
      antecedentesHeredofamiliares: {
        ...clinicalHistory.antecedentesHeredofamiliares,
        [field]: value,
      },
    });
  };

  const updatePersonalesPatologicos = (field: string, value: string) => {
    onClinicalHistoryChange({
      ...clinicalHistory,
      antecedentesPersonalesPatologicos: {
        ...clinicalHistory.antecedentesPersonalesPatologicos,
        [field]: value,
      },
    });
  };

  const updatePersonalesNoPatologicos = (field: string, value: boolean | string) => {
    onClinicalHistoryChange({
      ...clinicalHistory,
      antecedentesPersonalesNoPatologicos: {
        ...clinicalHistory.antecedentesPersonalesNoPatologicos,
        [field]: value,
      },
    });
  };

  const updateGinecoObstetricos = (field: string, value: number) => {
    onClinicalHistoryChange({
      ...clinicalHistory,
      ginecoObstetricos: {
        ...clinicalHistory.ginecoObstetricos,
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Historia Clínica</h3>
      <p className="text-sm text-muted-foreground">
        Las secciones siguientes son opcionales. Completa solo la información relevante.
      </p>

      {config.antecedentesHeredofamiliares && (
        <div className="rounded-lg border">
          <button
            type="button"
            onClick={() => toggleSection('antecedentesHeredofamiliares')}
            className="flex w-full items-center justify-between p-4 text-left font-medium hover:bg-muted/50 transition-colors"
          >
            <span>Antecedentes Heredofamiliares</span>
            {openSections.antecedentesHeredofamiliares ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>
          {openSections.antecedentesHeredofamiliares && (
            <div className="space-y-4 p-4 pt-0">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="diabetes"
                    checked={clinicalHistory.antecedentesHeredofamiliares?.diabetes || false}
                    onChange={(e) => updateHeredofamiliares('diabetes', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="diabetes" className="font-normal">Diabetes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="hipertension"
                    checked={clinicalHistory.antecedentesHeredofamiliares?.hipertension || false}
                    onChange={(e) => updateHeredofamiliares('hipertension', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="hipertension" className="font-normal">Hipertensión</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="cancer"
                    checked={clinicalHistory.antecedentesHeredofamiliares?.cancer || false}
                    onChange={(e) => updateHeredofamiliares('cancer', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="cancer" className="font-normal">Cáncer</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="cardiopatias"
                    checked={clinicalHistory.antecedentesHeredofamiliares?.cardiopatias || false}
                    onChange={(e) => updateHeredofamiliares('cardiopatias', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="cardiopatias" className="font-normal">Cardiopatías</Label>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="otros-heredofamiliares">Otros</Label>
                <textarea
                  id="otros-heredofamiliares"
                  value={clinicalHistory.antecedentesHeredofamiliares?.otros || ''}
                  onChange={(e) => updateHeredofamiliares('otros', e.target.value)}
                  rows={2}
                  placeholder="Otros antecedentes heredofamiliares..."
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {config.antecedentesPersonalesPatologicos && (
        <div className="rounded-lg border">
          <button
            type="button"
            onClick={() => toggleSection('antecedentesPersonalesPatologicos')}
            className="flex w-full items-center justify-between p-4 text-left font-medium hover:bg-muted/50 transition-colors"
          >
            <span>Antecedentes Personales Patológicos</span>
            {openSections.antecedentesPersonalesPatologicos ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>
          {openSections.antecedentesPersonalesPatologicos && (
            <div className="space-y-4 p-4 pt-0">
              <div className="space-y-2">
                <Label htmlFor="cirugias">Cirugías</Label>
                <textarea
                  id="cirugias"
                  value={clinicalHistory.antecedentesPersonalesPatologicos?.cirugias || ''}
                  onChange={(e) => updatePersonalesPatologicos('cirugias', e.target.value)}
                  rows={2}
                  placeholder="Cirugías previas..."
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hospitalizaciones">Hospitalizaciones</Label>
                <textarea
                  id="hospitalizaciones"
                  value={clinicalHistory.antecedentesPersonalesPatologicos?.hospitalizaciones || ''}
                  onChange={(e) => updatePersonalesPatologicos('hospitalizaciones', e.target.value)}
                  rows={2}
                  placeholder="Hospitalizaciones previas..."
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {config.antecedentesPersonalesNoPatologicos && (
        <div className="rounded-lg border">
          <button
            type="button"
            onClick={() => toggleSection('antecedentesPersonalesNoPatologicos')}
            className="flex w-full items-center justify-between p-4 text-left font-medium hover:bg-muted/50 transition-colors"
          >
            <span>Antecedentes Personales No Patológicos</span>
            {openSections.antecedentesPersonalesNoPatologicos ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>
          {openSections.antecedentesPersonalesNoPatologicos && (
            <div className="space-y-4 p-4 pt-0">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="tabaquismo"
                    checked={clinicalHistory.antecedentesPersonalesNoPatologicos?.tabaquismo || false}
                    onChange={(e) => updatePersonalesNoPatologicos('tabaquismo', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="tabaquismo" className="font-normal">Tabaquismo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="alcoholismo"
                    checked={clinicalHistory.antecedentesPersonalesNoPatologicos?.alcoholismo || false}
                    onChange={(e) => updatePersonalesNoPatologicos('alcoholismo', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="alcoholismo" className="font-normal">Alcoholismo</Label>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="actividad-fisica">Actividad Física</Label>
                <Input
                  id="actividad-fisica"
                  value={clinicalHistory.antecedentesPersonalesNoPatologicos?.actividadFisica || ''}
                  onChange={(e) => updatePersonalesNoPatologicos('actividadFisica', e.target.value)}
                  placeholder="Frecuencia de actividad física..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vacunas">Vacunas</Label>
                <textarea
                  id="vacunas"
                  value={clinicalHistory.antecedentesPersonalesNoPatologicos?.vacunas || ''}
                  onChange={(e) => updatePersonalesNoPatologicos('vacunas', e.target.value)}
                  rows={2}
                  placeholder="Esquema de vacunación..."
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {config.ginecoObstetricos && (
        <div className="rounded-lg border">
          <button
            type="button"
            onClick={() => toggleSection('ginecoObstetricos')}
            className="flex w-full items-center justify-between p-4 text-left font-medium hover:bg-muted/50 transition-colors"
          >
            <span>Gineco-obstétricos</span>
            {openSections.ginecoObstetricos ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>
          {openSections.ginecoObstetricos && (
            <div className="grid grid-cols-3 gap-4 p-4 pt-0">
              <div className="space-y-2">
                <Label htmlFor="embarazos">Embarazos</Label>
                <Input
                  id="embarazos"
                  type="number"
                  min="0"
                  value={clinicalHistory.ginecoObstetricos?.embarazos || ''}
                  onChange={(e) => updateGinecoObstetricos('embarazos', parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="partos">Partos</Label>
                <Input
                  id="partos"
                  type="number"
                  min="0"
                  value={clinicalHistory.ginecoObstetricos?.partos || ''}
                  onChange={(e) => updateGinecoObstetricos('partos', parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cesareas">Cesáreas</Label>
                <Input
                  id="cesareas"
                  type="number"
                  min="0"
                  value={clinicalHistory.ginecoObstetricos?.cesareas || ''}
                  onChange={(e) => updateGinecoObstetricos('cesareas', parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
