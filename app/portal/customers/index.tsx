import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import HeaderNav from '@/components/global/HeaderNav';
import { useTheme } from '@/providers/ThemeProvider';
import { Card } from '@/components/ui/Card';
import { spacing } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { mockFinanceGet } from '@/mocks/mockApi';
import PivotHeatmap from '@/components/PivotHeatmap';
import { Download, FileText, TrendingUp, TrendingDown } from 'lucide-react-native';

interface PivotRow {
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
  decoration_methods?: string[];
  vip_status?: boolean;
  red_flag?: boolean;
  share_of_wallet?: number;
}

interface PivotResponse {
  months: string[];
  rows: PivotRow[];
  meta: { page: number; per_page: number; total: number };
}

export default function CustomersList() {
  const { colors } = useTheme();
  const router = useRouter();
  const [months, setMonths] = useState<string[]>([]);
  const [rows, setRows] = useState<PivotRow[]>([]);
  const [query, setQuery] = useState<string>('');
  const [clientType, setClientType] = useState<string>('');
  const [minSpend, setMinSpend] = useState<string>('');
  const [maxSpend, setMaxSpend] = useState<string>('');
  const [minOrders, setMinOrders] = useState<string>('');
  const [maxOrders, setMaxOrders] = useState<string>('');
  const [activityRecency, setActivityRecency] = useState<string>('');
  const [creditTerms, setCreditTerms] = useState<string>('');
  const [distributorGroup, setDistributorGroup] = useState<string>('');
  const [decorationMethod, setDecorationMethod] = useState<string>('');
  const [vipStatus, setVipStatus] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('total');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [fromDate, setFromDate] = useState<string>('2025-01-01');
  const [toDate, setToDate] = useState<string>('2025-08-31');
  const [loading, setLoading] = useState<boolean>(false);

  // Load initial data on mount
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        console.log('[CustomersList] Loading pivot data with params:', { 
          fromDate, toDate, query, clientType, minSpend, maxSpend, minOrders, maxOrders, 
          activityRecency, creditTerms, distributorGroup, decorationMethod, vipStatus, sortBy, sortDir 
        });
        const params = new URLSearchParams({
          from: fromDate,
          to: toDate,
          query,
          type: clientType,
          min_spend: minSpend || '0',
          max_spend: maxSpend || '',
          min_orders: minOrders || '0',
          max_orders: maxOrders || '',
          activity_recency: activityRecency,
          credit_terms: creditTerms,
          distributor_group: distributorGroup,
          decoration_method: decorationMethod,
          vip_status: vipStatus,
          sort_by: sortBy,
          sort_dir: sortDir,
        });
        const url = `/api/analytics/customers/pivot?${params.toString()}`;
        console.log('[CustomersList] Fetching URL:', url);
        
        const response = await mockFinanceGet(url) as PivotResponse;
        console.log('[CustomersList] Pivot response received:', {
          hasMonths: !!response?.months,
          monthsLength: response?.months?.length,
          hasRows: !!response?.rows,
          rowsLength: response?.rows?.length,
          responseKeys: Object.keys(response || {})
        });
        
        if (response && typeof response === 'object' && 'months' in response && 'rows' in response) {
          console.log('[CustomersList] Setting data - months:', response.months.length, 'rows:', response.rows.length);
          setMonths(response.months ?? []);
          setRows(response.rows ?? []);
        } else {
          console.log('[CustomersList] Invalid response format:', response);
          setMonths([]);
          setRows([]);
        }
      } catch (e) {
        console.log('[CustomersList] load error', e);
        setMonths([]);
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [query, clientType, minSpend, maxSpend, minOrders, maxOrders, activityRecency, creditTerms, distributorGroup, decorationMethod, vipStatus, sortBy, sortDir, fromDate, toDate]);

  const filtered = useMemo(() => {
    let result = rows.filter(r => {
      const matchesQuery = r.company.toLowerCase().includes(query.toLowerCase());
      const matchesType = !clientType || r.client_type === clientType;
      const matchesMinSpend = !minSpend || r.total >= Number(minSpend);
      const matchesMaxSpend = !maxSpend || r.total <= Number(maxSpend);
      const matchesMinOrders = !minOrders || r.orders >= Number(minOrders);
      const matchesMaxOrders = !maxOrders || r.orders <= Number(maxOrders);
      const matchesCreditTerms = !creditTerms || r.credit_terms === creditTerms;
      const matchesDistributorGroup = !distributorGroup || r.distributor_groups?.includes(distributorGroup);
      const matchesDecorationMethod = !decorationMethod || r.decoration_methods?.includes(decorationMethod);
      const matchesVipStatus = !vipStatus || (vipStatus === 'vip' && r.vip_status) || (vipStatus === 'regular' && !r.vip_status);
      
      return matchesQuery && matchesType && matchesMinSpend && matchesMaxSpend && 
             matchesMinOrders && matchesMaxOrders && matchesCreditTerms && matchesDistributorGroup &&
             matchesDecorationMethod && matchesVipStatus;
    });
    
    // Apply sorting
    result.sort((a, b) => {
      let aVal: number | string, bVal: number | string;
      
      switch (sortBy) {
        case 'company':
          aVal = a.company;
          bVal = b.company;
          break;
        case 'growth':
          aVal = a.growth_pct || 0;
          bVal = b.growth_pct || 0;
          break;
        case 'orders':
          aVal = a.orders;
          bVal = b.orders;
          break;
        case 'units':
          aVal = a.units;
          bVal = b.units;
          break;
        case 'last_order':
          aVal = a.last_order_date || '1900-01-01';
          bVal = b.last_order_date || '1900-01-01';
          break;
        default: // 'total'
          aVal = a.total;
          bVal = b.total;
      }
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'desc' ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
      }
      
      const numA = Number(aVal);
      const numB = Number(bVal);
      return sortDir === 'desc' ? numB - numA : numA - numB;
    });
    
    return result;
  }, [rows, query, clientType, minSpend, maxSpend, minOrders, maxOrders, creditTerms, distributorGroup, decorationMethod, vipStatus, sortBy, sortDir]);

  const handleCustomerClick = (row: PivotRow) => {
    router.push({ pathname: '/portal/customers/[id]', params: { id: row.customer_id } });
  };

  const handlePreset = (preset: string) => {
    const now = new Date();
    let from: Date, to: Date;
    
    switch (preset) {
      case 'today':
        from = new Date(now);
        to = new Date(now);
        break;
      case 'week':
        from = new Date(now);
        from.setDate(now.getDate() - 7);
        to = now;
        break;
      case 'mtd':
        from = new Date(now.getFullYear(), now.getMonth(), 1);
        to = now;
        break;
      case 'qtd':
        const quarter = Math.floor(now.getMonth() / 3);
        from = new Date(now.getFullYear(), quarter * 3, 1);
        to = now;
        break;
      case 'ytd':
        from = new Date(now.getFullYear(), 0, 1);
        to = now;
        break;
      default:
        return;
    }
    
    setFromDate(from.toISOString().split('T')[0]);
    setToDate(to.toISOString().split('T')[0]);
  };

  const handleExport = () => {
    Alert.alert(
      'Export Data',
      'Choose export format:',
      [
        { text: 'CSV', onPress: () => exportToCSV() },
        { text: 'PDF Snapshot', onPress: () => exportToPDF() },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const exportToCSV = () => {
    console.log('[CustomersList] Exporting to CSV...');
    // In a real app, this would generate and download a CSV file
    Alert.alert('Export', 'CSV export functionality would be implemented here');
  };

  const exportToPDF = () => {
    console.log('[CustomersList] Exporting to PDF...');
    // In a real app, this would generate and download a PDF snapshot
    Alert.alert('Export', 'PDF snapshot functionality would be implemented here');
  };

  const clearFilters = () => {
    setQuery('');
    setClientType('');
    setMinSpend('');
    setMaxSpend('');
    setMinOrders('');
    setMaxOrders('');
    setActivityRecency('');
    setCreditTerms('');
    setDistributorGroup('');
    setDecorationMethod('');
    setVipStatus('');
  };

  const totalRevenue = useMemo(() => {
    return filtered.reduce((sum, row) => sum + row.total, 0);
  }, [filtered]);

  const avgGrowth = useMemo(() => {
    const growthRows = filtered.filter(r => r.growth_pct !== undefined);
    if (growthRows.length === 0) return 0;
    return growthRows.reduce((sum, row) => sum + (row.growth_pct || 0), 0) / growthRows.length;
  }, [filtered]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]} testID="portal-customers-list">
      <HeaderNav title="Customers Pivot" />
      <ScrollView contentContainerStyle={styles.body}>
        {/* Advanced Filters */}
        <Card style={[styles.filtersCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.filtersHeader}>
            <Text style={[styles.filtersTitle, { color: colors.text }]}>Advanced Filters</Text>
            <View style={styles.filtersActions}>
              <TouchableOpacity onPress={clearFilters} style={[styles.clearBtn, { borderColor: colors.border }]}>
                <Text style={[styles.clearBtnText, { color: colors.subtle }]}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleExport} style={[styles.exportBtn, { backgroundColor: colors.primary }]}>
                <Download size={16} color={colors.card} />
                <Text style={[styles.exportBtnText, { color: colors.card }]}>Export</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Search and Basic Filters */}
          <View style={styles.filtersRow}>
            <TextInput
              placeholder="Search company…"
              placeholderTextColor={colors.subtle}
              style={[styles.filterInput, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
              value={query}
              onChangeText={setQuery}
              testID="filter-search"
            />
            <View style={[styles.pickerContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Picker
                selectedValue={clientType}
                onValueChange={setClientType}
                style={[styles.picker, { color: colors.text }]}
                testID="filter-type"
              >
                <Picker.Item label="All Client Types" value="" />
                <Picker.Item label="Direct" value="Direct" />
                <Picker.Item label="Wholesale" value="Wholesale" />
                <Picker.Item label="Education" value="Education" />
                <Picker.Item label="Nonprofit" value="Nonprofit" />
              </Picker>
            </View>
          </View>
          
          {/* Spend Range */}
          <View style={styles.filtersRow}>
            <TextInput
              placeholder="Min spend ($)"
              placeholderTextColor={colors.subtle}
              style={[styles.filterInput, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
              value={minSpend}
              onChangeText={setMinSpend}
              keyboardType="numeric"
              testID="filter-min-spend"
            />
            <TextInput
              placeholder="Max spend ($)"
              placeholderTextColor={colors.subtle}
              style={[styles.filterInput, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
              value={maxSpend}
              onChangeText={setMaxSpend}
              keyboardType="numeric"
              testID="filter-max-spend"
            />
          </View>
          
          {/* Order Range */}
          <View style={styles.filtersRow}>
            <TextInput
              placeholder="Min orders"
              placeholderTextColor={colors.subtle}
              style={[styles.filterInput, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
              value={minOrders}
              onChangeText={setMinOrders}
              keyboardType="numeric"
              testID="filter-min-orders"
            />
            <TextInput
              placeholder="Max orders"
              placeholderTextColor={colors.subtle}
              style={[styles.filterInput, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
              value={maxOrders}
              onChangeText={setMaxOrders}
              keyboardType="numeric"
              testID="filter-max-orders"
            />
          </View>
          
          {/* Additional Filters Row 1 */}
          <View style={styles.filtersRow}>
            <View style={[styles.pickerContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Picker
                selectedValue={creditTerms}
                onValueChange={setCreditTerms}
                style={[styles.picker, { color: colors.text }]}
                testID="filter-credit-terms"
              >
                <Picker.Item label="All Credit Terms" value="" />
                <Picker.Item label="Net30" value="Net30" />
                <Picker.Item label="COD" value="COD" />
                <Picker.Item label="Prepaid" value="Prepaid" />
              </Picker>
            </View>
            <View style={[styles.pickerContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Picker
                selectedValue={distributorGroup}
                onValueChange={setDistributorGroup}
                style={[styles.picker, { color: colors.text }]}
                testID="filter-distributor-group"
              >
                <Picker.Item label="All Groups" value="" />
                <Picker.Item label="ASI" value="ASI" />
                <Picker.Item label="SAGE" value="SAGE" />
                <Picker.Item label="SGIA" value="SGIA" />
                <Picker.Item label="PPAI" value="PPAI" />
              </Picker>
            </View>
          </View>
          
          {/* Additional Filters Row 2 */}
          <View style={styles.filtersRow}>
            <View style={[styles.pickerContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Picker
                selectedValue={decorationMethod}
                onValueChange={setDecorationMethod}
                style={[styles.picker, { color: colors.text }]}
                testID="filter-decoration-method"
              >
                <Picker.Item label="All Decoration Methods" value="" />
                <Picker.Item label="Screen Print" value="Screen Print" />
                <Picker.Item label="Embroidery" value="Embroidery" />
                <Picker.Item label="DTF" value="DTF" />
                <Picker.Item label="Heat Press" value="Heat Press" />
                <Picker.Item label="Vinyl" value="Vinyl" />
                <Picker.Item label="Sublimation" value="Sublimation" />
                <Picker.Item label="Laser Engraving" value="Laser Engraving" />
              </Picker>
            </View>
            <View style={[styles.pickerContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Picker
                selectedValue={vipStatus}
                onValueChange={setVipStatus}
                style={[styles.picker, { color: colors.text }]}
                testID="filter-vip-status"
              >
                <Picker.Item label="All Customer Types" value="" />
                <Picker.Item label="VIP Customers" value="vip" />
                <Picker.Item label="Regular Customers" value="regular" />
              </Picker>
            </View>
          </View>
          
          {/* Sorting */}
          <View style={styles.filtersRow}>
            <View style={[styles.pickerContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Picker
                selectedValue={sortBy}
                onValueChange={setSortBy}
                style={[styles.picker, { color: colors.text }]}
                testID="filter-sort-by"
              >
                <Picker.Item label="Sort by Total Spend" value="total" />
                <Picker.Item label="Sort by Company" value="company" />
                <Picker.Item label="Sort by Growth %" value="growth" />
                <Picker.Item label="Sort by Orders" value="orders" />
                <Picker.Item label="Sort by Units" value="units" />
                <Picker.Item label="Sort by Last Order" value="last_order" />
              </Picker>
            </View>
            <TouchableOpacity 
              onPress={() => setSortDir(sortDir === 'desc' ? 'asc' : 'desc')}
              style={[styles.sortDirBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              testID="filter-sort-dir"
            >
              {sortDir === 'desc' ? (
                <TrendingDown size={16} color={colors.text} />
              ) : (
                <TrendingUp size={16} color={colors.text} />
              )}
              <Text style={[styles.sortDirText, { color: colors.text }]}>
                {sortDir === 'desc' ? 'High to Low' : 'Low to High'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Date Range Presets */}
          <View style={styles.presetsRow}>
            {['today', 'week', 'mtd', 'qtd', 'ytd'].map(preset => (
              <TouchableOpacity
                key={preset}
                style={[styles.presetBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => handlePreset(preset)}
                testID={`preset-${preset}`}
              >
                <Text style={[styles.presetText, { color: colors.text }]}>{preset.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Custom Date Range */}
          <View style={styles.dateRow}>
            <View style={styles.dateInputContainer}>
              <Text style={[styles.dateLabel, { color: colors.text }]}>From:</Text>
              <TextInput
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.subtle}
                style={[styles.dateInput, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
                value={fromDate}
                onChangeText={setFromDate}
                testID="filter-from"
              />
            </View>
            <View style={styles.dateInputContainer}>
              <Text style={[styles.dateLabel, { color: colors.text }]}>To:</Text>
              <TextInput
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.subtle}
                style={[styles.dateInput, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
                value={toDate}
                onChangeText={setToDate}
                testID="filter-to"
              />
            </View>
          </View>
        </Card>

        {/* Summary Stats */}
        <View style={styles.summaryRow}>
          <Card style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.summaryLabel, { color: colors.subtle }]}>Total Customers</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>{filtered.length.toLocaleString()}</Text>
          </Card>
          <Card style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.summaryLabel, { color: colors.subtle }]}>Total Revenue</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {totalRevenue.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
            </Text>
          </Card>
          <Card style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.summaryLabel, { color: colors.subtle }]}>Avg Growth</Text>
            <View style={styles.summaryGrowth}>
              {avgGrowth >= 0 ? (
                <TrendingUp size={16} color={colors.success} />
              ) : (
                <TrendingDown size={16} color={colors.error} />
              )}
              <Text style={[styles.summaryValue, { color: avgGrowth >= 0 ? colors.success : colors.error }]}>
                {avgGrowth.toFixed(1)}%
              </Text>
            </View>
          </Card>
        </View>

        {/* Pivot Heatmap */}
        <Card style={[styles.pivotCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.pivotHeader}>
            <Text style={[styles.pivotTitle, { color: colors.text }]}>Customers × Month — Pivot Heatmap</Text>
            <Text style={[styles.pivotSubtitle, { color: colors.subtle }]}>Green=High · Yellow=Mid · Red=Low</Text>
            <Text style={[styles.dataInfo, { color: colors.subtle }]}>Showing {filtered.length} of {rows.length} customers</Text>
          </View>
          {months.length > 0 && filtered.length > 0 ? (
            <PivotHeatmap
              months={months}
              rows={filtered}
              onCustomerClick={handleCustomerClick}
            />
          ) : (
            <View style={styles.emptyState}>
              {loading ? (
                <Text style={[styles.emptyText, { color: colors.subtle }]}>Loading pivot data...</Text>
              ) : (
                <>
                  <FileText size={48} color={colors.subtle} />
                  <Text style={[styles.emptyText, { color: colors.subtle }]}>No customer data available</Text>
                  <Text style={[styles.debugText, { color: colors.subtle }]}>Try adjusting your filters or date range</Text>
                </>
              )}
              <TouchableOpacity 
                style={[styles.testBtn, { backgroundColor: colors.primary }]} 
                onPress={() => handleCustomerClick({ customer_id: 'test_001', company: 'Test Customer', client_type: 'Direct', monthly: [1000, 2000], total: 3000, orders: 5, units: 100 })}
              >
                <Text style={[styles.testBtnText, { color: colors.card }]}>Test Customer Profile</Text>
              </TouchableOpacity>
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
  filtersCard: { padding: 16, borderWidth: 1, borderRadius: 16 },
  filtersHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  filtersTitle: { fontSize: 16, fontWeight: '600' },
  filtersActions: { flexDirection: 'row', gap: 8 },
  clearBtn: { paddingVertical: 6, paddingHorizontal: 12, borderWidth: 1, borderRadius: 8 },
  clearBtnText: { fontSize: 12, fontWeight: '500' },
  exportBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  exportBtnText: { fontSize: 12, fontWeight: '600' },
  filtersRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  filterInput: { flex: 1, borderWidth: 1, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, fontSize: 14 },
  pickerContainer: { flex: 1, borderWidth: 1, borderRadius: 8, overflow: 'hidden' },
  picker: { height: 40 },
  sortDirBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderRadius: 8, minWidth: 120 },
  sortDirText: { fontSize: 12, fontWeight: '500' },
  presetsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  presetBtn: { paddingVertical: 6, paddingHorizontal: 12, borderWidth: 1, borderRadius: 20 },
  presetText: { fontSize: 12, fontWeight: '600' },
  dateRow: { flexDirection: 'row', gap: 8 },
  dateInputContainer: { flex: 1, gap: 4 },
  dateLabel: { fontSize: 12, fontWeight: '600' },
  dateInput: { borderWidth: 1, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, fontSize: 14 },
  summaryRow: { flexDirection: 'row', gap: 12 },
  summaryCard: { flex: 1, padding: 12, borderWidth: 1, borderRadius: 12, alignItems: 'center' },
  summaryLabel: { fontSize: 12, marginBottom: 4 },
  summaryValue: { fontSize: 16, fontWeight: '700' },
  summaryGrowth: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pivotCard: { borderWidth: 1, borderRadius: 16, overflow: 'hidden' },
  pivotHeader: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  pivotTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  pivotSubtitle: { fontSize: 12 },
  dataInfo: { fontSize: 11, marginTop: 4 },
  emptyState: { padding: 40, alignItems: 'center', gap: 12 },
  emptyText: { fontSize: 14, textAlign: 'center' },
  debugText: { fontSize: 12, textAlign: 'center' },
  testBtn: { marginTop: 16, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  testBtnText: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
});