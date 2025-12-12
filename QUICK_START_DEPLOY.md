# 🚀 Guía Rápida de Despliegue

## ✅ Estado Actual

- ✅ **Build del Frontend**: Exitoso (sin errores TypeScript)
- ✅ **Archivos de configuración**: Creados
- ✅ **Variables de entorno**: Documentadas
- ✅ **Preparación**: 100% completa

---

## 📦 Archivos Creados

1. **`vercel.json`** - Configuración para Vercel
2. **`.env.example`** - Template de variables de entorno
3. **`render.yaml`** - Configuración para Render (backend)
4. **`DEPLOYMENT.md`** - Guía completa de despliegue
5. **`DEPLOYMENT_CHECKLIST.md`** - Checklist paso a paso
6. **`check-deployment.js`** - Script de verificación

---

## 🎯 Pasos Rápidos para Desplegar

### 1️⃣ Preparar Repositorios Git

#### Frontend
```bash
cd web-consultorio
git init
git add .
git commit -m "Initial commit - Ready for deployment"
git branch -M main
git remote add origin https://github.com/tu-usuario/consultorio-frontend.git
git push -u origin main
```

#### Backend
```bash
cd ../api-consultorio
git init
git add .
git commit -m "Initial commit - Ready for deployment"
git branch -M main
git remote add origin https://github.com/tu-usuario/consultorio-backend.git
git push -u origin main
```

---

### 2️⃣ Desplegar Backend en Render

1. Ve a https://dashboard.render.com/
2. Click **"New +"** → **"Web Service"**
3. Conecta tu repo de backend
4. Configuración:
   - **Name**: `consultorio-api`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Agrega estas variables de entorno:

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/consultorio
JWT_SECRET=tu-secret-super-seguro-aqui
CORS_ORIGIN=https://tu-app.vercel.app
AWS_ACCESS_KEY_ID=tu-access-key
AWS_SECRET_ACCESS_KEY=tu-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=consultorio-documentos
```

6. Click **"Create Web Service"**
7. **Copia la URL** que te da Render (ej: `https://consultorio-api.onrender.com`)

---

### 3️⃣ Desplegar Frontend en Vercel

1. Ve a https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Importa tu repo de frontend
4. Configuración:
   - Framework: **Next.js** (auto-detectado)
   - Build Command: `npm run build` (auto-detectado)
5. Agrega esta variable de entorno:

```env
NEXT_PUBLIC_API_URL=https://consultorio-api.onrender.com/api
```

6. Click **"Deploy"**
7. **Copia la URL** que te da Vercel (ej: `https://tu-app.vercel.app`)

---

### 4️⃣ Actualizar CORS

1. Vuelve a Render
2. Ve a tu servicio → **Environment**
3. Actualiza `CORS_ORIGIN` con la URL de Vercel:
   ```
   CORS_ORIGIN=https://tu-app.vercel.app
   ```
4. Guarda (se redesplegará automáticamente)

---

### 5️⃣ Verificar

Abre tu app en Vercel y prueba:
- ✅ Login
- ✅ Crear paciente
- ✅ Crear cita
- ✅ Subir documento

---

## 🔑 Variables de Entorno Requeridas

### Backend (Render)
| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NODE_ENV` | Entorno | `production` |
| `PORT` | Puerto | `3000` |
| `MONGODB_URI` | Connection string de MongoDB | `mongodb+srv://...` |
| `JWT_SECRET` | Secret para JWT | Genera con `openssl rand -base64 32` |
| `CORS_ORIGIN` | URL del frontend | `https://tu-app.vercel.app` |
| `AWS_ACCESS_KEY_ID` | AWS Access Key | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | AWS Secret Key | `wJalrXU...` |
| `AWS_REGION` | Región de S3 | `us-east-1` |
| `AWS_S3_BUCKET` | Nombre del bucket | `consultorio-documentos` |

### Frontend (Vercel)
| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | URL de la API | `https://consultorio-api.onrender.com/api` |

---

## ⚠️ Importante Antes de Desplegar

### MongoDB Atlas
1. Crea un cluster gratuito en https://cloud.mongodb.com/
2. Configura **Network Access**: Agrega `0.0.0.0/0`
3. Crea un usuario con permisos de lectura/escritura
4. Copia el connection string

### AWS S3
1. Crea un bucket en https://s3.console.aws.amazon.com/
2. Configura CORS en el bucket:
```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["https://tu-app.vercel.app"],
        "ExposeHeaders": ["ETag"]
    }
]
```
3. Crea un usuario IAM con permisos de S3
4. Descarga las credenciales

---

## 🐛 Solución de Problemas Comunes

### Error: "Failed to fetch"
**Causa**: La URL de la API no está configurada correctamente
**Solución**: Verifica `NEXT_PUBLIC_API_URL` en Vercel

### Error: "CORS policy"
**Causa**: El CORS_ORIGIN no coincide con la URL de Vercel
**Solución**: Actualiza `CORS_ORIGIN` en Render con la URL exacta (con https://)

### Error: "MongoNetworkError"
**Causa**: MongoDB no puede conectarse
**Solución**: 
1. Verifica que `0.0.0.0/0` esté en Network Access
2. Verifica el connection string

### API responde muy lento
**Causa**: Render Free Tier se "duerme" después de 15 min de inactividad
**Solución**: Es normal. La primera petición tarda ~30 segundos

---

## 📚 Recursos Adicionales

- **Guía Completa**: Ver `DEPLOYMENT.md`
- **Checklist**: Ver `DEPLOYMENT_CHECKLIST.md`
- **Verificar preparación**: `node check-deployment.js`

---

## 🎉 ¡Listo!

Una vez completados estos pasos, tu aplicación estará en producción:
- **Frontend**: `https://tu-app.vercel.app`
- **Backend**: `https://consultorio-api.onrender.com`

**Tiempo estimado de despliegue**: 15-20 minutos

---

## 📞 ¿Necesitas Ayuda?

- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **MongoDB Atlas**: https://docs.atlas.mongodb.com/
- **AWS S3**: https://docs.aws.amazon.com/s3/

---

**Última actualización**: Diciembre 2024
