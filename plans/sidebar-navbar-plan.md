# Plan para Transformar NavBar en Sidebar Vertical Izquierdo

## Problema Actual
El navbar horizontal actual funciona bien en desktop pero ocupa espacio vertical valioso. Para mejorar la experiencia de usuario y optimizar el espacio, se propone convertir el navbar en un sidebar vertical fijo a la izquierda, inspirado en el plan de mejora de layout móvil existente (plans/navbar-layout-improvement.md). Esto permitirá más espacio para el contenido principal y una navegación más intuitiva.

## Solución Propuesta
Refactorizar el componente NavBar.vue para que actúe como un sidebar vertical izquierdo fijo, ajustando el layout general de la aplicación en App.vue. Mantener la funcionalidad existente, incluyendo el colapso en dispositivos móviles, pero optimizar para un diseño vertical. El login y páginas relacionadas quedan excluidas de este refactor por razones de diseño y simplicidad.

## Análisis de Componentes Existentes
- **NavBar.vue**: Actualmente usa Bootstrap navbar horizontal con colapso móvil. Contiene navegación, selectores de empresa/finca, theme selector y user dropdown.
- **App.vue**: Incluye NavBar condicionalmente (excepto en /login y /) y router-view.
- **Otras vistas**: No requieren cambios directos, pero el layout general afectará el espacio disponible.
- **Composables**: No se modifican composables de datos (useFarmData, etc.) para respetar las reglas de arquitectura (vue_agent_rules.md).

## Cambios Detallados

### 1. Modificación de NavBar.vue
- **Estructura HTML**: Cambiar de `<nav>` horizontal a un `<aside>` vertical con clases CSS personalizadas.
- **Layout Vertical**: Organizar elementos en columna: logo arriba, navegación en medio, theme selector y user dropdown abajo.
- **Estilos CSS**: 
  - Posición fija: `position: fixed; left: 0; top: 0; height: 100vh; width: 250px;` (ajustable).
  - Fondo y colores según tema.
  - Scroll interno si necesario.
- **Responsive**: En móvil (< lg), convertir en drawer overlay con toggle button flotante.
- **Funcionalidad**: Mantener dropdowns, selecciones de empresa/finca, theme switch y logout.

### 2. Modificación de App.vue
- **Nuevo Layout**: 
  ```html
  <div class="app-layout">
    <SideBar v-if="route.path !== '/login' && route.path !== '/'" />
    <main class="main-content" :class="{ 'with-sidebar': route.path !== '/login' && route.path !== '/' }">
      <router-view />
    </main>
  </div>
  ```
- **Estilos**: Agregar padding-left al main-content cuando sidebar esté presente.
- **Transiciones**: Suavizar la aparición/desaparición del sidebar.

### 3. Cambios en CSS Global (style.css)
- Variables CSS para ancho de sidebar.
- Media queries para responsive (ocultar sidebar en móvil, mostrar drawer).
- Ajustes para z-index y overlays.

### 4. Integración con Reglas de Arquitectura
- **No modificar composables de datos**: El refactor es puramente UI, no afecta useFarmData, useKpi u otros composables.
- **Separación de responsabilidades**: Mantener lógica de datos en composables, UI en componentes.
- **Interfaces estandarizadas**: No aplicable directamente, ya que no se cambian formatos de datos.

## Mejoras en la Experiencia de Usuario
1. **Más Espacio para Contenido**: Liberar espacio horizontal para dashboards y gráficos.
2. **Navegación Intuitiva**: Sidebar vertical es estándar en aplicaciones web modernas.
3. **Responsive Mejorado**: Drawer en móvil mantiene usabilidad sin ocupar espacio permanente.
4. **Consistencia Visual**: Integrar con el plan móvil existente para un diseño coherente.
5. **Accesibilidad**: Mantener navegación por teclado y ARIA labels.

## Implementación Técnica
- **Vue 3 Composition API**: Mantener la lógica existente en NavBar.vue.
- **Bootstrap 5 y Bootstrap Icons**: Utilizar Bootstrap 5 como framework CSS para clases de layout, componentes y utilidades, e integrar Bootstrap Icons como recursos de CSS para iconos en la navegación y elementos interactivos del sidebar.
- **Pinia Stores**: No cambios en stores de auth o theme.
- **Router**: Mantener navegación existente.
- **Testing**: Probar en breakpoints sm, md, lg, xl. Verificar funcionalidad de dropdowns y selecciones.

## Pasos de Implementación
1. Crear rama de desarrollo.
2. Modificar NavBar.vue para layout vertical.
3. Actualizar App.vue con nuevo layout.
4. Agregar CSS necesario.
5. Probar responsive y funcionalidad.
6. Merge después de QA.

Este plan transforma el navbar en un sidebar moderno mientras respeta la arquitectura existente y excluye el login como solicitado.

## Pruebas Manuales

Para cada fase de implementación, sigue estos pasos de prueba manual en el navegador mientras `npm run dev` está ejecutándose. Asegúrate de probar en diferentes tamaños de pantalla (usa las herramientas de desarrollo del navegador para simular breakpoints: sm <576px, md <768px, lg <992px, xl >=992px).

### Prueba de la Fase 1: Modificación de NavBar.vue

1. Navega a una página que incluya el sidebar (ej. /dashboard).
2. Verifica que el sidebar aparezca verticalmente a la izquierda, fijo.
3. Comprueba que el logo esté en la parte superior.
4. Verifica que los elementos de navegación estén en el medio.
5. Asegúrate de que el theme selector y user dropdown estén en la parte inferior.
6. Prueba los dropdowns: haz clic en selecciones de empresa/finca, theme switch, logout.
7. En móvil (breakpoint sm/md), verifica que se convierta en un drawer overlay.

**Resultados Esperados:**
- Sidebar visible y funcional en desktop.
- Drawer en móvil con toggle button.
- Todos los dropdowns funcionan correctamente.

### Prueba de la Fase 2: Modificación de App.vue

1. Navega a páginas con y sin sidebar (ej. /dashboard vs /login).
2. Verifica que el sidebar aparezca solo en páginas que no sean /login o /.
3. Comprueba que el contenido principal tenga padding-left adecuado para no solaparse con el sidebar.
4. Prueba transiciones suaves al cambiar de rutas.

**Resultados Esperados:**
- Layout correcto con sidebar en páginas apropiadas.
- Sin sidebar en /login y /.
- Contenido no solapado.

### Prueba de la Fase 3: Cambios en CSS Global

1. Cambia el tamaño de la ventana del navegador para simular diferentes breakpoints.
2. En lg y xl: Sidebar fijo visible.
3. En md y sm: Sidebar oculto, drawer disponible.
4. Verifica z-index y overlays en móvil.

**Resultados Esperados:**
- Responsive correcto en todos los breakpoints.
- Sin problemas de visualización.

### Prueba General

1. Navega por todas las rutas de la aplicación.
2. Prueba todas las funcionalidades del sidebar.
3. Verifica accesibilidad (navegación por teclado).

**Resultados Esperados:**
- Aplicación funcional sin errores.
- Experiencia de usuario mejorada.

## Checklist de Tareas
Este checklist se actualizará marcando con [x] las tareas completadas.

- [ ] Crear rama de desarrollo.
- [x] Modificar NavBar.vue para layout vertical.
- [x] Actualizar App.vue con nuevo layout.
- [x] Agregar CSS necesario.
- [x] Probar responsive y funcionalidad.
- [x] Merge después de QA.