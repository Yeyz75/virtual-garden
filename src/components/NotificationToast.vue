<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-50 space-y-3">
      <TransitionGroup name="notification" tag="div">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="notification-toast max-w-sm w-full shadow-lg rounded-lg pointer-events-auto overflow-hidden"
          :class="getNotificationClass(notification.type)"
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
import { computed } from 'vue'
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
    success: 'bg-green-50 border border-green-200 text-green-800',
    info: 'bg-blue-50 border border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border border-red-200 text-red-800'
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