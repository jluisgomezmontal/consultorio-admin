# ⚡ Quick Start - Offline-First en 5 Minutos

## 🚀 Instalación Rápida

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env.local

# 3. Ejecutar en desarrollo
npm run dev

# 4. O compilar para producción
npm run build
npm start
```

## ✅ Verificación Rápida

1. **Abrir** http://localhost:3001
2. **Iniciar sesión** con sus credenciales
3. **Abrir DevTools** (F12) → Application → IndexedDB
4. **Verificar** que existe `ConsultorioDB`
5. **Activar modo offline** (DevTools → Network → Offline)
6. **Intentar** crear un paciente
7. **Desactivar offline** → Ver sincronización automática

## 🎯 Componentes Principales

### 1. IndexedDB (Almacenamiento Local)
```
src/lib/db/
  ├── schema.ts              # Definición de tablas
  └── repositories/          # Acceso a datos
```

### 2. Sync Manager (Sincronización)
```
src/services/offline/
  ├── sync-manager.ts        # Gestor de sync
  ├── conflict-resolver.ts   # Resolución de conflictos
  └── offline-service-wrapper.ts
```

### 3. UI Components
```
src/components/offline/
  ├── OfflineIndicator.tsx   # Banner de estado
  ├── SyncProgress.tsx       # Barra de progreso
  ├── OfflineGuard.tsx       # Protección de rutas
  └── SyncStatusBadge.tsx    # Badge de estado
```

### 4. Contexts
```
src/contexts/
  └── OfflineContext.tsx     # Estado global offline
```

## 📝 Uso Básico

### Detectar Estado Offline
```tsx
import { useOffline } from '@/contexts/OfflineContext';

function MyComponent() {
  const { isOnline, syncStatus, pendingCount } = useOffline();
  
  return (
    <div>
      {!isOnline && <p>Sin conexión</p>}
      {syncStatus === 'syncing' && <p>Sincronizando {pendingCount} cambios</p>}
    </div>
  );
}
```

### Proteger Funcionalidad Online
```tsx
import { OfflineGuard } from '@/components/offline/OfflineGuard';

function DocumentUpload() {
  return (
    <OfflineGuard requireOnline customMessage="Debe estar conectado para subir documentos">
      <FileUploadForm />
    </OfflineGuard>
  );
}
```

### Mostrar Estado de Sync
```tsx
import { SyncStatusBadge } from '@/components/offline/SyncStatusBadge';

function PacienteItem({ paciente }) {
  return (
    <div>
      {paciente.fullName}
      <SyncStatusBadge status={paciente.syncStatus} showLabel />
    </div>
  );
}
```

## 🔧 Configuración

### Variables de Entorno (.env.local)
```env
NEXT_PUBLIC_MAX_OFFLINE_TIME=604800000    # 7 días
NEXT_PUBLIC_SYNC_INTERVAL=30000            # 30 seg
NEXT_PUBLIC_MAX_SYNC_RETRIES=5             # 5 intentos
```

## 🐛 Debug Rápido

### Activar Logs
```javascript
localStorage.setItem('offline_debug', 'true');
```

### Ver Estado
```javascript
// Cola de sincronización
db.syncQueue.toArray().then(console.log);

// Pacientes locales
db.pacientes.toArray().then(console.log);

// Metadata de auth
db.metadata.get('auth').then(console.log);
```

### Limpiar Datos
```javascript
// ⚠️ ADVERTENCIA: Elimina datos no sincronizados
indexedDB.deleteDatabase('ConsultorioDB');
```

## 📚 Recursos

- [Arquitectura Completa](./OFFLINE_ARCHITECTURE.md)
- [Guía de Instalación](./OFFLINE_INSTALLATION.md)
- [Guía de Usuario](./OFFLINE_USER_GUIDE.md)

## ✨ Features

- ✅ Detección automática online/offline
- ✅ Cola de sincronización con reintentos
- ✅ Resolución de conflictos (last-write-wins)
- ✅ Feedback visual claro
- ✅ Seguridad con expiración de sesión
- ✅ PWA installable
- ✅ Service Worker con cache strategies

---

¡Listo! Su aplicación ahora soporta modo offline. 🎉
