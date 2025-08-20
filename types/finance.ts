export interface OrderData {
  orderId: string;
  invoiceDate: string;
  company: string;
  visualId: string;
  category: string;
  lineItemId: string;
  qty: number;
  unitPrice: number;
  totalPrice: number;
  orderStatus: string;
  customerType: string;
}

export interface KPIData {
  revenueToday: number;
  revenueWeek: number;
  revenueMTD: number;
  orders: number;
  units: number;
  aov: number;
  topCustomer: {
    company: string;
    revenue: number;
  } | null;
  topCategory: {
    category: string;
    revenue: number;
  } | null;
}

export interface CustomerMetrics {
  company: string;
  revenue: number;
  orders: number;
  lastOrderDate: string;
  avgOrderValue: number;
  categories: string[];
}

export interface TrendData {
  date: string;
  revenue: number;
  orders: number;
  units: number;
}

export interface HeatmapMatrix {
  rows: string[];
  cols: string[];
  values: number[][];
}

export interface FiltersPayload {
  from: string;
  to: string;
  compare?: boolean;
  company?: string;
  customer_type?: string[];
  category?: string[];
}

export interface FilterState {
  dateFrom: Date;
  dateTo: Date;
  compare?: boolean;
  company?: string;
  customerType?: string[];
  category?: string[];
}
