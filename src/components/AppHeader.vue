<template>
  <header class="bg-white shadow-sm border-b border-gray-200 dark:bg-slate-800 dark:border-slate-700"
          style="background: var(--bg-secondary); border-color: var(--border-primary);">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo y navegación -->
        <div class="flex items-center space-x-8">
          <router-link to="/" class="flex items-center space-x-2">
            <span class="text-2xl">🌱</span>
            <span class="text-xl font-bold" style="color: var(--text-primary);">
              Jardín Virtual
            </span>
          </router-link>

          <nav class="hidden md:flex space-x-6">
            <router-link
              to="/"
              class="nav-link"
              :class="{ 'text-primary-600': $route.name === 'Home' }"
            >
              Temporizador
            </router-link>
            <router-link
              to="/garden"
              class="nav-link"
              :class="{ 'text-primary-600': $route.name === 'Garden' }"
            >
              Jardín
            </router-link>
            <router-link
              to="/shop"
              class="nav-link"
              :class="{ 'text-primary-600': $route.name === 'Shop' }"
            >
              Tienda
            </router-link>
          </nav>
        </div>

        <!-- Info del usuario -->
        <div class="flex items-center space-x-4">
          <div v-if="authStore.currentUser" class="flex items-center space-x-4">
            <div class="hidden sm:flex items-center space-x-2 bg-accent-50 px-3 py-1 rounded-full">
              <span class="text-lg">🪙</span>
              <span class="font-medium text-accent-700">
                {{ authStore.currentUser.coins }}
              </span>
            </div>

            <!-- Botón modo oscuro -->
            <button
              @click="toggleTheme"
              class="theme-toggle ml-2 relative overflow-hidden"
              title="Cambiar tema"
            >
              <div class="flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300"
                   :class="isDark ? 'bg-gray-800 text-yellow-300' : 'bg-yellow-100 text-gray-800'">
                <span v-if="isDark" class="text-lg">🌙</span>
                <span v-else class="text-lg">☀️</span>
                <span class="text-sm font-medium hidden sm:inline">
                  {{ isDark ? 'Claro' : 'Oscuro' }}
                </span>
              </div>
            </button>
            
            <div class="relative">
              <button
                @click.stop="showUserMenu = !showUserMenu"
                class="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div class="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                  <span class="text-white font-medium text-sm">
                    {{ getUserInitials() }}
                  </span>
                </div>
                <span class="text-gray-500">▼</span>
              </button>

              <!-- Dropdown menu -->
              <div
                v-if="showUserMenu"
                class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                @click.stop
              >
                <router-link
                  to="/settings"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Configuración
                </router-link>
                <button
                  @click="handleLogout"
                  class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Navegación móvil -->
    <div class="md:hidden border-t" style="background: var(--bg-tertiary); border-color: var(--border-primary);">
      <nav class="flex justify-around py-2">
        <router-link
          to="/"
          class="flex flex-col items-center py-2 px-3 text-xs font-medium"
          :class="{ 'text-primary-600': $route.name === 'Home' }"
        >
          <span class="text-lg mb-1">⏰</span>
          Temporizador
        </router-link>
        <router-link
          to="/garden"
          class="flex flex-col items-center py-2 px-3 text-xs font-medium"
          :class="{ 'text-primary-600': $route.name === 'Garden' }"
        >
          <span class="text-lg mb-1">🌱</span>
          Jardín
        </router-link>
        <router-link
          to="/shop"
          class="flex flex-col items-center py-2 px-3 text-xs font-medium"
          :class="{ 'text-primary-600': $route.name === 'Shop' }"
        >
          <span class="text-lg mb-1">🛍️</span>
          Tienda
        </router-link>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useDarkMode } from '@/composables/useDarkMode'

const router = useRouter()
const authStore = useAuthStore()
const { isDark, toggleTheme } = useDarkMode()

const showUserMenu = ref(false)

const getUserInitials = () => {
  if (!authStore.currentUser) return 'U'
  const name = authStore.currentUser.displayName || authStore.currentUser.email
  return name.charAt(0).toUpperCase()
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
  showUserMenu.value = false
}

const closeUserMenu = () => {
  if (showUserMenu.value) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', closeUserMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', closeUserMenu)
})
</script>

<style scoped>
.nav-link {
  color: var(--text-secondary);
  font-weight: 500;
  transition: color 0.2s ease;
}

.nav-link:hover {
  color: var(--text-primary);
}

.nav-link.router-link-active {
  color: var(--text-accent);
}

/* Animaciones para el toggle de tema */
.icon-enter-active,
.icon-leave-active {
  transition: all 0.3s ease;
}

.icon-enter-from {
  opacity: 0;
  transform: rotate(180deg) scale(0.5);
}

.icon-leave-to {
  opacity: 0;
  transform: rotate(-180deg) scale(0.5);
}

.theme-toggle {
  background: none;
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.theme-toggle:hover {
  transform: scale(1.05);
}

.theme-toggle:active {
  transform: scale(0.95);
}

/* Mejoras para modo oscuro */
[data-theme="dark"] .nav-link {
  color: var(--text-secondary);
}

[data-theme="dark"] .nav-link:hover {
  color: var(--text-primary);
}

[data-theme="dark"] .nav-link.router-link-active {
  color: var(--text-accent);
}
</style>