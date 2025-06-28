import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  User as FirebaseUser,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  updateDoc,
  increment,
} from "firebase/firestore";
import { auth, db } from "../firebase/config";
import type { User } from "../types";

export const useAuthStore = defineStore("auth", () => {
  const currentUser = ref<User | null>(null);
  const firebaseUser = ref<FirebaseUser | null>(null);
  const loading = ref(true);

  const isAuthenticated = computed(() => !!currentUser.value);

  // Inicializar listener de autenticación
  const initAuth = () => {
    onAuthStateChanged(auth, async (user) => {
      firebaseUser.value = user;
      if (user) {
        await loadUserData(user.uid);
      } else {
        currentUser.value = null;
      }
      loading.value = false;
    });
  };

  // Cargar datos del usuario desde Firestore
  const loadUserData = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        currentUser.value = { id: uid, ...userDoc.data() } as User;
      } else {
        // Crear nuevo usuario con estructura recomendada
        const newUser = {
          uid: uid,
          email: firebaseUser.value?.email || "",
          displayName: firebaseUser.value?.displayName || "Usuario",
          coins: 100, // Monedas iniciales
          totalSessions: 0,
          currentStreak: 0,
          lastSessionDate: null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          preferences: {
            workDuration: 25 * 60,
            shortBreakDuration: 5 * 60,
            longBreakDuration: 15 * 60,
            longBreakInterval: 4,
            autoStartBreaks: false,
            autoStartWork: false,
            soundEnabled: true,
            notificationsEnabled: true,
          },
          stats: {
            totalWorkTime: 0,
            averageSessionsPerDay: 0,
            bestStreak: 0,
            monthlyGoal: 60, // 60 sesiones por mes por defecto
          },
        };
        await setDoc(doc(db, "users", uid), newUser);
        // Para el store local, usamos la estructura simplificada
        currentUser.value = {
          id: uid,
          email: firebaseUser.value?.email || "",
          displayName: firebaseUser.value?.displayName || "Usuario",
          coins: 100,
          totalSessions: 0,
          currentStreak: 0,
          createdAt: new Date(),
        } as User;
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  // Registro con email y contraseña
  const register = async (
    email: string,
    password: string,
    displayName?: string
  ) => {
    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const newUser = {
        uid: result.user.uid,
        email,
        displayName: displayName || "Usuario",
        coins: 100,
        totalSessions: 0,
        currentStreak: 0,
        lastSessionDate: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        preferences: {
          workDuration: 25 * 60,
          shortBreakDuration: 5 * 60,
          longBreakDuration: 15 * 60,
          longBreakInterval: 4,
          autoStartBreaks: false,
          autoStartWork: false,
          soundEnabled: true,
          notificationsEnabled: true,
        },
        stats: {
          totalWorkTime: 0,
          averageSessionsPerDay: 0,
          bestStreak: 0,
          monthlyGoal: 60,
        },
      };
      await setDoc(doc(db, "users", result.user.uid), newUser);
      return result;
    } catch (error) {
      throw error;
    }
  };

  // Login con email y contraseña
  const login = async (email: string, password: string) => {
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw error;
    }
  };

  // Login con Google
  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      return await signInWithPopup(auth, provider);
    } catch (error) {
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      currentUser.value = null;
      firebaseUser.value = null;
    } catch (error) {
      throw error;
    }
  };

  // Restablecer contraseña
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw error;
    }
  };

  // Actualizar monedas del usuario
  const updateCoins = async (amount: number) => {
    if (currentUser.value) {
      // Actualizar store local inmediatamente para mejor UX
      currentUser.value.coins += amount;

      // Actualizar en Firestore usando operación atómica
      try {
        await updateDoc(doc(db, "users", currentUser.value.id), {
          coins: increment(amount),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        console.error("Error updating coins:", error);
        // Revertir cambio local si falla
        currentUser.value.coins -= amount;
      }
    }
  };

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
    updateCoins,
    resetPassword,
  };
});
