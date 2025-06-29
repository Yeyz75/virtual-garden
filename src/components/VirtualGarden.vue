<template>
  <!-- Contenedor para efectos de ambiente -->
  <div ref="ambientContainer" class="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
    <!-- Los efectos de ambiente se agregarán aquí -->
  </div>

  <!-- Contenedor para partículas -->
  <div ref="particlesContainer" class="fixed inset-0 pointer-events-none">
    <!-- Las partículas se agregarán aquí -->
  </div>

  <div class="card p-6">
    <div class="flex justify-between items-center mb-6 relative">
      <h2 class="text-2xl font-bold" style="color: var(--text-primary);">
        🌱 {{ $t('garden.title') }}
      </h2>
      <div class="flex items-center space-x-4">
        <span class="text-sm" style="color: var(--text-secondary);">
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
      class="garden-grid relative"
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
        :class="{
          'occupied': occupiedSlots.includes(position - 1),
          'growing': isPlantingPosition === position - 1
        }"
        :data-position="position - 1"
        @click="selectSlot(position - 1)"
        @mouseenter="handleSlotHover(position - 1, true)"
        @mouseleave="handleSlotHover(position - 1, false)"
      >
        <div v-if="getPlantAtPosition(position - 1)" class="plant-display relative">
          <span class="text-4xl">
            {{ getPlantAtPosition(position - 1)?.emoji }}
          </span>
          <!-- Indicador de agua -->
          <div class="water-indicator" :style="{ opacity: getPlantWaterLevel(position - 1) / 100 }">
            💧
          </div>
        </div>
        <div v-else-if="selectedPlant" class="plant-preview opacity-50">
          <span class="text-3xl">{{ selectedPlant.emoji }}</span>
        </div>
        <div v-else class="text-2xl text-gray-400 empty-slot">
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
          @mouseenter="handlePlantCardHover($event, true)"
          @mouseleave="handlePlantCardHover($event, false)"
        >
          <div class="text-center">
            <div class="text-3xl mb-2 plant-card-emoji">{{ plant.emoji }}</div>
            <div class="text-sm font-medium" style="color: var(--text-secondary);">{{ plant.name }}</div>
            <div class="text-xs text-gray-600 mb-2" style="color: var(--text-secondary);">{{ plant.description }}</div>
            <div class="flex items-center justify-center text-sm">
              <span class="mr-1">🪙</span>
              <span :class="{ 'text-red-500': !canAfford(plant) }">
                {{ plant.baseCost }}
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
import { ref, onMounted, nextTick } from 'vue'
import { useGardenStore } from '../stores/garden'
import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notifications'
import { usePlantAnimations } from '../composables/usePlantAnimations'
import type { Plant } from '../types'
import { gsap } from 'gsap'

const gardenStore = useGardenStore()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const selectedPlant = ref<Plant | null>(null)
const showUpgradeModal = ref(false)
const isPlantingPosition = ref<number | null>(null)
const ambientContainer = ref<HTMLElement | null>(null)
const particlesContainer = ref<HTMLElement | null>(null)

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
  getPlantAtPosition,
  getPlantWaterLevel
} = gardenStore

const {
  isAnimating,
  animatePlanting,
  animateGrowth,
  animateWatering,
  animateHover,
  animateHarvest,
  createAmbientEffects,
  particlesContainer: animParticlesContainer
} = usePlantAnimations()

const layouts = {
  small: { name: 'Jardín Pequeño', slots: 16, cost: 0 },
  medium: { name: 'Jardín Mediano', slots: 25, cost: 100 },
  large: { name: 'Jardín Grande', slots: 36, cost: 200 }
}

const canAfford = (plant: Plant) => {
  return authStore.currentUser ? authStore.currentUser.coins >= plant.baseCost : false
}

const selectPlant = (plant: Plant) => {
  if (canAfford(plant)) {
    selectedPlant.value = selectedPlant.value?.id === plant.id ? null : plant
  }
}

const selectSlot = async (position: number) => {
  if (!selectedPlant.value || occupiedSlots.includes(position) || isAnimating.value) return

  isPlantingPosition.value = position
  await nextTick()

  const plantElement = document.querySelector(`[data-position="${position}"] .plant-preview`) as HTMLElement
  if (plantElement) {
    await animatePlanting(plantElement)
  }

  const success = await plantInGarden(selectedPlant.value.id, position)
  if (success) {
    const plantName = selectedPlant.value.name
    selectedPlant.value = null

    notificationStore.addNotification({
      title: '¡Planta agregada!',
      message: `Has plantado ${plantName} en tu jardín`,
      type: 'success'
    })

    // Iniciar animación de crecimiento
    const newPlantElement = document.querySelector(`[data-position="${position}"] .plant-display`) as HTMLElement
    if (newPlantElement) {
      animateGrowth(newPlantElement, 1, 4)
    }
  }

  isPlantingPosition.value = null
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

const handleSlotHover = (position: number, isHovering: boolean) => {
  const slot = document.querySelector(`[data-position="${position}"] .plant-display, [data-position="${position}"] .plant-preview`) as HTMLElement
  if (slot && !isAnimating.value) {
    animateHover(slot, isHovering)
  }
}

const handlePlantCardHover = (event: MouseEvent, isHovering: boolean) => {
  const target = (event.currentTarget as HTMLElement).querySelector('.plant-card-emoji') as HTMLElement
  if (target) {
    animateHover(target, isHovering)
  }
}

onMounted(async () => {
  await loadUserGarden()
  
  if (ambientContainer.value) {
    createAmbientEffects(ambientContainer.value)
  }
  
  if (particlesContainer.value) {
    animParticlesContainer.value = particlesContainer.value
  }
})
</script>

<style scoped>
.garden-grid {
  display: grid;
  gap: 1rem;
  padding: 2rem;
  background: linear-gradient(45deg, var(--garden-soil), var(--garden-soil-dark));
  border-radius: 1rem;
  min-height: 300px;
  position: relative;
  overflow: hidden;
}

.plant-slot {
  aspect-ratio: 1;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-radius: 0.5rem;
  border: 2px solid #d97706;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.plant-slot.occupied {
  background: linear-gradient(135deg, #dcfce7, #bbf7d0);
  border-color: var(--plant-healthy);
}

.plant-slot.empty {
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  border-color: var(--plant-seed);
}

.plant-display, .plant-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  position: relative;
}

.water-indicator {
  position: absolute;
  bottom: 4px;
  right: 4px;
  background: rgba(255,255,255,0.7);
  border-radius: 50%;
  padding: 2px;
  font-size: 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
  transition: opacity 0.3s ease;
}

.plant-card {
  transition: all 0.3s ease;
}

.plant-card:hover {
  transform: translateY(-2px);
}

.plant-card-emoji {
  transition: all 0.3s ease;
}

[data-theme="dark"] .plant-slot {
  background: linear-gradient(135deg, #451a03, #78350f);
  border-color: #f59e0b;
}

[data-theme="dark"] .plant-slot.occupied {
  background: linear-gradient(135deg, #052e16, #14532d);
  border-color: var(--plant-healthy);
}

[data-theme="dark"] .plant-slot.empty {
  background: linear-gradient(135deg, #374151, #4b5563);
  border-color: var(--plant-seed);
}

.growing {
  animation: grow 0.8s ease-out;
}

@keyframes grow {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
</style>