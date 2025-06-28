import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuthStore } from "./auth";
import type { Plant, UserGarden } from "../types";

export const useGardenStore = defineStore("garden", () => {
  const authStore = useAuthStore();

  const userGarden = ref<UserGarden | null>(null);
  const availablePlants = ref<Plant[]>([
    {
      id: "sunflower",
      name: "Girasol",
      emoji: "🌻",
      rarity: "common",
      baseCost: 20,
      description: "Una hermosa flor que sigue al sol",
      category: "flowers",
      requirements: { minSessions: 0, minStreak: 0 },
      growth: { stages: 3, timePerStage: 60 },
      effects: { coinBonus: 1, xpBonus: 1 },
    },
    {
      id: "rose",
      name: "Rosa",
      emoji: "🌹",
      rarity: "common",
      baseCost: 25,
      description: "Símbolo de amor y pasión",
      category: "flowers",
      requirements: { minSessions: 2, minStreak: 0 },
      growth: { stages: 3, timePerStage: 90 },
      effects: { coinBonus: 2, xpBonus: 1 },
    },
    {
      id: "cactus",
      name: "Cactus",
      emoji: "🌵",
      rarity: "rare",
      baseCost: 40,
      description: "Resistente y único",
      category: "herbs",
      requirements: { minSessions: 5, minStreak: 2 },
      growth: { stages: 4, timePerStage: 120 },
      effects: { coinBonus: 3, xpBonus: 2 },
    },
    {
      id: "cherry-blossom",
      name: "Cerezo",
      emoji: "🌸",
      rarity: "rare",
      baseCost: 50,
      description: "Belleza efímera japonesa",
      category: "trees",
      requirements: { minSessions: 10, minStreak: 3 },
      growth: { stages: 4, timePerStage: 150 },
      effects: { coinBonus: 4, xpBonus: 3 },
    },
    {
      id: "bamboo",
      name: "Bambú",
      emoji: "🎋",
      rarity: "epic",
      baseCost: 80,
      description: "Símbolo de flexibilidad y fuerza",
      category: "trees",
      requirements: { minSessions: 15, minStreak: 5 },
      growth: { stages: 5, timePerStage: 180 },
      effects: { coinBonus: 6, xpBonus: 4 },
    },
    {
      id: "dragon-fruit",
      name: "Pitaya",
      emoji: "🐉",
      rarity: "legendary",
      baseCost: 150,
      description: "Fruta del dragón legendaria",
      category: "fruits",
      requirements: { minSessions: 25, minStreak: 10 },
      growth: { stages: 6, timePerStage: 240 },
      effects: { coinBonus: 10, xpBonus: 8 },
    },
  ]);

  const gardenSize = computed(() => {
    if (!userGarden.value) return 16;
    switch (userGarden.value.layout) {
      case "small":
        return 16;
      case "medium":
        return 25;
      case "large":
        return 36;
      default:
        return 16;
    }
  });

  const occupiedSlots = computed(() => {
    return userGarden.value?.plants.map((p) => p.position) || [];
  });

  const totalPlants = computed(() => {
    return userGarden.value?.plants.length || 0;
  });

  const loadUserGarden = async () => {
    if (!authStore.currentUser) return;
    try {
      const gardenDoc = await getDoc(
        doc(db, "gardens", authStore.currentUser.id)
      );
      if (gardenDoc.exists()) {
        const data = gardenDoc.data();
        userGarden.value = {
          userId: data.userId,
          layout: data.layout,
          totalSlots: data.totalSlots ?? 16,
          plantsCount:
            data.plantsCount ?? (data.plants ? data.plants.length : 0),
          createdAt: data.createdAt?.toDate
            ? data.createdAt.toDate()
            : new Date(),
          updatedAt: data.updatedAt?.toDate
            ? data.updatedAt.toDate()
            : new Date(),
          plants: (data.plants || []).map((p: any) => ({
            ...p,
            plantedAt: p.plantedAt?.toDate ? p.plantedAt.toDate() : new Date(),
            lastWatered: p.lastWatered?.toDate
              ? p.lastWatered.toDate()
              : undefined,
          })),
        };
      } else {
        // Crear jardín inicial
        const newGarden: UserGarden = {
          userId: authStore.currentUser.id,
          plants: [],
          layout: "small",
          totalSlots: 16,
          plantsCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await setDoc(doc(db, "gardens", authStore.currentUser.id), newGarden);
        userGarden.value = newGarden;
      }
    } catch (error) {
      console.error("Error loading garden:", error);
    }
  };

  const plantInGarden = async (plantId: string, position: number) => {
    if (!authStore.currentUser || !userGarden.value) return false;
    const plant = availablePlants.value.find((p) => p.id === plantId);
    if (!plant) return false;
    // Verificar si el usuario tiene suficientes monedas
    if (authStore.currentUser.coins < plant.baseCost) return false;
    // Verificar si la posición está disponible
    if (occupiedSlots.value.includes(position)) return false;
    try {
      // Agregar planta al jardín
      userGarden.value.plants.push({
        plantId,
        position,
        plantedAt: new Date(),
        level: 1,
        waterLevel: 100,
        lastWatered: new Date(),
      });
      // Actualizar en Firestore
      await updateDoc(doc(db, "gardens", authStore.currentUser.id), {
        plants: userGarden.value.plants,
      });
      // Descontar monedas
      await authStore.updateCoins(-plant.baseCost);
      return true;
    } catch (error) {
      console.error("Error planting:", error);
      return false;
    }
  };

  const upgradeGarden = async (newLayout: "small" | "medium" | "large") => {
    if (!authStore.currentUser || !userGarden.value) return false;

    const costs = { small: 0, medium: 100, large: 200 };
    const cost = costs[newLayout];

    if (authStore.currentUser.coins < cost) return false;

    try {
      userGarden.value.layout = newLayout;
      await updateDoc(doc(db, "gardens", authStore.currentUser.id), {
        layout: newLayout,
      });

      if (cost > 0) {
        await authStore.updateCoins(-cost);
      }

      return true;
    } catch (error) {
      console.error("Error upgrading garden:", error);
      return false;
    }
  };

  const getPlantAtPosition = (position: number) => {
    const gardenPlant = userGarden.value?.plants.find(
      (p) => p.position === position
    );
    if (!gardenPlant) return null;

    const plantData = availablePlants.value.find(
      (p) => p.id === gardenPlant.plantId
    );
    return { ...gardenPlant, ...plantData };
  };

  return {
    userGarden,
    availablePlants,
    gardenSize,
    occupiedSlots,
    totalPlants,
    loadUserGarden,
    plantInGarden,
    upgradeGarden,
    getPlantAtPosition,
  };
});
