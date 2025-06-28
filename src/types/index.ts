export interface User {
  id: string;
  email: string;
  displayName?: string;
  coins: number;
  totalSessions: number;
  currentStreak: number;
  lastSessionDate?: Date | null;
  createdAt: Date;
  updatedAt?: Date;
  preferences?: PomodoroSettings;
  stats?: {
    totalWorkTime: number;
    averageSessionsPerDay: number;
    bestStreak: number;
    monthlyGoal: number;
  };
}

export interface PomodoroSession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  type: "work" | "shortBreak" | "longBreak";
  completed: boolean;
  coinsEarned: number;
  date: string; // YYYY-MM-DD format for efficient queries
  deviceType?: "web" | "mobile" | "desktop";
}

export interface Plant {
  id: string;
  name: string;
  emoji: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  baseCost: number;
  description: string;
  category: "flowers" | "trees" | "herbs" | "fruits";
  requirements?: {
    minSessions: number;
    minStreak: number;
  };
  growth?: {
    stages: number;
    timePerStage: number;
  };
  effects?: {
    coinBonus: number;
    xpBonus: number;
  };
}

export interface UserGarden {
  userId: string;
  layout: "small" | "medium" | "large";
  totalSlots: number;
  plantsCount: number;
  createdAt: Date;
  updatedAt: Date;
  plants: Array<{
    plantId: string;
    position: number;
    plantedAt: Date;
    level?: number;
    waterLevel?: number;
    lastWatered?: Date;
  }>;
}

export interface ShopItem {
  id: string;
  name: string;
  type: "plant" | "decoration" | "upgrade" | "powerup";
  cost: number;
  costType: "coins" | "premium" | "gems";
  rarity: "common" | "rare" | "epic" | "legendary";
  description: string;
  emoji: string;
  available: boolean;
  featured?: boolean;
  seasonalItem?: boolean;
  validUntil?: Date;
}

export interface PomodoroSettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
  autoStartBreaks: boolean;
  autoStartWork: boolean;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "success" | "info" | "warning" | "error";
  duration?: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: "sessions" | "streak" | "coins" | "time" | "special";
  requirement: number;
  reward: {
    coins?: number;
    title?: string;
    badge?: string;
  };
  category: "productivity" | "consistency" | "milestone" | "seasonal";
}

export interface UserAchievement {
  achievementId: string;
  unlockedAt: Date;
  progress: number;
  completed: boolean;
  notified: boolean;
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  score: number;
  position: number;
  streak?: number;
  totalSessions?: number;
}

export interface Leaderboard {
  period: "daily" | "weekly" | "monthly" | "allTime";
  date: string;
  rankings: LeaderboardEntry[];
  lastUpdated: Date;
}
