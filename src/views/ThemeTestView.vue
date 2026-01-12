<template>
  <div class="p-0 bg-body text-body" style="height: 100vh; width: 100vw;">
    <div class="container-fluid p-4">
      <h1 class="display-4 fw-bold mb-4 text-center">Framework Bootstrap - Muestra Completa</h1>
        <div class="row">
          <div class="col-md-6">
            <div class="card mb-4 bg-secondary text-body">
              <div class="card-body">
                <h5 class="card-title">Pegar Paleta JSON</h5>
                <textarea
                  v-model="paletteJson"
                  class="form-control"
                  rows="10"
                  placeholder='Ejemplo: {"primary": "#4CAF50", "secondary": "#FFC107", "accent": "#FF5722", "background": "#FFFFFF", "text": "#000000"}'
                ></textarea>
                <button @click="applyPalette" class="btn btn-primary mt-3">
                  Aplicar Tema
                </button>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card mb-4 bg-secondary text-body">
              <div class="card-body">
                <h5 class="card-title">Elementos de Muestra</h5>
                <p class="mb-3">Este es un párrafo de texto de muestra.</p>
                <button class="btn btn-primary me-2">Botón Primario</button>
                <button class="btn btn-secondary">Botón Secundario</button>
                <div class="mt-3 p-3 border border-secondary rounded bg-secondary">
                  <h6>Card de Muestra</h6>
                  <p>Contenido de la card.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sección de Botones Variados -->
        <h2 class="mt-5 mb-4 text-body">Botones Variados</h2>
        <div class="row">
          <div class="col-md-6">
            <button class="btn btn-primary me-2 mb-2">Botón Primario</button>
            <button class="btn btn-secondary me-2 mb-2">Botón Secundario</button>
            <button class="btn btn-info me-2 mb-2">Botón Acento</button>
            <button class="btn btn-outline-secondary me-2 mb-2">Botón Outline</button>
          </div>
          <div class="col-md-6">
            <button class="btn btn-primary btn-lg me-2 mb-2">Grande</button>
            <button class="btn btn-secondary btn-sm me-2 mb-2">Pequeño</button>
            <button class="btn btn-info me-2 mb-2" disabled>Deshabilitado</button>
          </div>
        </div>

        <!-- Sección de Cards Variadas -->
        <h2 class="mt-5 mb-4 text-body">Cards Variadas</h2>
        <div class="row">
          <div class="col-md-4 mb-4">
            <div class="card h-100 bg-secondary text-body">
              <div class="card-header bg-primary text-body">Header Primario</div>
              <div class="card-body">
                <h5 class="card-title">Card con Header</h5>
                <p class="card-text">Esta es una card de ejemplo con header coloreado.</p>
                <a href="#" class="btn btn-info">Ir a algún lugar</a>
              </div>
            </div>
          </div>
          <div class="col-md-4 mb-4">
            <div class="card h-100 bg-secondary text-body border border-secondary">
              <div class="card-body">
                <h5 class="card-title">Card con Borde</h5>
                <p class="card-text">Card con borde secundario para resaltar.</p>
                <button class="btn btn-secondary">Acción</button>
              </div>
            </div>
          </div>
          <div class="col-md-4 mb-4">
            <div class="card h-100 bg-primary text-body">
              <div class="card-body">
                <h5 class="card-title">Card Simple</h5>
                <p class="card-text">Card básica con fondo primario.</p>
                <p class="text-muted">Texto secundario</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Sección de Texto y Fondos -->
        <h2 class="mt-5 mb-4 text-body">Texto y Fondos</h2>
        <div class="row">
          <div class="col-md-6">
            <div class="p-3 mb-3 bg-secondary text-body">
              <h3 class="text-primary">Título Primario</h3>
              <p>Este es un párrafo normal.</p>
              <p class="text-secondary">Texto secundario.</p>
              <p class="text-info">Texto de acento.</p>
              <a href="#" class="text-primary">Enlace primario</a>
            </div>
          </div>
          <div class="col-md-6">
            <div class="p-3 mb-3 bg-primary text-body">
              <h3>Fondo Primario</h3>
              <p>Texto sobre fondo primario.</p>
              <button class="btn btn-outline-primary">Botón Invertido</button>
            </div>
            <div class="p-3 bg-secondary text-body">
              <h4>Fondo Secundario</h4>
              <p>Texto sobre fondo secundario.</p>
            </div>
          </div>
        </div>

        <!-- Sección de Formularios -->
        <h2 class="mt-5 mb-4 text-body">Elementos de Formulario</h2>
        <div class="row">
          <div class="col-md-6">
            <div class="mb-3">
              <label for="input1" class="form-label text-body">Input Básico</label>
              <input type="text" class="form-control" id="input1" placeholder="Texto de ejemplo">
            </div>
            <div class="mb-3">
              <label for="select1" class="form-label text-body">Select</label>
              <select class="form-select" id="select1">
                <option selected>Opción 1</option>
                <option>Opción 2</option>
                <option>Opción 3</option>
              </select>
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-check mb-3">
              <input class="form-check-input" type="checkbox" id="check1" style="accent-color: var(--bs-primary);">
              <label class="form-check-label text-body" for="check1">Checkbox</label>
            </div>
            <div class="form-check mb-3">
              <input class="form-check-input" type="radio" name="radio" id="radio1" style="accent-color: var(--bs-secondary);">
              <label class="form-check-label text-body" for="radio1">Radio 1</label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="radio" name="radio" id="radio2" style="accent-color: var(--bs-secondary);">
              <label class="form-check-label text-body" for="radio2">Radio 2</label>
            </div>
          </div>
        </div>

        <!-- Sección de Colores Bootstrap -->
        <h2 class="mt-5 mb-4 text-center text-body">Colores Bootstrap</h2>
        <div class="row text-center">
          <div class="col-12">
            <button class="btn btn-outline-primary btn-sm me-2 mb-2">Primary</button>
            <button class="btn btn-outline-secondary btn-sm me-2 mb-2">Secondary</button>
            <button class="btn btn-outline-success btn-sm me-2 mb-2">Success</button>
            <button class="btn btn-outline-danger btn-sm me-2 mb-2">Danger</button>
            <button class="btn btn-outline-warning btn-sm me-2 mb-2">Warning</button>
            <button class="btn btn-outline-info btn-sm me-2 mb-2">Info</button>
            <button class="btn btn-outline-light btn-sm me-2 mb-2">Light</button>
            <button class="btn btn-outline-dark btn-sm me-2 mb-2">Dark</button>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const paletteJson = ref('')

const applyPalette = () => {
  try {
    const palette = JSON.parse(paletteJson.value)
    const root = document.documentElement
    const mapping = {
      primary: '--bs-primary',
      secondary: '--bs-secondary',
      success: '--bs-success',
      danger: '--bs-danger',
      warning: '--bs-warning',
      info: '--bs-info',
      light: '--bs-light',
      dark: '--bs-dark',
      background: '--bs-body-bg',
      text: '--bs-body-color',
      accent: '--bs-info'
    }
    Object.keys(palette).forEach(key => {
      if (mapping[key]) {
        root.style.setProperty(mapping[key], palette[key])
      }
    })
    alert('Tema aplicado exitosamente!')
  } catch (error) {
    alert('Error al parsear JSON: ' + error.message)
  }
}
</script>