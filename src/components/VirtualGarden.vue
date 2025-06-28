<template>
  <div class="card p-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800">
        🌱 {{ $t('garden.title') }}
      </h2>
      <div class="flex items-center space-x-4">
        <span class="text-sm text-gray-600">
          {{ totalPlants }} plantas
        </span>
        <button
          @click="showUpgradeModal = true"
          class="btn-secondary text-sm py-2 px-4"
        >
          {{ $t('garden.expand') }}
        </button>
      </div>
    </div>

    <div 
      class="garden-grid"
      :class="{
        'grid-cols-4': gardenSize === 16,
        'grid-cols-5': gardenSize === 25,
        'grid-cols-6': gardenSize === 36
      }"
    >
      <div
        v-for="position in gardenSize"
        :key="position"
        class="plant-slot"
        :class="{ 'occupied': occupiedSlots.includes(position - 1) }"
        @click="selectSlot(position - 1)"
        :style="{ cursor: selectedPlant ? 'pointer' : 'default' }"
      >
        <div v-if="getPlantAtPosition(position - 1)" class="plant-display">
          <span class="text-4xl animate-grow">
            {{ getPlantAtPosition(position - 1)?.emoji }}
          </span>
        </div>
        <div v-else-if="selectedPlant" class="plant-preview opacity-50">
          <span class="text-3xl">{{ selectedPlant.emoji }}</span>
        </div>
        <div v-else class="text-2xl text-gray-400">
          ➕
        </div>
      </div>
    </div>

    <!-- Selector de plantas -->
    <div class="mt-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ $t('garden.addPlant') }}</h3>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div
          v-for="plant in availablePlants"
          :key="plant.id"
          class="plant-card p-4 border-2 rounded-lg cursor-pointer transition-all duration-200"
          :class="{
            'border-primary-500 bg-primary-50': selectedPlant?.id === plant.id,
            'border-gray-200 hover:border-gray-300': selectedPlant?.id !== plant.id,
            'opacity-50 cursor-not-allowed': !canAfford(plant)
          }"
          @click="selectPlant(plant)"
        >
          <div class="text-center">
            <div class="text-3xl mb-2">{{ plant.emoji }}</div>
            <div class="text-sm font-medium text-gray-800">{{ plant.name }}</div>
            <div class="text-xs text-gray-600 mb-2">{{ plant.description }}</div>
            <div class="flex items-center justify-center text-sm">
              <span class="mr-1">🪙</span>
              <span :class="{ 'text-red-500': !canAfford(plant) }">
                {{ plant.cost }}
              </span>
            </div>
            <div class="text-xs mt-1">
              <span 
                class="px-2 py-1 rounded-full text-white text-xs"
                :class="getRarityColor(plant.rarity)"
              >
                {{ plant.rarity }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de mejora de jardín -->
    <div
      v-if="showUpgradeModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showUpgradeModal = false"
    >
      <div class="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <h3 class="text-xl font-bold text-gray-800 mb-4">{{ $t('garden.expand') || 'Expandir Jardín' }}</h3>
        
        <div class="space-y-4">
          <div 
            v-for="(layout, size) in layouts"
            :key="size"
            class="border-2 rounded-lg p-4 cursor-pointer transition-all"
            :class="{
              'border-primary-500 bg-primary-50': userGarden?.layout === size,
              'border-gray-200 hover:border-gray-300': userGarden?.layout !== size
            }"
            @click="upgradeGarden(size as any)"
          >
            <div class="flex justify-between items-center">
              <div>
                <div class="font-medium">{{ layout.name }}</div>
                <div class="text-sm text-gray-600">{{ layout.slots }} {{ $t('garden.slots') || 'espacios' }}</div>
              </div>
              <div class="text-right">
                <div class="font-medium">🪙 {{ layout.cost }}</div>
                <div class="text-xs text-gray-500">{{ $t('shop.coins') }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end space-x-3 mt-6">
          <button
            @click="showUpgradeModal = false"
            class="btn-secondary"
          >
            {{ $t('garden.cancel') || 'Cancelar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useGardenStore } from '../stores/garden'
import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notifications'
import type { Plant } from '../types'
import { gsap } from 'gsap'

const gardenStore = useGardenStore()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const selectedPlant = ref<Plant | null>(null)
const showUpgradeModal = ref(false)

const {
  userGarden,
  availablePlants,
  gardenSize,
  occupiedSlots,
  totalPlants
} = gardenStore

const {
  loadUserGarden,
  plantInGarden,
  upgradeGarden,
  getPlantAtPosition
} = gardenStore

const layouts = {
  small: { name: 'Jardín Pequeño', slots: 16, cost: 0 },
  medium: { name: 'Jardín Mediano', slots: 25, cost: 100 },
  large: { name: 'Jardín Grande', slots: 36, cost: 200 }
}

const canAfford = (plant: Plant) => {
  return authStore.currentUser ? authStore.currentUser.coins >= plant.cost : false
}

const selectPlant = (plant: Plant) => {
  if (canAfford(plant)) {
    selectedPlant.value = selectedPlant.value?.id === plant.id ? null : plant
  }
}

const selectSlot = async (position: number) => {
  if (!selectedPlant.value || occupiedSlots.value.includes(position)) return

  const success = await plantInGarden(selectedPlant.value.id, position)
  if (success) {
    selectedPlant.value = null
    
    // Animación de plantado
    const plantElement = document.querySelector(`[data-position="${position}"]`)
    if (plantElement) {
      gsap.from(plantElement, {
        scale: 0,
        rotation: 360,
        duration: 0.8,
        ease: "bounce.out"
      })
    }

    notificationStore.addNotification({
      title: '¡Planta agregada!',
      message: `Has plantado ${selectedPlant.value.name} en tu jardín`,
      type: 'success'
    })
  }
}

const getRarityColor = (rarity: string) => {
  const colors = {
    common: 'bg-gray-500',
    rare: 'bg-blue-500',
    epic: 'bg-purple-500',
    legendary: 'bg-accent-500'
  }
  return colors[rarity as keyof typeof colors] || 'bg-gray-500'
}

onMounted(() => {
  loadUserGarden()
})
</script>

<style scoped>
.plant-display {
  @apply transition-transform duration-200 hover:scale-110;
}

.plant-card:hover {
  transform: translateY(-2px);
}
</style>