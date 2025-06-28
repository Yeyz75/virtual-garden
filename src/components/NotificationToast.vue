<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-50 space-y-3">
      <TransitionGroup name="notification" tag="div">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="notification-toast max-w-sm w-full shadow-lg rounded-lg pointer-events-auto overflow-hidden"
          :class="getNotificationClass(notification.type)"
          :style="{ 
            background: 'var(--bg-secondary)', 
            borderColor: 'var(--border-primary)',
            color: 'var(--text-primary)'
          }"
        >
          <div class="p-4">
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <component :is="getIcon(notification.type)" class="h-6 w-6" />
              </div>
              <div class="ml-3 w-0 flex-1 pt-0.5">
                <p class="text-sm font-medium">{{ notification.title }}</p>
                <p class="mt-1 text-sm">{{ notification.message }}</p>
              </div>
              <div class="ml-4 flex-shrink-0 flex">
                <button
                  class="rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                  @click="removeNotification(notification.id)"
                >
                  <XMarkIcon class="h-5 w-5" />
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
    success: 'border-2 notification-success',
    info: 'border-2 notification-info', 
    warning: 'border-2 notification-warning',
    error: 'border-2 notification-error'
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
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 25px var(--shadow-medium);
}

.notification-success {
  border-color: var(--success);
  background: color-mix(in srgb, var(--success) 10%, var(--bg-secondary));
}

.notification-info {
  border-color: var(--info);
  background: color-mix(in srgb, var(--info) 10%, var(--bg-secondary));
}

.notification-warning {
  border-color: var(--warning);
  background: color-mix(in srgb, var(--warning) 10%, var(--bg-secondary));
}

.notification-error {
  border-color: var(--error);
  background: color-mix(in srgb, var(--error) 10%, var(--bg-secondary));
}

/* Fallback para navegadores que no soportan color-mix */
@supports not (color: color-mix(in srgb, red, blue)) {
  .notification-success {
    background: var(--bg-secondary);
  }
  
  .notification-info {
    background: var(--bg-secondary);
  }
  
  .notification-warning {
    background: var(--bg-secondary);
  }
  
  .notification-error {
    background: var(--bg-secondary);
  }
}
</style>