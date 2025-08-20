import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { radii } from '@/constants/theme';
import { useTheme } from '@/providers/ThemeProvider';

export function Card({ style, ...rest }: ViewProps) {
  const { colors } = useTheme();
  return <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radii.card }, style]} {...rest} testID="card" />;
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
  },
});
