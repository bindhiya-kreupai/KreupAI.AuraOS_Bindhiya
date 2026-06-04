/**
 * Security Screen (#112)
 * Lists active sessions, lets the user toggle biometric unlock, change
 * password, and revoke any session. Wires into the audited revoke
 * endpoint from PR #121 with USER scope.
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';

import { useThemeStore } from '@/stores/theme.store';
import { useAuthStore } from '@/stores/auth.store';
import { apiService } from '@/services/api.service';

interface Session {
  id: string;
  device?: string;
  browser?: string;
  ipAddress: string;
  location?: string;
  lastActive: string;
  current: boolean;
}

export function SecurityScreen() {
  const { t } = useTranslation();
  const { theme } = useThemeStore();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = React.useState(false);
  const [biometric, setBiometric] = React.useState(
    user?.preferences?.biometricEnabled ?? false
  );

  const { data: sessions, refetch, isLoading } = useQuery({
    queryKey: ['security', 'sessions'],
    queryFn: () =>
      apiService.get<{ items: Session[] }>(`/v1/me/sessions`),
  });

  const revokeOne = useMutation({
    mutationFn: (sessionId: string) =>
      apiService.post(`/v1/security/sessions/revoke`, {
        scope: 'USER',
        userId: user?.id,
        sessionId,
        reason: 'USER_REQUEST',
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['security', 'sessions'] }),
    onError: (err) =>
      Alert.alert(
        t('security.revokeFailed') ?? 'Revoke failed',
        err instanceof Error ? err.message : 'Unknown error'
      ),
  });

  const revokeAll = useMutation({
    mutationFn: () =>
      apiService.post(`/v1/security/sessions/revoke`, {
        scope: 'USER',
        userId: user?.id,
        reason: 'USER_REQUEST',
      }),
    onSuccess: () =>
      Alert.alert(
        t('security.allRevoked') ?? 'All other sessions revoked.',
        undefined
      ),
  });

  const promptRevokeOne = (s: Session) => {
    if (s.current) {
      Alert.alert(t('security.cannotRevokeSelf') ?? 'Cannot revoke the current session.');
      return;
    }
    Alert.alert(
      t('security.revokeTitle') ?? 'Revoke session',
      `${s.device ?? s.browser ?? 'Unknown'} · ${s.ipAddress}`,
      [
        { text: t('common.cancel') ?? 'Cancel', style: 'cancel' },
        {
          text: t('common.confirm') ?? 'Confirm',
          style: 'destructive',
          onPress: () => revokeOne.mutate(s.id),
        },
      ]
    );
  };

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
        {t('settings.security') ?? 'Security'}
      </Text>

      <View
        style={[
          styles.card,
          { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
        ]}
      >
        <View style={styles.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.toggleLabel, { color: theme.colors.text }]}>
              {t('security.biometric') ?? 'Biometric unlock'}
            </Text>
            <Text style={[styles.toggleHint, { color: theme.colors.textSecondary }]}>
              {t('security.biometricHint') ?? 'Sign in with Face/Touch ID on this device.'}
            </Text>
          </View>
          <Switch value={biometric} onValueChange={setBiometric} />
        </View>
      </View>

      <Section theme={theme} title={t('security.sessions') ?? 'Active sessions'} />
      {isLoading ? (
        <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 16 }} />
      ) : sessions?.items.length === 0 ? (
        <Text style={[styles.empty, { color: theme.colors.textSecondary }]}>
          {t('security.noSessions') ?? 'No active sessions.'}
        </Text>
      ) : (
        sessions?.items.map((s) => (
          <View
            key={s.id}
            style={[
              styles.sessionRow,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
            ]}
          >
            <Ionicons
              name={s.current ? 'phone-portrait-outline' : 'desktop-outline'}
              size={20}
              color={s.current ? theme.colors.primary : theme.colors.textSecondary}
            />
            <View style={styles.sessionBody}>
              <Text style={[styles.sessionTitle, { color: theme.colors.text }]} numberOfLines={1}>
                {s.device ?? s.browser ?? 'Unknown device'}
                {s.current ? ` · ${t('security.thisDevice') ?? 'this device'}` : ''}
              </Text>
              <Text style={[styles.sessionMeta, { color: theme.colors.textSecondary }]}>
                {s.ipAddress}
                {s.location ? ` · ${s.location}` : ''}
              </Text>
              <Text style={[styles.sessionMeta, { color: theme.colors.textSecondary }]}>
                {formatDistanceToNow(new Date(s.lastActive), { addSuffix: true })}
              </Text>
            </View>
            {!s.current ? (
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => promptRevokeOne(s)}
                style={styles.revokeBtn}
              >
                <Ionicons name="close-circle-outline" size={20} color={theme.colors.error} />
              </TouchableOpacity>
            ) : null}
          </View>
        ))
      )}

      <TouchableOpacity
        accessibilityRole="button"
        onPress={() =>
          Alert.alert(
            t('security.revokeAllTitle') ?? 'Revoke all other sessions?',
            t('security.revokeAllSubtitle') ??
              'Other devices will be signed out immediately.',
            [
              { text: t('common.cancel') ?? 'Cancel', style: 'cancel' },
              {
                text: t('common.confirm') ?? 'Confirm',
                style: 'destructive',
                onPress: () => revokeAll.mutate(),
              },
            ]
          )
        }
        style={[styles.revokeAllBtn, { backgroundColor: theme.colors.error }]}
      >
        <Text style={styles.revokeAllText}>
          {t('security.revokeAll') ?? 'Revoke all other sessions'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Section({
  theme,
  title,
}: {
  theme: ReturnType<typeof useThemeStore>['theme'];
  title: string;
}) {
  return (
    <Text style={[styles.section, { color: theme.colors.textSecondary }]}>{title}</Text>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 48 },
  heading: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  card: {
    padding: 14,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 12,
  },
  toggleRow: { flexDirection: 'row', alignItems: 'center' },
  toggleLabel: { fontSize: 15, fontWeight: '600' },
  toggleHint: { fontSize: 12, marginTop: 2, lineHeight: 16 },
  section: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 16,
    marginBottom: 8,
  },
  empty: { textAlign: 'center', marginTop: 16, fontSize: 14 },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 8,
  },
  sessionBody: { flex: 1 },
  sessionTitle: { fontSize: 14, fontWeight: '600' },
  sessionMeta: { fontSize: 11, marginTop: 2 },
  revokeBtn: { padding: 4 },
  revokeAllBtn: {
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  revokeAllText: { color: 'white', fontWeight: '700' },
});
