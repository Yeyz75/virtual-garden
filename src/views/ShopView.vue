<template>
  <div class="min-h-screen py-8">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-4" style="color: var(--text-secondary);">
          🛍️ {{ $t('shop.title') }}
        </h1>
        <p class="text-lg text-gray-600" style="color: var(--text-secondary);">
          {{ $t('shop.description') || 'Usa tus monedas ganadas o compra paquetes premium' }}
        </p>
        
        <div v-if="authStore.currentUser" class="mt-4">
          <div class="inline-flex items-center bg-accent-50 px-4 py-2 rounded-full">
            <span class="text-2xl mr-2">🪙</span>
            <span class="text-xl font-bold text-accent-700">
              {{ authStore.currentUser.coins }} {{ $t('shop.coins') }}
            </span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="item in shopItems"
          :key="item.id"
          class="card p-6 hover:shadow-xl transition-all duration-300" 
        >
          <div class="text-center">
            <div class="text-6xl mb-4" style="color: var(--text-secondary);">{{ item.emoji }}</div>
            <h3 class="text-xl font-bold text-gray-900 mb-2" style="color: var(--text-secondary);">{{ item.name }}</h3>
            <p class="text-gray-600 text-sm mb-4" style="color: var(--text-secondary);">{{ item.description }}</p>

            <div class="mb-4">
              <span 
                class="inline-block px-3 py-1 rounded-full text-xs font-medium text-white"
                :class="getRarityColor(item.rarity)"
              >
                {{ item.rarity.toUpperCase() }}
              </span>
            </div>

            <div class="mb-6">
              <div class="text-2xl font-bold">
                <span v-if="item.costType === 'coins'" class="text-accent-600" style="color: var(--text-secondary);">
                  🪙 {{ item.cost }}
                </span>
                <span v-else class="text-green-600" style="color: var(--text-secondary);">
                  ${{ item.cost }}
                </span>
              </div>
              <div class="text-sm text-gray-500" style="color: var(--text-secondary);">
                {{ item.costType === 'coins' ? 'monedas' : 'USD' }}
              </div>
            </div>

            <button
              @click="purchaseItem(item)"
              :disabled="item.costType === 'coins' && (!authStore.currentUser || authStore.currentUser.coins < item.cost)"
              class="w-full py-3 px-4 rounded-lg font-medium transition-all duration-200"
              :class="getButtonClass(item)"
            >
              <span v-if="purchasing === item.id">
                Procesando...
              </span>
              <span v-else>
                {{ item.costType === 'coins' ? 'Comprar con monedas' : 'Comprar con PayPal' }}
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- Sección de información -->
      <div class="mt-12">
        <div class="card p-6 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
          <div class="text-center">
            <h3 class="text-xl font-semibold mb-4">💡 ¿Cómo ganar más monedas?</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="text-center">
                <div class="text-3xl mb-2">⏰</div>
                <h4 class="font-semibold mb-1">Completa sesiones</h4>
                <p class="text-primary-100 text-sm">
                  Gana 10-14 monedas por cada sesión de trabajo completada
                </p>
              </div>
              <div class="text-center">
                <div class="text-3xl mb-2">🔥</div>
                <h4 class="font-semibold mb-1">Mantén la racha</h4>
                <p class="text-primary-100 text-sm">
                  Bonificaciones por completar múltiples días consecutivos
                </p>
              </div>
              <div class="text-center">
                <div class="text-3xl mb-2">🎯</div>
                <h4 class="font-semibold mb-1">Logra metas</h4>
                <p class="text-primary-100 text-sm">
                  Recompensas especiales por alcanzar objetivos semanales
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useShopStore } from '../stores/shop'
import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notifications'
import type { ShopItem } from '../types'

const shopStore = useShopStore()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const { shopItems } = shopStore
const purchasing = ref<string | null>(null)

const getRarityColor = (rarity: string) => {
  const colors = {
    common: 'bg-gray-500',
    rare: 'bg-blue-500',
    epic: 'bg-purple-500',
    legendary: 'bg-accent-500'
  }
  return colors[rarity as keyof typeof colors] || 'bg-gray-500'
}

const getButtonClass = (item: ShopItem) => {
  if (item.costType === 'coins') {
    const canAfford = authStore.currentUser && authStore.currentUser.coins >= item.cost
    return canAfford
      ? 'bg-accent-500 hover:bg-accent-600 text-white'
      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
  } else {
    return 'bg-green-500 hover:bg-green-600 text-white'
  }
}

const purchaseItem = async (item: ShopItem) => {
  if (purchasing.value) return

  purchasing.value = item.id

  try {
    let success = false
    
    if (item.costType === 'coins') {
      success = await shopStore.purchaseWithCoins(item.id)
    } else {
      success = await shopStore.purchaseWithPayPal(item)
    }

    if (success) {
      notificationStore.addNotification({
        title: '¡Compra exitosa!',
        message: `Has adquirido ${item.name}`,
        type: 'success'
      })
    }
  } catch (error) {
    console.error('Purchase error:', error)
    notificationStore.addNotification({
      title: 'Error en la compra',
      message: 'No se pudo completar la transacción',
      type: 'error'
    })
  } finally {
    purchasing.value = null
  }
}
</script>