import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { COLORS, FONT_FAMILIES, SPACING } from '@/constants/theme';
import type { HomeFilter } from '@/lib/services/revision';

const FILTERS: { value: HomeFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'needs-revision', label: 'Needs Revision' },
  { value: 'hardest-first', label: 'Hardest First' },
  { value: 'easiest-first', label: 'Easiest First' },
  { value: 'last-revised-oldest', label: 'Oldest Revised' },
  { value: 'least-revised', label: 'Least Revised' },
];

type RevisionFiltersViewProps = {
  selectedFilter: HomeFilter;
  onFilterChange: (filter: HomeFilter) => void;
};

export function RevisionFiltersView({
  selectedFilter,
  onFilterChange,
}: RevisionFiltersViewProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {FILTERS.map(({ value, label }) => {
        const isSelected = selectedFilter === value;
        return (
          <Pressable
            key={value}
            onPress={() => onFilterChange(value)}
            style={[styles.chip, isSelected && styles.chipActive]}
          >
            <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexDirection: 'row',
    gap: 12,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  chipActive: {
    borderColor: COLORS.forest,
    backgroundColor: '#EEF6F0',
  },
  chipText: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.ink,
  },
  chipTextActive: {
    color: COLORS.forest,
  },
});
