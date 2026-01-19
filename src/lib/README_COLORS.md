# Sistema de Colores - Mi Consultorio

Sistema centralizado de colores basado en la paleta turquesa/cyan del logo de la aplicación.

## 📁 Ubicación

`src/lib/colors.ts`

## 🎨 Paleta de Colores

### Primary (Turquesa/Cyan)
Color principal que combina con el logo. Usar para:
- Acciones principales
- Citas y calendario
- Elementos destacados

### Secondary (Azul)
Color complementario. Usar para:
- Pacientes
- Información secundaria
- Elementos de apoyo

### Accent (Teal)
Variación del turquesa. Usar para:
- Hover states especiales
- Elementos de énfasis
- Configuración

### Warning (Ámbar)
Para alertas y pendientes. Usar para:
- Citas pendientes
- Alertas no críticas
- Estados de espera

### Success (Esmeralda)
Para éxito y pagos. Usar para:
- Pagos e ingresos
- Confirmaciones
- Estados completados

### Info (Índigo)
Para información y reportes. Usar para:
- Reportes
- Información adicional
- Documentación

### Danger (Rojo)
Para acciones destructivas. Usar para:
- Eliminaciones
- Errores críticos
- Cancelaciones

## 💻 Uso Básico

```tsx
import { COLORS, GRADIENTS } from '@/lib/colors';

// Ejemplo 1: Card con borde y colores
<Card className={`border-l-4 ${COLORS.primary.borderL}`}>
  <div className={COLORS.primary.bg}>
    <Icon className={COLORS.primary.icon} />
  </div>
  <div className={COLORS.primary.text}>Texto</div>
</Card>

// Ejemplo 2: Botón con hover
<Button className={`${COLORS.primary.bgHover} ${COLORS.primary.borderHover}`}>
  Acción
</Button>

// Ejemplo 3: Hero con gradiente
<div className={GRADIENTS.hero}>
  Hero Section
</div>
```

## 🔧 Propiedades Disponibles

Cada color tiene las siguientes propiedades:

- `border`: Borde completo
- `borderL`: Borde izquierdo (para cards)
- `bg`: Background
- `bgHover`: Background en hover
- `borderHover`: Border en hover
- `text`: Color de texto
- `icon`: Color de iconos

## 🗺️ Mapeo de Rutas

```tsx
ROUTE_COLORS = {
  '/dashboard': 'primary',    // Turquesa
  '/citas': 'primary',         // Turquesa
  '/pacientes': 'secondary',   // Azul
  '/pagos': 'success',         // Esmeralda
  '/reportes': 'info',         // Índigo
  '/configuracion': 'accent',  // Teal
}
```

## ✅ Mejores Prácticas

1. **Consistencia**: Usa siempre el mismo color para la misma funcionalidad
2. **Importación**: Importa desde `@/lib/colors`
3. **Template literals**: Usa template literals para combinar clases
4. **Semántica**: Usa colores que tengan sentido semántico (success para pagos, warning para pendientes)

## 🚫 Evitar

- ❌ Hardcodear colores: `className="bg-blue-500"`
- ❌ Mezclar sistemas: No uses colores directos si existe una variable
- ❌ Colores inconsistentes: Usa el mapeo de rutas como guía

## 🔄 Migración

Para migrar código existente:

```tsx
// Antes
<div className="bg-blue-100 dark:bg-blue-900/20">
  <Icon className="text-blue-600 dark:text-blue-400" />
</div>

// Después
<div className={COLORS.secondary.bg}>
  <Icon className={COLORS.secondary.icon} />
</div>
```

## 📝 Ejemplo Completo

```tsx
import { COLORS, GRADIENTS } from '@/lib/colors';

export function MyComponent() {
  return (
    <>
      {/* Hero */}
      <div className={GRADIENTS.hero}>
        <h1>Título</h1>
      </div>

      {/* Stats Card */}
      <Card className={`border-l-4 ${COLORS.primary.borderL}`}>
        <div className={COLORS.primary.bg}>
          <Calendar className={COLORS.primary.icon} />
        </div>
        <div className={COLORS.primary.text}>
          {count}
        </div>
      </Card>

      {/* Action Button */}
      <Button className={`${COLORS.primary.bgHover} ${COLORS.primary.borderHover}`}>
        Nueva Cita
      </Button>
    </>
  );
}
```

## 🎯 Beneficios

- ✅ Mantenibilidad: Cambios centralizados
- ✅ Consistencia: Mismos colores en toda la app
- ✅ DRY: No repetir código
- ✅ Type-safe: TypeScript autocomplete
- ✅ Dark mode: Soporte automático
