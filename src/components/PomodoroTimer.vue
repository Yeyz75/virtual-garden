<template>
  <div class="card p-8 max-w-md mx-auto">
    <div class="text-center mb-6">
      <h2 class="text-2xl font-bold mb-2" style="color: var(--text-primary);">
        {{ currentMode === "work" ? `🍅 ${$t('pomodoro.work')}` : `☕ ${$t('pomodoro.break')}` }}
      </h2>
      <div class="text-5xl font-bold mb-4" :style="{ color: currentMode === 'work' ? 'var(--success)' : 'var(--warning)' }">
        {{ formattedTime }}
      </div>

      <!-- Barra de progreso circular -->
      <div class="relative w-32 h-32 mx-auto mb-6">
        <svg class="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="50"
            :stroke="'var(--border-primary)'"
            stroke-width="8"
            fill="none"
          />
          <circle
            cx="60"
            cy="60"
            r="50"
            :stroke="currentMode === 'work' ? 'var(--success)' : 'var(--warning)'"
            stroke-width="8"
            fill="none"
            :stroke-dasharray="314"
            :stroke-dashoffset="314 - (314 * progress) / 100"
            class="transition-all duration-300 ease-out"
            stroke-linecap="round"
          />
        </svg>
        <div class="absolute inset-0 flex items-center justify-center">
          <span class="text-lg font-semibold" style="color: var(--text-secondary);">
            {{ Math.round(progress) }}%
          </span>
        </div>
      </div>
    </div>

    <div class="flex justify-center space-x-4 mb-6">
      <button v-if="!isRunning" @click="startTimer" class="btn-primary">
        {{ isPaused ? $t('pomodoro.start') : $t('pomodoro.start') }}
      </button>
      <button
        v-else
        @click="pauseTimer"
        class="btn-secondary"
        style="background: var(--warning); color: white; border: none;"
      >
        {{ $t('pomodoro.pause') }}
      </button>
      <button @click="resetTimer" class="btn-secondary">{{ $t('pomodoro.reset') }}</button>
    </div>

    <div class="text-center text-sm text-gray-600" style="color: var(--text-secondary);">
      <p>Sesión {{ sessionCount + 1 }}</p>
      <p
        v-if="authStore.currentUser"
        class="flex items-center justify-center mt-2"
      >
        <span class="mr-2" style="color: var(--text-secondary);">🪙</span>
        {{ authStore.currentUser.coins }} {{ $t('shop.coins') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePomodoroStore } from "../stores/pomodoro";
import { useAuthStore } from "../stores/auth";
import { storeToRefs } from "pinia";

const pomodoroStore = usePomodoroStore();
const authStore = useAuthStore();

const {
  isRunning,
  isPaused,
  formattedTime,
  progress,
  currentMode,
  sessionCount,
} = storeToRefs(pomodoroStore);

const { startTimer, pauseTimer, resetTimer } = pomodoroStore;
</script>
