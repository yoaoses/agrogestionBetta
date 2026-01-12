<template>
  <div class="min-vh-100 w-100 d-flex flex-column" :style="{ backgroundColor: 'var(--bg-primary)' }">
    <!-- Navbar o header aquí si tienes -->

    <main class="flex-grow-1 d-flex align-items-center justify-content-center p-3">
      <!-- Tu contenido real aquí, ej: card o dashboard -->
      <div class="container">
        <h1 class="display-1 fw-bold text-center" :style="{ color: 'var(--text-primary)' }">
          Bienvenido a CampoData
        </h1>
        <!-- Resto del dashboard -->
      </div>
    </main>
  </div>
</template>