/**
 * BottomSheet — reusable bottom sheet (actions, filters, details). Mobile #112.
 *
 * Lightweight modal-based implementation. For gesture-driven snap points
 * the team can swap for @gorhom/bottom-sheet later — the API is shaped to
 * be compatible.
 */
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
}

export function BottomSheet({ visible, onClose, title, children }: BottomSheetProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      accessibilityViewIsModal
    >
      <Pressable style={styles.scrim} onPress={onClose} accessibilityLabel="Dismiss" />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        {title ? <Text style={styles.title}>{title}</Text> : null}
        <View style={styles.body}>{children}</View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.4)' },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    paddingBottom: 24,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    marginBottom: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  body: {},
});
