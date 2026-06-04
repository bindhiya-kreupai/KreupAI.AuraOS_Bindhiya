/**
 * Payslip Download Screen (#112)
 * Fetches the presigned URL for a payslip PDF and hands off to the platform
 * viewer. Shows a brief progress + error state.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useThemeStore } from '@/stores/theme.store';
import { apiService } from '@/services/api.service';
import { PayrollStackParamList } from '@/types';

type Props = NativeStackScreenProps<PayrollStackParamList, 'PayslipDownload'>;

export function PayslipDownloadScreen({ route, navigation }: Props) {
  const { payslipId } = route.params;
  const { t } = useTranslation();
  const { theme } = useThemeStore();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['payslip', 'download-url', payslipId],
    queryFn: () =>
      apiService.get<{ downloadUrl: string; expiresAt?: string }>(
        `/v1/payroll/payslips/${payslipId}/download-url`
      ),
  });

  React.useEffect(() => {
    if (!data?.downloadUrl) return;
    (async () => {
      try {
        const supported = await Linking.canOpenURL(data.downloadUrl);
        if (supported) await Linking.openURL(data.downloadUrl);
      } catch (err) {
        Alert.alert(
          t('payroll.downloadFailed') ?? 'Download failed',
          err instanceof Error ? err.message : 'Unknown error'
        );
      }
    })();
  }, [data?.downloadUrl, t]);

  return (
    <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
      {isLoading ? (
        <>
          <ActivityIndicator color={theme.colors.primary} size="large" />
          <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
            {t('payroll.preparingDownload') ?? 'Preparing your payslip…'}
          </Text>
        </>
      ) : error ? (
        <>
          <Ionicons name="alert-circle-outline" size={48} color={theme.colors.error} />
          <Text style={[styles.message, { color: theme.colors.error }]}>
            {t('payroll.downloadFailed') ?? 'Download failed'}
          </Text>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => refetch()}
            style={[styles.retry, { backgroundColor: theme.colors.primary }]}
          >
            <Text style={styles.retryText}>{t('common.retry') ?? 'Retry'}</Text>
          </TouchableOpacity>
        </>
      ) : data?.downloadUrl ? (
        <>
          <Ionicons name="checkmark-circle-outline" size={48} color={theme.colors.success} />
          <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
            {t('payroll.openedInViewer') ?? 'Opened in your PDF viewer.'}
          </Text>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => navigation.goBack()}
            style={[styles.retry, { backgroundColor: theme.colors.primary }]}
          >
            <Text style={styles.retryText}>{t('common.done') ?? 'Done'}</Text>
          </TouchableOpacity>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  message: { fontSize: 14, marginTop: 12, textAlign: 'center' },
  retry: {
    marginTop: 16,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryText: { color: 'white', fontWeight: '600' },
});
