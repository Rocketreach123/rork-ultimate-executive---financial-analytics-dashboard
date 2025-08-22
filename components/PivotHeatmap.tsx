import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { TrendingUp, TrendingDown, AlertTriangle, Award } from 'lucide-react-native';

type Row = {
  customer_id: string;
  company: string;
  client_type: string;
  monthly: number[];
  total: number;
  orders: number;
  units: number;
  growth_pct?: number;
  last_order_date?: string;
  credit_terms?: string;
  distributor_groups?: string[];
  red_flag?: boolean;
  share_of_wallet?: number;
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
  
  const { colStats, totalsRow } = useMemo(() => {
    if (rows.length === 0 || months.length === 0) {
      console.log('[PivotHeatmap] No data for column stats');
      return { colStats: { min: [], max: [] }, totalsRow: null };
    }
    
    try {
      const min: number[] = months.map((_, i) => {
        const values = rows.map(r => r.monthly?.[i] ?? 0).filter(v => typeof v === 'number');
        return values.length > 0 ? Math.min(...values) : 0;
      });
      const max: number[] = months.map((_, i) => {
        const values = rows.map(r => r.monthly?.[i] ?? 0).filter(v => typeof v === 'number');
        return values.length > 0 ? Math.max(...values) : 1;
      });
      
      // Calculate totals row
      const monthlyTotals = months.map((_, i) => {
        return rows.reduce((sum, r) => sum + (r.monthly?.[i] ?? 0), 0);
      });
      const grandTotal = monthlyTotals.reduce((a, b) => a + b, 0);
      const totalOrders = rows.reduce((sum, r) => sum + r.orders, 0);
      const totalUnits = rows.reduce((sum, r) => sum + r.units, 0);
      
      const totalsRow = {
        monthlyTotals,
        grandTotal,
        totalOrders,
        totalUnits,
      };
      
      console.log('[PivotHeatmap] Column stats:', { min: min.slice(0, 3), max: max.slice(0, 3) });
      return { colStats: { min, max }, totalsRow };
    } catch (e) {
      console.log('[PivotHeatmap] Error calculating column stats:', e);
      return { colStats: { min: [], max: [] }, totalsRow: null };
    }
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
              <Text style={[styles.headerText, { color: colors.text }]}>Growth</Text>
            </View>
            <View style={[styles.numberCell, styles.headerCell]}>
              <Text style={[styles.headerText, { color: colors.text }]}>Orders</Text>
            </View>
            <View style={[styles.numberCell, styles.headerCell]}>
              <Text style={[styles.headerText, { color: colors.text }]}>Units</Text>
            </View>
          </View>

          {/* Data Rows */}
          <ScrollView style={styles.dataContainer} showsVerticalScrollIndicator={true}>
            {rows.length > 0 ? (
              <>
                {rows.map((r) => (
                  <View key={r.customer_id} style={[styles.dataRow, { borderBottomColor: colors.border }]}>
                    <TouchableOpacity 
                      style={[styles.companyCell, styles.dataCell]}
                      onPress={() => {
                        console.log('[PivotHeatmap] Customer clicked:', r.customer_id, r.company);
                        onCustomerClick(r);
                      }}
                      testID={`customer-${r.customer_id}`}
                    >
                      <View style={styles.companyInfo}>
                        <View style={styles.companyNameRow}>
                          {r.red_flag && <AlertTriangle size={12} color={colors.error} />}
                          <Text style={[styles.companyName, { color: colors.primary }]} numberOfLines={1}>
                            {r.company}
                          </Text>
                        </View>
                        <Text style={[styles.clientType, { color: colors.subtle }]} numberOfLines={1}>
                          {r.client_type}
                        </Text>
                      </View>
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
                      <View style={styles.growthContainer}>
                        {r.growth_pct !== undefined && (
                          <>
                            {r.growth_pct >= 0 ? (
                              <TrendingUp size={12} color={colors.success} />
                            ) : (
                              <TrendingDown size={12} color={colors.error} />
                            )}
                            <Text style={[
                              styles.growthText, 
                              { color: r.growth_pct >= 0 ? colors.success : colors.error }
                            ]}>
                              {r.growth_pct.toFixed(1)}%
                            </Text>
                          </>
                        )}
                      </View>
                    </View>
                    
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
                ))}
                
                {/* Totals Row */}
                {totalsRow && (
                  <View style={[styles.totalsRow, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
                    <View style={[styles.companyCell, styles.dataCell]}>
                      <View style={styles.totalsLabel}>
                        <Award size={16} color={colors.warning} />
                        <Text style={[styles.totalsText, { color: colors.text }]}>TOTALS</Text>
                      </View>
                    </View>
                    
                    {totalsRow.monthlyTotals.map((total: number, i: number) => (
                      <View key={i} style={[styles.monthCell, styles.dataCell]}>
                        <Text style={[styles.totalsValue, { color: colors.text }]}>
                          {money(total)}
                        </Text>
                      </View>
                    ))}
                    
                    <View style={[styles.numberCell, styles.dataCell]}>
                      <Text style={[styles.totalsValue, { color: colors.text }]}>—</Text>
                    </View>
                    
                    <View style={[styles.numberCell, styles.dataCell]}>
                      <Text style={[styles.totalsValue, { color: colors.text }]}>
                        {totalsRow.totalOrders.toLocaleString()}
                      </Text>
                    </View>
                    
                    <View style={[styles.numberCell, styles.dataCell]}>
                      <Text style={[styles.totalsValue, { color: colors.text }]}>
                        {totalsRow.totalUnits.toLocaleString()}
                      </Text>
                    </View>
                  </View>
                )}
              </>
            ) : (
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
  companyInfo: {
    flex: 1,
  },
  companyNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
  growthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  growthText: {
    fontSize: 10,
    fontWeight: '600',
  },
  numberText: {
    fontSize: 12,
    textAlign: 'center',
  },
  totalsRow: {
    flexDirection: 'row',
    borderTopWidth: 2,
  },
  totalsLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  totalsText: {
    fontSize: 12,
    fontWeight: '700',
  },
  totalsValue: {
    fontSize: 12,
    fontWeight: '700',
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