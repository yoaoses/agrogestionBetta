import { onMounted, onUnmounted } from 'vue'

export function useAppLifecycle() {
  const handleVisibilityChange = () => {
    if (document.hidden) {
      // Suspension logic here if needed
    } else {
      // Recovery logic here if needed, e.g., refresh data, verify auth
    }
  }

  onMounted(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange)
  })

  onUnmounted(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  })
}