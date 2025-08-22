import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import HeaderNav from '@/components/global/HeaderNav';
import { useTheme } from '@/providers/ThemeProvider';
import { Card } from '@/components/ui/Card';
import { spacing } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { mockFinanceGet } from '@/mocks/mockApi';
import PivotHeatmap from '@/components/PivotHeatmap';

interface PivotRow {
  customer_id: string;
  company: string;
  client_type: string;
  monthly: number[];
  total: number;
  orders: number;
  units: number;
}

interface PivotResponse {
  months: string[];
  rows: PivotRow[];
  meta: { page: number; per_page: number; total: number };
}

export default function CustomersList() {
  const { colors } = useTheme();
  const router = useRouter();
  const [months, setMonths] = useState<string[]>([]);
  const [rows, setRows] = useState<PivotRow[]>([]);
  const [query, setQuery] = useState<string>('');
  const [clientType, setClientType] = useState<string>('');
  const [minSpend, setMinSpend] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        const params = new URLSearchParams({
          from: fromDate || '2025-01-01',
          to: toDate || '2025-08-31',
          query,
          type: clientType,
          min_spend: minSpend || '0',
        });
        const response = await mockFinanceGet(`/api/analytics/customers/pivot?${params.toString()}`) as PivotResponse;
        setMonths(response.months ?? []);
        setRows(response.rows ?? []);
      } catch (e) {
        console.log('[CustomersList] load error', e);
      }
    })();
  }, [query, clientType, minSpend, fromDate, toDate]);

  const filtered = useMemo(() => {
    return rows.filter(r => {
      const matchesQuery = r.company.toLowerCase().includes(query.toLowerCase());
      const matchesType = !clientType || r.client_type === clientType;
      const matchesSpend = !minSpend || r.total >= Number(minSpend);
      return matchesQuery && matchesType && matchesSpend;
    });
  }, [rows, query, clientType, minSpend]);

  const handleCustomerClick = (row: PivotRow) => {
    router.push({ pathname: '/portal/customers/[id]', params: { id: row.customer_id } });
  };

  const handlePreset = (preset: string) => {
    const now = new Date();
    let from: Date, to: Date;
    
    switch (preset) {
      case 'today':
        from = new Date(now);
        to = new Date(now);
        break;
      case 'week':
        from = new Date(now);
        from.setDate(now.getDate() - 7);
        to = now;
        break;
      case 'mtd':
        from = new Date(now.getFullYear(), now.getMonth(), 1);
        to = now;
        break;
      case 'qtd':
        const quarter = Math.floor(now.getMonth() / 3);
        from = new Date(now.getFullYear(), quarter * 3, 1);
        to = now;
        break;
      case 'ytd':
        from = new Date(now.getFullYear(), 0, 1);
        to = now;
        break;
      default:
        return;
    }
    
    setFromDate(from.toISOString().split('T')[0]);
    setToDate(to.toISOString().split('T')[0]);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]} testID="portal-customers-list">
      <HeaderNav title="Customers Pivot" />
      <ScrollView contentContainerStyle={styles.body}>
        {/* Filters */}
        <Card style={[styles.filtersCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.filtersRow}>
            <TextInput
              placeholder="Search company…"
              placeholderTextColor={colors.subtle}
              style={[styles.filterInput, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
              value={query}
              onChangeText={setQuery}
              testID="filter-search"
            />
            <TextInput
              placeholder="Client type"
              placeholderTextColor={colors.subtle}
              style={[styles.filterInput, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
              value={clientType}
              onChangeText={setClientType}
              testID="filter-type"
            />
            <TextInput
              placeholder="Min spend"
              placeholderTextColor={colors.subtle}
              style={[styles.filterInput, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
              value={minSpend}
              onChangeText={setMinSpend}
              keyboardType="numeric"
              testID="filter-min"
            />
          </View>
          
          {/* Date Range Presets */}
          <View style={styles.presetsRow}>
            {['today', 'week', 'mtd', 'qtd', 'ytd'].map(preset => (
              <TouchableOpacity
                key={preset}
                style={[styles.presetBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => handlePreset(preset)}
                testID={`preset-${preset}`}
              >
                <Text style={[styles.presetText, { color: colors.text }]}>{preset.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Custom Date Range */}
          <View style={styles.dateRow}>
            <TextInput
              placeholder="From date"
              placeholderTextColor={colors.subtle}
              style={[styles.dateInput, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
              value={fromDate}
              onChangeText={setFromDate}
              testID="filter-from"
            />
            <TextInput
              placeholder="To date"
              placeholderTextColor={colors.subtle}
              style={[styles.dateInput, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
              value={toDate}
              onChangeText={setToDate}
              testID="filter-to"
            />
          </View>
        </Card>

        {/* Pivot Heatmap */}
        <Card style={[styles.pivotCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.pivotHeader}>
            <Text style={[styles.pivotTitle, { color: colors.text }]}>Customers × Month — Pivot Heatmap</Text>
            <Text style={[styles.pivotSubtitle, { color: colors.subtle }]}>Green=High · Yellow=Mid · Red=Low</Text>
          </View>
          <PivotHeatmap
            months={months}
            rows={filtered}
            onCustomerClick={handleCustomerClick}
          />
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  body: { padding: spacing.gutter, gap: 16 },
  filtersCard: { padding: 16, borderWidth: 1, borderRadius: 16 },
  filtersRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  filterInput: { flex: 1, borderWidth: 1, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, fontSize: 14 },
  presetsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  presetBtn: { paddingVertical: 6, paddingHorizontal: 12, borderWidth: 1, borderRadius: 20 },
  presetText: { fontSize: 12, fontWeight: '600' },
  dateRow: { flexDirection: 'row', gap: 8 },
  dateInput: { flex: 1, borderWidth: 1, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, fontSize: 14 },
  pivotCard: { borderWidth: 1, borderRadius: 16, overflow: 'hidden' },
  pivotHeader: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  pivotTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  pivotSubtitle: { fontSize: 12 },
});