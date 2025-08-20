import { FiltersPayload } from '@/types/finance';

export async function mockFinanceGet(path: string): Promise<unknown> {
  await new Promise(r => setTimeout(r, 300));

  if (path.startsWith('/api/finance/pulse')) {
    return {
      kpis: {
        revenue_today: 12450.32,
        revenue_week: 81234.55,
        revenue_mtd: 321455.88,
        revenue_last30: 512345.67,
        revenue_ytd: 2321455.12,
        orders: 184,
        units: 9212,
        aov: 1746.45,
        top_customer: { company: 'Urban Threads', revenue: 42110.9 },
        top_category: { category: 'Screen Print', revenue: 98210.0 },
      },
      compare: { revenue_week_delta_pct: -0.13, revenue_mtd_delta_pct: 0.07 },
    } as const;
  }

  if (path.startsWith('/api/finance/pulse/trend')) {
    return {
      bucket: 'day',
      series: [
        { date: '2025-08-10', revenue: 15432.11, orders: 9, units: 460 },
        { date: '2025-08-11', revenue: 18754.90, orders: 12, units: 590 },
        { date: '2025-08-12', revenue: 17120.50, orders: 10, units: 540 },
      ],
    } as const;
  }

  if (path.startsWith('/api/finance/customers/top')) {
    return [
      { company: 'Urban Threads', revenue: 42110.90, orders: 11, units: 1880, aov: 3828.26 },
      { company: 'Gym Club', revenue: 38890.10, orders: 9, units: 1600, aov: 4321.12 },
      { company: 'Enterprise Corp', revenue: 35110.55, orders: 8, units: 1400, aov: 4388.82 },
    ] as const;
  }

  if (path.startsWith('/api/finance/customers/cold')) {
    return [
      { company: 'Gym Club', last_order_date: '2025-07-20', last_order_value: 2820.00, avg_orders_per_month: 2.1, customer_type: 'Direct' },
      { company: 'Yoga Studio', last_order_date: '2025-07-12', last_order_value: 1800.00, avg_orders_per_month: 1.9, customer_type: 'Direct' },
    ] as const;
  }

  if (path.startsWith('/api/finance/heatmap/seasonality')) {
    return {
      rows: ['Urban Threads', 'Gym Club'],
      cols: ['2025-01', '2025-02', '2025-03'],
      values: [
        [12110, 9100, 13300],
        [8200, 7000, 9400],
      ],
    } as const;
  }

  if (path.startsWith('/api/finance/revenue/status')) {
    return [
      { period: '2025-08', order_status: 'Completed', revenue: 142110.5 },
      { period: '2025-08', order_status: 'Production', revenue: 22110.0 },
      { period: '2025-08', order_status: 'Shipped', revenue: 51210.0 },
      { period: '2025-09', order_status: 'Completed', revenue: 118220.2 },
      { period: '2025-09', order_status: 'Production', revenue: 40110.0 },
    ] as const;
  }

  if (path.startsWith('/api/finance/orders/high-value')) {
    return [
      { order_id: '20250104', order_date: '2025-01-20', company: 'Enterprise Corp', order_total: 7950.0, units: 300, top_categories: ['Custom Screen Print'] },
      { order_id: '20250102', order_date: '2025-01-10', company: 'Contract Solutions Inc', order_total: 7560.0, units: 180, top_categories: ['Hybrid Decoration'] },
    ] as const;
  }

  if (path.startsWith('/api/finance/customers/')) {
    const company = decodeURIComponent(path.split('/api/finance/customers/')[1].split('?')[0]);
    return {
      header: { company, customer_type: 'Enterprise', lifetime_revenue: 532110.11, lifetime_orders: 182 },
      orders: [
        { order_id: 'X1001', order_date: '2025-08-01', order_total: 5100.0, units: 180, top_categories: ['Screen Print'] },
        { order_id: 'X1002', order_date: '2025-08-18', order_total: 6100.0, units: 210, top_categories: ['Embroidery'] },
      ],
      monthly: [
        { period: '2025-06', revenue: 32110.2 },
        { period: '2025-07', revenue: 28110.0 },
        { period: '2025-08', revenue: 35110.9 },
      ],
      mix: [
        { category: 'Screen Print', revenue: 81210.1 },
        { category: 'Embroidery', revenue: 54110.4 },
      ],
    } as const;
  }

  return {};
}