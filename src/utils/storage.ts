import type { GameState, TasksMap } from '../types/game';
import { sanitizeGameState } from './game';

export const STORAGE_KEYS = {
  gameState: 'couple-flight-chess.game-state',
  tasks: 'couple-flight-chess.tasks'
} as const;

const isBrowser = typeof window !== 'undefined';
const STORAGE_PREFIX = 'couple-flight-chess.';

export const saveToStorage = <T,>(key: string, value: T): boolean => {
  if (!isBrowser) {
    return false;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Failed to save ${key} to localStorage`, error);
    return false;
  }
};

export const loadFromStorage = <T,>(key: string): T | null => {
  if (!isBrowser) {
    return null;
  }

  try {
    const value = window.localStorage.getItem(key);
    if (!value) {
      return null;
    }

    return JSON.parse(value) as T;
  } catch (error) {
    console.error(`Failed to load ${key} from localStorage`, error);
    return null;
  }
};

export const saveGameState = (state: GameState): boolean =>
  saveToStorage(STORAGE_KEYS.gameState, state);

export const loadGameState = (fallback: GameState): GameState => {
  const value = loadFromStorage<unknown>(STORAGE_KEYS.gameState);
  return sanitizeGameState(value, fallback);
};

export const saveTasks = (tasks: TasksMap): boolean => saveToStorage(STORAGE_KEYS.tasks, tasks);

export const loadTasks = (fallback: TasksMap): TasksMap => {
  const value = loadFromStorage<TasksMap>(STORAGE_KEYS.tasks);
  return value ?? fallback;
};

export const clearLocalData = (): void => {
  if (!isBrowser) {
    return;
  }

  try {
    const keysToRemove: string[] = [];

    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);
      if (key?.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => {
      window.localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Failed to clear local data', error);
  }
};
