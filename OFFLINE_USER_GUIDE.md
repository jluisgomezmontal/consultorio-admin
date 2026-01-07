# 📖 Guía de Usuario - Modo Offline

## 🎯 Para Médicos y Recepcionistas

Esta guía explica cómo usar el sistema cuando no hay conexión a internet.

---

## 🌐 Estados de Conexión

El sistema muestra un banner en la esquina superior derecha con el estado actual:

### 🟢 Conectado y Actualizado
```
✓ Todos los datos están sincronizados con el servidor
✓ Puede trabajar normalmente
✓ Los cambios se guardan inmediatamente
```

### 🔴 Sin Conexión a Internet
```
⚠ Los cambios se guardarán en este dispositivo
⚠ Se sincronizarán automáticamente cuando haya conexión
⚠ Algunas funciones están limitadas
```

### 🟡 Sincronizando Datos
```
↻ Enviando cambios al servidor
↻ Por favor espere
↻ No cierre la aplicación
```

### 🔴 Error de Sincronización
```
✗ No se pudieron sincronizar algunos cambios
✗ Haga clic para reintentar
✗ Verifique su conexión
```

---

## ✅ Qué PUEDE hacer sin conexión

### 📋 Pacientes
- ✅ Ver lista de pacientes (previamente cargados)
- ✅ Buscar pacientes por nombre, teléfono o email
- ✅ Crear nuevo paciente
- ✅ Editar información de paciente existente
- ✅ Eliminar paciente (se aplicará al reconectar)
- ✅ Ver historial médico del paciente

### 📅 Citas
- ✅ Ver calendario de citas
- ✅ Crear nueva cita
- ✅ Editar cita existente
- ✅ Cambiar estado de cita (pendiente/confirmada/completada)
- ✅ Registrar diagnóstico y tratamiento
- ✅ Cancelar cita

### 📄 Consulta
- ✅ Registrar peso, presión arterial, medidas
- ✅ Agregar notas de la consulta
- ✅ Ver consultas anteriores

---

## ❌ Qué NO puede hacer sin conexión

### 🚫 Restricciones
- ❌ Iniciar sesión (primera vez)
- ❌ Recuperar contraseña
- ❌ Crear nueva cuenta de usuario
- ❌ Cambiar contraseña
- ❌ Subir documentos o imágenes
- ❌ Generar reportes con datos del servidor
- ❌ Ver usuarios de otros consultorios

---

## 🔄 Cómo Funciona la Sincronización

### Automática
1. **Al reconectar:** La sincronización inicia automáticamente
2. **Cada 30 segundos:** Si hay cambios pendientes
3. **Prioridad alta:** Citas del día actual se sincronizan primero

### Manual
- Haga clic en el banner de "Error de sincronización"
- O espere a la próxima sincronización automática

### Indicadores en Pantalla

**En la lista de pacientes/citas:**
- 🟢 Check verde = Sincronizado con el servidor
- 🟡 Reloj amarillo = Pendiente de sincronización
- 🔴 X roja = Error al sincronizar

---

## ⚠️ Situaciones Especiales

### 1. Tiempo Máximo sin Conexión: 7 días

Si permanece sin conexión por más de **7 días**:
```
🔒 Sesión expirada
Ha estado sin conexión por más de 7 días.
Por favor conéctese a internet para continuar.

[Botón: Reconectar]
```

**Qué hacer:**
1. Conectarse a internet
2. La aplicación validará su sesión
3. Se sincronizarán todos los cambios pendientes

### 2. Cambios Simultáneos (Conflictos)

Si usted editó un paciente offline **Y** otro usuario lo editó online:

**El sistema usa "Último cambio gana":**
- Compara la fecha/hora de cada cambio
- El cambio más reciente se mantiene
- El cambio anterior se sobrescribe

**Ejemplo:**
```
Usted editó offline a las 10:00 AM
Otro usuario editó online a las 10:30 AM
→ Los cambios del otro usuario se mantienen (más recientes)
→ Sus cambios se pierden
```

**Recomendación:** Sincronice frecuentemente para minimizar conflictos.

### 3. Registro Eliminado

Si creó un paciente offline pero fue eliminado en el servidor:
```
⚠ Este registro ya no existe en el servidor
Se creará como nuevo registro al sincronizar
```

---

## 💡 Mejores Prácticas

### Para Médicos

1. **Al inicio del día:**
   - Asegúrese de tener conexión
   - Verifique que el banner muestre: 🟢 "Conectado y actualizado"
   - Revise el calendario del día

2. **Durante consultas:**
   - Puede trabajar offline sin problema
   - Los datos se guardan localmente
   - Continue normalmente

3. **Al final del día:**
   - Conéctese a internet si no lo ha hecho
   - Espere a que sincronice (🟡)
   - Confirme que vea: 🟢 "Conectado y actualizado"

### Para Recepcionistas

1. **Al agendar citas:**
   - Si está offline, la cita se agendará localmente
   - Se enviará al servidor al reconectar
   - El médico la verá después de la sincronización

2. **Al registrar pacientes nuevos:**
   - Puede registrar sin conexión
   - El paciente tendrá un ID temporal (comienza con "local_")
   - Al sincronizar, recibirá su ID definitivo

3. **Al cobrar:**
   - ⚠️ El registro de pagos requiere conexión
   - Espere a tener internet para registrar el pago

---

## 📱 Instalación como Aplicación

### ¿Por qué instalarla?

- ✅ Acceso más rápido (sin abrir el navegador)
- ✅ Icono en la pantalla de inicio
- ✅ Funciona mejor offline
- ✅ Pantalla completa (sin barra de direcciones)

### Cómo Instalar

**En celular Android:**
1. Abra la aplicación en Chrome
2. Toque el menú (⋮) arriba a la derecha
3. Seleccione "Agregar a pantalla de inicio"
4. Toque "Agregar"

**En celular iPhone:**
1. Abra la aplicación en Safari
2. Toque el botón de compartir
3. Seleccione "Añadir a la pantalla de inicio"
4. Toque "Añadir"

**En computadora:**
1. Abra la aplicación en Chrome o Edge
2. Clic en el ícono ➕ en la barra de direcciones
3. O menú → "Instalar Consultorio..."

---

## 🆘 Problemas Frecuentes

### "No puedo crear pacientes offline"

**Posibles causas:**
1. Ha estado offline por más de 7 días → Reconéctese
2. Su sesión expiró → Reconéctese
3. No inició sesión → Debe iniciar sesión con conexión primero

### "Mis cambios no se sincronizan"

**Soluciones:**
1. Verifique que tenga conexión a internet
2. Haga clic en el banner de error para reintentar
3. Si persiste, cierre y abra la aplicación

### "Perdí datos que guardé offline"

**Causas comunes:**
1. **Conflicto resuelto:** Otro usuario hizo cambios más recientes
2. **Navegador limpio:** Se borró el caché/almacenamiento local
3. **Modo incógnito:** Los datos no se guardan en modo privado

**Prevención:**
- Sincronice frecuentemente
- No use modo incógnito para trabajo
- No limpie el caché del navegador

### "El banner no desaparece"

**Normal:** El banner es permanente para que siempre vea el estado.

**Minimizar:** Si está 🟢 online y sincronizado, se minimiza automáticamente a un círculo pequeño después de 5 segundos.

**Cerrar temporalmente:** Haga clic en la ✕ (solo cuando está online).

---

## 📊 Entender los Números

### "3 cambios pendientes"

Significa que hay 3 operaciones esperando sincronizarse:
- Puede ser: 2 pacientes nuevos + 1 cita editada
- O: 3 citas nuevas
- Etc.

### "Sincronizando... 80%"

Indica el progreso de la sincronización actual.

### "5 reintentos"

Si una operación falla 5 veces, se marca como "requiere atención manual" y debe contactar a soporte técnico.

---

## ✨ Consejos de Productividad

1. **Instale la app** en su teléfono para acceso rápido
2. **Mantenga conexión estable** cuando sea posible
3. **Sincronice al final del día** para evitar conflictos
4. **No cierre la app** mientras sincroniza
5. **Use WiFi confiable** para sincronizaciones grandes

---

## 🔐 Seguridad

### ¿Mis datos están seguros offline?

✅ **Sí**, los datos se almacenan en su dispositivo de forma segura:
- Solo accesibles desde su navegador
- Protegidos por su sesión
- Se borran al cerrar sesión

### ¿Puedo usar otro dispositivo?

❌ **No simultáneamente offline**. Los datos offline son específicos de cada dispositivo.

✅ **Sí con conexión**. Al estar online, todos los datos están en el servidor y accesibles desde cualquier dispositivo.

---

## 📞 Contacto

Si tiene problemas o dudas:
1. Revise esta guía
2. Contacte al administrador del sistema
3. Revise la [Guía Técnica](./OFFLINE_ARCHITECTURE.md) (para administradores)

---

**Recuerde:** El sistema está diseñado para que trabaje sin interrupciones. ¡Confíe en él y trabaje normalmente!

**Versión:** 1.0.0  
**Última actualización:** Enero 2026
