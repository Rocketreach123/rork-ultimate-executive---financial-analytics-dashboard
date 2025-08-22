import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Switch, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import HeaderNav from '@/components/global/HeaderNav';
import { useTheme } from '@/providers/ThemeProvider';
import { Card } from '@/components/ui/Card';
import { spacing } from '@/constants/theme';
import { mockFinanceGet } from '@/mocks/mockApi';
import Chart from '@/components/Chart';
import { User, Mail, Phone, Calendar, TrendingUp, TrendingDown, Award, AlertTriangle, FileText, Activity } from 'lucide-react-native';

interface CustomerSummary {
  customer: {
    id: string;
    name: string;
    client_type: string;
    referral_source: string;
    distributor_groups: string[];
    red_flag: boolean;
    vip_status?: boolean;
    credit_terms?: string;
    primary_contact?: {
      name: string;
      email: string;
      phone: string;
      role: string;
    };
    tags?: string[];
    notes?: string;
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
    open_orders: number;
    balance_due: number;
    lifetime_spend: number;
    growth_pct?: number;
    share_of_wallet?: number;
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
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'invoices' | 'files' | 'contacts' | 'activity' | 'notes'>('overview');
  const [notes, setNotes] = useState<string>('');

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
          setNotes(summaryRes.customer.notes || '');
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <View style={styles.tabContent}>
            {/* KPI Cards */}
            <View style={styles.kpiGrid}>
              <Kpi label="Open Orders" value={st.open_orders} testId="kpi-open-orders" />
              <Kpi label="Balance Due" value={st.balance_due} money testId="kpi-balance-due" />
              <Kpi label="Last Order" value={st.last_order_date} testId="kpi-last-order" />
              <Kpi label="Lifetime Spend" value={st.lifetime_spend} money testId="kpi-lifetime-spend" />
            </View>
            
            {/* Recent Activity */}
            <ChartCard title="Recent Orders (Last 5)" testId="card-recent-orders">
              <Text style={[styles.placeholderText, { color: colors.subtle }]}>Recent orders would be displayed here</Text>
            </ChartCard>
            
            <ChartCard title="Recent Payments" testId="card-recent-payments">
              <Text style={[styles.placeholderText, { color: colors.subtle }]}>Recent payments would be displayed here</Text>
            </ChartCard>
          </View>
        );
      
      case 'orders':
        return (
          <View style={styles.tabContent}>
            <ChartCard title="Customer Orders" testId="card-customer-orders">
              <Text style={[styles.placeholderText, { color: colors.subtle }]}>Orders table with server-side pagination would be here</Text>
            </ChartCard>
          </View>
        );
      
      case 'invoices':
        return (
          <View style={styles.tabContent}>
            <ChartCard title="Invoices & Payments" testId="card-invoices-payments">
              <Text style={[styles.placeholderText, { color: colors.subtle }]}>Invoices table with overdue first, checkbox select + Pay Selected would be here</Text>
            </ChartCard>
          </View>
        );
      
      case 'files':
        return (
          <View style={styles.tabContent}>
            <ChartCard title="Customer Files" testId="card-customer-files">
              <TouchableOpacity style={[styles.uploadBtn, { backgroundColor: colors.primary }]}>
                <FileText size={16} color={colors.card} />
                <Text style={[styles.uploadBtnText, { color: colors.card }]}>Upload File</Text>
              </TouchableOpacity>
              <Text style={[styles.placeholderText, { color: colors.subtle }]}>File list with signed URLs would be here</Text>
            </ChartCard>
          </View>
        );
      
      case 'contacts':
        return (
          <View style={styles.tabContent}>
            <ChartCard title="Customer Contacts" testId="card-customer-contacts">
              {c.primary_contact && (
                <View style={styles.contactCard}>
                  <View style={styles.contactHeader}>
                    <User size={20} color={colors.primary} />
                    <Text style={[styles.contactName, { color: colors.text }]}>{c.primary_contact.name}</Text>
                    <Text style={[styles.contactRole, { color: colors.subtle }]}>{c.primary_contact.role}</Text>
                  </View>
                  <View style={styles.contactDetails}>
                    <View style={styles.contactItem}>
                      <Mail size={16} color={colors.subtle} />
                      <Text style={[styles.contactText, { color: colors.text }]}>{c.primary_contact.email}</Text>
                    </View>
                    <View style={styles.contactItem}>
                      <Phone size={16} color={colors.subtle} />
                      <Text style={[styles.contactText, { color: colors.text }]}>{c.primary_contact.phone}</Text>
                    </View>
                  </View>
                </View>
              )}
              <Text style={[styles.placeholderText, { color: colors.subtle }]}>Additional contacts table would be here</Text>
            </ChartCard>
          </View>
        );
      
      case 'activity':
        return (
          <View style={styles.tabContent}>
            <ChartCard title="Activity Timeline" testId="card-activity-timeline">
              <Text style={[styles.placeholderText, { color: colors.subtle }]}>Timeline of events from order_events + payments + shipments would be here</Text>
            </ChartCard>
          </View>
        );
      
      case 'notes':
        return (
          <View style={styles.tabContent}>
            <ChartCard title="Customer Notes" testId="card-customer-notes">
              <TextInput
                style={[styles.notesInput, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
                placeholder="Add notes about this customer..."
                placeholderTextColor={colors.subtle}
                value={notes}
                onChangeText={setNotes}
                onBlur={() => saveCRM({ notes })}
                multiline
                numberOfLines={8}
                textAlignVertical="top"
                testID="customer-notes"
              />
            </ChartCard>
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]} testID="customer-profile">
      <HeaderNav title="Customer Profile" />
      <ScrollView contentContainerStyle={styles.body}>
        {/* Header */}
        <Card style={[styles.headerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.headerRow}>
            <View style={styles.headerInfo}>
              <View style={styles.customerHeader}>
                <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.avatarText, { color: colors.card }]}>
                    {c.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.customerDetails}>
                  <Text style={[styles.customerName, { color: colors.text }]}>{c.name}</Text>
                  <Text style={[styles.clientType, { color: colors.subtle }]}>{c.client_type} • {c.credit_terms || 'Net30'}</Text>
                  {c.primary_contact && (
                    <Text style={[styles.contactInfo, { color: colors.subtle }]}>
                      {c.primary_contact.name} • {c.primary_contact.email}
                    </Text>
                  )}
                </View>
              </View>
              
              {/* Tags */}
              {(c.tags || c.distributor_groups) && (
                <View style={styles.tagsContainer}>
                  {c.tags?.map((tag) => (
                    <View key={tag} style={[styles.tag, { backgroundColor: colors.success, opacity: 0.1 }]}>
                      <Text style={[styles.tagText, { color: colors.success }]}>{tag}</Text>
                    </View>
                  ))}
                  {c.distributor_groups?.map((group) => (
                    <View key={group} style={[styles.tag, { backgroundColor: colors.primary, opacity: 0.1 }]}>
                      <Text style={[styles.tagText, { color: colors.primary }]}>{group}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
            
            <View style={styles.headerActions}>
              <View style={styles.flagContainer}>
                <Text style={[styles.flagLabel, { color: colors.text }]}>VIP</Text>
                <Switch
                  value={c.vip_status || false}
                  onValueChange={(value) => saveCRM({ vip_status: value })}
                  testID="crm-vip"
                />
              </View>
              <View style={styles.flagContainer}>
                <AlertTriangle size={16} color={c.red_flag ? colors.error : colors.subtle} />
                <Text style={[styles.flagLabel, { color: colors.text }]}>Red Flag</Text>
                <Switch
                  value={c.red_flag}
                  onValueChange={(value) => saveCRM({ red_flag: value })}
                  testID="crm-redflag"
                />
              </View>
            </View>
          </View>
        </Card>

        {/* Summary KPI Cards */}
        <View style={styles.kpiGrid}>
          <Kpi label="Historical Spend" value={st.historical_spend} money testId="kpi-historical-spend" />
          <Kpi label="Orders" value={st.orders} testId="kpi-orders" />
          <Kpi label="Units" value={st.units} testId="kpi-units" />
          <Kpi label="AOV" value={st.aov} money testId="kpi-aov" />
          <Kpi label="Avg Weekly ($ / Orders)" value={`${money(st.avg_weekly_revenue)} / ${st.avg_weekly_orders.toFixed(1)}`} testId="kpi-avg-weekly" />
          <Kpi label="Avg Monthly ($ / Orders)" value={`${money(st.avg_monthly_revenue)} / ${st.avg_monthly_orders.toFixed(1)}`} testId="kpi-avg-monthly" />
          <Kpi label="Avg Quarterly ($ / Orders)" value={`${money(st.avg_quarterly_revenue)} / ${st.avg_quarterly_orders.toFixed(1)}`} testId="kpi-avg-quarterly" />
          <View style={[styles.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]} testID="kpi-ranking">
            <Text style={[styles.kpiLabel, { color: colors.subtle }]}>Rankings</Text>
            <View style={styles.rankingContainer}>
              <View style={styles.rankingItem}>
                <Award size={16} color={colors.warning} />
                <Text style={[styles.rankingText, { color: colors.text }]}>#{ranking.overall} Overall</Text>
              </View>
              <View style={styles.rankingItem}>
                <TrendingUp size={16} color={colors.success} />
                <Text style={[styles.rankingText, { color: colors.text }]}>#{ranking.in_type} In-Type</Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
            {[
              { key: 'overview', label: 'Overview', icon: Activity },
              { key: 'orders', label: 'Orders', icon: FileText },
              { key: 'invoices', label: 'Invoices & Payments', icon: Calendar },
              { key: 'files', label: 'Files', icon: FileText },
              { key: 'contacts', label: 'Contacts', icon: User },
              { key: 'activity', label: 'Activity', icon: Activity },
              { key: 'notes', label: 'Notes', icon: FileText },
            ].map(({ key, label, icon: Icon }) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.tab,
                  { borderColor: colors.border },
                  activeTab === key && { backgroundColor: colors.primary, borderColor: colors.primary }
                ]}
                onPress={() => setActiveTab(key as any)}
                testID={`tab-${key}`}
              >
                <Icon size={16} color={activeTab === key ? colors.card : colors.text} />
                <Text style={[
                  styles.tabText,
                  { color: activeTab === key ? colors.card : colors.text }
                ]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        {/* Tab Content */}
        {renderTabContent()}

        {/* Analytics Charts */}
        <View style={styles.chartsGrid}>
          {/* Service Breakdown */}
          <ChartCard title="Historical Service Breakdown" testId="card-historical-service-breakdown">
            <Chart
              type="bar"
              data={services.categories.map(x => x.revenue)}
              categories={services.categories.map(x => x.name)}
              height={200}
            />
          </ChartCard>

          {/* Seasonality */}
          <ChartCard title="Seasonality (By Month)" testId="card-seasonality-by-month">
            <Chart
              type="line"
              data={seasonality.revenue}
              categories={seasonality.months}
              height={200}
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
                height={200}
              />
            </View>
          </ChartCard>
        </View>

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
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  headerInfo: { flex: 1 },
  customerHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 16, fontWeight: '700' },
  customerDetails: { flex: 1 },
  customerName: { fontSize: 20, fontWeight: '700', marginBottom: 2 },
  clientType: { fontSize: 14, marginBottom: 2 },
  contactInfo: { fontSize: 12 },
  headerActions: { gap: 12 },
  flagContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  flagLabel: { fontSize: 12, fontWeight: '600' },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12 },
  tagText: { fontSize: 11, fontWeight: '600' },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  kpiCard: { flex: 1, minWidth: '45%', padding: 12, borderWidth: 1, borderRadius: 12 },
  kpiLabel: { fontSize: 12, marginBottom: 4 },
  kpiValue: { fontSize: 16, fontWeight: '700' },
  rankingContainer: { gap: 4 },
  rankingItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rankingText: { fontSize: 12, fontWeight: '600' },
  tabsContainer: { marginVertical: 8 },
  tabsScroll: { flexGrow: 0 },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderRadius: 20, marginRight: 8 },
  tabText: { fontSize: 12, fontWeight: '600' },
  tabContent: { gap: 16 },
  chartsGrid: { gap: 16 },
  chartCard: { borderWidth: 1, borderRadius: 16, overflow: 'hidden' },
  chartHeader: { padding: 16, borderBottomWidth: 1 },
  chartTitle: { fontSize: 16, fontWeight: '600' },
  chartBody: { padding: 16 },
  benchmarkContainer: { gap: 8 },
  benchmarkNote: { fontSize: 12, textAlign: 'center' },
  placeholderText: { fontSize: 14, textAlign: 'center', padding: 20 },
  uploadBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 16 },
  uploadBtnText: { fontSize: 14, fontWeight: '600' },
  contactCard: { padding: 16, marginBottom: 16 },
  contactHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  contactName: { fontSize: 16, fontWeight: '600' },
  contactRole: { fontSize: 12 },
  contactDetails: { gap: 4 },
  contactItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  contactText: { fontSize: 14 },
  notesInput: { borderWidth: 1, padding: 12, borderRadius: 8, fontSize: 14, minHeight: 120 },
  crmFields: { gap: 16 },
  crmRow: { gap: 16 },
  crmField: { gap: 8 },
  crmLabel: { fontSize: 14, fontWeight: '600' },
  crmInput: { borderWidth: 1, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, fontSize: 14 },
  savingText: { fontSize: 12, textAlign: 'center' },
});