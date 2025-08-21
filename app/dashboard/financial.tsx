import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';
import GlobalFilterBar from '@/components/global/GlobalFilterBar';
import { useFilters } from '@/providers/FiltersProvider';
import PulseKpiStrip from '@/components/widgets/PulseKpiStrip';
import { Card } from '@/components/ui/Card';
import { FiltersPayload } from '@/types/finance';
import { mockFinanceGet } from '@/mocks/mockApi';

interface TrendPoint { date: string; revenue: number; orders: number; units: number }
import HeaderNav from '@/components/global/HeaderNav';

export default function FinancialPage() {
  const { colors } = useTheme();
  const { filters, set } = useFilters();
  const [bucket, setBucket] = useState<'day'|'week'|'month'>('day');
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [statusRows, setStatusRows] = useState<Array<{ period: string; order_status: string; revenue: number }>>([]);
  const [topCustomers, setTopCustomers] = useState<Array<{ company: string; revenue: number; orders: number; units: number; aov: number }>>([]);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set('from', filters.from);
    params.set('to', filters.to);
    const run = async () => {
      try {
        const t = await mockFinanceGet(`/api/finance/pulse/trend?bucket=${bucket}&${params.toString()}`) as { bucket: string; series: TrendPoint[] };
        setTrend(t.series ?? []);
        const s = await mockFinanceGet(`/api/finance/revenue/status?${params.toString()}`) as Array<{ period: string; order_status: string; revenue: number }>;
        setStatusRows(s ?? []);
        const top = await mockFinanceGet(`/api/finance/customers/top?limit=10&${params.toString()}`) as Array<{ company: string; revenue: number; orders: number; units: number; aov: number }>;
        setTopCustomers(top ?? []);
      } catch (e) {
        console.log('FinancialPage load error', e);
      }
    };
    run();
  }, [filters.from, filters.to, bucket]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]} testID="financial-screen">
      <HeaderNav title="Financial Analytics" />
      <GlobalFilterBar value={filters} onChange={set} />

      <ScrollView contentContainerStyle={styles.body}>
        <PulseKpiStrip filters={filters as FiltersPayload} />

        <Card style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]} testID="trend-card">
          <View style={styles.rowHeader}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Revenue Trend</Text>
            <View style={styles.segmented}>
              {(['day','week','month'] as const).map(b => (
                <TouchableOpacity key={b} onPress={() => setBucket(b)} style={[styles.segBtn, { backgroundColor: bucket===b ? colors.primary : colors.surface, borderColor: colors.border }]} testID={`bucket-${b}`}>
                  <Text style={{ color: bucket===b ? colors.bg : colors.text, fontSize: 12 }}>{b.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          {trend.length === 0 ? (
            <Text style={{ color: colors.subtle }}>No data for selected range.</Text>
          ) : (
            <View>
              {trend.map((p) => (
                <View key={p.date} style={styles.trendRow}>
                  <Text style={[styles.trendDate, { color: colors.subtle }]}>{p.date}</Text>
                  <Text style={[styles.trendVal, { color: colors.text }]} testID={`rev-${p.date}`}>${Math.round(p.revenue).toLocaleString()}</Text>
                  <Text style={[styles.trendValSmall, { color: colors.subtle }]}>{p.orders} orders</Text>
                </View>
              ))}
            </View>
          )}
        </Card>

        <View style={styles.columns}>
          <Card style={[styles.colLeft, { backgroundColor: colors.card, borderColor: colors.border }]} testID="status-card">
            <Text style={[styles.cardTitle, { color: colors.text }]}>Revenue by Order Status</Text>
            {statusRows.length === 0 ? (
              <Text style={{ color: colors.subtle }}>No data</Text>
            ) : (
              <View style={{ marginTop: 8 }}>
                {statusRows.map((r, idx) => (
                  <View key={`${r.period}-${r.order_status}-${idx}`} style={styles.statusRow}>
                    <Text style={[styles.statusLabel, { color: colors.subtle }]}>{r.period} · {r.order_status}</Text>
                    <View style={[styles.barBg, { backgroundColor: colors.surface }]}>
                      <View style={[styles.barFill, { width: `${Math.min(100, Math.round(r.revenue/2000))}%`, backgroundColor: colors.primary }]} />
                    </View>
                    <Text style={[styles.statusVal, { color: colors.text }]}>${Math.round(r.revenue).toLocaleString()}</Text>
                  </View>
                ))}
              </View>
            )}
          </Card>

          <Card style={[styles.colRight, { backgroundColor: colors.card, borderColor: colors.border }]} testID="top-customers-card">
            <Text style={[styles.cardTitle, { color: colors.text }]}>Top Customers</Text>
            {topCustomers.length === 0 ? (
              <Text style={{ color: colors.subtle }}>No data</Text>
            ) : (
              <View style={{ marginTop: 8 }}>
                {topCustomers.slice(0,10).map((c) => (
                  <View key={c.company} style={styles.topRow}>
                    <Text style={[styles.topName, { color: colors.text }]} numberOfLines={1}>{c.company}</Text>
                    <Text style={[styles.topVal, { color: colors.text }]}>${Math.round(c.revenue).toLocaleString()}</Text>
                  </View>
                ))}
              </View>
            )}
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },

  body: { padding: 16, gap: 16 },
  card: { padding: 16, borderWidth: 1, borderRadius: 16 },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  segmented: { flexDirection: 'row', gap: 8 },
  segBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
  trendRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
  trendDate: { fontSize: 12 },
  trendVal: { fontSize: 14, fontWeight: '700' },
  trendValSmall: { fontSize: 12 },
  columns: { flexDirection: 'row', gap: 16, marginTop: 8, flexWrap: 'wrap' },
  colLeft: { flex: 1, minWidth: 280, padding: 16 },
  colRight: { flex: 1, minWidth: 240, padding: 16 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 6 },
  statusLabel: { fontSize: 12, width: 140 },
  barBg: { flex: 1, height: 8, borderRadius: 6, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 6 },
  statusVal: { width: 90, textAlign: 'right', fontSize: 12 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 6 },
  topName: { flex: 1, marginRight: 8 },
  topVal: { width: 100, textAlign: 'right' },
});