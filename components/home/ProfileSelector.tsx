import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS, FONT_FAMILIES } from '@/constants/theme';

type ProfileSelectorProps = {
  activeProfileName: string;
  onPress?: () => void;
};

export function ProfileSelector({
  activeProfileName,
  onPress,
}: ProfileSelectorProps) {
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push('/settings/profiles');
    }
  };

  return (
    <Pressable onPress={handlePress} style={styles.button}>
      <Text style={styles.text} numberOfLines={1}>
        {activeProfileName}
      </Text>
      <Ionicons name="chevron-down" size={12} color={COLORS.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: COLORS.sand,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  text: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.ink,
    maxWidth: 120,
  },
});
