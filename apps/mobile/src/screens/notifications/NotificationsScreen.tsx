/**
 * Notifications Screen
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';

import { useThemeStore } from '@/stores/theme.store';
import { apiService } from '@/services/api.service';
import { Notification, NotificationType } from '@/types';

export function NotificationsScreen() {
  const { t } = useTranslation();
  const { theme } = useThemeStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await apiService.get<{ data: Notification[] }>('/notifications');
      setNotifications(response.data || []);
    } catch {
      // Keep existing data on error
    }
  }, []);

  useEffect(() => {
    fetchNotifications().finally(() => setLoading(false));
  }, [fetchNotifications]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await apiService.post('/notifications/mark-all-read');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // silent fail
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await apiService.post(`/notifications/${id}/mark-read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch {
      // silent fail
    }
  };

  const getNotificationIcon = (type: NotificationType): { name: string; color: string } => {
    switch (type) {
      case 'leave_approved':
        return { name: 'checkmark-circle', color: theme.colors.success };
      case 'leave_rejected':
        return { name: 'close-circle', color: theme.colors.error };
      case 'leave_request':
        return { name: 'calendar', color: theme.colors.info };
      case 'payslip_ready':
        return { name: 'document-text', color: theme.colors.primary };
      case 'approval_pending':
        return { name: 'hourglass', color: theme.colors.warning };
      case 'announcement':
        return { name: 'megaphone', color: theme.colors.primary };
      case 'birthday':
        return { name: 'gift', color: theme.colors.error };
      default:
        return { name: 'notifications', color: theme.colors.textSecondary };
    }
  };

  const renderItem = ({ item }: { item: Notification }) => {
    const icon = getNotificationIcon(item.type);

    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          { backgroundColor: item.read ? theme.colors.background : theme.colors.surface },
        ]}
        onPress={() => !item.read && handleMarkRead(item.id)}
      >
        {!item.read && (
          <View style={[styles.unreadDot, { backgroundColor: theme.colors.primary }]} />
        )}
        <View style={[styles.iconContainer, { backgroundColor: icon.color + '20' }]}>
          <Ionicons name={icon.name as any} size={20} color={icon.color} />
        </View>
        <View style={styles.contentContainer}>
          <Text
            style={[
              styles.title,
              { color: theme.colors.text, fontWeight: item.read ? '400' : '600' },
            ]}
          >
            {item.title}
          </Text>
          <Text style={[styles.message, { color: theme.colors.textSecondary }]} numberOfLines={2}>
            {item.message}
          </Text>
          <Text style={[styles.time, { color: theme.colors.textSecondary }]}>
            {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header Actions */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity style={styles.headerAction} onPress={handleMarkAllRead}>
          <Text style={[styles.headerActionText, { color: theme.colors.primary }]}>
            {t('notifications.markAllRead')}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ItemSeparatorComponent={() => (
          <View style={[styles.separator, { backgroundColor: theme.colors.border }]} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name="notifications-off-outline"
              size={64}
              color={theme.colors.textSecondary}
            />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              {t('notifications.noNotifications')}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 12,
    borderBottomWidth: 1,
  },
  headerAction: {
    padding: 4,
  },
  headerActionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  list: {
    paddingVertical: 8,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    left: 4,
    top: 24,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    marginBottom: 4,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
  },
  separator: {
    height: 1,
    marginLeft: 68,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
});
