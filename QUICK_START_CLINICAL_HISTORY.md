# 🚀 Quick Start - Historia Clínica Configurable

Guía rápida para poner en marcha la nueva funcionalidad de Historia Clínica.

---

## ⚡ Pasos de Implementación

### 1. Backend Setup

#### Migrar Base de Datos (Opcional)

Si ya tienes datos en producción, ejecuta la migración:

```bash
cd api-consultorio
npm run migrate:clinical-history
```

Esto agregará:
- `clinicalHistoryConfig` a consultorios existentes (todas las secciones activas)
- `clinicalHistory: {}` a pacientes existentes

#### Verificar Modelos

Los modelos ya están actualizados:
- ✅ `Consultorio.model.js` - Campo `clinicalHistoryConfig`
- ✅ `Paciente.model.js` - Campo `clinicalHistory`

#### Verificar Rutas

Nuevos endpoints disponibles:
- ✅ `GET /api/consultorios/:id/clinical-history-config`
- ✅ `PUT /api/consultorios/:id/clinical-history-config`

#### Iniciar Servidor

```bash
npm run dev
```

### 2. Frontend Setup

#### Verificar Componentes

Nuevos archivos creados:
- ✅ `components/ClinicalHistoryForm.tsx`
- ✅ `app/(dashboard)/consultorios/[id]/configuracion/page.tsx`

#### Páginas Actualizadas

- ✅ `app/(dashboard)/pacientes/nuevo/page.tsx`
- ✅ `app/(dashboard)/pacientes/[id]/editar/page.tsx`

#### Iniciar App

```bash
cd web-consultorio
npm run dev
```

---

## 🧪 Verificación Rápida

### Test 1: Acceso a Configuración (2 minutos)

1. Login como **doctor**
2. Ir a **Consultorios** → Seleccionar consultorio
3. Click en **"Configurar Historia Clínica"**
4. ✅ Debe mostrar 4 toggles activos

### Test 2: Crear Paciente (3 minutos)

1. Ir a **Nuevo Paciente**
2. Llenar nombre: "Test Paciente"
3. ✅ Debe mostrar 4 secciones colapsables
4. Expandir **"Antecedentes Heredofamiliares"**
5. Marcar **"Diabetes"**
6. Guardar
7. ✅ Debe crear exitosamente

### Test 3: Configuración Dinámica (3 minutos)

1. Como doctor, desactivar **"Gineco-obstétricos"**
2. Guardar configuración
3. Ir a **Nuevo Paciente**
4. ✅ Solo debe mostrar 3 secciones (sin gineco)

---

## 📋 Checklist de Deployment

### Backend

- [ ] Modelos actualizados en servidor
- [ ] Rutas registradas correctamente
- [ ] Validadores funcionando
- [ ] Permisos de doctor/admin configurados
- [ ] Ejecutar migración si hay datos existentes

### Frontend

- [ ] Componente ClinicalHistoryForm desplegado
- [ ] Página de configuración accesible
- [ ] Formularios de pacientes actualizados
- [ ] Services con tipos TypeScript correctos

### Testing

- [ ] Doctor puede acceder a configuración
- [ ] Recepcionista NO puede acceder a configuración
- [ ] Crear paciente con historia clínica funciona
- [ ] Editar paciente mantiene datos
- [ ] Secciones se muestran según configuración

---

## 🔧 Variables de Entorno

Asegúrate de tener configurado:

```bash
# Backend (.env)
MONGODB_URI=mongodb://localhost:27017/consultorio
JWT_SECRET=tu_secreto_aqui
PORT=5000

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 🎯 Flujo de Usuario Típico

### Doctor configura consultorio (Primera vez)

```
1. Login → Dashboard
2. Consultorios → Mi Consultorio
3. "Configurar Historia Clínica"
4. Revisar toggles (por defecto todo activo)
5. Desactivar secciones no necesarias
6. Guardar
```

### Recepcionista registra paciente

```
1. Login → Dashboard
2. Pacientes → "Nuevo Paciente"
3. Llenar datos básicos (nombre, edad, etc.)
4. Expandir secciones de historia clínica relevantes
5. Completar información disponible
6. Guardar (OK aunque historia clínica esté vacía)
```

### Doctor actualiza historia clínica

```
1. Buscar paciente
2. Click "Editar"
3. Expandir "Antecedentes Heredofamiliares"
4. Marcar condiciones relevantes
5. Agregar detalles en "Otros"
6. Guardar cambios
```

---

## 🐛 Troubleshooting Rápido

### Problema: "Access denied" al configurar

**Causa:** Usuario no es doctor/admin  
**Solución:** Verificar rol en base de datos o token JWT

### Problema: Secciones no aparecen en formulario

**Causa:** Configuración no se cargó  
**Solución:** 
1. Verificar que consultorio tenga `clinicalHistoryConfig`
2. Revisar console del navegador
3. Verificar que el hook useQuery esté habilitado

### Problema: Error al guardar paciente

**Causa:** Validación falló en backend  
**Solución:**
1. Revisar logs del servidor
2. Verificar que estructura de datos sea correcta
3. Asegurar que todos los campos requeridos estén presentes

---

## 📊 Monitoreo

### Queries Útiles

**Verificar configuración de consultorios:**
```javascript
db.consultorios.find({ clinicalHistoryConfig: { $exists: true } })
```

**Contar pacientes con historia clínica:**
```javascript
db.pacientes.countDocuments({ 
  "clinicalHistory.antecedentesHeredofamiliares": { $exists: true } 
})
```

**Ver pacientes con diabetes heredofamiliar:**
```javascript
db.pacientes.find({ 
  "clinicalHistory.antecedentesHeredofamiliares.diabetes": true 
})
```

---

## 📚 Recursos Adicionales

- **Documentación completa:** `HISTORIA_CLINICA_FEATURE.md`
- **Ejemplos de API:** `CLINICAL_HISTORY_API_EXAMPLES.md`
- **Script de migración:** `api-consultorio/src/scripts/migrate-clinical-history.js`

---

## ✅ Criterios de Éxito

La implementación es exitosa cuando:

1. ✅ Doctor puede configurar secciones desde UI
2. ✅ Configuración persiste en base de datos
3. ✅ Formularios de paciente muestran solo secciones activas
4. ✅ Se puede crear paciente sin llenar historia clínica
5. ✅ Se puede crear paciente con historia clínica completa
6. ✅ Historia clínica se guarda y recupera correctamente
7. ✅ Ediciones mantienen datos existentes
8. ✅ Recepcionistas NO pueden acceder a configuración

---

## 🎉 ¡Listo!

Tu sistema ahora tiene historia clínica configurable. 

**Tiempo estimado de setup:** 15-20 minutos

**Próximos pasos sugeridos:**
1. Capacitar al personal sobre nueva funcionalidad
2. Configurar consultorios según especialidad
3. Comenzar a registrar historias clínicas de nuevos pacientes
4. Actualizar gradualmente pacientes existentes

---

**¿Necesitas ayuda?** Revisa `HISTORIA_CLINICA_FEATURE.md` para documentación detallada.
