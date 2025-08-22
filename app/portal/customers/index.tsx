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
  const [fromDate, setFromDate] = useState<string>('2025-01-01');
  const [toDate, setToDate] = useState<string>('2025-08-31');

  // Load initial data on mount
  useEffect(() => {
    (async () => {
      try {
        console.log('[CustomersList] Loading pivot data with params:', { fromDate, toDate, query, clientType, minSpend });
        const params = new URLSearchParams({
          from: fromDate,
          to: toDate,
          query,
          type: clientType,
          min_spend: minSpend || '0',
        });
        const url = `/api/analytics/customers/pivot?${params.toString()}`;
        console.log('[CustomersList] Fetching URL:', url);
        
        const response = await mockFinanceGet(url) as PivotResponse;
        console.log('[CustomersList] Pivot response received:', {
          hasMonths: !!response?.months,
          monthsLength: response?.months?.length,
          hasRows: !!response?.rows,
          rowsLength: response?.rows?.length,
          responseKeys: Object.keys(response || {})
        });
        
        if (response && typeof response === 'object' && 'months' in response && 'rows' in response) {
          console.log('[CustomersList] Setting data - months:', response.months.length, 'rows:', response.rows.length);
          setMonths(response.months ?? []);
          setRows(response.rows ?? []);
        } else {
          console.log('[CustomersList] Invalid response format:', response);
          setMonths([]);
          setRows([]);
        }
      } catch (e) {
        console.log('[CustomersList] load error', e);
        setMonths([]);
        setRows([]);
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
            <View style={styles.dateInputContainer}>
              <Text style={[styles.dateLabel, { color: colors.text }]}>From:</Text>
              <TextInput
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.subtle}
                style={[styles.dateInput, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
                value={fromDate}
                onChangeText={setFromDate}
                testID="filter-from"
              />
            </View>
            <View style={styles.dateInputContainer}>
              <Text style={[styles.dateLabel, { color: colors.text }]}>To:</Text>
              <TextInput
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.subtle}
                style={[styles.dateInput, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
                value={toDate}
                onChangeText={setToDate}
                testID="filter-to"
              />
            </View>
          </View>
        </Card>

        {/* Pivot Heatmap */}
        <Card style={[styles.pivotCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.pivotHeader}>
            <Text style={[styles.pivotTitle, { color: colors.text }]}>Customers × Month — Pivot Heatmap</Text>
            <Text style={[styles.pivotSubtitle, { color: colors.subtle }]}>Green=High · Yellow=Mid · Red=Low</Text>
            <Text style={[styles.dataInfo, { color: colors.subtle }]}>Showing {filtered.length} customers</Text>
          </View>
          {months.length > 0 && filtered.length > 0 ? (
            <PivotHeatmap
              months={months}
              rows={filtered}
              onCustomerClick={handleCustomerClick}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: colors.subtle }]}>Loading pivot data...</Text>
              <Text style={[styles.debugText, { color: colors.subtle }]}>Months: {months.length}, Rows: {rows.length}, Filtered: {filtered.length}</Text>
              <TouchableOpacity 
                style={[styles.testBtn, { backgroundColor: colors.primary }]} 
                onPress={() => handleCustomerClick({ customer_id: 'test_001', company: 'Test Customer', client_type: 'Direct', monthly: [1000, 2000], total: 3000, orders: 5, units: 100 })}
              >
                <Text style={[styles.testBtnText, { color: colors.card }]}>Test Customer Profile</Text>
              </TouchableOpacity>
            </View>
          )}
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
  dateInputContainer: { flex: 1, gap: 4 },
  dateLabel: { fontSize: 12, fontWeight: '600' },
  dateInput: { borderWidth: 1, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, fontSize: 14 },
  pivotCard: { borderWidth: 1, borderRadius: 16, overflow: 'hidden' },
  pivotHeader: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  pivotTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  pivotSubtitle: { fontSize: 12 },
  dataInfo: { fontSize: 11, marginTop: 4 },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 14 },
  debugText: { fontSize: 12, marginTop: 8 },
  testBtn: { marginTop: 16, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  testBtnText: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
});