"use client";

import {
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
  ShoppingBag,
  Truck,
} from "lucide-react";

import {
  ordersService,
  type OrderListItem,
  type OrderStatus,
} from "@/services/orders.service";

const currency =
  new Intl.NumberFormat(
    "en-ZA",
    {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }
  );

export default function AccountOrdersPage() {
  const [
    orders,
    setOrders,
  ] = useState<
    OrderListItem[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  const loadOrders =
    useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        const response =
          await ordersService.getAll({
            limit: 30,
          });

        setOrders(
          response.data
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load your orders."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

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

          <span>/</span>

          <Link
            href="/account"
            className="transition-colors hover:!text-[#6b2230]"
          >
            Account
          </Link>

          <span>/</span>

          <span>
            Orders
          </span>
        </div>

        <div className="border-b border-[#ded6cf] pb-9">
          <p className="text-[9px] font-medium uppercase tracking-[0.3em] !text-[#9a756c]">
            Your Élan
          </p>

          <h1 className="mt-4 font-display text-[48px] font-normal leading-none tracking-[-0.04em] !text-[#342725] sm:text-[58px] lg:text-[64px]">
            Your orders.
          </h1>

          <p className="mt-4 max-w-xl text-[11px] leading-6 !text-[#85746e]">
            Follow your fragrances from our shelves to your door.
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-[480px] items-center justify-center">
            <LoaderCircle
              className="size-5 animate-spin !text-[#6b2230]"
              strokeWidth={1.4}
            />
          </div>
        ) : error ? (
          <div className="flex min-h-[480px] flex-col items-center justify-center text-center">
            <Package
              className="size-6 !text-[#8f756d]"
              strokeWidth={1.3}
            />

            <h2 className="mt-5 font-display text-[34px] !text-[#382724]">
              We couldn&apos;t load your orders.
            </h2>

            <p className="mt-3 max-w-md text-[10px] leading-5 !text-[#8a7770]">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                void loadOrders()
              }
              className="mt-7 bg-[#571628] px-6 py-3 text-[9px] font-medium !text-white"
            >
              Try again
            </button>
          </div>
        ) : orders.length > 0 ? (
          <div className="mt-8 space-y-5">
            {orders.map(
              (order) => (
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
          <EmptyOrders />
        )}

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="bg-[#f1ece6] p-6">
            <Package
              className="size-4 !text-[#8f6d64]"
              strokeWidth={1.4}
            />

            <h2 className="mt-6 font-display text-[27px] !text-[#382724]">
              Something not quite right?
            </h2>

            <p className="mt-3 max-w-sm text-[9px] leading-5 !text-[#86746d]">
              If there&apos;s an issue with an order, delivery or fragrance, you can ask us for help.
            </p>

            <Link
              href="/account/returns"
              className="mt-5 inline-flex border-b border-[#5a1425] pb-1 text-[9px] !text-[#5a1425]"
            >
              Returns & disputes
            </Link>
          </div>

          <div className="bg-[#35101c] p-6">
            <Truck
              className="size-4 !text-[#d9b7bb]"
              strokeWidth={1.4}
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
            value={formatDate(
              order.createdAt
            )}
          />

          <OrderMeta
            label="Total"
            value={currency.format(
              order.total
            )}
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
                  index > 0
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
              value={String(
                order.itemCount
              )}
            />

            <OrderDetail
              label="Delivery"
              value={deliveryLabel(
                order.deliveryMethod
              )}
            />

            <OrderDetail
              label="Payment"
              value={paymentLabel(
                order.paymentStatus
              )}
            />

            <OrderDetail
              label="Status"
              value={statusLabel(
                order.orderStatus
              )}
            />
          </div>

          <Link
            href={`/account/orders/${order.id}`}
            className="group mt-7 flex min-h-[44px] w-full items-center justify-between bg-[#571628] px-4 text-[9px] font-medium !text-white"
          >
            View order

            <ArrowRight
              className="size-3.5 transition-transform group-hover:translate-x-1"
              strokeWidth={1.4}
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
        {label}
      </p>

      <p className="mt-1 text-[10px] font-medium !text-[#45332f]">
        {value}
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
        {label}
      </span>

      <span className="text-[9px] font-medium !text-[#493732]">
        {value}
      </span>
    </div>
  );
}

function EmptyOrders() {
  return (
    <div className="flex min-h-[480px] flex-col items-center justify-center text-center">
      <div className="flex size-12 items-center justify-center rounded-full border border-[#d8cfc9]">
        <ShoppingBag
          className="size-5 !text-[#8f756d]"
          strokeWidth={1.3}
        />
      </div>

      <p className="mt-7 text-[8px] font-medium uppercase tracking-[0.28em] !text-[#9a756c]">
        Nothing here yet
      </p>

      <h2 className="mt-4 font-display text-[38px] font-normal leading-none !text-[#382724] sm:text-[46px]">
        Your first fragrance is waiting.
      </h2>

      <p className="mt-4 max-w-sm text-[10px] leading-5 !text-[#8a7770]">
        When you place an order, you&apos;ll be able to follow everything from here.
      </p>

      <Link
        href="/shop"
        className="group mt-7 inline-flex min-h-[48px] items-center gap-8 bg-[#571628] px-6 text-[9px] font-medium !text-white"
      >
        Explore fragrances

        <ArrowRight
          className="size-3.5 transition-transform group-hover:translate-x-1"
          strokeWidth={1.4}
        />
      </Link>
    </div>
  );
}

function statusLabel(
  status:
    OrderStatus
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

  return status
    .replaceAll(
      "_",
      " "
    )
    .toLowerCase();
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
