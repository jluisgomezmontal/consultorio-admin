# 🚀 Guía de Instalación - Sistema Offline-First

## 📦 Paso 1: Instalar Dependencias

Ejecute el siguiente comando en la terminal dentro del directorio `web-consultorio`:

```bash
npm install
```

Esto instalará las siguientes dependencias nuevas:
- `dexie` (v4.0.1) - IndexedDB wrapper
- `dexie-react-hooks` (v1.1.7) - React hooks para Dexie
- `next-pwa` (v5.6.0) - PWA support para Next.js
- `uuid` (v10.0.0) - Generación de IDs únicos
- `@types/uuid` (v10.0.0) - TypeScript types

## ⚙️ Paso 2: Configurar Variables de Entorno

Copie el archivo `.env.example` a `.env.local`:

```bash
cp .env.example .env.local
```

Edite `.env.local` y configure las siguientes variables:

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://tu-api.render.com/api

# Offline Configuration (valores por defecto - ajustar según necesidad)
NEXT_PUBLIC_MAX_OFFLINE_TIME=604800000      # 7 días en ms
NEXT_PUBLIC_SYNC_INTERVAL=30000              # 30 segundos
NEXT_PUBLIC_MAX_SYNC_RETRIES=5               # 5 reintentos
NEXT_PUBLIC_MAX_LOCAL_RECORDS=10000          # 10,000 registros
```

### Configuración Recomendada por Entorno

**Desarrollo:**
```env
NEXT_PUBLIC_MAX_OFFLINE_TIME=86400000        # 1 día
NEXT_PUBLIC_SYNC_INTERVAL=10000              # 10 segundos (más frecuente)
```

**Producción:**
```env
NEXT_PUBLIC_MAX_OFFLINE_TIME=604800000       # 7 días
NEXT_PUBLIC_SYNC_INTERVAL=30000              # 30 segundos
```

## 🖼️ Paso 3: Agregar Iconos PWA

Cree los siguientes iconos en la carpeta `public/`:

- `icon-192x192.png` (192x192 px)
- `icon-384x384.png` (384x384 px)
- `icon-512x512.png` (512x512 px)

**Herramientas recomendadas:**
- [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator)
- [Favicon.io](https://favicon.io/)
- [RealFaviconGenerator](https://realfavicongenerator.net/)

Puede usar cualquier imagen de su consultorio como base (logo, símbolo médico, etc.).

## 🔨 Paso 4: Compilar y Ejecutar

### Modo Desarrollo
```bash
npm run dev
```

**Nota:** En desarrollo, el Service Worker está deshabilitado por defecto para facilitar debugging.

### Modo Producción
```bash
npm run build
npm start
```

El Service Worker solo se activa en producción.

## ✅ Paso 5: Verificar Instalación

### 1. Verificar IndexedDB

Abra las DevTools de su navegador:
1. **Chrome/Edge:** F12 → Application → Storage → IndexedDB
2. **Firefox:** F12 → Storage → IndexedDB

Debería ver una base de datos llamada `ConsultorioDB` con las siguientes tablas:
- `pacientes`
- `citas`
- `syncQueue`
- `metadata`

### 2. Verificar Service Worker (solo en producción)

1. Abra DevTools → Application → Service Workers
2. Debería ver un Service Worker registrado
3. Estado: "activated and running"

### 3. Verificar PWA

1. Abra DevTools → Application → Manifest
2. Debería ver el contenido de `manifest.json`
3. Verifique que los iconos se carguen correctamente

### 4. Probar Modo Offline

1. Inicie sesión en la aplicación
2. Abra DevTools → Network
3. Seleccione "Offline" en el dropdown de throttling
4. La aplicación debería mostrar el banner: "🔴 Sin conexión a internet"
5. Intente crear un paciente o cita
6. Vuelva a "Online"
7. Debería ver: "🟡 Sincronizando datos..."
8. Luego: "🟢 Conectado y actualizado"

## 🐛 Solución de Problemas

### Error: "Cannot find module 'uuid'"
```bash
npm install uuid @types/uuid
```

### Error: "Cannot find module 'dexie'"
```bash
npm install dexie dexie-react-hooks
```

### El Service Worker no se registra
- Verifique que esté en modo producción (`npm run build && npm start`)
- Limpie el caché del navegador (Ctrl+Shift+Delete)
- Desregistre Service Workers anteriores en DevTools

### IndexedDB no se crea
- Verifique que el navegador soporte IndexedDB (todos los navegadores modernos)
- Revise la consola en busca de errores
- Asegúrese de que el navegador no esté en modo privado/incógnito

### La sincronización no funciona
- Verifique la conexión a internet
- Revise que `NEXT_PUBLIC_API_URL` esté configurado correctamente
- Abra la consola y ejecute: `localStorage.setItem('offline_debug', 'true')`
- Recargue la página y revise los logs detallados

### Errores de TypeScript
Los errores de TypeScript sobre módulos no encontrados se resolverán después de ejecutar `npm install`. Si persisten:
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📊 Monitoreo y Debug

### Activar Logs de Debug

En la consola del navegador:
```javascript
localStorage.setItem('offline_debug', 'true');
```

Recargue la página. Verá logs detallados de:
- Sincronización de datos
- Resolución de conflictos
- Estado de la cola
- Operaciones de IndexedDB

### Ver Estado de Sincronización

En la consola:
```javascript
// Ver cola de sincronización
db.syncQueue.toArray().then(console.log);

// Ver metadata de auth
db.metadata.get('auth').then(console.log);

// Ver pacientes locales
db.pacientes.toArray().then(console.log);

// Ver citas locales
db.citas.toArray().then(console.log);
```

### Limpiar Datos Locales

**⚠️ ADVERTENCIA:** Esto eliminará todos los datos offline no sincronizados.

```javascript
// Limpiar todo
indexedDB.deleteDatabase('ConsultorioDB');

// Limpiar solo syncQueue
db.syncQueue.clear();

// Limpiar solo pacientes
db.pacientes.clear();
```

## 🔄 Actualización desde Versión Anterior

Si ya tenía el proyecto instalado:

1. Hacer backup de `.env.local`
2. Ejecutar `npm install`
3. Copiar las nuevas variables de entorno de `.env.example` a `.env.local`
4. Ejecutar `npm run build`
5. Reiniciar el servidor

## 📱 Instalación como PWA

### En Android (Chrome)
1. Abra la aplicación en Chrome
2. Toque el menú (⋮) → "Agregar a la pantalla de inicio"
3. La app se instalará como aplicación nativa

### En iOS (Safari)
1. Abra la aplicación en Safari
2. Toque el botón de compartir
3. Seleccione "Agregar a la pantalla de inicio"

### En Desktop (Chrome/Edge)
1. Abra la aplicación
2. Clic en el ícono de instalación (➕) en la barra de direcciones
3. O menú → "Instalar Consultorio..."

## 🎯 Próximos Pasos

Una vez instalado correctamente:

1. Revise la [Arquitectura Offline-First](./OFFLINE_ARCHITECTURE.md)
2. Lea la [Guía de Uso](./OFFLINE_USER_GUIDE.md)
3. Pruebe todos los escenarios offline
4. Configure alertas de sincronización si es necesario

## 📞 Soporte

Si encuentra problemas:
1. Revise la sección de [Solución de Problemas](#-solución-de-problemas)
2. Active los logs de debug
3. Revise la consola del navegador
4. Verifique el estado de IndexedDB y Service Workers

---

**Versión:** 1.0.0  
**Última actualización:** Enero 2026
