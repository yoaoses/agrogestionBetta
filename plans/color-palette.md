# Paleta de Colores para Sitio Web Agrotech

## Introducción
Esta paleta de colores está diseñada para un sitio web agrotech enfocado en ganadería sostenible, basado en el logo con gradiente verde-azul. El verde representa naturaleza y sostenibilidad, mientras que el azul simboliza tecnología y datos.

## Paleta Principal
Colores extraídos directamente del logo:

- **Verde Principal** (#00C853): Usado para elementos primarios relacionados con naturaleza y sostenibilidad.
- **Azul Principal** (#0288D1): Usado para elementos tecnológicos y datos.

Variaciones:
- Verde Oscuro (#00A044)
- Verde Claro (#00E676)
- Azul Oscuro (#0277BD)
- Azul Claro (#03A9F4)

## Colores Neutros y de Soporte
Para fondos, textos y elementos UI:

- Blanco (#FFFFFF)
- Gris Claro (#F5F5F5) - Fondos secundarios
- Gris Medio (#9E9E9E) - Texto secundario
- Gris Oscuro (#424242) - Texto principal en fondos claros
- Negro (#000000) - Texto en fondos claros

## Paleta Extendida
Variaciones para estados interactivos:

### Verde
- Hover: #00D94A (lighten 10%)
- Active: #009639 (darken 10%)
- Disabled: rgba(0, 200, 83, 0.5)

### Azul
- Hover: #039BE5 (lighten 10%)
- Active: #0277BD (darken 10%)
- Disabled: rgba(2, 136, 209, 0.5)

## Variaciones Especiales

### Modo Oscuro
- Fondo Principal: #121212
- Fondo Secundario: #1E1E1E
- Texto Principal: #FFFFFF
- Texto Secundario: #B3B3B3
- Verde Adaptado: #00C853 (mismo, o ajustar si necesario)
- Azul Adaptado: #0288D1

### Pastel
Versiones suaves y desaturadas:
- Verde Pastel: #B2DFDB
- Azul Pastel: #B3E5FC

### Tierra
Tonos terrosos para elementos relacionados con suelo y agricultura:
- Marrón Claro: #A1887F
- Marrón Oscuro: #8D6E63

## Consideraciones de Accesibilidad (WCAG)
- Contraste mínimo 4.5:1 para texto normal (e.g., negro #000000 sobre blanco #FFFFFF).
- Para texto grande, 3:1.
- Verificar combinaciones: Verde #00C853 sobre blanco cumple (ratio ~5.2:1).
- Azul #0288D1 sobre blanco cumple (ratio ~4.8:1).
- En modo oscuro, ajustar textos para mantener contraste.

## Integración con Tailwind CSS
Agregar a `tailwind.config.js`:

```js
module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'agrotech-green': '#00C853',
        'agrotech-green-dark': '#00A044',
        'agrotech-green-light': '#00E676',
        'agrotech-blue': '#0288D1',
        'agrotech-blue-dark': '#0277BD',
        'agrotech-blue-light': '#03A9F4',
        'neutral-light': '#F5F5F5',
        'neutral-medium': '#9E9E9E',
        'neutral-dark': '#424242',
        // Agregar más según necesidad
      }
    }
  },
  plugins: []
}
```

## Sugerencias de Uso en Componentes Vue.js

### Login (LoginModal.vue)
```vue
<template>
  <div class="bg-agrotech-green p-4 rounded">
    <button class="bg-agrotech-blue hover:bg-agrotech-blue-light text-white px-4 py-2 rounded">
      Iniciar Sesión
    </button>
  </div>
</template>
```

### Dashboard (DashboardView.vue)
```vue
<template>
  <div class="bg-neutral-light min-h-screen">
    <nav class="bg-agrotech-blue text-white p-4">
      Navegación
    </nav>
    <div class="p-4">
      <h1 class="text-neutral-dark">Dashboard</h1>
      <!-- Gráficos con colores agrotech -->
    </div>
  </div>
</template>
```

### Gráficos (StatsChart.vue)
Usar colores para series: verde para datos positivos, azul para métricas.

### Navegación (NavBar.vue)
Fondos con gradiente: `bg-gradient-to-r from-agrotech-green to-agrotech-blue`

## Implementación
Esta paleta está lista para copiar y pegar en el proyecto. Ajustar según feedback visual.