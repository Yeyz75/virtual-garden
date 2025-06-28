import { ref, watchEffect, computed } from 'vue'

const THEME_KEY = 'virtual-garden-theme'

// Detectar preferencia del sistema
const getSystemPreference = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

// Obtener tema guardado o usar preferencia del sistema
const getInitialTheme = (): boolean => {
  const saved = localStorage.getItem(THEME_KEY)
  if (saved !== null) {
    return saved === 'dark'
  }
  return getSystemPreference()
}

const isDark = ref(getInitialTheme())

// Función para alternar tema
const toggleTheme = () => {
  isDark.value = !isDark.value
}

// Función para establecer tema específico
const setTheme = (dark: boolean) => {
  isDark.value = dark
}

// Computed para obtener el nombre del tema actual
const currentTheme = computed(() => isDark.value ? 'dark' : 'light')

// Aplicar tema al DOM y guardar en localStorage
watchEffect(() => {
  const theme = isDark.value ? 'dark' : 'light'
  
  // Aplicar al HTML
  document.documentElement.setAttribute('data-theme', theme)
  
  // Guardar en localStorage
  localStorage.setItem(THEME_KEY, theme)
  
  // Actualizar meta theme-color para mejor UX en móviles
  const metaThemeColor = document.querySelector('meta[name="theme-color"]')
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', isDark.value ? '#0f172a' : '#fafafa')
  }
})

// Escuchar cambios en la preferencia del sistema
if (typeof window !== 'undefined') {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  
  mediaQuery.addEventListener('change', (e) => {
    // Solo actualizar si no hay preferencia guardada explícitamente
    const saved = localStorage.getItem(THEME_KEY)
    if (saved === null) {
      isDark.value = e.matches
    }
  })
}

export function useDarkMode() {
  return {
    isDark: readonly(isDark),
    currentTheme,
    toggleTheme,
    setTheme,
    getSystemPreference
  }
}

// Función auxiliar readonly
function readonly<T>(ref: { value: T }) {
  return computed(() => ref.value)
}
