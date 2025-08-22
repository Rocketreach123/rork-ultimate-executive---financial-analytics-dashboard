import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Switch } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import HeaderNav from '@/components/global/HeaderNav';
import { useTheme } from '@/providers/ThemeProvider';
import { Card } from '@/components/ui/Card';
import { spacing } from '@/constants/theme';
import { mockFinanceGet } from '@/mocks/mockApi';
import Chart from '@/components/Chart';

interface CustomerSummary {
  customer: {
    id: string;
    name: string;
    client_type: string;
    referral_source: string;
    distributor_groups: string[];
    red_flag: boolean;
  };
  stats: {
    historical_spend: number;
    orders: number;
    units: number;
    aov: number;
    last_order_date: string;
    avg_weekly_revenue: number;
    avg_monthly_revenue: number;
    avg_quarterly_revenue: number;
    avg_weekly_orders: number;
    avg_monthly_orders: number;
    avg_quarterly_orders: number;
  };
  ranking: { overall: number; in_type: number };
}

interface ServicesResponse {
  categories: { name: string; revenue: number; orders: number }[];
}

interface SeasonalityResponse {
  months: string[];
  revenue: number[];
  orders: number[];
}

interface BenchmarkResponse {
  months: string[];
  customer_revenue: number[];
  type_avg_revenue: number[];
}

function money(value: number): string {
  return value?.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }) ?? '$0';
}

function Kpi({ label, value, money: isMoneyFormat = false, testId }: { label: string; value: any; money?: boolean; testId?: string }) {
  const { colors } = useTheme();
  
  const formatValue = (v: any) => {
    if (isMoneyFormat && typeof v === 'number') return money(v);
    if (typeof v === 'number') return v.toLocaleString();
    return v;
  };

  return (
    <View style={[styles.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]} testID={testId}>
      <Text style={[styles.kpiLabel, { color: colors.subtle }]}>{label}</Text>
      <Text style={[styles.kpiValue, { color: colors.text }]}>{formatValue(value)}</Text>
    </View>
  );
}

function ChartCard({ title, children, testId }: { title: string; children: React.ReactNode; testId?: string }) {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]} testID={testId}>
      <View style={[styles.chartHeader, { borderBottomColor: colors.border }]}>
        <Text style={[styles.chartTitle, { color: colors.text }]}>{title}</Text>
      </View>
      <View style={styles.chartBody}>{children}</View>
    </View>
  );
}

export default function CustomerProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const customerId = id ?? '';
  const { colors } = useTheme();

  const [summary, setSummary] = useState<CustomerSummary | null>(null);
  const [services, setServices] = useState<ServicesResponse | null>(null);
  const [seasonality, setSeasonality] = useState<SeasonalityResponse | null>(null);
  const [benchmark, setBenchmark] = useState<BenchmarkResponse | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!customerId) {
      console.log('[CustomerProfile] No customer ID provided');
      return;
    }
    
    (async () => {
      try {
        console.log('[CustomerProfile] Loading data for customer:', customerId);
        const [summaryRes, servicesRes, seasonalityRes, benchmarkRes] = await Promise.all([
          mockFinanceGet(`/api/customers/${customerId}/summary`) as Promise<CustomerSummary>,
          mockFinanceGet(`/api/customers/${customerId}/services`) as Promise<ServicesResponse>,
          mockFinanceGet(`/api/customers/${customerId}/seasonality?bucket=month`) as Promise<SeasonalityResponse>,
          mockFinanceGet(`/api/customers/${customerId}/benchmark?bucket=month`) as Promise<BenchmarkResponse>,
        ]);
        
        console.log('[CustomerProfile] Data loaded:', { summaryRes, servicesRes, seasonalityRes, benchmarkRes });
        
        if (summaryRes && typeof summaryRes === 'object' && 'customer' in summaryRes) {
          setSummary(summaryRes);
        } else {
          console.log('[CustomerProfile] Invalid summary response:', summaryRes);
        }
        
        if (servicesRes && typeof servicesRes === 'object' && 'categories' in servicesRes) {
          setServices(servicesRes);
        } else {
          console.log('[CustomerProfile] Invalid services response:', servicesRes);
        }
        
        if (seasonalityRes && typeof seasonalityRes === 'object' && 'months' in seasonalityRes) {
          setSeasonality(seasonalityRes);
        } else {
          console.log('[CustomerProfile] Invalid seasonality response:', seasonalityRes);
        }
        
        if (benchmarkRes && typeof benchmarkRes === 'object' && 'months' in benchmarkRes) {
          setBenchmark(benchmarkRes);
        } else {
          console.log('[CustomerProfile] Invalid benchmark response:', benchmarkRes);
        }
      } catch (e) {
        console.log('[CustomerProfile] load error', e);
      }
    })();
  }, [customerId]);

  const saveCRM = async (payload: Partial<CustomerSummary['customer']>) => {
    setSaving(true);
    try {
      // Mock PATCH request - in real app this would be:
      // await fetch(`/api/customers/${customerId}/crm`, { method: 'PATCH', body: JSON.stringify(payload) });
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (summary) {
        setSummary({
          ...summary,
          customer: { ...summary.customer, ...payload }
        });
      }
    } catch (e) {
      console.log('[CustomerProfile] save error', e);
    } finally {
      setSaving(false);
    }
  };

  if (!summary || !services || !seasonality || !benchmark) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.bg }]}>
        <HeaderNav title="Customer" />
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading…</Text>
        </View>
      </View>
    );
  }

  const { customer: c, stats: st, ranking } = summary;

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]} testID="customer-profile">
      <HeaderNav title="Customer Profile" />
      <ScrollView contentContainerStyle={styles.body}>
        {/* Header */}
        <Card style={[styles.headerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.headerRow}>
            <View style={styles.headerInfo}>
              <Text style={[styles.customerName, { color: colors.text }]}>{c.name}</Text>
              <Text style={[styles.clientType, { color: colors.subtle }]}>{c.client_type}</Text>
            </View>
            <View style={styles.redFlagContainer}>
              <Text style={[styles.redFlagLabel, { color: colors.text }]}>Red Flag</Text>
              <Switch
                value={c.red_flag}
                onValueChange={(value) => saveCRM({ red_flag: value })}
                testID="crm-redflag"
              />
            </View>
          </View>
        </Card>

        {/* KPI Cards */}
        <View style={styles.kpiGrid}>
          <Kpi label="Historical Spend" value={st.historical_spend} money testId="kpi-historical-spend" />
          <Kpi label="Orders" value={st.orders} testId="kpi-orders" />
          <Kpi label="Units" value={st.units} testId="kpi-units" />
          <Kpi label="AOV" value={st.aov} money testId="kpi-aov" />
          <Kpi label="Last Order" value={st.last_order_date} testId="kpi-last-order" />
          <Kpi label="Avg Weekly ($ / Orders)" value={`${money(st.avg_weekly_revenue)} / ${st.avg_weekly_orders.toFixed(1)}`} testId="kpi-avg-weekly" />
          <Kpi label="Avg Monthly ($ / Orders)" value={`${money(st.avg_monthly_revenue)} / ${st.avg_monthly_orders.toFixed(1)}`} testId="kpi-avg-monthly" />
          <Kpi label="Avg Quarterly ($ / Orders)" value={`${money(st.avg_quarterly_revenue)} / ${st.avg_quarterly_orders.toFixed(1)}`} testId="kpi-avg-quarterly" />
          <Kpi label="Rank Overall" value={`#${ranking.overall}`} testId="kpi-rank-overall" />
          <Kpi label="Rank In-Type" value={`#${ranking.in_type}`} testId="kpi-rank-in-type" />
        </View>

        {/* Service Breakdown */}
        <ChartCard title="Historical Service Breakdown" testId="card-historical-service-breakdown">
          <Chart
            type="bar"
            data={services.categories.map(x => x.revenue)}
            categories={services.categories.map(x => x.name)}
            height={260}
          />
        </ChartCard>

        {/* Seasonality */}
        <ChartCard title="Seasonality (By Month)" testId="card-seasonality-by-month">
          <Chart
            type="line"
            data={seasonality.revenue}
            categories={seasonality.months}
            height={260}
          />
        </ChartCard>

        {/* Benchmark */}
        <ChartCard title={`Benchmark: ${c.name} vs ${c.client_type} Avg`} testId="card-benchmark">
          <View style={styles.benchmarkContainer}>
            <Text style={[styles.benchmarkNote, { color: colors.subtle }]}>
              Customer vs Type Average Revenue
            </Text>
            <Chart
              type="line"
              data={benchmark.customer_revenue}
              categories={benchmark.months}
              height={260}
            />
          </View>
        </ChartCard>

        {/* CRM Fields */}
        <ChartCard title="CRM Fields" testId="card-crm-fields">
          <View style={styles.crmFields}>
            <View style={styles.crmRow}>
              <View style={styles.crmField}>
                <Text style={[styles.crmLabel, { color: colors.text }]}>Referral Source</Text>
                <TextInput
                  style={[styles.crmInput, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
                  defaultValue={c.referral_source}
                  onBlur={(e) => saveCRM({ referral_source: e.nativeEvent.text })}
                  testID="crm-referral"
                />
              </View>
              <View style={styles.crmField}>
                <Text style={[styles.crmLabel, { color: colors.text }]}>Distributor Groups / Affiliations</Text>
                <TextInput
                  style={[styles.crmInput, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
                  defaultValue={c.distributor_groups.join(', ')}
                  onBlur={(e) => saveCRM({ distributor_groups: e.nativeEvent.text.split(',').map(s => s.trim()).filter(Boolean) })}
                  testID="crm-groups"
                />
                <View style={styles.tagsContainer}>
                  {c.distributor_groups.map((group) => (
                    <View key={group} style={[styles.tag, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                      <Text style={[styles.tagText, { color: colors.text }]}>{group}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
            {saving && (
              <Text style={[styles.savingText, { color: colors.subtle }]}>Saving…</Text>
            )}
          </View>
        </ChartCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  body: { padding: spacing.gutter, gap: 16 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: 16 },
  headerCard: { padding: 16, borderWidth: 1, borderRadius: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerInfo: { flex: 1 },
  customerName: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  clientType: { fontSize: 14 },
  redFlagContainer: { alignItems: 'center', gap: 8 },
  redFlagLabel: { fontSize: 14, fontWeight: '600' },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  kpiCard: { flex: 1, minWidth: '45%', padding: 12, borderWidth: 1, borderRadius: 12 },
  kpiLabel: { fontSize: 12, marginBottom: 4 },
  kpiValue: { fontSize: 16, fontWeight: '700' },
  chartCard: { borderWidth: 1, borderRadius: 16, overflow: 'hidden' },
  chartHeader: { padding: 16, borderBottomWidth: 1 },
  chartTitle: { fontSize: 16, fontWeight: '600' },
  chartBody: { padding: 16 },
  benchmarkContainer: { gap: 8 },
  benchmarkNote: { fontSize: 12, textAlign: 'center' },
  crmFields: { gap: 16 },
  crmRow: { gap: 16 },
  crmField: { gap: 8 },
  crmLabel: { fontSize: 14, fontWeight: '600' },
  crmInput: { borderWidth: 1, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, fontSize: 14 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { paddingVertical: 4, paddingHorizontal: 8, borderWidth: 1, borderRadius: 16 },
  tagText: { fontSize: 12 },
  savingText: { fontSize: 12, textAlign: 'center' },
});