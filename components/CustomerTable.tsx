import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { CustomerMetrics } from '@/types/finance';
import { ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface CustomerTableProps {
  customers: CustomerMetrics[];
  title: string;
  onCustomerPress?: (customer: CustomerMetrics) => void;
}

export function CustomerTable({ customers, title, onCustomerPress }: CustomerTableProps) {
  const router = useRouter();
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.headerText, styles.companyColumn]}>Company</Text>
          <Text style={[styles.headerText, styles.revenueColumn]}>Revenue</Text>
          <Text style={[styles.headerText, styles.ordersColumn]}>Orders</Text>
          <Text style={[styles.headerText, styles.dateColumn]}>Last Order</Text>
          <View style={styles.actionColumn} />
        </View>
        {customers.slice(0, 10).map((customer, index) => (
          <TouchableOpacity
            key={customer.company}
            style={[styles.row, index % 2 === 0 && styles.evenRow]}
            onPress={() => {
              if (onCustomerPress) {
                onCustomerPress(customer);
              } else {
                const id = encodeURIComponent(customer.company);
                console.log('[CustomerTable] navigate to /portal/customers/', id);
                router.push({ pathname: '/portal/customers/[id]', params: { id } });
              }
            }}
            accessibilityRole="button"
            testID={`customer-row-${customer.company}`}
            activeOpacity={0.7}
          >
            <Text style={[styles.cellText, styles.companyColumn]} numberOfLines={1}>
              {customer.company}
            </Text>
            <Text style={[styles.cellText, styles.revenueColumn, styles.revenue]}>
              {formatCurrency(customer.revenue)}
            </Text>
            <Text style={[styles.cellText, styles.ordersColumn]}>
              {customer.orders}
            </Text>
            <Text style={[styles.cellText, styles.dateColumn]}>
              {formatDate(customer.lastOrderDate)}
            </Text>
            <View style={styles.actionColumn}>
              <ChevronRight size={16} color="#9ca3af" />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  scrollView: {
    maxHeight: 400,
  },
  header: {
    flexDirection: 'row',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginBottom: 8,
  },
  headerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 12,
    alignItems: 'center',
  },
  evenRow: {
    backgroundColor: '#f9fafb',
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  cellText: {
    fontSize: 14,
    color: '#374151',
  },
  companyColumn: {
    flex: 3,
    paddingRight: 8,
  },
  revenueColumn: {
    flex: 2,
    textAlign: 'right',
    paddingRight: 8,
  },
  ordersColumn: {
    flex: 1,
    textAlign: 'center',
  },
  dateColumn: {
    flex: 2,
    textAlign: 'right',
    paddingRight: 8,
  },
  actionColumn: {
    width: 24,
    alignItems: 'center',
  },
  revenue: {
    fontWeight: '600',
    color: '#1e40af',
  },
});