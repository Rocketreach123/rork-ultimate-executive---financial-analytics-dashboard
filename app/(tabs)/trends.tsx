import React from 'react';
import { ScrollView, View, Text, StyleSheet, RefreshControl, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFinanceData } from '@/hooks/useFinanceData';
import { RevenueChart } from '@/components/RevenueChart';
import { DateRangePicker } from '@/components/DateRangePicker';
import Svg, { Rect, Line, Text as SvgText } from 'react-native-svg';

const { width } = Dimensions.get('window');

interface BarChartData {
  x: string;
  y: number;
  orders?: number;
}

function MonthlyBarChart({ data, width: chartWidth, height }: { data: BarChartData[]; width: number; height: number }) {
  const padding = { left: 70, top: 20, right: 40, bottom: 60 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  
  const maxValue = Math.max(...data.map(d => d.y));
  const barWidth = innerWidth / data.length * 0.8;
  const barSpacing = innerWidth / data.length * 0.2;
  
  return (
    <Svg width={chartWidth} height={height}>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
        const y = padding.top + innerHeight * (1 - ratio);
        return (
          <Line
            key={index}
            x1={padding.left}
            y1={y}
            x2={chartWidth - padding.right}
            y2={y}
            stroke="#f3f4f6"
            strokeWidth={1}
          />
        );
      })}
      
      {/* Bars */}
      {data.map((item, index) => {
        const barHeight = (item.y / maxValue) * innerHeight;
        const x = padding.left + (index * (barWidth + barSpacing)) + barSpacing / 2;
        const y = padding.top + innerHeight - barHeight;
        
        return (
          <Rect
            key={index}
            x={x}
            y={y}
            width={barWidth}
            height={barHeight}
            fill="#1e40af"
          />
        );
      })}
      
      {/* Y-axis labels */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
        const value = maxValue * ratio;
        const y = padding.top + innerHeight * (1 - ratio);
        const label = value >= 1000 ? `$${Math.round(value / 1000)}k` : `$${Math.round(value)}`;
        
        return (
          <SvgText
            key={index}
            x={padding.left - 10}
            y={y + 4}
            fontSize={10}
            fill="#6b7280"
            textAnchor="end"
          >
            {label}
          </SvgText>
        );
      })}
      
      {/* X-axis labels */}
      {data.map((item, index) => {
        const x = padding.left + (index * (barWidth + barSpacing)) + barSpacing / 2 + barWidth / 2;
        const y = height - padding.bottom + 15;
        
        return (
          <SvgText
            key={index}
            x={x}
            y={y}
            fontSize={10}
            fill="#6b7280"
            textAnchor="middle"
          >
            {item.x.substring(5)}
          </SvgText>
        );
      })}
      
      {/* Axes */}
      <Line
        x1={padding.left}
        y1={padding.top}
        x2={padding.left}
        y2={height - padding.bottom}
        stroke="#e5e7eb"
        strokeWidth={1}
      />
      <Line
        x1={padding.left}
        y1={height - padding.bottom}
        x2={chartWidth - padding.right}
        y2={height - padding.bottom}
        stroke="#e5e7eb"
        strokeWidth={1}
      />
    </Svg>
  );
}

function CustomerTypeBarChart({ data, width: chartWidth, height }: { data: BarChartData[]; width: number; height: number }) {
  const padding = { left: 100, top: 20, right: 40, bottom: 60 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  
  const maxValue = Math.max(...data.map(d => d.y));
  const barWidth = innerWidth / data.length * 0.8;
  const barSpacing = innerWidth / data.length * 0.2;
  
  return (
    <Svg width={chartWidth} height={height}>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
        const y = padding.top + innerHeight * (1 - ratio);
        return (
          <Line
            key={index}
            x1={padding.left}
            y1={y}
            x2={chartWidth - padding.right}
            y2={y}
            stroke="#f3f4f6"
            strokeWidth={1}
          />
        );
      })}
      
      {/* Bars */}
      {data.map((item, index) => {
        const barHeight = (item.y / maxValue) * innerHeight;
        const x = padding.left + (index * (barWidth + barSpacing)) + barSpacing / 2;
        const y = padding.top + innerHeight - barHeight;
        
        return (
          <Rect
            key={index}
            x={x}
            y={y}
            width={barWidth}
            height={barHeight}
            fill="#10b981"
          />
        );
      })}
      
      {/* Y-axis labels */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
        const value = maxValue * ratio;
        const y = padding.top + innerHeight * (1 - ratio);
        const label = value >= 1000 ? `$${Math.round(value / 1000)}k` : `$${Math.round(value)}`;
        
        return (
          <SvgText
            key={index}
            x={padding.left - 10}
            y={y + 4}
            fontSize={10}
            fill="#6b7280"
            textAnchor="end"
          >
            {label}
          </SvgText>
        );
      })}
      
      {/* X-axis labels */}
      {data.map((item, index) => {
        const x = padding.left + (index * (barWidth + barSpacing)) + barSpacing / 2 + barWidth / 2;
        const y = height - padding.bottom + 15;
        
        return (
          <SvgText
            key={index}
            x={x}
            y={y}
            fontSize={10}
            fill="#6b7280"
            textAnchor="middle"
          >
            {item.x}
          </SvgText>
        );
      })}
      
      {/* Axes */}
      <Line
        x1={padding.left}
        y1={padding.top}
        x2={padding.left}
        y2={height - padding.bottom}
        stroke="#e5e7eb"
        strokeWidth={1}
      />
      <Line
        x1={padding.left}
        y1={height - padding.bottom}
        x2={chartWidth - padding.right}
        y2={height - padding.bottom}
        stroke="#e5e7eb"
        strokeWidth={1}
      />
    </Svg>
  );
}

export default function TrendsScreen() {
  const { data, trendData, filters, updateFilters } = useFinanceData();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  // Calculate monthly trends
  const monthlyData = React.useMemo(() => {
    const monthly = new Map<string, { revenue: number; orders: Set<string> }>();
    
    data.forEach(order => {
      const month = order.invoiceDate.substring(0, 7); // YYYY-MM
      if (!monthly.has(month)) {
        monthly.set(month, { revenue: 0, orders: new Set() });
      }
      const monthData = monthly.get(month)!;
      monthData.revenue += order.totalPrice;
      monthData.orders.add(order.orderId);
    });

    return Array.from(monthly.entries())
      .map(([month, data]) => ({
        x: month,
        y: data.revenue,
        orders: data.orders.size,
      }))
      .sort((a, b) => a.x.localeCompare(b.x))
      .slice(-12); // Last 12 months
  }, [data]);

  // Calculate customer type distribution
  const customerTypeData = React.useMemo(() => {
    const types = new Map<string, number>();
    data.forEach(order => {
      const current = types.get(order.customerType) || 0;
      types.set(order.customerType, current + order.totalPrice);
    });
    
    return Array.from(types.entries())
      .map(([type, revenue]) => ({
        x: type,
        y: revenue,
      }))
      .sort((a, b) => b.y - a.y);
  }, [data]);

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

        <View style={styles.section}>
          <RevenueChart data={trendData} title="Daily Revenue Trend" />
        </View>

        <View style={styles.section}>
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Monthly Revenue</Text>
            {monthlyData.length > 0 ? (
              <MonthlyBarChart data={monthlyData} width={width - 32} height={250} />
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>No monthly data available</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Revenue by Customer Type</Text>
            {customerTypeData.length > 0 ? (
              <CustomerTypeBarChart data={customerTypeData} width={width - 32} height={250} />
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>No customer type data available</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.insightCard}>
            <Text style={styles.insightTitle}>Key Insights</Text>
            <View style={styles.insightItem}>
              <View style={styles.insightBullet} />
              <Text style={styles.insightText}>
                Revenue has grown {((monthlyData[monthlyData.length - 1]?.y || 0) / (monthlyData[0]?.y || 1) * 100 - 100).toFixed(0)}% over the displayed period
              </Text>
            </View>
            <View style={styles.insightItem}>
              <View style={styles.insightBullet} />
              <Text style={styles.insightText}>
                {customerTypeData[0]?.x} accounts for the highest revenue share
              </Text>
            </View>
            <View style={styles.insightItem}>
              <View style={styles.insightBullet} />
              <Text style={styles.insightText}>
                Average daily revenue: ${(trendData.reduce((sum, d) => sum + d.revenue, 0) / trendData.length).toFixed(0)}
              </Text>
            </View>
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
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  insightCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  insightTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  insightBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1e40af',
    marginTop: 6,
    marginRight: 12,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  noDataContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});