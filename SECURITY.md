# 🔒 Guía de Seguridad

## ⚠️ NUNCA SUBAS A GIT

### ❌ Archivos que NUNCA deben estar en Git:
- `.env` - Variables de entorno con credenciales
- `.env.local` - Variables locales
- `.env.production` - Variables de producción
- `node_modules/` - Dependencias
- Archivos con credenciales AWS
- Archivos con connection strings de MongoDB
- Archivos con JWT secrets

### ✅ Verifica tu .gitignore:
```bash
# Verifica que estos estén en .gitignore
cat .gitignore | grep -E "\.env|node_modules"
```

---

## 🔑 Generación de Secretos Seguros

### JWT Secret
```bash
# Genera un secret aleatorio de 32 bytes
openssl rand -base64 32
```

### Password Seguro
```bash
# Genera un password aleatorio
openssl rand -base64 24
```

---

## 🛡️ Variables de Entorno

### ✅ Buenas Prácticas:

1. **Usa .env.example** para documentar variables (sin valores reales)
   ```env
   # .env.example
   MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/db
   JWT_SECRET=tu-secret-aqui
   ```

2. **Nunca hardcodees credenciales** en el código
   ```javascript
   // ❌ MAL
   const apiKey = 'AKIAT54N7UQ6KN3BCYCN';
   
   // ✅ BIEN
   const apiKey = process.env.AWS_ACCESS_KEY_ID;
   ```

3. **Usa diferentes secrets** para desarrollo y producción

4. **Rota credenciales** periódicamente (cada 3-6 meses)

---

## 🔐 Seguridad de MongoDB

### ✅ Configuración Recomendada:

1. **Autenticación habilitada** (siempre)
2. **Network Access**: 
   - Desarrollo: Tu IP específica
   - Producción: IPs de Render o `0.0.0.0/0` (con autenticación fuerte)
3. **Usuario con permisos mínimos**:
   ```javascript
   // Usuario solo con permisos de lectura/escritura en una DB específica
   // NO uses el usuario admin
   ```
4. **Connection string seguro**:
   ```
   mongodb+srv://usuario:password@cluster.mongodb.net/database?retryWrites=true&w=majority
   ```

### ⚠️ Nunca:
- Compartas el connection string públicamente
- Uses el usuario `admin` en producción
- Dejes el cluster sin autenticación

---

## 🪣 Seguridad de AWS S3

### ✅ Configuración Recomendada:

1. **Bucket NO público**
   - Block all public access: ✅ Enabled

2. **CORS configurado correctamente**:
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

3. **Usuario IAM con permisos mínimos**:
   ```json
   {
       "Version": "2012-10-17",
       "Statement": [
           {
               "Effect": "Allow",
               "Action": [
                   "s3:PutObject",
                   "s3:GetObject",
                   "s3:DeleteObject"
               ],
               "Resource": "arn:aws:s3:::consultorio-documentos/*"
           }
       ]
   }
   ```

4. **Signed URLs** para descargas (ya implementado)

### ⚠️ Nunca:
- Hagas el bucket público
- Uses el usuario root de AWS
- Compartas las credenciales IAM

---

## 🌐 Seguridad de CORS

### ✅ Configuración Correcta:

```javascript
// Backend - src/index.js
app.use(cors({
  origin: process.env.CORS_ORIGIN, // https://tu-app.vercel.app
  credentials: true
}));
```

### ❌ NUNCA hagas esto en producción:
```javascript
// ❌ MAL - Permite cualquier origen
app.use(cors({
  origin: '*'
}));
```

---

## 🔒 Seguridad de JWT

### ✅ Buenas Prácticas:

1. **Secret fuerte** (mínimo 32 caracteres)
2. **Expiración corta** (1-7 días)
3. **Refresh tokens** para sesiones largas
4. **Almacenamiento seguro** en el cliente:
   ```javascript
   // ✅ BIEN - httpOnly cookie (si es posible)
   // ✅ BIEN - localStorage (con precauciones)
   // ❌ MAL - URL parameters
   ```

### Implementación actual:
```javascript
// Backend genera token con expiración
const token = jwt.sign(
  { id: user._id, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);
```

---

## 🚨 Detección de Fugas de Credenciales

### Antes de hacer commit:

```bash
# Busca posibles credenciales en el código
git diff | grep -E "(password|secret|key|token)" -i

# Verifica que .env no esté staged
git status | grep ".env"
```

### Si accidentalmente subes credenciales:

1. **INMEDIATAMENTE** rota todas las credenciales expuestas
2. Elimina el commit del historial:
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env" \
     --prune-empty --tag-name-filter cat -- --all
   ```
3. Fuerza el push:
   ```bash
   git push origin --force --all
   ```

---

## 🔍 Auditoría de Seguridad

### Checklist Mensual:

- [ ] Revisar logs de acceso en MongoDB Atlas
- [ ] Revisar logs de acceso en AWS S3
- [ ] Verificar usuarios activos en la aplicación
- [ ] Revisar dependencias con vulnerabilidades:
  ```bash
  npm audit
  npm audit fix
  ```
- [ ] Verificar que CORS esté configurado correctamente
- [ ] Verificar que las credenciales no estén expuestas

### Herramientas Útiles:

```bash
# Escanear vulnerabilidades en dependencias
npm audit

# Actualizar dependencias con vulnerabilidades
npm audit fix

# Escanear el código en busca de secretos
git secrets --scan
```

---

## 📊 Monitoreo de Seguridad

### Configurar Alertas:

1. **MongoDB Atlas**:
   - Alertas de acceso inusual
   - Alertas de uso excesivo

2. **AWS CloudWatch**:
   - Alertas de acceso S3
   - Alertas de costos

3. **Render/Vercel**:
   - Alertas de errores 500
   - Alertas de downtime

---

## 🆘 En Caso de Brecha de Seguridad

### Pasos Inmediatos:

1. **Rota TODAS las credenciales**:
   - JWT_SECRET
   - MongoDB password
   - AWS credentials

2. **Revisa logs** para identificar el alcance:
   - MongoDB Atlas logs
   - AWS CloudTrail
   - Render/Vercel logs

3. **Notifica a usuarios** si sus datos fueron comprometidos

4. **Documenta el incidente** para prevenir futuras brechas

---

## 📚 Recursos Adicionales

- **OWASP Top 10**: https://owasp.org/www-project-top-ten/
- **MongoDB Security**: https://docs.mongodb.com/manual/security/
- **AWS Security Best Practices**: https://aws.amazon.com/security/best-practices/
- **JWT Best Practices**: https://tools.ietf.org/html/rfc8725

---

## ✅ Checklist de Seguridad Pre-Despliegue

- [ ] `.env` está en `.gitignore`
- [ ] No hay credenciales hardcodeadas en el código
- [ ] JWT_SECRET es fuerte y único
- [ ] MongoDB tiene autenticación habilitada
- [ ] S3 bucket NO es público
- [ ] CORS está configurado correctamente
- [ ] Todas las dependencias están actualizadas
- [ ] `npm audit` no muestra vulnerabilidades críticas
- [ ] HTTPS está habilitado (Vercel/Render lo hacen automáticamente)
- [ ] Variables de entorno están documentadas en `.env.example`

---

**Última actualización**: Diciembre 2024

**Recuerda**: La seguridad es un proceso continuo, no un estado final. Mantén tus sistemas actualizados y monitorea constantemente.
