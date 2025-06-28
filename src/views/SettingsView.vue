<template>
  <div class="min-h-screen py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold mb-4" style="color: var(--text-primary);">
          ⚙️ {{ $t('settings.title') }}
        </h1>
        <p class="text-lg" style="color: var(--text-secondary);">
          {{ $t('settings.description') || 'Personaliza tu experiencia de productividad' }}
        </p>
      </div>

      <div class="space-y-8">
        <!-- Configuración del Pomodoro -->
        <div class="card p-6">
          <h2 class="text-xl font-semibold mb-6" style="color: var(--text-primary);">🍅 {{ $t('pomodoro.title') }}</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium mb-2" style="color: var(--text-primary);">
                {{ $t('settings.workDuration') || 'Duración del trabajo (minutos)' }}
              </label>
              <input
                v-model.number="localSettings.workDuration"
                type="number"
                min="1"
                max="60"
                class="input-field"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-2" style="color: var(--text-primary);">
                {{ $t('settings.shortBreakDuration') || 'Descanso corto (minutos)' }}
              </label>
              <input
                v-model.number="localSettings.shortBreakDuration"
                type="number"
                min="1"
                max="30"
                class="input-field"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-2" style="color: var(--text-primary);">
                {{ $t('settings.longBreakDuration') || 'Descanso largo (minutos)' }}
              </label>
              <input
                v-model.number="localSettings.longBreakDuration"
                type="number"
                min="5"
                max="60"
                class="input-field"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-2" style="color: var(--text-primary);">
                {{ $t('settings.longBreakInterval') || 'Intervalo para descanso largo' }}
              </label>
              <input
                v-model.number="localSettings.longBreakInterval"
                type="number"
                min="2"
                max="10"
                class="input-field"
              />
            </div>
          </div>

          <div class="mt-6 space-y-4">
            <div class="flex items-center">
              <input
                id="autoStartBreaks"
                v-model="localSettings.autoStartBreaks"
                type="checkbox"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label for="autoStartBreaks" class="ml-2 block text-sm text-gray-900" style="color: var(--text-secondary);">
                {{ $t('settings.autoStartBreaks') || 'Iniciar descansos automáticamente' }}
              </label>
            </div>

            <div class="flex items-center">
              <input
                id="autoStartWork"
                v-model="localSettings.autoStartWork"
                type="checkbox"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label for="autoStartWork" class="ml-2 block text-sm text-gray-900" style="color: var(--text-secondary);">
                {{ $t('settings.autoStartWork') || 'Iniciar trabajo automáticamente después del descanso' }}
              </label>
            </div>

            <div class="flex items-center">
              <input
                id="soundEnabled"
                v-model="localSettings.soundEnabled"
                type="checkbox"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label for="soundEnabled" class="ml-2 block text-sm text-gray-900" style="color: var(--text-secondary);">
                {{ $t('settings.soundEnabled') || 'Habilitar sonidos' }}
              </label>
            </div>

            <div class="flex items-center">
              <input
                id="notificationsEnabled"
                v-model="localSettings.notificationsEnabled"
                type="checkbox"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label for="notificationsEnabled" class="ml-2 block text-sm text-gray-900" style="color: var(--text-secondary);">
                {{ $t('settings.notificationsEnabled') || 'Habilitar notificaciones del navegador' }}
              </label>
            </div>
          </div>

          <div class="mt-6">
            <button
              @click="saveSettings"
              class="btn-primary mr-3" 
            >
              {{ $t('settings.saveChanges') || 'Guardar cambios' }}
            </button>
            <button
              @click="resetToDefaults"
              class="btn-secondary"
            >
              {{ $t('settings.restoreDefaults') || 'Restaurar valores predeterminados' }}
            </button>
          </div>
        </div>

        <!-- Información de la cuenta -->
        <div class="card p-6">
          <h2 class="text-xl font-semibold mb-6" style="color: var(--text-primary);">👤 {{ $t('account.title') }}</h2>
          
          <div v-if="authStore.currentUser" class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-1" style="color: var(--text-primary);">
                {{ $t('account.email') || 'Correo electrónico' }}
              </label>
              <p style="color: var(--text-primary);">{{ authStore.currentUser.email }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium mb-1" style="color: var(--text-primary);">
                {{ $t('account.name') || 'Nombre' }}
              </label>
              <p style="color: var(--text-primary);">
                {{ authStore.currentUser.displayName || 'No especificado' }}
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium mb-1" style="color: var(--text-primary);">
                {{ $t('account.coins') || 'Monedas actuales' }}
              </label>
              <p class="text-2xl font-bold" style="color: var(--warning);">
                🪙 {{ authStore.currentUser.coins }}
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium mb-1" style="color: var(--text-primary);">
                {{ $t('account.totalSessions') || 'Total de sesiones completadas' }}
              </label>
              <p class="text-lg font-semibold" style="color: var(--text-accent);">
                {{ authStore.currentUser.totalSessions }}
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium mb-1" style="color: var(--text-primary);">
                {{ $t('account.currentStreak') || 'Racha actual' }}
              </label>
              <p class="text-lg font-semibold" style="color: var(--warning);">
                🔥 {{ authStore.currentUser.currentStreak }} días
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium mb-1" style="color: var(--text-primary);">
                {{ $t('account.memberSince') || 'Miembro desde' }}
              </label>
              <p style="color: var(--text-secondary);">
                {{ formatDate(authStore.currentUser.createdAt) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Notificaciones -->
        <div class="card p-6">
          <h2 class="text-xl font-semibold mb-6" style="color: var(--text-primary);">🔔 {{ $t('notifications.title') }}</h2>
          
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-medium" style="color: var(--text-primary);">
                  {{ $t('notifications.browser') || 'Notificaciones del navegador' }}
                </h3>
                <p class="text-sm" style="color: var(--text-secondary);">
                  {{ $t('notifications.sessionAlerts') || 'Recibe alertas cuando terminen las sesiones' }}
                </p>
              </div>
              <div class="ml-4">
                <button
                  @click="requestNotificationPermission"
                  :disabled="notificationPermission === 'granted'"
                  class="btn-secondary text-sm py-2 px-4"
                  :class="{
                    'opacity-50 cursor-not-allowed': notificationPermission === 'granted'
                  }"
                >
                  {{ notificationPermission === 'granted' ? $t('notifications.enabled') : $t('notifications.enable') }}
                </button>
              </div>
            </div>

            <div class="text-sm">
              <p v-if="notificationPermission === 'granted'" style="color: var(--success);">
                ✅ {{ $t('notifications.granted') }}
              </p>
              <p v-else-if="notificationPermission === 'denied'" style="color: var(--error);">
                ❌ {{ $t('notifications.blocked') }}
              </p>
              <p v-else style="color: var(--warning);">
                ⚠️ {{ $t('notifications.clickEnable') }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { usePomodoroStore } from '../stores/pomodoro'
import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notifications'

const pomodoroStore = usePomodoroStore()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const notificationPermission = ref(Notification.permission)

// Configuración local para editar
const localSettings = reactive({
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartWork: false,
  soundEnabled: true,
  notificationsEnabled: true
})

const loadCurrentSettings = () => {
  const settings = pomodoroStore.settings
  localSettings.workDuration = Math.floor(settings.workDuration / 60)
  localSettings.shortBreakDuration = Math.floor(settings.shortBreakDuration / 60)
  localSettings.longBreakDuration = Math.floor(settings.longBreakDuration / 60)
  localSettings.longBreakInterval = settings.longBreakInterval
  localSettings.autoStartBreaks = settings.autoStartBreaks
  localSettings.autoStartWork = settings.autoStartWork
  localSettings.soundEnabled = settings.soundEnabled
  localSettings.notificationsEnabled = settings.notificationsEnabled
}

const saveSettings = () => {
  pomodoroStore.updateSettings({
    workDuration: localSettings.workDuration * 60,
    shortBreakDuration: localSettings.shortBreakDuration * 60,
    longBreakDuration: localSettings.longBreakDuration * 60,
    longBreakInterval: localSettings.longBreakInterval,
    autoStartBreaks: localSettings.autoStartBreaks,
    autoStartWork: localSettings.autoStartWork,
    soundEnabled: localSettings.soundEnabled,
    notificationsEnabled: localSettings.notificationsEnabled
  })

  notificationStore.addNotification({
    title: 'Configuración guardada',
    message: 'Tus preferencias han sido actualizadas',
    type: 'success'
  })
}

const resetToDefaults = () => {
  localSettings.workDuration = 25
  localSettings.shortBreakDuration = 5
  localSettings.longBreakDuration = 15
  localSettings.longBreakInterval = 4
  localSettings.autoStartBreaks = false
  localSettings.autoStartWork = false
  localSettings.soundEnabled = true
  localSettings.notificationsEnabled = true

  notificationStore.addNotification({
    title: 'Configuración restaurada',
    message: 'Se han restaurado los valores predeterminados',
    type: 'info'
  })
}

const requestNotificationPermission = async () => {
  const granted = await pomodoroStore.requestNotificationPermission()
  notificationPermission.value = Notification.permission
  
  if (granted) {
    notificationStore.addNotification({
      title: 'Notificaciones habilitadas',
      message: 'Ahora recibirás alertas cuando terminen las sesiones',
      type: 'success'
    })
  } else {
    notificationStore.addNotification({
      title: 'Notificaciones bloqueadas',
      message: 'Habilita las notificaciones en la configuración del navegador',
      type: 'warning'
    })
  }
}

const formatDate = (date: any) => {
  // Firestore Timestamp
  if (date && typeof date === 'object' && typeof date.toDate === 'function') {
    date = date.toDate();
  }
  // String
  if (typeof date === 'string') {
    const parsed = new Date(date);
    if (!isNaN(parsed.getTime())) {
      date = parsed;
    }
  }
  // Date
  if (date instanceof Date && !isNaN(date.getTime())) {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  return 'Fecha desconocida';
}

onMounted(() => {
  loadCurrentSettings()
})
</script>