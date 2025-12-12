# 🚀 Guía de Despliegue - Sistema de Consultorio Médico

## 📋 Requisitos Previos

- Cuenta en [Vercel](https://vercel.com) (Frontend)
- Cuenta en [Render](https://render.com) (Backend API)
- Cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Base de datos)
- Cuenta en [AWS S3](https://aws.amazon.com/s3/) (Almacenamiento de documentos)

---

## 🔧 Parte 1: Desplegar Backend API en Render

### Paso 1: Preparar el repositorio
```bash
cd api-consultorio
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <tu-repositorio-backend>
git push -u origin main
```

### Paso 2: Crear servicio en Render

1. Ve a [Render Dashboard](https://dashboard.render.com/)
2. Click en **"New +"** → **"Web Service"**
3. Conecta tu repositorio de GitHub
4. Configura el servicio:
   - **Name**: `consultorio-api`
   - **Region**: Oregon (US West)
   - **Branch**: `main`
   - **Root Directory**: `api-consultorio` (si está en monorepo)
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### Paso 3: Configurar Variables de Entorno

En Render, ve a **Environment** y agrega:

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
JWT_SECRET=<genera-un-secret-seguro-aqui>
CORS_ORIGIN=https://tu-app.vercel.app
AWS_ACCESS_KEY_ID=<tu-access-key>
AWS_SECRET_ACCESS_KEY=<tu-secret-key>
AWS_REGION=us-east-1
AWS_S3_BUCKET=consultorio-documentos
```

**⚠️ IMPORTANTE:**
- Genera un JWT_SECRET seguro: `openssl rand -base64 32`
- Actualiza CORS_ORIGIN después de desplegar el frontend
- Asegúrate de que tu bucket S3 esté configurado correctamente

### Paso 4: Deploy

1. Click en **"Create Web Service"**
2. Espera a que termine el despliegue (~5 minutos)
3. Copia la URL de tu API: `https://consultorio-api.onrender.com`

---

## 🌐 Parte 2: Desplegar Frontend en Vercel

### Paso 1: Preparar el repositorio
```bash
cd web-consultorio
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <tu-repositorio-frontend>
git push -u origin main
```

### Paso 2: Crear proyecto en Vercel

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Click en **"Add New..."** → **"Project"**
3. Importa tu repositorio de GitHub
4. Configura el proyecto:
   - **Framework Preset**: Next.js
   - **Root Directory**: `web-consultorio` (si está en monorepo)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### Paso 3: Configurar Variables de Entorno

En Vercel, ve a **Settings** → **Environment Variables** y agrega:

```env
NEXT_PUBLIC_API_URL=https://consultorio-api.onrender.com/api
```

### Paso 4: Deploy

1. Click en **"Deploy"**
2. Espera a que termine el despliegue (~2 minutos)
3. Copia la URL de tu aplicación: `https://tu-app.vercel.app`

### Paso 5: Actualizar CORS en el Backend

1. Ve a Render Dashboard → Tu servicio API
2. En **Environment**, actualiza:
   ```env
   CORS_ORIGIN=https://tu-app.vercel.app
   ```
3. Guarda y espera a que se redeploy automáticamente

---

## 🗄️ Parte 3: Configurar MongoDB Atlas

### Paso 1: Crear Cluster

1. Ve a [MongoDB Atlas](https://cloud.mongodb.com/)
2. Crea un cluster gratuito (M0)
3. Selecciona región cercana a Oregon (para mejor latencia con Render)

### Paso 2: Configurar Acceso

1. **Database Access**: Crea un usuario con permisos de lectura/escritura
2. **Network Access**: 
   - Agrega `0.0.0.0/0` (permitir desde cualquier IP)
   - O agrega las IPs de Render si quieres más seguridad

### Paso 3: Obtener Connection String

1. Click en **"Connect"** → **"Connect your application"**
2. Copia el connection string
3. Reemplaza `<password>` con tu contraseña
4. Actualiza en Render: `MONGODB_URI`

---

## 📦 Parte 4: Configurar AWS S3

### Paso 1: Crear Bucket

1. Ve a [AWS S3 Console](https://s3.console.aws.amazon.com/)
2. Click en **"Create bucket"**
3. Nombre: `consultorio-documentos` (o el que prefieras)
4. Región: `us-east-1`
5. **Block Public Access**: Mantén bloqueado (seguridad)

### Paso 2: Configurar CORS

En tu bucket, ve a **Permissions** → **CORS** y agrega:

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

### Paso 3: Crear Usuario IAM

1. Ve a [IAM Console](https://console.aws.amazon.com/iam/)
2. **Users** → **Add users**
3. Nombre: `consultorio-s3-user`
4. **Attach policies directly**: `AmazonS3FullAccess` (o crea una política más restrictiva)
5. Crea el usuario y descarga las credenciales
6. Actualiza en Render:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_S3_BUCKET`

---

## ✅ Verificación Post-Despliegue

### 1. Verificar API
```bash
curl https://consultorio-api.onrender.com/api/health
```
Respuesta esperada:
```json
{
  "status": "OK",
  "timestamp": "2024-12-04T...",
  "uptime": 123.45,
  "environment": "production"
}
```

### 2. Verificar Frontend
- Abre `https://tu-app.vercel.app`
- Intenta hacer login
- Verifica que las páginas carguen correctamente

### 3. Verificar Conexión API-Frontend
- Abre las DevTools del navegador
- Ve a la pestaña **Network**
- Verifica que las peticiones a la API se completen exitosamente

### 4. Verificar S3
- Sube un documento desde una cita
- Verifica que aparezca en tu bucket S3
- Intenta descargarlo

---

## 🔄 Redeploy y Actualizaciones

### Frontend (Vercel)
```bash
cd web-consultorio
git add .
git commit -m "Update: descripción del cambio"
git push
```
Vercel detectará el push y redesplegará automáticamente.

### Backend (Render)
```bash
cd api-consultorio
git add .
git commit -m "Update: descripción del cambio"
git push
```
Render detectará el push y redesplegará automáticamente.

### Manual Redeploy
- **Vercel**: Dashboard → Tu proyecto → Deployments → Redeploy
- **Render**: Dashboard → Tu servicio → Manual Deploy

---

## 🐛 Troubleshooting

### Error: CORS
- Verifica que `CORS_ORIGIN` en Render coincida con tu URL de Vercel
- Asegúrate de incluir `https://` y sin `/` al final

### Error: MongoDB Connection
- Verifica que la IP `0.0.0.0/0` esté en Network Access
- Verifica que el usuario tenga permisos correctos
- Verifica que el connection string sea correcto

### Error: S3 Upload
- Verifica las credenciales AWS
- Verifica que el bucket exista
- Verifica la configuración CORS del bucket
- Verifica que el usuario IAM tenga permisos

### Error: 500 Internal Server Error
- Revisa los logs en Render Dashboard
- Verifica que todas las variables de entorno estén configuradas
- Verifica que el seed de datos se haya ejecutado

---

## 📝 Notas Importantes

1. **Render Free Tier**: El servicio se "duerme" después de 15 minutos de inactividad. La primera petición puede tardar ~30 segundos.

2. **Vercel Free Tier**: 
   - 100 GB de ancho de banda/mes
   - Builds ilimitados
   - Dominios personalizados incluidos

3. **MongoDB Atlas Free Tier**:
   - 512 MB de almacenamiento
   - Conexiones compartidas
   - Suficiente para desarrollo y pruebas

4. **AWS S3**: Cobra por almacenamiento y transferencia. Monitorea tu uso.

5. **Seguridad**:
   - Nunca subas archivos `.env` a Git
   - Usa `.gitignore` correctamente
   - Rota las credenciales periódicamente
   - Usa HTTPS siempre

---

## 🎉 ¡Listo!

Tu aplicación debería estar funcionando en:
- **Frontend**: `https://tu-app.vercel.app`
- **API**: `https://consultorio-api.onrender.com`

Para cualquier problema, revisa los logs en:
- **Vercel**: Dashboard → Tu proyecto → Deployments → Ver logs
- **Render**: Dashboard → Tu servicio → Logs
