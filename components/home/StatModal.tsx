import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS, FONT_FAMILIES, SPACING } from '@/constants/theme';

type StatModalProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  children: React.ReactNode;
};

export function StatModal({
  visible,
  onClose,
  title,
  icon,
  color,
  children,
}: StatModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={[styles.iconCircle, { backgroundColor: `${color}24` }]}>
              <Ionicons name={icon} size={24} color={color} />
            </View>
            <Text style={styles.title}>{title}</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={COLORS.muted} />
            </Pressable>
          </View>
          <View style={styles.content}>{children}</View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.cream,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: SPACING.lg,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: SPACING.lg,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.ink,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    gap: SPACING.md,
  },
});
