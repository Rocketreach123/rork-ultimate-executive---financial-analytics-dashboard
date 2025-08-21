import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { grid, spacing } from '@/constants/theme';
import GlobalFilterBar from '@/components/global/GlobalFilterBar';
import { useFilters } from '@/providers/FiltersProvider';
import { BarChart3, DollarSign, Users, TrendingUp, ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/providers/ThemeProvider';
import HeaderNav from '@/components/global/HeaderNav';

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
      <HeaderNav title="Analytics" />

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

  body: { padding: spacing.gutter },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.gutter },
  card: { width: '100%', borderWidth: 1, borderRadius: 16, padding: 16 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardIcon: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  cardSub: { fontSize: 12, marginTop: 4 },
});
