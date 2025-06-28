import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '../firebase/config'
import type { User } from '../types'

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<User | null>(null)
  const firebaseUser = ref<FirebaseUser | null>(null)
  const loading = ref(true)

  const isAuthenticated = computed(() => !!currentUser.value)

  // Inicializar listener de autenticación
  const initAuth = () => {
    onAuthStateChanged(auth, async (user) => {
      firebaseUser.value = user
      if (user) {
        await loadUserData(user.uid)
      } else {
        currentUser.value = null
      }
      loading.value = false
    })
  }

  // Cargar datos del usuario desde Firestore
  const loadUserData = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid))
      if (userDoc.exists()) {
        currentUser.value = { id: uid, ...userDoc.data() } as User
      } else {
        // Crear nuevo usuario
        const newUser: User = {
          id: uid,
          email: firebaseUser.value?.email || '',
          displayName: firebaseUser.value?.displayName || '',
          coins: 100, // Monedas iniciales
          totalSessions: 0,
          currentStreak: 0,
          createdAt: new Date()
        }
        await setDoc(doc(db, 'users', uid), newUser)
        currentUser.value = newUser
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  // Registro con email y contraseña
  const register = async (email: string, password: string, displayName?: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      const newUser: User = {
        id: result.user.uid,
        email,
        displayName: displayName || '',
        coins: 100,
        totalSessions: 0,
        currentStreak: 0,
        createdAt: new Date()
      }
      await setDoc(doc(db, 'users', result.user.uid), newUser)
      return result
    } catch (error) {
      throw error
    }
  }

  // Login con email y contraseña
  const login = async (email: string, password: string) => {
    try {
      return await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      throw error
    }
  }

  // Login con Google
  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider()
      return await signInWithPopup(auth, provider)
    } catch (error) {
      throw error
    }
  }

  // Logout
  const logout = async () => {
    try {
      await signOut(auth)
      currentUser.value = null
      firebaseUser.value = null
    } catch (error) {
      throw error
    }
  }

  // Actualizar monedas del usuario
  const updateCoins = async (amount: number) => {
    if (currentUser.value) {
      const newCoins = currentUser.value.coins + amount
      currentUser.value.coins = newCoins
      await setDoc(doc(db, 'users', currentUser.value.id), { 
        ...currentUser.value,
        coins: newCoins
      })
    }
  }

  return {
    currentUser,
    firebaseUser,
    loading,
    isAuthenticated,
    initAuth,
    register,
    login,
    loginWithGoogle,
    logout,
    updateCoins
  }
})