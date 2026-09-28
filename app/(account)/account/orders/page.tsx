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
  ArrowRight,
  LoaderCircle,
  Package,
  Search,
  ShoppingBag,
  Truck,
} from "lucide-react";

import {
  toast,
} from "sonner";

import {
  ordersService,
  type OrderListItem,
  type OrderStatus,
} from "@/services/orders.service";

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

const filters:
  Array<{
    label: string;
    value:
      "ALL" |
      OrderStatus;
  }> = [
    {
      label:
        "All",
      value:
        "ALL",
    },
    {
      label:
        "Pending payment",
      value:
        "PENDING_PAYMENT",
    },
    {
      label:
        "Processing",
      value:
        "PROCESSING",
    },
    {
      label:
        "Packing",
      value:
        "PACKING",
    },
    {
      label:
        "Shipped",
      value:
        "SHIPPED",
    },
    {
      label:
        "Delivered",
      value:
        "DELIVERED",
    },
    {
      label:
        "Cancelled",
      value:
        "CANCELLED",
    },
  ];

export default function AccountOrdersPage() {
  const [
    orders,
    setOrders,
  ] = useState<
    OrderListItem[]
  >([]);

  const [
    mode,
    setMode,
  ] = useState<
    "ACCOUNT" |
    "GUEST"
  >(
    "ACCOUNT"
  );

  const [
    status,
    setStatus,
  ] = useState<
    "ALL" |
    OrderStatus
  >(
    "ALL"
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
    guestOrderId,
    setGuestOrderId,
  ] = useState("");

  const [
    guestEmail,
    setGuestEmail,
  ] = useState("");

  const [
    guestSearching,
    setGuestSearching,
  ] = useState(
    false
  );

  const loadOrders =
    useCallback(
      async () => {
        setLoading(
          true
        );

        setError(
          null
        );

        try {
          const response =
            await ordersService.getAll(
              {
                limit:
                  30,

                status:
                  status ===
                    "ALL"
                    ? undefined
                    : status,
              }
            );

          setMode(
            "ACCOUNT"
          );

          setOrders(
            response.data
          );
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
                : "Unable to load your orders."
            );

            setOrders(
              []
            );

            return;
          }

          /*
           * No authenticated account:
           * show guest orders remembered in this browser.
           */
          setMode(
            "GUEST"
          );

          try {
            const response =
              await ordersService.getRememberedGuestOrders();

            let data =
              response.data;

            if (
              status !==
              "ALL"
            ) {
              data =
                data.filter(
                  (
                    order
                  ) =>
                    order.orderStatus ===
                    status
                );
            }

            setOrders(
              data
            );
          } catch (
            guestError
          ) {
            setError(
              guestError instanceof
                Error
                ? guestError.message
                : "Unable to load your guest orders."
            );

            setOrders(
              []
            );
          }
        } finally {
          setLoading(
            false
          );
        }
      },
      [
        status,
      ]
    );

  useEffect(
    () => {
      void loadOrders();
    },
    [
      loadOrders,
    ]
  );

  async function handleGuestLookup(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !guestOrderId.trim() ||
      !guestEmail.trim()
    ) {
      toast.error(
        "Enter your order number and checkout email."
      );

      return;
    }

    setGuestSearching(
      true
    );

    try {
      const order =
        await ordersService.lookupAndRememberGuest(
          guestOrderId,
          guestEmail
        );

      toast.success(
        `Order ${order.orderNumber} found.`
      );

      setGuestOrderId(
        ""
      );

      await loadOrders();
    } catch (
      error
    ) {
      toast.error(
        error instanceof
          Error
          ? error.message
          : "We could not verify that guest order."
      );
    } finally {
      setGuestSearching(
        false
      );
    }
  }

  return (
    <section className="min-h-screen bg-[#fbfaf7]">
      <div className="mx-auto max-w-[1250px] px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
        <div className="mb-10 flex items-center gap-1.5 text-[9px] !text-[#98877f]">
          <Link
            href="/"
            className="transition-colors hover:!text-[#6b2230]"
          >
            Home
          </Link>

          <span>
            /
          </span>

          <span>
            Orders
          </span>
        </div>

        <div className="flex flex-col justify-between gap-7 border-b border-[#ded6cf] pb-9 md:flex-row md:items-end">
          <div>
            <p className="text-[9px] font-medium uppercase tracking-[0.3em] !text-[#9a756c]">
              {
                mode ===
                "GUEST"
                  ? "Guest orders"
                  : "Your Élan"
              }
            </p>

            <h1 className="mt-4 font-display text-[48px] font-normal leading-none tracking-[-0.04em] !text-[#342725] sm:text-[58px] lg:text-[64px]">
              Your orders.
            </h1>

            <p className="mt-4 max-w-xl text-[11px] leading-6 !text-[#85746e]">
              {
                mode ===
                "GUEST"
                  ? "No account needed. Find a guest order using the order number and email used at checkout."
                  : "Follow your fragrances from our shelves to your door."
              }
            </p>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-3 self-start border-b border-[#6b2230] pb-2 text-[10px] font-medium !text-[#6b2230]"
          >
            Continue shopping

            <ArrowRight
              className="size-3.5"
              strokeWidth={
                1.4
              }
            />
          </Link>
        </div>

        {mode ===
          "GUEST" && (
          <form
            onSubmit={
              handleGuestLookup
            }
            className="grid gap-3 border-b border-[#ded6cf] py-6 md:grid-cols-[1fr_1fr_auto]"
          >
            <div>
              <label className="mb-2 block text-[8px] uppercase tracking-[0.16em] !text-[#8f6258]">
                Order number
              </label>

              <input
                value={
                  guestOrderId
                }
                onChange={(
                  event
                ) =>
                  setGuestOrderId(
                    event.target.value
                  )
                }
                placeholder="ELN-..."
                className="h-12 w-full border border-[#d8d0ca] bg-transparent px-4 text-[11px] !text-[#382724] outline-none focus:border-[#6b2230]"
              />
            </div>

            <div>
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
                placeholder="you@example.com"
                className="h-12 w-full border border-[#d8d0ca] bg-transparent px-4 text-[11px] !text-[#382724] outline-none focus:border-[#6b2230]"
              />
            </div>

            <button
              type="submit"
              disabled={
                guestSearching
              }
              className="mt-[22px] flex h-12 items-center justify-center gap-2 bg-[#571628] px-6 text-[9px] font-medium !text-white disabled:opacity-60"
            >
              {guestSearching ? (
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

              Find order
            </button>
          </form>
        )}

        <div className="flex gap-2 overflow-x-auto border-b border-[#ded6cf] py-5">
          {filters.map(
            (
              filter
            ) => (
              <button
                key={
                  filter.value
                }
                type="button"
                onClick={() =>
                  setStatus(
                    filter.value
                  )
                }
                className={`shrink-0 border px-4 py-2.5 text-[9px] transition ${
                  status ===
                  filter.value
                    ? "border-[#571628] bg-[#571628] !text-white"
                    : "border-[#d8cfc9] !text-[#5a4741] hover:border-[#6b2230]"
                }`}
              >
                {
                  filter.label
                }
              </button>
            )
          )}
        </div>

        {loading ? (
          <div className="flex min-h-[420px] items-center justify-center">
            <LoaderCircle
              className="size-5 animate-spin !text-[#6b2230]"
              strokeWidth={
                1.4
              }
            />
          </div>
        ) : error ? (
          <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
            <Package
              className="size-6 !text-[#8f756d]"
              strokeWidth={
                1.3
              }
            />

            <h2 className="mt-5 font-display text-[34px] !text-[#382724]">
              We couldn&apos;t load your orders.
            </h2>

            <p className="mt-3 max-w-md text-[10px] leading-5 !text-[#8a7770]">
              {
                error
              }
            </p>
          </div>
        ) : orders.length >
          0 ? (
          <div className="mt-8 space-y-5">
            {orders.map(
              (
                order
              ) => (
                <OrderCard
                  key={
                    order.id
                  }
                  order={
                    order
                  }
                />
              )
            )}
          </div>
        ) : (
          <EmptyOrders
            guest={
              mode ===
              "GUEST"
            }
          />
        )}

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="bg-[#f1ece6] p-6">
            <Package
              className="size-4 !text-[#8f6d64]"
              strokeWidth={
                1.4
              }
            />

            <h2 className="mt-6 font-display text-[27px] !text-[#382724]">
              Something not quite right?
            </h2>

            <p className="mt-3 max-w-sm text-[9px] leading-5 !text-[#86746d]">
              If there&apos;s an issue with an order, delivery or fragrance, you can ask us for help.
            </p>
          </div>

          <div className="bg-[#35101c] p-6">
            <Truck
              className="size-4 !text-[#d9b7bb]"
              strokeWidth={
                1.4
              }
            />

            <h2 className="mt-6 font-display text-[27px] !text-[#f8eee7]">
              Waiting for something lovely?
            </h2>

            <p className="mt-3 max-w-sm text-[9px] leading-5 !text-white/55">
              Tracking details will appear inside your order as soon as your parcel is handed to Aramex or PAXI.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function OrderCard({
  order,
}: {
  order:
    OrderListItem;
}) {
  return (
    <article className="border border-[#e4dcd5] bg-[#fbfaf7]">
      <div className="flex flex-col gap-5 border-b border-[#e4dcd5] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
          <OrderMeta
            label="Order"
            value={`#${order.orderNumber}`}
          />

          <OrderMeta
            label="Placed"
            value={
              formatDate(
                order.createdAt
              )
            }
          />

          <OrderMeta
            label="Total"
            value={
              currency.format(
                order.total
              )
            }
          />
        </div>

        <StatusBadge
          status={
            order.orderStatus
          }
        />
      </div>

      <div className="grid gap-7 p-5 sm:p-7 lg:grid-cols-[1fr_230px]">
        <div className="space-y-5">
          {order.items.map(
            (
              item,
              index
            ) => (
              <div
                key={
                  item.id
                }
                className={`grid grid-cols-[78px_1fr] gap-4 ${
                  index >
                  0
                    ? "border-t border-[#ebe4df] pt-5"
                    : ""
                }`}
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-[#ebe6e0]">
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
                      sizes="78px"
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

                <div className="py-1">
                  <h2 className="font-display text-[22px] font-normal !text-[#382724]">
                    {
                      item.productName
                    }
                  </h2>

                  <p className="mt-2 text-[8px] uppercase tracking-[0.14em] !text-[#967c73]">
                    {
                      item.family
                    }{" "}
                    ·{" "}
                    {
                      item.size
                    }
                  </p>

                  <p className="mt-3 text-[9px] !text-[#8a7770]">
                    Quantity:{" "}
                    {
                      item.quantity
                    }
                  </p>
                </div>
              </div>
            )
          )}
        </div>

        <div className="border-t border-[#e5ddd3] pt-5 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
          <div className="space-y-5">
            <OrderDetail
              label="Items"
              value={
                String(
                  order.itemCount
                )
              }
            />

            <OrderDetail
              label="Delivery"
              value={
                deliveryLabel(
                  order.deliveryMethod
                )
              }
            />

            <OrderDetail
              label="Payment"
              value={
                paymentLabel(
                  order.paymentStatus
                )
              }
            />

            <OrderDetail
              label="Status"
              value={
                statusLabel(
                  order.orderStatus
                )
              }
            />
          </div>

          <Link
            href={`/account/orders/${order.id}`}
            className="group mt-7 flex min-h-[44px] w-full items-center justify-between bg-[#571628] px-4 text-[9px] font-medium !text-white"
          >
            View order

            <ArrowRight
              className="size-3.5 transition-transform group-hover:translate-x-1"
              strokeWidth={
                1.4
              }
            />
          </Link>
        </div>
      </div>
    </article>
  );
}

function OrderMeta({
  label,
  value,
}: {
  label:
    string;
  value:
    string;
}) {
  return (
    <div>
      <p className="text-[8px] uppercase tracking-[0.15em] !text-[#9c8880]">
        {
          label
        }
      </p>

      <p className="mt-1 text-[10px] font-medium !text-[#45332f]">
        {
          value
        }
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status:
    OrderStatus;
}) {
  const styles:
    Record<
      OrderStatus,
      string
    > = {
      PENDING_PAYMENT:
        "bg-[#f3eee2] !text-[#8b6b34]",

      PROCESSING:
        "bg-[#eee8f0] !text-[#735c78]",

      PACKING:
        "bg-[#eee8f0] !text-[#735c78]",

      READY_FOR_SHIPMENT:
        "bg-[#e8edf2] !text-[#586b7c]",

      SHIPPED:
        "bg-[#e8edf2] !text-[#586b7c]",

      DELIVERED:
        "bg-[#e7eee8] !text-[#4f6756]",

      CANCELLED:
        "bg-[#f1e5e4] !text-[#95564f]",

      RETURN_REQUESTED:
        "bg-[#f3eee2] !text-[#8b6b34]",

      RETURNED:
        "bg-[#eee8f0] !text-[#735c78]",

      REFUNDED:
        "bg-[#e7eee8] !text-[#4f6756]",
    };

  return (
    <span
      className={`inline-flex w-fit px-3 py-2 text-[8px] font-medium uppercase tracking-[0.1em] ${styles[status]}`}
    >
      {
        statusLabel(
          status
        )
      }
    </span>
  );
}

function OrderDetail({
  label,
  value,
}: {
  label:
    string;
  value:
    string;
}) {
  return (
    <div className="flex items-center justify-between gap-5 border-b border-[#ebe3dd] pb-3">
      <span className="text-[8px] uppercase tracking-[0.13em] !text-[#9b8982]">
        {
          label
        }
      </span>

      <span className="text-[9px] font-medium !text-[#493732]">
        {
          value
        }
      </span>
    </div>
  );
}

function EmptyOrders({
  guest,
}: {
  guest:
    boolean;
}) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
      <div className="flex size-12 items-center justify-center rounded-full border border-[#d8cfc9]">
        <ShoppingBag
          className="size-5 !text-[#8f756d]"
          strokeWidth={
            1.3
          }
        />
      </div>

      <p className="mt-7 text-[8px] font-medium uppercase tracking-[0.28em] !text-[#9a756c]">
        {
          guest
            ? "Find your guest order"
            : "Nothing here yet"
        }
      </p>

      <h2 className="mt-4 font-display text-[38px] font-normal leading-none !text-[#382724] sm:text-[46px]">
        {
          guest
            ? "Your fragrance is still here."
            : "Your first fragrance is waiting."
        }
      </h2>

      <p className="mt-4 max-w-sm text-[10px] leading-5 !text-[#8a7770]">
        {
          guest
            ? "Enter the order number and email used during checkout above. Once verified, this browser will remember the order for you."
            : "When you place an order, you’ll be able to follow everything from here."
        }
      </p>
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

function deliveryLabel(
  method:
    string
) {
  return method ===
    "PAXI"
    ? "PAXI"
    : "Aramex";
}

function paymentLabel(
  status:
    string
) {
  if (
    status ===
      "COMPLETE" ||
    status ===
      "PAID"
  ) {
    return "Paid";
  }

  if (
    status ===
    "PENDING"
  ) {
    return "Pending";
  }

  return statusLabel(
    status
  );
}

function formatDate(
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
    }
  ).format(
    new Date(
      value
    )
  );
}
