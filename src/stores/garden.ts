import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuthStore } from './auth'
import type { Plant, UserGarden } from '../types'

export const useGardenStore = defineStore('garden', () => {
  const authStore = useAuthStore()
  
  const userGarden = ref<UserGarden | null>(null)
  const availablePlants = ref<Plant[]>([
    {
      id: 'sunflower',
      name: 'Girasol',
      emoji: '🌻',
      rarity: 'common',
      cost: 20,
      description: 'Una hermosa flor que sigue al sol'
    },
    {
      id: 'rose',
      name: 'Rosa',
      emoji: '🌹',
      rarity: 'common',
      cost: 25,
      description: 'Símbolo de amor y pasión'
    },
    {
      id: 'cactus',
      name: 'Cactus',
      emoji: '🌵',
      rarity: 'rare',
      cost: 40,
      description: 'Resistente y único'
    },
    {
      id: 'cherry-blossom',
      name: 'Cerezo',
      emoji: '🌸',
      rarity: 'rare',
      cost: 50,
      description: 'Belleza efímera japonesa'
    },
    {
      id: 'bamboo',
      name: 'Bambú',
      emoji: '🎋',
      rarity: 'epic',
      cost: 80,
      description: 'Símbolo de flexibilidad y fuerza'
    },
    {
      id: 'dragon-fruit',
      name: 'Pitaya',
      emoji: '🐉',
      rarity: 'legendary',
      cost: 150,
      description: 'Fruta del dragón legendaria'
    }
  ])

  const gardenSize = computed(() => {
    if (!userGarden.value) return 16
    switch (userGarden.value.layout) {
      case 'small': return 16
      case 'medium': return 25
      case 'large': return 36
      default: return 16
    }
  })

  const occupiedSlots = computed(() => {
    return userGarden.value?.plants.map(p => p.position) || []
  })

  const totalPlants = computed(() => {
    return userGarden.value?.plants.length || 0
  })

  const loadUserGarden = async () => {
    if (!authStore.currentUser) return

    try {
      const gardenDoc = await getDoc(doc(db, 'gardens', authStore.currentUser.id))
      if (gardenDoc.exists()) {
        userGarden.value = gardenDoc.data() as UserGarden
      } else {
        // Crear jardín inicial
        const newGarden: UserGarden = {
          userId: authStore.currentUser.id,
          plants: [],
          layout: 'small'
        }
        await setDoc(doc(db, 'gardens', authStore.currentUser.id), newGarden)
        userGarden.value = newGarden
      }
    } catch (error) {
      console.error('Error loading garden:', error)
    }
  }

  const plantInGarden = async (plantId: string, position: number) => {
    if (!authStore.currentUser || !userGarden.value) return false

    const plant = availablePlants.value.find(p => p.id === plantId)
    if (!plant) return false

    // Verificar si el usuario tiene suficientes monedas
    if (authStore.currentUser.coins < plant.cost) return false

    // Verificar si la posición está disponible
    if (occupiedSlots.value.includes(position)) return false

    try {
      // Agregar planta al jardín
      userGarden.value.plants.push({
        plantId,
        position,
        plantedAt: new Date()
      })

      // Actualizar en Firestore
      await updateDoc(doc(db, 'gardens', authStore.currentUser.id), {
        plants: userGarden.value.plants
      })

      // Descontar monedas
      await authStore.updateCoins(-plant.cost)

      return true
    } catch (error) {
      console.error('Error planting:', error)
      return false
    }
  }

  const upgradeGarden = async (newLayout: 'small' | 'medium' | 'large') => {
    if (!authStore.currentUser || !userGarden.value) return false

    const costs = { small: 0, medium: 100, large: 200 }
    const cost = costs[newLayout]

    if (authStore.currentUser.coins < cost) return false

    try {
      userGarden.value.layout = newLayout
      await updateDoc(doc(db, 'gardens', authStore.currentUser.id), {
        layout: newLayout
      })

      if (cost > 0) {
        await authStore.updateCoins(-cost)
      }

      return true
    } catch (error) {
      console.error('Error upgrading garden:', error)
      return false
    }
  }

  const getPlantAtPosition = (position: number) => {
    const gardenPlant = userGarden.value?.plants.find(p => p.position === position)
    if (!gardenPlant) return null

    const plantData = availablePlants.value.find(p => p.id === gardenPlant.plantId)
    return { ...gardenPlant, ...plantData }
  }

  return {
    userGarden,
    availablePlants,
    gardenSize,
    occupiedSlots,
    totalPlants,
    loadUserGarden,
    plantInGarden,
    upgradeGarden,
    getPlantAtPosition
  }
})