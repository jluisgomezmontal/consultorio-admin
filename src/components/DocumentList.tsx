'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FileText,
  Download,
  Trash2,
  Calendar,
  User,
  FileImage,
  FileSpreadsheet,
  File,
} from 'lucide-react';
import { documentoService, type Documento } from '@/services/documento.service';

// Helper function to format dates
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

interface DocumentListProps {
  documentos: Documento[];
  onDelete?: (id: string) => void;
  showCitaInfo?: boolean;
}

const TIPO_LABELS: Record<Documento['tipo'], string> = {
  receta: 'Receta Médica',
  laboratorio: 'Laboratorio',
  imagen: 'Imagen Médica',
  estudio: 'Estudio',
  consentimiento: 'Consentimiento',
  historial: 'Historial',
  otro: 'Otro',
};

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) {
    return <FileImage className="h-8 w-8 text-blue-500" />;
  }
  if (mimeType.includes('pdf')) {
    return <FileText className="h-8 w-8 text-red-500" />;
  }
  if (mimeType.includes('sheet') || mimeType.includes('excel')) {
    return <FileSpreadsheet className="h-8 w-8 text-green-500" />;
  }
  return <File className="h-8 w-8 text-gray-500" />;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export function DocumentList({ documentos, onDelete, showCitaInfo = false }: DocumentListProps) {
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDownload = async (documento: Documento) => {
    try {
      if (documento.downloadUrl) {
        documentoService.downloadDocumento(documento.downloadUrl, documento.nombre);
      } else {
        alert('URL de descarga no disponible');
      }
    } catch (error) {
      console.error('Error al descargar documento:', error);
      alert('Error al descargar el documento');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este documento?')) {
      return;
    }

    setDeleting(id);
    try {
      await documentoService.deleteDocumento(id);
      if (onDelete) {
        onDelete(id);
      }
    } catch (error) {
      console.error('Error al eliminar documento:', error);
      alert('Error al eliminar el documento');
    } finally {
      setDeleting(null);
    }
  };

  if (documentos.length === 0) {
    return (
      <Card className="shadow-md">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Documentos
          </CardTitle>
          <CardDescription>Documentos adjuntos</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center py-8">
            No hay documentos disponibles
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          Documentos ({documentos.length})
        </CardTitle>
        <CardDescription>Documentos adjuntos a esta cita</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-3">
          {documentos.map((documento) => (
            <div
              key={documento.id || documento._id || `doc-${documento.nombre}-${documento.createdAt}`}
              className="flex items-start gap-4 rounded-lg border border-border p-4 hover:bg-muted/50 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all shadow-sm hover:shadow-md"
            >
              <div className="flex-shrink-0">{getFileIcon(documento.mimeType)}</div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{documento.nombre}</h4>
                    <p className="text-sm text-muted-foreground">
                      {TIPO_LABELS[documento.tipo]} • {formatFileSize(documento.tamanio)}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(documento)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(documento.id || documento._id || '')}
                      disabled={deleting === (documento.id || documento._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {documento.descripcion && (
                  <p className="text-sm text-muted-foreground mt-2">{documento.descripcion}</p>
                )}

                <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
                  {showCitaInfo && documento.citaId && typeof documento.citaId === 'object' && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        Cita: {typeof documento.citaId === 'object' && documento.citaId && 'date' in documento.citaId 
                          ? formatDate((documento.citaId as { date: string }).date)
                          : 'N/A'}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>Subido por: {documento.uploadedBy?.name || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {formatDate(documento.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
