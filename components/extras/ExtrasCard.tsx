import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS, FONT_FAMILIES, SPACING } from '@/constants/theme';

/** iOS systemGray6 equivalent for card background */
const CARD_BG = '#F2F2F7';

/** Hex to rgba helper */
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

type ExtrasCardProps = {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  isDisabled?: boolean;
  onPress: () => void;
};

export function ExtrasCard({
  title,
  subtitle,
  icon,
  color,
  isDisabled = false,
  onPress,
}: ExtrasCardProps) {
  const handlePress = () => {
    if (!isDisabled) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const opacity = isDisabled ? 0.6 : 1;
  const borderOpacity = isDisabled ? 0.2 : 0.3;
  const iconBgOpacity = isDisabled ? 0.3 : 0.2;
  const iconOpacity = isDisabled ? 0.5 : 1;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: CARD_BG,
          opacity,
          borderColor: hexToRgba(color, borderOpacity),
          transform: [{ scale: isDisabled ? 0.95 : pressed ? 0.98 : 1 }],
        },
      ]}
    >
      <View style={[styles.iconCircle, { backgroundColor: hexToRgba(color, iconBgOpacity) }]}>
        <Ionicons name={icon} size={24} color={hexToRgba(color, iconOpacity)} />
      </View>
      <View style={styles.textBlock}>
        <Text style={[styles.title, isDisabled && styles.disabledText]} numberOfLines={2}>
          {title}
        </Text>
        <Text style={[styles.subtitle, isDisabled && styles.disabledSubtext]} numberOfLines={2}>
          {subtitle}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 140,
    borderRadius: 16,
    borderWidth: 1,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    alignItems: 'center',
    gap: 4,
  },
  title: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.ink,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 12,
    color: COLORS.muted,
    textAlign: 'center',
  },
  disabledText: {
    color: `${COLORS.ink}80`,
  },
  disabledSubtext: {
    color: `${COLORS.muted}80`,
  },
});
