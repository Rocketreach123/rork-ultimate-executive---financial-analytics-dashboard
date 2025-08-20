import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { colors, grid, spacing } from '@/constants/theme';
import GlobalFilterBar from '@/components/global/GlobalFilterBar';
import { useFilters } from '@/providers/FiltersProvider';
import { BarChart3, DollarSign, Users, TrendingUp, ChevronRight } from 'lucide-react-native';

export default function Home() {
  const { filters, set } = useFilters();
  const router = useRouter();

  const nav = useMemo(() => ([
    { label: 'Executive Dashboard', href: '/dashboard/executive', icon: BarChart3 },
    { label: 'Financial Analytics', href: '/dashboard/financial', icon: DollarSign },
    { label: 'Customers', href: '/dashboard/customers', icon: Users },
    { label: 'Trends', href: '/dashboard/trends', icon: TrendingUp },
  ]), []);

  return (
    <View style={styles.screen} testID="home-screen">
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
        <View style={styles.headerRight}><Text style={styles.headerHint}>Demo</Text></View>
      </View>

      <View style={styles.subnav}>
        {nav.map((n) => (
          <TouchableOpacity key={n.href} style={styles.subnavItem} onPress={() => router.push(n.href as any)} testID={`nav-${n.label}`}>
            <n.icon size={16} color={colors.text} />
            <Text style={styles.subnavText}>{n.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <GlobalFilterBar value={filters} onChange={set} />

      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.grid}>
          {nav.map((n) => (
            <TouchableOpacity key={n.href} style={styles.card} onPress={() => router.push(n.href as any)} testID={`card-${n.label}`}>
              <View style={styles.cardRow}>
                <View style={styles.cardIcon}><n.icon size={20} color={colors.primary} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{n.label}</Text>
                  <Text style={styles.cardSub}>Open {n.label}</Text>
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
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.gutter, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface },
  title: { color: colors.text, fontSize: 20, fontWeight: '700' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerHint: { color: colors.subtle, fontSize: 12 },
  subnav: { flexDirection: 'row', paddingHorizontal: spacing.gutter, gap: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface },
  subnavItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  subnavText: { color: colors.text, fontSize: 12 },
  body: { padding: spacing.gutter },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.gutter },
  card: { width: '100%', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 16 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardIcon: { width: 36, height: 36, borderRadius: 8, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  cardSub: { color: colors.subtle, fontSize: 12, marginTop: 4 },
});
