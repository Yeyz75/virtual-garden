<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-50 space-y-3">
      <TransitionGroup name="notification" tag="div">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="notification-toast max-w-sm w-full shadow-lg rounded-xl pointer-events-auto overflow-hidden border"
          :class="getNotificationClass(notification.type)"
          :style="{ 
            background: 'var(--bg-secondary)', 
            borderColor: 'var(--border-primary)',
            color: 'var(--text-primary)'
          }"
        >
          <div class="p-4">
            <div class="flex items-start gap-3">
              <div class="flex-shrink-0 mt-0.5">
                <component :is="getIcon(notification.type)" class="h-5 w-5" :class="getIconColor(notification.type)" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold leading-tight mb-1">{{ notification.title }}</p>
                <p class="text-xs leading-relaxed opacity-90">{{ notification.message }}</p>
              </div>
              <div class="flex-shrink-0 ml-2">
                <button
                  class="rounded-lg p-1 hover:bg-black/5 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
                  :class="getCloseButtonClass(notification.type)"
                  @click="removeNotification(notification.id)"
                >
                  <XMarkIcon class="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import {
  CheckCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'
import { useNotificationStore } from '../stores/notifications'

const notificationStore = useNotificationStore()

const { notifications, removeNotification } = notificationStore

const getNotificationClass = (type: string) => {
  const classes = {
    success: 'border-l-4 border-l-green-500 notification-success',
    info: 'border-l-4 border-l-blue-500 notification-info', 
    warning: 'border-l-4 border-l-yellow-500 notification-warning',
    error: 'border-l-4 border-l-red-500 notification-error'
  }
  return classes[type as keyof typeof classes] || classes.info
}

const getIconColor = (type: string) => {
  const colors = {
    success: 'text-green-500',
    info: 'text-blue-500',
    warning: 'text-yellow-500',
    error: 'text-red-500'
  }
  return colors[type as keyof typeof colors] || colors.info
}

const getCloseButtonClass = (type: string) => {
  const classes = {
    success: 'focus:ring-green-500',
    info: 'focus:ring-blue-500',
    warning: 'focus:ring-yellow-500',
    error: 'focus:ring-red-500'
  }
  return classes[type as keyof typeof classes] || classes.info
}

const getIcon = (type: string) => {
  const icons = {
    success: CheckCircleIcon,
    info: InformationCircleIcon,
    warning: ExclamationTriangleIcon,
    error: XCircleIcon
  }
  return icons[type as keyof typeof icons] || InformationCircleIcon
}
</script>

<style scoped>
.notification-toast {
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: slideIn 0.3s ease-out;
}

.notification-success {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(16, 185, 129, 0.02) 100%);
}

.notification-info {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(59, 130, 246, 0.02) 100%);
}

.notification-warning {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(245, 158, 11, 0.02) 100%);
}

.notification-error {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(239, 68, 68, 0.02) 100%);
}

/* Fallback para navegadores que no soportan backdrop-filter */
@supports not (backdrop-filter: blur(12px)) {
  .notification-toast {
    background: var(--bg-secondary);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100%) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

/* Mejoras para modo oscuro */
[data-theme="dark"] .notification-toast {
  background: rgba(30, 41, 59, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

[data-theme="dark"] .notification-success {
  background: linear-gradient(135deg, rgba(52, 211, 153, 0.1) 0%, rgba(52, 211, 153, 0.05) 100%);
}

[data-theme="dark"] .notification-info {
  background: linear-gradient(135deg, rgba(96, 165, 250, 0.1) 0%, rgba(96, 165, 250, 0.05) 100%);
}

[data-theme="dark"] .notification-warning {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(251, 191, 36, 0.05) 100%);
}

[data-theme="dark"] .notification-error {
  background: linear-gradient(135deg, rgba(248, 113, 113, 0.1) 0%, rgba(248, 113, 113, 0.05) 100%);
}
</style>