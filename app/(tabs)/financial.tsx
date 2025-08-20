import React from 'react';
import { ScrollView, View, Text, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFinanceData } from '@/hooks/useFinanceData';
import { CategoryBreakdown } from '@/components/CategoryBreakdown';
import { RevenueChart } from '@/components/RevenueChart';
import { DateRangePicker } from '@/components/DateRangePicker';
import { KPICard } from '@/components/KPICard';

export default function FinancialAnalytics() {
  const { data, kpis, trendData, filters, updateFilters } = useFinanceData();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Calculate status breakdown
  const statusBreakdown = new Map<string, number>();
  data.forEach(order => {
    const current = statusBreakdown.get(order.orderStatus) || 0;
    statusBreakdown.set(order.orderStatus, current + order.totalPrice);
  });

  const statusData = Array.from(statusBreakdown.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([status, revenue]) => ({
      status,
      revenue,
      percentage: (revenue / data.reduce((sum, o) => sum + o.totalPrice, 0)) * 100,
    }));

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <DateRangePicker
            dateFrom={filters.dateFrom}
            dateTo={filters.dateTo}
            onDateChange={(from, to) => updateFilters({ dateFrom: from, dateTo: to })}
          />
        </View>

        <View style={styles.summaryGrid}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <KPICard
                title="Total Revenue"
                value={formatCurrency(data.reduce((sum, o) => sum + o.totalPrice, 0))}
                color="#1e40af"
              />
            </View>
            <View style={styles.summaryItem}>
              <KPICard
                title="Top Category"
                value={kpis.topCategory?.category || 'N/A'}
                subtitle={kpis.topCategory ? formatCurrency(kpis.topCategory.revenue) : ''}
                color="#10b981"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <RevenueChart data={trendData} title="Revenue Over Time" />
        </View>

        <View style={styles.section}>
          <CategoryBreakdown data={data} title="Revenue by Category" />
        </View>

        <View style={styles.section}>
          <View style={styles.statusContainer}>
            <Text style={styles.sectionTitle}>Revenue by Order Status</Text>
            {statusData.map((item, index) => (
              <View key={item.status} style={styles.statusRow}>
                <View style={styles.statusInfo}>
                  <Text style={styles.statusName}>{item.status}</Text>
                  <Text style={styles.statusRevenue}>{formatCurrency(item.revenue)}</Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <View
                    style={[
                      styles.progressBar,
                      {
                        width: `${item.percentage}%`,
                        backgroundColor: index === 0 ? '#10b981' : index === 1 ? '#f59e0b' : '#6b7280',
                      },
                    ]}
                  />
                </View>
                <Text style={styles.statusPercentage}>{item.percentage.toFixed(1)}%</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  summaryGrid: {
    paddingHorizontal: 16,
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryItem: {
    flex: 1,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  statusContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusInfo: {
    flex: 2,
  },
  statusName: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  statusRevenue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  progressBarContainer: {
    flex: 3,
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginHorizontal: 12,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  statusPercentage: {
    width: 50,
    textAlign: 'right',
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
});