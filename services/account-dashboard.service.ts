import {
  api,
} from "@/lib/api";

import {
  authService,
  type AuthUser,
} from "@/services/auth.service";

import {
  notificationsService,
} from "@/services/notifications.service";

import {
  wishlistService,
} from "@/services/wishlist.service";

/* =========================================================
   TYPES
========================================================= */

export type AccountDashboardOrder = {
  id:
    string;

  orderNumber:
    string;

  orderStatus:
    string;

  paymentStatus:
    string;

  paymentMethod:
    string | null;

  deliveryMethod:
    string | null;

  total:
    number;

  currency:
    string;

  itemCount:
    number | null;

  createdAt:
    string;

  shippedAt:
    string | null;

  deliveredAt:
    string | null;
};

export type AccountDashboardData = {
  user:
    AuthUser;

  stats: {
    totalOrders:
      number | null;

    activeDeliveries:
      number | null;

    wishlist:
      number | null;

    unreadNotifications:
      number | null;

    openReturns:
      number | null;
  };

  recentOrders:
    AccountDashboardOrder[];

  partialErrors: {
    orders?:
      string;

    wishlist?:
      string;

    notifications?:
      string;
  };
};

/* =========================================================
   SERVICE
========================================================= */

export const accountDashboardService = {
  async getOverview():
    Promise<AccountDashboardData> {
    /*
     * Auth is required for the account dashboard.
     * If this fails, let the page redirect to sign in.
     */
    const user =
      await authService.me();

    /*
     * The account dashboard should not fail completely because
     * one secondary widget is temporarily unavailable.
     */
    const [
      ordersResult,
      wishlistResult,
      notificationsResult,
    ] =
      await Promise.allSettled([
        api<unknown>(
          "/orders"
        ),

        wishlistService.getCount(),

        notificationsService.getUnreadCount(),
      ]);

    const partialErrors:
      AccountDashboardData["partialErrors"] =
      {};

    let orders:
      AccountDashboardOrder[] |
      null =
      null;

    if (
      ordersResult.status ===
      "fulfilled"
    ) {
      orders =
        normalizeOrdersResponse(
          ordersResult.value
        );
    } else {
      partialErrors.orders =
        getErrorMessage(
          ordersResult.reason,
          "Unable to load orders."
        );
    }

    let wishlistCount:
      number |
      null =
      null;

    if (
      wishlistResult.status ===
      "fulfilled"
    ) {
      wishlistCount =
        safeCount(
          wishlistResult.value
            ?.count
        );
    } else {
      partialErrors.wishlist =
        getErrorMessage(
          wishlistResult.reason,
          "Unable to load wishlist."
        );
    }

    let unreadNotifications:
      number |
      null =
      null;

    if (
      notificationsResult.status ===
      "fulfilled"
    ) {
      unreadNotifications =
        safeCount(
          notificationsResult.value
            ?.count
        );
    } else {
      partialErrors.notifications =
        getErrorMessage(
          notificationsResult.reason,
          "Unable to load notifications."
        );
    }

    const totalOrders =
      orders
        ? orders.length
        : null;

    const activeDeliveries =
      orders
        ? orders.filter(
            (
              order
            ) =>
              ACTIVE_ORDER_STATUSES.has(
                order.orderStatus
              )
          ).length
        : null;

    const openReturns =
      orders
        ? orders.filter(
            (
              order
            ) =>
              OPEN_RETURN_STATUSES.has(
                order.orderStatus
              )
          ).length
        : null;

    return {
      user,

      stats: {
        totalOrders,
        activeDeliveries,
        wishlist:
          wishlistCount,
        unreadNotifications,
        openReturns,
      },

      recentOrders:
        orders
          ? [
              ...orders,
            ]
              .sort(
                (
                  a,
                  b
                ) =>
                  dateValue(
                    b.createdAt
                  ) -
                  dateValue(
                    a.createdAt
                  )
              )
              .slice(
                0,
                4
              )
          : [],

      partialErrors,
    };
  },
};

/* =========================================================
   ORDER NORMALISER

   Supports the common response shapes used by the existing
   Orders API:
   - Order[]
   - { data: Order[] }
   - { orders: Order[] }

   No sample/mock orders are introduced here.
========================================================= */

function normalizeOrdersResponse(
  input:
    unknown
):
  AccountDashboardOrder[] {
  const list =
    extractArray(
      input
    );

  return list
    .map(
      normalizeOrder
    )
    .filter(
      (
        order
      ): order is
        AccountDashboardOrder =>
        order !==
        null
    );
}

function extractArray(
  value:
    unknown
):
  unknown[] {
  if (
    Array.isArray(
      value
    )
  ) {
    return value;
  }

  if (
    !isRecord(
      value
    )
  ) {
    return [];
  }

  if (
    Array.isArray(
      value.data
    )
  ) {
    return value.data;
  }

  if (
    Array.isArray(
      value.orders
    )
  ) {
    return value.orders;
  }

  return [];
}

function normalizeOrder(
  value:
    unknown
):
  AccountDashboardOrder |
  null {
  if (
    !isRecord(
      value
    )
  ) {
    return null;
  }

  const id =
    asString(
      value.id
    );

  const orderNumber =
    asString(
      value.orderNumber
    );

  const createdAt =
    asString(
      value.createdAt
    );

  if (
    !id ||
    !orderNumber ||
    !createdAt
  ) {
    return null;
  }

  const items =
    Array.isArray(
      value.items
    )
      ? value.items
      : [];

  const derivedItemCount =
    items.length >
    0
      ? items.reduce(
          (
            total,
            item
          ) => {
            if (
              !isRecord(
                item
              )
            ) {
              return total;
            }

            const quantity =
              Number(
                item.quantity
              );

            return (
              total +
              (
                Number.isFinite(
                  quantity
                )
                  ? Math.max(
                      0,
                      quantity
                    )
                  : 0
              )
            );
          },
          0
        )
      : null;

  const explicitItemCount =
    nullableNumber(
      value.itemCount
    );

  return {
    id,

    orderNumber,

    orderStatus:
      asString(
        value.orderStatus
      ) ??
      asString(
        value.status
      ) ??
      "PENDING",

    paymentStatus:
      asString(
        value.paymentStatus
      ) ??
      "PENDING",

    paymentMethod:
      asString(
        value.paymentMethod
      ),

    deliveryMethod:
      asString(
        value.deliveryMethod
      ),

    total:
      finiteNumber(
        value.total
      ),

    currency:
      asString(
        value.currency
      ) ??
      "ZAR",

    itemCount:
      explicitItemCount ??
      derivedItemCount,

    createdAt,

    shippedAt:
      asString(
        value.shippedAt
      ),

    deliveredAt:
      asString(
        value.deliveredAt
      ),
  };
}

/* =========================================================
   HELPERS
========================================================= */

const ACTIVE_ORDER_STATUSES =
  new Set([
    "PROCESSING",
    "PACKING",
    "READY_FOR_SHIPMENT",
    "SHIPPED",
  ]);

const OPEN_RETURN_STATUSES =
  new Set([
    "RETURN_REQUESTED",
    "DISPUTED",
  ]);

function isRecord(
  value:
    unknown
):
  value is
    Record<
      string,
      unknown
    > {
  return (
    typeof value ===
      "object" &&
    value !==
      null &&
    !Array.isArray(
      value
    )
  );
}

function asString(
  value:
    unknown
):
  string |
  null {
  return (
    typeof value ===
      "string" &&
    value.trim()
  )
    ? value.trim()
    : null;
}

function finiteNumber(
  value:
    unknown
) {
  const number =
    Number(
      value
    );

  return Number.isFinite(
    number
  )
    ? number
    : 0;
}

function nullableNumber(
  value:
    unknown
):
  number |
  null {
  if (
    value ===
      null ||
    value ===
      undefined
  ) {
    return null;
  }

  const number =
    Number(
      value
    );

  return Number.isFinite(
    number
  )
    ? number
    : null;
}

function safeCount(
  value:
    unknown
):
  number {
  return Math.max(
    0,
    Math.floor(
      finiteNumber(
        value
      )
    )
  );
}

function dateValue(
  value:
    string
) {
  const parsed =
    new Date(
      value
    ).getTime();

  return Number.isFinite(
    parsed
  )
    ? parsed
    : 0;
}

function getErrorMessage(
  error:
    unknown,

  fallback:
    string
) {
  return error instanceof
    Error
    ? error.message
    : fallback;
}
