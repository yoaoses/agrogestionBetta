# Endpoint de Cancelación para Trabajos Pesados en AgroGestion

## Introducción

En el sistema AgroGestion, ciertos procesos backend pueden ser intensivos en recursos computacionales y tiempo de ejecución. Estos incluyen análisis de inteligencia artificial (IA), importaciones masivas de datos desde archivos Excel y consultas complejas de estadísticas. Para mejorar la experiencia del usuario y optimizar el uso de recursos del servidor, es necesario implementar un endpoint de cancelación que permita detener estos trabajos pesados de manera controlada.

## Necesidad de Implementación

### Contexto de la API

Basado en la documentación de la API de AgroGestion ([`src/api/AgroGestion.yaml`](src/api/AgroGestion.yaml)), los siguientes endpoints representan trabajos potencialmente pesados:

1. **Análisis de IA** (`POST /ai-analytics/analyze`):
   - Procesa datos históricos de una granja en un rango de fechas
   - Realiza llamadas a modelos de IA externos
   - Puede tomar varios minutos o horas dependiendo del volumen de datos

2. **Importaciones de Datos** (`POST /import/*`):
   - Procesa archivos Excel con miles de registros
   - Valida y transforma datos antes de insertarlos en la base de datos
   - Operaciones masivas que pueden bloquear recursos del servidor

3. **Consultas de Estadísticas Complejas** (`GET /statistics/*`):
   - Agregan datos de múltiples tablas y fechas
   - Pueden generar cargas elevadas en la base de datos

### Problemas Actuales

- **Falta de Control**: Los usuarios no pueden detener procesos que han iniciado accidentalmente o que están tomando demasiado tiempo
- **Consumo de Recursos**: Trabajos innecesarios continúan consumiendo CPU, memoria y ancho de banda
- **Experiencia de Usuario**: Los usuarios quedan esperando respuestas indefinidamente sin opción de cancelar
- **Escalabilidad**: En entornos de alta concurrencia, los recursos limitados se desperdician en tareas abandonadas

## Diseño del Endpoint de Cancelación

### Especificación Técnica

**Endpoint**: `DELETE /jobs/{jobId}`

**Parámetros**:
- `jobId` (path, requerido): Identificador único del trabajo a cancelar

**Autenticación**: Bearer Token (igual que otros endpoints)

**Respuesta Exitosa** (200):
```json
{
  "data": {
    "jobId": "uuid-string",
    "status": "cancelled",
    "cancelledAt": "2025-01-15T10:30:00.000Z",
    "message": "Job cancelled successfully"
  },
  "receivedAt": "2025-01-15T10:30:00.000Z",
  "respondedAt": "2025-01-15T10:30:00.001Z"
}
```

**Códigos de Error**:
- 404: Trabajo no encontrado o ya completado/cancelado
- 403: Sin permisos para cancelar el trabajo
- 409: Trabajo no puede ser cancelado (estado final)

### Estados de Trabajo

Los trabajos tendrán los siguientes estados:
- `pending`: Esperando ejecución
- `processing`: En ejecución
- `completed`: Finalizado exitosamente
- `failed`: Falló durante ejecución
- `cancelled`: Cancelado por el usuario

Solo trabajos en estado `pending` o `processing` pueden ser cancelados.

## Ejemplos de Uso

### Cancelación de Análisis de IA

```bash
# 1. Iniciar análisis de IA
POST /ai-analytics/analyze
Authorization: Bearer {token}
Content-Type: application/json

{
  "farmId": 102,
  "startDate": "2025-01-01",
  "endDate": "2025-01-31"
}

# Respuesta: jobId = "analysis-uuid-123"

# 2. Cancelar el análisis si toma demasiado tiempo
DELETE /jobs/analysis-uuid-123
Authorization: Bearer {token}
```

### Cancelación de Importación

```bash
# 1. Iniciar importación
POST /import/inventory?farmId=1
Authorization: Bearer {token}
Content-Type: multipart/form-data

# file: large_inventory.xlsx

# Respuesta: importId = "import-uuid-456"

# 2. Cancelar la importación
DELETE /jobs/import-uuid-456
Authorization: Bearer {token}
```

## Flujo de Trabajo

### Diagrama de Secuencia

```
Usuario → API Gateway → Job Manager
    ↓
Iniciar Trabajo Pesado
    ↓
Job Manager asigna jobId y estado 'pending'
    ↓
Trabajo entra en cola de ejecución
    ↓
Job Manager cambia estado a 'processing'
    ↓
Usuario decide cancelar → DELETE /jobs/{jobId}
    ↓
Job Manager verifica permisos y estado
    ↓
Si válido: marca como 'cancelled', libera recursos
    ↓
Respuesta de confirmación al usuario
```

### Integración con Endpoints Existentes

1. **Modificación de Endpoints Pesados**:
   - Devolver `jobId` en respuestas de trabajos asíncronos
   - Actualizar documentación para incluir referencias a cancelación

2. **Sistema de Jobs**:
   - Implementar tabla de jobs en base de datos
   - Middleware para tracking de estado
   - Cleanup automático de jobs antiguos

3. **Frontend Integration**:
   - Mostrar indicadores de progreso con opción de cancelar
   - Notificaciones en tiempo real del estado del trabajo

## Beneficios de Implementación

### Optimización de Recursos

- **Reducción de Consumo CPU**: Evita procesamiento innecesario de tareas abandonadas
- **Liberación de Memoria**: Jobs cancelados liberan recursos inmediatamente
- **Mejor Throughput**: Servidor puede atender más solicitudes concurrentes
- **Costos Operativos**: Menor uso de infraestructura cloud (menos costos de IA, base de datos)

### Mejora de Experiencia de Usuario

- **Control Total**: Usuarios pueden detener procesos en cualquier momento
- **Tiempo de Respuesta**: Interfaces más responsivas sin esperas indefinidas
- **Confianza**: Mayor adopción del sistema al reducir frustraciones
- **Productividad**: Permite corrección rápida de errores (ej: archivo equivocado en importación)

### Escalabilidad y Mantenibilidad

- **Alta Concurrencia**: Mejor manejo de múltiples usuarios simultáneos
- **Monitoreo**: Mejor visibilidad del estado del sistema
- **Debugging**: Fácil identificación de jobs problemáticos
- **Recuperación**: Sistema más resiliente ante fallos

### Casos de Uso Específicos

1. **Importaciones Grandes**: Usuario sube archivo equivocado → cancelar inmediatamente
2. **Análisis de IA Largos**: Usuario cambia parámetros → cancelar análisis anterior
3. **Consultas Pesadas**: Usuario navega a otra página → cancelar consulta en background
4. **Mantenimiento**: Administrador puede cancelar jobs de usuarios inactivos

## Consideraciones de Implementación

### Seguridad
- Verificar que solo el propietario del job pueda cancelarlo
- Logs de auditoría para todas las cancelaciones

### Idempotencia
- Múltiples llamadas DELETE al mismo jobId deben ser seguras
- Estado final (cancelled) no puede cambiar

### Cleanup
- Jobs cancelados deben limpiarse después de cierto tiempo
- Evitar acumulación de registros obsoletos

### Monitoreo
- Métricas de jobs cancelados vs completados
- Alertas cuando tasa de cancelación es alta (posible problema de UX)

Esta implementación transformará significativamente la robustez y eficiencia del sistema AgroGestion, proporcionando una experiencia de usuario superior y optimizando el uso de recursos del backend.