import { FiltersPayload } from '@/types/finance';

export async function mockFinanceGet(path: string): Promise<unknown> {
  console.log('[mockFinanceGet] Called with path:', path);
  await new Promise(r => setTimeout(r, 200));

  if (path.startsWith('/api/finance/pulse/trend/category')) {
    return {
      bucket: 'month',
      periods: ['2025-06','2025-07','2025-08','2025-09'],
      series: [
        { name: 'Screen Print', data: [32110, 28110, 35110, 37210] },
        { name: 'Embroidery', data: [14110, 12210, 18110, 16010] },
        { name: 'DTF', data: [2210, 1800, 3100, 2900] },
        { name: 'Heat Press', data: [1210, 900, 1500, 1300] },
      ],
    } as const;
  }

  if (path.startsWith('/api/finance/pulse/trend/scatter')) {
    return [
      { date: '2025-08-10', orders: 9, revenue: 15432.11 },
      { date: '2025-08-11', orders: 12, revenue: 18754.90 },
      { date: '2025-08-12', orders: 10, revenue: 17120.50 },
      { date: '2025-08-13', orders: 14, revenue: 20120.10 },
      { date: '2025-08-14', orders: 8, revenue: 13210.00 },
    ] as const;
  }

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
    const query = new URLSearchParams(path.split('?')[1] ?? '');
    const bucket = (query.get('bucket') as 'day'|'week'|'month') ?? 'day';
    if (bucket === 'month') {
      return {
        bucket: 'month',
        series: [
          { date: '2025-06', revenue: 110432.11, orders: 58, units: 3120 },
          { date: '2025-07', revenue: 124754.90, orders: 64, units: 3510 },
          { date: '2025-08', revenue: 131120.50, orders: 70, units: 3720 },
          { date: '2025-09', revenue: 141980.30, orders: 73, units: 3900 },
        ],
      } as const;
    }
    if (bucket === 'week') {
      return {
        bucket: 'week',
        series: [
          { date: '2025-W31', revenue: 75432.11, orders: 39, units: 1960 },
          { date: '2025-W32', revenue: 88754.90, orders: 42, units: 2190 },
          { date: '2025-W33', revenue: 77120.50, orders: 40, units: 2040 },
          { date: '2025-W34', revenue: 90120.30, orders: 45, units: 2260 },
        ],
      } as const;
    }
    return {
      bucket: 'day',
      series: [
        { date: '2025-08-10', revenue: 15432.11, orders: 9, units: 460 },
        { date: '2025-08-11', revenue: 18754.90, orders: 12, units: 590 },
        { date: '2025-08-12', revenue: 17120.50, orders: 10, units: 540 },
        { date: '2025-08-13', revenue: 20120.10, orders: 14, units: 620 },
        { date: '2025-08-14', revenue: 13210.00, orders: 8, units: 420 },
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

  if (path.startsWith('/api/finance/heatmap/process')) {
    return {
      rows: ['Urban Threads', 'Gym Club', 'Enterprise Corp'],
      cols: ['Screen Print', 'Embroidery', 'DTF', 'Heat Press'],
      values: [
        [32110, 18110, 0, 2110],
        [12110, 9100, 600, 1200],
        [22110, 14110, 900, 800],
      ],
      mode: 'absolute',
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

  // Customers pivot endpoint
  if (path.startsWith('/api/analytics/customers/pivot')) {
    console.log('[mockFinanceGet] Generating customer pivot data');
    const months = ['2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06', '2025-07', '2025-08'];
    const clientTypes = ['Direct', 'Wholesale', 'Education', 'Nonprofit'];
    const companyNames = [
      'Urban Threads', 'Gym Club', 'Enterprise Corp', 'Yoga Studio', 'Sports Direct',
      'Fashion Forward', 'Team Gear', 'Custom Apparel Co', 'Print Masters', 'Design Hub',
      'Athletic Wear Inc', 'School District 42', 'University Store', 'Corporate Solutions',
      'Event Planners LLC', 'Marketing Agency', 'Retail Chain', 'Boutique Shop',
      'Non-Profit Org', 'Community Center', 'Local Business', 'Startup Inc',
      'Tech Company', 'Healthcare Group', 'Restaurant Chain', 'Hotel Group'
    ];
    
    const generateRow = (i: number) => {
      // Create more realistic monthly data with some seasonality
      const baseAmount = 10000 + Math.random() * 80000;
      const monthly = months.map((_, monthIndex) => {
        // Add seasonality - higher in summer months
        const seasonalMultiplier = monthIndex >= 4 && monthIndex <= 7 ? 1.3 : 0.8;
        const variance = 0.7 + Math.random() * 0.6; // 0.7 to 1.3 multiplier
        return Math.round(baseAmount * seasonalMultiplier * variance);
      });
      const total = monthly.reduce((a, b) => a + b, 0);
      const orders = Math.round(20 + (total / 3000));
      const units = Math.round(500 + (total / 100));
      
      // Add additional fields for enhanced functionality
      const creditTermsOptions = ['Net30', 'COD', 'Prepaid'];
      const distributorGroupsOptions = [['ASI'], ['SAGE'], ['SGIA'], ['PPAI'], ['ASI', 'SAGE'], ['Independent']];
      const lastOrderDays = Math.floor(Math.random() * 90); // 0-90 days ago
      const lastOrderDate = new Date();
      lastOrderDate.setDate(lastOrderDate.getDate() - lastOrderDays);
      
      return {
        customer_id: `cust_${String(i + 1).padStart(3, '0')}`,
        company: companyNames[i % companyNames.length],
        client_type: clientTypes[i % clientTypes.length],
        monthly,
        total,
        orders,
        units,
        growth_pct: (Math.random() - 0.5) * 40, // -20% to +20% growth
        last_order_date: lastOrderDate.toISOString().split('T')[0],
        credit_terms: creditTermsOptions[i % creditTermsOptions.length],
        distributor_groups: distributorGroupsOptions[i % distributorGroupsOptions.length],
        red_flag: Math.random() < 0.05, // 5% chance of red flag
        share_of_wallet: Math.random() * 100, // 0-100%
      };
    };
    
    const rows = Array.from({ length: 26 }, (_, i) => generateRow(i));
    console.log('[mockFinanceGet] Generated', rows.length, 'customer rows');
    
    return {
      months,
      rows,
      meta: { page: 1, per_page: 100, total: rows.length },
    };
  }

  // Customer summary endpoint
  if (path.match(/\/api\/customers\/[^/]+\/summary/)) {
    const customerId = path.split('/api/customers/')[1].split('/summary')[0];
    console.log('[mockFinanceGet] Customer summary for ID:', customerId);
    
    // Map customer ID to company name
    const companyNames = {
      'cust_001': 'Urban Threads',
      'cust_002': 'Gym Club', 
      'cust_003': 'Enterprise Corp',
      'cust_004': 'Yoga Studio',
      'cust_005': 'Sports Direct',
    };
    
    const companyName = companyNames[customerId as keyof typeof companyNames] || decodeURIComponent(customerId);
    const clientTypes = ['Direct', 'Wholesale', 'Education', 'Nonprofit'];
    const referralSources = ['Trade Show', 'Google Ads', 'Referral', 'Cold Outreach', 'Website'];
    const distributorGroups = [['ASI', 'SGIA'], ['SAGE'], ['ASI'], ['PPAI', 'SAGE'], ['Independent']];
    
    const baseRevenue = 200000 + Math.random() * 800000;
    const orders = Math.round(50 + Math.random() * 300);
    
    const primaryContacts = [
      { name: 'John Smith', email: 'john@company.com', phone: '(555) 123-4567', role: 'Purchasing Manager' },
      { name: 'Sarah Johnson', email: 'sarah@company.com', phone: '(555) 234-5678', role: 'Operations Director' },
      { name: 'Mike Davis', email: 'mike@company.com', phone: '(555) 345-6789', role: 'Marketing Manager' },
      { name: 'Lisa Wilson', email: 'lisa@company.com', phone: '(555) 456-7890', role: 'CEO' },
    ];
    
    const tags = [['VIP', 'Preferred'], ['Net30'], ['High Volume'], ['Seasonal'], []];
    
    return {
      customer: {
        id: customerId,
        name: companyName,
        client_type: clientTypes[Math.floor(Math.random() * clientTypes.length)],
        referral_source: referralSources[Math.floor(Math.random() * referralSources.length)],
        distributor_groups: distributorGroups[Math.floor(Math.random() * distributorGroups.length)],
        red_flag: Math.random() < 0.1, // 10% chance of red flag
        vip_status: Math.random() < 0.15, // 15% chance of VIP
        credit_terms: 'Net30',
        primary_contact: primaryContacts[Math.floor(Math.random() * primaryContacts.length)],
        tags: tags[Math.floor(Math.random() * tags.length)],
        notes: 'Sample customer notes would be stored here.',
      },
      stats: {
        historical_spend: Math.round(baseRevenue),
        orders,
        units: Math.round(orders * 30 + Math.random() * 5000),
        aov: Math.round(baseRevenue / orders),
        last_order_date: '2025-08-18',
        avg_weekly_revenue: Math.round(baseRevenue / 52),
        avg_monthly_revenue: Math.round(baseRevenue / 12),
        avg_quarterly_revenue: Math.round(baseRevenue / 4),
        avg_weekly_orders: Math.round((orders / 52) * 10) / 10,
        avg_monthly_orders: Math.round((orders / 12) * 10) / 10,
        avg_quarterly_orders: Math.round((orders / 4) * 10) / 10,
        open_orders: Math.floor(Math.random() * 15),
        balance_due: Math.round(Math.random() * 25000),
        lifetime_spend: Math.round(baseRevenue * 1.2),
        growth_pct: (Math.random() - 0.5) * 40, // -20% to +20% growth
        share_of_wallet: Math.random() * 100,
      },
      ranking: { 
        overall: Math.floor(Math.random() * 500) + 1, 
        in_type: Math.floor(Math.random() * 100) + 1 
      },
    };
  }

  // Customer services endpoint
  if (path.match(/\/api\/customers\/[^/]+\/services/)) {
    return {
      categories: [
        { name: 'Screen Print', revenue: 198210, orders: 72 },
        { name: 'Embroidery', revenue: 90210, orders: 38 },
        { name: 'DTF', revenue: 40110, orders: 16 },
        { name: 'Finishing', revenue: 19820, orders: 9 },
      ],
    };
  }

  // Customer seasonality endpoint
  if (path.match(/\/api\/customers\/[^/]+\/seasonality/)) {
    const months = ['2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06', '2025-07', '2025-08'];
    const revenue = months.map(() => Math.round(Math.random() * 90000));
    const orders = months.map(() => Math.round(Math.random() * 30));
    return { months, revenue, orders };
  }

  // Customer benchmark endpoint
  if (path.match(/\/api\/customers\/[^/]+\/benchmark/)) {
    const months = ['2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06', '2025-07', '2025-08'];
    const customer_revenue = months.map(() => Math.round(Math.random() * 90000));
    const type_avg_revenue = months.map(() => Math.round(Math.random() * 70000));
    return { months, customer_revenue, type_avg_revenue };
  }

  // Customer CRM endpoint (PATCH)
  if (path.match(/\/api\/customers\/[^/]+\/crm/)) {
    return { ok: true };
  }

  // Customer orders endpoint
  if (path.match(/\/api\/customers\/[^/]+\/orders/)) {
    return {
      data: [
        { order_id: 'ORD-001', date: '2025-08-15', total: 2500, status: 'Completed', items: 150 },
        { order_id: 'ORD-002', date: '2025-08-10', total: 1800, status: 'Shipped', items: 120 },
        { order_id: 'ORD-003', date: '2025-08-05', total: 3200, status: 'Production', items: 200 },
      ],
      meta: { page: 1, per_page: 50, total: 3 },
    };
  }

  // Customer invoices endpoint
  if (path.match(/\/api\/customers\/[^/]+\/invoices/)) {
    return {
      data: [
        { invoice: 'INV-001', order_id: 'ORD-001', due_date: '2025-09-15', total: 2500, paid: 0, status: 'overdue' },
        { invoice: 'INV-002', order_id: 'ORD-002', due_date: '2025-09-10', total: 1800, paid: 1800, status: 'paid' },
      ],
      meta: { page: 1, per_page: 50, total: 2 },
    };
  }

  // Customer files endpoint
  if (path.match(/\/api\/customers\/[^/]+\/files/)) {
    return [
      { id: 1, name: 'contract.pdf', size_bytes: 245760, url: 'https://example.com/files/contract.pdf', uploaded_at: '2025-08-01', type: 'application/pdf' },
      { id: 2, name: 'logo.png', size_bytes: 51200, url: 'https://example.com/files/logo.png', uploaded_at: '2025-07-15', type: 'image/png' },
    ];
  }

  // Customer activity endpoint
  if (path.match(/\/api\/customers\/[^/]+\/activity/)) {
    return {
      data: [
        { date: '2025-08-15', type: 'order', summary: 'Order ORD-001 completed', order_id: 'ORD-001', amount: 2500 },
        { date: '2025-08-10', type: 'payment', summary: 'Payment received for INV-002', invoice: 'INV-002', amount: 1800 },
        { date: '2025-08-05', type: 'order', summary: 'Order ORD-003 started production', order_id: 'ORD-003' },
      ],
      meta: { page: 1, per_page: 50, total: 3 },
    };
  }

  console.log('[mockFinanceGet] No matching endpoint for path:', path);
  return {};
}
