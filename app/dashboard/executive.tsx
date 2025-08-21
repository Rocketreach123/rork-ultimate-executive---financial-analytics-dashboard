import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useFilters } from '@/providers/FiltersProvider';
import GlobalFilterBar from '@/components/global/GlobalFilterBar';
import { spacing } from '@/constants/theme';
import { useTheme } from '@/providers/ThemeProvider';
import PulseKpiStrip from '@/components/widgets/PulseKpiStrip';
import { Card } from '@/components/ui/Card';
import { mockFinanceGet } from '@/mocks/mockApi';

interface TrendPoint { date: string; revenue: number; orders: number; units: number }
interface HighValueRow { order_id: string; order_date: string; company: string; order_total: number; units: number; top_categories?: string[] }
interface TopRow { company: string; revenue: number; orders: number; units: number; aov: number }
interface ColdRow { company: string; last_order_date: string; last_order_value: number; avg_orders_per_month: number; customer_type: string }
interface StatusRow { period: string; order_status: string; revenue: number }

export default function ExecutivePage() {
  const { filters, set } = useFilters();
  const { colors } = useTheme();
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [top, setTop] = useState<TopRow[]>([]);
  const [high, setHigh] = useState<HighValueRow[]>([]);
  const [cold, setCold] = useState<ColdRow[]>([]);
  const [statusRows, setStatusRows] = useState<StatusRow[]>([]);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set('from', filters.from);
    params.set('to', filters.to);
    (async () => {
      try {
        const t = await mockFinanceGet(`/api/finance/pulse/trend?bucket=day&${params.toString()}`) as { bucket: string; series: TrendPoint[] };
        setTrend(t.series ?? []);
        const top10 = await mockFinanceGet(`/api/finance/customers/top?limit=10&${params.toString()}`) as TopRow[];
        setTop(top10 ?? []);
        const hv = await mockFinanceGet(`/api/finance/orders/high-value?rev_min=5000&units_min=1000&${params.toString()}`) as HighValueRow[];
        setHigh(hv ?? []);
        const cc = await mockFinanceGet(`/api/finance/customers/cold?days=21&min_orders_90d=3`) as ColdRow[];
        setCold(cc ?? []);
        const sr = await mockFinanceGet(`/api/finance/revenue/status?${params.toString()}`) as StatusRow[];
        setStatusRows(sr ?? []);
      } catch (e) {
        console.log('ExecutivePage load error', e);
      }
    })();
  }, [filters.from, filters.to]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]} testID="executive-screen">
      <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.text }]}>Executive Dashboard</Text>
      </View>
      <View style={[styles.subnav, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
        <Text style={[styles.subnavText, { color: colors.subtle }]}>Pulse • Trend • Top • Cold • Heatmaps • Status</Text>
      </View>
      <GlobalFilterBar value={filters} onChange={set} />

      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.row}>
          <PulseKpiStrip filters={filters} />
        </View>

        <Card style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]} testID="trend-card-exec">
          <Text style={[styles.cardTitle, { color: colors.text }]}>Revenue Trend</Text>
          {trend.length === 0 ? (
            <Text style={{ color: colors.subtle }}>No data</Text>
          ) : (
            <View style={{ marginTop: 8 }}>
              {trend.map((p) => (
                <View key={p.date} style={styles.trendRow}>
                  <Text style={[styles.trendDate, { color: colors.subtle }]}>{p.date}</Text>
                  <Text style={[styles.trendVal, { color: colors.text }]} testID={`exec-rev-${p.date}`}>${Math.round(p.revenue).toLocaleString()}</Text>
                  <Text style={[styles.trendValSmall, { color: colors.subtle }]}>{p.orders} orders</Text>
                </View>
              ))}
            </View>
          )}
        </Card>

        <View style={styles.columns}>
          <Card style={[styles.colLeft, { backgroundColor: colors.card, borderColor: colors.border }]} testID="top-customers-exec">
            <Text style={[styles.cardTitle, { color: colors.text }]}>Top 10 Customers</Text>
            {top.length === 0 ? (
              <Text style={{ color: colors.subtle }}>No data</Text>
            ) : (
              <View style={{ marginTop: 8 }}>
                {top.slice(0,10).map((c) => (
                  <View key={c.company} style={styles.topRow}>
                    <Text style={[styles.topName, { color: colors.text }]} numberOfLines={1}>{c.company}</Text>
                    <Text style={[styles.topVal, { color: colors.text }]}>${Math.round(c.revenue).toLocaleString()}</Text>
                  </View>
                ))}
              </View>
            )}
          </Card>

          <Card style={[styles.colRight, { backgroundColor: colors.card, borderColor: colors.border }]} testID="high-value-exec">
            <Text style={[styles.cardTitle, { color: colors.text }]}>High-Value Orders</Text>
            {high.length === 0 ? (
              <Text style={{ color: colors.subtle }}>No data</Text>
            ) : (
              <View style={{ marginTop: 8 }}>
                {high.map((r) => (
                  <View key={r.order_id} style={styles.hvRow}>
                    <Text style={[styles.hvId, { color: colors.subtle }]}>{r.order_id}</Text>
                    <Text style={[styles.hvCompany, { color: colors.text }]} numberOfLines={1}>{r.company}</Text>
                    <Text style={[styles.hvUnits, { color: colors.subtle }]}>{r.units} u</Text>
                    <Text style={[styles.hvVal, { color: colors.text }]}>${Math.round(r.order_total).toLocaleString()}</Text>
                  </View>
                ))}
              </View>
            )}
          </Card>
        </View>

        <View style={styles.columns}>
          <Card style={[styles.colLeft, { backgroundColor: colors.card, borderColor: colors.border }]} testID="cold-customers-exec">
            <Text style={[styles.cardTitle, { color: colors.text }]}>Cold Customers</Text>
            {cold.length === 0 ? (
              <Text style={{ color: colors.subtle }}>No data</Text>
            ) : (
              <View style={{ marginTop: 8 }}>
                {cold.map((c) => (
                  <View key={c.company} style={styles.coldRow}>
                    <Text style={[styles.coldName, { color: colors.text }]} numberOfLines={1}>{c.company}</Text>
                    <Text style={[styles.coldType, { color: colors.subtle }]}>{c.customer_type}</Text>
                    <Text style={[styles.coldDate, { color: colors.subtle }]}>{c.last_order_date}</Text>
                    <Text style={[styles.coldVal, { color: colors.text }]}>${Math.round(c.last_order_value).toLocaleString()}</Text>
                  </View>
                ))}
              </View>
            )}
          </Card>

          <Card style={[styles.colRight, { backgroundColor: colors.card, borderColor: colors.border }]} testID="status-exec">
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
        </View>
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
  body: { padding: spacing.gutter, gap: 24 },
  row: { },
  card: { padding: 16, borderWidth: 1, borderRadius: 16 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  trendRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
  trendDate: { fontSize: 12 },
  trendVal: { fontSize: 14, fontWeight: '700' },
  trendValSmall: { fontSize: 12 },
  columns: { flexDirection: 'row', gap: 16, flexWrap: 'wrap' },
  colLeft: { flex: 1, minWidth: 280, padding: 16 },
  colRight: { flex: 1, minWidth: 280, padding: 16 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 6 },
  topName: { flex: 1, marginRight: 8 },
  topVal: { width: 100, textAlign: 'right' },
  hvRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 6 },
  hvId: { width: 80, fontSize: 12 },
  hvCompany: { flex: 1, fontSize: 12 },
  hvUnits: { width: 60, textAlign: 'right', fontSize: 12 },
  hvVal: { width: 100, textAlign: 'right', fontSize: 12 },
  coldRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 6 },
  coldName: { flex: 1, fontSize: 12 },
  coldType: { width: 80, fontSize: 12 },
  coldDate: { width: 100, fontSize: 12 },
  coldVal: { width: 100, textAlign: 'right', fontSize: 12 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 6 },
  statusLabel: { fontSize: 12, width: 140 },
  barBg: { flex: 1, height: 8, borderRadius: 6, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 6 },
  statusVal: { width: 90, textAlign: 'right', fontSize: 12 },
});
