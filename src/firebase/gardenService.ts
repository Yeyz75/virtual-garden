import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";
import type { UserGarden } from "../types";

// Crear un jardín inicial para un usuario
export const createUserGarden = async (userId: string): Promise<UserGarden> => {
  const gardenData: UserGarden = {
    userId,
    layout: "small",
    totalSlots: 16, // coherente con el store
    plantsCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    plants: [],
  };

  try {
    await setDoc(doc(db, "gardens", userId), {
      ...gardenData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return gardenData;
  } catch (error) {
    console.error("Error creating garden:", error);
    throw error;
  }
};

// Obtener el jardín de un usuario
export const getUserGarden = async (
  userId: string
): Promise<UserGarden | null> => {
  try {
    const gardenDoc = await getDoc(doc(db, "gardens", userId));
    if (gardenDoc.exists()) {
      const data = gardenDoc.data();
      return {
        userId: data.userId,
        layout: data.layout,
        totalSlots: data.totalSlots ?? 16,
        plantsCount: data.plantsCount ?? (data.plants ? data.plants.length : 0),
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
    }
    return null;
  } catch (error) {
    console.error("Error getting garden:", error);
    throw error;
  }
};

// Plantar una nueva planta en el jardín
export const plantInGarden = async (
  userId: string,
  plantId: string,
  position: number
): Promise<void> => {
  try {
    const gardenRef = doc(db, "gardens", userId);

    await updateDoc(gardenRef, {
      plants: arrayUnion({
        plantId,
        position,
        plantedAt: serverTimestamp(),
        level: 1,
        waterLevel: 100,
        lastWatered: serverTimestamp(),
      }),
      plantsCount: (await getDoc(gardenRef)).data()?.plantsCount + 1 || 1,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error planting in garden:", error);
    throw error;
  }
};

// Expandir el jardín (aumentar slots disponibles)
export const expandGarden = async (
  userId: string,
  newLayout: "small" | "medium" | "large"
): Promise<void> => {
  const slotsMap = {
    small: 6,
    medium: 12,
    large: 20,
  };

  try {
    await updateDoc(doc(db, "gardens", userId), {
      layout: newLayout,
      totalSlots: slotsMap[newLayout],
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error expanding garden:", error);
    throw error;
  }
};

// Regar una planta específica
export const waterPlant = async (
  userId: string,
  position: number
): Promise<void> => {
  try {
    const gardenRef = doc(db, "gardens", userId);
    const gardenDoc = await getDoc(gardenRef);

    if (gardenDoc.exists()) {
      const gardenData = gardenDoc.data() as UserGarden;
      const updatedPlants = gardenData.plants.map((plant) => {
        if (plant.position === position) {
          return {
            ...plant,
            waterLevel: Math.min((plant.waterLevel || 0) + 25, 100),
            lastWatered: new Date(),
          };
        }
        return plant;
      });

      await updateDoc(gardenRef, {
        plants: updatedPlants,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error("Error watering plant:", error);
    throw error;
  }
};
