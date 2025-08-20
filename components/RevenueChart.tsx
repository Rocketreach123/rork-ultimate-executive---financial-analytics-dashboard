import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle, Line, Text as SvgText } from 'react-native-svg';
import { TrendData } from '@/types/finance';

interface RevenueChartProps {
  data: TrendData[];
  title: string;
}

const { width } = Dimensions.get('window');

export function RevenueChart({ data, title }: RevenueChartProps) {
  const chartWidth = width - 64;
  const chartHeight = 200;
  const padding = { left: 70, top: 20, right: 40, bottom: 50 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  if (data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <View style={[styles.chartContainer, { height: chartHeight }]}>
          <Text style={styles.noDataText}>No data available</Text>
        </View>
      </View>
    );
  }

  const maxRevenue = Math.max(...data.map(d => d.revenue));
  const minRevenue = Math.min(...data.map(d => d.revenue));
  const revenueRange = maxRevenue - minRevenue || 1;

  const points = data.map((d, index) => {
    const x = (index / (data.length - 1)) * innerWidth;
    const y = innerHeight - ((d.revenue - minRevenue) / revenueRange) * innerHeight;
    return { x: x + padding.left, y: y + padding.top, revenue: d.revenue };
  });

  const pathData = points.reduce((path, point, index) => {
    const command = index === 0 ? 'M' : 'L';
    return `${path} ${command} ${point.x} ${point.y}`;
  }, '');

  const areaPath = `${pathData} L ${points[points.length - 1].x} ${chartHeight - padding.bottom} L ${padding.left} ${chartHeight - padding.bottom} Z`;

  const yTicks = 5;
  const yTickValues = Array.from({ length: yTicks }, (_, i) => {
    return minRevenue + (revenueRange * i) / (yTicks - 1);
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.chartContainer}>
        <Svg width={chartWidth} height={chartHeight}>
          {/* Grid lines */}
          {yTickValues.map((value, index) => {
            const y = chartHeight - padding.bottom - (index / (yTicks - 1)) * innerHeight;
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
          
          {/* Area fill */}
          <Path d={areaPath} fill="#dbeafe" fillOpacity={0.3} />
          
          {/* Line */}
          <Path d={pathData} fill="none" stroke="#1e40af" strokeWidth={2} />
          
          {/* Data points */}
          {points.map((point, index) => (
            <Circle
              key={index}
              cx={point.x}
              cy={point.y}
              r={3}
              fill="#1e40af"
            />
          ))}
          
          {/* Y-axis labels */}
          {yTickValues.map((value, index) => {
            const y = chartHeight - padding.bottom - (index / (yTicks - 1)) * innerHeight;
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
          
          {/* Axes */}
          <Line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={chartHeight - padding.bottom}
            stroke="#e5e7eb"
            strokeWidth={1}
          />
          <Line
            x1={padding.left}
            y1={chartHeight - padding.bottom}
            x2={chartWidth - padding.right}
            y2={chartHeight - padding.bottom}
            stroke="#e5e7eb"
            strokeWidth={1}
          />
        </Svg>
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
    justifyContent: 'center',
  },
  noDataText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});