# Sistema de Documentos - Frontend

## Componentes Creados

### 1. DocumentUploader
Componente para subir documentos a una cita médica.

**Ubicación:** `src/components/DocumentUploader.tsx`

**Props:**
- `citaId`: ID de la cita
- `pacienteId`: ID del paciente
- `onUploadSuccess`: Callback cuando se sube exitosamente

**Uso:**
```tsx
<DocumentUploader
  citaId={citaId}
  pacienteId={pacienteId}
  onUploadSuccess={(documento) => {
    console.log('Documento subido:', documento);
    // Actualizar lista de documentos
  }}
/>
```

### 2. DocumentList
Componente para mostrar lista de documentos con opciones de descarga y eliminación.

**Ubicación:** `src/components/DocumentList.tsx`

**Props:**
- `documentos`: Array de documentos
- `onDelete`: Callback cuando se elimina un documento
- `showCitaInfo`: Mostrar información de la cita (opcional)

**Uso:**
```tsx
<DocumentList
  documentos={documentos}
  onDelete={(id) => {
    // Actualizar lista después de eliminar
    setDocumentos(docs => docs.filter(d => d.id !== id));
  }}
  showCitaInfo={true}
/>
```

## Servicio de Documentos

**Ubicación:** `src/services/documento.service.ts`

### Métodos Disponibles:

```typescript
// Subir documento
await documentoService.uploadDocumento({
  file: File,
  citaId: string,
  pacienteId: string,
  tipo: 'receta' | 'laboratorio' | 'imagen' | 'estudio' | 'consentimiento' | 'historial' | 'otro',
  nombre?: string,
  descripcion?: string
});

// Obtener documentos por cita
await documentoService.getDocumentosByCita(citaId);

// Obtener documentos por paciente (paginado)
await documentoService.getDocumentosByPaciente(pacienteId, page, limit);

// Obtener documento por ID
await documentoService.getDocumentoById(id);

// Eliminar documento
await documentoService.deleteDocumento(id);

// Actualizar documento
await documentoService.updateDocumento(id, { nombre, descripcion, tipo });

// Descargar documento
documentoService.downloadDocumento(downloadUrl, fileName);
```

## Integración en Páginas Existentes

### Ejemplo: Página de Detalle de Cita

```tsx
'use client';

import { useState, useEffect } from 'react';
import { DocumentUploader } from '@/components/DocumentUploader';
import { DocumentList } from '@/components/DocumentList';
import { documentoService } from '@/services/documento.service';
import { useQuery } from '@tanstack/react-query';

export default function CitaDetailPage({ params }: { params: { id: string } }) {
  const { data: documentos, refetch } = useQuery({
    queryKey: ['documentos-cita', params.id],
    queryFn: () => documentoService.getDocumentosByCita(params.id),
  });

  return (
    <div className="space-y-6">
      {/* Información de la cita */}
      
      {/* Subir documentos */}
      <DocumentUploader
        citaId={params.id}
        pacienteId={cita.pacienteId}
        onUploadSuccess={() => refetch()}
      />

      {/* Lista de documentos */}
      <DocumentList
        documentos={documentos?.data || []}
        onDelete={() => refetch()}
      />
    </div>
  );
}
```

### Ejemplo: Historial de Documentos del Paciente

```tsx
'use client';

import { DocumentList } from '@/components/DocumentList';
import { documentoService } from '@/services/documento.service';
import { useQuery } from '@tanstack/react-query';

export default function PacienteDocumentosPage({ params }: { params: { id: string } }) {
  const { data, isLoading } = useQuery({
    queryKey: ['documentos-paciente', params.id],
    queryFn: () => documentoService.getDocumentosByPaciente(params.id, 1, 50),
  });

  if (isLoading) return <div>Cargando...</div>;

  return (
    <div>
      <h1>Documentos del Paciente</h1>
      <DocumentList
        documentos={data?.documentos || []}
        showCitaInfo={true}
      />
    </div>
  );
}
```

## Tipos de Documentos

- **receta**: Recetas médicas
- **laboratorio**: Resultados de laboratorio
- **imagen**: Imágenes médicas (rayos X, resonancias, etc.)
- **estudio**: Estudios médicos
- **consentimiento**: Consentimientos informados
- **historial**: Historial clínico
- **otro**: Otros documentos

## Validaciones

- Tamaño máximo: 10MB
- Tipos de archivo permitidos:
  - PDF
  - Imágenes (JPG, PNG, GIF, WebP)
  - Word (DOC, DOCX)
  - Excel (XLS, XLSX)

## Características

✅ Subida de archivos con drag & drop
✅ Preview del archivo antes de subir
✅ Validación de tamaño y tipo
✅ Descarga segura con URLs firmadas
✅ Eliminación con confirmación
✅ Metadatos (nombre, descripción, tipo)
✅ Información de quién subió y cuándo
✅ Filtrado por cita o paciente
✅ Paginación para grandes volúmenes

## Próximos Pasos

1. Integrar en la página de detalle de citas
2. Agregar tab de documentos en el perfil del paciente
3. Agregar búsqueda de documentos
4. Agregar filtros por tipo de documento
5. Agregar vista previa de imágenes y PDFs
6. Agregar notificaciones cuando se sube un documento
