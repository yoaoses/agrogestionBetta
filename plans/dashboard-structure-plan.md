# Plan de Estructura Exacta para DashboardView.vue (One-Page Dashboard)

## Visión General
Implementar un dashboard de una sola página (one-page) en DashboardView.vue con navegación interna fija (sticky), links temáticos numerados con scrollspy, contenido largo con cards temáticas numeradas (Card #1, etc.). Cada card tiene sección 1 (tabs dinámicos para gráficos/series), sección 2 (participación farms/KPIs), footer (último registro válido). Carga progresiva, lazy load con IntersectionObserver, animaciones slide up/down al scroll. Paleta: verde #00C853, azul #0288D1. Framework: Bootstrap.

## Estructura del Template Outline

### 1. Navegación Interna Fija (Nav)
- **Posición**: Fixed/sticky en la parte superior
- **Elementos**: Links temáticos numerados (Tema 1, Tema 2, etc.) con scrollspy que resalta el activo al scroll
- **Funcionalidad**: Click para smooth scroll a la sección correspondiente

### 2. Contenido One-Page Largo
- **Layout**: Contenedor con altura máxima, scroll interno (sin scroll del navegador)
- **Cards Temáticas Numeradas**:
  - Card #1: Tema 1
  - Card #2: Tema 2
  - etc.

### 3. Estructura de Cada Card
- **Sección 1**: Tabs dinámicos para gráficos/series
  - Tabs generados dinámicamente desde datos (title, chartData)
- **Sección 2**: Participación farms/KPIs
  - Array de participación (farm/percent o KPIs)
- **Footer**: Último registro válido (lastRecord)

## Servicio Mock: useDashboardService.js

### Estructura de Datos por Tema
Cada paquete de datos incluye:
- `theme`: Nombre del tema
- `tabs`: Array de objetos { title, chartData, lastRecord }
- `participation`: Array de { farm, percent } o KPIs

### Código Completo del Servicio Mock

```javascript
import { ref, computed, readonly } from 'vue'

// Función para simular delay de API
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Generar datos simulados por tema
const generateThemeData = (themeIndex, farmId) => {
  const themes = ['Producción Lechera', 'Salud Animal', 'Inventario', 'Análisis Financiero']
  const theme = themes[themeIndex % themes.length]

  const tabs = [
    {
      title: 'Gráfico Principal',
      chartData: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May'],
        values: Array.from({length: 5}, () => Math.floor(Math.random() * 100))
      },
      lastRecord: {
        date: new Date().toISOString(),
        value: Math.floor(Math.random() * 1000),
        description: 'Último registro válido'
      }
    },
    {
      title: 'Serie Temporal',
      chartData: {
        labels: ['Sem1', 'Sem2', 'Sem3', 'Sem4'],
        values: Array.from({length: 4}, () => Math.floor(Math.random() * 200))
      },
      lastRecord: {
        date: new Date().toISOString(),
        value: Math.floor(Math.random() * 500),
        description: 'Registro semanal'
      }
    }
  ]

  const participation = [
    { farm: 'Granja A', percent: 30 + Math.random() * 20 },
    { farm: 'Granja B', percent: 25 + Math.random() * 15 },
    { farm: 'Granja C', percent: 20 + Math.random() * 10 },
    { farm: 'KPIs', percent: 15 + Math.random() * 5 } // O KPIs si aplica
  ]

  return { theme, tabs, participation }
}

export function useDashboardService() {
  const loading = ref(false)
  const error = ref(null)

  // Estado de datos
  const themesData = ref([])

  // Función principal para obtener datos por tema
  const getThemesData = async (farmId) => {
    if (!farmId) return []

    loading.value = true
    error.value = null

    try {
      // Simular delay de API
      await delay(1000)

      const data = []
      for (let i = 0; i < 5; i++) { // 5 temas
        data.push(generateThemeData(i, farmId))
      }

      themesData.value = data
      return data
    } catch (err) {
      error.value = 'Error al cargar datos de temas'
      console.error('Dashboard service error:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    themesData: readonly(themesData),
    getThemesData
  }
}
```

## Características Técnicas

### 1. Carga Progresiva y Lazy Load
- Usar IntersectionObserver para cargar cards al entrar en viewport
- Skeleton loaders durante carga
- Cargar datos por tema de manera secuencial

### 2. Animaciones
- Slide up/down al scroll usando Vue transitions
- Animaciones de entrada para cards
- Transiciones suaves en tabs

### 3. Scrollspy
- Bootstrap scrollspy para navegación interna
- Resaltar link activo basado en sección visible

### 4. Paleta de Colores
- Verde principal: #00C853
- Azul secundario: #0288D1
- Aplicar en variables CSS y componentes Bootstrap

## Arquitectura de Componentes

### DashboardView.vue
- Contenedor principal con nav fija y contenido scrollable
- Importar useDashboardService
- Renderizar cards numeradas

### ThematicCard.vue
- Componente para cada card temática
- Props: themeData, index
- Secciones: tabs, participación, footer

### DynamicTabs.vue
- Tabs dinámicos basados en tabs array
- Renderizar gráficos con chartData

## Diagrama de Flujo

```mermaid
graph TD
    A[DashboardView] --> B[Nav Fija con Links Numerados]
    A --> C[Contenido Scrollable]
    C --> D[Card #1]
    C --> E[Card #2]
    C --> F[Card #N]

    D --> G[Sección 1: Tabs Dinámicos]
    D --> H[Sección 2: Participación/KPIs]
    D --> I[Footer: Último Registro]

    J[useDashboardService] --> K[Paquetes por Tema]
    K --> L[theme, tabs[], participation[]]
    L --> M[tabs: title, chartData, lastRecord]
```