<template>
  <div id="app" class="min-h-screen transition-colors duration-300"
       :style="{ background: 'var(--bg-primary)' }">
    <AppHeader v-if="!authStore.loading && authStore.isAuthenticated" />
    
    <main class="flex-1">
      <router-view />
    </main>

    <NotificationToast />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import { usePomodoroStore } from './stores/pomodoro'
import { useDarkMode } from './composables/useDarkMode'
import AppHeader from './components/AppHeader.vue'
import NotificationToast from './components/NotificationToast.vue'

const authStore = useAuthStore()
const pomodoroStore = usePomodoroStore()

// Inicializar modo oscuro
useDarkMode()

onMounted(() => {
  authStore.initAuth()
  pomodoroStore.requestNotificationPermission()
})
</script>

<style>
#app {
  font-family: Inter, system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--text-primary);
}

/* Asegurar transiciones suaves */
* {
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
}
</style>