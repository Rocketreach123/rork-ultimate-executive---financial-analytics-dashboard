import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import type { OrderData } from '@/types/finance';
import { useRouter } from 'expo-router';

export type PivotMeasure = 'revenue' | 'orders' | 'units' | 'aov';
export interface PivotGridProps {
  data: OrderData[];
  initialMeasure?: PivotMeasure;
  rowField?: 'company' | 'category' | 'customerType';
  bucket?: 'month' | 'week' | 'day';
  sortable?: boolean;
  testID?: string;
}

interface CellMap {
  [rowKey: string]: { [colKey: string]: number };
}

function formatMoney(n: number): string {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
  } catch (e) {
    return `$${Math.round(n).toLocaleString()}`;
  }
}

function bucketDate(dateStr: string, bucket: 'day' | 'week' | 'month'): string {
  const d = new Date(dateStr);
  if (bucket === 'day') return d.toISOString().slice(0, 10);
  if (bucket === 'week') {
    const onejan = new Date(d.getFullYear(), 0, 1);
    const week = Math.ceil((((d as unknown as any) - (onejan as unknown as any)) / 86400000 + onejan.getDay() + 1) / 7);
    const wk = String(week).padStart(2, '0');
    return `${d.getFullYear()}-W${wk}`;
  }
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function PivotGrid({
  data,
  initialMeasure = 'revenue',
  rowField = 'company',
  bucket = 'month',
  sortable = true,
  testID,
}: PivotGridProps) {
  const router = useRouter();
  const [measure, setMeasure] = useState<PivotMeasure>(initialMeasure);
  const [sortBy, setSortBy] = useState<'rowTotal' | string>('rowTotal');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const { rows, cols, cells, rowTotals, colTotals, grandTotal, min, max } = useMemo(() => {
    const rowsSet = new Set<string>();
    const colsSet = new Set<string>();
    const cellMap: CellMap = {};
    const orderIdByRowCol = new Map<string, Set<string>>();
    const unitsByRowCol = new Map<string, number>();

    data.forEach((o) => {
      const rKey = (o as any)[rowField] as string;
      const cKey = bucketDate(o.invoiceDate, bucket);
      rowsSet.add(rKey);
      colsSet.add(cKey);
      const key = `${rKey}||${cKey}`;
      const current = cellMap[rKey]?.[cKey] ?? 0;
      const val = o.totalPrice;
      if (!cellMap[rKey]) cellMap[rKey] = {};
      cellMap[rKey][cKey] = current + val;

      const oidKey = `${rKey}||${cKey}`;
      if (!orderIdByRowCol.has(oidKey)) orderIdByRowCol.set(oidKey, new Set<string>());
      orderIdByRowCol.get(oidKey)!.add(o.orderId);
      unitsByRowCol.set(oidKey, (unitsByRowCol.get(oidKey) ?? 0) + o.qty);
    });

    const rowsArr = Array.from(rowsSet);
    const colsArr = Array.from(colsSet).sort((a, b) => a.localeCompare(b));

    const cellsByMeasure: CellMap = {};
    let minV = Number.POSITIVE_INFINITY;
    let maxV = Number.NEGATIVE_INFINITY;
    rowsArr.forEach((r) => {
      cellsByMeasure[r] = {};
      colsArr.forEach((c) => {
        const key = `${r}||${c}`;
        let v = 0;
        if (measure === 'revenue') v = (cellMap[r]?.[c] ?? 0);
        if (measure === 'orders') v = (orderIdByRowCol.get(key)?.size ?? 0);
        if (measure === 'units') v = (unitsByRowCol.get(key) ?? 0);
        if (measure === 'aov') {
          const rev = (cellMap[r]?.[c] ?? 0);
          const ord = (orderIdByRowCol.get(key)?.size ?? 0);
          v = ord > 0 ? rev / ord : 0;
        }
        cellsByMeasure[r][c] = v;
        if (v < minV) minV = v;
        if (v > maxV) maxV = v;
      });
    });

    const rowTotalsMap: Record<string, number> = {};
    const colTotalsMap: Record<string, number> = {};
    let gtotal = 0;
    rowsArr.forEach((r) => {
      let total = 0;
      colsArr.forEach((c) => {
        const v = cellsByMeasure[r][c] ?? 0;
        total += v;
        colTotalsMap[c] = (colTotalsMap[c] ?? 0) + v;
      });
      rowTotalsMap[r] = total;
      gtotal += total;
    });

    return {
      rows: rowsArr,
      cols: colsArr,
      cells: cellsByMeasure,
      rowTotals: rowTotalsMap,
      colTotals: colTotalsMap,
      grandTotal: gtotal,
      min: minV === Number.POSITIVE_INFINITY ? 0 : minV,
      max: maxV === Number.NEGATIVE_INFINITY ? 0 : maxV,
    };
  }, [data, rowField, bucket, measure]);

  const sortedRows = useMemo(() => {
    const arr = [...rows];
    if (!sortable) return arr;
    return arr.sort((a, b) => {
      if (sortBy === 'rowTotal') {
        const diff = (rowTotals[b] ?? 0) - (rowTotals[a] ?? 0);
        return sortDir === 'desc' ? diff : -diff;
      }
      const diff = (cells[b]?.[sortBy] ?? 0) - (cells[a]?.[sortBy] ?? 0);
      return sortDir === 'desc' ? diff : -diff;
    });
  }, [rows, rowTotals, cells, sortBy, sortDir, sortable]);

  const colorFor = useCallback((v: number) => {
    const range = Math.max(1, max - min);
    const ratio = (v - min) / range;
    if (ratio >= 0.66) return '#16a34a';
    if (ratio >= 0.33) return '#f59e0b';
    return '#ef4444';
  }, [min, max]);

  const formatVal = useCallback((v: number) => {
    if (measure === 'revenue' || measure === 'aov') return formatMoney(v);
    if (measure === 'orders' || measure === 'units') return `${Math.round(v).toLocaleString()}`;
    return String(v);
  }, [measure]);

  const onHeaderPress = useCallback((col: string) => {
    if (!sortable) return;
    if (sortBy === col) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortBy(col);
      setSortDir('desc');
    }
  }, [sortBy, sortable]);

  return (
    <View style={styles.container} testID={testID ?? 'pivot-grid'}>
      <View style={styles.toolbar} testID="pivot-toolbar">
        <Text style={styles.toolbarTitle}>Pivot</Text>
        <View style={styles.toolbarRight}>
          <View style={styles.segment} testID="measure-toggle">
            {(['revenue','orders','units','aov'] as PivotMeasure[]).map((m) => (
              <TouchableOpacity
                key={m}
                onPress={() => setMeasure(m)}
                style={[styles.segmentBtn, measure === m && styles.segmentBtnActive]}
                accessibilityRole="button"
              >
                <Text style={[styles.segmentText, measure === m && styles.segmentTextActive]}>{m.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <ScrollView horizontal nestedScrollEnabled contentContainerStyle={styles.tableContainer} testID="pivot-scroll-x">
        <View>
          <View style={styles.headerRow} testID="pivot-header-row">
            <View style={[styles.headerCell, styles.firstCol]}>
              <Text style={styles.headerText}>{rowField.toUpperCase()}</Text>
            </View>
            {cols.map((c) => (
              <TouchableOpacity key={c} onPress={() => onHeaderPress(c)} style={styles.headerCell} testID={`col-${c}`}>
                <Text style={styles.headerText}>{c}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => onHeaderPress('rowTotal')} style={[styles.headerCell, styles.totalCol]}>
              <Text style={styles.headerText}>Total</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.bodyScroll} nestedScrollEnabled testID="pivot-scroll-y">
            {sortedRows.map((r) => (
              <View key={r} style={styles.dataRow} testID={`row-${r}`}>
                <TouchableOpacity
                  onPress={() => {
                    const id = encodeURIComponent(r);
                    console.log('[PivotGrid] navigate to /portal/customers/', id);
                    router.push({ pathname: '/portal/customers/[id]', params: { id } });
                  }}
                  accessibilityRole="button"
                  style={[styles.cell, styles.firstCol]}
                >
                  <Text style={styles.rowLabel} numberOfLines={1}>{r}</Text>
                </TouchableOpacity>
                {cols.map((c) => {
                  const v = cells[r]?.[c] ?? 0;
                  const bg = colorFor(v) + (Platform.OS === 'web' ? '22' : '');
                  return (
                    <View key={`${r}-${c}`} style={[styles.cell, { backgroundColor: bg }]}> 
                      <Text style={styles.cellText}>{formatVal(v)}</Text>
                    </View>
                  );
                })}
                <View style={[styles.cell, styles.totalCol]}>
                  <Text style={[styles.cellText, styles.totalText]}>{formatVal(rowTotals[r] ?? 0)}</Text>
                </View>
              </View>
            ))}
            <View style={[styles.dataRow, styles.footerRow]} testID="pivot-footer-row">
              <View style={[styles.cell, styles.firstCol]}>
                <Text style={[styles.rowLabel, styles.footerText]}>Total</Text>
              </View>
              {cols.map((c) => (
                <View key={`tot-${c}`} style={styles.cell}>
                  <Text style={[styles.cellText, styles.footerText]}>{formatVal(colTotals[c] ?? 0)}</Text>
                </View>
              ))}
              <View style={[styles.cell, styles.totalCol]}>
                <Text style={[styles.cellText, styles.footerText]}>{formatVal(grandTotal)}</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

const borderColor = '#E5E7EB';
const headerBg = '#F9FAFB';
const textMuted = '#6B7280';
const segActive = '#1D4ED8';

const styles = StyleSheet.create({
  container: { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor, overflow: 'hidden', marginTop: 16 },
  toolbar: { padding: 12, borderBottomWidth: 1, borderBottomColor: borderColor, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  toolbarTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  toolbarRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  segment: { flexDirection: 'row', backgroundColor: headerBg, borderRadius: 9999, padding: 4 },
  segmentBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 9999 },
  segmentBtnActive: { backgroundColor: segActive },
  segmentText: { fontSize: 12, color: '#111827' },
  segmentTextActive: { color: '#FFFFFF', fontWeight: '700' },

  tableContainer: { paddingBottom: 12 },
  headerRow: { flexDirection: 'row', backgroundColor: headerBg, borderBottomWidth: 1, borderBottomColor: borderColor },
  headerCell: { paddingVertical: 10, paddingHorizontal: 12, minWidth: 120, borderRightWidth: 1, borderRightColor: borderColor, justifyContent: 'center' },
  headerText: { fontSize: 12, color: textMuted, fontWeight: '700' },
  bodyScroll: { maxHeight: 420 },
  dataRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: borderColor },
  cell: { paddingVertical: 10, paddingHorizontal: 12, minWidth: 120, borderRightWidth: 1, borderRightColor: borderColor, justifyContent: 'center' },
  cellText: { fontSize: 12, color: '#111827' },
  rowLabel: { fontSize: 12, color: '#111827', fontWeight: '600' },
  firstCol: { minWidth: 180, backgroundColor: '#FFFFFF' },
  totalCol: { minWidth: 140, backgroundColor: '#F3F4F6' },
  totalText: { fontWeight: '700' },
  footerRow: { backgroundColor: '#F3F4F6' },
  footerText: { fontWeight: '700' },
});