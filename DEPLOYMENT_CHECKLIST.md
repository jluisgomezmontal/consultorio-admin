# ✅ Checklist de Despliegue

## Pre-Despliegue

### Backend (API)
- [ ] Build exitoso localmente: `npm run build` (si aplica)
- [ ] Todas las variables de entorno en `.env.example` documentadas
- [ ] `.gitignore` incluye `.env` y `node_modules`
- [ ] `package.json` tiene script `start` para producción
- [ ] MongoDB Atlas configurado y accesible
- [ ] AWS S3 bucket creado y configurado
- [ ] Credenciales AWS IAM creadas

### Frontend (Web)
- [x] Build exitoso: `npm run build` ✅
- [ ] `.env.example` creado con variables necesarias
- [ ] `.gitignore` incluye `.env*` y `.next`
- [ ] API URL configurada correctamente
- [ ] Todas las páginas se renderizan sin errores

---

## Durante el Despliegue

### 1. Backend en Render
- [ ] Repositorio conectado a Render
- [ ] Variables de entorno configuradas:
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=3000`
  - [ ] `MONGODB_URI`
  - [ ] `JWT_SECRET`
  - [ ] `CORS_ORIGIN` (temporal, actualizar después)
  - [ ] `AWS_ACCESS_KEY_ID`
  - [ ] `AWS_SECRET_ACCESS_KEY`
  - [ ] `AWS_REGION`
  - [ ] `AWS_S3_BUCKET`
- [ ] Deploy completado exitosamente
- [ ] Health check funciona: `/api/health`
- [ ] URL de API copiada

### 2. Frontend en Vercel
- [ ] Repositorio conectado a Vercel
- [ ] Variables de entorno configuradas:
  - [ ] `NEXT_PUBLIC_API_URL` (URL de Render)
- [ ] Deploy completado exitosamente
- [ ] Aplicación carga correctamente
- [ ] URL de Vercel copiada

### 3. Actualizar CORS
- [ ] Actualizar `CORS_ORIGIN` en Render con URL de Vercel
- [ ] Esperar redeploy automático
- [ ] Verificar que las peticiones funcionen

---

## Post-Despliegue

### Verificaciones Funcionales
- [ ] Login funciona correctamente
- [ ] Crear nuevo paciente funciona
- [ ] Crear nueva cita funciona
- [ ] Subir documento funciona
- [ ] Descargar documento funciona
- [ ] Ver lista de citas funciona
- [ ] Ver lista de pacientes funciona
- [ ] Filtros y búsquedas funcionan
- [ ] Paginación funciona

### Verificaciones Técnicas
- [ ] No hay errores en consola del navegador
- [ ] No hay errores 500 en las peticiones API
- [ ] Las imágenes y assets cargan correctamente
- [ ] La navegación entre páginas funciona
- [ ] El tema oscuro/claro funciona (si aplica)
- [ ] Responsive design funciona en móvil

### Seguridad
- [ ] HTTPS habilitado en ambos servicios
- [ ] Variables de entorno no expuestas en el código
- [ ] CORS configurado correctamente
- [ ] JWT_SECRET es seguro y único
- [ ] Credenciales AWS no están en el código
- [ ] MongoDB tiene autenticación habilitada
- [ ] S3 bucket no es público

### Monitoreo
- [ ] Logs de Render configurados
- [ ] Logs de Vercel configurados
- [ ] Alertas de errores configuradas (opcional)
- [ ] Monitoreo de uso de MongoDB Atlas
- [ ] Monitoreo de uso de AWS S3

---

## Problemas Comunes y Soluciones

### ❌ Error: "Failed to fetch" en el frontend
**Solución**: Verifica que `NEXT_PUBLIC_API_URL` esté correctamente configurado en Vercel

### ❌ Error: "CORS policy" en el navegador
**Solución**: Actualiza `CORS_ORIGIN` en Render con la URL exacta de Vercel (con https://)

### ❌ Error: "MongoNetworkError"
**Solución**: 
1. Verifica que `0.0.0.0/0` esté en Network Access de MongoDB Atlas
2. Verifica el connection string en `MONGODB_URI`

### ❌ Error: "SignatureDoesNotMatch" de AWS
**Solución**: 
1. Verifica que `AWS_ACCESS_KEY_ID` y `AWS_SECRET_ACCESS_KEY` sean correctos
2. Verifica que el usuario IAM tenga permisos en S3

### ❌ API responde lento (>30 segundos)
**Solución**: Es normal en Render Free Tier después de inactividad. Considera upgrade o usar un servicio de "keep-alive"

### ❌ Build falla en Vercel
**Solución**: 
1. Revisa los logs de build en Vercel
2. Verifica que `npm run build` funcione localmente
3. Verifica que todas las dependencias estén en `package.json`

---

## Comandos Útiles

### Ver logs en tiempo real (Render)
```bash
# Desde el dashboard de Render, click en "Logs"
```

### Ver logs en tiempo real (Vercel)
```bash
vercel logs <deployment-url>
```

### Forzar redeploy
```bash
# Render: Dashboard → Manual Deploy
# Vercel: Dashboard → Redeploy
```

### Verificar health de la API
```bash
curl https://tu-api.onrender.com/api/health
```

---

## Contactos de Soporte

- **Vercel Support**: https://vercel.com/support
- **Render Support**: https://render.com/docs/support
- **MongoDB Atlas**: https://www.mongodb.com/cloud/atlas/support
- **AWS Support**: https://aws.amazon.com/support/

---

## Notas Finales

- **Backup**: Configura backups automáticos de MongoDB Atlas
- **Dominios**: Puedes agregar dominios personalizados en Vercel y Render
- **SSL**: Ambos servicios proveen SSL gratuito automáticamente
- **Escalabilidad**: Considera upgrades cuando tengas más usuarios
- **Costos**: Monitorea el uso de AWS S3 para evitar sorpresas

---

**Fecha de último despliegue**: _______________
**Versión desplegada**: _______________
**Desplegado por**: _______________
