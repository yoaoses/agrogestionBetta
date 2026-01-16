# Ficha Técnica de Funciones/Scripts/Views Principales

Esta ficha técnica documenta las funciones, scripts y vistas principales de la aplicación Vue.js de gestión agrícola, explicando su propósito, entradas, salidas, implementación y uso.

## 1. App.vue (Componente Raíz)

- **Qué hace**: Gestiona el layout principal de la aplicación, incluyendo la navegación, header y enrutamiento dinámico.
- **Qué recibe**: Parámetros de ruta (route.path), estado de autenticación (authStore.isAuth), y referencias a elementos DOM.
- **Qué entrega**: Estructura HTML completa con Header, NavBar y router-view, aplicando estilos condicionales basados en la ruta.
- **Cómo lo hace**: Utiliza Vue Router para detectar cambios de ruta, Pinia stores (themeStore, authStore) para estado global, y funciones como updatePadding() para ajustar el layout. Verifica tokens de autenticación en onMounted y aplica temas iniciales.
- **Quién lo usa**: Todos los usuarios de la aplicación como punto de entrada principal.

## 2. DashboardView.vue (Vista de Dashboard Temático)

- **Qué hace**: Muestra un dashboard con tarjetas temáticas, navegación interna y carga progresiva de contenido.
- **Qué recibe**: Parámetros de ruta (companyId, farmId), datos de empresas y granjas desde composables.
- **Qué entrega**: Interfaz de dashboard con navbar sticky, slides ThematicCard, indicadores de carga/error, y navegación por carousel con slides.
- **Cómo lo hace**: Usa IntersectionObserver para carga progresiva y carousel, composables useDashboard y useDashboardService para datos, y animaciones CSS para transiciones. Inicializa observadores en onMounted y limpia en onUnmounted.
- **Quién lo usa**: Usuarios autenticados que acceden a dashboards de empresas o granjas específicas.

## 3. useDashboardService.js (Servicio de Dashboard)

- **Qué hace**: Proporciona datos temáticos para dashboards, manejando caché y conversión de datos API.
- **Qué recibe**: entityId (ID de empresa o granja), type ('farm' o 'company').
- **Qué entrega**: Array de objetos temáticos con tabs, chartData, participation y lastRecord.
- **Cómo lo hace**: Mapea temas a funciones API, convierte datos crudos a formato ChartData, simula datos cuando falla la API, implementa caché con TTL de 5 minutos. Usa async/await para llamadas API y genera datos simulados aleatorios.
- **Quién lo usa**: DashboardView.vue y otros componentes que necesitan datos temáticos.

## 4. api.js (Módulo de API)

- **Qué hace**: Centraliza todas las llamadas HTTP al backend, manejando autenticación, renovación de tokens y endpoints.
- **Qué recibe**: Parámetros específicos por función (ej. farmId, credentials), y token de autenticación global.
- **Qué entrega**: Promesas que resuelven a respuestas JSON del servidor.
- **Cómo lo hace**: Usa Axios con interceptores para manejar 401 (mostrando TokenRenewalModal para renovación de token), headers de autorización automáticos, construye URLs dinámicas con params de Axios, maneja diferentes versiones de API (V1/V2). Funciones como setAuthToken actualizan el token global. Interceptores evitan loops infinitos en renovación de tokens activando el modal de renovación.
- **Quién lo usa**: Todos los composables y componentes que necesitan datos del backend (useDashboardService, stores, etc.).

## 5. auth.js (Store de Autenticación)

- **Qué hace**: Gestiona el estado de autenticación del usuario, incluyendo login, logout y verificación de tokens.
- **Qué recibe**: Credenciales de login (email, password), tokens JWT.
- **Qué entrega**: Estado reactivo (isAuth, user, token), y acciones para login/logout.
- **Cómo lo hace**: Usa Pinia para estado global, localStorage para persistencia, y llamadas a api.login(). Verifica tokens automáticamente y redirige en caso de expiración.
- **Quién lo usa**: App.vue, componentes de login, y cualquier parte que requiera autenticación.

## 6. navigation.js (Store de Navegación)

- **Qué hace**: Maneja el estado del sidebar y navegación lateral.
- **Qué recibe**: Acciones de toggle y configuración de navegación.
- **Qué entrega**: Estado del sidebar (isOpen), y métodos para controlarlo.
- **Cómo lo hace**: Usa Pinia para estado reactivo, probablemente con localStorage para persistir preferencias.
- **Quién lo usa**: NavBar.vue y otros componentes de navegación.

## 7. NavBar.vue (Barra de Navegación)

- **Qué hace**: Proporciona navegación lateral con menú desplegable y enlaces a vistas.
- **Qué recibe**: Estado de navegación desde stores, rutas activas.
- **Qué entrega**: Sidebar con enlaces, dropdowns y indicadores de estado.
- **Cómo lo hace**: Usa Vue Router para navegación, Pinia stores para estado, y CSS para animaciones de apertura/cierre.
- **Quién lo usa**: App.vue como componente principal del layout.

## 8. ThematicCard.vue (Slide Temático)

- **Qué hace**: Muestra datos temáticos en formato de slide con gráficos y tabs.
- **Qué recibe**: themeData (objeto con theme, tabs, participation), index para identificación.
- **Qué entrega**: Tarjeta interactiva con DynamicTabs, StatsChart y datos de participación.
- **Cómo lo hace**: Renderiza condicionalmente basado en datos, usa componentes hijos para gráficos y tabs, aplica estilos responsivos.
- **Quién lo usa**: DashboardView.vue para cada slide en el carousel.

## 9. useDashboard.js (Composable de Dashboard)

- **Qué hace**: Gestiona datos de empresas y granjas para selección en dashboards.
- **Qué recibe**: IDs de empresa y granja desde rutas.
- **Qué entrega**: Datos reactivos de companies, farms, y funciones para selección.
- **Cómo lo hace**: Carga datos iniciales desde API, filtra granjas por empresa, usa computed para selecciones actuales.
- **Quién lo usa**: DashboardView.vue y vistas relacionadas con selección de entidades.

## 10. StatsChart.vue (Componente de Gráficos)

- **Qué hace**: Renderiza gráficos estadísticos usando Chart.js o similar.
- **Qué recibe**: chartData (labels, values), opciones de configuración.
- **Qué entrega**: Canvas SVG/PNG con gráfico interactivo.
- **Cómo lo hace**: Inicializa librería de gráficos en onMounted, actualiza datos reactivamente, maneja eventos de interacción.
- **Quién lo usa**: ThematicCard.vue y otros componentes que muestran datos visuales.

## 11. DynamicTabs.vue (Pestañas Dinámicas)

- **Qué hace**: Crea interfaz de pestañas para contenido temático.
- **Qué recibe**: Array de tabs con title y contenido.
- **Qué entrega**: Navegación por pestañas con contenido dinámico.
- **Cómo lo hace**: Usa v-for para renderizar tabs, estado reactivo para tab activa, transiciones CSS.
- **Quién lo usa**: ThematicCard.vue para mostrar diferentes vistas de datos temáticos.

## 12. LoginModal.vue / CampoDataLogin.vue (Vistas de Login)

- **Qué hace**: Maneja autenticación de usuarios con formularios de login.
- **Qué recibe**: Credenciales de usuario, estado de error.
- **Qué entrega**: Tokens de autenticación y redirección post-login.
- **Cómo lo hace**: Valida formularios, llama a api.login(), actualiza authStore, maneja errores.
- **Quién lo usa**: Usuarios no autenticados al acceder a rutas protegidas.

## 13. TokenRenewalModal.vue (Modal de Renovación de Token)

- **Qué hace**: Muestra un modal para renovar la sesión cuando el token expira, permitiendo al usuario reautenticarse sin perder el estado de la aplicación.
- **Qué recibe**: Estado de renovación desde authStore (showTokenRenewalModal, isRenewingToken), credenciales de usuario.
- **Qué entrega**: Credenciales renovadas al authStore, cierre del modal en caso de éxito o error.
- **Cómo lo hace**: Usa Bootstrap modal con backdrop estático, valida formularios, llama a authStore.login(), muestra toasts para errores, detecta Caps Lock, resetea flags al cerrar. Se activa automáticamente por interceptores de api.js en respuestas 401.
- **Quién lo usa**: Usuarios cuando su sesión expira durante el uso de la aplicación.

## 14. DateRangePicker.vue (Selector de Rango de Fechas)

- **Qué hace**: Proporciona una interfaz para seleccionar rangos de fechas con presets predefinidos y validación.
- **Qué recibe**: Estado de rango de fechas desde dateRangeStore, eventos de cambio.
- **Qué entrega**: Rango de fechas seleccionado, eventos 'dateRangeChanged' y 'execute'.
- **Cómo lo hace**: Usa inputs de tipo date, botones de presets (3 meses, 6 meses, 1-3 años), valida rangos largos con mensajes de advertencia, sincroniza con dateRangeStore, calcula diferencias en años para alertas.
- **Quién lo usa**: Componentes que requieren selección de periodos temporales, como dashboards y estadísticas.