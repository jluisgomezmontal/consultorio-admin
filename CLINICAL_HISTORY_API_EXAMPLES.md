# Historia Clínica - Ejemplos de API

Colección de ejemplos de requests para testing con Postman, Insomnia o cURL.

## 🔐 Autenticación

Todos los endpoints requieren autenticación. Incluye el token JWT en el header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📋 Endpoints de Configuración

### 1. Obtener Configuración del Consultorio

**GET** `/api/consultorios/:id/clinical-history-config`

**cURL:**
```bash
curl -X GET \
  'http://localhost:5000/api/consultorios/6751234567890abcdef12345/clinical-history-config' \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE'
```

**Response 200:**
```json
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

---

### 2. Actualizar Configuración (Solo Doctor/Admin)

**PUT** `/api/consultorios/:id/clinical-history-config`

**cURL:**
```bash
curl -X PUT \
  'http://localhost:5000/api/consultorios/6751234567890abcdef12345/clinical-history-config' \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE' \
  -H 'Content-Type: application/json' \
  -d '{
    "antecedentesHeredofamiliares": true,
    "antecedentesPersonalesPatologicos": false,
    "antecedentesPersonalesNoPatologicos": true,
    "ginecoObstetricos": false
  }'
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "6751234567890abcdef12345",
    "name": "Consultorio Central",
    "address": "Av. Principal 123",
    "phone": "+52 555 1234567",
    "clinicalHistoryConfig": {
      "antecedentesHeredofamiliares": true,
      "antecedentesPersonalesPatologicos": false,
      "antecedentesPersonalesNoPatologicos": true,
      "ginecoObstetricos": false
    },
    "createdAt": "2024-12-01T10:00:00.000Z",
    "updatedAt": "2024-12-21T16:30:00.000Z"
  },
  "message": "Clinical history configuration updated successfully"
}
```

**Error 403 (No autorizado):**
```json
{
  "success": false,
  "message": "Access denied. Insufficient permissions"
}
```

---

## 👤 Endpoints de Pacientes

### 3. Crear Paciente con Historia Clínica Completa

**POST** `/api/pacientes`

**cURL:**
```bash
curl -X POST \
  'http://localhost:5000/api/pacientes' \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE' \
  -H 'Content-Type: application/json' \
  -d '{
    "fullName": "María García López",
    "consultorioId": "6751234567890abcdef12345",
    "age": 35,
    "gender": "femenino",
    "phone": "+52 555 9876543",
    "email": "maria.garcia@email.com",
    "address": "Calle Secundaria 456",
    "clinicalHistory": {
      "antecedentesHeredofamiliares": {
        "diabetes": true,
        "hipertension": true,
        "cancer": false,
        "cardiopatias": false,
        "otros": "Padre con diabetes tipo 2 diagnosticado a los 50 años. Madre con hipertensión controlada."
      },
      "antecedentesPersonalesPatologicos": {
        "cirugias": "Apendicectomía en 2015. Cesárea en 2018.",
        "hospitalizaciones": "Neumonía en 2018, hospitalización por 5 días."
      },
      "antecedentesPersonalesNoPatologicos": {
        "tabaquismo": false,
        "alcoholismo": false,
        "actividadFisica": "Caminata 30 minutos, 3 veces por semana",
        "vacunas": "Esquema completo de infancia. Última vacuna de influenza: diciembre 2024"
      },
      "ginecoObstetricos": {
        "embarazos": 2,
        "partos": 1,
        "cesareas": 1
      }
    }
  }'
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "6751234567890abcdef67890",
    "fullName": "María García López",
    "age": 35,
    "gender": "femenino",
    "phone": "+52 555 9876543",
    "email": "maria.garcia@email.com",
    "address": "Calle Secundaria 456",
    "consultorioId": "6751234567890abcdef12345",
    "clinicalHistory": {
      "antecedentesHeredofamiliares": {
        "diabetes": true,
        "hipertension": true,
        "cancer": false,
        "cardiopatias": false,
        "otros": "Padre con diabetes tipo 2 diagnosticado a los 50 años. Madre con hipertensión controlada."
      },
      "antecedentesPersonalesPatologicos": {
        "cirugias": "Apendicectomía en 2015. Cesárea en 2018.",
        "hospitalizaciones": "Neumonía en 2018, hospitalización por 5 días."
      },
      "antecedentesPersonalesNoPatologicos": {
        "tabaquismo": false,
        "alcoholismo": false,
        "actividadFisica": "Caminata 30 minutos, 3 veces por semana",
        "vacunas": "Esquema completo de infancia. Última vacuna de influenza: diciembre 2024"
      },
      "ginecoObstetricos": {
        "embarazos": 2,
        "partos": 1,
        "cesareas": 1
      }
    },
    "createdAt": "2024-12-21T16:30:00.000Z",
    "updatedAt": "2024-12-21T16:30:00.000Z"
  },
  "message": "Paciente created successfully"
}
```

---

### 4. Crear Paciente con Historia Clínica Parcial

**POST** `/api/pacientes`

Solo llenar las secciones relevantes:

```bash
curl -X POST \
  'http://localhost:5000/api/pacientes' \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE' \
  -H 'Content-Type: application/json' \
  -d '{
    "fullName": "Juan Pérez Rodríguez",
    "consultorioId": "6751234567890abcdef12345",
    "age": 45,
    "gender": "masculino",
    "clinicalHistory": {
      "antecedentesHeredofamiliares": {
        "diabetes": true,
        "otros": "Padre y abuelo paterno con diabetes"
      },
      "antecedentesPersonalesNoPatologicos": {
        "tabaquismo": true,
        "actividadFisica": "Sedentario"
      }
    }
  }'
```

---

### 5. Crear Paciente Sin Historia Clínica

**POST** `/api/pacientes`

Historia clínica es opcional:

```bash
curl -X POST \
  'http://localhost:5000/api/pacientes' \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE' \
  -H 'Content-Type: application/json' \
  -d '{
    "fullName": "Pedro Sánchez",
    "consultorioId": "6751234567890abcdef12345",
    "age": 28,
    "gender": "masculino"
  }'
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "6751234567890abcdef11111",
    "fullName": "Pedro Sánchez",
    "age": 28,
    "gender": "masculino",
    "consultorioId": "6751234567890abcdef12345",
    "clinicalHistory": {},
    "createdAt": "2024-12-21T16:30:00.000Z",
    "updatedAt": "2024-12-21T16:30:00.000Z"
  },
  "message": "Paciente created successfully"
}
```

---

### 6. Actualizar Historia Clínica de Paciente Existente

**PUT** `/api/pacientes/:id`

```bash
curl -X PUT \
  'http://localhost:5000/api/pacientes/6751234567890abcdef67890' \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE' \
  -H 'Content-Type: application/json' \
  -d '{
    "clinicalHistory": {
      "antecedentesHeredofamiliares": {
        "diabetes": true,
        "hipertension": true,
        "cancer": true,
        "otros": "Actualización: Hermano diagnosticado con cáncer de colon en 2024"
      },
      "ginecoObstetricos": {
        "embarazos": 3,
        "partos": 2,
        "cesareas": 1
      }
    }
  }'
```

---

### 7. Obtener Paciente con Historia Clínica

**GET** `/api/pacientes/:id`

```bash
curl -X GET \
  'http://localhost:5000/api/pacientes/6751234567890abcdef67890' \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE'
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "6751234567890abcdef67890",
    "fullName": "María García López",
    "age": 35,
    "gender": "femenino",
    "phone": "+52 555 9876543",
    "email": "maria.garcia@email.com",
    "consultorioId": "6751234567890abcdef12345",
    "clinicalHistory": {
      "antecedentesHeredofamiliares": {
        "diabetes": true,
        "hipertension": true,
        "cancer": false,
        "cardiopatias": false,
        "otros": "Padre con diabetes tipo 2"
      },
      "ginecoObstetricos": {
        "embarazos": 2,
        "partos": 1,
        "cesareas": 1
      }
    },
    "_count": {
      "citas": 5
    },
    "createdAt": "2024-12-21T16:30:00.000Z",
    "updatedAt": "2024-12-21T16:35:00.000Z"
  }
}
```

---

## 🧪 Casos de Prueba

### Caso 1: Configuración por Especialidad

**Consultorio de Cardiología:**
```json
{
  "antecedentesHeredofamiliares": true,
  "antecedentesPersonalesPatologicos": true,
  "antecedentesPersonalesNoPatologicos": true,
  "ginecoObstetricos": false
}
```

**Consultorio de Ginecología:**
```json
{
  "antecedentesHeredofamiliares": true,
  "antecedentesPersonalesPatologicos": true,
  "antecedentesPersonalesNoPatologicos": false,
  "ginecoObstetricos": true
}
```

---

### Caso 2: Paciente con Antecedentes Críticos

```json
{
  "fullName": "Carlos Méndez",
  "consultorioId": "...",
  "age": 55,
  "clinicalHistory": {
    "antecedentesHeredofamiliares": {
      "diabetes": true,
      "hipertension": true,
      "cancer": true,
      "cardiopatias": true,
      "otros": "Alta incidencia familiar. Padre falleció de infarto a los 58. Madre con diabetes y cáncer de mama."
    },
    "antecedentesPersonalesPatologicos": {
      "cirugias": "Bypass coronario 2020",
      "hospitalizaciones": "Múltiples: 2018 (infarto), 2020 (cirugía), 2022 (neumonía)"
    },
    "antecedentesPersonalesNoPatologicos": {
      "tabaquismo": true,
      "alcoholismo": false,
      "actividadFisica": "Sedentario por recomendación médica",
      "vacunas": "Vacuna COVID-19 completa, influenza anual"
    }
  }
}
```

---

### Caso 3: Paciente Joven Sin Antecedentes

```json
{
  "fullName": "Ana Martínez",
  "consultorioId": "...",
  "age": 22,
  "gender": "femenino",
  "clinicalHistory": {
    "antecedentesHeredofamiliares": {
      "diabetes": false,
      "hipertension": false,
      "cancer": false,
      "cardiopatias": false
    },
    "antecedentesPersonalesNoPatologicos": {
      "tabaquismo": false,
      "alcoholismo": false,
      "actividadFisica": "Gimnasio 5 veces por semana",
      "vacunas": "Esquema completo actualizado"
    }
  }
}
```

---

## 🔍 Validaciones y Errores

### Error: Campos Inválidos

**Request:**
```json
{
  "antecedentesHeredofamiliares": "si",  // ❌ Debe ser boolean
  "ginecoObstetricos": true
}
```

**Response 400:**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "body.antecedentesHeredofamiliares",
      "message": "Expected boolean, received string"
    }
  ]
}
```

---

### Error: Usuario No Autorizado

**Request PUT** (como recepcionista):

**Response 403:**
```json
{
  "success": false,
  "message": "Access denied. Insufficient permissions"
}
```

---

### Error: Consultorio No Encontrado

**Response 404:**
```json
{
  "success": false,
  "message": "Consultorio not found"
}
```

---

## 📝 Notas Importantes

1. **Todos los campos de `clinicalHistory` son opcionales**
2. **Solo doctores y admins pueden actualizar configuración**
3. **La configuración por defecto tiene todas las secciones activas**
4. **Pacientes sin `clinicalHistory` tendrán objeto vacío `{}`**
5. **Las actualizaciones parciales son permitidas**

---

## 🔗 Postman Collection

Puedes importar esta colección base en Postman:

```json
{
  "info": {
    "name": "Historia Clínica API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get Config",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": {
          "raw": "{{baseUrl}}/consultorios/{{consultorioId}}/clinical-history-config",
          "host": ["{{baseUrl}}"],
          "path": ["consultorios", "{{consultorioId}}", "clinical-history-config"]
        }
      }
    },
    {
      "name": "Update Config",
      "request": {
        "method": "PUT",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"antecedentesHeredofamiliares\": true,\n  \"antecedentesPersonalesPatologicos\": true,\n  \"antecedentesPersonalesNoPatologicos\": true,\n  \"ginecoObstetricos\": true\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/consultorios/{{consultorioId}}/clinical-history-config",
          "host": ["{{baseUrl}}"],
          "path": ["consultorios", "{{consultorioId}}", "clinical-history-config"]
        }
      }
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5000/api"
    },
    {
      "key": "token",
      "value": ""
    },
    {
      "key": "consultorioId",
      "value": ""
    }
  ]
}
```

---

**Última actualización:** Diciembre 2024
