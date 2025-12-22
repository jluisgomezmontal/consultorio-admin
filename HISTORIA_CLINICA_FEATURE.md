# Historia Clínica Configurable - Documentación Completa

## 📋 Descripción General

Sistema de historia clínica configurable por consultorio que permite a los doctores activar o desactivar secciones específicas del historial médico al registrar pacientes.

## 🎯 Características

- ✅ Configuración a nivel de consultorio (solo doctores/admins)
- ✅ 4 secciones principales del historial clínico
- ✅ Todas las secciones opcionales (no obligatorias)
- ✅ UI colapsable para mejor experiencia de usuario
- ✅ Configuración persiste en base de datos
- ✅ Campos activos por defecto

---

## 📦 Estructura de Datos

### Secciones Disponibles

#### 1. **Antecedentes Heredofamiliares**
- Diabetes (checkbox)
- Hipertensión (checkbox)
- Cáncer (checkbox)
- Cardiopatías (checkbox)
- Otros (textarea)

#### 2. **Antecedentes Personales Patológicos**
- Cirugías (textarea)
- Hospitalizaciones (textarea)

#### 3. **Antecedentes Personales No Patológicos**
- Tabaquismo (checkbox)
- Alcoholismo (checkbox)
- Actividad Física (text input)
- Vacunas (textarea)

#### 4. **Gineco-obstétricos**
- Embarazos (number)
- Partos (number)
- Cesáreas (number)

---

## 🚀 Uso del Sistema

### Para Doctores/Administradores

#### Configurar Secciones del Consultorio

1. Navegar a **Consultorios** → Seleccionar un consultorio
2. Click en **"Configurar Historia Clínica"**
3. Activar/desactivar las secciones según necesidad
4. Click en **"Guardar Configuración"**

**Ruta:** `/consultorios/{id}/configuracion`

**Permisos:** Solo doctores y administradores

### Para Todo el Personal

#### Registrar Nuevo Paciente

1. Navegar a **Pacientes** → **"Nuevo Paciente"**
2. Llenar datos básicos (nombre, edad, etc.)
3. Expandir secciones de historia clínica necesarias
4. Completar solo la información relevante
5. Click en **"Guardar Paciente"**

#### Editar Paciente Existente

1. Seleccionar paciente → **"Editar"**
2. Las secciones mostradas dependen de la configuración del consultorio
3. Modificar información según necesidad
4. Click en **"Guardar Cambios"**

---

## 🔧 Implementación Técnica

### Backend (Node.js + Express + MongoDB)

#### Modelos Actualizados

**Consultorio Model:**
```javascript
clinicalHistoryConfig: {
  antecedentesHeredofamiliares: Boolean,        // Default: true
  antecedentesPersonalesPatologicos: Boolean,   // Default: true
  antecedentesPersonalesNoPatologicos: Boolean, // Default: true
  ginecoObstetricos: Boolean                    // Default: true
}
```

**Paciente Model:**
```javascript
clinicalHistory: {
  antecedentesHeredofamiliares: {
    diabetes: Boolean,
    hipertension: Boolean,
    cancer: Boolean,
    cardiopatias: Boolean,
    otros: String
  },
  antecedentesPersonalesPatologicos: {
    cirugias: String,
    hospitalizaciones: String
  },
  antecedentesPersonalesNoPatologicos: {
    tabaquismo: Boolean,
    alcoholismo: Boolean,
    actividadFisica: String,
    vacunas: String
  },
  ginecoObstetricos: {
    embarazos: Number,
    partos: Number,
    cesareas: Number
  }
}
```

#### Endpoints Nuevos

**GET** `/api/consultorios/:id/clinical-history-config`
- Obtiene configuración actual
- Permisos: Autenticado
- Respuesta: `{ success: true, data: ClinicalHistoryConfig }`

**PUT** `/api/consultorios/:id/clinical-history-config`
- Actualiza configuración
- Permisos: Doctor o Admin
- Body: `ClinicalHistoryConfig`
- Respuesta: Consultorio actualizado

#### Estructura de Capas

```
routes/consultorio.routes.js
  ↓
controllers/consultorio.controller.js
  ↓
services/consultorio.service.js
  ↓
models/Consultorio.model.js
```

### Frontend (Next.js + React + TypeScript)

#### Componentes Nuevos

**`ClinicalHistoryForm.tsx`**
- Componente reutilizable
- Secciones colapsables
- Renderiza solo secciones activas
- Props:
  - `clinicalHistory: ClinicalHistory`
  - `onClinicalHistoryChange: (history: ClinicalHistory) => void`
  - `config?: ClinicalHistoryConfig`

#### Páginas Actualizadas

1. **`/consultorios/[id]/configuracion`** (NUEVA)
   - Página de configuración
   - Solo doctores/admins
   - Toggle switches para cada sección

2. **`/pacientes/nuevo`** (ACTUALIZADA)
   - Integra `ClinicalHistoryForm`
   - Fetch configuración del consultorio
   - Guarda clinical history con paciente

3. **`/pacientes/[id]/editar`** (ACTUALIZADA)
   - Muestra datos existentes
   - Permite edición de historia clínica
   - Respeta configuración actual

---

## 🧪 Testing

### Pruebas Funcionales Recomendadas

#### 1. Configuración de Consultorio

**Como Doctor:**
```
1. Login como doctor
2. Ir a Consultorios → Seleccionar consultorio
3. Click "Configurar Historia Clínica"
4. Desactivar "Antecedentes Heredofamiliares"
5. Guardar configuración
6. Verificar mensaje de éxito
7. Recargar página
8. Confirmar que la configuración persiste
```

**Como Recepcionista:**
```
1. Login como recepcionista
2. Intentar acceder a /consultorios/{id}/configuracion
3. Debe redirigir a /dashboard (sin permisos)
```

#### 2. Registro de Paciente

**Con Todas las Secciones Activas:**
```
1. Configurar consultorio con todas las secciones activas
2. Ir a Nuevo Paciente
3. Verificar que aparecen las 4 secciones colapsadas
4. Expandir "Antecedentes Heredofamiliares"
5. Marcar "Diabetes" y "Hipertensión"
6. Agregar texto en "Otros"
7. Expandir "Gineco-obstétricos"
8. Ingresar: Embarazos: 2, Partos: 1, Cesáreas: 1
9. Guardar paciente
10. Editar paciente → verificar datos guardados correctamente
```

**Con Secciones Desactivadas:**
```
1. Configurar consultorio desactivando 2 secciones
2. Ir a Nuevo Paciente
3. Verificar que solo aparecen las secciones activas
4. Intentar crear paciente sin llenar historia clínica
5. Debe permitir guardar (campos opcionales)
```

#### 3. Edición de Paciente

**Datos Existentes:**
```
1. Editar paciente con historia clínica completa
2. Modificar algunos campos
3. Guardar
4. Verificar que todos los campos se actualicen correctamente
5. Verificar que los campos no modificados persistan
```

### API Testing (Postman/Insomnia)

#### Obtener Configuración
```http
GET /api/consultorios/{consultorioId}/clinical-history-config
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": {
    "antecedentesHeredofamiliares": true,
    "antecedentesPersonalesPatologicos": true,
    "antecedentesPersonalesNoPatologicos": true,
    "ginecoObstetricos": true
  }
}
```

#### Actualizar Configuración
```http
PUT /api/consultorios/{consultorioId}/clinical-history-config
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "antecedentesHeredofamiliares": true,
  "antecedentesPersonalesPatologicos": false,
  "antecedentesPersonalesNoPatologicos": true,
  "ginecoObstetricos": false
}

Response 200:
{
  "success": true,
  "data": {
    "id": "...",
    "name": "Consultorio XYZ",
    "clinicalHistoryConfig": { ... },
    ...
  }
}
```

#### Crear Paciente con Historia Clínica
```http
POST /api/pacientes
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "fullName": "María García López",
  "consultorioId": "...",
  "age": 35,
  "gender": "femenino",
  "clinicalHistory": {
    "antecedentesHeredofamiliares": {
      "diabetes": true,
      "hipertension": false,
      "cancer": false,
      "cardiopatias": false,
      "otros": "Padre con diabetes tipo 2"
    },
    "ginecoObstetricos": {
      "embarazos": 2,
      "partos": 1,
      "cesareas": 1
    }
  }
}
```

---

## 🔄 Migración de Datos Existentes

### Para Consultorios Existentes

La configuración por defecto es:
```javascript
{
  antecedentesHeredofamiliares: true,
  antecedentesPersonalesPatologicos: true,
  antecedentesPersonalesNoPatologicos: true,
  ginecoObstetricos: true
}
```

Los consultorios existentes **no requieren migración**. Al acceder a la configuración por primera vez, se aplicarán los valores por defecto automáticamente.

### Para Pacientes Existentes

Los pacientes existentes tendrán `clinicalHistory: {}` (objeto vacío).

- ✅ No hay datos perdidos
- ✅ Compatible con versión anterior
- ✅ Se puede agregar historia clínica al editar

---

## 📝 Validaciones Implementadas

### Backend (Zod)

- ✅ Todos los campos de historia clínica son opcionales
- ✅ Números mínimo 0 (embarazos, partos, cesáreas)
- ✅ Strings con trim automático
- ✅ Configuración requiere los 4 campos booleanos

### Frontend (React Hook Form + Zod)

- ✅ Email válido (si se proporciona)
- ✅ Edad positiva (si se proporciona)
- ✅ Nombre mínimo 2 caracteres (requerido)

---

## 🎨 UI/UX

### Componentes Utilizados

- **Shadcn UI**: Card, Button, Input, Label, Switch
- **Lucide Icons**: ChevronDown, ChevronUp, Save, Settings
- **Tailwind CSS**: Styling responsivo

### Experiencia de Usuario

1. **Secciones Colapsadas por Defecto**
   - Reduce sobrecarga visual
   - Usuario expande solo lo necesario

2. **Indicadores Visuales Claros**
   - Iconos de flecha indican estado (expandido/colapsado)
   - Hover states en secciones
   - Feedback inmediato en guardado

3. **Responsive Design**
   - Grid adaptable para campos múltiples
   - Funciona en móvil, tablet, desktop

---

## 🔐 Seguridad

### Autorización

- ✅ Configuración: Solo doctores y admins
- ✅ Middleware `authorize('doctor', 'admin')` en ruta
- ✅ Frontend verifica rol antes de mostrar botón

### Validación

- ✅ Backend valida todos los datos con Zod
- ✅ Frontend valida antes de enviar
- ✅ Mongoose valida schema en DB

---

## 📊 Datos de Ejemplo

### Configuración Típica

**Consultorio General:**
```json
{
  "antecedentesHeredofamiliares": true,
  "antecedentesPersonalesPatologicos": true,
  "antecedentesPersonalesNoPatologicos": true,
  "ginecoObstetricos": true
}
```

**Consultorio Especializado (Cardiología):**
```json
{
  "antecedentesHeredofamiliares": true,
  "antecedentesPersonalesPatologicos": true,
  "antecedentesPersonalesNoPatologicos": true,
  "ginecoObstetricos": false
}
```

### Historia Clínica Completa

```json
{
  "antecedentesHeredofamiliares": {
    "diabetes": true,
    "hipertension": true,
    "cancer": false,
    "cardiopatias": false,
    "otros": "Madre con diabetes gestacional, abuela materna con hipertensión"
  },
  "antecedentesPersonalesPatologicos": {
    "cirugias": "Apendicectomía 2015",
    "hospitalizaciones": "Neumonía 2018, 5 días hospitalizado"
  },
  "antecedentesPersonalesNoPatologicos": {
    "tabaquismo": false,
    "alcoholismo": false,
    "actividadFisica": "Caminata 3 veces por semana",
    "vacunas": "Esquema completo, última influenza diciembre 2024"
  },
  "ginecoObstetricos": {
    "embarazos": 3,
    "partos": 2,
    "cesareas": 1
  }
}
```

---

## 🐛 Troubleshooting

### Problema: Configuración no se guarda

**Síntomas:** Click en "Guardar" pero vuelven valores anteriores
**Solución:**
1. Verificar que el usuario sea doctor o admin
2. Revisar console del navegador por errores
3. Verificar que el backend esté corriendo
4. Revisar logs del servidor

### Problema: Secciones no aparecen en formulario

**Síntomas:** Formulario de paciente no muestra historia clínica
**Solución:**
1. Verificar que la consulta de configuración esté habilitada
2. Revisar que `selectedConsultorio` tenga un ID válido
3. Check React DevTools para ver si `configData` tiene datos

### Problema: Error 403 al configurar

**Síntomas:** "Access denied" al guardar configuración
**Solución:**
1. Verificar rol del usuario en token JWT
2. Asegurar que el usuario sea doctor o admin
3. Revisar middleware de autorización en backend

---

## 🔮 Futuras Mejoras Sugeridas

1. **Historial de Cambios**
   - Registro de quién modificó la configuración
   - Timestamp de cambios

2. **Templates de Configuración**
   - Presets por especialidad médica
   - "Consultorio General", "Cardiología", "Pediatría", etc.

3. **Campos Personalizables**
   - Permitir al doctor agregar campos custom
   - Tipos de datos configurables

4. **Reportes**
   - Estadísticas de completitud de historias clínicas
   - Análisis de antecedentes más comunes

5. **Búsqueda Avanzada**
   - Filtrar pacientes por antecedentes específicos
   - "Todos los pacientes con diabetes heredofamiliar"

6. **Notificaciones**
   - Alertas si falta información crítica
   - Recordatorios de actualización de vacunas

---

## 📞 Soporte

Para problemas o preguntas sobre esta funcionalidad:

1. Revisar esta documentación completa
2. Verificar logs del servidor y browser console
3. Revisar código en archivos mencionados
4. Contactar al equipo de desarrollo

---

## ✅ Checklist de Deployment

Antes de desplegar a producción:

- [ ] Ejecutar tests backend
- [ ] Ejecutar tests frontend
- [ ] Probar flujo completo como doctor
- [ ] Probar flujo completo como recepcionista
- [ ] Verificar permisos y autorización
- [ ] Revisar UI en diferentes dispositivos
- [ ] Backup de base de datos
- [ ] Documentar cambios en CHANGELOG
- [ ] Notificar a usuarios sobre nueva funcionalidad

---

**Versión:** 1.0.0  
**Fecha:** Diciembre 2024  
**Autor:** Sistema de Gestión de Consultorio Médico
