import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, RefreshControl, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFinanceData } from '@/hooks/useFinanceData';
import { CustomerTable } from '@/components/CustomerTable';
import PivotGrid from '@/components/PivotGrid';
import { DateRangePicker } from '@/components/DateRangePicker';
import { X, TrendingUp, Package, Calendar } from 'lucide-react-native';
import { CustomerMetrics } from '@/types/finance';

export default function CustomersScreen() {
  const { customerMetrics, filters, updateFilters, data } = useFinanceData();
  const [refreshing, setRefreshing] = React.useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerMetrics | null>(null);

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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const allCustomers = customerMetrics;
  const topCustomers = customerMetrics.slice(0, 10);
  const coldCustomers = customerMetrics.filter(c => {
    const daysSinceLastOrder = Math.floor(
      (new Date().getTime() - new Date(c.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceLastOrder > 21 && c.orders >= 3;
  });

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

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{allCustomers.length}</Text>
            <Text style={styles.statLabel}>Total Customers</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{topCustomers.length}</Text>
            <Text style={styles.statLabel}>Top Customers</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#f59e0b' }]}>{coldCustomers.length}</Text>
            <Text style={styles.statLabel}>Cold Customers</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle} testID="pivot-title">Customer Pivot</Text>
          <PivotGrid
            data={data}
            initialMeasure="revenue"
            rowField="company"
            bucket="month"
            sortable
            testID="pivot"
          />
        </View>

        <View style={styles.section}>
          <CustomerTable
            customers={allCustomers}
            title="All Customers"
            onCustomerPress={setSelectedCustomer}
          />
        </View>

        {coldCustomers.length > 0 && (
          <View style={styles.section}>
            <CustomerTable
              customers={coldCustomers}
              title="Reactivation Opportunities"
              onCustomerPress={setSelectedCustomer}
            />
          </View>
        )}
      </ScrollView>

      {/* Customer Detail Modal */}
      <Modal
        visible={!!selectedCustomer}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedCustomer(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedCustomer?.company}</Text>
              <TouchableOpacity onPress={() => setSelectedCustomer(null)}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {selectedCustomer && (
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <TrendingUp size={20} color="#10b981" />
                    <View style={styles.detailText}>
                      <Text style={styles.detailLabel}>Lifetime Revenue</Text>
                      <Text style={styles.detailValue}>
                        {formatCurrency(selectedCustomer.revenue)}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <Package size={20} color="#1e40af" />
                    <View style={styles.detailText}>
                      <Text style={styles.detailLabel}>Total Orders</Text>
                      <Text style={styles.detailValue}>{selectedCustomer.orders}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <Calendar size={20} color="#8b5cf6" />
                    <View style={styles.detailText}>
                      <Text style={styles.detailLabel}>Last Order</Text>
                      <Text style={styles.detailValue}>
                        {formatDate(selectedCustomer.lastOrderDate)}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Average Order Value</Text>
                  <Text style={styles.detailSectionValue}>
                    {formatCurrency(selectedCustomer.avgOrderValue)}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Product Categories</Text>
                  <View style={styles.categoryTags}>
                    {selectedCustomer.categories.map((category) => (
                      <View key={category} style={styles.categoryTag}>
                        <Text style={styles.categoryTagText}>{category}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
    marginRight: 16,
  },
  modalBody: {
    padding: 20,
  },
  detailRow: {
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: 12,
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  detailSection: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  detailSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailSectionValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  categoryTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  categoryTag: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryTagText: {
    fontSize: 14,
    color: '#1e40af',
  },
});