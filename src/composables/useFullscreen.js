/**
 * Composable para manejar el modo fullscreen en componentes Vue.
 *
 * Proporciona estado reactivo para el estado de fullscreen, función para alternar fullscreen,
 * y maneja automáticamente los event listeners para cambios de fullscreen y tecla Escape.
 * Incluye estado de modo ('normal'/'fullscreen') y lógica de reorganización UI.
 *
 * @param {string} targetSelector - Selector CSS del elemento que se pondrá en fullscreen (default: '.dashboard-container')
 * @returns {Object} Objeto con propiedades:
 *   - mode: Ref<string> - Estado actual del modo ('normal'/'fullscreen')
 *   - isFullScreen: Ref<boolean> - Estado actual de fullscreen (para compatibilidad)
 *   - toggleFullScreen: Function - Función para alternar fullscreen
 *   - enterFullscreen: Function - Función para entrar en fullscreen
 *   - exitFullscreen: Function - Función para salir de fullscreen
 *   - handleTransition: Function - Función para manejar transiciones de UI
 *
 * @example
 * import { useFullscreen } from '../composables/useFullscreen.js'
 *
 * const { mode, toggleFullScreen, handleTransition } = useFullscreen()
 *
 * // En template: :class="{ 'fullscreen': mode === 'fullscreen' }"
 * // Botón: @click="toggleFullScreen"
 */
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useDynamicHeights } from './useDynamicHeights.js'

export function useFullscreen(targetSelector = '.dashboard-container') {
  const mode = ref('normal')
  const isFullScreen = ref(false)
  const { updateHeights } = useDynamicHeights()

  const enterFullscreen = async () => {
    const target = document.querySelector(targetSelector)
    if (!document.fullscreenElement) {
      try {
        await target.requestFullscreen()
        mode.value = 'fullscreen'
        await nextTick()
        handleTransition('enter')
      } catch (error) {
        console.error('Error entering fullscreen:', error)
      }
    }
  }

  const exitFullscreen = async () => {
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen()
        mode.value = 'normal'
        await nextTick()
        handleTransition('exit')
      } catch (error) {
        console.error('Error exiting fullscreen:', error)
      }
    }
  }

  const toggleFullScreen = async () => {
    if (mode.value === 'normal') {
      await enterFullscreen()
    } else {
      await exitFullscreen()
    }
  }

  const handleTransition = (action) => {
    // Centralizar lógica de reorganización UI
    if (action === 'enter') {
      // Lógica para reorganizar UI al entrar en fullscreen
      updateHeights()
      // Dispatch event para que componentes escuchen y se reorganicen
      window.dispatchEvent(new CustomEvent('fullscreenTransition', {
        detail: { action: 'enter', mode: mode.value }
      }))
    } else if (action === 'exit') {
      // Lógica para reorganizar UI al salir de fullscreen
      updateHeights()
      window.dispatchEvent(new CustomEvent('fullscreenTransition', {
        detail: { action: 'exit', mode: mode.value }
      }))
    }
  }

  const handleFullscreenChange = async () => {
    const isCurrentlyFullscreen = !!document.fullscreenElement
    isFullScreen.value = isCurrentlyFullscreen
    mode.value = isCurrentlyFullscreen ? 'fullscreen' : 'normal'
    if (isCurrentlyFullscreen) {
      handleTransition('enter')
    } else {
      handleTransition('exit')
    }
    // Agregar delay y disparar evento 'resize' para que ResizeObserver detecte el cambio de tamaño
    await new Promise(resolve => setTimeout(resolve, 100))
    window.dispatchEvent(new Event('resize'))
  }


  onMounted(() => {
    // Agregar listeners para compatibilidad con diferentes navegadores
    const fullscreenEvents = ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange']
    fullscreenEvents.forEach(event => {
      document.addEventListener(event, handleFullscreenChange)
    })
  })

  onUnmounted(() => {
    const fullscreenEvents = ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange']
    fullscreenEvents.forEach(event => {
      document.removeEventListener(event, handleFullscreenChange)
    })
  })

  return {
    mode,
    isFullScreen,
    toggleFullScreen,
    enterFullscreen,
    exitFullscreen,
    handleTransition
  }
}