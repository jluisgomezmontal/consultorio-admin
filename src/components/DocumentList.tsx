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
  context?: 'cita' | 'paciente';
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

export function DocumentList({ documentos, onDelete, showCitaInfo = false, context = 'cita' }: DocumentListProps) {
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
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
            Documentos
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            {context === 'paciente' ? 'Documentos adjuntos al paciente' : 'Documentos adjuntos a esta cita'}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 sm:pt-6">
          <p className="text-xs sm:text-sm text-muted-foreground text-center py-6 sm:py-8">
            No hay documentos disponibles
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 pb-3 sm:pb-6">
        <CardTitle className="flex items-center gap-2 break-words text-lg sm:text-xl">
          <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
          Documentos ({documentos.length})
        </CardTitle>
        <CardDescription className="break-words text-xs sm:text-sm">
          {context === 'paciente' ? 'Documentos adjuntos al paciente' : 'Documentos adjuntos a esta cita'}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 sm:pt-6">
        <div className="space-y-2 sm:space-y-3">
          {documentos.map((documento) => (
            <div
              key={documento.id || documento._id || `doc-${documento.nombre}-${documento.createdAt}`}
              className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 rounded-lg border border-border p-3 sm:p-4 hover:bg-muted/50 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all shadow-sm hover:shadow-md"
            >
              <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  <div className="hidden sm:block">{getFileIcon(documento.mimeType)}</div>
                  <div className="sm:hidden">
                    {documento.mimeType.startsWith('image/') ? <FileImage className="h-6 w-6 text-blue-500" /> :
                     documento.mimeType.includes('pdf') ? <FileText className="h-6 w-6 text-red-500" /> :
                     documento.mimeType.includes('sheet') || documento.mimeType.includes('excel') ? <FileSpreadsheet className="h-6 w-6 text-green-500" /> :
                     <File className="h-6 w-6 text-gray-500" />}
                  </div>
                </div>

                <div className="flex-1 min-w-0 overflow-hidden">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <h4 className="text-sm sm:text-base font-medium truncate">{documento.nombre}</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground break-words">
                        {TIPO_LABELS[documento.tipo]} • {formatFileSize(documento.tamanio)}
                      </p>
                    </div>
                  </div>

                  {documento.descripcion && (
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 sm:mt-2 break-words">{documento.descripcion}</p>
                  )}

                  <div className="flex flex-wrap gap-2 sm:gap-4 mt-2 sm:mt-3 text-[10px] sm:text-xs text-muted-foreground">
                    {showCitaInfo && documento.citaId && typeof documento.citaId === 'object' && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">
                          Cita: {typeof documento.citaId === 'object' && documento.citaId && 'date' in documento.citaId 
                            ? formatDate((documento.citaId as { date: string }).date)
                            : 'N/A'}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{documento.uploadedBy?.name || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">
                        {formatDate(documento.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 sm:flex-col sm:gap-2 justify-end sm:justify-start flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(documento)}
                  className="flex-1 sm:flex-none h-8 sm:h-9 text-xs sm:text-sm"
                >
                  <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Descargar</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(documento.id || documento._id || '')}
                  disabled={deleting === (documento.id || documento._id)}
                  className="flex-1 sm:flex-none h-8 sm:h-9 text-xs sm:text-sm"
                >
                  <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Eliminar</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
