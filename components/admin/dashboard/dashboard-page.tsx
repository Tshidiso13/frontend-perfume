"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  AlertTriangle,
  ArrowUpRight,
  LoaderCircle,
  Package2,
  RefreshCcw,
  ShoppingBag,
} from "lucide-react";

import {
  adminDashboardService,
  type AdminDashboardLowStockItem,
  type AdminDashboardOrder,
  type AdminDashboardResponse,
} from "@/services/admin/admin-dashboard.service";

/* =========================================================
   CONSTANTS
========================================================= */

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

const dateFormatter =
  new Intl.DateTimeFormat(
    "en-ZA",
    {
      day:
        "2-digit",
      month:
        "short",
      year:
        "numeric",
    }
  );

/* =========================================================
   COMPONENT
========================================================= */

export function AdminOverviewDashboard() {
  const [
    data,
    setData,
  ] = useState<
    AdminDashboardResponse | null
  >(null);

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

  const loadDashboard =
    useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        const response =
          await adminDashboardService.getOverview();

        setData(
          response
        );
      } catch (
        error
      ) {
        setError(
          error instanceof
            Error
            ? error.message
            : "Unable to load dashboard."
        );
      } finally {
        setLoading(
          false
        );
      }
    }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return (
      <section className="flex min-h-[70vh] flex-col items-center justify-center bg-[#fbfaf7]">
        <LoaderCircle
          className="size-6 animate-spin !text-[#5a1425]"
          strokeWidth={
            1.4
          }
        />

        <p className="mt-4 text-[9px] !text-[#88766f]">
          Loading dashboard...
        </p>
      </section>
    );
  }

  if (
    error ||
    !data
  ) {
    return (
      <section className="flex min-h-[70vh] flex-col items-center justify-center bg-[#fbfaf7] px-6 text-center">
        <AlertTriangle
          className="size-6 !text-[#9a6c61]"
          strokeWidth={
            1.3
          }
        />

        <h1 className="mt-5 font-display text-[38px] !text-[#382724]">
          Dashboard unavailable.
        </h1>

        <p className="mt-3 max-w-md text-[10px] leading-5 !text-[#88766f]">
          {error ??
            "Unable to load dashboard."}
        </p>

        <button
          type="button"
          onClick={() =>
            void loadDashboard()
          }
          className="mt-7 inline-flex items-center gap-3 bg-[#5a1425] px-6 py-3 text-[9px] font-medium !text-white"
        >
          <RefreshCcw
            className="size-3.5"
            strokeWidth={
              1.4
            }
          />

          Try again
        </button>
      </section>
    );
  }

  const stats = [
    {
      label:
        "Revenue",

      value:
        currency.format(
          data.stats.revenue
        ),

      helper:
        "Paid order revenue",
    },

    {
      label:
        "Orders",

      value:
        data.stats.orders.toString(),

      helper:
        data.stats.orders ===
        1
          ? "1 order in total"
          : `${data.stats.orders} orders in total`,
    },

    {
      label:
        "Products",

      value:
        data.stats.products.toString(),

      helper:
        "Non-archived fragrances",
    },

    {
      label:
        "Low stock",

      value:
        data.stats.lowStock.toString(),

      helper:
        `${data.stats.outOfStock} out of stock`,
    },
  ];

  return (
    <section className="min-h-full bg-[#fbfaf7] !text-[#2e2220]">
      <div className="px-5 py-8 sm:px-8 lg:px-9 lg:py-10 xl:px-10">
        <div className="mx-auto max-w-[1500px]">
          {/* =====================================================
              PAGE HEADER
          ====================================================== */}

          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[9px] font-medium uppercase tracking-[0.28em] !text-[#9a7a70] sm:text-[10px]">
                Élan Parfums / Back office
              </p>

              <h1 className="mt-4 font-display text-[46px] font-normal leading-none tracking-[-0.04em] !text-[#2e1e1d] sm:text-[54px] lg:text-[60px]">
                Overview
              </h1>

              <p className="mt-4 text-[11px] leading-5 !text-[#7f6f69] sm:text-[12px]">
                Live store performance,
                orders and inventory
                from your backend.
              </p>
            </div>

            <Link
              href="/admin/products/create"
              className="group inline-flex min-h-[48px] w-fit items-center justify-between gap-8 bg-[#5a1425] px-6 text-[10px] font-medium !text-white transition-colors duration-300 hover:bg-[#6b1b2f]"
            >
              Add fragrance

              <ArrowUpRight
                className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                strokeWidth={
                  1.4
                }
              />
            </Link>
          </div>

          {/* =====================================================
              STATS
          ====================================================== */}

          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4 xl:gap-4">
            {stats.map(
              (
                stat
              ) => (
                <StatCard
                  key={
                    stat.label
                  }
                  label={
                    stat.label
                  }
                  value={
                    stat.value
                  }
                  helper={
                    stat.helper
                  }
                />
              )
            )}
          </div>

          {/* =====================================================
              LOWER DASHBOARD
          ====================================================== */}

          <div className="mt-4 grid gap-4 xl:grid-cols-[1.55fr_1fr]">
            {/* ORDERS */}

            <section className="border border-[#e5ddd3] bg-[#fbfaf7] p-5 sm:p-6 lg:p-8">
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-display text-[25px] font-normal leading-none !text-[#2e1e1d] sm:text-[28px]">
                  Recent orders.
                </h2>

                <Link
                  href="/admin/orders"
                  className="hidden items-center gap-2 text-[9px] !text-[#7c5e58] transition-colors hover:!text-[#5a1425] sm:flex"
                >
                  View orders

                  <ArrowUpRight
                    className="size-3"
                    strokeWidth={
                      1.4
                    }
                  />
                </Link>
              </div>

              {data.recentOrders.length >
              0 ? (
                <div className="mt-7">
                  {data.recentOrders.map(
                    (
                      order,
                      index
                    ) => (
                      <RecentOrderRow
                        key={
                          order.id
                        }
                        order={
                          order
                        }
                        divider={
                          index !==
                          data.recentOrders.length -
                            1
                        }
                      />
                    )
                  )}
                </div>
              ) : (
                <div className="flex min-h-[320px] flex-col items-center justify-center px-4 text-center sm:min-h-[350px]">
                  <div className="flex size-11 items-center justify-center rounded-full border border-[#d7cec3] !text-[#3c3130]">
                    <ShoppingBag
                      className="size-5"
                      strokeWidth={
                        1.45
                      }
                    />
                  </div>

                  <h3 className="mt-7 font-display text-[32px] font-normal leading-none tracking-[-0.03em] !text-[#3a2624] sm:text-[38px]">
                    No orders yet.
                  </h3>

                  <p className="mt-4 max-w-md text-[10px] leading-5 !text-[#8b7b74] sm:text-[11px]">
                    New customer orders
                    will appear here
                    automatically.
                  </p>
                </div>
              )}

              <Link
                href="/admin/orders"
                className="mt-6 inline-flex border-b border-[#5a1425] pb-1 text-[9px] !text-[#5a1425] sm:hidden"
              >
                View orders
              </Link>
            </section>

            {/* LOW STOCK */}

            <section className="border border-[#e5ddd3] bg-[#fbfaf7] p-5 sm:p-6 lg:p-8">
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-display text-[25px] font-normal leading-none !text-[#2e1e1d] sm:text-[28px]">
                  Keep an eye on these
                </h2>

                <span className="text-[8px] uppercase tracking-[0.18em] !text-[#aa8c82]">
                  Low stock
                </span>
              </div>

              {data.lowStockItems.length >
              0 ? (
                <div className="mt-7">
                  {data.lowStockItems.map(
                    (
                      item,
                      index
                    ) => (
                      <LowStockRow
                        key={
                          item.id
                        }
                        item={
                          item
                        }
                        divider={
                          index !==
                          data.lowStockItems.length -
                            1
                        }
                      />
                    )
                  )}
                </div>
              ) : (
                <div className="flex min-h-[250px] flex-col items-center justify-center text-center">
                  <Package2
                    className="size-5 !text-[#7f8c81]"
                    strokeWidth={
                      1.3
                    }
                  />

                  <p className="mt-5 font-display text-[28px] !text-[#382724]">
                    Stock looks healthy.
                  </p>

                  <p className="mt-3 text-[9px] leading-5 !text-[#8b7972]">
                    No active variant is
                    currently below its
                    low-stock threshold.
                  </p>
                </div>
              )}

              <div className="mt-7 border-t border-[#e5ddd3] pt-6">
                <Link
                  href="/admin/inventory"
                  className="group inline-flex items-center gap-3 border-b border-[#5a1425] pb-1 text-[9px] font-medium !text-[#5a1425] transition-colors hover:!text-[#7b2338]"
                >
                  View inventory

                  <ArrowUpRight
                    className="size-3 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    strokeWidth={
                      1.4
                    }
                  />
                </Link>
              </div>
            </section>
          </div>

          {/* =====================================================
              QUICK MANAGEMENT
          ====================================================== */}

          <section className="mt-4 grid border border-[#e5ddd3] bg-[#fbfaf7] sm:grid-cols-3">
            <QuickAction
              number="01"
              title="Catalogue"
              description="Manage fragrances, pricing and product information."
              href="/admin/products"
              link="Manage products"
            />

            <QuickAction
              number="02"
              title="Inventory"
              description={`${data.stats.lowStock} low-stock and ${data.stats.outOfStock} out-of-stock variants.`}
              href="/admin/inventory"
              link="View inventory"
              bordered
            />

            <QuickAction
              number="03"
              title="Disputes"
              description={
                data.stats.openDisputes ===
                1
                  ? "1 dispute currently needs attention."
                  : `${data.stats.openDisputes} disputes currently need attention.`
              }
              href="/admin/disputes"
              link="View disputes"
            />
          </section>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   RECENT ORDER
========================================================= */

function RecentOrderRow({
  order,
  divider,
}: {
  order: AdminDashboardOrder;
  divider: boolean;
}) {
  return (
    <div>
      <Link
        href={`/admin/orders/${order.id}`}
        className="group flex items-start justify-between gap-5 py-2"
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[10px] font-medium !text-[#4b3b37] sm:text-[11px]">
              {
                order.orderNumber
              }
            </p>

            <OrderStatus
              status={
                order.status
              }
            />
          </div>

          <p className="mt-2 truncate text-[9px] !text-[#9a8a84]">
            {
              order.customerName
            }{" "}
            ·{" "}
            {
              dateFormatter.format(
                new Date(
                  order.createdAt
                )
              )
            }
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-[10px] font-medium !text-[#3e2d29]">
            {currency.format(
              order.total
            )}
          </p>

          <p className="mt-2 text-[8px] uppercase tracking-[0.1em] !text-[#967d75]">
            {
              formatEnum(
                order.paymentStatus
              )
            }
          </p>
        </div>
      </Link>

      {divider && (
        <div className="my-4 border-b border-[#e5ddd3]" />
      )}
    </div>
  );
}

/* =========================================================
   LOW STOCK ROW
========================================================= */

function LowStockRow({
  item,
  divider,
}: {
  item: AdminDashboardLowStockItem;
  divider: boolean;
}) {
  return (
    <div>
      <Link
        href={`/admin/products/${item.productId}`}
        className="flex items-start justify-between gap-5 py-2"
      >
        <div className="min-w-0">
          <p className="truncate text-[10px] font-medium !text-[#4b3b37] sm:text-[11px]">
            {
              item.name
            }
          </p>

          <p className="mt-2 text-[9px] !text-[#9a8a84]">
            {
              item.size
            }{" "}
            ·{" "}
            {
              item.sku
            }
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-[9px] font-medium !text-[#a06b59]">
            {
              item.availableStock
            }{" "}
            left
          </p>

          {item.reservedStock >
            0 && (
            <p className="mt-2 text-[8px] !text-[#a08c84]">
              {
                item.reservedStock
              }{" "}
              reserved
            </p>
          )}
        </div>
      </Link>

      {divider && (
        <div className="my-4 border-b border-[#e5ddd3]" />
      )}
    </div>
  );
}

/* =========================================================
   ORDER STATUS
========================================================= */

function OrderStatus({
  status,
}: {
  status:
    AdminDashboardOrder["status"];
}) {
  const classes =
    status ===
      "DELIVERED" ||
    status ===
      "PAID"
      ? "bg-[#e8eee8] !text-[#526357]"
      : status ===
          "CANCELLED" ||
        status ===
          "REFUNDED"
      ? "bg-[#f1e3e3] !text-[#9b4d4d]"
      : status ===
        "DISPUTED"
      ? "bg-[#f4e6e2] !text-[#9c574b]"
      : "bg-[#f2ece5] !text-[#7f665d]";

  return (
    <span
      className={`px-2 py-1 text-[7px] font-medium uppercase tracking-[0.08em] ${classes}`}
    >
      {
        formatEnum(
          status
        )
      }
    </span>
  );
}

/* =========================================================
   STAT
========================================================= */

function StatCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <article className="min-h-[160px] border border-[#e5ddd3] bg-[#fbfaf7] p-5 sm:min-h-[175px] sm:p-6">
      <p className="text-[9px] !text-[#8a7770] sm:text-[10px]">
        {
          label
        }
      </p>

      <p className="mt-6 font-display text-[38px] font-normal leading-none tracking-[-0.03em] !text-[#2e1e1d] sm:text-[44px]">
        {
          value
        }
      </p>

      <p className="mt-6 text-[9px] leading-5 !text-[#9a8a84] sm:text-[10px]">
        {
          helper
        }
      </p>
    </article>
  );
}

/* =========================================================
   QUICK ACTION
========================================================= */

type QuickActionProps = {
  number: string;
  title: string;
  description: string;
  href: string;
  link: string;
  bordered?: boolean;
};

function QuickAction({
  number,
  title,
  description,
  href,
  link,
  bordered = false,
}: QuickActionProps) {
  return (
    <div
      className={`
        p-6
        sm:p-7
        ${
          bordered
            ? "border-y border-[#e5ddd3] sm:border-x sm:border-y-0"
            : ""
        }
      `}
    >
      <p className="text-[8px] tracking-[0.15em] !text-[#a08379]">
        {
          number
        }
      </p>

      <h3 className="mt-6 font-display text-[25px] font-normal !text-[#382724]">
        {
          title
        }
      </h3>

      <p className="mt-3 max-w-[280px] text-[9px] leading-5 !text-[#8b7972]">
        {
          description
        }
      </p>

      <Link
        href={
          href
        }
        className="group mt-6 inline-flex items-center gap-3 border-b border-[#5a1425] pb-1 text-[9px] !text-[#5a1425]"
      >
        {
          link
        }

        <ArrowUpRight
          className="size-3 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          strokeWidth={
            1.4
          }
        />
      </Link>
    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function formatEnum(
  value: string
) {
  return value
    .toLowerCase()
    .replaceAll(
      "_",
      " "
    )
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    );
}
