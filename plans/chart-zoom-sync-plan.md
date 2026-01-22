# Plan de Sincronización Global de Zoom en Gráficos

## Problema
Los gráficos en ThematicCard tienen un menú de zoom con opciones como "3m", "All", etc. Actualmente, cada gráfico maneja su zoom independientemente. El usuario quiere sincronizar globalmente el zoom: si cambia en un gráfico, todos los demás deben cambiar al mismo nivel.

Restricción: No modificar los gráficos directamente (es decir, no cambiar el código interno de Highcharts o StatsChart de manera que altere su comportamiento base).

## Análisis Actual
- StatsChart.vue usa Highcharts.stockChart con rangeSelector.
- rangeSelector tiene botones: 1m, 3m, 6m, YTD, 1y, All.
- Por defecto, selected: 4 ("1y").

## Soluciones Evaluadas

### 1. Store Global (Pinia) - RECOMENDADA
**Descripción**: Crear un store que mantenga el índice de zoom actual. Cada StatsChart se suscribe al store y actualiza su rangeSelector cuando cambia.

**Pros**:
- Arquitectura limpia y centralizada.
- Robusta, no depende de DOM.
- Fácil de mantener y extender.
- Cumple con restricción (integra sin modificar interno).

**Cons**:
- Requiere modificar StatsChart para integrar el store.

### 2. Bus de Eventos Global
**Descripción**: Usar eventos personalizados para comunicar cambios de zoom.

**Pros**:
- Ligero.

**Cons**:
- Menos estructurado.
- Todavía requiere modificar StatsChart.

### 3. Listener de Click Global
**Descripción**: Listener global que detecta clicks en botones de zoom y simula clicks en otros.

**Pros**:
- No modifica gráficos.

**Cons**:
- Frágil (depende de clases CSS de Highcharts).
- Difícil de mantener.
- No maneja cambios programáticos.

## Recomendación
Usar Store Global con Pinia por su robustez, mantenibilidad y cumplimiento de restricciones.

## Plan de Implementación

1. **Verificar/Instalar Pinia**:
   - Comprobar si está en package.json.
   - Si no, instalar: npm install pinia

2. **Crear Store para Zoom**:
   - Archivo: src/stores/chartZoom.js
   - Estado: currentZoomIndex = 1 (default "3m")
   - Action: setZoom(index)

3. **Modificar StatsChart.vue**:
   - Importar store.
   - En chartOptions, cambiar selected: store.currentZoomIndex
   - Agregar watcher: watch(() => store.currentZoomIndex, (newIndex) => { if (chartInstance.value) chartInstance.value.rangeSelector.clickButton(newIndex) })
   - Para detectar cambios del usuario: En createChart, después de crear, agregar event listeners a los botones de rangeSelector.
     - Usar chartInstance.rangeSelector.buttons.forEach((btn, idx) => btn.element.addEventListener('click', () => store.setZoom(idx)))

4. **Pruebas**:
   - Verificar que cambiando zoom en un gráfico, otros se actualicen.
   - Probar con múltiples ThematicCard.

5. **Consideraciones**:
   - Asegurar que el store se inicialice correctamente.
   - Manejar casos donde gráficos se crean después.