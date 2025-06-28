export interface User {
  id: string
  email: string
  displayName?: string
  coins: number
  totalSessions: number
  currentStreak: number
  createdAt: Date
}

export interface PomodoroSession {
  id: string
  userId: string
  startTime: Date
  endTime?: Date
  duration: number
  type: 'work' | 'break'
  completed: boolean
  coinsEarned: number
}

export interface Plant {
  id: string
  name: string
  emoji: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  cost: number
  description: string
}

export interface UserGarden {
  userId: string
  plants: Array<{
    plantId: string
    position: number
    plantedAt: Date
  }>
  layout: 'small' | 'medium' | 'large'
}

export interface ShopItem {
  id: string
  name: string
  type: 'plant' | 'decoration' | 'upgrade'
  cost: number
  costType: 'coins' | 'premium'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  description: string
  emoji: string
}

export interface PomodoroSettings {
  workDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  longBreakInterval: number
  autoStartBreaks: boolean
  autoStartWork: boolean
  soundEnabled: boolean
  notificationsEnabled: boolean
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'success' | 'info' | 'warning' | 'error'
  duration?: number
}