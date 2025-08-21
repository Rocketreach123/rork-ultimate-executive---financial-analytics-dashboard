import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TextInput } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { useFilters } from '@/providers/FiltersProvider';
import GlobalFilterBar from '@/components/global/GlobalFilterBar';
import { Card } from '@/components/ui/Card';
import { spacing } from '@/constants/theme';
import { mockFinanceGet } from '@/mocks/mockApi';

interface TopRow { company: string; revenue: number; orders: number; units: number; aov: number }

export default function CustomersPage() {
  const { colors } = useTheme();
  const { filters, set } = useFilters();
  const [rows, setRows] = useState<TopRow[]>([]);
  const [query, setQuery] = useState<string>('');

  useEffect(() => {
    const params = new URLSearchParams();
    params.set('from', filters.from);
    params.set('to', filters.to);
    (async () => {
      try {
        const top = await mockFinanceGet(`/api/finance/customers/top?limit=30&${params.toString()}`) as TopRow[];
        setRows(top ?? []);
      } catch (e) {
        console.log('Customers load error', e);
      }
    })();
  }, [filters.from, filters.to]);

  const filtered = rows.filter(r => r.company.toLowerCase().includes(query.toLowerCase()));

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]} testID="customers-screen">
      <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.text }]}>Customers</Text>
      </View>
      <View style={[styles.subnav, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
        <Text style={[styles.subnavText, { color: colors.subtle }]}>Master list • Search • Drilldown</Text>
      </View>
      <GlobalFilterBar value={filters} onChange={set} />

      <ScrollView contentContainerStyle={styles.body}>
        <Card style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]} testID="customers-table">
          <TextInput
            placeholder="Search company..."
            placeholderTextColor={colors.subtle}
            value={query}
            onChangeText={setQuery}
            style={[styles.search, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
          />
          {filtered.length === 0 ? (
            <Text style={{ color: colors.subtle }}>No customers for selected range.</Text>
          ) : (
            <View style={{ marginTop: 8 }}>
              {filtered.map(r => (
                <View key={r.company} style={styles.row}>
                  <Text style={[styles.cName, { color: colors.text }]} numberOfLines={1}>{r.company}</Text>
                  <Text style={[styles.cVal, { color: colors.text }]}>${Math.round(r.revenue).toLocaleString()}</Text>
                  <Text style={[styles.cVal, { color: colors.subtle }]}>{r.orders} orders</Text>
                  <Text style={[styles.cVal, { color: colors.subtle }]}>{r.units} units</Text>
                </View>
              ))}
            </View>
          )}
        </Card>
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
  body: { padding: spacing.gutter, gap: 16 },
  card: { padding: 16, borderWidth: 1, borderRadius: 16 },
  search: { borderWidth: 1, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, gap: 8 },
  cName: { flex: 1, marginRight: 8 },
  cVal: { width: 100, textAlign: 'right', fontSize: 12 },
});
