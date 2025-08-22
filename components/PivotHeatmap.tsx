import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';

type Row = {
  customer_id: string;
  company: string;
  client_type: string;
  monthly: number[];
  total: number;
  orders: number;
  units: number;
};

type Props = {
  months: string[];
  rows: Row[];
  onCustomerClick: (row: Row) => void;
};

function colorFor(value: number, min: number, max: number) {
  if (max === min) return { backgroundColor: 'rgba(200,200,200,0.25)' };
  const t = (value - min) / (max - min); // 0..1 (low→high)
  // high→green, mid→yellow, low→red (invert red at low):
  const r = Math.round(255 * (1 - t));           // low red 255 → 0
  const g = Math.round(180 + 75 * t);             // 180..255
  const b = 120;                                  // fixed
  return { backgroundColor: `rgba(${r},${g},${b},0.25)` };
}

function money(value: number): string {
  return value?.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }) ?? '$0';
}

export default function PivotHeatmap({ months, rows, onCustomerClick }: Props) {
  const { colors } = useTheme();
  
  console.log('[PivotHeatmap] Rendering with:', { monthsCount: months.length, rowsCount: rows.length });
  
  const colStats = useMemo(() => {
    if (rows.length === 0 || months.length === 0) {
      return { min: [], max: [] };
    }
    const min: number[] = months.map((_, i) => Math.min(...rows.map(r => r.monthly[i] ?? 0)));
    const max: number[] = months.map((_, i) => Math.max(...rows.map(r => r.monthly[i] ?? 0)));
    console.log('[PivotHeatmap] Column stats:', { min: min.slice(0, 3), max: max.slice(0, 3) });
    return { min, max };
  }, [months, rows]);

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]} testID="pivot-heatmap">
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {/* Header */}
          <View style={[styles.headerRow, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
            <View style={[styles.companyCell, styles.headerCell]}>
              <Text style={[styles.headerText, { color: colors.text }]}>Company</Text>
            </View>
            {months.map(m => (
              <View key={m} style={[styles.monthCell, styles.headerCell]}>
                <Text style={[styles.headerText, { color: colors.text }]}>{m}</Text>
              </View>
            ))}
            <View style={[styles.numberCell, styles.headerCell]}>
              <Text style={[styles.headerText, { color: colors.text }]}>Orders</Text>
            </View>
            <View style={[styles.numberCell, styles.headerCell]}>
              <Text style={[styles.headerText, { color: colors.text }]}>Units</Text>
            </View>
          </View>

          {/* Data Rows */}
          <ScrollView style={styles.dataContainer} showsVerticalScrollIndicator={true}>
            {rows.length > 0 ? rows.map((r) => (
              <View key={r.customer_id} style={[styles.dataRow, { borderBottomColor: colors.border }]}>
                <TouchableOpacity 
                  style={[styles.companyCell, styles.dataCell]}
                  onPress={() => {
                    console.log('[PivotHeatmap] Customer clicked:', r.customer_id, r.company);
                    onCustomerClick(r);
                  }}
                  testID={`customer-${r.customer_id}`}
                >
                  <Text style={[styles.companyName, { color: colors.primary }]} numberOfLines={1}>
                    {r.company}
                  </Text>
                  <Text style={[styles.clientType, { color: colors.subtle }]} numberOfLines={1}>
                    {r.client_type}
                  </Text>
                </TouchableOpacity>
                
                {r.monthly.map((v, ci) => (
                  <View key={ci} style={[styles.monthCell, styles.dataCell]}>
                    <View style={[
                      styles.heatCell,
                      colorFor(v, colStats.min[ci] || 0, colStats.max[ci] || 1)
                    ]}>
                      <Text style={[styles.heatText, { color: colors.text }]}>
                        {money(v)}
                      </Text>
                    </View>
                  </View>
                ))}
                
                <View style={[styles.numberCell, styles.dataCell]}>
                  <Text style={[styles.numberText, { color: colors.text }]}>
                    {r.orders.toLocaleString()}
                  </Text>
                </View>
                
                <View style={[styles.numberCell, styles.dataCell]}>
                  <Text style={[styles.numberText, { color: colors.text }]}>
                    {r.units.toLocaleString()}
                  </Text>
                </View>
              </View>
            )) : (
              <View style={styles.noDataRow}>
                <Text style={[styles.noDataText, { color: colors.subtle }]}>No customer data available</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
    maxHeight: 600,
  },
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  dataContainer: {
    maxHeight: 500,
  },
  dataRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  headerCell: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  dataCell: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  companyCell: {
    width: 200,
    minWidth: 200,
  },
  monthCell: {
    width: 90,
    minWidth: 90,
    alignItems: 'center',
  },
  numberCell: {
    width: 80,
    minWidth: 80,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  companyName: {
    fontSize: 14,
    fontWeight: '600',
  },
  clientType: {
    fontSize: 11,
    marginTop: 2,
  },
  heatCell: {
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 6,
    minHeight: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heatText: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  numberText: {
    fontSize: 12,
    textAlign: 'center',
  },
  noDataRow: {
    padding: 20,
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 14,
  },
});