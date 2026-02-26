/**
 * @module offlineService
 * @description Mobile offline sync service — IndexedDB/localStorage caching,
 *              action queue, conflict resolution, storage management (Sec 15.6)
 * @project AURA HCM Platform
 */

// ============================================================================
// TYPES
// ============================================================================

export type ConflictResolution = 'server-wins' | 'client-wins' | 'manual-merge';
export type SyncStatus = 'pending' | 'syncing' | 'success' | 'failed' | 'conflict';
export type ActionType =
  | 'leave_request'
  | 'expense_submit'
  | 'timesheet_update'
  | 'profile_update'
  | 'attendance_punch'
  | 'survey_response'
  | 'task_complete'
  | 'form_submit';

export interface QueuedAction {
  id: string;
  type: ActionType;
  payload: Record<string, unknown>;
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  status: SyncStatus;
  retryCount: number;
  maxRetries: number;
  createdAt: string;
  lastAttempt?: string;
  errorMessage?: string;
  conflictData?: {
    serverValue: Record<string, unknown>;
    clientValue: Record<string, unknown>;
  };
}

export interface SyncHistoryEntry {
  id: string;
  actionId: string;
  actionType: ActionType;
  status: SyncStatus;
  timestamp: string;
  duration: number;
  itemsSynced: number;
}

export interface OfflineStatus {
  isOnline: boolean;
  pendingCount: number;
  lastSynced: string | null;
  failedCount: number;
  conflictCount: number;
}

export interface StorageUsage {
  used: number; // bytes
  quota: number; // bytes
  cacheEntries: number;
  actionQueueSize: number;
  oldestCacheEntry: string | null;
}

export interface CacheEntry {
  key: string;
  data: unknown;
  timestamp: string;
  expiresAt?: string;
  size: number; // estimated bytes
}

export interface AutoSyncSettings {
  enabled: boolean;
  wifiOnly: boolean;
  intervalMinutes: number;
  maxQueueSize: number;
}

// ============================================================================
// INTERNAL STORE (localStorage-backed simulation)
// ============================================================================

const STORAGE_PREFIX = 'aura_offline_';
const ACTION_QUEUE_KEY = STORAGE_PREFIX + 'queue';
const SYNC_HISTORY_KEY = STORAGE_PREFIX + 'history';
const CACHE_META_KEY = STORAGE_PREFIX + 'cache_meta';
const SETTINGS_KEY = STORAGE_PREFIX + 'settings';

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeWrite(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage quota exceeded — silently fail
  }
}

// Seed the queue with some mock pending actions for demo purposes
function getInitialQueue(): QueuedAction[] {
  const existing = safeRead<QueuedAction[]>(ACTION_QUEUE_KEY, []);
  if (existing.length > 0) return existing;

  const MOCK_QUEUE: QueuedAction[] = [
    {
      id: 'action-001',
      type: 'leave_request',
      payload: {
        type: 'annual',
        startDate: '2026-03-10',
        endDate: '2026-03-14',
        reason: 'Family vacation',
      },
      endpoint: '/api/v1/leave/requests',
      method: 'POST',
      status: 'pending',
      retryCount: 0,
      maxRetries: 3,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'action-002',
      type: 'attendance_punch',
      payload: {
        type: 'clock_in',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        location: { lat: 12.9716, lng: 77.5946 },
      },
      endpoint: '/api/v1/attendance/punch',
      method: 'POST',
      status: 'failed',
      retryCount: 2,
      maxRetries: 3,
      createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
      lastAttempt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      errorMessage: 'Network timeout',
    },
    {
      id: 'action-003',
      type: 'expense_submit',
      payload: {
        title: 'Client lunch',
        amount: 85.5,
        currency: 'USD',
        category: 'meals',
        date: '2026-02-24',
      },
      endpoint: '/api/v1/expenses',
      method: 'POST',
      status: 'conflict',
      retryCount: 1,
      maxRetries: 3,
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      conflictData: {
        serverValue: {
          title: 'Client Lunch',
          amount: 85.5,
          status: 'draft',
          updatedAt: '2026-02-24T14:30:00Z',
        },
        clientValue: {
          title: 'Client lunch',
          amount: 95.0,
          status: 'draft',
          updatedAt: '2026-02-24T15:00:00Z',
        },
      },
    },
    {
      id: 'action-004',
      type: 'survey_response',
      payload: { surveyId: 'survey-001', answers: [{ questionId: 'q1', value: 8 }] },
      endpoint: '/api/v1/surveys/survey-001/responses',
      method: 'POST',
      status: 'pending',
      retryCount: 0,
      maxRetries: 3,
      createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    },
  ];
  safeWrite(ACTION_QUEUE_KEY, MOCK_QUEUE);
  return MOCK_QUEUE;
}

function getQueue(): QueuedAction[] {
  return safeRead<QueuedAction[]>(ACTION_QUEUE_KEY, getInitialQueue());
}

function saveQueue(queue: QueuedAction[]): void {
  safeWrite(ACTION_QUEUE_KEY, queue);
}

// ============================================================================
// SERVICE CLASS
// ============================================================================

export class OfflineService {
  private static _onlineListeners: ((online: boolean) => void)[] = [];
  private static _syncing = false;

  /**
   * Save data to offline cache
   */
  static saveOffline<T>(key: string, data: T, ttlMs?: number): void {
    const cacheKey = STORAGE_PREFIX + 'cache_' + key;
    const entry: CacheEntry = {
      key,
      data,
      timestamp: new Date().toISOString(),
      expiresAt: ttlMs ? new Date(Date.now() + ttlMs).toISOString() : undefined,
      size: JSON.stringify(data).length,
    };
    safeWrite(cacheKey, entry);

    // Update meta
    const meta = safeRead<Record<string, string>>(CACHE_META_KEY, {});
    meta[key] = new Date().toISOString();
    safeWrite(CACHE_META_KEY, meta);
  }

  /**
   * Retrieve data from offline cache
   */
  static getOffline<T>(key: string): T | null {
    const cacheKey = STORAGE_PREFIX + 'cache_' + key;
    const entry = safeRead<CacheEntry | null>(cacheKey, null);
    if (!entry) return null;
    if (entry.expiresAt && new Date(entry.expiresAt) < new Date()) {
      localStorage.removeItem(cacheKey);
      return null;
    }
    return entry.data as T;
  }

  /**
   * Queue a write operation for later sync
   */
  static queueAction(
    action: Omit<QueuedAction, 'id' | 'status' | 'retryCount' | 'createdAt'>
  ): QueuedAction {
    const newAction: QueuedAction = {
      ...action,
      id: `action-${Date.now()}`,
      status: 'pending',
      retryCount: 0,
      createdAt: new Date().toISOString(),
    };
    const queue = getQueue();
    queue.push(newAction);
    saveQueue(queue);
    return newAction;
  }

  /**
   * Sync all pending actions when online
   */
  static async syncPending(): Promise<{ synced: number; failed: number; conflicts: number }> {
    if (this._syncing) return { synced: 0, failed: 0, conflicts: 0 };
    this._syncing = true;

    const queue = getQueue();
    let synced = 0;
    let failed = 0;
    let conflicts = 0;

    for (const action of queue) {
      if (action.status !== 'pending' && action.status !== 'failed') continue;
      if (action.retryCount >= action.maxRetries) continue;

      action.status = 'syncing';
      action.lastAttempt = new Date().toISOString();

      // Simulate network call
      await new Promise((r) => setTimeout(r, 200 + Math.random() * 300));

      // Simulate outcomes: 70% success, 20% fail, 10% conflict
      const rand = Math.random();
      if (rand < 0.7) {
        action.status = 'success';
        synced++;
      } else if (rand < 0.9) {
        action.status = 'failed';
        action.retryCount++;
        action.errorMessage = 'Network error: request timed out';
        failed++;
      } else {
        action.status = 'conflict';
        action.conflictData = {
          serverValue: { ...action.payload, updatedAt: new Date().toISOString(), version: 2 },
          clientValue: { ...action.payload },
        };
        conflicts++;
      }
    }

    const pending = queue.filter((a) => a.status !== 'success');
    saveQueue(pending);

    // Add to sync history
    const history = safeRead<SyncHistoryEntry[]>(SYNC_HISTORY_KEY, []);
    history.unshift({
      id: `sync-${Date.now()}`,
      actionId: 'batch',
      actionType: 'form_submit',
      status: failed > 0 ? 'failed' : 'success',
      timestamp: new Date().toISOString(),
      duration: (synced + failed + conflicts) * 250,
      itemsSynced: synced,
    });
    safeWrite(SYNC_HISTORY_KEY, history.slice(0, 50));
    safeWrite(STORAGE_PREFIX + 'last_synced', new Date().toISOString());

    this._syncing = false;
    return { synced, failed, conflicts };
  }

  /**
   * Get current online/offline status summary
   */
  static getOfflineStatus(): OfflineStatus {
    const queue = getQueue();
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    return {
      isOnline,
      pendingCount: queue.filter((a) => a.status === 'pending').length,
      lastSynced: safeRead<string | null>(STORAGE_PREFIX + 'last_synced', null),
      failedCount: queue.filter((a) => a.status === 'failed').length,
      conflictCount: queue.filter((a) => a.status === 'conflict').length,
    };
  }

  /**
   * Get the current sync queue
   */
  static getSyncQueue(): QueuedAction[] {
    return getQueue();
  }

  /**
   * Clear cache entries older than given date
   */
  static clearCache(olderThan?: Date): number {
    if (typeof window === 'undefined') return 0;
    const meta = safeRead<Record<string, string>>(CACHE_META_KEY, {});
    let cleared = 0;
    for (const [key, timestamp] of Object.entries(meta)) {
      const entryDate = new Date(timestamp);
      if (!olderThan || entryDate < olderThan) {
        localStorage.removeItem(STORAGE_PREFIX + 'cache_' + key);
        delete meta[key];
        cleared++;
      }
    }
    safeWrite(CACHE_META_KEY, meta);
    return cleared;
  }

  /**
   * Get current storage usage estimate
   */
  static getStorageUsage(): StorageUsage {
    const meta = safeRead<Record<string, string>>(CACHE_META_KEY, {});
    const queue = getQueue();
    let totalSize = 0;

    if (typeof window !== 'undefined') {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(STORAGE_PREFIX)) {
          totalSize += (localStorage.getItem(key)?.length ?? 0) * 2; // UTF-16 estimate
        }
      }
    }

    const timestamps = Object.values(meta).sort();
    return {
      used: totalSize,
      quota: 5 * 1024 * 1024, // 5MB localStorage typical limit
      cacheEntries: Object.keys(meta).length,
      actionQueueSize: queue.length,
      oldestCacheEntry: timestamps[0] ?? null,
    };
  }

  /**
   * Retry a specific failed action
   */
  static retryAction(actionId: string): void {
    const queue = getQueue();
    const action = queue.find((a) => a.id === actionId);
    if (action && action.status === 'failed') {
      action.status = 'pending';
      action.errorMessage = undefined;
    }
    saveQueue(queue);
  }

  /**
   * Discard a queued action
   */
  static discardAction(actionId: string): void {
    const queue = getQueue().filter((a) => a.id !== actionId);
    saveQueue(queue);
  }

  /**
   * Resolve a conflict
   */
  static resolveConflict(
    actionId: string,
    resolution: ConflictResolution,
    manualData?: Record<string, unknown>
  ): void {
    const queue = getQueue();
    const action = queue.find((a) => a.id === actionId);
    if (!action || action.status !== 'conflict') return;

    if (resolution === 'client-wins') {
      action.status = 'pending';
      action.conflictData = undefined;
    } else if (resolution === 'server-wins') {
      queue.splice(queue.indexOf(action), 1);
    } else if (resolution === 'manual-merge' && manualData) {
      action.payload = manualData;
      action.status = 'pending';
      action.conflictData = undefined;
    }
    saveQueue(queue);
  }

  /**
   * Get sync history
   */
  static getSyncHistory(): SyncHistoryEntry[] {
    return safeRead<SyncHistoryEntry[]>(SYNC_HISTORY_KEY, []);
  }

  /**
   * Get/set auto-sync settings
   */
  static getAutoSyncSettings(): AutoSyncSettings {
    return safeRead<AutoSyncSettings>(SETTINGS_KEY, {
      enabled: true,
      wifiOnly: false,
      intervalMinutes: 15,
      maxQueueSize: 100,
    });
  }

  static setAutoSyncSettings(settings: Partial<AutoSyncSettings>): void {
    const current = this.getAutoSyncSettings();
    safeWrite(SETTINGS_KEY, { ...current, ...settings });
  }

  /**
   * Subscribe to online/offline changes
   */
  static onConnectionChange(listener: (online: boolean) => void): () => void {
    this._onlineListeners.push(listener);
    if (typeof window !== 'undefined') {
      const handleOnline = () => listener(true);
      const handleOffline = () => listener(false);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        this._onlineListeners = this._onlineListeners.filter((l) => l !== listener);
      };
    }
    return () => {};
  }

  /**
   * Format bytes for display
   */
  static formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  /**
   * Get action type label
   */
  static getActionTypeLabel(type: ActionType): string {
    const labels: Record<ActionType, string> = {
      leave_request: 'Leave Request',
      expense_submit: 'Expense Submission',
      timesheet_update: 'Timesheet Update',
      profile_update: 'Profile Update',
      attendance_punch: 'Attendance Punch',
      survey_response: 'Survey Response',
      task_complete: 'Task Completion',
      form_submit: 'Form Submission',
    };
    return labels[type] ?? type;
  }
}
