'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface PatientPhotoUploadProps {
  currentPhotoUrl?: string;
  onPhotoChange: (photoUrl: string) => void;
  disabled?: boolean;
}

export function PatientPhotoUpload({ 
  currentPhotoUrl, 
  onPhotoChange,
  disabled = false 
}: PatientPhotoUploadProps) {
  const [photoUrl, setPhotoUrl] = useState(currentPhotoUrl || '');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPhotoUrl(base64String);
        onPhotoChange(base64String);
        setIsUploading(false);
      };
      reader.onerror = () => {
        alert('Error al leer la imagen');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Error al cargar la imagen');
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoUrl('');
    onPhotoChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative">
          {photoUrl ? (
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200">
              <Image
                src={photoUrl}
                alt="Foto del paciente"
                fill
                className="object-cover"
              />
              {!disabled && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  title="Eliminar foto"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ) : (
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center border-4 border-gray-200">
              <Camera className="h-12 w-12 text-gray-400" />
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
