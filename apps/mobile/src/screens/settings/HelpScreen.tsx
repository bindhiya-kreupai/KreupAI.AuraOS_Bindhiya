/**
 * Help Screen (#112)
 * Static FAQ list + contact CTA. The FAQ comes from a backend endpoint so
 * Content can be rotated without an app release.
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';

import { useThemeStore } from '@/stores/theme.store';
import { apiService } from '@/services/api.service';

interface FAQEntry {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface HelpPayload {
  faqs: FAQEntry[];
  supportEmail?: string;
  supportPhone?: string;
}

export function HelpScreen() {
  const { t } = useTranslation();
  const { theme } = useThemeStore();
  const [openId, setOpenId] = React.useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['help'],
    queryFn: () => apiService.get<HelpPayload>(`/v1/help/faq`),
  });

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.container}
    >
      <Text style={[styles.heading, { color: theme.colors.text }]}>
        {t('settings.help') ?? 'Help & Support'}
      </Text>

      {(data?.supportEmail || data?.supportPhone) ? (
        <View
          style={[
            styles.contact,
            { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
          ]}
        >
          {data?.supportEmail ? (
            <TouchableOpacity
              accessibilityRole="link"
              onPress={() => Linking.openURL(`mailto:${data.supportEmail}`)}
              style={styles.contactRow}
            >
              <Ionicons name="mail-outline" size={18} color={theme.colors.primary} />
              <Text style={[styles.contactText, { color: theme.colors.text }]}>
                {data.supportEmail}
              </Text>
            </TouchableOpacity>
          ) : null}
          {data?.supportPhone ? (
            <TouchableOpacity
              accessibilityRole="link"
              onPress={() => Linking.openURL(`tel:${data.supportPhone}`)}
              style={styles.contactRow}
            >
              <Ionicons name="call-outline" size={18} color={theme.colors.primary} />
              <Text style={[styles.contactText, { color: theme.colors.text }]}>
                {data.supportPhone}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}

      <Text style={[styles.section, { color: theme.colors.textSecondary }]}>
        {t('settings.faq') ?? 'Frequently asked'}
      </Text>

      {isLoading ? (
        <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 16 }} />
      ) : data?.faqs.length === 0 ? (
        <Text style={[styles.empty, { color: theme.colors.textSecondary }]}>
          {t('help.empty') ?? 'No FAQs available.'}
        </Text>
      ) : (
        data?.faqs.map((f) => {
          const open = openId === f.id;
          return (
            <TouchableOpacity
              key={f.id}
              accessibilityRole="button"
              accessibilityState={{ expanded: open }}
              onPress={() => setOpenId(open ? null : f.id)}
              style={[
                styles.faqCard,
                { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
              ]}
            >
              <View style={styles.faqHeader}>
                <Text
                  style={[styles.faqQuestion, { color: theme.colors.text }]}
                  numberOfLines={open ? undefined : 2}
                >
                  {f.question}
                </Text>
                <Ionicons
                  name={open ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={theme.colors.textSecondary}
                />
              </View>
              {open ? (
                <Text style={[styles.faqAnswer, { color: theme.colors.textSecondary }]}>
                  {f.answer}
                </Text>
              ) : null}
            </TouchableOpacity>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 48 },
  heading: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  contact: {
    padding: 14,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 16,
  },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  contactText: { fontSize: 14, fontWeight: '500' },
  section: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  empty: { textAlign: 'center', marginTop: 16, fontSize: 14 },
  faqCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 8,
  },
  faqHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  faqQuestion: { fontSize: 14, fontWeight: '600', flex: 1 },
  faqAnswer: { fontSize: 13, marginTop: 8, lineHeight: 19 },
});
