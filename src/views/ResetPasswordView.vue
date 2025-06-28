<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
    <div class="card w-full max-w-md p-8 flex flex-col items-center">
      <div class="flex flex-col items-center mb-6">
        <span class="text-4xl mb-2">🔒</span>
        <h2 class="text-2xl font-bold mb-1 text-center" style="color: var(--text-accent);">{{ $t('resetPassword.title') || 'Restablecer contraseña' }}</h2>
        <p class="text-center text-sm" style="color: var(--text-secondary);">{{ $t('resetPassword.description') || 'Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.' }}</p>
      </div>
      <form @submit.prevent="handleReset" class="w-full flex flex-col gap-4">
        <div>
          <label class="block mb-1 text-sm font-medium" style="color: var(--text-primary);">{{ $t('login.email') }}</label>
          <input
            v-model="email"
            type="email"
            required
            class="input-field"
            placeholder="tucorreo@ejemplo.com"
          />
        </div>
        <button
          type="submit"
          class="btn-primary w-full flex items-center justify-center gap-2"
          :disabled="loading"
        >
          <span v-if="loading" class="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
          {{ loading ? ($t('resetPassword.sending') || 'Enviando...') : ($t('resetPassword.sendLink') || 'Enviar enlace de restablecimiento') }}
        </button>
      </form>
      <transition name="fade">
        <p v-if="message" class="mt-4 text-center" style="color: var(--success);">{{ message }}</p>
      </transition>
      <transition name="fade">
        <p v-if="error" class="mt-4 text-center" style="color: var(--error);">{{ error }}</p>
      </transition>
      <router-link to="/login" class="block mt-6 text-center hover:underline" style="color: var(--text-accent);">{{ $t('login.title') }}</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';

const email = ref('');
const loading = ref(false);
const message = ref('');
const error = ref('');
const authStore = useAuthStore();

const handleReset = async () => {
  loading.value = true;
  message.value = '';
  error.value = '';
  try {
    await authStore.resetPassword(email.value);
    message.value = '¡Revisa tu correo para restablecer la contraseña!';
  } catch (e: any) {
    error.value = e.message || 'Error al enviar el correo de restablecimiento.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
