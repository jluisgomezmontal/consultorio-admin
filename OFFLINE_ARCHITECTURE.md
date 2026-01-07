# 🌐 Arquitectura Offline-First - Sistema de Consultorios Médicos

## 📋 Tabla de Contenidos
1. [Visión General](#visión-general)
2. [Arquitectura por Capas](#arquitectura-por-capas)
3. [Flujo de Datos](#flujo-de-datos)
4. [Componentes Principales](#componentes-principales)
5. [Seguridad y Autenticación](#seguridad-y-autenticación)
6. [Estrategia de Sincronización](#estrategia-de-sincronización)
7. [Manejo de Conflictos](#manejo-de-conflictos)
8. [Experiencia de Usuario](#experiencia-de-usuario)
9. [Restricciones y Limitaciones](#restricciones-y-limitaciones)

---

## 🎯 Visión General

Esta arquitectura permite que médicos y recepcionistas trabajen sin interrupciones incluso cuando la conexión a internet es intermitente o inexistente, sincronizando automáticamente los datos cuando se restablece la conexión.

### Características Principales
- ✅ Detección automática de conectividad
- ✅ Almacenamiento local con IndexedDB (Dexie)
- ✅ Cola de sincronización con reintentos automáticos
- ✅ Resolución de conflictos con timestamps
- ✅ Feedback visual claro del estado
- ✅ Seguridad con tiempo de expiración offline
- ✅ PWA con Service Worker

---

## 🏗️ Arquitectura por Capas

### 1. **UI Layer** (Componentes React)
```
src/components/offline/
  ├── OfflineIndicator.tsx      # Banner de estado
  ├── SyncProgress.tsx           # Barra de progreso de sync
  └── OfflineGuard.tsx           # Wrapper para bloquear acciones
```

**Responsabilidad:** Mostrar el estado de conectividad y sincronización al usuario.

---

### 2. **Context Layer** (Estado Global)
```
src/contexts/
  ├── OfflineContext.tsx         # Estado de conectividad y sync
  └── AuthContext.tsx            # Autenticación (existente, mejorado)
```

**Responsabilidad:** Gestionar el estado global de conectividad, cola de sincronización y autenticación offline.

**Estados:**
- `online`: Conectado a internet
- `offline`: Sin conexión
- `syncing`: Sincronizando datos
- `synced`: Sincronización completada
- `sync_error`: Error en sincronización

---

### 3. **Service Layer** (Lógica de Negocio)
```
src/services/offline/
  ├── offline-service-wrapper.ts # Wrapper para servicios existentes
  ├── sync-manager.ts            # Gestor de sincronización
  └── conflict-resolver.ts       # Resolución de conflictos
```

**Responsabilidad:** Interceptar llamadas a API, redirigir a storage local si offline, y encolar operaciones.

**Flujo:**
1. Servicio intenta hacer request HTTP
2. Si online → Request normal al backend
3. Si offline → Guardar en IndexedDB + Agregar a cola de sync
4. Al reconectar → Procesar cola automáticamente

---

### 4. **Storage Layer** (IndexedDB con Dexie)
```
src/lib/db/
  ├── schema.ts                  # Esquemas de las tablas
  ├── db.ts                      # Configuración de Dexie
  └── repositories/
      ├── paciente-repository.ts
      ├── cita-repository.ts
      └── sync-queue-repository.ts
```

**Tablas:**
- `pacientes`: Copia local de pacientes
- `citas`: Copia local de citas
- `syncQueue`: Cola de operaciones pendientes
- `metadata`: Timestamps de última sincronización, tokens, etc.

**Esquema de syncQueue:**
```typescript
{
  id: string;              // UUID local
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: 'paciente' | 'cita';
  data: any;               // Datos a sincronizar
  localId: string;         // ID temporal local
  remoteId?: string;       // ID asignado por el servidor
  timestamp: number;       // Timestamp de creación
  retries: number;         // Intentos de sincronización
  status: 'pending' | 'syncing' | 'failed' | 'completed';
  error?: string;
}
```

---

### 5. **Service Worker Layer** (PWA)
```
public/
  └── sw.js                     # Service Worker para cache
```

**Responsabilidad:** Cache de assets estáticos, API responses, y background sync.

**Estrategias de Cache:**
- **Network First:** Para datos dinámicos (pacientes, citas)
- **Cache First:** Para assets estáticos (CSS, JS, imágenes)
- **Stale While Revalidate:** Para datos que cambian poco

---

## 🔄 Flujo de Datos

### Escenario 1: Usuario Online - Crear Paciente
```
[UI] → [Service] → [API Backend] → [IndexedDB] → [UI actualizada]
                       ↓
                   [200 OK]
                       ↓
              [Guardar en local cache]
```

### Escenario 2: Usuario Offline - Crear Paciente
```
[UI] → [Service] → [Detecta Offline] → [IndexedDB]
                                          ↓
                                    [Guardar paciente]
                                    [Crear tarea en syncQueue]
                                          ↓
                                    [UI actualizada con ID temporal]
```

### Escenario 3: Reconexión - Sincronización
```
[Network detecta Online] → [SyncManager]
                               ↓
                         [Procesar syncQueue]
                               ↓
                    [Para cada tarea pendiente:]
                         - Enviar al API
                         - Si 200 OK: Actualizar localId → remoteId
                         - Si error: Incrementar retries
                               ↓
                    [Actualizar UI con progreso]
```

---

## 🔐 Seguridad y Autenticación

### Gestión de Tokens Offline

**Almacenamiento Seguro:**
```typescript
metadata: {
  token: string;              // Access token
  refreshToken: string;       // Refresh token
  tokenExpiry: number;        // Timestamp de expiración
  lastOnlineTime: number;     // Última vez online
  userId: string;
}
```

**Reglas de Seguridad:**
1. **Token expirado:** Bloquear la app, solicitar reconexión
2. **Tiempo máximo offline:** 7 días (configurable)
3. **Después de 7 días offline:** Bloquear acceso, mostrar mensaje de reconexión
4. **Sin login previo:** No permitir acceso offline

**Implementación:**
```typescript
const MAX_OFFLINE_TIME = 7 * 24 * 60 * 60 * 1000; // 7 días

function canWorkOffline(): boolean {
  const metadata = await db.metadata.get('auth');
  
  if (!metadata || !metadata.token) return false;
  
  const now = Date.now();
  const offlineTime = now - metadata.lastOnlineTime;
  
  if (offlineTime > MAX_OFFLINE_TIME) {
    return false; // Bloquear app
  }
  
  if (now > metadata.tokenExpiry) {
    return false; // Token expirado
  }
  
  return true;
}
```

---

## 🔄 Estrategia de Sincronización

### Trigger de Sincronización
1. **Automático:** Al detectar reconexión
2. **Manual:** Botón "Sincronizar ahora"
3. **Periódico:** Cada 30 segundos cuando está online

### Prioridad de Sincronización
```
1. Alta: Citas del día actual
2. Media: Pacientes nuevos/editados
3. Baja: Registros antiguos
```

### Reintentos
- **Reintento inmediato:** Si falla por timeout
- **Backoff exponencial:** 1s, 2s, 4s, 8s, 16s, 30s
- **Máximo de reintentos:** 5
- **Después de 5 fallos:** Marcar como "requiere atención manual"

---

## ⚔️ Manejo de Conflictos

### Estrategia: Last-Write-Wins (LWW) con Timestamps

**Detección de Conflicto:**
```typescript
interface ConflictCheck {
  localTimestamp: number;    // Última modificación local
  remoteTimestamp: number;   // Última modificación en servidor
}

function hasConflict(local, remote): boolean {
  return local.updatedAt !== remote.updatedAt;
}
```

**Resolución:**
```typescript
function resolveConflict(local, remote) {
  // Comparar timestamps
  if (local.updatedAt > remote.updatedAt) {
    // Local gana - enviar al servidor
    return { winner: 'local', action: 'push' };
  } else {
    // Remoto gana - sobrescribir local
    return { winner: 'remote', action: 'pull' };
  }
}
```

**Casos Especiales:**
- **Eliminación + Edición:** Si se elimina en servidor pero se edita localmente → Notificar al usuario
- **Mismo timestamp:** Usar ID de usuario como desempate (menor ID gana)

---

## 🎨 Experiencia de Usuario

### Mensajes Claros para Usuarios No Técnicos

**Estado: Offline**
```
🔴 Sin conexión a internet
Los cambios se guardarán en este dispositivo y se sincronizarán automáticamente cuando haya conexión.
```

**Estado: Sincronizando**
```
🟡 Sincronizando datos...
Enviando 3 pacientes y 5 citas al servidor. Por favor espere.
[████████░░] 80%
```

**Estado: Sincronizado**
```
🟢 Conectado y actualizado
Todos los datos están sincronizados con el servidor.
```

**Estado: Error de Sincronización**
```
🔴 Error al sincronizar
No se pudieron sincronizar algunos cambios. Verifique su conexión e intente nuevamente.
[Botón: Reintentar ahora]
```

**Estado: Bloqueado por Tiempo**
```
🔒 Sesión expirada
Ha estado sin conexión por más de 7 días. Por favor conéctese a internet para continuar.
```

### Componentes Visuales

**Banner Superior:**
- Siempre visible
- Color según estado: Rojo (offline), Amarillo (syncing), Verde (online)
- Colapsa después de 5 segundos si está online

**Badge en Formularios:**
- Muestra si el registro es "solo local" o "sincronizado"
- Icono de nube con check (✓) o reloj (⏰)

**Lista de Pacientes/Citas:**
- Icono al lado de cada registro indicando estado de sincronización

---

## 🚫 Restricciones y Limitaciones

### Operaciones Prohibidas Offline
1. **Login de nuevo usuario:** Requiere conexión
2. **Recuperación de contraseña:** Requiere conexión
3. **Registro de nuevo usuario:** Requiere conexión
4. **Cambio de contraseña:** Requiere conexión
5. **Carga de documentos/imágenes:** Requiere conexión (se encola)
6. **Reportes con datos del servidor:** Requiere conexión

### Operaciones Permitidas Offline
1. ✅ Ver pacientes (previamente cargados)
2. ✅ Crear paciente nuevo
3. ✅ Editar paciente existente
4. ✅ Eliminar paciente (se sincroniza después)
5. ✅ Crear cita nueva
6. ✅ Editar cita existente
7. ✅ Ver historial de citas (previamente cargado)

### Límites de Almacenamiento Local
- **IndexedDB:** ~50 MB (varía por navegador)
- **Pacientes:** Hasta 10,000 registros
- **Citas:** Hasta 50,000 registros
- **Auto-limpieza:** Eliminar datos locales de más de 90 días

---

## 🔧 Configuración

### Variables de Entorno
```env
# Tiempo máximo offline (ms)
NEXT_PUBLIC_MAX_OFFLINE_TIME=604800000  # 7 días

# Intervalo de sincronización automática (ms)
NEXT_PUBLIC_SYNC_INTERVAL=30000  # 30 segundos

# Máximo de reintentos por operación
NEXT_PUBLIC_MAX_SYNC_RETRIES=5

# Límite de registros en caché
NEXT_PUBLIC_MAX_LOCAL_RECORDS=10000
```

---

## 📊 Monitoreo y Debugging

### Console Logs
```typescript
// Activar logs de debug
localStorage.setItem('offline_debug', 'true');

// Ver estado de sincronización
console.log(await db.syncQueue.toArray());

// Ver metadatos
console.log(await db.metadata.toArray());
```

### Métricas a Monitorear
1. Tamaño de syncQueue
2. Tasa de éxito de sincronización
3. Tiempo promedio offline por usuario
4. Conflictos resueltos por día

---

## 🚀 Plan de Implementación

### Fase 1: Fundamentos (Semana 1)
- [x] Instalar dependencias (Dexie, Workbox)
- [ ] Configurar IndexedDB con esquemas
- [ ] Implementar OfflineContext
- [ ] Crear hook useOnlineStatus

### Fase 2: Storage & Sync (Semana 2)
- [ ] Crear repositories (paciente, cita, syncQueue)
- [ ] Implementar SyncManager
- [ ] Implementar ConflictResolver
- [ ] Crear offline service wrapper

### Fase 3: UI & UX (Semana 3)
- [ ] Componente OfflineIndicator
- [ ] Componente SyncProgress
- [ ] Actualizar formularios con estado offline
- [ ] Mensajes de usuario

### Fase 4: PWA & Testing (Semana 4)
- [ ] Configurar Service Worker
- [ ] Manifest.json para PWA
- [ ] Pruebas de sincronización
- [ ] Pruebas de conflictos
- [ ] Documentación final

---

## 📚 Referencias Técnicas

**Librerías Utilizadas:**
- **Dexie.js:** IndexedDB wrapper con API simplificada
- **Workbox:** Service Worker toolkit de Google
- **React Query:** Cache y sincronización de estado servidor

**Patrones de Diseño:**
- Repository Pattern (acceso a datos)
- Observer Pattern (notificaciones de cambio)
- Queue Pattern (sincronización ordenada)
- Strategy Pattern (resolución de conflictos)

---

## ✅ Checklist de Seguridad

- [ ] Tokens nunca se almacenan en texto plano
- [ ] Verificación de expiración de token antes de cada operación offline
- [ ] Bloqueo automático después de tiempo máximo offline
- [ ] Limpieza de datos sensibles al logout
- [ ] Validación de permisos antes de sincronizar
- [ ] Cifrado de datos sensibles en IndexedDB (opcional, futuro)

---

**Versión:** 1.0.0  
**Última actualización:** Enero 2026  
**Autor:** Sistema de Arquitectura Offline-First
