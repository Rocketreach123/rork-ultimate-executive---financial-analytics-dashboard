import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useFilters } from '@/providers/FiltersProvider';
import GlobalFilterBar from '@/components/global/GlobalFilterBar';
import { spacing } from '@/constants/theme';
import { useTheme } from '@/providers/ThemeProvider';

export default function ExecutivePage() {
  const { filters, set } = useFilters();
  const { colors } = useTheme();

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}
      testID="executive-screen">
      <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.text }]}>Executive Dashboard</Text>
      </View>
      <View style={[styles.subnav, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
        <Text style={[styles.subnavText, { color: colors.subtle }]}>Pulse • Trend • Top • Cold • Heatmaps • Status</Text>
      </View>
      <GlobalFilterBar value={filters} onChange={set} />
      <ScrollView contentContainerStyle={styles.body}>
        <View style={[styles.placeholder, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <Text style={{ color: colors.text }}>Mock widgets go here. Wire to /api endpoints with sample JSON.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.gutter, borderBottomWidth: 1 },
  title: { fontSize: 20, fontWeight: '700' },
  subnav: { paddingHorizontal: spacing.gutter, paddingVertical: 8, borderBottomWidth: 1 },
  subnavText: { fontSize: 12 },
  body: { padding: spacing.gutter },
  placeholder: { borderWidth: 1, borderRadius: 16, padding: 24 },
});
