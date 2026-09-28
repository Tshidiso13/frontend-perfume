"use client";

import type {
  PayfastCheckoutData,
  PayfastCheckoutResponse,
} from "@/services/checkout.service";

/* =========================================================
   TYPES
========================================================= */

export type PaymentRedirectResult = {
  orderNumber: string;
  provider: "PAYFAST";
};

/* =========================================================
   SERVICE
========================================================= */

export const paymentsService = {
  /**
   * Redirect the browser to PayFast using the signed form
   * fields returned by NestJS.
   *
   * IMPORTANT:
   * The frontend must never generate the PayFast signature
   * or calculate the trusted amount itself.
   */
  redirectToPayfast(
    payment:
      PayfastCheckoutData
  ): void {
    if (
      typeof window ===
      "undefined"
    ) {
      throw new Error(
        "PayFast redirect can only run in the browser."
      );
    }

    if (
      !payment.action
    ) {
      throw new Error(
        "PayFast payment URL is missing."
      );
    }

    if (
      !payment.fields ||
      Object.keys(
        payment.fields
      ).length ===
        0
    ) {
      throw new Error(
        "PayFast payment fields are missing."
      );
    }

    const form =
      document.createElement(
        "form"
      );

    form.method =
      payment.method ??
      "POST";

    form.action =
      payment.action;

    form.style.display =
      "none";

    for (
      const [
        name,
        value,
      ] of Object.entries(
        payment.fields
      )
    ) {
      const input =
        document.createElement(
          "input"
        );

      input.type =
        "hidden";

      input.name =
        name;

      input.value =
        String(
          value
        );

      form.appendChild(
        input
      );
    }

    form.submit();

    /*
     * The browser will navigate to PayFast immediately after
     * submission. Do not mark the payment as successful here.
     */
  },

  /**
   * Convenience helper when you already have the complete
   * checkout response from checkoutService.create().
   */
  continuePayfastCheckout(
    response:
      PayfastCheckoutResponse
  ): PaymentRedirectResult {
    const result: PaymentRedirectResult =
      {
        orderNumber:
          response.order
            .orderNumber,

        provider:
          "PAYFAST",
      };

    this.redirectToPayfast(
      response.payfast
    );

    return result;
  },

  /**
   * Clear a guest browser cart after a Cash on Delivery order
   * has been accepted by the backend.
   *
   * For PayFast, do NOT clear the guest cart before the user
   * leaves for PayFast. The verified ITN controls payment
   * completion server-side.
   */
  clearGuestCart() {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    window.localStorage.removeItem(
      "elan_cart"
    );

    window.dispatchEvent(
      new CustomEvent(
        "elan:cart-updated",
        {
          detail: {
            count:
              0,
          },
        }
      )
    );
  },
};
