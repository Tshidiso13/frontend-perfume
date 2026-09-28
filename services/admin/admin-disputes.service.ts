import {
  api,
} from "@/lib/api";

export type AdminDashboardStats = {
  revenue: number;
  orders: number;
  products: number;
  lowStock: number;
  outOfStock: number;
  openDisputes: number;
};

export type AdminDashboardOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;

  status:
    | "PENDING"
    | "PAYMENT_PENDING"
    | "PAID"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED"
    | "REFUNDED"
    | "DISPUTED";

  paymentStatus:
    | "PENDING"
    | "PAID"
    | "FAILED"
    | "CANCELLED"
    | "REFUNDED"
    | "PARTIALLY_REFUNDED";

  total: number;
  createdAt: string;
};

export type AdminDashboardLowStockItem = {
  id: string;
  productId: string;
  slug: string;
  name: string;
  size: string;
  sku: string;
  stock: number;
  reservedStock: number;
  availableStock: number;
  threshold: number;
};

export type AdminDashboardResponse = {
  stats: AdminDashboardStats;
  recentOrders: AdminDashboardOrder[];
  lowStockItems: AdminDashboardLowStockItem[];
};

export const adminDashboardService = {
  getOverview() {
    return api<AdminDashboardResponse>(
      "/admin/dashboard"
    );
  },
};
