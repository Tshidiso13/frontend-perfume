import {
  api,
} from "@/lib/api";

export type AdminOrderStatus =
  | "PENDING_PAYMENT"
  | "PROCESSING"
  | "PACKING"
  | "READY_FOR_SHIPMENT"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURN_REQUESTED"
  | "RETURNED"
  | "REFUNDED";

export type AdminPaymentStatus =
  | "PENDING"
  | "COMPLETE"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED";

export type AdminDeliveryMethod =
  | "ARAMEX"
  | "PAXI";

export type AdminOrderSummary = {
  totalOrders: number;
  ordersToday: number;
  pendingPayment: number;
  processing: number;
  packing: number;
  readyToShip: number;
  paidRevenue: number;
  revenueToday: number;
};

export type AdminOrderListItem = {
  id: string;
  orderNumber: string;
  userId: string | null;
  email: string;
  firstName: string;
  lastName: string;
  customerName: string;
  customerType:
    | "ACCOUNT"
    | "GUEST";
  deliveryMethod: AdminDeliveryMethod;
  paymentMethod:
    | "PAYFAST"
    | "CASH_ON_DELIVERY";
  orderStatus: AdminOrderStatus;
  paymentStatus: AdminPaymentStatus;
  total: number;
  currency: string;
  itemCount: number;
  items: Array<{
    id: string;
    productName: string;
    size: string;
    quantity: number;
    imageUrl: string | null;
  }>;
  createdAt: string;
  paidAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
};

export type AdminOrdersResponse = {
  data:
    AdminOrderListItem[];

  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };

  summary:
    AdminOrderSummary;
};

export type AdminOrderDetail = {
  id: string;
  orderNumber: string;
  customerType:
    | "ACCOUNT"
    | "GUEST";

  account: {
    id: string;
    name: string;
    email: string;
    imageUrl: string | null;
    status: string;
    createdAt: string;
  } | null;

  email: string;

  customer: {
    firstName: string;
    lastName: string;
    phone: string;
  };

  deliveryAddress: {
    addressLine1: string;
    addressLine2: string | null;
    suburb: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };

  deliveryMethod:
    AdminDeliveryMethod;

  paxi: {
    pointCode: string | null;
    pointName: string | null;
  };

  paymentMethod:
    | "PAYFAST"
    | "CASH_ON_DELIVERY";

  subtotal: number;
  shipping: number;
  total: number;
  currency: string;

  orderStatus:
    AdminOrderStatus;

  paymentStatus:
    AdminPaymentStatus;

  reservationExpiresAt: string | null;
  paidAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;

  itemCount: number;

  items: Array<{
    id: string;
    productId: string;
    variantId: string;
    slug: string;
    productName: string;
    family: string;
    concentration: string;
    sku: string;
    size: string;
    imageUrl: string | null;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;

  payment: {
    id: string;
    provider: "PAYFAST";
    merchantPaymentId: string;
    providerPaymentId: string | null;
    amount: number;
    currency: string;
    status: AdminPaymentStatus;
    completedAt: string | null;
    createdAt: string;
    updatedAt: string;
  } | null;

  shipment: {
    id: string;
    provider: AdminDeliveryMethod;
    service: string;
    trackingNumber: string | null;
    collectionPointCode: string | null;
    collectionPointName: string | null;
    status: string;
    trackingUrl: string | null;
    externalShipmentId: string | null;
    shippedAt: string | null;
    deliveredAt: string | null;
    createdAt: string;
    updatedAt: string;
  } | null;

  dispute: {
    id: string;
    status: string;
    reason: string;
    description: string;
    evidenceUrls: string[];
    adminNotes: string | null;
    resolution: string | null;
    createdAt: string;
    updatedAt: string;
    resolvedAt: string | null;
  } | null;
};

export const adminOrdersService = {
  getAll(
    params: {
      page?: number;
      limit?: number;
      search?: string;
      orderStatus?: AdminOrderStatus;
      paymentStatus?: AdminPaymentStatus;
      deliveryMethod?: AdminDeliveryMethod;
      customerType?:
        | "ACCOUNT"
        | "GUEST";
    } = {}
  ) {
    const query =
      new URLSearchParams();

    for (
      const [
        key,
        value,
      ]
      of Object.entries(
        params
      )
    ) {
      if (
        value !==
          undefined &&
        value !==
          ""
      ) {
        query.set(
          key,
          String(
            value
          )
        );
      }
    }

    const suffix =
      query.toString();

    return api<AdminOrdersResponse>(
      `/admin/orders${
        suffix
          ? `?${suffix}`
          : ""
      }`
    );
  },

  getSummary() {
    return api<AdminOrderSummary>(
      "/admin/orders/summary"
    );
  },

  getById(
    orderId:
      string
  ) {
    return api<AdminOrderDetail>(
      `/admin/orders/${encodeURIComponent(
        orderId
      )}`
    );
  },

  updateStatus(
    orderId:
      string,

    input: {
      orderStatus:
        AdminOrderStatus;
      reason?: string;
    }
  ) {
    return api<AdminOrderDetail>(
      `/admin/orders/${encodeURIComponent(
        orderId
      )}/status`,
      {
        method:
          "PATCH",

        body:
          JSON.stringify(
            input
          ),
      }
    );
  },

  updateShipment(
    orderId:
      string,

    input: {
      provider:
        AdminDeliveryMethod;
      service:
        string;
      trackingNumber?: string;
      collectionPointCode?: string;
      collectionPointName?: string;
      status?: string;
      trackingUrl?: string;
      externalShipmentId?: string;
    }
  ) {
    return api<AdminOrderDetail>(
      `/admin/orders/${encodeURIComponent(
        orderId
      )}/shipment`,
      {
        method:
          "PATCH",

        body:
          JSON.stringify(
            input
          ),
      }
    );
  },
};
