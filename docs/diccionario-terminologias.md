# Diccionario de Terminologías

Este documento define los términos clave utilizados en la aplicación Vue.js para gestión agrícola.

## Términos Principales

### Dashboard
Vista principal de la aplicación que presenta un resumen general de los datos temáticos. Incluye un carousel con slides para navegar entre diferentes temas y muestra slides temáticos con información organizada.

### Thematic Card (Slide Temático)
Componente visual que representa un tema específico de datos como un slide en el carousel. Cada slide incluye pestañas dinámicas (DynamicTabs), datos de participación (como farms o KPIs), y el último registro válido. Se utiliza para mostrar información estructurada de manera modular.

### NavBar (Barra de Navegación)
Componente de navegación principal que permite cambiar entre diferentes vistas de la aplicación, como Dashboard, Configuración, Opciones de Usuario, etc.

### StatsChart (Gráfico de Estadísticas)
Componente que renderiza gráficos estadísticos, probablemente utilizando bibliotecas como Chart.js, para visualizar datos numéricos de manera interactiva.

### DynamicTabs (Pestañas Dinámicas)
Componente que maneja pestañas configurables dentro de una Thematic Card, permitiendo la navegación entre diferentes subconjuntos de datos temáticos.

### Composables
Funciones reutilizables en Vue 3 Composition API que encapsulan lógica de negocio, como `useDashboard`, `useAuth`, etc., para manejar estado y operaciones asíncronas.

### Stores (Almacenes)
Módulos de estado global utilizando Pinia, como `auth.js`, `navigation.js`, que gestionan el estado de autenticación, navegación y otros datos persistentes.

### Views (Vistas)
Páginas principales de la aplicación, como `DashboardView.vue`, `EntitiesView.vue`, que representan rutas específicas en el enrutador.

### API
Interfaz de comunicación con el backend, definida en `api.js`, que maneja solicitudes HTTP para obtener datos de empresas, farms, y temas.

### TokenRenewalModal
Componente modal que se muestra cuando el token de autenticación está a punto de expirar, permitiendo al usuario renovarlo para mantener la sesión activa.