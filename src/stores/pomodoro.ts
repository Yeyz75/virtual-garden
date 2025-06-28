import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
  doc,
  collection,
  increment,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuthStore } from "./auth";
import { useNotificationStore } from "./notifications";
import type { PomodoroSession, PomodoroSettings } from "../types";

export const usePomodoroStore = defineStore("pomodoro", () => {
  const authStore = useAuthStore();
  const notificationStore = useNotificationStore();

  const isRunning = ref(false);
  const isPaused = ref(false);
  const currentTime = ref(25 * 60); // 25 minutos por defecto
  const currentMode = ref<"work" | "break">("work");
  const sessionCount = ref(0);
  const currentSession = ref<PomodoroSession | null>(null);

  const settings = ref<PomodoroSettings>({
    workDuration: 25 * 60,
    shortBreakDuration: 5 * 60,
    longBreakDuration: 15 * 60,
    longBreakInterval: 4,
    autoStartBreaks: false,
    autoStartWork: false,
    soundEnabled: true,
    notificationsEnabled: true,
  });

  let interval: NodeJS.Timeout | null = null;

  const formattedTime = computed(() => {
    const minutes = Math.floor(currentTime.value / 60);
    const seconds = currentTime.value % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  });

  const progress = computed(() => {
    const totalTime =
      currentMode.value === "work"
        ? settings.value.workDuration
        : settings.value.shortBreakDuration;
    return ((totalTime - currentTime.value) / totalTime) * 100;
  });

  const startTimer = () => {
    if (!isRunning.value && !isPaused.value) {
      // Nueva sesión
      currentSession.value = {
        id: Date.now().toString(),
        userId: authStore.currentUser?.id || "",
        startTime: new Date(),
        duration:
          currentMode.value === "work"
            ? settings.value.workDuration
            : settings.value.shortBreakDuration,
        type: currentMode.value === "work" ? "work" : "shortBreak",
        completed: false,
        coinsEarned: 0,
        date: new Date().toISOString().split("T")[0],
      };
    }

    isRunning.value = true;
    isPaused.value = false;

    interval = setInterval(() => {
      if (currentTime.value > 0) {
        currentTime.value--;
      } else {
        completeSession();
      }
    }, 1000);
  };

  const pauseTimer = () => {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
    isRunning.value = false;
    isPaused.value = true;
  };

  const resetTimer = () => {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
    isRunning.value = false;
    isPaused.value = false;
    currentTime.value =
      currentMode.value === "work"
        ? settings.value.workDuration
        : settings.value.shortBreakDuration;
    currentSession.value = null;
  };

  const completeSession = async () => {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }

    isRunning.value = false;
    isPaused.value = false;

    if (currentSession.value && authStore.currentUser) {
      // Marcar sesión como completada
      currentSession.value.completed = true;
      currentSession.value.endTime = new Date();

      // Calcular monedas ganadas
      let coinsEarned = 0;
      if (currentMode.value === "work") {
        coinsEarned = 10 + Math.floor(Math.random() * 5); // 10-14 monedas por sesión de trabajo
        sessionCount.value++;
      }

      currentSession.value.coinsEarned = coinsEarned;

      // Guardar en Firestore usando batching y estructura recomendada
      try {
        const batch = writeBatch(db);
        const userId = authStore.currentUser.id;

        // Guardar sesión como subcolección del usuario
        const sessionData = {
          startTime: serverTimestamp(),
          endTime: serverTimestamp(),
          duration: currentSession.value.duration,
          type: currentSession.value.type,
          completed: true,
          coinsEarned: coinsEarned,
          date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
        };

        const sessionRef = doc(collection(db, "users", userId, "sessions"));
        batch.set(sessionRef, sessionData);

        // Actualizar datos del usuario
        if (currentMode.value === "work") {
          const userRef = doc(db, "users", userId);
          batch.update(userRef, {
            coins: increment(coinsEarned),
            totalSessions: increment(1),
            lastSessionDate: serverTimestamp(),
            "stats.totalWorkTime": increment(currentSession.value.duration),
            updatedAt: serverTimestamp(),
          });

          // Actualizar store local
          authStore.updateCoins(coinsEarned);
        }

        await batch.commit();
        console.log("Session saved successfully");
      } catch (error) {
        console.error("Error saving session:", error);
      }

      // Mostrar notificación
      if (settings.value.notificationsEnabled) {
        if (currentMode.value === "work") {
          notificationStore.addNotification({
            title: "¡Sesión de trabajo completada!",
            message: `Ganaste ${coinsEarned} monedas. ¡Tiempo de descanso!`,
            type: "success",
          });

          // Solicitar permiso para notificaciones del navegador
          if (Notification.permission === "granted") {
            new Notification("¡Sesión completada!", {
              body: `Ganaste ${coinsEarned} monedas. ¡Tiempo de descanso!`,
              icon: "/vite.svg",
            });
          }
        } else {
          notificationStore.addNotification({
            title: "Descanso terminado",
            message: "¡Es hora de volver al trabajo!",
            type: "info",
          });
        }
      }

      // Cambiar modo
      if (currentMode.value === "work") {
        currentMode.value = "break";
        currentTime.value =
          sessionCount.value % settings.value.longBreakInterval === 0
            ? settings.value.longBreakDuration
            : settings.value.shortBreakDuration;
      } else {
        currentMode.value = "work";
        currentTime.value = settings.value.workDuration;
      }

      // Auto-start si está habilitado
      if (
        (currentMode.value === "break" && settings.value.autoStartBreaks) ||
        (currentMode.value === "work" && settings.value.autoStartWork)
      ) {
        setTimeout(() => startTimer(), 2000);
      }
    }
  };

  const updateSettings = (newSettings: Partial<PomodoroSettings>) => {
    settings.value = { ...settings.value, ...newSettings };

    // Actualizar tiempo actual si no está corriendo
    if (!isRunning.value) {
      currentTime.value =
        currentMode.value === "work"
          ? settings.value.workDuration
          : settings.value.shortBreakDuration;
    }
  };

  const requestNotificationPermission = async () => {
    if ("Notification" in window && Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }
    return Notification.permission === "granted";
  };

  return {
    isRunning,
    isPaused,
    currentTime,
    currentMode,
    sessionCount,
    settings,
    formattedTime,
    progress,
    startTimer,
    pauseTimer,
    resetTimer,
    updateSettings,
    requestNotificationPermission,
  };
});
