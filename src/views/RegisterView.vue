<template>
  <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <div class="text-6xl mb-4">🌱</div>
        <h2 class="text-3xl font-bold text-gray-900">
          {{ $t('register.title') }}
        </h2>
        <p class="mt-2 text-gray-600">
          {{ $t('register.description') || 'Crea tu cuenta y comienza tu viaje de productividad' }}
        </p>
      </div>

      <div class="card p-8">
        <form @submit.prevent="handleRegister" class="space-y-6">
          <div>
            <label for="displayName" class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('register.name') }} ({{ $t('register.optional') || 'opcional' }})
            </label>
            <input
              id="displayName"
              v-model="displayName"
              type="text"
              class="input-field"
              placeholder="Tu nombre"
            />
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('register.email') }}
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="input-field"
              :class="{ 'border-red-500': errors.email }"
              placeholder="tu@email.com"
            />
            <p v-if="errors.email" class="mt-1 text-sm text-red-600">
              {{ errors.email }}
            </p>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('register.password') }}
            </label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              class="input-field"
              :class="{ 'border-red-500': errors.password }"
              placeholder="Mínimo 6 caracteres"
            />
            <p v-if="errors.password" class="mt-1 text-sm text-red-600">
              {{ errors.password }}
            </p>
          </div>

          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('register.confirmPassword') }}
            </label>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              required
              class="input-field"
              :class="{ 'border-red-500': errors.confirmPassword }"
              placeholder="Repite tu contraseña"
            />
            <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600">
              {{ errors.confirmPassword }}
            </p>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full btn-primary"
            :class="{ 'opacity-50 cursor-not-allowed': loading }"
          >
            {{ loading ? 'Creando cuenta...' : 'Crear cuenta' }}
          </button>
        </form>

        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300" />
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">O regístrate con</span>
            </div>
          </div>

          <button
            @click="handleGoogleRegister"
            :disabled="loading"
            class="mt-4 w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar con Google
          </button>
        </div>

        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            ¿Ya tienes una cuenta?
            <router-link to="/login" class="font-medium text-primary-600 hover:text-primary-500">
              Inicia sesión aquí
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notifications'

const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const displayName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)

const errors = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  general: ''
})

const clearErrors = () => {
  errors.email = ''
  errors.password = ''
  errors.confirmPassword = ''
  errors.general = ''
}

const validateForm = () => {
  clearErrors()
  let isValid = true

  if (password.value.length < 6) {
    errors.password = 'La contraseña debe tener al menos 6 caracteres'
    isValid = false
  }

  if (password.value !== confirmPassword.value) {
    errors.confirmPassword = 'Las contraseñas no coinciden'
    isValid = false
  }

  return isValid
}

const handleRegister = async () => {
  if (!validateForm()) return

  loading.value = true

  try {
    await authStore.register(email.value, password.value, displayName.value)
    
    notificationStore.addNotification({
      title: '¡Cuenta creada exitosamente!',
      message: 'Bienvenido a tu jardín virtual de productividad',
      type: 'success'
    })
    
    router.push('/')
  } catch (error: any) {
    console.error('Register error:', error)
    
    const errorCode = error.code
    switch (errorCode) {
      case 'auth/email-already-in-use':
        errors.email = 'Ya existe una cuenta con este correo electrónico'
        break
      case 'auth/invalid-email':
        errors.email = 'El formato del correo electrónico no es válido'
        break
      case 'auth/weak-password':
        errors.password = 'La contraseña es muy débil'
        break
      default:
        errors.general = 'Error al crear la cuenta. Intenta nuevamente'
    }
    
    if (errors.general) {
      notificationStore.addNotification({
        title: 'Error de registro',
        message: errors.general,
        type: 'error'
      })
    }
  } finally {
    loading.value = false
  }
}

const handleGoogleRegister = async () => {
  loading.value = true
  
  try {
    await authStore.loginWithGoogle()
    
    notificationStore.addNotification({
      title: '¡Cuenta creada exitosamente!',
      message: 'Bienvenido a tu jardín virtual de productividad',
      type: 'success'
    })
    
    router.push('/')
  } catch (error: any) {
    console.error('Google register error:', error)
    
    notificationStore.addNotification({
      title: 'Error con Google',
      message: 'No se pudo crear la cuenta con Google. Intenta nuevamente',
      type: 'error'
    })
  } finally {
    loading.value = false
  }
}
</script>