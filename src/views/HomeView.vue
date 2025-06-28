<template>
  <div class="min-h-screen py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header de bienvenida -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold mb-4" style="color: var(--text-primary);">
          {{ $t('welcome') }} 🌱
        </h1>
        <p class="text-lg max-w-2xl mx-auto" style="color: var(--text-secondary);">
          {{ $t('home.description') || 'Usa la técnica Pomodoro para ser más productivo y haz crecer tu jardín virtual. Cada sesión completada te dará monedas para comprar nuevas plantas.' }}
        </p>
      </div>

      <!-- Grid principal -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Timer Pomodoro -->
        <div class="space-y-6">
          <PomodoroTimer />
          
          <!-- Estadísticas rápidas -->
          <div class="card p-6">
            <h3 class="text-lg font-semibold mb-4" style="color: var(--text-primary);">📊 {{ $t('home.stats') || 'Estadísticas de hoy' }}</h3>
            <div class="grid grid-cols-2 gap-4">
              <div class="text-center p-4 rounded-lg" style="background: var(--bg-accent);">
                <div class="text-2xl font-bold" style="color: var(--text-accent);">{{ sessionCount }}</div>
                <div class="text-sm" style="color: var(--text-secondary);">{{ $t('home.sessions') || 'Sesiones' }}</div>
              </div>
              <div class="text-center p-4 rounded-lg" style="background: var(--bg-accent);">
                <div class="text-2xl font-bold" style="color: var(--warning);">{{ authStore.currentUser?.coins || 0 }}</div>
                <div class="text-sm" style="color: var(--text-secondary);">{{ $t('shop.coins') }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Vista previa del jardín -->
        <div class="space-y-6">
          <div class="card p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold" style="color: var(--text-primary);">🌸 Tu Jardín</h3>
              <router-link
                to="/garden"
                class="text-sm font-medium hover:underline"
                style="color: var(--text-accent);"
              >
                Ver completo →
              </router-link>
            </div>
            
            <!-- Mini vista del jardín -->
            <div class="grid grid-cols-4 gap-2 mb-4">
              <div
                v-for="i in 16"
                :key="i"
                class="aspect-square bg-gradient-to-br from-amber-100 to-amber-200 rounded border border-amber-300 flex items-center justify-center"
              >
                <span class="text-lg">
                  {{ getRandomPlant(i) }}
                </span>
              </div>
            </div>
            
            <p class="text-sm text-gray-600 text-center" style="color: var(--text-secondary);">
              Completa sesiones de trabajo para ganar plantas y hacer crecer tu jardín
            </p>
          </div>

          <!-- Acciones rápidas -->
          <div class="card p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4" style="color: var(--text-primary);">⚡ Acciones rápidas</h3>
            <div class="space-y-3">
              <router-link
                to="/garden"
                class="block w-full btn-primary text-center"
              >
                🌱 Ir al Jardín
              </router-link>
              <router-link
                to="/shop"
                class="block w-full btn-secondary text-center"
              >
                🛍️ Visitar Tienda
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Consejos motivacionales -->
      <div class="mt-12">
        <div class="card p-6 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
          <div class="text-center">
            <h3 class="text-xl font-semibold mb-2">💡 Consejo del día</h3>
            <p class="text-primary-100">
              {{ dailyTip }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { usePomodoroStore } from '../stores/pomodoro'
import PomodoroTimer from '../components/PomodoroTimer.vue'

const authStore = useAuthStore()
const pomodoroStore = usePomodoroStore()

const { sessionCount } = pomodoroStore

const tips = [
  "La constancia es más importante que la intensidad. Pequeños pasos diarios llevan a grandes logros.",
  "Cada planta en tu jardín representa un momento de enfoque y productividad. ¡Sigue cultivando!",
  "Recuerda tomar descansos. Tu mente necesita tiempo para procesar y crear.",
  "Un jardín hermoso requiere paciencia. Tu productividad también.",
  "Celebra cada sesión completada. Cada pequeño triunfo cuenta."
]

const dailyTip = computed(() => {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
  return tips[dayOfYear % tips.length]
})

const gardenPreview = ['🌻', '🌹', '🌵', '🌸', '🌿', '🍀', '🌳', '🌱']

const getRandomPlant = (position: number) => {
  // Simular algunas plantas plantadas basado en la posición
  const hasPlant = (position + (authStore.currentUser?.totalSessions || 0)) % 4 === 0
  if (hasPlant) {
    return gardenPreview[position % gardenPreview.length]
  }
  return '➕'
}
</script>