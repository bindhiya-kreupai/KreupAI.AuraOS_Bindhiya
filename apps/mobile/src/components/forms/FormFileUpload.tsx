/**
 * FormFileUpload — file/image picker with camera capture. Mobile #112.
 *
 * Surface compatible with expo-image-picker; the actual picker call is left
 * to the caller via the `onPickAsync` prop so the component can be used
 * without bundling a picker dependency at the shared-component layer.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export interface FileAttachment {
  uri: string;
  name?: string;
  mimeType?: string;
  size?: number;
}

export interface FormFileUploadProps {
  label: string;
  attachments: FileAttachment[];
  onAdd: (attachment: FileAttachment) => void;
  onRemove: (index: number) => void;
  onPickAsync: () => Promise<FileAttachment | null>;
  maxFiles?: number;
  required?: boolean;
  error?: string;
  /** Hint label for the picker (e.g., "Receipt", "Profile photo") */
  hint?: string;
}

export function FormFileUpload({
  label,
  attachments,
  onAdd,
  onRemove,
  onPickAsync,
  maxFiles = 5,
  required,
  error,
  hint,
}: FormFileUploadProps) {
  const [busy, setBusy] = React.useState(false);
  const hasError = Boolean(error);
  const atLimit = attachments.length >= maxFiles;

  const handlePick = async () => {
    if (atLimit) return;
    setBusy(true);
    try {
      const a = await onPickAsync();
      if (a) onAdd(a);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.required}> *</Text> : null}
      </Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      <View style={styles.attachmentList}>
        {attachments.map((a, i) => (
          <View key={`${a.uri}-${i}`} style={styles.attachmentRow}>
            <Text style={styles.attachmentName} numberOfLines={1}>
              {a.name ?? a.uri.split('/').pop() ?? `Attachment ${i + 1}`}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Remove attachment ${i + 1}`}
              onPress={() => onRemove(i)}
            >
              <Text style={styles.removeText}>Remove</Text>
            </Pressable>
          </View>
        ))}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: atLimit || busy }}
        disabled={atLimit || busy}
        onPress={handlePick}
        style={[styles.picker, atLimit && styles.pickerDisabled, hasError && styles.pickerError]}
      >
        <Text style={styles.pickerText}>
          {busy ? 'Choosing…' : atLimit ? `Maximum ${maxFiles} files` : 'Add file'}
        </Text>
      </Pressable>
      {hasError ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 4 },
  required: { color: '#DC2626' },
  hint: { fontSize: 11, color: '#6B7280', marginBottom: 8 },
  attachmentList: { marginBottom: 8 },
  attachmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
    marginBottom: 4,
  },
  attachmentName: { flex: 1, fontSize: 13, color: '#111827', marginRight: 12 },
  removeText: { fontSize: 12, color: '#DC2626', fontWeight: '600' },
  picker: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  pickerDisabled: { opacity: 0.5 },
  pickerError: { borderColor: '#DC2626' },
  pickerText: { fontSize: 14, color: '#4F46E5', fontWeight: '600' },
  errorText: { marginTop: 4, fontSize: 12, color: '#DC2626' },
});
