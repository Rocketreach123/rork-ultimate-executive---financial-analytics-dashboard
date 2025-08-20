import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { OrderData } from '@/types/finance';

interface CategoryBreakdownProps {
  data: OrderData[];
  title: string;
}



export function CategoryBreakdown({ data, title }: CategoryBreakdownProps) {
  const categoryRevenue = new Map<string, number>();
  data.forEach(order => {
    const current = categoryRevenue.get(order.category) || 0;
    categoryRevenue.set(order.category, current + order.totalPrice);
  });

  const pieData = Array.from(categoryRevenue.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category, revenue]) => ({
      category,
      revenue,
    }));

  const colors = ['#1e40af', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'];
  const total = pieData.reduce((sum, item) => sum + item.revenue, 0);
  
  const chartSize = 200;
  const radius = 80;
  const innerRadius = 50;
  const centerX = chartSize / 2;
  const centerY = chartSize / 2;

  let currentAngle = 0;
  const slices = pieData.map((item, index) => {
    const percentage = item.revenue / total;
    const angle = percentage * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    
    const x1 = centerX + Math.cos(startAngle) * radius;
    const y1 = centerY + Math.sin(startAngle) * radius;
    const x2 = centerX + Math.cos(endAngle) * radius;
    const y2 = centerY + Math.sin(endAngle) * radius;
    
    const x1Inner = centerX + Math.cos(startAngle) * innerRadius;
    const y1Inner = centerY + Math.sin(startAngle) * innerRadius;
    const x2Inner = centerX + Math.cos(endAngle) * innerRadius;
    const y2Inner = centerY + Math.sin(endAngle) * innerRadius;
    
    const largeArcFlag = angle > Math.PI ? 1 : 0;
    
    const pathData = [
      `M ${x1Inner} ${y1Inner}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      `L ${x2Inner} ${y2Inner}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1Inner} ${y1Inner}`,
      'Z'
    ].join(' ');
    
    currentAngle = endAngle;
    
    return {
      path: pathData,
      color: colors[index],
      item,
      percentage
    };
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.chartContainer}>
        <Svg width={chartSize} height={chartSize}>
          {slices.map((slice, index) => (
            <Path
              key={index}
              d={slice.path}
              fill={slice.color}
            />
          ))}
        </Svg>
      </View>
      <View style={styles.legend}>
        {pieData.map((item, index) => (
          <View key={item.category} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: colors[index] }]} />
            <Text style={styles.legendText}>{item.category}</Text>
            <Text style={styles.legendValue}>
              ${(item.revenue / 1000).toFixed(1)}k
            </Text>
          </View>
        ))}
      </View>
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
  chartContainer: {
    alignItems: 'center',
  },
  legend: {
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 8,
  },
  legendText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  legendValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
  },
});