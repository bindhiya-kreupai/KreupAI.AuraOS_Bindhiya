/**
 * @module ActivityStore
 * @description Store for managing recent activity and favorites
 * @project AURA HCM Platform
 */

'use client';

import type {
  ReactNode} from 'react';
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback
} from 'react';

export interface ActivityItem {
  path: string;
  title: string;
  module: string;
  timestamp: number;
  icon?: string;
}

export interface FavoriteItem {
  path: string;
  title: string;
  module: string;
  icon?: string;
  addedAt: number;
}

interface ActivityContextType {
  recentActivity: ActivityItem[];
  favorites: FavoriteItem[];
  addActivity: (item: Omit<ActivityItem, 'timestamp'>) => void;
  clearActivity: () => void;
  addFavorite: (item: Omit<FavoriteItem, 'addedAt'>) => void;
  removeFavorite: (path: string) => void;
  isFavorite: (path: string) => boolean;
  toggleFavorite: (item: Omit<FavoriteItem, 'addedAt'>) => void;
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

const STORAGE_KEYS = {
  RECENT_ACTIVITY: 'aura_recent_activity',
  FAVORITES: 'aura_favorites',
};

const MAX_RECENT_ITEMS = 15;

export const ActivityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedActivity = localStorage.getItem(STORAGE_KEYS.RECENT_ACTIVITY);
      const storedFavorites = localStorage.getItem(STORAGE_KEYS.FAVORITES);

      if (storedActivity) {
        setRecentActivity(JSON.parse(storedActivity));
      }
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error: any) {
      console.error('Failed to load activity from localStorage:', error);
    }
    setIsHydrated(true);
  }, []);

  // Save recent activity to localStorage
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(STORAGE_KEYS.RECENT_ACTIVITY, JSON.stringify(recentActivity));
      } catch (error: any) {
        console.error('Failed to save recent activity:', error);
      }
    }
  }, [recentActivity, isHydrated]);

  // Save favorites to localStorage
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
      } catch (error: any) {
        console.error('Failed to save favorites:', error);
      }
    }
  }, [favorites, isHydrated]);

  const addActivity = useCallback((item: Omit<ActivityItem, 'timestamp'>) => {
    setRecentActivity((prev) => {
      // Remove existing entry for the same path
      const filtered = prev.filter((a) => a.path !== item.path);
      // Add new entry at the beginning
      const newActivity: ActivityItem = {
        ...item,
        timestamp: Date.now(),
      };
      // Limit to MAX_RECENT_ITEMS
      return [newActivity, ...filtered].slice(0, MAX_RECENT_ITEMS);
    });
  }, []);

  const clearActivity = useCallback(() => {
    setRecentActivity([]);
  }, []);

  const addFavorite = useCallback((item: Omit<FavoriteItem, 'addedAt'>) => {
    setFavorites((prev) => {
      // Check if already exists
      if (prev.some((f) => f.path === item.path)) {
        return prev;
      }
      const newFavorite: FavoriteItem = {
        ...item,
        addedAt: Date.now(),
      };
      return [...prev, newFavorite];
    });
  }, []);

  const removeFavorite = useCallback((path: string) => {
    setFavorites((prev) => prev.filter((f) => f.path !== path));
  }, []);

  const isFavorite = useCallback(
    (path: string) => {
      return favorites.some((f) => f.path === path);
    },
    [favorites]
  );

  const toggleFavorite = useCallback(
    (item: Omit<FavoriteItem, 'addedAt'>) => {
      if (isFavorite(item.path)) {
        removeFavorite(item.path);
      } else {
        addFavorite(item);
      }
    },
    [isFavorite, addFavorite, removeFavorite]
  );

  return (
    <ActivityContext.Provider
      value={{
        recentActivity,
        favorites,
        addActivity,
        clearActivity,
        addFavorite,
        removeFavorite,
        isFavorite,
        toggleFavorite,
      }}
    >
      {children}
    </ActivityContext.Provider>
  );
};

export const useActivity = () => {
  const context = useContext(ActivityContext);
  if (context === undefined) {
    throw new Error('useActivity must be used within an ActivityProvider');
  }
  return context;
};

export default ActivityProvider;
