# Sistema de Gestión de Documentos Médicos con AWS S3

## 📋 Resumen

He implementado un sistema completo de gestión de documentos médicos que permite:
- ✅ Subir documentos a citas médicas (recetas, laboratorios, imágenes, etc.)
- ✅ Almacenamiento seguro en AWS S3
- ✅ Descarga con URLs firmadas (expiran en 1 hora)
- ✅ Organización por paciente y cita
- ✅ Control de permisos por consultorio
- ✅ Validación de archivos (tipo y tamaño)

## 🚀 Pasos para Implementar

### 1. Backend - Instalar Dependencias

```bash
cd api-consultorio
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner multer
```

### 2. Configurar AWS S3

#### A. Crear Bucket en AWS
1. Ve a https://console.aws.amazon.com/s3/
2. Crear bucket: `consultorio-documentos`
3. Región: `us-east-1`
4. Configurar CORS (ver `api-consultorio/DOCUMENTOS_SETUP.md`)

#### B. Crear Usuario IAM
1. Ve a IAM en AWS Console
2. Crear usuario: `consultorio-app`
3. Adjuntar política: `AmazonS3FullAccess`
4. Guardar Access Key ID y Secret Access Key

#### C. Configurar Variables de Entorno
Agregar a `api-consultorio/.env`:

```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=tu_access_key_aqui
AWS_SECRET_ACCESS_KEY=tu_secret_key_aqui
AWS_REGION=us-east-1
AWS_S3_BUCKET=consultorio-documentos
```

### 3. Reiniciar Backend

```bash
cd api-consultorio
npm run dev
```

### 4. Frontend - Sin Dependencias Adicionales

El frontend ya está listo para usar. Los componentes creados son:

- `DocumentUploader.tsx` - Para subir documentos
- `DocumentList.tsx` - Para mostrar y gestionar documentos
- `documento.service.ts` - Servicio de API

## 📁 Archivos Creados

### Backend (`api-consultorio/src/`)

```
models/
  └── Documento.js                    # Modelo de MongoDB

config/
  └── aws.js                          # Configuración de AWS S3

services/
  ├── s3.service.js                   # Servicio de S3
  └── documento.service.js            # Lógica de negocio

controllers/
  └── documento.controller.js         # Controlador de endpoints

middlewares/
  └── upload.js                       # Middleware de Multer

routes/
  └── documento.routes.js             # Rutas de API
```

### Frontend (`web-consultorio/src/`)

```
services/
  └── documento.service.ts            # Cliente de API

components/
  ├── DocumentUploader.tsx            # Componente de subida
  └── DocumentList.tsx                # Componente de lista
```

## 🔌 Endpoints de la API

### Subir Documento
```
POST /api/documentos
Content-Type: multipart/form-data
Authorization: Bearer {token}

Body:
- file: archivo
- citaId: ID de la cita
- pacienteId: ID del paciente
- tipo: tipo de documento
- nombre: nombre (opcional)
- descripcion: descripción (opcional)
```

### Obtener Documentos por Cita
```
GET /api/documentos/cita/:citaId
Authorization: Bearer {token}
```

### Obtener Documentos por Paciente
```
GET /api/documentos/paciente/:pacienteId?page=1&limit=20
Authorization: Bearer {token}
```

### Eliminar Documento
```
DELETE /api/documentos/:id
Authorization: Bearer {token}
```

## 💻 Ejemplo de Uso en el Frontend

### En la Página de Detalle de Cita

```tsx
'use client';

import { DocumentUploader } from '@/components/DocumentUploader';
import { DocumentList } from '@/components/DocumentList';
import { documentoService } from '@/services/documento.service';
import { useQuery } from '@tanstack/react-query';

export default function CitaDetailPage({ params }: { params: { id: string } }) {
  // Obtener documentos de la cita
  const { data: documentos, refetch } = useQuery({
    queryKey: ['documentos-cita', params.id],
    queryFn: () => documentoService.getDocumentosByCita(params.id),
  });

  return (
    <div className="space-y-6">
      {/* Información de la cita */}
      <CitaInfo cita={cita} />

      {/* Subir nuevos documentos */}
      <DocumentUploader
        citaId={params.id}
        pacienteId={cita.pacienteId}
        onUploadSuccess={() => {
          refetch(); // Actualizar lista
        }}
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

## 🎨 Tipos de Documentos Soportados

| Tipo | Descripción | Uso |
|------|-------------|-----|
| `receta` | Recetas médicas | Prescripciones |
| `laboratorio` | Resultados de laboratorio | Análisis clínicos |
| `imagen` | Imágenes médicas | Rayos X, resonancias |
| `estudio` | Estudios médicos | Electrocardiogramas, etc. |
| `consentimiento` | Consentimientos informados | Autorizaciones |
| `historial` | Historial clínico | Expedientes |
| `otro` | Otros documentos | Misceláneos |

## 🔒 Seguridad

- ✅ Autenticación JWT requerida
- ✅ Control de permisos por consultorio
- ✅ URLs firmadas con expiración (1 hora)
- ✅ Validación de tipos de archivo
- ✅ Límite de tamaño (10MB)
- ✅ Sanitización de nombres de archivo

## 💰 Costos Estimados de AWS S3

Para un consultorio pequeño/mediano:
- **Almacenamiento**: ~$0.023 por GB/mes
- **Transferencia**: Primeros 100GB gratis/mes
- **Solicitudes**: ~$0.0004 por 1000 solicitudes

**Ejemplo:** 1000 documentos (500MB) + 10,000 descargas/mes ≈ **$1-2 USD/mes**

## 🔄 Flujo de Trabajo

1. **Doctor/Recepcionista** sube documento en la cita
2. Archivo se valida (tipo y tamaño)
3. Se sube a AWS S3 con nombre único
4. Se guarda metadata en MongoDB
5. Se genera URL firmada para descarga
6. Usuario puede descargar con URL temporal
7. URL expira después de 1 hora (seguridad)

## 📊 Modelo de Datos

```javascript
{
  nombre: String,              // "Receta - Antibiótico"
  descripcion: String,         // "Tratamiento para infección"
  tipo: String,                // "receta"
  url: String,                 // URL pública de S3
  s3Key: String,               // "documentos/123-abc.pdf"
  mimeType: String,            // "application/pdf"
  tamanio: Number,             // 1024000 (bytes)
  citaId: ObjectId,            // Referencia a cita
  pacienteId: ObjectId,        // Referencia a paciente
  consultorioId: ObjectId,     // Referencia a consultorio
  uploadedBy: ObjectId,        // Usuario que subió
  createdAt: Date,
  updatedAt: Date
}
```

## 🎯 Próximos Pasos Sugeridos

1. ✅ **Integrar en página de citas** - Agregar tabs de documentos
2. ✅ **Agregar en perfil de paciente** - Historial completo
3. 🔲 **Vista previa de PDFs** - Visualizar sin descargar
4. 🔲 **Galería de imágenes** - Ver imágenes médicas
5. 🔲 **Búsqueda de documentos** - Filtrar por tipo/fecha
6. 🔲 **Notificaciones** - Avisar cuando se sube documento
7. 🔲 **Compartir documentos** - Enviar por email
8. 🔲 **Firma digital** - Para consentimientos

## 🐛 Troubleshooting

### Error: "Access Denied" en S3
- Verificar credenciales de AWS en `.env`
- Verificar permisos del usuario IAM
- Verificar política del bucket

### Error: "File too large"
- Verificar límite en `MAX_FILE_SIZE` (config/aws.js)
- Verificar límite en Express (index.js: `limit: '10mb'`)

### Error: "Invalid file type"
- Verificar `ALLOWED_MIME_TYPES` en config/aws.js
- Agregar tipo de archivo si es necesario

## 📚 Documentación Adicional

- **Backend Setup**: `api-consultorio/DOCUMENTOS_SETUP.md`
- **Frontend Guide**: `web-consultorio/DOCUMENTOS_FRONTEND.md`
- **AWS S3 Docs**: https://docs.aws.amazon.com/s3/

## ✅ Checklist de Implementación

- [ ] Instalar dependencias del backend
- [ ] Crear bucket en AWS S3
- [ ] Crear usuario IAM con permisos
- [ ] Configurar variables de entorno
- [ ] Configurar CORS en S3
- [ ] Reiniciar servidor backend
- [ ] Probar subida de documento con Postman
- [ ] Integrar componentes en el frontend
- [ ] Probar flujo completo
- [ ] Configurar límites de producción
- [ ] Configurar backups de S3 (opcional)

## 🎉 ¡Listo!

El sistema está completamente implementado y listo para usar. Solo necesitas:
1. Configurar AWS S3
2. Instalar dependencias
3. Agregar variables de entorno
4. Integrar los componentes donde los necesites

¿Necesitas ayuda con algún paso específico? ¡Pregunta!
