# Reglas para Agente IA - Arquitectura de Composables y Servicios en Vue 3

## Regla Principal
**NUNCA modifiques useFarmData, useKpi o composables de datos desde otros módulos.** Todos los cambios relacionados con composables de datos deben ser coordinados exclusivamente con el arquitecto responsable de la arquitectura de datos.

## Interfaces Estandarizadas (Obligatorias)

### ChartData
```javascript
{
  labels: string[],  // Siempre array de strings (fechas formateadas dd-mm-yy)
  values: number[],  // Siempre array de números
  lastRecordDate?: Date  // obligatorio, fecha del último registro válido
}
```

### Group
```javascript
{
  id: number,
  name: string,
  total: number,
  series?: { dates: Date[], values: number[] }  // Opcional para series temporales
}
```

### MilkingData
```javascript
{
  chartData: ChartData,
  groups: Group[],
  participation?: Array<{name: string, percentage: number, total: number}>,
  totalProduction: number,
  lastRecordDate: Date | null,
  category: string
}
```

## Separación de Responsabilidades

### Composables de Datos (useFarmData, useKpi, etc.)
- ✅ Obtención de datos desde API
- ✅ Procesamiento y transformación de datos
- ✅ Cacheo inteligente
- ✅ Estandarización de formatos de salida
- ❌ Renderizado de UI
- ❌ Manipulación del DOM
- ❌ Cálculos de participación (usar utils/calculationService)

### Componentes Vue
- ✅ Renderizado de gráficos y UI
- ✅ Manipulación del DOM
- ✅ Configuración de event listeners
- ❌ Llamadas directas a API
- ❌ Procesamiento de datos crudos

### Utilidades (utils/calculationService, dateService)
- ✅ Cálculos matemáticos
- ✅ Suma de series
- ✅ Cálculos de participación
- ❌ Llamadas a API
- ❌ Renderizado

## Reglas para Nuevas Implementaciones

### Para Nuevos Gráficos/Métricas
1. **SIEMPRE** definir interfaz de datos primero
2. Usar `DataServiceBase.convertToChartData()` o equivalente en composable
3. Mantener formato consistente de fechas (dd-mm-yy)
4. Incluir `lastRecordDate` 
5. Verificar compatibilidad con componentes existentes

### Para Nuevas Series
1. Usar array de `ChartData` para múltiples series
2. Cada serie debe tener propiedad `label` adicional
3. Mantener labels sincronizadas entre series
4. Usar `calculationService.sumSeries()` para agregaciones

### Para Nuevos Grupos/Categorías
1. Extender `Group` interface si necesario (coordinar con arquitecto)
2. Calcular participación usando `calculationService.calculateParticipation()`
3. Ordenar por total descendente para visualización
4. Incluir series temporales opcionales

## Cache y Rendimiento

### Obligatorio
- Verificar cache ANTES de hacer llamadas API
- Usar TTL apropiado (definir con arquitecto)
- Invalidar cache cuando cambien parámetros importantes
- No duplicar llamadas API para mismos datos

### Prohibido
- Hacer llamadas API innecesarias
- Ignorar cache existente
- Implementar cache personalizado (usar Pinia o composables)

## Manejo de Errores

### En Composables de Datos
- Capturar errores de API
- Loggear errores apropiadamente
- Retornar datos por defecto cuando sea posible
- No mostrar alerts al usuario (dejar eso a componentes)

### En Componentes
- Manejar errores de composables
- Mostrar mensajes de error apropiados al usuario
- Mantener UI funcional incluso con errores parciales

## Coordinación de Cambios

### Si necesitas modificar formatos de salida
1. Consultar con arquitecto responsable
2. Verificar impacto en todos los componentes
3. Actualizar interfaces si es necesario
4. Probar compatibilidad backward

### Si necesitas nueva funcionalidad
1. Definir requerimientos con arquitecto
2. Implementar en composable correcto
3. Seguir patrones existentes
4. Documentar cambios

## Casos de Uso Comunes

### Agregar nueva métrica a dashboard
1. Agregar método en composable apropiado
2. Retornar `ChartData` estandarizado
3. Usar componente para visualizar
4. Verificar cache funciona

### Modificar cálculo de participación
1. Usar `calculationService.calculateParticipation()`
2. No implementar lógica propia
3. Coordinar formato de salida con componentes

### Agregar nuevo tipo de gráfico
1. Definir datos usando interfaces existentes
2. Extender componente de gráficos si necesario
3. Mantener consistencia visual
4. Documentar nuevo patrón

## Patrón de Cards Temáticas

### Rol del ThemeOrchestrator
El `ThemeOrchestrator` actúa como el responsable central para coordinar y entregar el contenido completo de las secciones de cada card temática. Este módulo centraliza la lógica de obtención de datos, procesamiento y distribución de información a los componentes de cards, asegurando consistencia y evitando duplicaciones. Todas las cards temáticas deben depender exclusivamente del `ThemeOrchestrator` para su contenido, sin implementar servicios ad-hoc o llamadas directas a API.

### Proceso para Crear Nuevas Cards Temáticas
Para crear nuevas cards temáticas, se debe replicar exactamente el patrón establecido por la primera card ("Prod. Lechera") sin modificarlo. Este proceso incluye:

1. Definir la nueva card en el `ThemeOrchestrator`, siguiendo la estructura de secciones y métodos existentes.
2. Utilizar los mismos composables y servicios subyacentes, adaptando únicamente los parámetros específicos de la nueva temática.
3. Mantener la interfaz de datos estandarizada y el flujo de renderizado idéntico al de "Prod. Lechera".
4. No alterar el código base de otras cards o el `ThemeOrchestrator` más allá de agregar la nueva entrada.

### Advertencias para Evitar Errores Comunes
- **Evitar servicios ad-hoc**: No crear nuevos servicios o composables específicos para cada card; reutilizar siempre los existentes a través del `ThemeOrchestrator`.
- **Prevenir duplicación de código**: No copiar lógica de procesamiento o renderizado; mantener un patrón único replicable.
- **No modificar el flujo existente**: Cualquier cambio al patrón debe ser coordinado con el arquitecto, evitando alteraciones que afecten otras cards.

### Estructura de KPIs en Cards Temáticas

- KPIs pueden ser globales (para todas las tabs) o específicos por tab.
- Validación: Si kpisData global tiene elementos, mostrar en todas las tabs; si vacío, mostrar kpisData de la tab activa.
- Mantener formato consistente: array de objetos con name, value, expected, unit, icon, desc.

## Verificación Final
Antes de implementar cualquier cambio:
- ¿Estoy modificando el composable correcto?
- ¿Estoy siguiendo las interfaces estandarizadas?
- ¿Estoy respetando la separación de responsabilidades?
- ¿He verificado el impacto en cache y rendimiento?
- ¿He coordinado con el arquitecto si es necesario?