import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import HeaderNav from '@/components/global/HeaderNav';
import { useTheme } from '@/providers/ThemeProvider';
import { Card } from '@/components/ui/Card';
import { spacing } from '@/constants/theme';
import { mockFinanceGet } from '@/mocks/mockApi';

interface CustomerSummary {
  id?: string;
  name: string;
  code?: string;
  primary_contact?: { name: string; email?: string; phone?: string };
  tags?: string[];
  stats?: { open_orders: number; balance_due: number; last_order_date: string; lifetime_spend: number };
}

interface InvoiceRow { invoice: string; order_id: string; due_date: string; total: number; paid: number }
interface ActivityRow { date: string; type: string; summary: string; order_id?: string; invoice?: string; amount?: number }

function money(n: number){ return `$${Math.round(n).toLocaleString()}`; }

export default function CustomerProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const decodedId = decodeURIComponent(id ?? '');
  const { colors } = useTheme();
  const router = useRouter();

  const [tab, setTab] = useState<'overview'|'orders'|'invoices'|'files'|'contacts'|'activity'|'notes'>('overview');

  const [header, setHeader] = useState<CustomerSummary | null>(null);
  const [recentOrders, setRecentOrders] = useState<Array<{ order_id: string; order_date: string; order_total: number }>>([]);
  const [recentPayments, setRecentPayments] = useState<Array<{ invoice: string; amount: number; date: string }>>([]);
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        const res = await mockFinanceGet(`/api/finance/customers/${encodeURIComponent(decodedId)}`) as any;
        const h = {
          name: res?.header?.company ?? decodedId,
          primary_contact: { name: res?.header?.customer_type ?? 'Primary', email: 'ops@example.com' },
          stats: { open_orders: res?.orders?.length ?? 0, balance_due: 2363.91, last_order_date: res?.orders?.[0]?.order_date ?? '', lifetime_spend: Math.round((res?.header?.lifetime_revenue ?? 0)) },
          tags: ['Preferred','Net30'],
          code: 'CUST-' + (decodedId.slice(0,4).toUpperCase()),
        } as CustomerSummary;
        setHeader(h);
        setRecentOrders(res?.orders?.slice(0,5) ?? []);
        setRecentPayments([
          { invoice: 'INV-1001', amount: 820, date: '2025-08-02' },
          { invoice: 'INV-1003', amount: 420, date: '2025-08-15' },
        ]);
        setInvoices([{ invoice: 'INV-705010', order_id: 'PO-2025-052', due_date: '2025-08-20', total: 1440, paid: 0 }]);
        setNotes('Customer notes...');
      } catch (e) {
        console.log('[CustomerProfile] load error', e);
      }
    })();
  }, [decodedId]);

  const tabs: Array<{key: typeof tab, label: string}> = [
    { key: 'overview', label: 'Overview' },
    { key: 'orders', label: 'Orders' },
    { key: 'invoices', label: 'Invoices & Payments' },
    { key: 'files', label: 'Files' },
    { key: 'contacts', label: 'Contacts' },
    { key: 'activity', label: 'Activity' },
    { key: 'notes', label: 'Notes' },
  ];

  const TabButton = useCallback(({ k, label }: { k: typeof tab; label: string }) => (
    <TouchableOpacity onPress={() => setTab(k)} style={[styles.tabBtn, tab === k && styles.tabBtnActive]}>
      <Text style={[styles.tabText, tab === k && styles.tabTextActive]}>{label}</Text>
    </TouchableOpacity>
  ), [tab]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]} testID="portal-customer-profile">
      <HeaderNav title="Customer" />
      <ScrollView contentContainerStyle={styles.body}>
        <Card style={[styles.headerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.headerRow}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{(header?.name ?? decodedId).slice(0,1).toUpperCase()}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{header?.name ?? decodedId}</Text>
              <Text style={{ color: colors.subtle, marginTop: 2 }}>{header?.primary_contact?.name} · {header?.primary_contact?.email}</Text>
              <View style={styles.tagsRow}>
                {(header?.tags ?? []).map(t => (
                  <View key={t} style={[styles.tag, { borderColor: colors.border, backgroundColor: colors.surface }]}><Text style={{ fontSize: 12, color: colors.text }}>{t}</Text></View>
                ))}
              </View>
            </View>
            <View>
              <Text style={{ color: colors.subtle, fontSize: 12 }}>Code</Text>
              <Text style={[styles.code, { color: colors.text }]}>{header?.code}</Text>
            </View>
          </View>
        </Card>

        <View style={styles.kpis}>
          <Card style={[styles.kpi, { backgroundColor: colors.card, borderColor: colors.border }]}><Text style={styles.kpiLabel}>Open Orders</Text><Text style={[styles.kpiValue, { color: colors.text }]}>{header?.stats?.open_orders ?? 0}</Text></Card>
          <Card style={[styles.kpi, { backgroundColor: colors.card, borderColor: colors.border }]}><Text style={styles.kpiLabel}>Balance Due</Text><Text style={[styles.kpiValue, { color: colors.text }]}>{money(header?.stats?.balance_due ?? 0)}</Text></Card>
          <Card style={[styles.kpi, { backgroundColor: colors.card, borderColor: colors.border }]}><Text style={styles.kpiLabel}>Last Order</Text><Text style={[styles.kpiValue, { color: colors.text }]}>{header?.stats?.last_order_date ?? '-'}</Text></Card>
          <Card style={[styles.kpi, { backgroundColor: colors.card, borderColor: colors.border }]}><Text style={styles.kpiLabel}>Lifetime Spend</Text><Text style={[styles.kpiValue, { color: colors.text }]}>{money(header?.stats?.lifetime_spend ?? 0)}</Text></Card>
        </View>

        <Card style={[styles.tabsCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
            {tabs.map(t => <TabButton key={t.key} k={t.key} label={t.label} />)}
          </ScrollView>

          {tab === 'overview' && (
            <View style={{ padding: 12 }}>
              <Text style={styles.sectionTitle}>Recent Orders</Text>
              {(recentOrders ?? []).slice(0,5).map(o => (
                <View key={o.order_id} style={styles.lineRow}>
                  <Text style={{ flex: 1 }}>{o.order_id}</Text>
                  <Text style={{ width: 100, textAlign: 'right' }}>{o.order_date}</Text>
                  <Text style={{ width: 120, textAlign: 'right' }}>{money(o.order_total)}</Text>
                </View>
              ))}
              <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Recent Payments</Text>
              {(recentPayments ?? []).map(p => (
                <View key={p.invoice} style={styles.lineRow}>
                  <Text style={{ flex: 1 }}>{p.invoice}</Text>
                  <Text style={{ width: 100, textAlign: 'right' }}>{p.date}</Text>
                  <Text style={{ width: 120, textAlign: 'right' }}>{money(p.amount)}</Text>
                </View>
              ))}
            </View>
          )}

          {tab === 'orders' && (
            <View style={{ padding: 12 }}>
              <Text style={styles.sectionTitle}>Orders</Text>
              <Text style={{ color: colors.subtle, marginBottom: 8 }}>Server-side pagination (mock)</Text>
            </View>
          )}

          {tab === 'invoices' && (
            <View style={{ padding: 12 }}>
              <Text style={styles.sectionTitle}>Invoices & Payments</Text>
              {(invoices ?? []).map(inv => (
                <View key={inv.invoice} style={styles.lineRow}>
                  <Text style={{ flex: 1 }}>{inv.invoice}</Text>
                  <Text style={{ width: 120, textAlign: 'right' }}>{inv.due_date}</Text>
                  <Text style={{ width: 100, textAlign: 'right' }}>{money(inv.total)}</Text>
                </View>
              ))}
              <TouchableOpacity style={[styles.payBtn, { backgroundColor: '#1D4ED8' }]} accessibilityRole="button"><Text style={{ color: 'white', fontWeight: '700' }}>Pay Selected</Text></TouchableOpacity>
            </View>
          )}

          {tab === 'files' && (
            <View style={{ padding: 12 }}>
              <Text style={styles.sectionTitle}>Files</Text>
              <Text style={{ color: colors.subtle }}>Customer-level uploads (signed URLs)</Text>
            </View>
          )}

          {tab === 'contacts' && (
            <View style={{ padding: 12 }}>
              <Text style={styles.sectionTitle}>Contacts</Text>
              <Text style={{ color: colors.subtle }}>Primary + additional contacts</Text>
            </View>
          )}

          {tab === 'activity' && (
            <View style={{ padding: 12 }}>
              <Text style={styles.sectionTitle}>Activity</Text>
              <Text style={{ color: colors.subtle }}>Timeline from orders, payments, shipments</Text>
            </View>
          )}

          {tab === 'notes' && (
            <View style={{ padding: 12 }}>
              <Text style={styles.sectionTitle}>Notes</Text>
              <TextInput
                placeholder="Type notes..."
                placeholderTextColor={colors.subtle}
                multiline
                value={notes}
                onChangeText={setNotes}
                style={[styles.notes, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
              />
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
  headerCard: { padding: 16, borderWidth: 1, borderRadius: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: '700' },
  name: { fontSize: 18, fontWeight: '700' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  tag: { borderWidth: 1, borderRadius: 9999, paddingVertical: 4, paddingHorizontal: 8 },
  code: { fontWeight: '700' },
  kpis: { flexDirection: 'row', gap: 12, paddingHorizontal: spacing.gutter, marginTop: 12 },
  kpi: { flex: 1, padding: 12, borderWidth: 1, borderRadius: 12 },
  kpiLabel: { fontSize: 12, color: '#6B7280' },
  kpiValue: { fontSize: 18, fontWeight: '700' },
  tabsCard: { borderWidth: 1, borderRadius: 16, overflow: 'hidden' },
  tabsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 12, paddingTop: 12, paddingBottom: 8 },
  tabBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 9999, backgroundColor: '#F3F4F6' },
  tabBtnActive: { backgroundColor: '#1D4ED8' },
  tabText: { fontSize: 12, color: '#111827' },
  tabTextActive: { color: '#FFFFFF', fontWeight: '700' },
  sectionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  lineRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 8 },
  payBtn: { alignSelf: 'flex-end', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, marginTop: 8 },
  notes: { minHeight: 140, borderWidth: 1, padding: 10, borderRadius: 8 },
});
