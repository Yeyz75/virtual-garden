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

    <!-- Jardín 3D compacto -->
    <div class="garden-3d-compact">
      <!-- Terreno orgánico con borde de césped -->
      <div class="organic-terrain">
        <!-- Plantas existentes -->
        <div
          v-for="(plant, index) in userGarden?.plants || []"
          :key="`plant-${index}`"
          class="plant-3d-organic"
          :class="{
            'hovered': hoveredPlant === index,
            'growing': isPlantingPosition === index
          }"
          :style="getPlantPosition(index)"
          @click="selectExistingPlant(index)"
          @mouseenter="handlePlantHover(index, true)"
          @mouseleave="handlePlantHover(index, false)"
        >
          <!-- Planta 3D real -->
          <div class="plant-3d-model-real">
            <!-- Tallo -->
            <div class="plant-stem"></div>
            <!-- Hojas -->
            <div class="plant-leaves">
              <div class="leaf leaf-1"></div>
              <div class="leaf leaf-2"></div>
              <div class="leaf leaf-3"></div>
            </div>
            <!-- Flor/Fruto -->
            <div class="plant-flower">
              <span class="plant-emoji">{{ getPlantAtPosition(plant.position)?.emoji || '🌱' }}</span>
            </div>
            <!-- Sombra -->
            <div class="plant-shadow-real"></div>
          </div>
          
          <!-- Indicador de agua -->
          <div class="water-indicator-organic" :style="{ opacity: getPlantWaterLevel(plant.position) / 100 }">
            <div class="water-drop-organic">💧</div>
          </div>
        </div>

        <!-- Posición de plantación -->
        <div
          v-if="selectedPlant && !isPlantingPosition"
          class="planting-preview"
          :style="getPlantingPosition()"
          @click="plantInSelectedPosition()"
        >
          <div class="plant-3d-model-real preview">
            <div class="plant-stem"></div>
            <div class="plant-leaves">
              <div class="leaf leaf-1"></div>
              <div class="leaf leaf-2"></div>
              <div class="leaf leaf-3"></div>
            </div>
            <div class="plant-flower">
              <span class="plant-emoji">{{ selectedPlant.emoji }}</span>
            </div>
            <div class="plant-shadow-real"></div>
          </div>
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
          class="plant-card-3d p-4 border-2 rounded-lg cursor-pointer transition-all duration-200"
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
import { ref, onMounted, nextTick, computed } from 'vue'
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
const hoveredPlant = ref<number | null>(null)
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

// Posiciones orgánicas para las plantas
const plantPositions = computed(() => {
  const positions = []
  const plants = userGarden?.plants || []
  
  for (let i = 0; i < plants.length; i++) {
    // Crear posiciones orgánicas, no en grid
    const angle = (i * 137.5) % 360 // Ángulo dorado para distribución natural
    const radius = 40 + (i * 12) % 30 // Radio variable más pequeño
    const x = 50 + Math.cos(angle * Math.PI / 180) * radius
    const y = 50 + Math.sin(angle * Math.PI / 180) * radius
    
    positions.push({ x, y, z: Math.random() * 15 })
  }
  
  return positions
})

const canAfford = (plant: Plant) => {
  return authStore.currentUser ? authStore.currentUser.coins >= plant.baseCost : false
}

const selectPlant = (plant: Plant) => {
  if (canAfford(plant)) {
    selectedPlant.value = selectedPlant.value?.id === plant.id ? null : plant
  }
}

const getPlantPosition = (index: number) => {
  const pos = plantPositions.value[index] || { x: 50, y: 50, z: 0 }
  return {
    left: `${pos.x}%`,
    top: `${pos.y}%`,
    transform: `translateZ(${pos.z}px)`
  }
}

const getPlantingPosition = () => {
  // Encontrar una posición libre para plantar
  const plants = userGarden?.plants || []
  const angle = (plants.length * 137.5) % 360
  const radius = 40 + (plants.length * 12) % 30
  const x = 50 + Math.cos(angle * Math.PI / 180) * radius
  const y = 50 + Math.sin(angle * Math.PI / 180) * radius
  
  return {
    left: `${x}%`,
    top: `${y}%`,
    transform: `translateZ(${Math.random() * 15}px)`
  }
}

const plantInSelectedPosition = async () => {
  if (!selectedPlant.value || isAnimating.value) return

  const plants = userGarden?.plants || []
  const position = plants.length

  isPlantingPosition.value = position
  await nextTick()

  const plantElement = document.querySelector('.planting-preview .plant-3d-model-real') as HTMLElement
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
    const newPlantElement = document.querySelector(`[data-plant-index="${position}"] .plant-3d-model-real`) as HTMLElement
    if (newPlantElement) {
      animateGrowth(newPlantElement, 1, 4)
    }
  }

  isPlantingPosition.value = null
}

const selectExistingPlant = (index: number) => {
  // Aquí puedes agregar lógica para interactuar con plantas existentes
  console.log('Planta seleccionada:', index)
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

const handlePlantHover = (index: number, isHovering: boolean) => {
  hoveredPlant.value = isHovering ? index : null
  
  const plantElement = document.querySelector(`[data-plant-index="${index}"] .plant-3d-model-real`) as HTMLElement
  if (plantElement && !isAnimating.value) {
    animateHover(plantElement, isHovering)
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
/* Jardín 3D compacto */
.garden-3d-compact {
  perspective: 1000px;
  perspective-origin: center center;
  height: 320px;
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
  position: relative;
  overflow: visible;
  border-radius: 1.2rem;
  background: none;
  transform-style: preserve-3d;
}

/* Terreno orgánico con borde de césped */
.organic-terrain {
  position: relative;
  width: 100%;
  height: 100%;
  background: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.organic-terrain::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  width: 105%;
  height: 105%;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle, #22c55e 60%, transparent 100%);
  z-index: 0;
  border-radius: 1.5rem;
}

.organic-terrain .terrain-inner {
  position: relative;
  width: 92%;
  height: 88%;
  background: linear-gradient(135deg, #8B4513 70%, #A0522D 100%);
  border-radius: 1.1rem;
  box-shadow: 0 8px 32px rgba(0,0,0,0.25), inset 0 2px 8px rgba(255,255,255,0.08);
  z-index: 1;
  overflow: visible;
  /* Vista más desde arriba */
  transform: rotateX(13deg) rotateZ(-2deg);
  border: 4px solid #22c55e;
}

/* Ajuste de distribución de plantas */
.plant-3d-organic {
  position: absolute;
  width: 45px;
  height: 60px;
  transform-style: preserve-3d;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  z-index: 2;
}

.plant-3d-organic:hover {
  transform: translateZ(25px) scale(1.15);
  z-index: 100;
}

.plant-3d-organic.hovered {
  transform: translateZ(35px) scale(1.25);
  z-index: 200;
}

/* Modelo 3D real de la planta */
.plant-3d-model-real {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  animation: plantFloat 4s ease-in-out infinite;
}

.plant-3d-model-real.preview {
  opacity: 0.6;
  animation: plantPreview 2s ease-in-out infinite;
}

/* Tallo 3D */
.plant-stem {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%) translateZ(0);
  width: 6px;
  height: 30px;
  background: linear-gradient(to top, #228B22, #32CD32);
  border-radius: 3px;
  box-shadow: 
    0 2px 4px rgba(0,0,0,0.3),
    inset 0 1px 2px rgba(255,255,255,0.2);
}

/* Hojas 3D */
.plant-leaves {
  position: absolute;
  bottom: 15px;
  left: 50%;
  transform: translateX(-50%) translateZ(5px);
  transform-style: preserve-3d;
}

.leaf {
  position: absolute;
  width: 15px;
  height: 9px;
  background: linear-gradient(45deg, #228B22, #32CD32);
  border-radius: 50% 0 50% 0;
  box-shadow: 
    0 2px 4px rgba(0,0,0,0.2),
    inset 0 1px 2px rgba(255,255,255,0.1);
  animation: leafWave 3s ease-in-out infinite;
}

.leaf-1 {
  transform: translateX(-12px) translateY(-4px) rotateZ(-30deg) translateZ(2px);
  animation-delay: 0s;
}

.leaf-2 {
  transform: translateX(4px) translateY(-6px) rotateZ(45deg) translateZ(4px);
  animation-delay: 0.5s;
}

.leaf-3 {
  transform: translateX(-4px) translateY(4px) rotateZ(-15deg) translateZ(6px);
  animation-delay: 1s;
}

/* Flor/Fruto 3D */
.plant-flower {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%) translateZ(8px);
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle, rgba(255,255,255,0.9), rgba(255,255,255,0.7));
  border-radius: 50%;
  box-shadow: 
    0 3px 6px rgba(0,0,0,0.3),
    inset 0 2px 4px rgba(255,255,255,0.8);
  animation: flowerGlow 2s ease-in-out infinite;
}

.plant-emoji {
  font-size: 12px;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
}

/* Sombra realista */
.plant-shadow-real {
  position: absolute;
  bottom: -12px;
  left: 50%;
  transform: translateX(-50%) translateZ(-5px);
  width: 30px;
  height: 12px;
  background: radial-gradient(ellipse, rgba(0,0,0,0.4) 0%, transparent 70%);
  border-radius: 50%;
  filter: blur(3px);
}

/* Indicador de agua orgánico */
.water-indicator-organic {
  position: absolute;
  top: -8px;
  right: -4px;
  transform: translateZ(12px);
}

.water-drop-organic {
  background: rgba(59, 130, 246, 0.9);
  border-radius: 50%;
  padding: 2px;
  font-size: 8px;
  box-shadow: 
    0 2px 4px rgba(0,0,0,0.2),
    0 0 8px rgba(59, 130, 246, 0.4);
  animation: waterGlow 2s ease-in-out infinite;
}

/* Vista previa de plantación */
.planting-preview {
  position: absolute;
  width: 45px;
  height: 60px;
  transform-style: preserve-3d;
  cursor: pointer;
  transition: all 0.3s ease;
}

.planting-preview:hover {
  transform: translateZ(15px) scale(1.1);
}

/* Tarjeta de planta 3D */
.plant-card-3d {
  transition: all 0.3s ease;
  transform-style: preserve-3d;
  background: linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7));
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.2);
  box-shadow: 
    0 4px 6px rgba(0,0,0,0.1),
    0 1px 3px rgba(0,0,0,0.08);
}

.plant-card-3d:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 
    0 8px 25px rgba(0,0,0,0.15),
    0 4px 10px rgba(0,0,0,0.1);
}

/* Animaciones */
@keyframes plantFloat {
  0%, 100% { transform: translateY(0px) translateZ(0); }
  50% { transform: translateY(-8px) translateZ(5px); }
}

@keyframes plantPreview {
  0%, 100% { transform: translateY(0px) translateZ(0) scale(0.8); }
  50% { transform: translateY(-5px) translateZ(3px) scale(0.9); }
}

@keyframes leafWave {
  0%, 100% { transform: rotateZ(0deg); }
  50% { transform: rotateZ(5deg); }
}

@keyframes flowerGlow {
  0%, 100% { 
    box-shadow: 
      0 4px 8px rgba(0,0,0,0.3),
      inset 0 2px 4px rgba(255,255,255,0.8),
      0 0 10px rgba(255,255,255,0.3);
  }
  50% { 
    box-shadow: 
      0 4px 8px rgba(0,0,0,0.3),
      inset 0 2px 4px rgba(255,255,255,0.8),
      0 0 20px rgba(255,255,255,0.6);
  }
}

@keyframes waterGlow {
  0%, 100% { 
    box-shadow: 
      0 2px 4px rgba(0,0,0,0.2),
      0 0 8px rgba(59, 130, 246, 0.4);
  }
  50% { 
    box-shadow: 
      0 2px 4px rgba(0,0,0,0.2),
      0 0 15px rgba(59, 130, 246, 0.8);
  }
}

@keyframes grow {
  0% { transform: scale(0) translateZ(0); }
  50% { transform: scale(1.3) translateZ(20px); }
  100% { transform: scale(1) translateZ(0); }
}

.growing {
  animation: grow 1s ease-out;
}

/* Modo oscuro */
[data-theme="dark"] .organic-terrain {
  background: 
    radial-gradient(ellipse at 30% 70%, rgba(45, 24, 16, 0.8) 0%, transparent 50%),
    radial-gradient(ellipse at 70% 30%, rgba(61, 43, 31, 0.6) 0%, transparent 50%),
    linear-gradient(135deg, #2d1810, #3d2b1f);
}

[data-theme="dark"] .plant-card-3d {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(51, 65, 85, 0.7));
  border-color: rgba(71, 85, 105, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .garden-3d-compact {
    height: 180px;
    max-width: 100%;
  }
  .organic-terrain .terrain-inner {
    width: 98%;
    height: 92%;
    border-radius: 1rem;
  }
  .plant-3d-organic {
    width: 32px;
    height: 40px;
  }
  .planting-preview {
    width: 32px;
    height: 40px;
  }
}

/* Efectos de partículas mejorados */
.garden-3d-compact::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 50%);
  pointer-events: none;
  z-index: 1;
}
</style>