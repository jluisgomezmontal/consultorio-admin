# Implementación de Desactivación de Usuarios - SaaS

## Resumen
Se ha implementado la funcionalidad completa para que el administrador pueda activar/desactivar usuarios, bloqueando su acceso a la aplicación de forma similar a un sistema SaaS.

## Cambios Realizados

### Backend (API)

1. **Modelo User** (`api-consultorio/src/models/User.model.js`)
   - ✅ Campo `isActive` agregado al schema (Boolean, default: true, indexed)

2. **Servicio de Autenticación** (`api-consultorio/src/services/auth.service.js`)
   - ✅ Validación de cuenta activa en `login()`
   - ✅ Validación de cuenta activa en `refreshToken()`
   - ✅ Mensaje: "Account is deactivated. Please contact the administrator."

3. **Middleware de Autenticación** (`api-consultorio/src/middlewares/auth.js`)
   - ✅ Verificación de `isActive` en cada request autenticado
   - ✅ Cierra sesión automáticamente si la cuenta está desactivada

4. **Servicio de Usuarios** (`api-consultorio/src/services/user.service.js`)
   - ✅ Método `toggleUserStatus(id, isActive)` para activar/desactivar usuarios

5. **Controlador de Usuarios** (`api-consultorio/src/controllers/user.controller.js`)
   - ✅ Método `toggleUserStatus()` para manejar el endpoint

6. **Validadores** (`api-consultorio/src/validators/user.validator.js`)
   - ✅ Schema `toggleUserStatusSchema` para validar el request

7. **Rutas** (`api-consultorio/src/routes/user.routes.js`)
   - ✅ Nueva ruta: `PATCH /users/:id/status` (solo admin)

### Frontend (Web)

1. **Servicios**
   - ✅ `user.service.ts`: Agregado campo `isActive` a interfaz `User`
   - ✅ `user.service.ts`: Método `toggleUserStatus(id, isActive)`
   - ✅ `auth.service.ts`: Campo `isActive` en interfaz `User`

2. **Componentes UI**
   - ✅ `switch.tsx`: Componente Switch creado (requiere instalación de dependencia)

3. **Página de Edición de Usuario** (`/users/[id]/page.tsx`)
   - ✅ Nueva sección "Estado de la Cuenta" con switch para activar/desactivar
   - ✅ Indicador visual del estado (Activo/Desactivado)
   - ✅ Alerta cuando la cuenta está desactivada

4. **Lista de Usuarios** (`/users/page.tsx`)
   - ✅ Columna "Estado" en tabla de escritorio
   - ✅ Badge de estado en vista móvil
   - ✅ Indicadores visuales (verde=activo, rojo=inactivo)

5. **Autenticación** (`AuthContext.tsx`)
   - ✅ Verificación de `isActive` al cargar usuario
   - ✅ Redirección a login con parámetro `?deactivated=true`
   - ✅ Cierre de sesión automático si cuenta desactivada

6. **Página de Login** (`/login/page.tsx`)
   - ✅ Detección de parámetro `deactivated`
   - ✅ Mensaje: "Tu cuenta ha sido desactivada. Por favor, contacta al administrador."

7. **API Client** (`lib/api-client.ts`)
   - ✅ Interceptor actualizado para detectar errores de cuenta desactivada
   - ✅ Redirección automática a `/login?deactivated=true`
   - ✅ Limpieza de tokens en localStorage

## Instalación Requerida

### Dependencia Faltante
Para que el componente Switch funcione correctamente, necesitas instalar:

```bash
cd web-consultorio
npm install @radix-ui/react-switch
```

O si usas pnpm:
```bash
cd web-consultorio
pnpm add @radix-ui/react-switch
```

## Flujo de Funcionamiento

### 1. Desactivación de Usuario
1. Admin va a `/users/[id]`
2. En la sección "Estado de la Cuenta", desactiva el switch
3. El usuario queda marcado como `isActive: false` en la base de datos

### 2. Usuario Desactivado Intenta Usar la App
1. Si está logueado:
   - El middleware detecta `isActive: false`
   - Retorna error 401: "Account is deactivated. Please contact the administrator."
   - Frontend cierra sesión y redirige a `/login?deactivated=true`

2. Si intenta hacer login:
   - El servicio de auth valida `isActive`
   - Retorna error 401 con el mismo mensaje
   - Se muestra en la página de login

### 3. Reactivación
1. Admin activa el switch en `/users/[id]`
2. Usuario puede volver a iniciar sesión normalmente

## Endpoints API

### Toggle User Status
```
PATCH /api/users/:id/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "isActive": true | false
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "...",
    "email": "...",
    "role": "...",
    "isActive": true,
    "consultoriosIds": [...],
    "consultorios": [...]
  },
  "message": "User activated successfully" | "User deactivated successfully"
}
```

## Seguridad

- ✅ Solo usuarios con rol `admin` pueden activar/desactivar usuarios
- ✅ La validación se hace en múltiples capas:
  - Login
  - Refresh token
  - Cada request autenticado (middleware)
- ✅ El campo `isActive` está indexado para mejor performance
- ✅ Mensajes de error consistentes en toda la aplicación

## Testing Recomendado

1. **Como Admin:**
   - Desactivar un usuario desde `/users/[id]`
   - Verificar que el badge cambia a "Inactivo" en la lista

2. **Como Usuario Desactivado:**
   - Intentar hacer login → Ver mensaje de cuenta desactivada
   - Si ya estaba logueado, hacer cualquier acción → Sesión cerrada automáticamente

3. **Reactivación:**
   - Admin reactiva el usuario
   - Usuario puede volver a iniciar sesión

## Notas Importantes

- El campo `isActive` ya existe en el modelo User con valor por defecto `true`
- Todos los usuarios existentes se consideran activos por defecto
- No es necesario migración de datos
- La funcionalidad es completamente retrocompatible
