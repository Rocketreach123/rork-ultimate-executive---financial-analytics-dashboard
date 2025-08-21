import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { spacing } from '@/constants/theme';
import { FiltersPayload } from '@/types/finance';
import { Calendar, RefreshCcw, Sun, Moon } from 'lucide-react-native';
import { useTheme } from '@/providers/ThemeProvider';

interface Props {
  value: FiltersPayload;
  onChange: (next: FiltersPayload) => void;
}

export default function GlobalFilterBar({ value, onChange }: Props) {
  const { colors, mode, toggle } = useTheme();

  const presets = useMemo(
    () => [
      { label: 'Today', calc: () => { const now = new Date(); const d = now.toISOString().slice(0,10); return { from: d, to: d }; } },
      { label: 'Week', calc: () => { const now = new Date(); const to = now.toISOString().slice(0,10); const wk = new Date(); wk.setDate(wk.getDate()-7); return { from: wk.toISOString().slice(0,10), to }; } },
      { label: 'MTD', calc: () => { const now = new Date(); const to = now.toISOString().slice(0,10); const m0 = new Date(now.getFullYear(), now.getMonth(), 1); return { from: m0.toISOString().slice(0,10), to }; } },
      { label: 'QTD', calc: () => { const now = new Date(); const q = Math.floor(now.getMonth()/3); const from = new Date(now.getFullYear(), q*3, 1); return { from: from.toISOString().slice(0,10), to: now.toISOString().slice(0,10) }; } },
      { label: 'YTD', calc: () => { const now = new Date(); const from = new Date(now.getFullYear(), 0, 1); return { from: from.toISOString().slice(0,10), to: now.toISOString().slice(0,10) }; } },
    ], []);

  const applyPreset = (idx: number) => {
    const { from, to } = presets[idx].calc();
    onChange({ ...value, from, to });
  };

  const toggleCompare = () => onChange({ ...value, compare: !value.compare });

  return (
    <View style={[styles.wrap, { backgroundColor: colors.surface, borderColor: colors.border }]} testID="global-filter-bar">
      <View style={styles.row}>
        <View style={styles.presetRow}>
          {presets.map((p, idx) => (
            <TouchableOpacity key={p.label} onPress={() => applyPreset(idx)} style={[styles.pill, { backgroundColor: colors.card, borderColor: colors.border }]} testID={`preset-${p.label}`}>
              <Calendar size={14} color={colors.subtle} />
              <Text style={[styles.pillText, { color: colors.subtle }]}>{p.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.rightRow}>
          <TouchableOpacity onPress={toggle} style={[styles.pill, { backgroundColor: colors.card, borderColor: colors.border }]} testID="toggle-theme">
            {mode === 'dark' ? <Sun size={14} color={colors.subtle} /> : <Moon size={14} color={colors.subtle} />}
            <Text style={[styles.pillText, { color: colors.subtle }]}>{mode === 'dark' ? 'Light' : 'Dark'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleCompare} style={[styles.pill, value.compare ? [styles.pillActive, { backgroundColor: colors.primary, borderColor: colors.primary }] : { backgroundColor: colors.card, borderColor: colors.border }]} testID="toggle-compare">
            <RefreshCcw size={14} color={value.compare ? colors.bg : colors.subtle} />
            <Text style={[styles.pillText, value.compare ? { color: colors.bg } : { color: colors.subtle }]}>Compare</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={[styles.rangeText, { color: colors.subtle }]} numberOfLines={1} testID="current-range">{value.from} — {value.to}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'sticky' as any,
    top: 0,
    zIndex: 10,
    borderWidth: 1,
    paddingHorizontal: spacing.gutter,
    paddingVertical: 12,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  presetRow: { flexDirection: 'row', gap: 8 },
  rightRow: { flexDirection: 'row', gap: 8 },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 8,
    borderWidth: 1, borderRadius: 999,
  },
  pillActive: {},
  pillText: { fontSize: 12 },
  pillTextActive: {},
  rangeText: { fontSize: 12, marginTop: 8 },
});
