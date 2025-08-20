import { useState, useMemo, useCallback } from 'react';
import { mockOrderData } from '@/mocks/orderData';
import { OrderData, KPIData, CustomerMetrics, TrendData, FilterState } from '@/types/finance';

export function useFinanceData() {
  const [filters, setFilters] = useState<FilterState>({
    dateFrom: new Date(new Date().setMonth(new Date().getMonth() - 3)),
    dateTo: new Date(),
  });

  const filteredData = useMemo(() => {
    return mockOrderData.filter(order => {
      const orderDate = new Date(order.invoiceDate);
      if (orderDate < filters.dateFrom || orderDate > filters.dateTo) return false;
      if (filters.company && order.company !== filters.company) return false;
      if (filters.customerType && order.customerType !== filters.customerType) return false;
      if (filters.category && order.category !== filters.category) return false;
      return true;
    });
  }, [filters]);

  const kpis = useMemo((): KPIData => {
    const today = new Date().toISOString().split('T')[0];
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date();
    monthStart.setDate(1);

    const todayRevenue = filteredData
      .filter(o => o.invoiceDate === today)
      .reduce((sum, o) => sum + o.totalPrice, 0);

    const weekRevenue = filteredData
      .filter(o => new Date(o.invoiceDate) >= weekStart)
      .reduce((sum, o) => sum + o.totalPrice, 0);

    const mtdRevenue = filteredData
      .filter(o => new Date(o.invoiceDate) >= monthStart)
      .reduce((sum, o) => sum + o.totalPrice, 0);

    const totalRevenue = filteredData.reduce((sum, o) => sum + o.totalPrice, 0);
    const totalOrders = new Set(filteredData.map(o => o.orderId)).size;
    const totalUnits = filteredData.reduce((sum, o) => sum + o.qty, 0);
    const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Top customer
    const customerRevenue = new Map<string, number>();
    filteredData.forEach(o => {
      const current = customerRevenue.get(o.company) || 0;
      customerRevenue.set(o.company, current + o.totalPrice);
    });
    const topCustomerEntry = Array.from(customerRevenue.entries())
      .sort((a, b) => b[1] - a[1])[0];

    // Top category
    const categoryRevenue = new Map<string, number>();
    filteredData.forEach(o => {
      const current = categoryRevenue.get(o.category) || 0;
      categoryRevenue.set(o.category, current + o.totalPrice);
    });
    const topCategoryEntry = Array.from(categoryRevenue.entries())
      .sort((a, b) => b[1] - a[1])[0];

    return {
      revenueToday: todayRevenue,
      revenueWeek: weekRevenue,
      revenueMTD: mtdRevenue,
      orders: totalOrders,
      units: totalUnits,
      aov,
      topCustomer: topCustomerEntry ? {
        company: topCustomerEntry[0],
        revenue: topCustomerEntry[1]
      } : null,
      topCategory: topCategoryEntry ? {
        category: topCategoryEntry[0],
        revenue: topCategoryEntry[1]
      } : null,
    };
  }, [filteredData]);

  const customerMetrics = useMemo((): CustomerMetrics[] => {
    const metricsMap = new Map<string, CustomerMetrics>();
    
    filteredData.forEach(order => {
      if (!metricsMap.has(order.company)) {
        metricsMap.set(order.company, {
          company: order.company,
          revenue: 0,
          orders: 0,
          lastOrderDate: order.invoiceDate,
          avgOrderValue: 0,
          categories: []
        });
      }
      
      const metrics = metricsMap.get(order.company)!;
      metrics.revenue += order.totalPrice;
      if (new Date(order.invoiceDate) > new Date(metrics.lastOrderDate)) {
        metrics.lastOrderDate = order.invoiceDate;
      }
      if (!metrics.categories.includes(order.category)) {
        metrics.categories.push(order.category);
      }
    });

    // Count unique orders per customer
    const orderCounts = new Map<string, Set<string>>();
    filteredData.forEach(order => {
      if (!orderCounts.has(order.company)) {
        orderCounts.set(order.company, new Set());
      }
      orderCounts.get(order.company)!.add(order.orderId);
    });

    orderCounts.forEach((orderIds, company) => {
      const metrics = metricsMap.get(company)!;
      metrics.orders = orderIds.size;
      metrics.avgOrderValue = metrics.orders > 0 ? metrics.revenue / metrics.orders : 0;
    });

    return Array.from(metricsMap.values())
      .sort((a, b) => b.revenue - a.revenue);
  }, [filteredData]);

  const trendData = useMemo((): TrendData[] => {
    const dailyData = new Map<string, TrendData>();
    
    filteredData.forEach(order => {
      if (!dailyData.has(order.invoiceDate)) {
        dailyData.set(order.invoiceDate, {
          date: order.invoiceDate,
          revenue: 0,
          orders: 0,
          units: 0
        });
      }
      
      const day = dailyData.get(order.invoiceDate)!;
      day.revenue += order.totalPrice;
      day.units += order.qty;
    });

    // Count unique orders per day
    const ordersByDay = new Map<string, Set<string>>();
    filteredData.forEach(order => {
      if (!ordersByDay.has(order.invoiceDate)) {
        ordersByDay.set(order.invoiceDate, new Set());
      }
      ordersByDay.get(order.invoiceDate)!.add(order.orderId);
    });

    ordersByDay.forEach((orderIds, date) => {
      const day = dailyData.get(date);
      if (day) {
        day.orders = orderIds.size;
      }
    });

    return Array.from(dailyData.values())
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredData]);

  const updateFilters = useCallback((newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  return {
    data: filteredData,
    kpis,
    customerMetrics,
    trendData,
    filters,
    updateFilters,
  };
}