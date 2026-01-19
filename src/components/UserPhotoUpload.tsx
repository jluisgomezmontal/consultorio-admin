'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Camera, X, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { userPhotoService } from '@/services/user-photo.service';
import { useToast } from '@/hooks/use-toast';

interface UserPhotoUploadProps {
  currentPhotoUrl?: string;
  currentS3Key?: string;
  onPhotoChange?: (photoUrl: string | undefined, s3Key: string | undefined) => void;
  userName: string;
  disabled?: boolean;
}

export function UserPhotoUpload({
  currentPhotoUrl,
  currentS3Key,
  onPhotoChange,
  userName,
  disabled = false,
}: UserPhotoUploadProps) {
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(currentPhotoUrl);
  const [s3Key, setS3Key] = useState<string | undefined>(currentS3Key);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentPhotoUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: 'Por favor selecciona un archivo de imagen válido',
        variant: 'destructive',
      });
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'La imagen no debe superar los 5MB',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUploading(true);

      // Crear preview local
      const localPreview = URL.createObjectURL(file);
      setPreviewUrl(localPreview);

      // Subir a S3
      const response = await userPhotoService.uploadPhoto(file);

      if (response.success) {
        const newPhotoUrl = response.data.photoUrl;
        const newS3Key = response.data.s3Key;

        setPhotoUrl(newPhotoUrl);
        setS3Key(newS3Key);
        setPreviewUrl(newPhotoUrl);

        // Actualizar en el backend
        await userPhotoService.updateMyPhoto(newPhotoUrl, newS3Key);

        // Notificar al componente padre
        onPhotoChange?.(newPhotoUrl, newS3Key);

        toast({
          title: 'Éxito',
          description: 'Foto de perfil actualizada correctamente',
        });

        // Limpiar preview local
        URL.revokeObjectURL(localPreview);
      }
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al subir la foto de perfil',
        variant: 'destructive',
      });
      setPreviewUrl(photoUrl);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = async () => {
    if (!s3Key) return;

    try {
      setUploading(true);

      // Eliminar del backend
      await userPhotoService.deleteMyPhoto();

      setPhotoUrl(undefined);
      setS3Key(undefined);
      setPreviewUrl(undefined);

      // Notificar al componente padre
      onPhotoChange?.(undefined, undefined);

      toast({
        title: 'Éxito',
        description: 'Foto de perfil eliminada correctamente',
      });
    } catch (error: any) {
      console.error('Error deleting photo:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al eliminar la foto de perfil',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt="Foto de perfil"
              fill
              className="object-cover"
            />
          ) : (
            <span className="text-4xl font-bold text-white">
              {getInitials(userName)}
            </span>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            </div>
          )}
        </div>

        {previewUrl && !disabled && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={handleRemovePhoto}
            disabled={uploading}
            className="absolute -top-2 -right-2 h-8 w-8 rounded-full shadow-lg"
            title="Eliminar foto"
          >
            <X className="h-4 w-4" />
          </Button>
        )}

        {!disabled && (
          <Button
            type="button"
            variant="secondary"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full shadow-lg"
            title="Cambiar foto"
          >
            <Camera className="h-5 w-5" />
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />

      <div className="text-center">
        <p className="text-sm font-medium">{userName}</p>
        <p className="text-xs text-muted-foreground">
          {previewUrl ? 'Click en la cámara para cambiar' : 'Click en la cámara para agregar foto'}
        </p>
      </div>
    </div>
  );
}
