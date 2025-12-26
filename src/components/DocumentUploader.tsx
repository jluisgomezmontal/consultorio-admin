'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import { documentoService, type Documento } from '@/services/documento.service';

interface DocumentUploaderProps {
  citaId: string;
  pacienteId: string;
  onUploadSuccess?: (documento: Documento) => void;
}

const TIPO_OPTIONS = [
  { value: 'receta', label: 'Receta Médica' },
  { value: 'laboratorio', label: 'Resultado de Laboratorio' },
  { value: 'imagen', label: 'Imagen Médica' },
  { value: 'estudio', label: 'Estudio' },
  { value: 'consentimiento', label: 'Consentimiento Informado' },
  { value: 'historial', label: 'Historial Clínico' },
  { value: 'otro', label: 'Otro' },
] as const;

export function DocumentUploader({ citaId, pacienteId, onUploadSuccess }: DocumentUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [tipo, setTipo] = useState<Documento['tipo']>('otro');
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validar tamaño (10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('El archivo es demasiado grande. Tamaño máximo: 10MB');
        return;
      }
      setFile(selectedFile);
      setNombre(selectedFile.name);
      setError('');
      setSuccess('');
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setNombre('');
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Por favor selecciona un archivo');
      return;
    }

    if (!tipo) {
      setError('Por favor selecciona un tipo de documento');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const response = await documentoService.uploadDocumento({
        file,
        citaId,
        pacienteId,
        tipo,
        nombre: nombre || file.name,
        descripcion,
      });

      // Limpiar formulario
      setFile(null);
      setNombre('');
      setDescripcion('');
      setTipo('otro');

      // Mostrar mensaje de éxito
      setSuccess('¡Documento subido exitosamente!');

      // Limpiar mensaje de éxito después de 5 segundos
      setTimeout(() => {
        setSuccess('');
      }, 5000);

      // Callback de éxito
      if (onUploadSuccess) {
        onUploadSuccess(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al subir el documento');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="flex items-center gap-2 break-words text-lg sm:text-xl">
          <Upload className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
          Subir Documento
        </CardTitle>
        <CardDescription className="break-words text-xs sm:text-sm">
          Adjunta documentos médicos (máx. 10MB)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-2 sm:p-3 text-xs sm:text-sm text-destructive break-words">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg bg-green-50 border border-green-200 p-2 sm:p-3 text-xs sm:text-sm text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400 break-words">
            {success}
          </div>
        )}

        <div className="space-y-1.5 sm:space-y-2">
          <Label htmlFor="tipo" className="text-xs sm:text-sm">Tipo de Documento *</Label>
          <select
            id="tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value as Documento['tipo'])}
            className="flex h-9 sm:h-10 w-full rounded-md border border-input bg-background px-2 sm:px-3 py-2 text-xs sm:text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            disabled={uploading}
          >
            {TIPO_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          <Label htmlFor="file" className="text-xs sm:text-sm">Archivo *</Label>
          {!file ? (
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="file"
                className="flex flex-col items-center justify-center w-full h-28 sm:h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex flex-col items-center justify-center pt-4 pb-5 px-3">
                  <Upload className="w-8 h-8 sm:w-10 sm:h-10 mb-2 sm:mb-3 text-muted-foreground" />
                  <p className="mb-1 sm:mb-2 text-xs sm:text-sm text-muted-foreground text-center">
                    <span className="font-semibold">Click para subir</span>
                    <span className="hidden sm:inline"> o arrastra el archivo</span>
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground text-center">
                    PDF, Imágenes, Word, Excel
                  </p>
                </div>
                <input
                  id="file"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={uploading}
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx,.xls,.xlsx"
                />
              </label>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 border rounded-lg bg-muted/50">
              <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="text-xs sm:text-sm font-medium truncate">{file.name}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRemoveFile}
                disabled={uploading}
                className="h-8 w-8 sm:h-10 sm:w-10"
              >
                <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          <Label htmlFor="nombre" className="text-xs sm:text-sm">Nombre del Documento</Label>
          <Input
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Receta médica"
            disabled={uploading}
            className="h-9 sm:h-10 text-xs sm:text-sm"
          />
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          <Label htmlFor="descripcion" className="text-xs sm:text-sm">Descripción (Opcional)</Label>
          <textarea
            id="descripcion"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={2}
            className="flex w-full rounded-md border border-input bg-background px-2 sm:px-3 py-2 text-xs sm:text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            placeholder="Notas o detalles"
            disabled={uploading}
          />
        </div>

        <Button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full h-9 sm:h-10 text-xs sm:text-sm"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
              Subiendo...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Subir Documento
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
