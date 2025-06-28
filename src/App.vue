<template>
  <div id="app" class="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
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
import AppHeader from './components/AppHeader.vue'
import NotificationToast from './components/NotificationToast.vue'

const authStore = useAuthStore()
const pomodoroStore = usePomodoroStore()

onMounted(() => {
  authStore.initAuth()
  pomodoroStore.requestNotificationPermission()
})
</script>

<style>
#app {
  font-family: 'Inter', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>