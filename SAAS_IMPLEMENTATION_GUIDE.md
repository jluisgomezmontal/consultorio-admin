# Guía de Implementación SaaS Multi-Tenant

## 📋 Resumen

Este proyecto ha sido convertido en un **SaaS multi-tenant** donde:
- Los **pacientes** pertenecen a un consultorio específico
- Los **doctores y recepcionistas** pueden trabajar en múltiples consultorios
- El **navbar** incluye un selector para cambiar entre consultorios asignados
- Solo se muestran datos (pacientes, citas, pagos, reportes) del consultorio activo
- Los **admins** tienen acceso a todos los datos sin restricciones

---

## 🎯 Arquitectura Implementada

### Backend

#### **Modelos Actualizados**

1. **User** (`consultoriosIds: ObjectId[]`)
   - Array de consultorios a los que pertenece el usuario
   - Permite múltiples consultorios por doctor/recepcionista

2. **Paciente** (`consultorioId: ObjectId`)
   - Cada paciente pertenece a UN consultorio específico

3. **Cita** (ya tenía `consultorioId`)
   - Cada cita está vinculada a un consultorio

4. **Pago** (`consultorioId: ObjectId`)
   - Cada pago se auto-asigna al consultorio de la cita

#### **Middleware de Filtrado**

- **`applyConsultorioFilter`**: Inyecta automáticamente filtros por consultorio
  - Para **admins**: No aplica filtros (acceso total)
  - Para **doctor/recepcionista**: Filtra por `consultoriosIds` asignados

#### **Servicios Actualizados**

Todos los servicios ahora aceptan `consultorioFilter`:
- `paciente.service.js`
- `cita.service.js`
- `pago.service.js`
- `reporte.service.js`

#### **Rutas con Filtrado**

Las rutas de `pacientes`, `citas` y `pagos` aplican el middleware:
```javascript
router.use(applyConsultorioFilter);
```

### Frontend

#### **ConsultorioContext**

Context provider que maneja:
- Lista de consultorios del usuario
- Consultorio activo seleccionado
- Persistencia en `localStorage`

#### **Navbar con Selector**

- Muestra selector solo si el usuario tiene **múltiples consultorios**
- No se muestra para **admins** (acceso total)
- Versión desktop y mobile

#### **Integración en Layout**

```tsx
<AuthProvider>
  <ConsultorioProvider>
    {children}
  </ConsultorioProvider>
</AuthProvider>
```

---

## 🚀 Pasos de Instalación

### 1. **Instalar Dependencias**

#### Backend
```bash
cd api-consultorio
npm install
```

#### Frontend
```bash
cd web-consultorio
npm install
```

### 2. **Ejecutar Migración de Usuarios**

Si ya tienes usuarios con `consultorioId` (ObjectId), migra a `consultoriosIds` (Array):

```bash
cd api-consultorio
node src/scripts/migrate-consultorios.js
```

**Resultado esperado:**
- Convierte `consultorioId` → `consultoriosIds: [consultorioId]`
- Todos los usuarios existentes podrán acceder a su consultorio original

### 3. **Ejecutar Migración de Pacientes y Pagos**

Asigna `consultorioId` a pacientes y pagos existentes:

```bash
cd api-consultorio
node src/scripts/migrate-add-consultorio-to-entities.js
```

**Comportamiento:**
- **Pacientes**: Toma el consultorioId de su primera cita. Si no tiene citas, usa el consultorio por defecto
- **Pagos**: Toma el consultorioId de la cita asociada

### 4. **Iniciar Servidores**

#### Backend
```bash
cd api-consultorio
npm run dev
```

#### Frontend
```bash
cd web-consultorio
npm run dev
```

---

## 🔧 Uso del Sistema

### Asignar Múltiples Consultorios a un Usuario

**Endpoint:** `PUT /api/users/:userId`

```json
{
  "consultoriosIds": [
    "60d5ec49f1a2c8b9f8e4e123",
    "60d5ec49f1a2c8b9f8e4e456"
  ]
}
```

### Crear Paciente en un Consultorio

**Endpoint:** `POST /api/pacientes`

```json
{
  "fullName": "Juan Pérez",
  "consultorioId": "60d5ec49f1a2c8b9f8e4e123",
  "phone": "5551234567",
  "email": "juan@example.com"
}
```

**Importante:** El frontend debe enviar el `consultorioId` del consultorio activo.

### Crear Cita

**Endpoint:** `POST /api/citas`

```json
{
  "pacienteId": "...",
  "doctorId": "...",
  "consultorioId": "60d5ec49f1a2c8b9f8e4e123",
  "date": "2024-06-15",
  "time": "10:00",
  "motivo": "Consulta general"
}
```

### Crear Pago

**Endpoint:** `POST /api/pagos`

```json
{
  "citaId": "...",
  "monto": 500,
  "metodo": "efectivo",
  "estatus": "pagado"
}
```

**Nota:** El `consultorioId` se asigna automáticamente desde la cita.

---

## 📊 Comportamiento por Rol

| Rol | Comportamiento |
|-----|----------------|
| **Admin** | - Acceso a todos los consultorios<br>- Ve todos los pacientes, citas y pagos<br>- No necesita selector de consultorio |
| **Doctor** | - Solo ve consultorios asignados (`consultoriosIds`)<br>- Selector en navbar si tiene múltiples consultorios<br>- Solo ve datos del consultorio activo |
| **Recepcionista** | - Solo ve consultorios asignados (`consultoriosIds`)<br>- Selector en navbar si tiene múltiples consultorios<br>- Solo ve datos del consultorio activo |

---

## 🎨 Frontend: Uso del Consultorio Activo

### Hook `useConsultorio`

```tsx
import { useConsultorio } from '@/contexts/ConsultorioContext';

function MyComponent() {
  const { selectedConsultorio, consultorios, setSelectedConsultorio } = useConsultorio();

  // Usar selectedConsultorio.id al crear pacientes/citas
  const handleCreatePaciente = async (data) => {
    await pacienteService.createPaciente({
      ...data,
      consultorioId: selectedConsultorio?.id,
    });
  };
}
```

### Ejemplo: Formulario de Crear Paciente

```tsx
const handleSubmit = async (values) => {
  await pacienteService.createPaciente({
    fullName: values.fullName,
    consultorioId: selectedConsultorio?.id, // ✅ Importante
    phone: values.phone,
    email: values.email,
  });
};
```

---

## 🔐 Validación y Seguridad

### Backend

1. **Middleware `applyConsultorioFilter`**
   - Filtra automáticamente por consultorios asignados
   - Evita que usuarios vean datos de otros consultorios

2. **Validación en Servicios**
   - `createCita`: Valida que el usuario tenga acceso al consultorio seleccionado
   - `updateCita`: Verifica acceso antes de modificar

3. **Validadores Zod**
   - `createPacienteSchema`: Requiere `consultorioId`

### Frontend

1. **ConsultorioContext**
   - Persiste selección en `localStorage`
   - Auto-selecciona primer consultorio al login

2. **Navbar**
   - Solo muestra selector si hay múltiples consultorios
   - Oculto para admins

---

## 🧪 Testing

### Pruebas Esenciales

#### 1. Login y Verificación de Consultorios
```bash
POST /api/auth/login
{
  "email": "doctor@example.com",
  "password": "password"
}

# Respuesta debe incluir:
{
  "user": {
    "consultoriosIds": ["60d5ec49f1a2c8b9f8e4e123"],
    "consultorios": [{ "id": "...", "name": "Consultorio A" }]
  }
}
```

#### 2. Filtrado de Citas
- **Doctor**: Solo debe ver citas de sus consultorios asignados
- **Admin**: Debe ver todas las citas

#### 3. Crear Paciente en Consultorio Específico
- Verificar que `consultorioId` se guarda correctamente
- Verificar que solo usuarios con acceso a ese consultorio lo ven

#### 4. Cambio de Consultorio en el Navbar
- Cambiar consultorio en el selector
- Verificar que las listas de pacientes/citas se actualizan

---

## 📝 Próximos Pasos Recomendados

### Actualizar Páginas del Frontend

Todas las páginas que **crean o editan** pacientes/citas deben usar el `consultorioId` del consultorio activo:

1. **Páginas de Pacientes**
   - `/pacientes/nuevo`
   - Agregar campo hidden con `selectedConsultorio.id`

2. **Páginas de Citas**
   - `/citas/nueva`
   - Auto-completar `consultorioId` del consultorio activo

3. **Dashboard**
   - Mostrar estadísticas filtradas por consultorio activo

4. **Reportes**
   - Filtrar reportes por consultorio activo

---

## 🐛 Troubleshooting

### Error: "Paciente not found or access denied"

**Causa:** Usuario intenta acceder a un paciente de un consultorio al que no tiene acceso.

**Solución:** Verifica que el usuario tenga ese `consultorioId` en su array `consultoriosIds`.

### Error: "consultorioId is required"

**Causa:** Se intenta crear un paciente sin `consultorioId`.

**Solución:** Asegúrate de enviar `consultorioId` desde el frontend usando `selectedConsultorio?.id`.

### Selector de Consultorio no Aparece

**Causa:** El usuario solo tiene un consultorio o es admin.

**Solución:** Esto es el comportamiento esperado. Asigna múltiples consultorios al usuario.

### Datos No se Filtran Correctamente

**Causa:** El middleware `applyConsultorioFilter` no está aplicado a la ruta.

**Solución:** Verifica que la ruta incluya:
```javascript
router.use(applyConsultorioFilter);
```

---

## 🎯 Checklist de Implementación

- [x] Modelos actualizados (User, Paciente, Pago)
- [x] Middleware `applyConsultorioFilter` implementado
- [x] Servicios actualizados con `consultorioFilter`
- [x] Controladores actualizados
- [x] Rutas con middleware aplicado
- [x] ConsultorioContext creado
- [x] Navbar con selector de consultorio
- [x] Scripts de migración creados
- [ ] Instalar dependencias npm
- [ ] Ejecutar migraciones
- [ ] Actualizar formularios del frontend para enviar consultorioId
- [ ] Testing completo por rol

---

## 📞 Soporte

Si encuentras problemas:
1. Revisa los logs del servidor backend
2. Verifica el Network tab del navegador (DevTools)
3. Confirma que las migraciones se ejecutaron correctamente
4. Asegúrate de que el usuario tenga consultorios asignados

---

## ✨ Mejoras Futuras

- [ ] Invitaciones a usuarios para unirse a consultorios
- [ ] Gestión de permisos por consultorio
- [ ] Dashboard de métricas por consultorio
- [ ] Exportación de reportes por consultorio
- [ ] Notificaciones segmentadas por consultorio
