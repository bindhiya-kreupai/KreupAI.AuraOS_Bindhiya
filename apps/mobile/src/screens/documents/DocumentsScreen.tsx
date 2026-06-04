/**
 * Documents Screen (#112)
 * Lists employee ESS documents grouped by category. Tap a row to fetch a
 * presigned URL and hand off to the platform viewer via Linking.
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
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

import { useThemeStore } from '@/stores/theme.store';
import {
  documentsService,
  type DocumentCategory,
  type EmployeeDocument,
} from '@/services/documents.service';

const CATEGORY_ICON = (cat: DocumentCategory): keyof typeof Ionicons.glyphMap => {
  switch (cat) {
    case 'PAYSLIP':
      return 'receipt-outline';
    case 'TAX_CERTIFICATE':
      return 'calculator-outline';
    case 'CONTRACT':
    case 'OFFER_LETTER':
      return 'document-text-outline';
    case 'EXPERIENCE_LETTER':
      return 'ribbon-outline';
    case 'EDUCATION_CERTIFICATE':
      return 'school-outline';
    case 'IDENTITY_DOCUMENT':
      return 'card-outline';
    default:
      return 'document-outline';
  }
};

const CATEGORY_FILTERS: Array<DocumentCategory | 'ALL'> = [
  'ALL',
  'PAYSLIP',
  'TAX_CERTIFICATE',
  'CONTRACT',
  'OFFER_LETTER',
  'IDENTITY_DOCUMENT',
];

export function DocumentsScreen() {
  const { t } = useTranslation();
  const { theme } = useThemeStore();
  const [filter, setFilter] = React.useState<DocumentCategory | 'ALL'>('ALL');
  const [refreshing, setRefreshing] = React.useState(false);

  const { data, refetch, isLoading } = useQuery({
    queryKey: ['documents', filter],
    queryFn: () =>
      documentsService.list({
        category: filter === 'ALL' ? undefined : filter,
        limit: 50,
      }),
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const openDocument = async (doc: EmployeeDocument) => {
    try {
      const url = doc.downloadUrl ?? (await documentsService.getDownloadUrl(doc.id));
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(t('documents.cannotOpen') ?? 'Cannot open document.');
      }
    } catch (err) {
      Alert.alert(
        t('documents.openFailed') ?? 'Failed to open',
        err instanceof Error ? err.message : 'Unknown error'
      );
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={[styles.heading, { color: theme.colors.text }]}>
        {t('documents.title') ?? 'My Documents'}
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {CATEGORY_FILTERS.map((c) => (
          <TouchableOpacity
            key={c}
            accessibilityRole="button"
            accessibilityState={{ selected: filter === c }}
            onPress={() => setFilter(c)}
            style={[
              styles.filterChip,
              {
                backgroundColor: filter === c ? theme.colors.primary : 'transparent',
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Text
              style={{
                color: filter === c ? 'white' : theme.colors.text,
                fontSize: 12,
                fontWeight: '600',
              }}
            >
              {c}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {isLoading ? (
        <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 24 }} />
      ) : data?.items.length === 0 ? (
        <Text style={[styles.empty, { color: theme.colors.textSecondary }]}>
          {t('documents.noDocuments') ?? 'No documents.'}
        </Text>
      ) : (
        data?.items.map((doc) => (
          <TouchableOpacity
            key={doc.id}
            accessibilityRole="link"
            accessibilityLabel={doc.title}
            onPress={() => openDocument(doc)}
            style={[
              styles.card,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
            ]}
          >
            <Ionicons
              name={CATEGORY_ICON(doc.category)}
              size={22}
              color={theme.colors.primary}
              style={styles.cardIcon}
            />
            <View style={styles.cardBody}>
              <Text style={[styles.cardTitle, { color: theme.colors.text }]} numberOfLines={1}>
                {doc.title}
              </Text>
              <Text style={[styles.cardMeta, { color: theme.colors.textSecondary }]}>
                {doc.category} · {format(new Date(doc.issuedAt), 'PP')}
              </Text>
              {doc.expiresAt ? (
                <Text style={[styles.cardMeta, { color: theme.colors.warning }]}>
                  {t('documents.expires') ?? 'Expires'}{' '}
                  {format(new Date(doc.expiresAt), 'PP')}
                </Text>
              ) : null}
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 48 },
  heading: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  filterRow: { gap: 8, paddingVertical: 8 },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 8,
  },
  empty: { textAlign: 'center', marginTop: 32, fontSize: 14 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    marginTop: 10,
  },
  cardIcon: { marginRight: 12 },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '600' },
  cardMeta: { fontSize: 12, marginTop: 2 },
});
