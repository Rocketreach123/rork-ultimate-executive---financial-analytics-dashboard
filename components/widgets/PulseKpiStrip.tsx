import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@/providers/ThemeProvider';
import { Card } from '@/components/ui/Card';
import { FiltersPayload } from '@/types/finance';
import { mockFinanceGet } from '@/mocks/mockApi';

interface Props {
  filters: FiltersPayload;
}

type PulseTop = { company: string; revenue: number } | null;

interface PulseResponse {
  kpis: {
    revenue_today: number;
    revenue_week: number;
    revenue_mtd: number;
    revenue_last30: number;
    revenue_ytd: number;
    orders: number;
    units: number;
    aov: number;
    top_customer: PulseTop;
    top_category: { category: string; revenue: number } | null;
  };
  compare?: {
    revenue_week_delta_pct?: number;
    revenue_mtd_delta_pct?: number;
  };
}

function formatCurrency(n: number): string {
  try { return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n); } catch { return `$${Math.round(n).toLocaleString()}`; }
}

function formatNumber(n: number): string { return new Intl.NumberFormat(undefined).format(Math.round(n)); }

export default function PulseKpiStrip({ filters }: Props) {
  const { colors } = useTheme();

  const { data, isLoading, isError, refetch } = useQuery<PulseResponse>({
    queryKey: ['finance-pulse', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('from', filters.from);
      params.set('to', filters.to);
      if (filters.compare) params.set('compare', 'true');
      const res = await mockFinanceGet(`/api/finance/pulse?${params.toString()}`);
      return res as PulseResponse;
    },
  });

  const items = useMemo(() => {
    if (!data) return [] as Array<{ k: string; label: string; value: string; sub?: string }>;
    const k = data.kpis;
    return [
      { k: 'revenue_today', label: 'Revenue Today', value: formatCurrency(k.revenue_today) },
      { k: 'revenue_week', label: 'This Week', value: formatCurrency(k.revenue_week), sub: data.compare?.revenue_week_delta_pct !== undefined ? `${Math.round((data.compare?.revenue_week_delta_pct ?? 0) * 100) / 100}% vs prev` : undefined },
      { k: 'revenue_mtd', label: 'MTD', value: formatCurrency(k.revenue_mtd), sub: data.compare?.revenue_mtd_delta_pct !== undefined ? `${Math.round((data.compare?.revenue_mtd_delta_pct ?? 0) * 100) / 100}% vs last` : undefined },
      { k: 'revenue_last30', label: 'Last 30', value: formatCurrency(k.revenue_last30) },
      { k: 'revenue_ytd', label: 'YTD', value: formatCurrency(k.revenue_ytd) },
      { k: 'orders', label: 'Orders', value: formatNumber(k.orders), sub: `${formatNumber(k.units)} units` },
      { k: 'aov', label: 'AOV', value: formatCurrency(k.aov) },
      { k: 'top_customer', label: 'Top Customer', value: k.top_customer?.company ?? 'N/A', sub: k.top_customer ? formatCurrency(k.top_customer.revenue) : undefined },
      { k: 'top_category', label: 'Top Category', value: k.top_category?.category ?? 'N/A', sub: k.top_category ? formatCurrency(k.top_category.revenue) : undefined },
    ];
  }, [data]);

  return (
    <View style={styles.wrap} testID="pulse-strip">
      {isLoading ? (
        <View style={styles.grid}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}> 
              <View style={[styles.skelTitle, { backgroundColor: colors.surface }]} />
              <View style={[styles.skelValue, { backgroundColor: colors.surface }]} />
              <View style={[styles.skelSub, { backgroundColor: colors.surface }]} />
            </Card>
          ))}
        </View>
      ) : isError ? (
        <Card style={[styles.error, { backgroundColor: colors.card, borderColor: colors.danger }]}>
          <Text style={{ color: colors.danger }}>Failed to load KPIs</Text>
          <Text onPress={() => refetch()} style={{ color: colors.primary, marginTop: 8 }}>Retry</Text>
        </Card>
      ) : items.length === 0 ? (
        <Card style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={{ color: colors.subtle }}>No data for selected range.</Text>
        </Card>
      ) : (
        <View style={styles.grid}>
          {items.map((it) => (
            <Card key={it.k} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.title, { color: colors.subtle }]}>{it.label}</Text>
              <Text style={[styles.value, { color: colors.text }]}>{it.value}</Text>
              {it.sub ? <Text style={[styles.sub, { color: colors.subtle }]}>{it.sub}</Text> : null}
            </Card>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  card: { flexBasis: '24%', flexGrow: 1, padding: 16, borderRadius: 16, borderWidth: 1 },
  title: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  value: { fontSize: 22, fontWeight: '700', marginTop: 6 },
  sub: { fontSize: 12, marginTop: 4 },
  error: { padding: 16, borderWidth: 1, borderRadius: 16 },
  empty: { padding: 16, borderWidth: 1, borderRadius: 16 },
  skelTitle: { height: 10, borderRadius: 6, width: '40%' },
  skelValue: { height: 18, borderRadius: 6, width: '60%', marginTop: 10 },
  skelSub: { height: 10, borderRadius: 6, width: '30%', marginTop: 8 },
});