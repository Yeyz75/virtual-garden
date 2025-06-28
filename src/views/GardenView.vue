<template>
  <div class="min-h-screen py-8">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          🌱 Mi Jardín Virtual
        </h1>
        <p class="text-lg text-gray-600">
          Haz crecer tu jardín completando sesiones de productividad
        </p>
      </div>

      <VirtualGarden />
    </div>
  </div>
</template>

<script setup lang="ts">
import VirtualGarden from '../components/VirtualGarden.vue'
</script>