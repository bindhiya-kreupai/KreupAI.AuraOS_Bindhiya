import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PendingAction = {
  id: string;
  type: string;
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  payload: unknown;
  createdAt: string;
  retryCount: number;
};

type OfflineState = {
  isOnline: boolean;
  pendingActions: PendingAction[];
  lastSyncAt: string | null;
  isSyncing: boolean;
  setOnline: (online: boolean) => void;
  addPendingAction: (action: Omit<PendingAction, 'id' | 'createdAt' | 'retryCount'>) => void;
  removePendingAction: (id: string) => void;
  incrementRetry: (id: string) => void;
  clearPendingActions: () => void;
  setSyncing: (syncing: boolean) => void;
  setLastSync: (date: string) => void;
};

export const useOfflineStore = create<OfflineState>()(
  persist(
    (set) => ({
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      pendingActions: [],
      lastSyncAt: null,
      isSyncing: false,
      setOnline: (isOnline) => set({ isOnline }),
      addPendingAction: (action) =>
        set((state) => ({
          pendingActions: [
            ...state.pendingActions,
            { ...action, id: crypto.randomUUID(), createdAt: new Date().toISOString(), retryCount: 0 },
          ],
        })),
      removePendingAction: (id) =>
        set((state) => ({
          pendingActions: state.pendingActions.filter((a) => a.id !== id),
        })),
      incrementRetry: (id) =>
        set((state) => ({
          pendingActions: state.pendingActions.map((a) =>
            a.id === id ? { ...a, retryCount: a.retryCount + 1 } : a
          ),
        })),
      clearPendingActions: () => set({ pendingActions: [] }),
      setSyncing: (isSyncing) => set({ isSyncing }),
      setLastSync: (date) => set({ lastSyncAt: date }),
    }),
    { name: 'aura-offline-store' }
  )
);
