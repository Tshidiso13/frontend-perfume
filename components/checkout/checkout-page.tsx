"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  Banknote,
  Check,
  ChevronDown,
  CreditCard,
  LoaderCircle,
  LockKeyhole,
  Package,
  ShieldCheck,
  Store,
  Truck,
} from "lucide-react";

import {
  motion,
} from "framer-motion";

import {
  useRouter,
} from "next/navigation";

import {
  toast,
} from "sonner";

import {
  cartService,
} from "@/services/cart.service";

import {
  checkoutService,
  type CheckoutDeliveryMethod,
  type CheckoutLine,
  type CheckoutOptions,
  type CheckoutPaymentMethod,
  type CheckoutPreview,
} from "@/services/checkout.service";

type GuestCartItem = {
  variantId: string;
  quantity: number;
};

const GUEST_CART_KEY =
  "elan_cart";

const CART_UPDATED_EVENT =
  "elan:cart-updated";

const currency =
  new Intl.NumberFormat(
    "en-ZA",
    {
      style:
        "currency",
      currency:
        "ZAR",
      minimumFractionDigits:
        0,
      maximumFractionDigits:
        0,
    }
  );

export function CheckoutPage() {
  const router =
    useRouter();

  const [
    deliveryMethod,
    setDeliveryMethod,
  ] =
    useState<CheckoutDeliveryMethod>(
      "ARAMEX"
    );

  const [
    paymentMethod,
    setPaymentMethod,
  ] =
    useState<CheckoutPaymentMethod>(
      "PAYFAST"
    );

  const [
    province,
    setProvince,
  ] =
    useState(
      "Gauteng"
    );

  const [
    lines,
    setLines,
  ] =
    useState<CheckoutLine[]>(
      []
    );

  const [
    cartSource,
    setCartSource,
  ] =
    useState<
      | "account"
      | "guest"
      | null
    >(null);

  const [
    options,
    setOptions,
  ] =
    useState<CheckoutOptions | null>(
      null
    );

  const [
    preview,
    setPreview,
  ] =
    useState<CheckoutPreview | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] =
    useState(
      true
    );

  const [
    quoteLoading,
    setQuoteLoading,
  ] =
    useState(
      false
    );

  const [
    submitting,
    setSubmitting,
  ] =
    useState(
      false
    );

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(
      null
    );

  /* =======================================================
     LOAD REAL CART + CHECKOUT OPTIONS
  ======================================================== */

  const loadCheckout =
    useCallback(
      async () => {
        setLoading(
          true
        );

        setError(
          null
        );

        try {
          const nextOptions =
            await checkoutService.options();

          setOptions(
            nextOptions
          );

          /*
           * Logged-in checkout:
           * use the real NestJS cart.
           *
           * Guest checkout:
           * if the cart endpoint is unavailable because
           * there is no session, fall back to the guest
           * browser bag.
           */
          try {
            const cart =
              await cartService.getCart();

            if (
              cart.data.length >
              0
            ) {
              setLines(
                cart.data.map(
                  (
                    item
                  ) => ({
                    variantId:
                      item.variantId,

                    quantity:
                      item.quantity,
                  })
                )
              );

              setCartSource(
                "account"
              );

              return;
            }
          } catch {
            /*
             * Guest path continues below.
             */
          }

          const guestItems =
            readGuestCart();

          setLines(
            guestItems
          );

          setCartSource(
            "guest"
          );
        } catch (
          error
        ) {
          setError(
            error instanceof
              Error
              ? error.message
              : "Unable to prepare checkout."
          );
        } finally {
          setLoading(
            false
          );
        }
      },
      []
    );

  useEffect(() => {
    void loadCheckout();
  }, [
    loadCheckout,
  ]);

  /* =======================================================
     AUTHORITATIVE BACKEND QUOTE
  ======================================================== */

  useEffect(() => {
    if (
      loading ||
      lines.length ===
        0
    ) {
      setPreview(
        null
      );

      return;
    }

    let cancelled =
      false;

    async function loadQuote() {
      setQuoteLoading(
        true
      );

      try {
        const response =
          await checkoutService.preview(
            {
              items:
                lines,

              deliveryMethod,
            }
          );

        if (
          !cancelled
        ) {
          setPreview(
            response
          );

          setError(
            null
          );
        }
      } catch (
        error
      ) {
        if (
          !cancelled
        ) {
          const message =
            error instanceof
              Error
              ? error.message
              : "Unable to calculate your order.";

          setError(
            message
          );

          setPreview(
            null
          );
        }
      } finally {
        if (
          !cancelled
        ) {
          setQuoteLoading(
            false
          );
        }
      }
    }

    void loadQuote();

    return () => {
      cancelled =
        true;
    };
  }, [
    deliveryMethod,
    lines,
    loading,
  ]);

  const itemCount =
    useMemo(
      () =>
        preview?.items.reduce(
          (
            total,
            item
          ) =>
            total +
            item.quantity,
          0
        ) ??
        0,
      [
        preview,
      ]
    );

  /* =======================================================
     SUBMIT
  ======================================================== */

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      submitting ||
      !preview ||
      lines.length ===
        0
    ) {
      return;
    }

    const form =
      new FormData(
        event.currentTarget
      );

    const payload = {
      items:
        lines,

      deliveryMethod,

      paymentMethod,

      firstName:
        String(
          form.get(
            "firstName"
          ) ??
            ""
        ).trim(),

      lastName:
        String(
          form.get(
            "lastName"
          ) ??
            ""
        ).trim(),

      email:
        String(
          form.get(
            "email"
          ) ??
            ""
        )
          .trim()
          .toLowerCase(),

      phone:
        String(
          form.get(
            "phone"
          ) ??
            ""
        ).trim(),

      address:
        String(
          form.get(
            "address"
          ) ??
            ""
        ).trim(),

      addressExtra:
        String(
          form.get(
            "addressExtra"
          ) ??
            ""
        ).trim(),

      suburb:
        String(
          form.get(
            "suburb"
          ) ??
            ""
        ).trim(),

      city:
        String(
          form.get(
            "city"
          ) ??
            ""
        ).trim(),

      province,

      postalCode:
        String(
          form.get(
            "postalCode"
          ) ??
            ""
        ).trim(),
    };

    const toastId =
      toast.loading(
        paymentMethod ===
          "PAYFAST"
          ? "Preparing secure PayFast checkout..."
          : "Placing your order..."
      );

    setSubmitting(
      true
    );

    try {
      const response =
        await checkoutService.create(
          payload
        );

      if (
        response.kind ===
        "PAYFAST"
      ) {
        toast.success(
          "Taking you to PayFast...",
          {
            id:
              toastId,
          }
        );

        submitPayfastForm(
          response.payfast.action,
          response.payfast.fields
        );

        return;
      }

      /*
       * COD order is already accepted by the backend.
       */
      await clearCompletedCart(
        cartSource
      );

      window.dispatchEvent(
        new CustomEvent(
          CART_UPDATED_EVENT,
          {
            detail: {
              count:
                0,
            },
          }
        )
      );

      toast.success(
        "Your order has been placed.",
        {
          id:
            toastId,

          description:
            `Order ${response.order.orderNumber} · Pay when your order arrives.`,
        }
      );

      router.push(
        response.redirectUrl
      );

      router.refresh();
    } catch (
      error
    ) {
      toast.error(
        error instanceof
          Error
          ? error.message
          : "Unable to complete checkout.",
        {
          id:
            toastId,
        }
      );
    } finally {
      setSubmitting(
        false
      );
    }
  }

  /* =======================================================
     STATES
  ======================================================== */

  if (
    loading
  ) {
    return (
      <div className="flex min-h-[620px] items-center justify-center bg-[#fbfaf7]">
        <div className="text-center">
          <LoaderCircle
            className="mx-auto size-5 animate-spin !text-[#571628]"
            strokeWidth={
              1.4
            }
          />

          <p className="mt-4 text-[9px] !text-[#8b7972]">
            Preparing checkout...
          </p>
        </div>
      </div>
    );
  }

  if (
    lines.length ===
    0
  ) {
    return (
      <div className="flex min-h-[620px] items-center justify-center bg-[#fbfaf7] px-5">
        <div className="max-w-md text-center">
          <Package
            className="mx-auto size-7 !text-[#a48f86]"
            strokeWidth={
              1.2
            }
          />

          <h1 className="mt-6 font-display text-[40px] !text-[#382725]">
            Your bag is empty.
          </h1>

          <p className="mt-3 text-[11px] leading-6 !text-[#8b7972]">
            Add a fragrance before heading to checkout.
          </p>

          <Link
            href="/shop"
            className="mt-7 inline-flex min-h-[48px] items-center gap-5 bg-[#571628] px-6 text-[10px] font-medium !text-white"
          >
            Explore fragrances

            <ArrowRight
              className="size-4"
              strokeWidth={
                1.4
              }
            />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbfaf7]">
      <main className="mx-auto max-w-[1420px] px-5 pb-24 pt-10 sm:px-8 lg:px-10 lg:pb-32 xl:px-12">
        <motion.div
          initial={{
            opacity:
              0,

            y:
              18,
          }}
          animate={{
            opacity:
              1,

            y:
              0,
          }}
          transition={{
            duration:
              0.7,

            ease: [
              0.22,
              1,
              0.36,
              1,
            ],
          }}
          className="mb-10"
        >
          <p className="mb-4 text-[9px] font-medium uppercase tracking-[0.3em] !text-[#8f6258]">
            Almost there
          </p>

          <h1 className="font-display text-[48px] font-normal leading-none tracking-[-0.04em] !text-[#342725] sm:text-[60px] lg:text-[68px]">
            Let&apos;s make it yours.
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
            <p className="max-w-xl text-[12px] leading-6 !text-[#8b7972]">
              Real prices and stock are checked by ÉLAN before your order is created.
            </p>

            <span className="text-[8px] font-medium uppercase tracking-[0.16em] !text-[#7a5752]">
              Guest checkout · no account required
            </span>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-[9px] !text-[#826f68]">
            <span>
              Already have an account?
            </span>

            <Link
              href="/login?redirect=/checkout"
              className="border-b border-[#6b2230] pb-0.5 font-medium !text-[#6b2230]"
            >
              Sign in
            </Link>

            <span className="!text-[#b29e96]">
              or
            </span>

            <span className="font-medium !text-[#4f3934]">
              continue as guest
            </span>
          </div>
        </motion.div>

        {error && (
          <div className="mb-7 border border-[#dfc8c5] bg-[#f8eeee] px-5 py-4 text-[10px] leading-5 !text-[#8b4d4d]">
            {
              error
            }
          </div>
        )}

        <div className="grid gap-14 lg:grid-cols-[1fr_420px] lg:gap-16 xl:gap-24">
          <form
            id="checkout-form"
            onSubmit={
              handleSubmit
            }
            className="min-w-0"
          >
            <CheckoutSection
              number="01"
              title="Your details"
              description="Where should we send your order updates?"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="First name"
                  name="firstName"
                  placeholder="Your first name"
                  autoComplete="given-name"
                  required
                />

                <Field
                  label="Last name"
                  name="lastName"
                  placeholder="Your last name"
                  autoComplete="family-name"
                  required
                />

                <Field
                  label="Email address"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />

                <Field
                  label="Phone number"
                  type="tel"
                  name="phone"
                  placeholder="+27 00 000 0000"
                  autoComplete="tel"
                  required
                />
              </div>
            </CheckoutSection>

            <CheckoutSection
              number="02"
              title="Delivery address"
              description="Where would you like your fragrances delivered?"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field
                    label="Street address"
                    name="address"
                    placeholder="Street address"
                    autoComplete="street-address"
                    required
                  />
                </div>

                <Field
                  label="Suburb"
                  name="suburb"
                  placeholder="Suburb"
                  required
                />

                <Field
                  label="City"
                  name="city"
                  placeholder="City"
                  autoComplete="address-level2"
                  required
                />

                <label>
                  <span className="mb-2 block text-[9px] !text-[#806e67]">
                    Province
                  </span>

                  <div className="relative">
                    <select
                      value={
                        province
                      }
                      onChange={(
                        event
                      ) =>
                        setProvince(
                          event.target.value
                        )
                      }
                      name="province"
                      className="h-[52px] w-full appearance-none border border-[#d8d0ca] bg-transparent px-4 pr-10 text-[11px] !text-[#382b28] outline-none transition-colors focus:border-[#7e4c55]"
                    >
                      <option>Gauteng</option>
                      <option>Western Cape</option>
                      <option>KwaZulu-Natal</option>
                      <option>Eastern Cape</option>
                      <option>Free State</option>
                      <option>Limpopo</option>
                      <option>Mpumalanga</option>
                      <option>North West</option>
                      <option>Northern Cape</option>
                    </select>

                    <ChevronDown
                      className="pointer-events-none absolute right-4 top-1/2 size-3.5 -translate-y-1/2 !text-[#66554f]"
                      strokeWidth={
                        1.4
                      }
                    />
                  </div>
                </label>

                <Field
                  label="Postal code"
                  name="postalCode"
                  placeholder="0000"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  required
                />

                <div className="sm:col-span-2">
                  <Field
                    label="Apartment, complex or unit"
                    name="addressExtra"
                    placeholder="Optional"
                  />
                </div>
              </div>
            </CheckoutSection>

            <CheckoutSection
              number="03"
              title="How should it get to you?"
              description="Delivery prices come from the checkout backend."
            >
              <div className="space-y-3">
                <DeliveryOption
                  active={
                    deliveryMethod ===
                    "ARAMEX"
                  }
                  onClick={() =>
                    setDeliveryMethod(
                      "ARAMEX"
                    )
                  }
                  icon={
                    Truck
                  }
                  title="Aramex delivery"
                  description="Door-to-door delivery."
                  detail="Estimated 2–5 business days"
                  price={
                    options?.shipping
                      .ARAMEX ??
                    0
                  }
                />

                <DeliveryOption
                  active={
                    deliveryMethod ===
                    "PAXI"
                  }
                  onClick={() =>
                    setDeliveryMethod(
                      "PAXI"
                    )
                  }
                  icon={
                    Store
                  }
                  title="PAXI"
                  description="Collect from a participating PAXI point."
                  detail="Estimated 3–7 business days"
                  price={
                    options?.shipping
                      .PAXI ??
                    0
                  }
                />
              </div>

              {deliveryMethod ===
                "PAXI" && (
                <div className="mt-4 border border-[#d9d0ca] bg-[#f3eee8] p-5">
                  <p className="text-[10px] font-medium !text-[#473530]">
                    PAXI collection
                  </p>

                  <p className="mt-2 max-w-lg text-[10px] leading-5 !text-[#88766f]">
                    Your order stores PAXI as the chosen delivery method. A collection point can be assigned during fulfilment until the live PAXI point selector is connected.
                  </p>
                </div>
              )}

              {preview?.freeDeliveryUnlocked && (
                <p className="mt-4 text-[9px] font-medium !text-[#6b2230]">
                  Free delivery unlocked.
                </p>
              )}

              {preview &&
                !preview.freeDeliveryUnlocked &&
                preview.amountUntilFreeDelivery >
                  0 && (
                  <p className="mt-4 text-[9px] !text-[#8b7770]">
                    Add{" "}
                    {currency.format(
                      preview.amountUntilFreeDelivery
                    )}{" "}
                    more for free delivery.
                  </p>
                )}
            </CheckoutSection>

            <CheckoutSection
              number="04"
              title="Payment"
              description="Choose PayFast or pay when your order arrives."
            >
              <div className="space-y-3">
                <PaymentOption
                  active={
                    paymentMethod ===
                    "PAYFAST"
                  }
                  onClick={() =>
                    setPaymentMethod(
                      "PAYFAST"
                    )
                  }
                  icon={
                    CreditCard
                  }
                  title="PayFast"
                  description="Secure online payment. You will be redirected to PayFast."
                />

                <PaymentOption
                  active={
                    paymentMethod ===
                    "CASH_ON_DELIVERY"
                  }
                  onClick={() =>
                    setPaymentMethod(
                      "CASH_ON_DELIVERY"
                    )
                  }
                  icon={
                    Banknote
                  }
                  title="Cash on delivery"
                  description="Place the order now and pay when your delivery arrives."
                />
              </div>

              <div className="mt-4 flex items-start gap-3">
                <LockKeyhole
                  className="mt-0.5 size-3.5 shrink-0 !text-[#987b71]"
                  strokeWidth={
                    1.35
                  }
                />

                <p className="max-w-xl text-[9px] leading-5 !text-[#8c7972]">
                  {paymentMethod ===
                  "PAYFAST"
                    ? "ÉLAN never collects your card details. PayFast handles the payment and the order is only marked paid after a verified PayFast notification."
                    : "Cash on delivery orders reserve the merchandise immediately and enter fulfilment without an online payment."}
                </p>
              </div>
            </CheckoutSection>

            <div className="mt-8 lg:hidden">
              <SubmitButton
                disabled={
                  submitting ||
                  quoteLoading ||
                  !preview
                }
                submitting={
                  submitting
                }
                paymentMethod={
                  paymentMethod
                }
              />
            </div>
          </form>

          <aside className="lg:sticky lg:top-8 lg:self-start">
            <div className="bg-[#f1ece6] p-6 sm:p-8">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.28em] !text-[#8e655b]">
                    Your order
                  </p>

                  <h2 className="mt-4 font-display text-[36px] font-normal leading-none !text-[#392825]">
                    {itemCount}{" "}
                    {itemCount ===
                    1
                      ? "item"
                      : "items"}
                  </h2>
                </div>

                <Link
                  href="/cart"
                  className="border-b border-[#86616a] pb-1 text-[9px] !text-[#86616a]"
                >
                  Edit bag
                </Link>
              </div>

              {quoteLoading && (
                <div className="flex min-h-[160px] items-center justify-center">
                  <LoaderCircle
                    className="size-4 animate-spin !text-[#571628]"
                    strokeWidth={
                      1.4
                    }
                  />
                </div>
              )}

              {!quoteLoading &&
                preview && (
                  <>
                    <div className="mt-8 space-y-5 border-b border-[#d8cec7] pb-7">
                      {preview.items.map(
                        (
                          item
                        ) => (
                          <div
                            key={
                              item.variantId
                            }
                            className="grid grid-cols-[72px_1fr_auto] gap-4"
                          >
                            <Link
                              href={`/perfumes/${item.slug}`}
                              className="relative aspect-[4/5] overflow-hidden bg-[#e5dfd9]"
                            >
                              {item.imageUrl ? (
                                <Image
                                  src={
                                    item.imageUrl
                                  }
                                  alt={
                                    item.name
                                  }
                                  fill
                                  sizes="72px"
                                  unoptimized
                                  className="object-cover"
                                />
                              ) : (
                                <span className="flex h-full w-full items-center justify-center">
                                  <Package
                                    className="size-4 !text-[#a69188]"
                                    strokeWidth={
                                      1.2
                                    }
                                  />
                                </span>
                              )}

                              <span className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-[#571628] text-[8px] !text-white">
                                {
                                  item.quantity
                                }
                              </span>
                            </Link>

                            <div className="min-w-0 py-1">
                              <p className="truncate font-display text-[17px] !text-[#3c2926]">
                                {
                                  item.name
                                }
                              </p>

                              <p className="mt-1 text-[8px] uppercase tracking-[0.12em] !text-[#987e75]">
                                {
                                  item.family
                                }{" "}
                                ·{" "}
                                {
                                  item.size
                                }
                              </p>
                            </div>

                            <p className="py-1 text-[10px] font-medium !text-[#493833]">
                              {currency.format(
                                item.lineTotal
                              )}
                            </p>
                          </div>
                        )
                      )}
                    </div>

                    <div className="space-y-4 border-b border-[#d8cec7] py-6">
                      <SummaryRow
                        label="Subtotal"
                        value={currency.format(
                          preview.subtotal
                        )}
                      />

                      <SummaryRow
                        label={
                          deliveryMethod ===
                          "ARAMEX"
                            ? "Aramex delivery"
                            : "PAXI delivery"
                        }
                        value={
                          preview.shipping ===
                          0
                            ? "Free"
                            : currency.format(
                                preview.shipping
                              )
                        }
                      />
                    </div>

                    <div className="flex items-end justify-between py-6">
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.16em] !text-[#927d75]">
                          Total
                        </p>

                        <p className="mt-1 text-[8px] !text-[#9d8d86]">
                          ZAR
                        </p>
                      </div>

                      <p className="font-display text-[30px] !text-[#382623]">
                        {currency.format(
                          preview.total
                        )}
                      </p>
                    </div>

                    <SubmitButton
                      desktop
                      disabled={
                        submitting ||
                        quoteLoading ||
                        !preview
                      }
                      submitting={
                        submitting
                      }
                      paymentMethod={
                        paymentMethod
                      }
                    />
                  </>
                )}

              <div className="mt-6 space-y-3">
                <TrustRow
                  icon={
                    ShieldCheck
                  }
                  text="Backend-verified prices and stock."
                />

                <TrustRow
                  icon={
                    Package
                  }
                  text="Guest checkout supported."
                />

                <TrustRow
                  icon={
                    Truck
                  }
                  text="Aramex and PAXI delivery."
                />
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   SUBMIT PAYFAST FORM
========================================================= */

function submitPayfastForm(
  action: string,
  fields:
    Record<
      string,
      string
    >
) {
  const form =
    document.createElement(
      "form"
    );

  form.method =
    "POST";

  form.action =
    action;

  form.style.display =
    "none";

  for (
    const [
      name,
      value,
    ]
    of Object.entries(
      fields
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
      value;

    form.appendChild(
      input
    );
  }

  document.body.appendChild(
    form
  );

  form.submit();
}

/* =========================================================
   CART SOURCE
========================================================= */

function readGuestCart():
  CheckoutLine[] {
  if (
    typeof window ===
    "undefined"
  ) {
    return [];
  }

  try {
    const raw =
      window.localStorage.getItem(
        GUEST_CART_KEY
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

    return (
      parsed as GuestCartItem[]
    )
      .filter(
        (
          item
        ) =>
          Boolean(
            item?.variantId
          ) &&
          Number(
            item?.quantity
          ) >
            0
      )
      .map(
        (
          item
        ) => ({
          variantId:
            item.variantId,

          quantity:
            Number(
              item.quantity
            ),
        })
      );
  } catch {
    return [];
  }
}

async function clearCompletedCart(
  source:
    | "account"
    | "guest"
    | null
) {
  if (
    source ===
    "account"
  ) {
    try {
      await cartService.clear();
    } catch {
      /*
       * The order is already created.
       * Do not fail checkout because bag cleanup failed.
       */
    }

    return;
  }

  if (
    typeof window !==
    "undefined"
  ) {
    window.localStorage.removeItem(
      GUEST_CART_KEY
    );
  }
}

/* =========================================================
   COMPONENTS
========================================================= */

type CheckoutSectionProps = {
  number: string;
  title: string;
  description: string;
  children:
    React.ReactNode;
};

function CheckoutSection({
  number,
  title,
  description,
  children,
}: CheckoutSectionProps) {
  return (
    <section className="border-t border-[#ded6cf] py-9 first:border-t-0 first:pt-0">
      <div className="mb-7 grid gap-3 sm:grid-cols-[55px_1fr]">
        <span className="text-[9px] !text-[#a17d72]">
          {
            number
          }
        </span>

        <div>
          <h2 className="font-display text-[30px] font-normal leading-none !text-[#392825] sm:text-[34px]">
            {
              title
            }
          </h2>

          <p className="mt-2 text-[10px] leading-5 !text-[#8e7a73]">
            {
              description
            }
          </p>
        </div>
      </div>

      <div className="sm:pl-[55px]">
        {
          children
        }
      </div>
    </section>
  );
}

type FieldProps = {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  inputMode?:
    | "text"
    | "search"
    | "email"
    | "tel"
    | "url"
    | "none"
    | "numeric"
    | "decimal";
};

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
  autoComplete,
  inputMode,
}: FieldProps) {
  return (
    <label>
      <span className="mb-2 block text-[9px] !text-[#806e67]">
        {
          label
        }
      </span>

      <input
        name={
          name
        }
        type={
          type
        }
        placeholder={
          placeholder
        }
        required={
          required
        }
        autoComplete={
          autoComplete
        }
        inputMode={
          inputMode
        }
        className="h-[52px] w-full border border-[#d8d0ca] bg-transparent px-4 text-[11px] !text-[#382b28] outline-none placeholder:!text-[#aaa09b] transition-colors focus:border-[#7e4c55]"
      />
    </label>
  );
}

type ChoiceOptionProps = {
  active: boolean;
  onClick: () => void;
  icon:
    React.ElementType;
  title: string;
  description: string;
};

function PaymentOption({
  active,
  onClick,
  icon:
    Icon,
  title,
  description,
}: ChoiceOptionProps) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`flex w-full items-center justify-between gap-5 border p-5 text-left transition-all ${
        active
          ? "border-[#6b2230] bg-[#f5eee8]"
          : "border-[#d9d0ca] hover:border-[#a58c83]"
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="flex size-10 items-center justify-center border border-[#d8cbc4] bg-[#fbfaf7]">
          <Icon
            className="size-[17px] !text-[#6b2230]"
            strokeWidth={
              1.4
            }
          />
        </div>

        <div>
          <p className="text-[11px] font-medium !text-[#3f302b]">
            {
              title
            }
          </p>

          <p className="mt-1 text-[9px] leading-5 !text-[#8d7972]">
            {
              description
            }
          </p>
        </div>
      </div>

      <span
        className={`flex size-4 shrink-0 items-center justify-center rounded-full border ${
          active
            ? "border-[#6b2230] bg-[#6b2230]"
            : "border-[#b9aaa3]"
        }`}
      >
        {active && (
          <Check
            className="size-2.5 !text-white"
            strokeWidth={
              2
            }
          />
        )}
      </span>
    </button>
  );
}

type DeliveryOptionProps = {
  active: boolean;
  onClick: () => void;
  icon:
    React.ElementType;
  title: string;
  description: string;
  detail: string;
  price: number;
};

function DeliveryOption({
  active,
  onClick,
  icon:
    Icon,
  title,
  description,
  detail,
  price,
}: DeliveryOptionProps) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`flex w-full items-center justify-between gap-5 border p-5 text-left transition-all ${
        active
          ? "border-[#6b2230] bg-[#f5eee8]"
          : "border-[#d9d0ca] hover:border-[#a58c83]"
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center border border-[#d8cbc4] bg-[#fbfaf7]">
          <Icon
            className="size-[17px] !text-[#6b2230]"
            strokeWidth={
              1.4
            }
          />
        </div>

        <div>
          <p className="text-[11px] font-medium !text-[#3f302b]">
            {
              title
            }
          </p>

          <p className="mt-1 text-[9px] !text-[#8d7972]">
            {
              description
            }
          </p>

          <p className="mt-2 text-[8px] !text-[#a08d86]">
            {
              detail
            }
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-4">
        <span className="text-[10px] font-medium !text-[#42332e]">
          {currency.format(
            price
          )}
        </span>

        <span
          className={`flex size-4 items-center justify-center rounded-full border ${
            active
              ? "border-[#6b2230] bg-[#6b2230]"
              : "border-[#b9aaa3]"
          }`}
        >
          {active && (
            <Check
              className="size-2.5 !text-white"
              strokeWidth={
                2
              }
            />
          )}
        </span>
      </div>
    </button>
  );
}

function SubmitButton({
  disabled,
  submitting,
  paymentMethod,
  desktop = false,
}: {
  disabled:
    boolean;
  submitting:
    boolean;
  paymentMethod:
    CheckoutPaymentMethod;
  desktop?:
    boolean;
}) {
  return (
    <button
      type="submit"
      form={
        desktop
          ? "checkout-form"
          : undefined
      }
      disabled={
        disabled
      }
      className={`${desktop ? "hidden lg:flex" : "flex"} group min-h-[56px] w-full items-center justify-between bg-[#571628] px-6 text-[11px] font-medium !text-white transition-colors hover:bg-[#681d31] disabled:cursor-not-allowed disabled:opacity-55`}
    >
      <span>
        {submitting
          ? "Preparing your order..."
          : paymentMethod ===
              "PAYFAST"
            ? "Continue to secure payment"
            : "Place cash on delivery order"}
      </span>

      {submitting ? (
        <LoaderCircle
          className="size-4 animate-spin"
          strokeWidth={
            1.4
          }
        />
      ) : (
        <ArrowRight
          className="size-4 transition-transform group-hover:translate-x-1"
          strokeWidth={
            1.4
          }
        />
      )}
    </button>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label:
    string;
  value:
    string;
}) {
  return (
    <div className="flex items-center justify-between gap-5">
      <span className="text-[10px] !text-[#75645e]">
        {
          label
        }
      </span>

      <span className="text-[10px] font-medium !text-[#3d2e2a]">
        {
          value
        }
      </span>
    </div>
  );
}

function TrustRow({
  icon:
    Icon,
  text,
}: {
  icon:
    React.ElementType;
  text:
    string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon
        className="mt-0.5 size-3.5 shrink-0 !text-[#9c7a70]"
        strokeWidth={
          1.35
        }
      />

      <p className="text-[9px] leading-5 !text-[#85736c]">
        {
          text
        }
      </p>
    </div>
  );
}
