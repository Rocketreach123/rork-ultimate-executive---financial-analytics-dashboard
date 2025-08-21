import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import HeaderNav from '@/components/global/HeaderNav';
import { useTheme } from '@/providers/ThemeProvider';
import { Card } from '@/components/ui/Card';
import { spacing } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { mockFinanceGet } from '@/mocks/mockApi';

interface Row { company: string; revenue: number; orders: number; units: number; aov: number }

export default function CustomersList() {
  const { colors } = useTheme();
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [query, setQuery] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        const top = await mockFinanceGet('/api/finance/customers/top?limit=200') as Row[];
        setRows(top ?? []);
      } catch (e) {
        console.log('[CustomersList] load error', e);
      }
    })();
  }, []);

  const filtered = useMemo(() => rows.filter(r => r.company.toLowerCase().includes(query.toLowerCase())), [rows, query]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]} testID="portal-customers-list">
      <HeaderNav title="Customers" />
      <ScrollView contentContainerStyle={styles.body}>
        <Card style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TextInput
            placeholder="Search customers..."
            placeholderTextColor={colors.subtle}
            style={[styles.search, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
            value={query}
            onChangeText={setQuery}
          />
          {filtered.map((r) => (
            <TouchableOpacity
              key={r.company}
              style={styles.row}
              onPress={() => router.push({ pathname: '/portal/customers/[id]', params: { id: encodeURIComponent(r.company) } })}
              accessibilityRole="button"
              testID={`portal-customer-${r.company}`}
            >
              <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{r.company}</Text>
              <Text style={[styles.val, { color: colors.text }]}>{`$${Math.round(r.revenue).toLocaleString()}`}</Text>
              <Text style={[styles.val, { color: colors.subtle }]}>{r.orders} orders</Text>
            </TouchableOpacity>
          ))}
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  body: { padding: spacing.gutter },
  card: { padding: 16, borderWidth: 1, borderRadius: 16 },
  search: { borderWidth: 1, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, gap: 8 },
  name: { flex: 1, marginRight: 8, fontWeight: '600' },
  val: { width: 120, textAlign: 'right', fontSize: 12 },
});
