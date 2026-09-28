"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  Banknote,
  CalendarDays,
  LoaderCircle,
  PackageCheck,
  Search,
  ShoppingBag,
  Truck,
} from "lucide-react";

import {
  adminOrdersService,
  type AdminDeliveryMethod,
  type AdminOrderListItem,
  type AdminOrderStatus,
  type AdminOrderSummary,
  type AdminPaymentStatus,
} from "@/services/admin-orders.service";

const currency =
  new Intl.NumberFormat(
    "en-ZA",
    {
      style:
        "currency",
      currency:
        "ZAR",
      maximumFractionDigits:
        0,
    }
  );

export default function AdminOrdersPage() {
  const [
    orders,
    setOrders,
  ] = useState<
    AdminOrderListItem[]
  >([]);

  const [
    summary,
    setSummary,
  ] = useState<
    AdminOrderSummary | null
  >(null);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    orderStatus,
    setOrderStatus,
  ] = useState<
    "" |
    AdminOrderStatus
  >("");

  const [
    paymentStatus,
    setPaymentStatus,
  ] = useState<
    "" |
    AdminPaymentStatus
  >("");

  const [
    deliveryMethod,
    setDeliveryMethod,
  ] = useState<
    "" |
    AdminDeliveryMethod
  >("");

  const [
    customerType,
    setCustomerType,
  ] = useState<
    "" |
    "ACCOUNT" |
    "GUEST"
  >("");

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
  >(null);

  useEffect(
    () => {
      let cancelled =
        false;

      const timer =
        window.setTimeout(
          async () => {
            setLoading(
              true
            );

            setError(
              null
            );

            try {
              const response =
                await adminOrdersService.getAll(
                  {
                    limit:
                      50,

                    search:
                      search.trim() ||
                      undefined,

                    orderStatus:
                      orderStatus ||
                      undefined,

                    paymentStatus:
                      paymentStatus ||
                      undefined,

                    deliveryMethod:
                      deliveryMethod ||
                      undefined,

                    customerType:
                      customerType ||
                      undefined,
                  }
                );

              if (
                cancelled
              ) {
                return;
              }

              setOrders(
                response.data
              );

              setSummary(
                response.summary
              );
            } catch (
              error
            ) {
              if (
                cancelled
              ) {
                return;
              }

              setError(
                error instanceof
                  Error
                  ? error.message
                  : "Unable to load admin orders."
              );
            } finally {
              if (
                !cancelled
              ) {
                setLoading(
                  false
                );
              }
            }
          },
          250
        );

      return () => {
        cancelled =
          true;

        window.clearTimeout(
          timer
        );
      };
    },
    [
      search,
      orderStatus,
      paymentStatus,
      deliveryMethod,
      customerType,
    ]
  );

  const stats =
    useMemo(
      () => [
        {
          label:
            "Paid revenue",
          value:
            currency.format(
              summary?.paidRevenue ??
                0
            ),
          icon:
            Banknote,
        },
        {
          label:
            "Orders today",
          value:
            String(
              summary?.ordersToday ??
                0
            ),
          icon:
            CalendarDays,
        },
        {
          label:
            "Processing",
          value:
            String(
              summary?.processing ??
                0
            ),
          icon:
            PackageCheck,
        },
        {
          label:
            "Ready to ship",
          value:
            String(
              summary?.readyToShip ??
                0
            ),
          icon:
            Truck,
        },
      ],
      [
        summary,
      ]
    );

  return (
    <section className="min-h-screen bg-[#f7f5f2] px-5 py-8 sm:px-7 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        <div className="flex flex-col justify-between gap-5 border-b border-[#ded7d1] pb-7 lg:flex-row lg:items-end">
          <div>
            <p className="text-[9px] font-medium uppercase tracking-[0.28em] !text-[#9a756c]">
              Operations
            </p>

            <h1 className="mt-3 font-display text-[45px] leading-none !text-[#342725]">
              Orders.
            </h1>

            <p className="mt-4 text-[11px] !text-[#82726b]">
              Process payments, fulfil orders and manage delivery from one place.
            </p>
          </div>

          <p className="text-[10px] !text-[#82726b]">
            {
              summary?.totalOrders ??
              0
            }{" "}
            total orders
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(
            (
              stat
            ) => {
              const Icon =
                stat.icon;

              return (
                <div
                  key={
                    stat.label
                  }
                  className="border border-[#e1dad4] bg-[#fbfaf7] p-5"
                >
                  <Icon
                    className="size-4 !text-[#6b2230]"
                    strokeWidth={
                      1.4
                    }
                  />

                  <p className="mt-5 text-[8px] uppercase tracking-[0.17em] !text-[#94817a]">
                    {
                      stat.label
                    }
                  </p>

                  <p className="mt-2 font-display text-[30px] !text-[#342725]">
                    {
                      stat.value
                    }
                  </p>
                </div>
              );
            }
          )}
        </div>

        <div className="mt-6 grid gap-3 border-y border-[#ded7d1] py-5 xl:grid-cols-[minmax(280px,1fr)_190px_180px_160px_150px]">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 size-4 -translate-y-1/2 !text-[#82726b]"
              strokeWidth={
                1.4
              }
            />

            <input
              value={
                search
              }
              onChange={(
                event
              ) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Order number, customer, email, SKU..."
              className="h-12 w-full bg-[#ebe7e2] pl-11 pr-4 text-[10px] !text-[#382724] outline-none"
            />
          </div>

          <Select
            value={
              orderStatus
            }
            onChange={
              setOrderStatus
            }
          >
            <option value="">
              All order statuses
            </option>

            <option value="PENDING_PAYMENT">
              Pending payment
            </option>

            <option value="PROCESSING">
              Processing
            </option>

            <option value="PACKING">
              Packing
            </option>

            <option value="READY_FOR_SHIPMENT">
              Ready to ship
            </option>

            <option value="SHIPPED">
              Shipped
            </option>

            <option value="DELIVERED">
              Delivered
            </option>

            <option value="CANCELLED">
              Cancelled
            </option>

            <option value="RETURN_REQUESTED">
              Return requested
            </option>

            <option value="RETURNED">
              Returned
            </option>

            <option value="REFUNDED">
              Refunded
            </option>
          </Select>

          <Select
            value={
              paymentStatus
            }
            onChange={
              setPaymentStatus
            }
          >
            <option value="">
              All payments
            </option>

            <option value="PENDING">
              Pending
            </option>

            <option value="COMPLETE">
              Complete
            </option>

            <option value="FAILED">
              Failed
            </option>

            <option value="REFUNDED">
              Refunded
            </option>
          </Select>

          <Select
            value={
              deliveryMethod
            }
            onChange={
              setDeliveryMethod
            }
          >
            <option value="">
              All delivery
            </option>

            <option value="ARAMEX">
              Aramex
            </option>

            <option value="PAXI">
              PAXI
            </option>
          </Select>

          <Select
            value={
              customerType
            }
            onChange={
              setCustomerType
            }
          >
            <option value="">
              All customers
            </option>

            <option value="ACCOUNT">
              Account
            </option>

            <option value="GUEST">
              Guest
            </option>
          </Select>
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
          <div className="flex min-h-[420px] items-center justify-center text-center">
            <div>
              <p className="font-display text-[30px] !text-[#382724]">
                Orders could not be loaded.
              </p>

              <p className="mt-3 text-[10px] !text-[#8a7770]">
                {
                  error
                }
              </p>
            </div>
          </div>
        ) : orders.length ===
          0 ? (
          <div className="flex min-h-[420px] items-center justify-center text-center">
            <div>
              <ShoppingBag
                className="mx-auto size-6 !text-[#9a756c]"
                strokeWidth={
                  1.3
                }
              />

              <p className="mt-5 font-display text-[30px] !text-[#382724]">
                No matching orders.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-5 overflow-hidden border border-[#e1dad4] bg-[#fbfaf7]">
            <div className="hidden grid-cols-[90px_1.2fr_1fr_135px_130px_120px_54px] gap-4 border-b border-[#e5ded8] px-5 py-3 text-[8px] uppercase tracking-[0.15em] !text-[#9a8982] lg:grid">
              <span>
                Item
              </span>
              <span>
                Order
              </span>
              <span>
                Customer
              </span>
              <span>
                Payment
              </span>
              <span>
                Fulfilment
              </span>
              <span>
                Total
              </span>
              <span />
            </div>

            <div className="divide-y divide-[#e5ded8]">
              {orders.map(
                (
                  order
                ) => (
                  <OrderRow
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
          </div>
        )}
      </div>
    </section>
  );
}

function OrderRow({
  order,
}: {
  order:
    AdminOrderListItem;
}) {
  const first =
    order.items[0];

  return (
    <article className="grid gap-4 px-5 py-5 lg:grid-cols-[90px_1.2fr_1fr_135px_130px_120px_54px] lg:items-center">
      <div className="relative size-[70px] overflow-hidden bg-[#eee9e3]">
        {first
          ?.imageUrl ? (
          <Image
            src={
              first.imageUrl
            }
            alt={
              first.productName
            }
            fill
            unoptimized
            sizes="70px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ShoppingBag
              className="size-4 !text-[#aa9991]"
              strokeWidth={
                1.2
              }
            />
          </div>
        )}
      </div>

      <div>
        <Link
          href={`/admin/orders/${order.id}`}
          className="font-display text-[20px] !text-[#382724] hover:opacity-60"
        >
          {
            order.orderNumber
          }
        </Link>

        <p className="mt-1 text-[8px] !text-[#92817a]">
          {
            formatDate(
              order.createdAt
            )
          }{" "}
          ·{" "}
          {
            order.itemCount
          }{" "}
          {
            order.itemCount ===
            1
              ? "item"
              : "items"
          }
        </p>
      </div>

      <div>
        <p className="text-[10px] font-medium !text-[#493732]">
          {
            order.customerName
          }
        </p>

        <p className="mt-1 truncate text-[8px] !text-[#92817a]">
          {
            order.email
          }{" "}
          ·{" "}
          {
            order.customerType ===
            "GUEST"
              ? "Guest"
              : "Account"
          }
        </p>
      </div>

      <StatusPill
        value={
          paymentLabel(
            order.paymentStatus
          )
        }
        tone={
          paymentTone(
            order.paymentStatus
          )
        }
      />

      <StatusPill
        value={
          statusLabel(
            order.orderStatus
          )
        }
        tone={
          fulfilmentTone(
            order.orderStatus
          )
        }
      />

      <p className="text-[10px] font-medium !text-[#382824]">
        {
          currency.format(
            order.total
          )
        }
      </p>

      <Link
        href={`/admin/orders/${order.id}`}
        aria-label={`Open ${order.orderNumber}`}
        className="flex size-10 items-center justify-center border border-[#ddd4ce] !text-[#6b2230]"
      >
        <ArrowRight
          className="size-4"
          strokeWidth={
            1.4
          }
        />
      </Link>
    </article>
  );
}

function Select({
  value,
  onChange,
  children,
}: {
  value:
    string;
  onChange:
    (
      value:
        any
    ) =>
      void;
  children:
    React.ReactNode;
}) {
  return (
    <select
      value={
        value
      }
      onChange={(
        event
      ) =>
        onChange(
          event.target.value
        )
      }
      className="h-12 border-b border-[#d8d0ca] bg-transparent px-2 text-[9px] !text-[#4d3d38] outline-none"
    >
      {
        children
      }
    </select>
  );
}

function StatusPill({
  value,
  tone,
}: {
  value:
    string;
  tone:
    string;
}) {
  return (
    <span className={`w-fit px-2.5 py-2 text-[8px] font-medium uppercase tracking-[0.08em] ${tone}`}>
      {
        value
      }
    </span>
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

  return statusLabel(
    status
  );
}

function paymentTone(
  status:
    string
) {
  if (
    status ===
      "COMPLETE" ||
    status ===
      "PAID"
  ) {
    return "bg-[#e7eee8] !text-[#4f6756]";
  }

  if (
    status ===
    "FAILED"
  ) {
    return "bg-[#f1e5e4] !text-[#95564f]";
  }

  return "bg-[#f3eee2] !text-[#8b6b34]";
}

function fulfilmentTone(
  status:
    string
) {
  if (
    status ===
    "DELIVERED"
  ) {
    return "bg-[#e7eee8] !text-[#4f6756]";
  }

  if (
    status ===
      "CANCELLED" ||
    status ===
      "REFUNDED"
  ) {
    return "bg-[#f1e5e4] !text-[#95564f]";
  }

  if (
    status ===
    "SHIPPED"
  ) {
    return "bg-[#e8edf2] !text-[#586b7c]";
  }

  return "bg-[#eee8f0] !text-[#735c78]";
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
        "short",
      year:
        "numeric",
    }
  ).format(
    new Date(
      value
    )
  );
}
