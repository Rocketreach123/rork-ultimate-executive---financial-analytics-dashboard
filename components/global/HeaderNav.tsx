import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { spacing } from '@/constants/theme';
import { BarChart3, DollarSign, Users, TrendingUp, Sun, Moon } from 'lucide-react-native';
import { useTheme } from '@/providers/ThemeProvider';

interface NavItem { label: string; href: string; }

interface Props { title?: string }

export default function HeaderNav({ title }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { colors, mode, toggle } = useTheme();

  const nav = useMemo<NavItem[]>(() => ([
    { label: 'Executive Dashboard', href: '/dashboard/executive' },
    { label: 'Financial Analytics', href: '/dashboard/financial' },
    { label: 'Customers', href: '/dashboard/customers' },
    { label: 'Customer Portal', href: '/portal/customers' },
    { label: 'Trends', href: '/dashboard/trends' },
  ]), []);

  const activeIdx = useMemo(() => nav.findIndex(n => (pathname ?? '').startsWith(n.href)), [nav, pathname]);

  return (
    <View style={[styles.wrap]} testID="header-nav">
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.text }]}>{title ?? 'Analytics'}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={toggle}
            style={[styles.themeChip, { borderColor: colors.border, backgroundColor: colors.card }]}
            testID="theme-toggle"
          >
            {mode === 'dark' ? (
              <Sun size={14} color={colors.text} />
            ) : (
              <Moon size={14} color={colors.text} />
            )}
            <Text style={[styles.themeChipText, { color: colors.text }]}>{mode === 'dark' ? 'Light Mode' : 'Dark Mode'}</Text>
          </TouchableOpacity>
          <Text style={[styles.hint, { color: colors.subtle }]}>Demo</Text>
        </View>
      </View>
      <View style={styles.subnavRow}>
        {nav.map((n, idx) => (
          <TouchableOpacity
            key={n.href}
            onPress={() => router.push(n.href as any)}
            style={[styles.chip, { borderColor: colors.border, backgroundColor: idx===activeIdx ? colors.primary : colors.card }]}
            testID={`nav-chip-${n.label}`}
          >
            {idx===0 && <BarChart3 size={14} color={idx===activeIdx ? colors.bg : colors.text} />}
            {idx===1 && <DollarSign size={14} color={idx===activeIdx ? colors.bg : colors.text} />}
            {idx===2 && <Users size={14} color={idx===activeIdx ? colors.bg : colors.text} />}
            {idx===3 && <Users size={14} color={idx===activeIdx ? colors.bg : colors.text} />}
            {idx===4 && <TrendingUp size={14} color={idx===activeIdx ? colors.bg : colors.text} />}
            <Text style={[styles.chipText, { color: idx===activeIdx ? colors.bg : colors.text }]} numberOfLines={1}>{n.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'sticky' as any, top: 0, zIndex: 20, paddingHorizontal: spacing.gutter, paddingTop: 10, paddingBottom: 8 },
  headerRow: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 20, fontWeight: '700' },
  hint: { fontSize: 12 },
  subnavRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingBottom: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1 },
  chipText: { fontSize: 12, maxWidth: 220 },
  themeChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, borderWidth: 1 },
  themeChipText: { fontSize: 12, fontWeight: '600' },
});
