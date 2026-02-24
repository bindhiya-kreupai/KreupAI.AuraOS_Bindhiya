/**
 * Offline Sync Component
 * Manages offline queue processing and sync status display
 *
 * Features:
 * - Automatic sync when connection is restored
 * - Visual sync status indicator
 * - Queue management UI
 * - Retry failed actions
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  AppState,
} from 'react-native';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { Ionicons } from '@expo/vector-icons';

import { useThemeStore } from '@/stores/theme.store';
import { offlineStorage, OfflineAction, SyncStatus } from '@/services/offlineStorage';
import { apiService } from '@/services/api.service';

interface OfflineSyncProps {
  showStatusBar?: boolean;
  showQueue?: boolean;
}

export function OfflineSync({ showStatusBar = true, showQueue = false }: OfflineSyncProps) {
  const { theme } = useThemeStore();
  const [isOnline, setIsOnline] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    lastSyncAt: null,
    pendingActions: 0,
    failedActions: 0,
    isSyncing: false,
  });
  const [queue, setQueue] = useState<OfflineAction[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Monitor network connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const online = state.isConnected === true && state.isInternetReachable !== false;
      setIsOnline(online);

      // Auto-sync when connection is restored
      if (online && !isSyncing) {
        processQueue();
      }
    });

    return () => unsubscribe();
  }, [isSyncing]);

  // Listen for sync status changes
  useEffect(() => {
    const unsubscribe = offlineStorage.addSyncListener((status) => {
      setSyncStatus(status);
    });

    // Initial load
    loadStatus();

    return unsubscribe;
  }, []);

  // Refresh on app foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        loadStatus();
      }
    });
    return () => subscription.remove();
  }, []);

  const loadStatus = async () => {
    const status = await offlineStorage.getSyncStatus();
    setSyncStatus(status);
    const q = await offlineStorage.getQueue();
    setQueue(q);
  };

  /**
   * Process the offline queue
   */
  const processQueue = useCallback(async () => {
    if (isSyncing) return;

    setIsSyncing(true);
    try {
      let action = await offlineStorage.getNextPendingAction();

      while (action) {
        await offlineStorage.markActionProcessing(action.id);

        try {
          // Execute the queued API call
          switch (action.method) {
            case 'POST':
              await apiService.post(action.endpoint, action.payload);
              break;
            case 'PUT':
              await apiService.put(action.endpoint, action.payload);
              break;
            case 'PATCH':
              await apiService.patch(action.endpoint, action.payload);
              break;
            case 'DELETE':
              await apiService.delete(action.endpoint);
              break;
            default:
              await apiService.get(action.endpoint);
          }

          await offlineStorage.markActionCompleted(action.id);
        } catch (error: any) {
          await offlineStorage.markActionFailed(action.id, error.message || 'Sync failed');
        }

        action = await offlineStorage.getNextPendingAction();
      }

      await offlineStorage.updateLastSync();
    } finally {
      setIsSyncing(false);
      await loadStatus();
    }
  }, [isSyncing]);

  const retryFailed = async () => {
    const q = await offlineStorage.getQueue();
    for (const action of q) {
      if (action.status === 'failed') {
        await offlineStorage.removeAction(action.id);
        await offlineStorage.enqueueAction({
          type: action.type,
          endpoint: action.endpoint,
          method: action.method,
          payload: action.payload,
        });
      }
    }
    await processQueue();
  };

  const clearFailed = async () => {
    await offlineStorage.clearCompletedActions();
    await loadStatus();
  };

  const formatTime = (timestamp: number | null) => {
    if (!timestamp) return 'Never';
    const diff = Date.now() - timestamp;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const getStatusIcon = (status: OfflineAction['status']) => {
    switch (status) {
      case 'pending': return { name: 'time-outline', color: theme.colors.warning };
      case 'processing': return { name: 'sync-outline', color: theme.colors.primary };
      case 'failed': return { name: 'alert-circle-outline', color: theme.colors.error };
      case 'completed': return { name: 'checkmark-circle-outline', color: theme.colors.success };
    }
  };

  // Status bar only (compact)
  if (showStatusBar && !showQueue) {
    if (isOnline && syncStatus.pendingActions === 0 && syncStatus.failedActions === 0) {
      return null; // Hide when everything is synced
    }

    return (
      <View style={[styles.statusBar, { backgroundColor: isOnline ? theme.colors.surface : '#fef3cd' }]}>
        <View style={styles.statusLeft}>
          <Ionicons
            name={isOnline ? 'cloud-done-outline' : 'cloud-offline-outline'}
            size={16}
            color={isOnline ? theme.colors.success : '#856404'}
          />
          <Text style={[styles.statusText, { color: isOnline ? theme.colors.text : '#856404' }]}>
            {!isOnline
              ? 'Offline mode'
              : isSyncing
              ? 'Syncing...'
              : syncStatus.pendingActions > 0
              ? `${syncStatus.pendingActions} pending`
              : syncStatus.failedActions > 0
              ? `${syncStatus.failedActions} failed`
              : 'Synced'}
          </Text>
        </View>
        {isOnline && syncStatus.pendingActions > 0 && (
          <TouchableOpacity onPress={processQueue}>
            <Text style={[styles.syncNowText, { color: theme.colors.primary }]}>Sync Now</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // Full queue view
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Sync Status Header */}
      <View style={[styles.syncHeader, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.syncInfo}>
          <Ionicons
            name={isOnline ? 'wifi' : 'wifi-outline'}
            size={20}
            color={isOnline ? theme.colors.success : theme.colors.error}
          />
          <View>
            <Text style={[styles.syncTitle, { color: theme.colors.text }]}>
              {isOnline ? 'Connected' : 'Offline'}
            </Text>
            <Text style={[styles.syncSubtitle, { color: theme.colors.textSecondary }]}>
              Last sync: {formatTime(syncStatus.lastSyncAt)}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.syncButton, { backgroundColor: theme.colors.primary }]}
          onPress={processQueue}
          disabled={isSyncing || !isOnline}
        >
          {isSyncing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="sync" size={16} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.statValue, { color: theme.colors.primary }]}>{syncStatus.pendingActions}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Pending</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.statValue, { color: theme.colors.error }]}>{syncStatus.failedActions}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Failed</Text>
        </View>
      </View>

      {/* Actions */}
      {syncStatus.failedActions > 0 && (
        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.retryBtn, { borderColor: theme.colors.primary }]} onPress={retryFailed}>
            <Ionicons name="refresh" size={14} color={theme.colors.primary} />
            <Text style={[styles.retryText, { color: theme.colors.primary }]}>Retry Failed</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.clearBtn, { borderColor: theme.colors.error }]} onPress={clearFailed}>
            <Ionicons name="trash-outline" size={14} color={theme.colors.error} />
            <Text style={[styles.clearText, { color: theme.colors.error }]}>Clear Failed</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Queue List */}
      <FlatList
        data={queue}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const icon = getStatusIcon(item.status);
          return (
            <View style={[styles.queueItem, { backgroundColor: theme.colors.surface }]}>
              <Ionicons name={icon.name as any} size={18} color={icon.color} />
              <View style={styles.queueInfo}>
                <Text style={[styles.queueType, { color: theme.colors.text }]}>{item.type}</Text>
                <Text style={[styles.queueEndpoint, { color: theme.colors.textSecondary }]}>
                  {item.method} {item.endpoint}
                </Text>
                {item.error && (
                  <Text style={[styles.queueError, { color: theme.colors.error }]}>{item.error}</Text>
                )}
              </View>
              <Text style={[styles.queueTime, { color: theme.colors.textSecondary }]}>
                {formatTime(item.timestamp)}
              </Text>
            </View>
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: 6 }} />}
        contentContainerStyle={styles.queueList}
        ListEmptyComponent={
          <View style={styles.emptyQueue}>
            <Ionicons name="checkmark-done-outline" size={36} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>Queue is empty</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  statusBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  statusLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusText: { fontSize: 12, fontWeight: '500' },
  syncNowText: { fontSize: 12, fontWeight: '600' },
  syncHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 12, margin: 16, marginBottom: 8 },
  syncInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  syncTitle: { fontSize: 14, fontWeight: '600' },
  syncSubtitle: { fontSize: 11, marginTop: 2 },
  syncButton: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  stats: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 12 },
  statCard: { flex: 1, padding: 12, borderRadius: 10, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: 'bold' },
  statLabel: { fontSize: 11, marginTop: 2 },
  actionRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 12 },
  retryBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, height: 32, borderRadius: 8, borderWidth: 1 },
  retryText: { fontSize: 12, fontWeight: '500' },
  clearBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, height: 32, borderRadius: 8, borderWidth: 1 },
  clearText: { fontSize: 12, fontWeight: '500' },
  queueList: { paddingHorizontal: 16 },
  queueItem: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 10 },
  queueInfo: { flex: 1 },
  queueType: { fontSize: 13, fontWeight: '600' },
  queueEndpoint: { fontSize: 11, marginTop: 2 },
  queueError: { fontSize: 10, marginTop: 2 },
  queueTime: { fontSize: 10 },
  emptyQueue: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 13, marginTop: 8 },
});
