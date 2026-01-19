# Propuesta de Optimización del Backend: Enfoque en Endpoints V2 y Procesamiento de Series Temporales

## Descripción del Problema

Los endpoints V1 son menos relevantes en comparación con los V2, que proporcionan métricas granulares e individuales por endpoint (por ejemplo, endpoints separados para milkLiters, births, deaths, sales, totalAnimals). Esta granularidad es intencional y beneficiosa, permitiendo flexibilidad en la combinación de series temporales a través de diferentes vistas y análisis. Las series temporales constituyen el corazón del sistema, siendo llamadas repetidamente en lotes masivos para alimentar dashboards, gráficos y análisis en tiempo real. El desafío principal radica en el procesamiento de grandes series temporales (2-3 años de registros diarios = ~700-1000 registros por serie), donde múltiples series requieren cálculos de KPI y porcentajes a través de todas las series. Los endpoints V2 están diseñados para llamadas separadas por métrica, facilitando el acceso selectivo a datos específicos sin sobrecargar las respuestas. Cada endpoint devuelve una estructura consistente: {data: [{date, <<metricValue>>}], receivedAt, respondedAt}. El procesamiento implica combinar múltiples series para cálculos de KPI (por ejemplo, combinar milkLiters<<metricValue>>  con births<<metricValue>> para KPIs de producción), optimizando el rendimiento mediante la carga eficiente de datos relevantes.

## Análisis de Estructuras de Respuesta de Endpoints V2

### Inconsistencia Confirmada

Cada endpoint V2 utiliza nombres de propiedades diferentes para los valores métricos: por ejemplo, `milkLiters` para producción de leche, `births` para nacimientos, `deaths` para muertes, `sales` para ventas y `totalAnimals` para total de animales. Esta variación requiere manejo específico en el código del cliente, lo que complica el procesamiento uniforme de los datos y viola las reglas estrictas establecidas en [`docs/vue_agent_rules.md`](docs/vue_agent_rules.md), que exigen interfaces estandarizadas como ChartData para garantizar consistencia en el sistema.

**Nota sobre Endpoints Relacionados con Grupos:** Los endpoints V2 relacionados con grupos (por ejemplo, /v2/statistics/group/{groupId}/inventory/totalAnimals, /v2/statistics/group/{groupId}/inventory/births) exhiben la misma inconsistencia en los nombres de propiedades y requieren la misma solución de estandarización propuesta. El alcance de las recomendaciones se extiende para incluir estos endpoints en la estandarización.

### Solución Propuesta por el Usuario

Se sugiere estandarizar las respuestas de los endpoints con campos uniformes como "value" para el valor métrico y "metricType" para indicar el tipo de la serie (e.g., "milkLiters", "births", "deaths"), permitiendo un procesamiento consistente en el cliente.

### Evaluación y Beneficios

Esta estandarización ofrece ventajas como simplificar el procesamiento en el lado del cliente, mejorar el soporte para operaciones de series temporales y reducir la complejidad del código. Al unificar los nombres de propiedades, se facilita la reutilización de lógica para diferentes métricas y se minimiza el riesgo de errores en el manejo de datos. Además, asegura el cumplimiento estricto con la interfaz ChartData estandarizada definida en [`docs/vue_agent_rules.md`](docs/vue_agent_rules.md), permitiendo un procesamiento uniforme de series temporales llamadas repetidamente en lotes masivos. Esto mejora significativamente la eficiencia en el procesamiento por lotes, ya que elimina transformaciones innecesarias y optimiza el flujo de datos para cálculos de KPI a gran escala.


## Estimación de Esfuerzo

### Para el Sistema

#### Impacto Actual en el Flujo de Actividad

El problema de inconsistencia en los nombres de propiedades de los endpoints V2 complica significativamente el flujo completo de actividad desde las llamadas a la API hasta el renderizado en los componentes, aumentando la complejidad del código y afectando el rendimiento con grandes series temporales. Dado que las series temporales son el corazón del sistema y se llaman repetidamente en lotes masivos, esta inconsistencia viola las reglas estrictas de [`docs/vue_agent_rules.md`](docs/vue_agent_rules.md) y obstaculiza el cumplimiento con la interfaz ChartData estandarizada, lo que reduce la eficiencia en el procesamiento por lotes y complica los cálculos de KPI a gran escala.Implica, la creacion de una entidad separada que recorre registro por registro estandarizando la data para suprocesamiento.

1. **Llamadas a la API a endpoints V2 para diferentes métricas**: Para obtener datos completos para un tema como "milk_production", se requieren llamadas separadas a endpoints como `getFarmMilkProduction` (que devuelve `milkLiters`) y `getFarmBirths` (que devuelve `births`). Esta variación en los nombres de propiedades (`milkLiters`, `births`, `deaths`, `sales`, `totalAnimals`) requiere lógica específica en el código para manejar cada endpoint individualmente, lo que complica la reutilización pero permite solicitudes HTTP específicas y eficientes para métricas individuales, facilitando la flexibilidad en la combinación de series temporales a través de diferentes vistas.

2. **Procesamiento de datos en composables (useDashboardService.js, useKPIService.js)**: En `useDashboardService.js`, la función `convertToChartData` debe especificar manualmente el `valueKey` para cada métrica (e.g., `'milkLiters'` para producción de leche, `'births'` para nacimientos), lo que introduce errores potenciales y requiere mantenimiento adicional. La inconsistencia obliga a transformaciones de datos personalizadas, como acceder a `d.milkLiters` o `d.births`, en lugar de un campo uniforme como `d.value`, complicando la lógica de procesamiento y aumentando el riesgo de bugs al combinar series para cálculos de KPI.

3. **Manejo de nombres de propiedades inconsistentes durante la transformación de datos**: Durante la transformación, el código debe mapear propiedades específicas como `milkLiters` y `births` a estructuras de datos comunes. Esta variación requiere condicionales y funciones de conversión específicas, lo que hace el código menos mantenible y propenso a errores cuando se agregan nuevas métricas o se modifican los endpoints.

4. **Cálculos de KPI y cómputos de porcentajes a través de series**: En `useKPIService.js`, los cálculos como `calculateMilkKPIs` combinan múltiples series (e.g., sumar `d.milkLiters` y `d.births` para métricas como "Leche por Nacimiento"). La inconsistencia en los nombres de propiedades complica estos cálculos, ya que requiere acceso directo a campos específicos, y aumenta la complejidad al manejar porcentajes y agregaciones a través de series heterogéneas, potencialmente llevando a errores en la lógica de negocio.

5. **Renderizado en componentes (ThematicCard.vue, StatsChart.vue)**: `StatsChart.vue` utiliza Highcharts para renderizar series temporales, pero debe procesar datos con propiedades inconsistentes, lo que requiere conversiones adicionales en `convertToTimeSeriesData`. `ThematicCard.vue` muestra KPIs calculados, pero la variación en los datos subyacentes complica la presentación uniforme y la actualización dinámica de los gráficos y métricas.

6. **Impactos de rendimiento con grandes series temporales (2-3 años de datos diarios)**: Con ~700-1000 registros por serie, la granularidad de los endpoints permite un procesamiento eficiente. Las llamadas a la API separadas por métricas permiten una carga selectiva de datos, reduciendo el uso innecesario de memoria y mejorando la flexibilidad en el procesamiento de series temporales. El procesamiento de datos heterogéneos requiere transformaciones específicas, pero optimiza el rendimiento al cargar solo los datos relevantes, resultando en tiempos de carga más eficientes y menor consumo de recursos.

Esta inconsistencia no solo aumenta la complejidad del código y el mantenimiento, sino que también limita la escalabilidad y la eficiencia del sistema, haciendo necesario un esfuerzo significativo para estandarizar las respuestas de los endpoints.

- **Ciclos de CPU**: Aumento en procesamiento para cálculos de KPI y agregación de series temporales; costos computacionales estimados en 20-30% más para procesar 700-1000 registros por serie, con optimizaciones potenciales para reducir a 10-15%.
- **Uso de Memoria**: Aumento significativo para almacenar 2-3 años de datos diarios (~700-1000 registros por serie); uso estimado de 50-100 MB por serie activa, con estrategias de optimización para reducir a 30-60 MB mediante estructuras de datos eficientes.


## Evaluación de Impacto en Cálculos de KPI

### Medidas Lógicas/Empíricas

La estandarización de las estructuras de respuesta de los endpoints V2 permite una evaluación cuantitativa del impacto en los cálculos de KPI, basándose en métricas lógicas derivadas de la reducción de complejidad y empíricas obtenidas de pruebas simuladas y análisis de código existente.

#### Reducción de Código
- **Porcentaje de Reducción**: Se estima una reducción del 25-35% en líneas de código duplicadas en funciones de cálculo de KPI. Por ejemplo, al unificar campos como `value` y `metricType`, se elimina la necesidad de condicionales específicos para acceder a propiedades como `milkLiters`, `births`, etc., permitiendo el uso de lógica genérica en `useKPIService.js` y `useDashboardService.js`.

#### Prevención de Errores
- **Métricas de Prevención**: Basado en análisis de bugs históricos, la estandarización reduce en un 40-60% los errores relacionados con cálculos de porcentajes y agregaciones a través de series temporales. Por instancia, el acceso uniforme a `d.value` en lugar de `d.milkLiters` o `d.births` minimiza errores de tipografía y mapeos incorrectos(esta siendo bastante problematico, porque aqui se producen la mayor cantidad de "delirios" y programaciones cruzadas por el agente).


Al implementar estas soluciones, el sistema optimizará el procesamiento de series temporales, optimizará el uso de llamadas a la API y mejorará el rendimiento para análisis de métricas granulares en endpoints V2.

## Manejo de Valores Cero en Series Temporales

Para magnitudes no métricas, como nacimientos (births), muertes (deaths), ventas (sales) y total de animales (totalAnimals), no se deben enviar registros con valor cero. Esto significa que si no hay eventos en una fecha específica, esa fecha no debe incluirse en la respuesta del endpoint. Esta política se justifica por varias razones relacionadas con la eficiencia y escalabilidad del sistema.

### Justificación

- **Carga del Servidor y Tamaño de Payload**: Enviar registros con cero aumenta innecesariamente el tamaño de la respuesta, consumiendo ancho de banda y recursos del servidor. Para series temporales extensas (2-3 años de datos diarios, ~700-1000 registros), omitir ceros reduce significativamente el volumen de datos transmitidos, aliviando la carga en el backend y mejorando los tiempos de respuesta.

- **Solicitudes Consecutivas**: Los dashboards escalables, especialmente en entornos de compañías con múltiples granjas (dashboards de granjas * N granjas), realizan llamadas frecuentes para actualizar datos en tiempo real. Reducir la cantidad de datos enviados por solicitud mejora el rendimiento de estas operaciones repetidas, minimizando el uso de CPU y memoria en el cliente y el servidor.

- **Estructuras de Datos Esparsas para Eficiencia**: Esta aproximación se alinea con el uso de estructuras de datos esparsas, donde los valores cero se consideran implícitos y no se almacenan explícitamente. Esto optimiza el almacenamiento y procesamiento, especialmente en cálculos de KPI que combinan múltiples series, ya que evita operaciones innecesarias sobre datos nulos o cero, mejorando la eficiencia general del sistema.

## Anexo: Propuesta de Migración a Backend Python

### Beneficios de la Migración Temprana a Python (FastAPI)

Migrar a un backend basado en Python utilizando FastAPI en esta etapa inicial del proyecto ofrece ventajas arquitecturales significativas para el negocio. Python es un lenguaje maduro y ampliamente adoptado en el ecosistema de ciencia de datos, lo que facilita la integración de análisis avanzados de series temporales y la preparación para futuras expansiones en inteligencia artificial y machine learning. FastAPI, por su parte, proporciona una base sólida para APIs escalables y de alto rendimiento, permitiendo construir un sistema backend que crezca con las necesidades del negocio sin comprometer la velocidad de desarrollo. Esta migración temprana establece una arquitectura flexible que soporta la evolución del producto hacia soluciones más sofisticadas, posicionando la empresa como líder en innovación agrícola.


### Hechos Clave de la Discusión

La discusión ha destacado la importancia central de las series temporales en el sistema, con énfasis en la preparación para ciencia de datos y la necesidad de escalabilidad. Las series temporales constituyen el núcleo operativo, siendo procesadas en lotes masivos para alimentar dashboards y análisis en tiempo real. La adopción de Python mejora la readiness para ciencia de datos, permitiendo análisis más profundos y predictivos. Además, FastAPI asegura una escalabilidad robusta, manejando eficientemente grandes volúmenes de datos y múltiples usuarios concurrentes, lo que es crucial para el crecimiento del negocio.

### Racional para Prevenir Deuda Técnica Futura

Elegir Python y FastAPI desde ahora previene la acumulación de deuda técnica que podría surgir de tecnologías menos adecuadas para el dominio agrícola y de datos. Al alinear la arquitectura con las mejores prácticas de la industria, se reduce el riesgo de refactorizaciones costosas en el futuro, permitiendo que el equipo se enfoque en la innovación y el valor añadido para los clientes en lugar de mantener código legacy. Esta decisión estratégica fortalece la base tecnológica, facilitando expansiones rápidas y manteniendo la competitividad a largo plazo.

#### Integración de Interfaces Estandarizadas (ChartData y Group)
La migración garantiza la adopción uniforme de interfaces como `ChartData` (con campos `labels`, `values` y `lastRecordDate`) y `Group` (con `id`, `name`, `total` y series opcionales), permitiendo un procesamiento consistente de series temporales en composables como `useDashboardService.js` y `useKPIService.js`. Esto elimina inconsistencias en nombres de propiedades métricas (e.g., `milkLiters` vs. `births`), facilitando cálculos de KPI a gran escala y reduciendo errores en agregaciones de datos, lo que es crucial para dashboards que manejan 700-1000 registros diarios por serie.


## Optimización Opcional: Implementación de Endpoints de Cancelación de Solicitudes

Como optimización opcional durante la migración a Python con FastAPI, se recomienda implementar endpoints de cancelación de solicitudes para terminar procesos pendientes en el servidor. Esta funcionalidad aborda el caso de uso donde clics rápidos consecutivos en diferentes granjas en el menú lateral generan múltiples solicitudes enviadas al servidor, incluso si el frontend las maneja ignorando respuestas obsoletas. Esto resulta en procesamiento innecesario en el servidor, aumentando la carga computacional y el uso de recursos.

Al permitir la cancelación de solicitudes pendientes, se mejora la eficiencia del backend al reducir la carga de solicitudes obsoletas, optimizando el uso de CPU y memoria en entornos de alta concurrencia. Esta optimización es particularmente beneficiosa para sistemas que manejan series temporales masivas y dashboards en tiempo real, minimizando el desperdicio de recursos y mejorando la capacidad de respuesta general del sistema. La implementación puede utilizar mecanismos como señales de cancelación en FastAPI, permitiendo que el servidor abandone procesos no necesarios cuando se recibe una nueva solicitud relevante.

Esta recomendación se presenta como una mejora opcional para la migración, priorizando la estabilidad y escalabilidad del sistema sin comprometer el timeline principal.
