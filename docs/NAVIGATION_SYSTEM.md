# Sistema de Navegación Semántica

Sistema profesional y escalable para breadcrumbs y navegación "Volver" sin dependencia de `router.back()`.

## 📋 Tabla de Contenidos

- [Arquitectura](#arquitectura)
- [Componentes](#componentes)
- [Uso Básico](#uso-básico)
- [Configuración](#configuración)
- [Ejemplos](#ejemplos)
- [Mejores Prácticas](#mejores-prácticas)
- [Extensión a Nuevos Flujos](#extensión-a-nuevos-flujos)

---

## 🏗️ Arquitectura

El sistema está compuesto por 4 capas principales:

```
┌─────────────────────────────────────────────────────────┐
│                    UI Components                         │
│  FlowHeader, BackButton, FlowBreadcrumbs                │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                    Custom Hook                           │
│              useFlowNavigation                           │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│              Configuration Layer                         │
│            navigation.config.ts                          │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                  Type Definitions                        │
│              navigation.types.ts                         │
└─────────────────────────────────────────────────────────┘
```

### Archivos del Sistema

| Archivo | Ubicación | Propósito |
|---------|-----------|-----------|
| `navigation.types.ts` | `/src/types/` | Definiciones de tipos TypeScript |
| `navigation.config.ts` | `/src/config/` | Configuración centralizada de rutas |
| `useFlowNavigation.ts` | `/src/hooks/` | Hook para lógica de navegación |
| `FlowHeader.tsx` | `/src/components/` | Componentes UI reutilizables |
| `breadcrumb.tsx` | `/src/components/ui/` | Componente base de shadcn/ui |

---

## 🧩 Componentes

### 1. FlowHeader (Componente Principal)

Componente completo con breadcrumbs y botón volver.

```tsx
<FlowHeader
  pathname="/pacientes/123/editar"
  params={{ id: '123', patientName: 'Juan Pérez' }}
  actions={
    <Button>Acción Personalizada</Button>
  }
/>
```

**Props:**
- `pathname` (string, requerido): Ruta actual
- `params` (object, opcional): Parámetros dinámicos
- `overrideConfig` (object, opcional): Sobrescribe configuración
- `className` (string, opcional): Clases CSS adicionales
- `hideBackButton` (boolean, opcional): Oculta botón volver
- `hideBreadcrumbs` (boolean, opcional): Oculta breadcrumbs
- `actions` (ReactNode, opcional): Botones/acciones adicionales
- `backButtonVariant` (string, opcional): Variante del botón

### 2. BackButton (Componente Simplificado)

Solo el botón "Volver" sin breadcrumbs.

```tsx
<BackButton
  pathname="/pacientes/123"
  params={{ id: '123' }}
  variant="ghost"
>
  Volver al Paciente
</BackButton>
```

### 3. FlowBreadcrumbs (Componente Simplificado)

Solo los breadcrumbs sin botón volver.

```tsx
<FlowBreadcrumbs
  pathname="/pacientes/123/editar"
  params={{ id: '123', patientName: 'Juan Pérez' }}
/>
```

---

## 🚀 Uso Básico

### Ejemplo 1: Página Simple

```tsx
'use client';

import { FlowHeader } from '@/components/FlowHeader';

export default function NuevoPacientePage() {
  return (
    <div>
      <FlowHeader pathname="/pacientes/nuevo" />
      {/* Contenido de la página */}
    </div>
  );
}
```

### Ejemplo 2: Página con Parámetros Dinámicos

```tsx
'use client';

import { useParams } from 'next/navigation';
import { FlowHeader } from '@/components/FlowHeader';
import { useQuery } from '@tanstack/react-query';

export default function EditarPacientePage() {
  const params = useParams();
  const id = params.id as string;
  
  const { data } = useQuery({
    queryKey: ['paciente', id],
    queryFn: () => getPaciente(id),
  });

  return (
    <div>
      <FlowHeader
        pathname={`/pacientes/${id}/editar`}
        params={{
          id,
          patientName: data?.fullName
        }}
      />
      {/* Contenido de la página */}
    </div>
  );
}
```

### Ejemplo 3: Página con Acciones Personalizadas

```tsx
'use client';

import { FlowHeader } from '@/components/FlowHeader';
import { Button } from '@/components/ui/button';
import { Download, Edit } from 'lucide-react';

export default function DetallePacientePage() {
  return (
    <div>
      <FlowHeader
        pathname={`/pacientes/${id}`}
        params={{ id, patientName: 'Juan Pérez' }}
        actions={
          <>
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            <Button onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </>
        }
      />
      {/* Contenido de la página */}
    </div>
  );
}
```

---

## ⚙️ Configuración

### Estructura de Configuración

La configuración se define en `/src/config/navigation.config.ts`:

```typescript
export const navigationConfig: FlowNavigationMap = {
  pacientes: {
    '/pacientes': {
      breadcrumbs: [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Pacientes', isCurrentPage: true },
      ],
      backUrl: '/dashboard',
    },
    
    '/pacientes/[id]': (params) => ({
      breadcrumbs: [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Pacientes', href: '/pacientes' },
        { label: params?.patientName || 'Detalle', isCurrentPage: true },
      ],
      backUrl: '/pacientes',
      backLabel: 'Volver a Pacientes',
    }),
  },
};
```

### Tipos de Configuración

#### 1. Configuración Estática

Para rutas sin parámetros dinámicos:

```typescript
'/ruta': {
  breadcrumbs: [...],
  backUrl: '/ruta-anterior',
  backLabel: 'Texto del botón', // Opcional
}
```

#### 2. Configuración Dinámica (Factory)

Para rutas con parámetros dinámicos:

```typescript
'/ruta/[id]': (params) => ({
  breadcrumbs: [
    { label: params?.nombre || 'Fallback' },
  ],
  backUrl: `/ruta/${params?.id}`,
})
```

---

## 📚 Ejemplos por Flujo

### Flujo de Pacientes (Implementado)

```
Dashboard
  └─ Pacientes (lista)
      ├─ Nuevo Paciente
      └─ Detalle Paciente
          ├─ Editar Paciente
          └─ Historial Clínico
```

**Rutas configuradas:**
- `/pacientes` → Volver a Dashboard
- `/pacientes/nuevo` → Volver a Pacientes
- `/pacientes/[id]` → Volver a Pacientes
- `/pacientes/[id]/editar` → Volver al Detalle
- `/pacientes/[id]/historial` → Volver al Detalle

### Flujo de Citas (Ejemplo)

```typescript
citas: {
  '/citas': {
    breadcrumbs: [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Citas', isCurrentPage: true },
    ],
    backUrl: '/dashboard',
  },
  
  '/citas/nueva': {
    breadcrumbs: [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Citas', href: '/citas' },
      { label: 'Nueva Cita', isCurrentPage: true },
    ],
    backUrl: '/citas',
  },
  
  '/citas/[id]': (params) => ({
    breadcrumbs: [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Citas', href: '/citas' },
      { label: `Cita ${params?.fecha || ''}`, isCurrentPage: true },
    ],
    backUrl: '/citas',
  }),
}
```

### Flujo de Pagos (Ejemplo)

```typescript
pagos: {
  '/pagos': {
    breadcrumbs: [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Pagos', isCurrentPage: true },
    ],
    backUrl: '/dashboard',
  },
  
  '/pagos/nuevo': {
    breadcrumbs: [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Pagos', href: '/pagos' },
      { label: 'Registrar Pago', isCurrentPage: true },
    ],
    backUrl: '/pagos',
  },
}
```

---

## ✅ Mejores Prácticas

### 1. Navegación Semántica

❌ **Evitar:**
```tsx
<Button onClick={() => router.back()}>Volver</Button>
```

✅ **Usar:**
```tsx
<FlowHeader pathname="/pacientes/nuevo" />
```

**Razón:** `router.back()` depende del historial del navegador, lo que puede llevar al usuario a lugares inesperados.

### 2. Parámetros Dinámicos

❌ **Evitar:**
```tsx
<FlowHeader
  pathname="/pacientes/123"
  params={{ id: '123' }}
/>
```

✅ **Usar:**
```tsx
const params = useParams();
const { data } = useQuery(['paciente', params.id], ...);

<FlowHeader
  pathname={`/pacientes/${params.id}`}
  params={{
    id: params.id,
    patientName: data?.fullName
  }}
/>
```

**Razón:** Los breadcrumbs deben mostrar información contextual relevante.

### 3. Fallbacks

Siempre proporciona valores por defecto:

```typescript
'/pacientes/[id]': (params) => ({
  breadcrumbs: [
    { label: params?.patientName || 'Paciente' }, // ✅ Fallback
  ],
  backUrl: '/pacientes', // ✅ Siempre válido
})
```

### 4. Labels Descriptivos

❌ **Evitar:**
```typescript
{ label: 'Ver', isCurrentPage: true }
```

✅ **Usar:**
```typescript
{ label: 'Detalle del Paciente', isCurrentPage: true }
```

---

## 🔧 Extensión a Nuevos Flujos

### Paso 1: Agregar Tipo de Flujo

En `/src/types/navigation.types.ts`:

```typescript
export type FlowType = 
  | 'pacientes'
  | 'citas'
  | 'pagos'
  | 'reportes'
  | 'tu-nuevo-flujo'; // ← Agregar aquí
```

### Paso 2: Configurar Rutas

En `/src/config/navigation.config.ts`:

```typescript
export const navigationConfig: FlowNavigationMap = {
  // ... otros flujos
  
  'tu-nuevo-flujo': {
    '/tu-ruta': {
      breadcrumbs: [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Tu Flujo', isCurrentPage: true },
      ],
      backUrl: '/dashboard',
    },
    
    '/tu-ruta/[id]': (params) => ({
      breadcrumbs: [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Tu Flujo', href: '/tu-ruta' },
        { label: params?.nombre || 'Detalle', isCurrentPage: true },
      ],
      backUrl: '/tu-ruta',
    }),
  },
};
```

### Paso 3: Usar en Páginas

```tsx
'use client';

import { FlowHeader } from '@/components/FlowHeader';

export default function TuNuevaPage() {
  return (
    <div>
      <FlowHeader pathname="/tu-ruta" />
      {/* Tu contenido */}
    </div>
  );
}
```

---

## 🎯 Ventajas del Sistema

### 1. **Predecibilidad**
- La navegación es explícita y controlada
- No depende del historial del navegador
- Comportamiento consistente en toda la app

### 2. **Mantenibilidad**
- Configuración centralizada
- Fácil de actualizar rutas
- Type-safe con TypeScript

### 3. **Escalabilidad**
- Agregar nuevos flujos es trivial
- Reutilizable en cualquier parte de la app
- Patrones claros y documentados

### 4. **UX Superior**
- Breadcrumbs contextuales
- Navegación intuitiva
- Labels dinámicos con información relevante

### 5. **Developer Experience**
- API simple y consistente
- Autocompletado con TypeScript
- Documentación inline

---

## 🐛 Troubleshooting

### Problema: Breadcrumbs no aparecen

**Solución:** Verifica que la ruta esté configurada en `navigation.config.ts`:

```typescript
// Verifica que exista:
navigationConfig.tuFlujo['/tu-ruta']
```

### Problema: Parámetros dinámicos no se muestran

**Solución:** Asegúrate de pasar los parámetros correctamente:

```tsx
<FlowHeader
  pathname={`/pacientes/${id}`}
  params={{ id, patientName: data?.fullName }} // ← Importante
/>
```

### Problema: Botón volver no funciona

**Solución:** Verifica que `backUrl` sea una ruta válida:

```typescript
backUrl: '/pacientes', // ✅ Ruta absoluta válida
backUrl: router.back(), // ❌ No usar
```

---

## 📝 Checklist de Implementación

Al agregar navegación a una nueva página:

- [ ] Importar `FlowHeader` de `@/components/FlowHeader`
- [ ] Agregar configuración en `navigation.config.ts`
- [ ] Pasar `pathname` correcto
- [ ] Pasar `params` si la ruta es dinámica
- [ ] Agregar `actions` si necesitas botones adicionales
- [ ] Probar navegación en ambas direcciones
- [ ] Verificar breadcrumbs muestran información correcta
- [ ] Verificar responsive en móvil

---

## 🎓 Recursos Adicionales

- [Documentación de Next.js App Router](https://nextjs.org/docs/app)
- [shadcn/ui Breadcrumb](https://ui.shadcn.com/docs/components/breadcrumb)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

---

**Última actualización:** Febrero 2026  
**Versión:** 1.0.0  
**Mantenedor:** Equipo de Desarrollo
