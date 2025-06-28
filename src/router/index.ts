import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('../views/HomeView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('../views/RegisterView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/garden',
      name: 'Garden',
      component: () => import('../views/GardenView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/shop',
      name: 'Shop',
      component: () => import('../views/ShopView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/settings',
      name: 'Settings',
      component: () => import('../views/SettingsView.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

// Función auxiliar para esperar a que termine la carga de autenticación
async function waitForAuthReady(authStore: any) {
  if (authStore.loading) {
    await new Promise<void>(resolve => {
      const unsubscribe = authStore.$subscribe((_: any, state: any) => {
        if (!state.loading) {
          unsubscribe()
          resolve()
        }
      })
    })
  }
}

// Guard asíncrono moderno
router.beforeEach(async (to, _) => {
  const authStore = useAuthStore()
  await waitForAuthReady(authStore)

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { path: '/login' }
  }
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    return { path: '/' }
  }
  // Si no hay restricciones, continuar normalmente
  return true
})

export default router