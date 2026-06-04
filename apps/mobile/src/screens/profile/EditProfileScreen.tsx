/**
 * Edit Profile Screen (#112)
 * Lets an employee update the contact + personal-detail fields that the ESS
 * surface from #99 permits self-service edits on. Sensitive fields (salary,
 * grade, manager) are deliberately read-only — those routes require HR.
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useThemeStore } from '@/stores/theme.store';
import { useAuthStore } from '@/stores/auth.store';
import { apiService } from '@/services/api.service';
import { MoreStackParamList } from '@/types';

type Props = {
  navigation: NativeStackNavigationProp<MoreStackParamList, 'EditProfile'>;
};

interface ProfilePatch {
  phone?: string;
  alternateEmail?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  country?: string;
}

export function EditProfileScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { theme } = useThemeStore();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [patch, setPatch] = React.useState<ProfilePatch>({});

  const mutation = useMutation({
    mutationFn: () => apiService.put('/v1/employees/me', patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      Alert.alert(t('profile.updated') ?? 'Profile updated', undefined, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    },
    onError: (err) =>
      Alert.alert(
        t('profile.updateFailed') ?? 'Update failed',
        err instanceof Error ? err.message : 'Unknown error'
      ),
  });

  const set = (key: keyof ProfilePatch) => (value: string) =>
    setPatch((p) => ({ ...p, [key]: value }));

  const canSubmit = Object.values(patch).some((v) => (v ?? '').trim().length > 0);

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.container}
    >
      <Text style={[styles.heading, { color: theme.colors.text }]}>
        {t('profile.editProfile') ?? 'Edit profile'}
      </Text>

      <ReadOnly theme={theme} label={t('profile.employeeId') ?? 'Employee ID'} value={user?.employeeId} />
      <ReadOnly theme={theme} label={t('profile.email') ?? 'Email'} value={user?.email} />
      <ReadOnly theme={theme} label={t('profile.department') ?? 'Department'} value={user?.department} />
      <ReadOnly
        theme={theme}
        label={t('profile.designation') ?? 'Designation'}
        value={user?.designation}
      />

      <Section theme={theme} title={t('profile.contact') ?? 'Contact'} />
      <Field
        theme={theme}
        label={t('profile.phone') ?? 'Phone'}
        keyboardType="phone-pad"
        onChangeText={set('phone')}
      />
      <Field
        theme={theme}
        label={t('profile.alternateEmail') ?? 'Alternate email'}
        keyboardType="email-address"
        autoCapitalize="none"
        onChangeText={set('alternateEmail')}
      />

      <Section theme={theme} title={t('profile.emergency') ?? 'Emergency contact'} />
      <Field
        theme={theme}
        label={t('profile.emergencyName') ?? 'Name'}
        onChangeText={set('emergencyContactName')}
      />
      <Field
        theme={theme}
        label={t('profile.emergencyPhone') ?? 'Phone'}
        keyboardType="phone-pad"
        onChangeText={set('emergencyContactPhone')}
      />

      <Section theme={theme} title={t('profile.address') ?? 'Address'} />
      <Field theme={theme} label={t('profile.addressLine1') ?? 'Line 1'} onChangeText={set('addressLine1')} />
      <Field theme={theme} label={t('profile.addressLine2') ?? 'Line 2'} onChangeText={set('addressLine2')} />
      <Field theme={theme} label={t('profile.city') ?? 'City'} onChangeText={set('city')} />
      <Field theme={theme} label={t('profile.country') ?? 'Country'} onChangeText={set('country')} />

      <TouchableOpacity
        disabled={!canSubmit || mutation.isPending}
        onPress={() => mutation.mutate()}
        accessibilityRole="button"
        style={[
          styles.submit,
          {
            backgroundColor: canSubmit ? theme.colors.primary : theme.colors.textSecondary,
          },
        ]}
      >
        {mutation.isPending ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.submitText}>{t('common.save') ?? 'Save'}</Text>
        )}
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

function ReadOnly({
  theme,
  label,
  value,
}: {
  theme: ReturnType<typeof useThemeStore>['theme'];
  label: string;
  value?: string;
}) {
  return (
    <View style={[styles.readonly, { borderColor: theme.colors.border }]}>
      <Text style={[styles.readonlyLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.readonlyValue, { color: theme.colors.text }]}>{value ?? '—'}</Text>
    </View>
  );
}

function Field({
  theme,
  label,
  ...rest
}: {
  theme: ReturnType<typeof useThemeStore>['theme'];
  label: string;
  onChangeText: (value: string) => void;
  keyboardType?: TextInput['props']['keyboardType'];
  autoCapitalize?: TextInput['props']['autoCapitalize'];
}) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        style={[
          styles.field,
          { borderColor: theme.colors.border, color: theme.colors.text },
        ]}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 48 },
  heading: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  section: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  readonly: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 8,
  },
  readonlyLabel: { fontSize: 12 },
  readonlyValue: { fontSize: 14, fontWeight: '500', maxWidth: '55%', textAlign: 'right' },
  fieldLabel: { fontSize: 12, marginBottom: 4 },
  field: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  submit: {
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitText: { color: 'white', fontWeight: '700', fontSize: 16 },
});
