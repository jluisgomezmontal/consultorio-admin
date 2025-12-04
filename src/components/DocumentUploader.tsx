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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Subir Documento
        </CardTitle>
        <CardDescription>
          Adjunta documentos médicos a esta cita (máx. 10MB)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
            {success}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="tipo">Tipo de Documento *</Label>
          <select
            id="tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value as Documento['tipo'])}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            disabled={uploading}
          >
            {TIPO_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="file">Archivo *</Label>
          {!file ? (
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="file"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Click para subir</span> o arrastra el archivo
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PDF, Imágenes, Word, Excel (máx. 10MB)
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
            <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
              <FileText className="h-8 w-8 text-primary" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRemoveFile}
                disabled={uploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre del Documento</Label>
          <Input
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Receta médica - Antibiótico"
            disabled={uploading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="descripcion">Descripción (Opcional)</Label>
          <textarea
            id="descripcion"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={3}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Agrega notas o detalles sobre este documento"
            disabled={uploading}
          />
        </div>

        <Button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Subiendo...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Subir Documento
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
