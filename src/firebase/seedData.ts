import { collection, doc, writeBatch, getDocs } from "firebase/firestore";
import { db } from "./config";

// Datos iniciales para la colección de plantas
export const initialPlants = [
  {
    id: "sunflower",
    name: "Girasol",
    emoji: "🌻",
    rarity: "common" as const,
    baseCost: 50,
    description:
      "Una hermosa flor que siempre mira hacia el sol. Perfecta para comenzar tu jardín.",
    category: "flowers" as const,
    requirements: {
      minSessions: 0,
      minStreak: 0,
    },
    growth: {
      stages: 3,
      timePerStage: 24,
    },
    effects: {
      coinBonus: 5,
      xpBonus: 0,
    },
  },
  {
    id: "rose",
    name: "Rosa",
    emoji: "🌹",
    rarity: "common" as const,
    baseCost: 75,
    description:
      "Una rosa clásica que simboliza la dedicación y el trabajo constante.",
    category: "flowers" as const,
    requirements: {
      minSessions: 5,
      minStreak: 2,
    },
    growth: {
      stages: 4,
      timePerStage: 36,
    },
    effects: {
      coinBonus: 8,
      xpBonus: 5,
    },
  },
  {
    id: "tulip",
    name: "Tulipán",
    emoji: "🌷",
    rarity: "common" as const,
    baseCost: 60,
    description: "Un tulipán elegante que florece con la constancia.",
    category: "flowers" as const,
    requirements: {
      minSessions: 3,
      minStreak: 1,
    },
    growth: {
      stages: 3,
      timePerStage: 30,
    },
    effects: {
      coinBonus: 6,
      xpBonus: 2,
    },
  },
  {
    id: "cactus",
    name: "Cactus",
    emoji: "🌵",
    rarity: "rare" as const,
    baseCost: 120,
    description: "Resistente y duradero, como tu disciplina en el trabajo.",
    category: "trees" as const,
    requirements: {
      minSessions: 10,
      minStreak: 3,
    },
    growth: {
      stages: 5,
      timePerStage: 48,
    },
    effects: {
      coinBonus: 15,
      xpBonus: 10,
    },
  },
  {
    id: "cherry_tree",
    name: "Cerezo",
    emoji: "🌸",
    rarity: "epic" as const,
    baseCost: 200,
    description:
      "Un hermoso cerezo en flor que representa la belleza del esfuerzo sostenido.",
    category: "trees" as const,
    requirements: {
      minSessions: 25,
      minStreak: 7,
    },
    growth: {
      stages: 6,
      timePerStage: 72,
    },
    effects: {
      coinBonus: 25,
      xpBonus: 20,
    },
  },
  {
    id: "bamboo",
    name: "Bambú",
    emoji: "🎋",
    rarity: "rare" as const,
    baseCost: 150,
    description: "Crece rápido y fuerte, simbolizando el progreso constante.",
    category: "trees" as const,
    requirements: {
      minSessions: 15,
      minStreak: 5,
    },
    growth: {
      stages: 4,
      timePerStage: 24,
    },
    effects: {
      coinBonus: 20,
      xpBonus: 15,
    },
  },
  {
    id: "herbs",
    name: "Hierbas",
    emoji: "🌿",
    rarity: "common" as const,
    baseCost: 40,
    description:
      "Hierbas aromáticas que representan la frescura de nuevos comienzos.",
    category: "herbs" as const,
    requirements: {
      minSessions: 2,
      minStreak: 1,
    },
    growth: {
      stages: 2,
      timePerStage: 12,
    },
    effects: {
      coinBonus: 3,
      xpBonus: 1,
    },
  },
  {
    id: "golden_flower",
    name: "Flor Dorada",
    emoji: "🌼",
    rarity: "legendary" as const,
    baseCost: 500,
    description: "Una flor mítica que solo florece para los más dedicados.",
    category: "flowers" as const,
    requirements: {
      minSessions: 100,
      minStreak: 20,
    },
    growth: {
      stages: 8,
      timePerStage: 120,
    },
    effects: {
      coinBonus: 50,
      xpBonus: 40,
    },
  },
];

// Items iniciales para la tienda
export const initialShopItems = [
  {
    id: "garden_expansion_medium",
    name: "Expansión de Jardín (Mediano)",
    type: "upgrade" as const,
    cost: 300,
    costType: "coins" as const,
    rarity: "common" as const,
    description: "Expande tu jardín para tener más espacio para plantas.",
    emoji: "🏡",
    available: true,
    featured: false,
    seasonalItem: false,
  },
  {
    id: "garden_expansion_large",
    name: "Expansión de Jardín (Grande)",
    type: "upgrade" as const,
    cost: 800,
    costType: "coins" as const,
    rarity: "rare" as const,
    description: "La expansión máxima para tu jardín virtual.",
    emoji: "🏰",
    available: true,
    featured: true,
    seasonalItem: false,
  },
  {
    id: "productivity_boost",
    name: "Impulso de Productividad",
    type: "powerup" as const,
    cost: 100,
    costType: "coins" as const,
    rarity: "common" as const,
    description: "Duplica las monedas ganadas en las próximas 3 sesiones.",
    emoji: "⚡",
    available: true,
    featured: false,
    seasonalItem: false,
  },
  {
    id: "auto_water",
    name: "Sistema de Riego Automático",
    type: "upgrade" as const,
    cost: 250,
    costType: "coins" as const,
    rarity: "rare" as const,
    description: "Riega automáticamente tus plantas cada día.",
    emoji: "💧",
    available: true,
    featured: false,
    seasonalItem: false,
  },
];

// Función para inicializar la base de datos con datos semilla
export const seedDatabase = async () => {
  try {
    const batch = writeBatch(db);

    // Agregar plantas a la colección
    initialPlants.forEach((plant) => {
      const plantRef = doc(db, "plants", plant.id);
      batch.set(plantRef, plant);
    });

    // Agregar items de tienda
    initialShopItems.forEach((item) => {
      const itemRef = doc(db, "shop", item.id);
      batch.set(itemRef, item);
    });

    await batch.commit();
    console.log("Base de datos inicializada con datos semilla");
  } catch (error) {
    console.error("Error al inicializar la base de datos:", error);
  }
};

// Función para verificar si la base de datos ya está inicializada
export const isDatabaseSeeded = async (): Promise<boolean> => {
  try {
    const plantsCollection = collection(db, "plants");
    const snapshot = await getDocs(plantsCollection);
    return !snapshot.empty;
  } catch (error) {
    console.error("Error verificando estado de la base de datos:", error);
    return false;
  }
};
