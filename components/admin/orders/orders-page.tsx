"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import {
  ArrowRight,
  ChevronDown,
  Eye,
  Search,
  Truck,
  X,
} from "lucide-react";

type OrderStatus =
  | "Pending"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled"
  | "Disputed";

type PaymentStatus =
  | "Pending"
  | "Paid"
  | "Failed"
  | "Refunded";

type DeliveryProvider = "Aramex" | "PAXI";

type AdminOrder = {
  id: string;
  customer: string;
  email: string;
  items: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  deliveryProvider: DeliveryProvider;
  createdAt: string;
};

const initialOrders: AdminOrder[] = [
  {
    id: "ELAN-1001",
    customer: "Naledi Mokoena",
    email: "naledi@example.com",
    items: 2,
    total: 2799,
    status: "Processing",
    paymentStatus: "Paid",
    deliveryProvider: "Aramex",
    createdAt: "17 Sep 2026 · 10:42",
  },
  {
    id: "ELAN-1002",
    customer: "Lerato Molefe",
    email: "lerato@example.com",
    items: 1,
    total: 1319,
    status: "Pending",
    paymentStatus: "Pending",
    deliveryProvider: "PAXI",
    createdAt: "17 Sep 2026 · 09:18",
  },
  {
    id: "ELAN-1003",
    customer: "Thabo Nkosi",
    email: "thabo@example.com",
    items: 1,
    total: 1749,
    status: "Shipped",
    paymentStatus: "Paid",
    deliveryProvider: "Aramex",
    createdAt: "16 Sep 2026 · 14:25",
  },
  {
    id: "ELAN-1004",
    customer: "Amahle Dlamini",
    email: "amahle@example.com",
    items: 3,
    total: 3749,
    status: "Delivered",
    paymentStatus: "Paid",
    deliveryProvider: "PAXI",
    createdAt: "15 Sep 2026 · 11:06",
  },
  {
    id: "ELAN-1005",
    customer: "Karabo Seabi",
    email: "karabo@example.com",
    items: 2,
    total: 3199,
    status: "Disputed",
    paymentStatus: "Paid",
    deliveryProvider: "Aramex",
    createdAt: "14 Sep 2026 · 16:51",
  },
];

const currency = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function AdminOrdersPage() {
  const [orders] =
    useState<AdminOrder[]>(initialOrders);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [payment, setPayment] = useState("All");
  const [delivery, setDelivery] = useState("All");

  const filteredOrders = useMemo(() => {
    let result = [...orders];

    const term = search.trim().toLowerCase();

    if (term) {
      result = result.filter((order) =>
        [
          order.id,
          order.customer,
          order.email,
          order.status,
          order.paymentStatus,
          order.deliveryProvider,
        ]
          .join(" ")
          .toLowerCase()
          .includes(term)
      );
    }

    if (status !== "All") {
      result = result.filter(
        (order) => order.status === status
      );
    }

    if (payment !== "All") {
      result = result.filter(
        (order) =>
          order.paymentStatus === payment
      );
    }

    if (delivery !== "All") {
      result = result.filter(
        (order) =>
          order.deliveryProvider === delivery
      );
    }

    return result;
  }, [
    orders,
    search,
    status,
    payment,
    delivery,
  ]);

  const revenue = orders
    .filter(
      (order) =>
        order.paymentStatus === "Paid"
    )
    .reduce(
      (total, order) => total + order.total,
      0
    );

  const pendingCount = orders.filter(
    (order) =>
      order.status === "Pending" ||
      order.status === "Processing"
  ).length;

  const shippedCount = orders.filter(
    (order) => order.status === "Shipped"
  ).length;

  const disputedCount = orders.filter(
    (order) => order.status === "Disputed"
  ).length;

  const hasFilters =
    search.trim() !== "" ||
    status !== "All" ||
    payment !== "All" ||
    delivery !== "All";

  function clearFilters() {
    setSearch("");
    setStatus("All");
    setPayment("All");
    setDelivery("All");
  }

  return (
    <section className="min-h-full bg-[#fbfaf7]">
      <div className="px-5 py-8 sm:px-8 lg:px-9 lg:py-10 xl:px-10">
        <div className="mx-auto max-w-[1500px]">
          {/* Header */}

          <div>
            <p className="text-[9px] font-medium uppercase tracking-[0.28em] !text-[#9a7a70]">
              Élan Parfums / Back office
            </p>

            <h1 className="mt-4 font-display text-[46px] font-normal leading-none tracking-[-0.04em] !text-[#2e1e1d] sm:text-[54px] lg:text-[60px]">
              Orders
            </h1>

            <p className="mt-4 max-w-xl text-[11px] leading-5 !text-[#7f6f69] sm:text-[12px]">
              Follow every order from payment to
              delivery, and spot anything that needs
              attention.
            </p>
          </div>

          {/* Stats */}

          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Paid revenue"
              value={currency.format(revenue)}
              helper="From sample paid orders"
            />

            <StatCard
              label="Needs fulfilment"
              value={pendingCount.toString()}
              helper="Pending or processing"
            />

            <StatCard
              label="On the way"
              value={shippedCount.toString()}
              helper="Orders currently shipped"
            />

            <StatCard
              label="Disputes"
              value={disputedCount.toString()}
              helper="Orders needing attention"
            />
          </div>

          {/* Filters */}

          <div className="mt-6 border-y border-[#ded6cf] py-4">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_160px_160px_160px]">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#74625c]"
                  strokeWidth={1.4}
                />

                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search order, customer or email..."
                  className="
                    h-[52px]
                    w-full
                    bg-[#f1eeea]
                    pl-11
                    pr-11
                    text-[10px]
                    !text-[#3d302c]
                    outline-none

                    placeholder:!text-[#9b8e88]

                    transition-colors

                    focus:bg-[#ece8e3]
                  "
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full !text-[#75635d] hover:bg-black/[0.04]"
                  >
                    <X
                      className="size-3.5"
                      strokeWidth={1.4}
                    />
                  </button>
                )}
              </div>

              <FilterSelect
                label="Order status"
                value={status}
                onChange={setStatus}
                options={[
                  "All",
                  "Pending",
                  "Processing",
                  "Shipped",
                  "Delivered",
                  "Cancelled",
                  "Disputed",
                ]}
              />

              <FilterSelect
                label="Payment"
                value={payment}
                onChange={setPayment}
                options={[
                  "All",
                  "Pending",
                  "Paid",
                  "Failed",
                  "Refunded",
                ]}
              />

              <FilterSelect
                label="Delivery"
                value={delivery}
                onChange={setDelivery}
                options={[
                  "All",
                  "Aramex",
                  "PAXI",
                ]}
              />
            </div>
          </div>

          {/* Result meta */}

          <div className="flex min-h-[58px] items-center justify-between">
            <p className="text-[9px] !text-[#8f817b]">
              {filteredOrders.length}{" "}
              {filteredOrders.length === 1
                ? "order"
                : "orders"}
            </p>

            {hasFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="border-b border-[#5a1425] pb-1 text-[8px] font-medium !text-[#5a1425]"
              >
                Clear filters
              </button>
            ) : (
              <p className="hidden text-[8px] uppercase tracking-[0.16em] !text-[#a08c84] sm:block">
                Order management
              </p>
            )}
          </div>

          {/* Desktop table */}

          {filteredOrders.length > 0 && (
            <div className="hidden overflow-x-auto border border-[#e5ddd3] bg-[#fbfaf7] md:block">
              <div className="min-w-[980px]">
                <div className="grid grid-cols-[120px_1.2fr_0.55fr_0.8fr_0.8fr_0.75fr_0.9fr_80px] border-b border-[#e5ddd3] bg-[#f5f0ea] px-5 py-4">
                  <TableHeading>
                    Order
                  </TableHeading>

                  <TableHeading>
                    Customer
                  </TableHeading>

                  <TableHeading>
                    Items
                  </TableHeading>

                  <TableHeading>
                    Total
                  </TableHeading>

                  <TableHeading>
                    Payment
                  </TableHeading>

                  <TableHeading>
                    Delivery
                  </TableHeading>

                  <TableHeading>
                    Status
                  </TableHeading>

                  <TableHeading align="right">
                    View
                  </TableHeading>
                </div>

                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="
                      grid
                      min-h-[94px]
                      grid-cols-[120px_1.2fr_0.55fr_0.8fr_0.8fr_0.75fr_0.9fr_80px]
                      items-center
                      border-b
                      border-[#e5ddd3]
                      px-5

                      transition-colors

                      last:border-b-0

                      hover:bg-[#faf7f3]
                    "
                  >
                    {/* Order */}

                    <div>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-[10px] font-medium !text-[#422f2b] transition-colors hover:!text-[#5a1425]"
                      >
                        #{order.id}
                      </Link>

                      <p className="mt-2 text-[8px] !text-[#9b8982]">
                        {order.createdAt}
                      </p>
                    </div>

                    {/* Customer */}

                    <div className="min-w-0 pr-4">
                      <p className="truncate text-[10px] font-medium !text-[#4a3833]">
                        {order.customer}
                      </p>

                      <p className="mt-1 truncate text-[8px] !text-[#9b8982]">
                        {order.email}
                      </p>
                    </div>

                    {/* Items */}

                    <p className="text-[10px] !text-[#67554f]">
                      {order.items}
                    </p>

                    {/* Total */}

                    <p className="text-[10px] font-medium !text-[#3f302c]">
                      {currency.format(order.total)}
                    </p>

                    {/* Payment */}

                    <PaymentBadge
                      status={
                        order.paymentStatus
                      }
                    />

                    {/* Delivery */}

                    <div className="flex items-center gap-2">
                      <Truck
                        className="size-3 !text-[#927970]"
                        strokeWidth={1.4}
                      />

                      <span className="text-[9px] !text-[#66534d]">
                        {
                          order.deliveryProvider
                        }
                      </span>
                    </div>

                    {/* Status */}

                    <OrderBadge
                      status={order.status}
                    />

                    {/* View */}

                    <div className="flex justify-end">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        aria-label={`View ${order.id}`}
                        className="flex size-8 items-center justify-center !text-[#77635d] transition-colors hover:bg-[#f1ebe5] hover:!text-[#5a1425]"
                      >
                        <Eye
                          className="size-3.5"
                          strokeWidth={1.4}
                        />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mobile */}

          {filteredOrders.length > 0 && (
            <div className="grid gap-3 md:hidden">
              {filteredOrders.map((order) => (
                <article
                  key={order.id}
                  className="border border-[#e5ddd3] bg-[#fbfaf7] p-5"
                >
                  <div className="flex items-start justify-between gap-5">
                    <div>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-display text-[23px] !text-[#382724]"
                      >
                        #{order.id}
                      </Link>

                      <p className="mt-2 text-[8px] !text-[#9b8982]">
                        {order.createdAt}
                      </p>
                    </div>

                    <OrderBadge
                      status={order.status}
                    />
                  </div>

                  <div className="mt-5 border-t border-[#e5ddd3] pt-4">
                    <p className="text-[10px] font-medium !text-[#44332f]">
                      {order.customer}
                    </p>

                    <p className="mt-1 text-[8px] !text-[#9b8982]">
                      {order.email}
                    </p>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-4">
                    <MobileDetail
                      label="Total"
                      value={currency.format(
                        order.total
                      )}
                    />

                    <MobileDetail
                      label="Items"
                      value={order.items.toString()}
                    />

                    <div>
                      <p className="text-[8px] uppercase tracking-[0.14em] !text-[#9b8982]">
                        Payment
                      </p>

                      <div className="mt-2">
                        <PaymentBadge
                          status={
                            order.paymentStatus
                          }
                        />
                      </div>
                    </div>

                    <MobileDetail
                      label="Delivery"
                      value={
                        order.deliveryProvider
                      }
                    />
                  </div>

                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="group mt-5 flex min-h-[44px] w-full items-center justify-between border-t border-[#e5ddd3] pt-4 text-[9px] font-medium !text-[#5a1425]"
                  >
                    View order

                    <ArrowRight
                      className="size-3.5 transition-transform group-hover:translate-x-1"
                      strokeWidth={1.4}
                    />
                  </Link>
                </article>
              ))}
            </div>
          )}

          {/* Empty */}

          {filteredOrders.length === 0 && (
            <div className="flex min-h-[360px] flex-col items-center justify-center border border-[#e5ddd3] px-5 text-center">
              <p className="text-[8px] font-medium uppercase tracking-[0.24em] !text-[#9a756c]">
                Nothing matched
              </p>

              <h2 className="mt-4 font-display text-[34px] !text-[#382724]">
                No orders found.
              </h2>

              <p className="mt-3 max-w-sm text-[10px] leading-5 !text-[#8b7972]">
                Try another customer, order number
                or status.
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="mt-6 border-b border-[#5a1425] pb-1 text-[9px] !text-[#5a1425]"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
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
    <article className="min-h-[150px] border border-[#e5ddd3] bg-[#fbfaf7] p-5">
      <p className="text-[9px] !text-[#8a7770]">
        {label}
      </p>

      <p className="mt-5 font-display text-[36px] leading-none tracking-[-0.03em] !text-[#2e1e1d]">
        {value}
      </p>

      <p className="mt-5 text-[9px] leading-5 !text-[#9a8a84]">
        {helper}
      </p>
    </article>
  );
}

/* =========================================================
   FILTER
========================================================= */

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="relative flex h-[52px] flex-col justify-center border-b border-[#d8d0ca] px-3">
      <span className="mb-1 text-[8px] !text-[#86746d]">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full cursor-pointer appearance-none bg-transparent pr-7 text-[10px] !text-[#3d302c] outline-none"
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>

      <ChevronDown
        className="pointer-events-none absolute bottom-[10px] right-2 size-3.5 !text-[#382b28]"
        strokeWidth={1.4}
      />
    </label>
  );
}

/* =========================================================
   TABLE HEADING
========================================================= */

function TableHeading({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <p
      className={`text-[8px] font-medium uppercase tracking-[0.15em] !text-[#917d75] ${
        align === "right"
          ? "text-right"
          : "text-left"
      }`}
    >
      {children}
    </p>
  );
}

/* =========================================================
   PAYMENT BADGE
========================================================= */

function PaymentBadge({
  status,
}: {
  status: PaymentStatus;
}) {
  const styles: Record<
    PaymentStatus,
    string
  > = {
    Pending:
      "bg-[#f3ede5] !text-[#8f6c50]",
    Paid:
      "bg-[#e8eee8] !text-[#526357]",
    Failed:
      "bg-[#f1e3e3] !text-[#9b4d4d]",
    Refunded:
      "bg-[#ece8ef] !text-[#736477]",
  };

  return (
    <span
      className={`inline-flex w-fit px-2.5 py-1.5 text-[8px] font-medium uppercase tracking-[0.08em] ${styles[status]}`}
    >
      {status}
    </span>
  );
}

/* =========================================================
   ORDER BADGE
========================================================= */

function OrderBadge({
  status,
}: {
  status: OrderStatus;
}) {
  const styles: Record<
    OrderStatus,
    string
  > = {
    Pending:
      "bg-[#f3ede5] !text-[#8f6c50]",
    Processing:
      "bg-[#eee8f0] !text-[#735c78]",
    Shipped:
      "bg-[#e8edf2] !text-[#586b7c]",
    Delivered:
      "bg-[#e7eee8] !text-[#4f6756]",
    Cancelled:
      "bg-[#f1e5e4] !text-[#95564f]",
    Disputed:
      "bg-[#f4e5df] !text-[#9a5948]",
  };

  return (
    <span
      className={`inline-flex w-fit px-2.5 py-1.5 text-[8px] font-medium uppercase tracking-[0.08em] ${styles[status]}`}
    >
      {status}
    </span>
  );
}

/* =========================================================
   MOBILE DETAIL
========================================================= */

function MobileDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[8px] uppercase tracking-[0.14em] !text-[#9b8982]">
        {label}
      </p>

      <p className="mt-2 text-[10px] font-medium !text-[#493732]">
        {value}
      </p>
    </div>
  );
}