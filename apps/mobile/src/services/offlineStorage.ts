/**
 * Offline Storage Service
 * Local storage for offline-first mobile experience
 *
 * Features:
 * - AsyncStorage-based persistence
 * - Queue for offline actions
 * - Sync status tracking
 * - Conflict resolution
 * - Data expiration
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// TYPES
// ============================================================================

export interface OfflineAction {
  id: string;
  type: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  payload?: Record<string, any>;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  status: 'pending' | 'processing' | 'failed' | 'completed';
  error?: string;
}

export interface CachedData {
  key: string;
  data: any;
  timestamp: number;
  expiresAt: number;
  version: number;
}

export interface SyncStatus {
  lastSyncAt: number | null;
  pendingActions: number;
  failedActions: number;
  isSyncing: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STORAGE_KEYS = {
  OFFLINE_QUEUE: '@offline_queue',
  CACHE_PREFIX: '@cache_',
  SYNC_STATUS: '@sync_status',
  LAST_SYNC: '@last_sync',
} as const;

const DEFAULT_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_RETRIES = 3;

// ============================================================================
// OFFLINE STORAGE SERVICE
// ============================================================================

class OfflineStorageService {
  private syncListeners: Array<(status: SyncStatus) => void> = [];

  /**
   * Initialize storage - call on app startup
   */
  async initialize(): Promise<void> {
    // Clean expired cache entries
    await this.cleanExpiredCache();
  }

  // --------------------------------------------------------------------------
  // OFFLINE ACTION QUEUE
  // --------------------------------------------------------------------------

  /**
   * Add an action to the offline queue
   */
  async enqueueAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount' | 'status' | 'maxRetries'>): Promise<string> {
    const queue = await this.getQueue();
    const newAction: OfflineAction = {
      ...action,
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: MAX_RETRIES,
      status: 'pending',
    };

    queue.push(newAction);
    await this.saveQueue(queue);
    this.notifyListeners();
    return newAction.id;
  }

  /**
   * Get all pending actions in the queue
   */
  async getQueue(): Promise<OfflineAction[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * Save the queue to storage
   */
  private async saveQueue(queue: OfflineAction[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
  }

  /**
   * Get the next pending action
   */
  async getNextPendingAction(): Promise<OfflineAction | null> {
    const queue = await this.getQueue();
    return queue.find((a) => a.status === 'pending') || null;
  }

  /**
   * Mark action as processing
   */
  async markActionProcessing(id: string): Promise<void> {
    const queue = await this.getQueue();
    const updated = queue.map((a) => a.id === id ? { ...a, status: 'processing' as const } : a);
    await this.saveQueue(updated);
  }

  /**
   * Mark action as completed and remove from queue
   */
  async markActionCompleted(id: string): Promise<void> {
    const queue = await this.getQueue();
    const updated = queue.filter((a) => a.id !== id);
    await this.saveQueue(updated);
    this.notifyListeners();
  }

  /**
   * Mark action as failed with retry logic
   */
  async markActionFailed(id: string, error: string): Promise<void> {
    const queue = await this.getQueue();
    const updated = queue.map((a) => {
      if (a.id !== id) return a;
      const newRetryCount = a.retryCount + 1;
      return {
        ...a,
        retryCount: newRetryCount,
        status: newRetryCount >= a.maxRetries ? 'failed' as const : 'pending' as const,
        error,
      };
    });
    await this.saveQueue(updated);
    this.notifyListeners();
  }

  /**
   * Remove a specific action from the queue
   */
  async removeAction(id: string): Promise<void> {
    const queue = await this.getQueue();
    await this.saveQueue(queue.filter((a) => a.id !== id));
    this.notifyListeners();
  }

  /**
   * Clear all completed/failed actions
   */
  async clearCompletedActions(): Promise<void> {
    const queue = await this.getQueue();
    await this.saveQueue(queue.filter((a) => a.status === 'pending' || a.status === 'processing'));
    this.notifyListeners();
  }

  /**
   * Clear entire queue
   */
  async clearQueue(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.OFFLINE_QUEUE);
    this.notifyListeners();
  }

  // --------------------------------------------------------------------------
  // DATA CACHE
  // --------------------------------------------------------------------------

  /**
   * Cache data with optional expiry
   */
  async cacheData(key: string, data: any, expiryMs: number = DEFAULT_EXPIRY_MS): Promise<void> {
    const cached: CachedData = {
      key,
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + expiryMs,
      version: 1,
    };
    await AsyncStorage.setItem(`${STORAGE_KEYS.CACHE_PREFIX}${key}`, JSON.stringify(cached));
  }

  /**
   * Get cached data (returns null if expired)
   */
  async getCachedData<T = any>(key: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(`${STORAGE_KEYS.CACHE_PREFIX}${key}`);
      if (!raw) return null;

      const cached: CachedData = JSON.parse(raw);
      if (Date.now() > cached.expiresAt) {
        await this.removeCachedData(key);
        return null;
      }

      return cached.data as T;
    } catch {
      return null;
    }
  }

  /**
   * Check if cache entry exists and is valid
   */
  async isCacheValid(key: string): Promise<boolean> {
    const data = await this.getCachedData(key);
    return data !== null;
  }

  /**
   * Remove cached data
   */
  async removeCachedData(key: string): Promise<void> {
    await AsyncStorage.removeItem(`${STORAGE_KEYS.CACHE_PREFIX}${key}`);
  }

  /**
   * Clean all expired cache entries
   */
  async cleanExpiredCache(): Promise<number> {
    const allKeys = await AsyncStorage.getAllKeys();
    const cacheKeys = allKeys.filter((k) => k.startsWith(STORAGE_KEYS.CACHE_PREFIX));
    let cleaned = 0;

    for (const key of cacheKeys) {
      try {
        const raw = await AsyncStorage.getItem(key);
        if (raw) {
          const cached: CachedData = JSON.parse(raw);
          if (Date.now() > cached.expiresAt) {
            await AsyncStorage.removeItem(key);
            cleaned++;
          }
        }
      } catch {
        await AsyncStorage.removeItem(key);
        cleaned++;
      }
    }

    return cleaned;
  }

  /**
   * Clear all cached data
   */
  async clearAllCache(): Promise<void> {
    const allKeys = await AsyncStorage.getAllKeys();
    const cacheKeys = allKeys.filter((k) => k.startsWith(STORAGE_KEYS.CACHE_PREFIX));
    await AsyncStorage.multiRemove(cacheKeys);
  }

  // --------------------------------------------------------------------------
  // SYNC STATUS
  // --------------------------------------------------------------------------

  /**
   * Get current sync status
   */
  async getSyncStatus(): Promise<SyncStatus> {
    const queue = await this.getQueue();
    const lastSync = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);

    return {
      lastSyncAt: lastSync ? parseInt(lastSync) : null,
      pendingActions: queue.filter((a) => a.status === 'pending').length,
      failedActions: queue.filter((a) => a.status === 'failed').length,
      isSyncing: queue.some((a) => a.status === 'processing'),
    };
  }

  /**
   * Update last sync timestamp
   */
  async updateLastSync(): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, Date.now().toString());
  }

  // --------------------------------------------------------------------------
  // LISTENERS
  // --------------------------------------------------------------------------

  /**
   * Add a sync status change listener
   */
  addSyncListener(listener: (status: SyncStatus) => void): () => void {
    this.syncListeners.push(listener);
    return () => {
      this.syncListeners = this.syncListeners.filter((l) => l !== listener);
    };
  }

  private async notifyListeners(): Promise<void> {
    const status = await this.getSyncStatus();
    this.syncListeners.forEach((listener) => listener(status));
  }

  // --------------------------------------------------------------------------
  // UTILITY
  // --------------------------------------------------------------------------

  /**
   * Get total storage usage
   */
  async getStorageInfo(): Promise<{ keys: number; queueSize: number }> {
    const allKeys = await AsyncStorage.getAllKeys();
    const queue = await this.getQueue();
    return {
      keys: allKeys.length,
      queueSize: queue.length,
    };
  }

  /**
   * Clear all offline storage data
   */
  async clearAll(): Promise<void> {
    await this.clearQueue();
    await this.clearAllCache();
    await AsyncStorage.removeItem(STORAGE_KEYS.LAST_SYNC);
  }
}

export const offlineStorage = new OfflineStorageService();
