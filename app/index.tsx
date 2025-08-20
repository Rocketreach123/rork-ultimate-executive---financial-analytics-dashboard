import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { grid, spacing } from '@/constants/theme';
import GlobalFilterBar from '@/components/global/GlobalFilterBar';
import { useFilters } from '@/providers/FiltersProvider';
import { BarChart3, DollarSign, Users, TrendingUp, ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/providers/ThemeProvider';

export default function Home() {
  const { filters, set } = useFilters();
  const router = useRouter();
  const { colors } = useTheme();

  const nav = useMemo(() => ([
    { label: 'Executive Dashboard', href: '/dashboard/executive', icon: BarChart3 },
    { label: 'Financial Analytics', href: '/dashboard/financial', icon: DollarSign },
    { label: 'Customers', href: '/dashboard/customers', icon: Users },
    { label: 'Trends', href: '/dashboard/trends', icon: TrendingUp },
  ]), []);

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]} testID="home-screen">
      <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.text }]}>Analytics</Text>
        <View style={styles.headerRight}><Text style={[styles.headerHint, { color: colors.subtle }]}>Demo</Text></View>
      </View>

      <View style={[styles.subnav, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
        {nav.map((n) => (
          <TouchableOpacity key={n.href} style={[styles.subnavItem, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.push(n.href as any)} testID={`nav-${n.label}`}>
            <n.icon size={16} color={colors.text} />
            <Text style={[styles.subnavText, { color: colors.text }]}>{n.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <GlobalFilterBar value={filters} onChange={set} />

      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.grid}>
          {nav.map((n) => (
            <TouchableOpacity key={n.href} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.push(n.href as any)} testID={`card-${n.label}`}>
              <View style={styles.cardRow}>
                <View style={[styles.cardIcon, { backgroundColor: colors.surface }]}><n.icon size={20} color={colors.primary} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>{n.label}</Text>
                  <Text style={[styles.cardSub, { color: colors.subtle }]}>Open {n.label}</Text>
                </View>
                <ChevronRight size={16} color={colors.subtle} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.gutter, borderBottomWidth: 1 },
  title: { fontSize: 20, fontWeight: '700' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerHint: { fontSize: 12 },
  subnav: { flexDirection: 'row', paddingHorizontal: spacing.gutter, gap: 12, paddingVertical: 8, borderBottomWidth: 1 },
  subnavItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1 },
  subnavText: { fontSize: 12 },
  body: { padding: spacing.gutter },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.gutter },
  card: { width: '100%', borderWidth: 1, borderRadius: 16, padding: 16 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardIcon: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  cardSub: { fontSize: 12, marginTop: 4 },
});
