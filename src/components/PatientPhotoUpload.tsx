'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { pacienteService } from '@/services/paciente.service';
import { usePaquete } from '@/hooks/usePaquete';
import { UpgradeAlert } from '@/components/UpgradeAlert';

interface PatientPhotoUploadProps {
  currentPhotoUrl?: string;
  currentS3Key?: string;
  onPhotoChange: (photoUrl: string, s3Key: string) => void;
  disabled?: boolean;
}

export function PatientPhotoUpload({ 
  currentPhotoUrl, 
  currentS3Key,
  onPhotoChange,
  disabled = false 
}: PatientPhotoUploadProps) {
  const [photoUrl, setPhotoUrl] = useState(currentPhotoUrl || '');
  const [s3Key, setS3Key] = useState(currentS3Key || '');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { tieneFeature } = usePaquete();

  useEffect(() => {
    if (currentPhotoUrl !== undefined) {
      setPhotoUrl(currentPhotoUrl);
    }
    if (currentS3Key !== undefined) {
      setS3Key(currentS3Key);
    }
  }, [currentPhotoUrl, currentS3Key]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen válida');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no debe superar 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // Subir a S3
      const response = await pacienteService.uploadPhoto(file);
      
      if (response.success) {
        setPhotoUrl(response.data.photoUrl);
        setS3Key(response.data.s3Key);
        onPhotoChange(response.data.photoUrl, response.data.s3Key);
      } else {
        alert('Error al subir la imagen');
      }
      setIsUploading(false);
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Error al cargar la imagen');
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      // Si hay una foto en S3, eliminarla
      if (s3Key) {
        await pacienteService.deletePhoto(s3Key);
      }
      
      setPhotoUrl('');
      setS3Key('');
      onPhotoChange('', '');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Error al eliminar la foto');
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Verificar si tiene acceso a la feature
  if (!tieneFeature('uploadImagenes')) {
    return (
      <UpgradeAlert 
        titulo="Función no disponible"
        mensaje="La subida de fotos de pacientes requiere el plan Profesional o superior."
        tipo="feature"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative group">
          {photoUrl ? (
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-border shadow-sm">
              <Image
                src={photoUrl}
                alt="Foto del paciente"
                fill
                className="object-cover"
              />
              {!disabled && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={handleRemovePhoto}
                    className="h-10 w-10 rounded-full shadow-lg"
                    title="Eliminar foto"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center border-4 border-border shadow-sm">
              <Camera className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled || isUploading}
          />
          
          <Button
            type="button"
            variant="outline"
            onClick={handleButtonClick}
            disabled={disabled || isUploading}
            className="w-full sm:w-auto"
          >
            <Upload className="mr-2 h-4 w-4" />
            {isUploading ? 'Cargando...' : photoUrl ? 'Cambiar foto' : 'Subir foto'}
          </Button>

          <p className="text-sm text-muted-foreground">
            Formatos: JPG, PNG, GIF. Máximo 5MB
          </p>
        </div>
      </div>
    </div>
  );
}
