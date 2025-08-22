import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';

interface ChartProps {
  type: 'bar' | 'line' | 'donut';
  data: any[];
  categories?: string[];
  height?: number;
  title?: string;
}

const { width: screenWidth } = Dimensions.get('window');

export default function Chart({ type, data, categories, height = 200, title }: ChartProps) {
  const { colors } = useTheme();

  // Simple mock chart implementation for React Native
  // In a real app, you'd use react-native-chart-kit or similar
  const renderBarChart = () => {
    const maxValue = Math.max(...data);
    const barWidth = (screenWidth - 80) / data.length - 8;
    
    return (
      <View style={styles.chartContainer}>
        <View style={styles.barsContainer}>
          {data.map((value, index) => {
            const barHeight = (value / maxValue) * (height - 60);
            return (
              <View key={index} style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: barHeight,
                      width: barWidth,
                      backgroundColor: colors.primary,
                    },
                  ]}
                />
                <Text style={[styles.barLabel, { color: colors.text }]} numberOfLines={1}>
                  {categories?.[index] || `Item ${index + 1}`}
                </Text>
                <Text style={[styles.barValue, { color: colors.subtle }]}>
                  {typeof value === 'number' ? value.toLocaleString() : value}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderLineChart = () => {
    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);
    const range = maxValue - minValue || 1;
    const pointWidth = (screenWidth - 80) / (data.length - 1 || 1);
    
    return (
      <View style={styles.chartContainer}>
        <View style={[styles.lineContainer, { height: height - 40 }]}>
          {data.map((value, index) => {
            const y = ((maxValue - value) / range) * (height - 80);
            const x = index * pointWidth;
            return (
              <View
                key={index}
                style={[
                  styles.linePoint,
                  {
                    left: x,
                    top: y,
                    backgroundColor: colors.primary,
                  },
                ]}
              />
            );
          })}
        </View>
        <View style={styles.lineLabels}>
          {categories?.map((label, index) => (
            <Text key={index} style={[styles.lineLabel, { color: colors.text }]} numberOfLines={1}>
              {label}
            </Text>
          ))}
        </View>
      </View>
    );
  };

  const renderDonutChart = () => {
    const total = data.reduce((sum, value) => sum + value, 0);
    
    return (
      <View style={styles.chartContainer}>
        <View style={styles.donutContainer}>
          <View style={[styles.donutCenter, { backgroundColor: colors.surface }]}>
            <Text style={[styles.donutTotal, { color: colors.text }]}>Total</Text>
            <Text style={[styles.donutValue, { color: colors.text }]}>{total.toLocaleString()}</Text>
          </View>
        </View>
        <View style={styles.donutLegend}>
          {data.map((value, index) => {
            const percentage = ((value / total) * 100).toFixed(1);
            return (
              <View key={index} style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: colors.primary }]} />
                <Text style={[styles.legendText, { color: colors.text }]}>
                  {categories?.[index] || `Item ${index + 1}`}: {percentage}%
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      {title && (
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      )}
      {type === 'bar' && renderBarChart()}
      {type === 'line' && renderLineChart()}
      {type === 'donut' && renderDonutChart()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  chartContainer: {
    alignItems: 'center',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    width: '100%',
    height: 160,
  },
  barWrapper: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 2,
  },
  bar: {
    borderRadius: 4,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 2,
  },
  barValue: {
    fontSize: 9,
    textAlign: 'center',
  },
  lineContainer: {
    position: 'relative',
    width: '100%',
    marginBottom: 16,
  },
  linePoint: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  lineLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  lineLabel: {
    fontSize: 10,
    textAlign: 'center',
    flex: 1,
  },
  donutContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 20,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  donutCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutTotal: {
    fontSize: 12,
    fontWeight: '600',
  },
  donutValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  donutLegend: {
    alignItems: 'flex-start',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
  },
});