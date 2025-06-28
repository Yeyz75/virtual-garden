<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-50">
    <div class="bg-white p-8 rounded shadow-md w-full max-w-md">
      <h2 class="text-2xl font-bold mb-4 text-center">Restablecer contraseña</h2>
      <form @submit.prevent="handleReset">
        <label class="block mb-2 text-sm font-medium text-gray-700">Correo electrónico</label>
        <input
          v-model="email"
          type="email"
          required
          class="w-full px-3 py-2 border rounded mb-4 focus:outline-none focus:ring focus:border-blue-300"
        />
        <button
          type="submit"
          class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          :disabled="loading"
        >
          {{ loading ? 'Enviando...' : 'Enviar enlace de restablecimiento' }}
        </button>
      </form>
      <p v-if="message" class="mt-4 text-green-600 text-center">{{ message }}</p>
      <p v-if="error" class="mt-4 text-red-600 text-center">{{ error }}</p>
      <router-link to="/login" class="block mt-6 text-center text-blue-600 hover:underline">Volver al inicio de sesión</router-link>
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
