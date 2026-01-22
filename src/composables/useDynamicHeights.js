/**
 * Composable para calcular alturas dinámicas basadas en window.innerHeight.
 *
 * Estructura de alturas:
 * - windowHeight: Altura total de la ventana del navegador
 * - dashboardHeight: Altura disponible para el dashboard (windowHeight - navbar principal)
 * - contentHeight: Altura para el contenido (dashboardHeight - navbar interno del dashboard)
 * - sidebarHeight: Altura para sidebar (igual a dashboardHeight)
 * - fullscreenHeight: Altura para modo fullscreen (igual a windowHeight)
 *
 * Proporciona alturas reactivas para diferentes elementos de la UI, incluyendo
 * alturas normales y para modo fullscreen. Actualiza automáticamente en resize.
 *
 * @param {Object} offsets - Offsets para cálculos (nav: altura navbar principal, innerNav: altura navbar interno)
 * @returns {Object} Objeto con propiedades de altura reactivas
 *
 * @example
 * import { useDynamicHeights } from '../composables/useDynamicHeights.js'
 *
 * const { dashboardHeight, contentHeight, fullscreenHeight } = useDynamicHeights()
 */
import { ref, onMounted, onUnmounted, computed } from 'vue'

// Constantes base en vh
const BASE_HEADER_PADDING_VH = 2
const BASE_BODY_PADDING_VH = 1
const BASE_KPI_MIN_HEIGHT_VH = 10

export function useDynamicHeights(offsets = { nav: 60, innerNav: 56 }) {
  const windowHeight = ref(window.innerHeight)
  const dashboardHeight = ref(0)
  const contentHeight = ref(0)
  const sidebarHeight = ref(0)
  const fullscreenHeight = ref(0)

  const vhValue = (vh) => (vh / 100) * windowHeight.value

  const headerPadding = computed(() => vhValue(BASE_HEADER_PADDING_VH))

  const bodyPadding = computed(() => vhValue(BASE_BODY_PADDING_VH))

  const kpiMinHeight = computed(() => vhValue(BASE_KPI_MIN_HEIGHT_VH))

  const updateHeights = () => {
      const height = window.innerHeight
      windowHeight.value = height
      dashboardHeight.value = height - offsets.nav
      contentHeight.value = height - offsets.nav - offsets.innerNav -145
      sidebarHeight.value = dashboardHeight.value
      fullscreenHeight.value = height

    // Set CSS vars reactivas
    document.documentElement.style.setProperty('--dynamic-dashboard-height', `${dashboardHeight.value}px`)
    document.documentElement.style.setProperty('--dynamic-content-height', `${contentHeight.value}px`)
    document.documentElement.style.setProperty('--dynamic-sidebar-height', `${sidebarHeight.value}px`)
    document.documentElement.style.setProperty('--dynamic-fullscreen-height', `${fullscreenHeight.value}px`)
  }

  const throttledUpdate = throttle(updateHeights, 100)

  // Inicializar alturas inmediatamente
  updateHeights()

  onMounted(() => {
    updateHeights()
    window.addEventListener('resize', throttledUpdate)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', throttledUpdate)
  })

  return {
    windowHeight,
    dashboardHeight,
    contentHeight,
    sidebarHeight,
    fullscreenHeight,
    updateHeights,
    vhValue,
    headerPadding,
    bodyPadding,
    kpiMinHeight
  }
}

function throttle(func, limit) {
  let inThrottle
  return function() {
    const args = arguments
    const context = this
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}