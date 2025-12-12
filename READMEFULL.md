# Sistema de Gestión de Consultorios - SaaS Multi-Tenant

Sistema web full-stack para la gestión integral de consultorios médicos con arquitectura multi-tenant SaaS.

## 🌟 Características Principales

### Multi-Tenant SaaS
- **Múltiples Consultorios**: Doctores y recepcionistas pueden trabajar en varios consultorios
- **Selector de Consultorio**: Interfaz para cambiar entre consultorios asignados
- **Filtrado Automático**: Solo se muestran datos del consultorio activo
- **Segmentación de Datos**: Pacientes, citas y pagos por consultorio

### Gestión Completa
- **Pacientes**: Registro, historial médico, alergias, notas
- **Citas**: Programación, estados, conflictos de horarios
- **Pagos**: Registro, seguimiento, reportes de ingresos
- **Usuarios**: Roles (Admin, Doctor, Recepcionista)
- **Reportes**: Estadísticas y métricas por consultorio

### Seguridad
- Autenticación JWT
- Control de acceso basado en roles (RBAC)
- Filtrado automático por consultorio
- Validación de datos con Zod

---

## 🛠️ Stack Tecnológico

### Backend
- **Node.js** + **Express.js**
- **MongoDB** con **Mongoose**
- **JWT** para autenticación
- **Zod** para validación
- **Helmet**, **CORS**, **Rate Limiting**

### Frontend
- **Next.js 16** (App Router)
- **React 19** + **TypeScript**
- **TailwindCSS** para estilos
- **Shadcn/UI** para componentes
- **TanStack Query** (React Query)
- **React Hook Form** + **Zod**

---

## 📦 Instalación

### Requisitos Previos
- Node.js 20+
- MongoDB 6+
- npm o yarn

### 1. Clonar Repositorio

```bash
git clone <repository-url>
cd consultorio
```

### 2. Backend Setup

```bash
cd api-consultorio
npm install
```

Crear archivo `.env`:

```env
# Server
PORT=3000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb://localhost:27017/consultorio

# JWT
JWT_SECRET=tu_secreto_super_seguro_aqui
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=tu_refresh_secret_aqui
JWT_REFRESH_EXPIRES_IN=30d

# CORS
ALLOWED_ORIGINS=http://localhost:3001
```

### 3. Frontend Setup

```bash
cd ../web-consultorio
npm install
```

Crear archivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 4. Ejecutar Migraciones

#### Migrar usuarios existentes a multi-consultorio

```bash
cd api-consultorio
node src/scripts/migrate-consultorios.js
```

#### Agregar consultorioId a pacientes y pagos

```bash
node src/scripts/migrate-add-consultorio-to-entities.js
```

### 5. Seed de Datos (Opcional)

```bash
cd api-consultorio
node seed.js
```

Esto crea:
- 1 Admin
- 2 Consultorios
- 3 Doctores
- 2 Recepcionistas
- 10 Pacientes
- 15 Citas
- 12 Pagos

### 6. Iniciar Aplicación

#### Terminal 1 - Backend
```bash
cd api-consultorio
npm run dev
```

Backend corriendo en: `http://localhost:3000`

#### Terminal 2 - Frontend
```bash
cd web-consultorio
npm run dev
```

Frontend corriendo en: `http://localhost:3001`

---

## 👥 Usuarios de Prueba

Después del seed, puedes iniciar sesión con:

### Admin
- **Email**: `admin@consultorio.com`
- **Password**: `admin123`
- **Permisos**: Acceso total a todos los consultorios

### Doctor
- **Email**: `doctor1@consultorio.com` o `doctor2@consultorio.com`
- **Password**: `password123`
- **Permisos**: Consultorios asignados

### Recepcionista
- **Email**: `recep1@consultorio.com`
- **Password**: `password123`
- **Permisos**: Consultorios asignados

---

## 🎯 Uso del Sistema

### Como Doctor/Recepcionista

1. **Login** en `http://localhost:3001/login`
2. **Selector de Consultorio** aparece en el navbar (si tienes múltiples consultorios)
3. **Cambiar Consultorio** afecta qué pacientes, citas y pagos ves
4. **Crear Paciente**: Auto-asigna al consultorio activo
5. **Crear Cita**: Auto-selecciona consultorio activo

### Como Admin

- Acceso a **todos los consultorios**
- Puede **gestionar usuarios** y asignar consultorios
- **No necesita** selector de consultorio (ve todo)

---

## 📁 Estructura del Proyecto

```
consultorio/
├── api-consultorio/           # Backend API
│   ├── src/
│   │   ├── config/           # Configuración DB
│   │   ├── controllers/      # Controladores
│   │   ├── middlewares/      # Auth, validación, errores
│   │   ├── models/           # Modelos Mongoose
│   │   ├── routes/           # Rutas Express
│   │   ├── scripts/          # Scripts de migración
│   │   ├── services/         # Lógica de negocio
│   │   ├── utils/            # Utilidades
│   │   └── validators/       # Schemas Zod
│   ├── seed.js              # Seed de datos
│   └── package.json
│
└── web-consultorio/          # Frontend Next.js
    ├── src/
    │   ├── app/             # App Router (páginas)
    │   ├── components/      # Componentes React
    │   ├── contexts/        # Context Providers
    │   ├── lib/             # Utilidades
    │   ├── providers/       # Providers globales
    │   └── services/        # Servicios API
    └── package.json
```

---

## 🔐 Arquitectura Multi-Tenant

### Backend

#### Middleware de Filtrado
```javascript
// applyConsultorioFilter
// - Admins: Sin filtro (acceso total)
// - Doctor/Recep: Filtra por consultoriosIds asignados
```

#### Modelos

```javascript
// User
{
  consultoriosIds: [ObjectId], // Array de consultorios
}

// Paciente
{
  consultorioId: ObjectId, // Pertenece a UN consultorio
}

// Cita
{
  consultorioId: ObjectId,
}

// Pago
{
  consultorioId: ObjectId, // Auto-asignado desde cita
}
```

### Frontend

#### ConsultorioContext
```tsx
const { selectedConsultorio, setSelectedConsultorio } = useConsultorio();

// Usar en formularios
consultorioId: selectedConsultorio?.id
```

#### Navbar con Selector
- Solo muestra si usuario tiene múltiples consultorios
- Persiste selección en localStorage
- Oculto para admins

---

## 📊 API Endpoints

### Auth
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Usuario actual
- `POST /api/auth/refresh` - Refresh token

### Pacientes
- `GET /api/pacientes` - Listar (filtrado por consultorio)
- `POST /api/pacientes` - Crear (requiere consultorioId)
- `GET /api/pacientes/:id` - Obtener uno
- `PUT /api/pacientes/:id` - Actualizar
- `DELETE /api/pacientes/:id` - Eliminar (Admin)
- `GET /api/pacientes/:id/historial` - Historial médico

### Citas
- `GET /api/citas` - Listar (filtrado por consultorio)
- `POST /api/citas` - Crear
- `GET /api/citas/:id` - Obtener una
- `PUT /api/citas/:id` - Actualizar
- `DELETE /api/citas/:id` - Eliminar
- `PATCH /api/citas/:id/cancelar` - Cancelar

### Pagos
- `GET /api/pagos` - Listar (filtrado por consultorio)
- `POST /api/pagos` - Crear (auto-asigna consultorio)
- `GET /api/pagos/:id` - Obtener uno
- `PUT /api/pagos/:id` - Actualizar
- `DELETE /api/pagos/:id` - Eliminar

### Consultorios
- `GET /api/consultorios` - Listar
- `POST /api/consultorios` - Crear (Admin)
- `GET /api/consultorios/:id` - Obtener uno
- `PUT /api/consultorios/:id` - Actualizar (Admin)
- `DELETE /api/consultorios/:id` - Eliminar (Admin)

### Usuarios
- `GET /api/users` - Listar (Admin)
- `POST /api/users` - Crear (Admin)
- `GET /api/users/:id` - Obtener uno
- `PUT /api/users/:id` - Actualizar
- `DELETE /api/users/:id` - Eliminar (Admin)

---

## 🧪 Testing

### Verificar Filtrado por Consultorio

1. Login como doctor con múltiples consultorios
2. Crear paciente en Consultorio A
3. Cambiar a Consultorio B en navbar
4. Verificar que el paciente NO aparece
5. Cambiar de vuelta a Consultorio A
6. Verificar que el paciente SÍ aparece

### Verificar Acceso de Admin

1. Login como admin
2. Ver todos los pacientes sin importar consultorio
3. No debe aparecer selector de consultorio

---

## 📝 Siguientes Pasos

### Funcionalidad Pendiente

- [ ] **Instalar** `@radix-ui/react-select` en el frontend
  ```bash
  cd web-consultorio
  npm install
  ```

- [ ] **Actualizar** más formularios para usar `selectedConsultorio`
  - Editar paciente
  - Dashboard con filtros
  - Reportes por consultorio

- [ ] **Testing** completo de todos los flujos

### Mejoras Futuras

- [ ] Invitaciones a usuarios para unirse a consultorios
- [ ] Permisos granulares por consultorio
- [ ] Notificaciones por email/SMS
- [ ] Calendario compartido entre doctores
- [ ] Exportación de reportes (PDF, Excel)
- [ ] Integración con servicios de pago
- [ ] App móvil

---

## 🐛 Troubleshooting

### Error: "consultorioId is required"

**Solución**: Asegúrate de que el frontend envía `consultorioId` usando `selectedConsultorio?.id`

### Error: "Paciente not found or access denied"

**Solución**: El usuario no tiene acceso a ese consultorio. Verifica `consultoriosIds` del usuario.

### Selector no aparece en navbar

**Solución**: Comportamiento esperado. Solo aparece si el usuario tiene múltiples consultorios y no es admin.

### No se ven datos

**Solución**: Verifica que las migraciones se ejecutaron correctamente y que los datos tienen `consultorioId`.

---

## 📄 Licencia

MIT

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## 📞 Soporte

Para dudas o problemas, consulta:
- `SAAS_IMPLEMENTATION_GUIDE.md` - Guía técnica detallada
- `API_DOCUMENTATION.md` - Documentación completa de la API
- Issues en GitHub

---

**¡Gracias por usar el Sistema de Gestión de Consultorios!** 🏥
