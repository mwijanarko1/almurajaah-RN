import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS, FONT_FAMILIES } from '@/constants/theme';

export type ViewMode = 'juz' | 'surah' | 'revise';

type ViewModeSelectorViewProps = {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
};

const MODES: { mode: ViewMode; label: string; icon: React.ComponentProps<typeof Ionicons>['name'] }[] = [
  { mode: 'juz', label: 'Juz', icon: 'grid' },
  { mode: 'surah', label: 'Surah', icon: 'list' },
  { mode: 'revise', label: 'Revise', icon: 'refresh' },
];

export function ViewModeSelectorView({
  viewMode,
  onViewModeChange,
}: ViewModeSelectorViewProps) {
  return (
    <View style={styles.row}>
      {MODES.map(({ mode, label, icon }) => {
        const isSelected = viewMode === mode;
        return (
          <Pressable
            key={mode}
            onPress={() => onViewModeChange(mode)}
            style={[styles.button, isSelected && styles.buttonActive]}
          >
            <Ionicons
              name={icon}
              size={16}
              color={isSelected ? COLORS.cream : COLORS.ink}
            />
            <Text style={[styles.buttonText, isSelected && styles.buttonTextActive]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  buttonActive: {
    backgroundColor: COLORS.ink,
    borderColor: COLORS.ink,
  },
  buttonText: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.ink,
  },
  buttonTextActive: {
    color: COLORS.cream,
  },
});
