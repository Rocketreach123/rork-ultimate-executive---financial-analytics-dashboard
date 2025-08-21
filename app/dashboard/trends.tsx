import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';
import GlobalFilterBar from '@/components/global/GlobalFilterBar';
import { useFilters } from '@/providers/FiltersProvider';
import { Card } from '@/components/ui/Card';
import { mockFinanceGet } from '@/mocks/mockApi';
import { spacing } from '@/constants/theme';

interface TrendPoint { date: string; revenue: number; orders: number; units: number }
interface ScatterPoint { date: string; orders: number; revenue: number }
interface CategorySeries { name: string; data: number[] }
import HeaderNav from '@/components/global/HeaderNav';

export default function TrendsPage() {
  const { colors } = useTheme();
  const { filters, set } = useFilters();
  const [bucket, setBucket] = useState<'day'|'week'|'month'>('day');
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [showMA, setShowMA] = useState<boolean>(false);
  const [showYoY, setShowYoY] = useState<boolean>(false);
  const [monthly, setMonthly] = useState<TrendPoint[]>([]);
  const [scatter, setScatter] = useState<ScatterPoint[]>([]);
  const [catPeriods, setCatPeriods] = useState<string[]>([]);
  const [catSeries, setCatSeries] = useState<CategorySeries[]>([]);

  const fetchAll = useCallback(async () => {
    const params = new URLSearchParams();
    params.set('from', filters.from);
    params.set('to', filters.to);
    try {
      const t = await mockFinanceGet(`/api/finance/pulse/trend?bucket=${bucket}&${params.toString()}`) as { bucket: string; series: TrendPoint[] };
      setTrend(t.series ?? []);
      const m = await mockFinanceGet(`/api/finance/pulse/trend?bucket=month&${params.toString()}`) as { bucket: string; series: TrendPoint[] };
      setMonthly(m.series ?? []);
      const s = await mockFinanceGet(`/api/finance/pulse/trend/scatter?${params.toString()}`) as ScatterPoint[];
      setScatter(s ?? []);
      const cat = await mockFinanceGet(`/api/finance/pulse/trend/category?bucket=month&${params.toString()}`) as { bucket: string; periods: string[]; series: CategorySeries[] };
      setCatPeriods(cat.periods ?? []);
      setCatSeries(cat.series ?? []);
    } catch (e) {
      console.log('TrendsPage load error', e);
    }
  }, [filters.from, filters.to, bucket]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const maSeries = useMemo<number[]>(() => {
    const src = trend.map(p => p.revenue);
    const n = 7;
    const out: number[] = [];
    for (let i = 0; i < src.length; i++) {
      const s = Math.max(0, i - n + 1);
      const slice = src.slice(s, i + 1);
      const avg = slice.reduce((a, b) => a + b, 0) / (slice.length || 1);
      out.push(avg);
    }
    return out;
  }, [trend]);

  const yoySeries = useMemo<number[]>(() => {
    const rev = trend.map(p => p.revenue);
    return rev.map(v => Math.round(v * 0.92));
  }, [trend]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]} testID="trends-screen">
      <HeaderNav title="Trends" />
      <GlobalFilterBar value={filters} onChange={set} />

      <ScrollView contentContainerStyle={styles.body}>
        <Card style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]} testID="main-trend-card">
          <View style={styles.rowHeader}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Revenue Trend</Text>
            <View style={styles.controlsRow}>
              {(['day','week','month'] as const).map(b => (
                <TouchableOpacity key={b} onPress={() => setBucket(b)} style={[styles.segBtn, { backgroundColor: bucket===b ? colors.primary : colors.surface, borderColor: colors.border }]} testID={`bucket-${b}`}>
                  <Text style={{ color: bucket===b ? colors.bg : colors.text, fontSize: 12 }}>{b.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity onPress={() => setShowMA(v => !v)} style={[styles.toggle, { borderColor: colors.border, backgroundColor: showMA ? colors.primary : colors.surface }]} testID="toggle-ma">
                <Text style={{ color: showMA ? colors.bg : colors.text, fontSize: 12 }}>7d MA</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowYoY(v => !v)} style={[styles.toggle, { borderColor: colors.border, backgroundColor: showYoY ? colors.primary : colors.surface }]} testID="toggle-yoy">
                <Text style={{ color: showYoY ? colors.bg : colors.text, fontSize: 12 }}>YoY</Text>
              </TouchableOpacity>
            </View>
          </View>
          {trend.length === 0 ? (
            <Text style={{ color: colors.subtle }}>No data</Text>
          ) : (
            <View style={{ marginTop: 8 }}>
              {trend.map((p, idx) => (
                <View key={p.date} style={styles.trendRow}>
                  <Text style={[styles.trendDate, { color: colors.subtle }]}>{p.date}</Text>
                  <Text style={[styles.trendVal, { color: colors.text }]} testID={`trend-rev-${idx}`}>${Math.round(p.revenue).toLocaleString()}</Text>
                  <Text style={[styles.trendValSmall, { color: colors.subtle }]}>{p.orders} orders</Text>
                </View>
              ))}
              {showMA && (
                <Text style={{ color: colors.subtle, marginTop: 8 }} testID="series-ma">MA: {maSeries.slice(-3).map(v => Math.round(v)).join(', ')}</Text>
              )}
              {showYoY && (
                <Text style={{ color: colors.subtle, marginTop: 4 }} testID="series-yoy">YoY: {yoySeries.slice(-3).map(v => Math.round(v)).join(', ')}</Text>
              )}
            </View>
          )}
        </Card>

        <View style={styles.columns}>
          <Card style={[styles.col, { backgroundColor: colors.card, borderColor: colors.border }]} testID="monthly-bars">
            <Text style={[styles.cardTitle, { color: colors.text }]}>Monthly Revenue</Text>
            {monthly.length === 0 ? (
              <Text style={{ color: colors.subtle }}>No data</Text>
            ) : (
              <View style={{ marginTop: 8 }}>
                {monthly.map((p) => (
                  <View key={p.date} style={styles.statusRow}>
                    <Text style={[styles.statusLabel, { color: colors.subtle }]}>{p.date}</Text>
                    <View style={[styles.barBg, { backgroundColor: colors.surface }]}>
                      <View style={[styles.barFill, { width: `${Math.min(100, Math.round(p.revenue/2000))}%`, backgroundColor: colors.primary }]} />
                    </View>
                    <Text style={[styles.statusVal, { color: colors.text }]}>${Math.round(p.revenue).toLocaleString()}</Text>
                  </View>
                ))}
              </View>
            )}
          </Card>

          <Card style={[styles.col, { backgroundColor: colors.card, borderColor: colors.border }]} testID="orders-vs-revenue">
            <Text style={[styles.cardTitle, { color: colors.text }]}>Orders vs Revenue</Text>
            {scatter.length === 0 ? (
              <Text style={{ color: colors.subtle }}>No data</Text>
            ) : (
              <View style={{ marginTop: 8 }}>
                {scatter.map((pt, i) => (
                  <View key={`${pt.date}-${i}`} style={styles.scatterRow}>
                    <Text style={[styles.scatterDot, { backgroundColor: colors.primary }]} />
                    <Text style={[styles.scatterLabel, { color: colors.text }]}>{pt.orders} orders</Text>
                    <Text style={[styles.scatterVal, { color: colors.text }]}>${Math.round(pt.revenue).toLocaleString()}</Text>
                  </View>
                ))}
              </View>
            )}
          </Card>
        </View>

        <Card style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]} testID="category-stacked">
          <Text style={[styles.cardTitle, { color: colors.text }]}>Category Stacked (share)</Text>
          {catSeries.length === 0 ? (
            <Text style={{ color: colors.subtle }}>No data</Text>
          ) : (
            <View style={{ marginTop: 8 }}>
              {catPeriods.map((period, idx) => (
                <View key={period} style={[styles.stackedRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[styles.stackedPeriod, { color: colors.subtle }]}>{period}</Text>
                  <View style={styles.stackedBars}>
                    {catSeries.map((s, si) => {
                      const total = catSeries.reduce((acc, cur) => acc + (cur.data[idx] ?? 0), 0) || 1;
                      const value = s.data[idx] ?? 0;
                      const pct = Math.max(2, Math.round((value/total) * 100));
                      const color = STK_COLORS[si % STK_COLORS.length];
                      return <View key={`${s.name}-${idx}`} style={{ height: 12, width: `${pct}%`, backgroundColor: color, borderTopLeftRadius: si===0?6:0, borderBottomLeftRadius: si===0?6:0, borderTopRightRadius: si===catSeries.length-1?6:0, borderBottomRightRadius: si===catSeries.length-1?6:0 }} />;
                    })}
                  </View>
                </View>
              ))}
            </View>
          )}
        </Card>
      </ScrollView>
    </View>
  );
}

const STK_COLORS = ['#22D3EE','#34D399','#FBBF24','#A78BFA'] as const;

const styles = StyleSheet.create({
  screen: { flex: 1 },

  body: { padding: spacing.gutter, gap: 16 },
  card: { padding: 16, borderWidth: 1, borderRadius: 16 },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  controlsRow: { flexDirection: 'row', gap: 8 },
  segBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
  toggle: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
  trendRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
  trendDate: { fontSize: 12 },
  trendVal: { fontSize: 14, fontWeight: '700' },
  trendValSmall: { fontSize: 12 },
  columns: { flexDirection: 'row', gap: 16, flexWrap: 'wrap' },
  col: { flex: 1, minWidth: 280, padding: 16, borderWidth: 1, borderRadius: 16 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 6 },
  statusLabel: { fontSize: 12, width: 80 },
  barBg: { flex: 1, height: 8, borderRadius: 6, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 6 },
  statusVal: { width: 90, textAlign: 'right', fontSize: 12 },
  scatterRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 6 },
  scatterDot: { width: 8, height: 8, borderRadius: 4 },
  scatterLabel: { flex: 1, fontSize: 12 },
  scatterVal: { width: 120, textAlign: 'right', fontSize: 12 },
  stackedRow: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 8, borderWidth: 1, borderRadius: 10, marginVertical: 6 },
  stackedPeriod: { width: 72, fontSize: 12 },
  stackedBars: { flex: 1, flexDirection: 'row' },
});
