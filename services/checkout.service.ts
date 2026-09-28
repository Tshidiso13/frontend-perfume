"use client";

import {
  api,
} from "@/lib/api";

/* =========================================================
   TYPES
========================================================= */

export type CheckoutDeliveryMethod =
  | "ARAMEX"
  | "PAXI";

export type CheckoutPaymentMethod =
  | "PAYFAST"
  | "CASH_ON_DELIVERY";

export type CheckoutLine = {
  variantId: string;
  quantity: number;
};

export type CheckoutOptions = {
  currency: "ZAR";

  guestCheckout: boolean;

  paymentMethods: readonly CheckoutPaymentMethod[];

  shipping: {
    ARAMEX: number;
    PAXI: number;
  };

  freeDeliveryThreshold: number;
};

export type CheckoutPreviewItem = {
  productId: string;
  variantId: string;

  slug: string;
  name: string;

  family: string;
  concentration: string;

  size: string;
  sku: string;

  imageUrl: string | null;

  price: number;
  quantity: number;
  lineTotal: number;

  availableStock: number;
};

export type CheckoutPreview = {
  items: CheckoutPreviewItem[];

  subtotal: number;
  shipping: number;
  total: number;

  currency: "ZAR";

  freeDeliveryThreshold: number;
  amountUntilFreeDelivery: number;
  freeDeliveryUnlocked: boolean;
};

export type CreateCheckoutPayload = {
  items: CheckoutLine[];

  deliveryMethod:
    CheckoutDeliveryMethod;

  paymentMethod:
    CheckoutPaymentMethod;

  firstName: string;
  lastName: string;

  email: string;
  phone: string;

  address: string;
  addressExtra?: string;

  suburb: string;
  city: string;
  province: string;
  postalCode: string;

  paxiPointCode?: string;
  paxiPointName?: string;
};

export type CheckoutOrder = {
  id: string;
  orderNumber: string;
  orderStatus: string;
  paymentStatus: string;
};

export type PayfastCheckoutData = {
  action: string;
  method: "POST";

  fields: Record<
    string,
    string
  >;
};

export type PayfastCheckoutResponse = {
  kind: "PAYFAST";

  order: CheckoutOrder;

  quote: CheckoutPreview;

  payfast: PayfastCheckoutData;
};

export type CashOnDeliveryCheckoutResponse = {
  kind: "COD";

  order: CheckoutOrder;

  quote: CheckoutPreview;

  redirectUrl: string;
};

export type CreateCheckoutResponse =
  | PayfastCheckoutResponse
  | CashOnDeliveryCheckoutResponse;

/* =========================================================
   SERVICE
========================================================= */

export const checkoutService = {
  /**
   * Public checkout configuration.
   *
   * GET /api/checkout/options
   *
   * Works for guests and authenticated customers.
   */
  options() {
    return api<CheckoutOptions>(
      "/checkout/options"
    );
  },

  /**
   * Recalculate the order using the backend as the
   * source of truth.
   *
   * The browser only sends variant IDs + quantities.
   * NestJS determines:
   *
   * - product availability
   * - real variant price
   * - stock
   * - shipping
   * - free-delivery threshold
   * - final total
   */
  preview(
    payload: {
      items: CheckoutLine[];

      deliveryMethod:
        CheckoutDeliveryMethod;
    }
  ) {
    return api<CheckoutPreview>(
      "/checkout/preview",
      {
        method:
          "POST",

        body:
          JSON.stringify(
            payload
          ),
      }
    );
  },

  /**
   * Create the real order.
   *
   * The backend decides whether the order belongs to an
   * authenticated account based on the optional JWT cookie.
   *
   * Guest:
   *   Order.userId = null
   *
   * Logged in:
   *   Order.userId = authenticated user ID
   *
   * Both retain the checkout email snapshot.
   */
  create(
    payload:
      CreateCheckoutPayload
  ) {
    return api<CreateCheckoutResponse>(
      "/checkout",
      {
        method:
          "POST",

        body:
          JSON.stringify(
            payload
          ),
      }
    );
  },
};
