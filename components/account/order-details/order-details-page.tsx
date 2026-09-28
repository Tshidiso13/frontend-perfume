"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowLeft,
  Check,
  LoaderCircle,
  MapPin,
  Package,
  ReceiptText,
  Search,
  Truck,
} from "lucide-react";

import {
  toast,
} from "sonner";

import {
  ordersService,
  type OrderDetail,
  type OrderStatus,
} from "@/services/orders.service";

type Props = {
  orderId: string;
};

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

const progressSteps:
  Array<{
    status:
      OrderStatus;
    label:
      string;
  }> = [
    {
      status:
        "PROCESSING",
      label:
        "Processing",
    },
    {
      status:
        "PACKING",
      label:
        "Packing",
    },
    {
      status:
        "READY_FOR_SHIPMENT",
      label:
        "Ready",
    },
    {
      status:
        "SHIPPED",
      label:
        "Shipped",
    },
    {
      status:
        "DELIVERED",
      label:
        "Delivered",
    },
  ];

export default function OrderDetailsPage({
  orderId,
}: Props) {
  const [
    order,
    setOrder,
  ] = useState<
    OrderDetail | null
  >(
    null
  );

  const [
    loading,
    setLoading,
  ] = useState(
    true
  );

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(
    null
  );

  const [
    guestVerification,
    setGuestVerification,
  ] = useState(
    false
  );

  const [
    guestEmail,
    setGuestEmail,
  ] = useState("");

  const [
    verifying,
    setVerifying,
  ] = useState(
    false
  );

  const loadOrder =
    useCallback(
      async () => {
        const cleanId =
          orderId.trim();

        if (
          !cleanId
        ) {
          setError(
            "Order ID is missing."
          );

          setLoading(
            false
          );

          return;
        }

        setLoading(
          true
        );

        setError(
          null
        );

        setGuestVerification(
          false
        );

        try {
          /*
           * Account first.
           */
          try {
            const response =
              await ordersService.getById(
                cleanId
              );

            setOrder(
              response
            );

            return;
          } catch (
            accountError
          ) {
            if (
              !ordersService.isUnauthorized(
                accountError
              )
            ) {
              setError(
                accountError instanceof
                  Error
                  ? accountError.message
                  : "Unable to load this order."
              );

              setOrder(
                null
              );

              return;
            }
          }

          /*
           * No account session. Try guest credentials already
           * remembered in this browser.
           */
          try {
            const guest =
              await ordersService.getGuestDetailFromMemory(
                cleanId
              );

            if (
              guest
            ) {
              setOrder(
                guest
              );

              return;
            }

            setOrder(
              null
            );

            setGuestVerification(
              true
            );
          } catch (
            guestError
          ) {
            setOrder(
              null
            );

            setGuestVerification(
              true
            );

            setError(
              guestError instanceof
                Error
                ? guestError.message
                : null
            );
          }
        } finally {
          /*
           * IMPORTANT:
           * Always stop loading, including when the authenticated
           * account request succeeds and returns early above.
           */
          setLoading(
            false
          );
        }
      },
      [
        orderId,
      ]
    );

  useEffect(
    () => {
      void loadOrder();
    },
    [
      loadOrder,
    ]
  );

  async function verifyGuest(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !guestEmail.trim()
    ) {
      toast.error(
        "Enter the email used at checkout."
      );

      return;
    }

    setVerifying(
      true
    );

    try {
      const result =
        await ordersService.lookupAndRememberGuest(
          orderId,
          guestEmail
        );

      setOrder(
        result
      );

      setGuestVerification(
        false
      );

      setError(
        null
      );
    } catch (
      error
    ) {
      toast.error(
        error instanceof
          Error
          ? error.message
          : "We could not verify this order."
      );
    } finally {
      setVerifying(
        false
      );
    }
  }

  if (
    loading
  ) {
    return (
      <section className="flex min-h-[620px] items-center justify-center bg-[#fbfaf7]">
        <LoaderCircle
          className="size-5 animate-spin !text-[#6b2230]"
          strokeWidth={
            1.4
          }
        />
      </section>
    );
  }

  if (
    guestVerification &&
    !order
  ) {
    return (
      <section className="flex min-h-[620px] items-center justify-center bg-[#fbfaf7] px-5">
        <div className="w-full max-w-md">
          <ReceiptText
            className="size-7 !text-[#9a756c]"
            strokeWidth={
              1.2
            }
          />

          <p className="mt-6 text-[9px] font-medium uppercase tracking-[0.24em] !text-[#8f6258]">
            Guest order
          </p>

          <h1 className="mt-3 font-display text-[38px] !text-[#382724]">
            Verify your order.
          </h1>

          <p className="mt-3 text-[11px] leading-6 !text-[#88766f]">
            Enter the email address used when placing this order. No account is required.
          </p>

          <form
            onSubmit={
              verifyGuest
            }
            className="mt-7"
          >
            <label className="mb-2 block text-[8px] uppercase tracking-[0.16em] !text-[#8f6258]">
              Checkout email
            </label>

            <input
              type="email"
              value={
                guestEmail
              }
              onChange={(
                event
              ) =>
                setGuestEmail(
                  event.target.value
                )
              }
              className="h-12 w-full border border-[#d8d0ca] bg-transparent px-4 text-[11px] !text-[#382724] outline-none focus:border-[#6b2230]"
              placeholder="you@example.com"
            />

            <button
              type="submit"
              disabled={
                verifying
              }
              className="mt-4 flex h-12 w-full items-center justify-center gap-2 bg-[#571628] px-6 text-[9px] font-medium !text-white disabled:opacity-60"
            >
              {verifying ? (
                <LoaderCircle
                  className="size-4 animate-spin"
                  strokeWidth={
                    1.4
                  }
                />
              ) : (
                <Search
                  className="size-4"
                  strokeWidth={
                    1.4
                  }
                />
              )}

              View order
            </button>
          </form>

          <Link
            href="/account/orders"
            className="mt-6 inline-flex border-b border-[#6b2230] pb-2 text-[10px] font-medium !text-[#6b2230]"
          >
            Back to orders
          </Link>
        </div>
      </section>
    );
  }

  if (
    error ||
    !order
  ) {
    return (
      <section className="flex min-h-[620px] items-center justify-center bg-[#fbfaf7] px-5">
        <div className="max-w-md text-center">
          <ReceiptText
            className="mx-auto size-7 !text-[#9a756c]"
            strokeWidth={
              1.2
            }
          />

          <h1 className="mt-6 font-display text-[38px] !text-[#382724]">
            Order unavailable.
          </h1>

          <p className="mt-3 text-[11px] leading-6 !text-[#88766f]">
            {
              error ??
              "This order could not be found."
            }
          </p>

          <Link
            href="/account/orders"
            className="mt-7 inline-flex border-b border-[#6b2230] pb-2 text-[10px] font-medium !text-[#6b2230]"
          >
            Back to orders
          </Link>
        </div>
      </section>
    );
  }

  const terminal =
    [
      "CANCELLED",
      "RETURNED",
      "REFUNDED",
    ].includes(
      order.orderStatus
    );

  return (
    <section className="min-h-screen bg-[#fbfaf7] px-5 pb-24 pt-10 sm:px-8 lg:px-10 lg:pb-32 xl:px-12">
      <div className="mx-auto max-w-[1180px]">
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-2 text-[9px] !text-[#7d6b65] transition hover:!text-[#6b2230]"
        >
          <ArrowLeft
            className="size-3.5"
            strokeWidth={
              1.4
            }
          />

          Back to orders
        </Link>

        <div className="mt-8 flex flex-col justify-between gap-6 border-b border-[#dfd8d1] pb-10 md:flex-row md:items-end">
          <div>
            <p className="mb-4 text-[9px] font-medium uppercase tracking-[0.32em] !text-[#8f6258]">
              {
                statusLabel(
                  order.orderStatus
                )
              }
            </p>

            <h1 className="font-display text-[42px] font-normal leading-none tracking-[-0.035em] !text-[#342725] sm:text-[56px]">
              {
                order.orderNumber
              }
            </h1>

            <p className="mt-5 text-[11px] !text-[#8b7972]">
              Placed{" "}
              {
                formatDateTime(
                  order.createdAt
                )
              }
            </p>
          </div>

          <p className="font-display text-[30px] !text-[#382724]">
            {
              currency.format(
                order.total
              )
            }
          </p>
        </div>

        {!terminal && (
          <OrderProgress
            status={
              order.orderStatus
            }
          />
        )}

        <div className="grid gap-10 py-10 lg:grid-cols-[1fr_360px]">
          <div>
            <h2 className="font-display text-[31px] !text-[#382724]">
              Your fragrances
            </h2>

            <div className="mt-6 divide-y divide-[#dfd8d1] border-y border-[#dfd8d1]">
              {order.items.map(
                (
                  item
                ) => (
                  <article
                    key={
                      item.id
                    }
                    className="grid grid-cols-[84px_1fr_auto] gap-4 py-5"
                  >
                    <div className="relative aspect-square overflow-hidden bg-[#eee9e3]">
                      {item.imageUrl ? (
                        <Image
                          src={
                            item.imageUrl
                          }
                          alt={
                            item.productName
                          }
                          fill
                          unoptimized
                          sizes="84px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Package
                            className="size-5 !text-[#aa9991]"
                            strokeWidth={
                              1.2
                            }
                          />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="text-[8px] font-medium uppercase tracking-[0.14em] !text-[#9a756c]">
                        {
                          item.family
                        }{" "}
                        ·{" "}
                        {
                          item.concentration
                        }
                      </p>

                      {item.slug ? (
                        <Link
                          href={`/perfumes/${item.slug}`}
                          className="mt-1 block font-display text-[23px] !text-[#382321]"
                        >
                          {
                            item.productName
                          }
                        </Link>
                      ) : (
                        <h2 className="mt-1 font-display text-[23px] !text-[#382321]">
                          {
                            item.productName
                          }
                        </h2>
                      )}

                      <p className="mt-2 text-[9px] !text-[#8b7972]">
                        {
                          item.size
                        }{" "}
                        · Qty{" "}
                        {
                          item.quantity
                        }
                      </p>
                    </div>

                    <p className="text-[11px] font-medium !text-[#382824]">
                      {
                        currency.format(
                          item.lineTotal
                        )
                      }
                    </p>
                  </article>
                )
              )}
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <InfoCard
                icon={
                  MapPin
                }
                title="Delivery address"
              >
                <p>
                  {
                    order.customer.firstName
                  }{" "}
                  {
                    order.customer.lastName
                  }
                </p>

                <p>
                  {
                    order.deliveryAddress.addressLine1
                  }
                </p>

                {order.deliveryAddress.addressLine2 && (
                  <p>
                    {
                      order.deliveryAddress.addressLine2
                    }
                  </p>
                )}

                <p>
                  {
                    [
                      order.deliveryAddress.suburb,
                      order.deliveryAddress.city,
                      order.deliveryAddress.province,
                      order.deliveryAddress.postalCode,
                    ]
                      .filter(
                        Boolean
                      )
                      .join(
                        ", "
                      )
                  }
                </p>

                <p>
                  {
                    order.deliveryAddress.country
                  }
                </p>
              </InfoCard>

              <InfoCard
                icon={
                  Truck
                }
                title="Delivery"
              >
                <p>
                  {
                    deliveryLabel(
                      order.deliveryMethod
                    )
                  }
                </p>

                {order.paxi.pointName && (
                  <p>
                    Collection point:{" "}
                    {
                      order.paxi.pointName
                    }
                  </p>
                )}

                {order.shipment?.trackingNumber && (
                  <p>
                    Tracking:{" "}
                    {
                      order.shipment.trackingNumber
                    }
                  </p>
                )}

                {order.shipment?.trackingUrl && (
                  <a
                    href={
                      order.shipment.trackingUrl
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex border-b border-[#6b2230] pb-1 !text-[#6b2230]"
                  >
                    Track shipment
                  </a>
                )}
              </InfoCard>
            </div>
          </div>

          <aside>
            <div className="border border-[#ded6cf] bg-white p-6">
              <p className="text-[9px] font-medium uppercase tracking-[0.24em] !text-[#8f6258]">
                Order summary
              </p>

              <div className="mt-6 space-y-4 text-[10px] !text-[#75635d]">
                <SummaryRow
                  label="Items"
                  value={
                    String(
                      order.itemCount
                    )
                  }
                />

                <SummaryRow
                  label="Subtotal"
                  value={
                    currency.format(
                      order.subtotal
                    )
                  }
                />

                <SummaryRow
                  label="Delivery"
                  value={
                    order.shipping ===
                    0
                      ? "Complimentary"
                      : currency.format(
                          order.shipping
                        )
                  }
                />

                <div className="h-px bg-[#dfd8d1]" />

                <SummaryRow
                  label="Total"
                  value={
                    currency.format(
                      order.total
                    )
                  }
                  strong
                />
              </div>

              <div className="mt-7 border-t border-[#dfd8d1] pt-6">
                <p className="text-[8px] uppercase tracking-[0.16em] !text-[#9a756c]">
                  Payment
                </p>

                <p className="mt-2 text-[11px] font-medium !text-[#382824]">
                  {
                    paymentMethodLabel(
                      order.paymentMethod
                    )
                  }
                </p>

                <p className="mt-1 text-[9px] !text-[#8b7972]">
                  {
                    paymentStatusLabel(
                      order.paymentStatus
                    )
                  }
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function OrderProgress({
  status,
}: {
  status:
    OrderStatus;
}) {
  const currentIndex =
    progressSteps.findIndex(
      (
        step
      ) =>
        step.status ===
        status
    );

  const effectiveIndex =
    status ===
      "PENDING_PAYMENT"
      ? -1
      : currentIndex;

  return (
    <div className="border-b border-[#dfd8d1] py-8">
      <div className="grid grid-cols-5 gap-2">
        {progressSteps.map(
          (
            step,
            index
          ) => {
            const complete =
              effectiveIndex >=
              index;

            return (
              <div
                key={
                  step.status
                }
              >
                <div
                  className={`flex size-7 items-center justify-center rounded-full border ${
                    complete
                      ? "border-[#5a1425] bg-[#5a1425] !text-white"
                      : "border-[#d8d0ca] !text-[#a69892]"
                  }`}
                >
                  {complete ? (
                    <Check
                      className="size-3"
                      strokeWidth={
                        1.6
                      }
                    />
                  ) : (
                    <span className="text-[8px]">
                      {
                        index +
                        1
                      }
                    </span>
                  )}
                </div>

                <p className={`mt-2 text-[8px] ${
                  complete
                    ? "!text-[#5a1425]"
                    : "!text-[#9b8e88]"
                }`}>
                  {
                    step.label
                  }
                </p>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}

function InfoCard({
  icon:
    Icon,
  title,
  children,
}: {
  icon:
    typeof MapPin;
  title:
    string;
  children:
    React.ReactNode;
}) {
  return (
    <div className="border border-[#ded6cf] p-5">
      <div className="flex items-center gap-2">
        <Icon
          className="size-4 !text-[#6b2230]"
          strokeWidth={
            1.4
          }
        />

        <p className="text-[9px] font-medium uppercase tracking-[0.17em] !text-[#6b2230]">
          {
            title
          }
        </p>
      </div>

      <div className="mt-4 space-y-1 text-[10px] leading-5 !text-[#75635d]">
        {
          children
        }
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  strong = false,
}: {
  label:
    string;
  value:
    string;
  strong?:
    boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span>
        {
          label
        }
      </span>

      <span
        className={
          strong
            ? "font-display text-[23px] !text-[#382824]"
            : "font-medium !text-[#382824]"
        }
      >
        {
          value
        }
      </span>
    </div>
  );
}

function statusLabel(
  status:
    string
) {
  return status
    .replaceAll(
      "_",
      " "
    )
    .toLowerCase()
    .replace(
      /\b\w/g,
      (
        character
      ) =>
        character.toUpperCase()
    );
}

function paymentMethodLabel(
  method:
    string
) {
  return method ===
    "CASH_ON_DELIVERY"
    ? "Cash on delivery"
    : "PayFast";
}

function paymentStatusLabel(
  status:
    string
) {
  if (
    status ===
      "COMPLETE" ||
    status ===
      "PAID"
  ) {
    return "Payment confirmed";
  }

  if (
    status ===
    "PENDING"
  ) {
    return "Payment pending";
  }

  return statusLabel(
    status
  );
}

function deliveryLabel(
  method:
    string
) {
  return method ===
    "PAXI"
    ? "PAXI collection"
    : "Aramex delivery";
}

function formatDateTime(
  value:
    string
) {
  return new Intl.DateTimeFormat(
    "en-ZA",
    {
      day:
        "2-digit",
      month:
        "long",
      year:
        "numeric",
      hour:
        "2-digit",
      minute:
        "2-digit",
    }
  ).format(
    new Date(
      value
    )
  );
}
