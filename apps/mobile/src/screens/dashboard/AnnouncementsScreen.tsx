/**
 * Announcements Screen (#112)
 * Lists company-wide and audience-targeted announcements. Pull-to-refresh.
 * Tapping an item marks it as read in the backend.
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';

import { useThemeStore } from '@/stores/theme.store';
import { apiService } from '@/services/api.service';

interface Announcement {
  id: string;
  title: string;
  body: string;
  category: 'COMPANY' | 'POLICY' | 'EVENT' | 'BENEFITS' | 'IT';
  publishedAt: string;
  pinned: boolean;
  unread: boolean;
}

const CATEGORY_ICON = (c: Announcement['category']): keyof typeof Ionicons.glyphMap => {
  switch (c) {
    case 'COMPANY':
      return 'megaphone-outline';
    case 'POLICY':
      return 'document-text-outline';
    case 'EVENT':
      return 'calendar-outline';
    case 'BENEFITS':
      return 'heart-outline';
    case 'IT':
      return 'desktop-outline';
    default:
      return 'information-circle-outline';
  }
};

export function AnnouncementsScreen() {
  const { t } = useTranslation();
  const { theme } = useThemeStore();
  const [refreshing, setRefreshing] = React.useState(false);
  const queryClient = useQueryClient();

  const { data, refetch, isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: () =>
      apiService.get<{ items: Announcement[] }>(`/v1/announcements?limit=50`),
  });

  const markRead = useMutation({
    mutationFn: (id: string) => apiService.post(`/v1/announcements/${id}/read`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['announcements'] }),
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={[styles.heading, { color: theme.colors.text }]}>
        {t('announcements.title') ?? 'Announcements'}
      </Text>

      {isLoading ? (
        <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 24 }} />
      ) : data?.items.length === 0 ? (
        <Text style={[styles.empty, { color: theme.colors.textSecondary }]}>
          {t('announcements.empty') ?? 'No announcements right now.'}
        </Text>
      ) : (
        data?.items.map((a) => (
          <TouchableOpacity
            key={a.id}
            accessibilityRole="button"
            onPress={() => markRead.mutate(a.id)}
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.card,
                borderColor: a.unread ? theme.colors.primary : theme.colors.border,
                borderLeftWidth: a.unread ? 3 : StyleSheet.hairlineWidth,
              },
            ]}
          >
            <View style={styles.iconCol}>
              <Ionicons
                name={CATEGORY_ICON(a.category)}
                size={20}
                color={theme.colors.primary}
              />
              {a.pinned ? (
                <Ionicons
                  name="pin"
                  size={12}
                  color={theme.colors.warning}
                  style={{ marginTop: 2 }}
                />
              ) : null}
            </View>
            <View style={styles.cardBody}>
              <Text style={[styles.cardTitle, { color: theme.colors.text }]} numberOfLines={2}>
                {a.title}
              </Text>
              <Text
                style={[styles.cardBodyText, { color: theme.colors.textSecondary }]}
                numberOfLines={3}
              >
                {a.body}
              </Text>
              <Text style={[styles.cardMeta, { color: theme.colors.textSecondary }]}>
                {a.category} · {formatDistanceToNow(new Date(a.publishedAt), { addSuffix: true })}
              </Text>
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 48 },
  heading: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  empty: { textAlign: 'center', marginTop: 32, fontSize: 14 },
  card: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    marginTop: 10,
  },
  iconCol: { alignItems: 'center', marginRight: 12 },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '600' },
  cardBodyText: { fontSize: 13, marginTop: 4, lineHeight: 18 },
  cardMeta: { fontSize: 11, marginTop: 6 },
});
