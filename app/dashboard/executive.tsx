import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useFilters } from '@/providers/FiltersProvider';
import GlobalFilterBar from '@/components/global/GlobalFilterBar';
import { colors, spacing } from '@/constants/theme';

export default function ExecutivePage() {
  const { filters, set } = useFilters();

  return (
    <View style={styles.screen}>
      <View style={styles.header}><Text style={styles.title}>Executive Dashboard</Text></View>
      <View style={styles.subnav}>
        <Text style={styles.subnavText}>Pulse • Trend • Top • Cold • Heatmaps • Status</Text>
      </View>
      <GlobalFilterBar value={filters} onChange={set} />
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.placeholder}><Text style={styles.text}>Mock widgets go here. Wire to /api endpoints with sample JSON.</Text></View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.gutter, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface },
  title: { color: colors.text, fontSize: 20, fontWeight: '700' },
  subnav: { paddingHorizontal: spacing.gutter, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface },
  subnavText: { color: colors.subtle, fontSize: 12 },
  body: { padding: spacing.gutter },
  placeholder: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, borderRadius: 16, padding: 24 },
  text: { color: colors.text },
});
