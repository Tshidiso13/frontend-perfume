import {
  api,
} from "@/lib/api";

export type OrderStatus =
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

export type PaymentStatus =
  | "PENDING"
  | "COMPLETE"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED";

export type PaymentMethod =
  | "PAYFAST"
  | "CASH_ON_DELIVERY";

export type DeliveryMethod =
  | "ARAMEX"
  | "PAXI";

export type OrderItem = {
  id: string;
  productId: string;
  variantId: string;
  slug?: string;
  productName: string;
  family: string;
  concentration: string;
  sku: string;
  size: string;
  imageUrl: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type OrderListItem = {
  id: string;
  orderNumber: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  deliveryMethod: DeliveryMethod;
  subtotal: number;
  shipping: number;
  total: number;
  currency: string;
  itemCount: number;
  items: OrderItem[];
  paidAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OrdersResponse = {
  data: OrderListItem[];

  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

export type OrderPayment = {
  id: string;
  provider: "PAYFAST";
  merchantPaymentId: string;
  providerPaymentId: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  completedAt: string | null;
  createdAt: string;
};

export type OrderShipment = {
  id: string;
  provider: DeliveryMethod;
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
};

export type OrderDetail = {
  id: string;
  orderNumber: string;
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

  deliveryMethod: DeliveryMethod;

  paxi: {
    pointCode: string | null;
    pointName: string | null;
  };

  paymentMethod: PaymentMethod;

  subtotal: number;
  shipping: number;
  total: number;
  currency: string;

  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;

  reservationExpiresAt: string | null;
  paidAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;

  itemCount: number;
  items: OrderItem[];

  payment: OrderPayment | null;
  shipment: OrderShipment | null;
};

export type GuestOrderReference = {
  orderId: string;
  orderNumber?: string;
  email: string;
  rememberedAt: string;
};

const GUEST_ORDERS_KEY =
  "elan_guest_orders";

export const ordersService = {
  /* =======================================================
     ACCOUNT
  ======================================================== */

  getAll(
    params: {
      page?: number;
      limit?: number;
      status?: OrderStatus;
    } = {}
  ) {
    const query =
      new URLSearchParams();

    if (
      params.page
    ) {
      query.set(
        "page",
        String(
          params.page
        )
      );
    }

    if (
      params.limit
    ) {
      query.set(
        "limit",
        String(
          params.limit
        )
      );
    }

    if (
      params.status
    ) {
      query.set(
        "status",
        params.status
      );
    }

    const suffix =
      query.toString();

    return api<OrdersResponse>(
      `/orders${
        suffix
          ? `?${suffix}`
          : ""
      }`
    );
  },

  getById(
    orderId: string
  ) {
    return api<OrderDetail>(
      `/orders/${encodeURIComponent(
        orderId
      )}`
    );
  },

  /* =======================================================
     GUEST
  ======================================================== */

  lookupGuest(
    orderId: string,
    email: string
  ) {
    return api<OrderDetail>(
      "/orders/guest/lookup",
      {
        method:
          "POST",

        body:
          JSON.stringify({
            orderId:
              orderId.trim(),

            email:
              normalizeEmail(
                email
              ),
          }),
      }
    );
  },

  listGuest(
    refs:
      GuestOrderReference[]
  ) {
    return api<OrdersResponse>(
      "/orders/guest/list",
      {
        method:
          "POST",

        body:
          JSON.stringify({
            orders:
              refs.map(
                (
                  ref
                ) => ({
                  orderId:
                    ref.orderId,

                  email:
                    normalizeEmail(
                      ref.email
                    ),
                })
              ),
          }),
      }
    );
  },

  async getRememberedGuestOrders() {
    const refs =
      readGuestOrderReferences();

    if (
      refs.length ===
      0
    ) {
      return {
        data: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          pages: 1,
        },
      } satisfies OrdersResponse;
    }

    return this.listGuest(
      refs
    );
  },

  async lookupAndRememberGuest(
    orderId: string,
    email: string
  ) {
    const order =
      await this.lookupGuest(
        orderId,
        email
      );

    rememberGuestOrder({
      orderId:
        order.id,

      orderNumber:
        order.orderNumber,

      email:
        order.email,
    });

    return order;
  },

  async getGuestDetailFromMemory(
    orderId: string
  ) {
    const refs =
      readGuestOrderReferences();

    const normalized =
      orderId
        .trim()
        .toLowerCase();

    const ref =
      refs.find(
        (
          item
        ) =>
          item.orderId
            .toLowerCase() ===
            normalized ||
          item.orderNumber
            ?.toLowerCase() ===
            normalized
      );

    if (
      !ref
    ) {
      return null;
    }

    return this.lookupGuest(
      orderId,
      ref.email
    );
  },

  rememberGuestOrder(
    input: {
      orderId: string;
      orderNumber?: string;
      email: string;
    }
  ) {
    rememberGuestOrder(
      input
    );
  },

  getGuestReferences() {
    return readGuestOrderReferences();
  },

  isUnauthorized(
    error: unknown
  ) {
    return isUnauthorized(
      error
    );
  },
};

/* =========================================================
   STORAGE
========================================================= */

function readGuestOrderReferences():
  GuestOrderReference[] {
  if (
    typeof window ===
    "undefined"
  ) {
    return [];
  }

  try {
    const raw =
      window.localStorage.getItem(
        GUEST_ORDERS_KEY
      );

    if (
      !raw
    ) {
      return [];
    }

    const parsed =
      JSON.parse(
        raw
      );

    if (
      !Array.isArray(
        parsed
      )
    ) {
      return [];
    }

    return parsed
      .filter(
        (
          item
        ): item is
          GuestOrderReference =>
          Boolean(
            item
          ) &&
          typeof item.orderId ===
            "string" &&
          typeof item.email ===
            "string"
      )
      .slice(
        0,
        20
      );
  } catch {
    return [];
  }
}

function rememberGuestOrder(
  input: {
    orderId: string;
    orderNumber?: string;
    email: string;
  }
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  const current =
    readGuestOrderReferences();

  const email =
    normalizeEmail(
      input.email
    );

  const next:
    GuestOrderReference[] = [
      {
        orderId:
          input.orderId,

        orderNumber:
          input.orderNumber,

        email,

        rememberedAt:
          new Date()
            .toISOString(),
      },

      ...current.filter(
        (
          item
        ) =>
          item.orderId !==
            input.orderId &&
          (
            !input.orderNumber ||
            item.orderNumber !==
              input.orderNumber
          )
      ),
    ].slice(
      0,
      20
    );

  window.localStorage.setItem(
    GUEST_ORDERS_KEY,
    JSON.stringify(
      next
    )
  );
}

function normalizeEmail(
  email: string
) {
  return email
    .trim()
    .toLowerCase();
}

function isUnauthorized(
  error: unknown
) {
  const pattern =
    /401|unauthori[sz]ed|not authenticated|authentication required|sign in|session has expired/i;

  if (
    typeof error ===
    "string"
  ) {
    return pattern.test(
      error
    );
  }

  if (
    error instanceof
      Error
  ) {
    return pattern.test(
      error.message
    );
  }

  if (
    typeof error ===
      "object" &&
    error !==
      null
  ) {
    const candidate =
      error as {
        status?: unknown;
        statusCode?: unknown;
        message?: unknown;
        error?: unknown;
        response?: unknown;
      };

    if (
      Number(
        candidate.status
      ) ===
        401 ||
      Number(
        candidate.statusCode
      ) ===
        401
    ) {
      return true;
    }

    for (
      const value
      of [
        candidate.message,
        candidate.error,
      ]
    ) {
      if (
        typeof value ===
          "string" &&
        pattern.test(
          value
        )
      ) {
        return true;
      }
    }

    if (
      typeof candidate.response ===
        "object" &&
      candidate.response !==
        null
    ) {
      const response =
        candidate.response as {
          status?: unknown;
        };

      if (
        Number(
          response.status
        ) ===
        401
      ) {
        return true;
      }
    }
  }

  return false;
}
