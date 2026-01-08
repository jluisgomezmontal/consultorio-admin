'use client';

import { useState } from 'react';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePaquete } from '@/hooks/usePaquete';
import { UpgradeAlert } from '@/components/UpgradeAlert';

interface DocumentUploadSectionProps {
  citaId: string;
  onUploadSuccess?: () => void;
}

export function DocumentUploadSection({ citaId, onUploadSuccess }: DocumentUploadSectionProps) {
  const { tieneFeature } = usePaquete();
  const [isUploading, setIsUploading] = useState(false);

  // Verificar si tiene acceso a la feature
  if (!tieneFeature('uploadDocumentos')) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documentos
          </CardTitle>
          <CardDescription>
            Adjunta documentos relacionados con esta cita
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UpgradeAlert 
            titulo="Función no disponible"
            mensaje="La subida de documentos requiere el plan Profesional o superior."
            tipo="feature"
          />
        </CardContent>
      </Card>
    );
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Aquí iría tu lógica de subida de documentos
      // await documentoService.uploadDocumento(citaId, file);
      
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Error al subir el documento');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Documentos
        </CardTitle>
        <CardDescription>
          Adjunta documentos relacionados con esta cita
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <input
            type="file"
            id="document-upload"
            className="hidden"
            onChange={handleFileSelect}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            disabled={isUploading}
          />
          <label htmlFor="document-upload">
            <Button
              type="button"
              variant="outline"
              disabled={isUploading}
              onClick={() => document.getElementById('document-upload')?.click()}
              className="cursor-pointer"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Subir documento
                </>
              )}
            </Button>
          </label>
        </div>
      </CardContent>
    </Card>
  );
}
