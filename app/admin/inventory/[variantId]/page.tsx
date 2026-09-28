import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ArrowLeft,
  ArrowUpRight,
  Box,
  CheckCircle2,
  Package2,
  Pencil,
  TriangleAlert,
} from "lucide-react";

type InventoryVariant = {
  id: string;
  productId: string;

  slug: string;
  name: string;
  family: string;

  size: string;
  sku: string;

  price: number;
  stock: number;
  threshold: number;

  reserved: number;
  available: number;

  status: "Active" | "Draft";

  image: string;

  updatedAt: string;

  movements: {
    id: string;
    type:
      | "Stock added"
      | "Order"
      | "Manual adjustment";
    quantity: number;
    note: string;
    date: string;
  }[];
};

const variants: InventoryVariant[] = [
  {
    id: "ambre-30",
    productId: "1",

    slug: "ambre-nocturne",
    name: "Ambre Nocturne",
    family: "Amber",

    size: "30 ML",
    sku: "ELAN-AMBRE-30",

    price: 1050,
    stock: 5,
    threshold: 5,

    reserved: 1,
    available: 4,

    status: "Active",

    image: "/images/home/perfume-amber.png",

    updatedAt: "17 Sep 2026 · 11:32",

    movements: [
      {
        id: "1",
        type: "Stock added",
        quantity: 10,
        note: "Initial stock received.",
        date: "10 Sep 2026 · 09:20",
      },
      {
        id: "2",
        type: "Order",
        quantity: -2,
        note: "Order ELAN-0998",
        date: "15 Sep 2026 · 14:42",
      },
      {
        id: "3",
        type: "Manual adjustment",
        quantity: -3,
        note: "Stock count correction.",
        date: "17 Sep 2026 · 11:32",
      },
    ],
  },

  {
    id: "ambre-50",
    productId: "1",

    slug: "ambre-nocturne",
    name: "Ambre Nocturne",
    family: "Amber",

    size: "50 ML",
    sku: "ELAN-AMBRE-50",

    price: 1450,
    stock: 8,
    threshold: 5,

    reserved: 2,
    available: 6,

    status: "Active",

    image: "/images/home/perfume-amber.png",

    updatedAt: "17 Sep 2026 · 10:15",

    movements: [
      {
        id: "1",
        type: "Stock added",
        quantity: 15,
        note: "Stock received.",
        date: "09 Sep 2026 · 13:00",
      },
      {
        id: "2",
        type: "Order",
        quantity: -4,
        note: "Customer orders.",
        date: "16 Sep 2026 · 16:40",
      },
      {
        id: "3",
        type: "Order",
        quantity: -3,
        note: "Customer orders.",
        date: "17 Sep 2026 · 10:15",
      },
    ],
  },

  {
    id: "cedre-100",
    productId: "3",

    slug: "cedre-sauvage",
    name: "Cèdre Sauvage",
    family: "Woody",

    size: "100 ML",
    sku: "ELAN-CEDRE-100",

    price: 2350,
    stock: 0,
    threshold: 5,

    reserved: 0,
    available: 0,

    status: "Active",

    image: "/images/home/perfume-cedar.png",

    updatedAt: "16 Sep 2026 · 15:04",

    movements: [
      {
        id: "1",
        type: "Stock added",
        quantity: 4,
        note: "Initial stock received.",
        date: "01 Sep 2026 · 08:30",
      },
      {
        id: "2",
        type: "Order",
        quantity: -4,
        note: "Stock sold through customer orders.",
        date: "16 Sep 2026 · 15:04",
      },
    ],
  },
];

const currency = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

type PageProps = {
  params: Promise<{
    variantId: string;
  }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { variantId } = await params;

  const variant = variants.find(
    (item) => item.id === variantId
  );

  if (!variant) {
    return {
      title: "Inventory Variant Not Found | Admin",
    };
  }

  return {
    title: `${variant.name} ${variant.size} | Inventory`,
    description: `Inventory details for ${variant.name} ${variant.size}.`,
  };
}

export default async function InventoryVariantPage({
  params,
}: PageProps) {
  const { variantId } = await params;

  const variant = variants.find(
    (item) => item.id === variantId
  );

  if (!variant) {
    notFound();
  }

  const stockStatus = getStockStatus(variant);

  return (
    <section className="min-h-full bg-[#fbfaf7]">
      <div className="px-5 py-8 sm:px-8 lg:px-9 lg:py-10 xl:px-10">
        <div className="mx-auto max-w-[1500px]">
          {/* =====================================================
              BACK
          ====================================================== */}

          <Link
            href="/admin/inventory"
            className="group inline-flex items-center gap-3 text-[9px] !text-[#806d66]"
          >
            <ArrowLeft
              className="size-3.5 transition-transform duration-300 group-hover:-translate-x-1"
              strokeWidth={1.4}
            />

            Back to inventory
          </Link>

          {/* =====================================================
              HEADER
          ====================================================== */}

          <div className="mt-8 flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-[9px] font-medium uppercase tracking-[0.26em] !text-[#9a756c]">
                  {variant.family} · {variant.size}
                </p>

                <StockBadge
                  stock={variant.stock}
                  threshold={variant.threshold}
                />
              </div>

              <h1 className="mt-5 font-display text-[46px] font-normal leading-none tracking-[-0.04em] !text-[#2e1e1d] sm:text-[56px] lg:text-[64px]">
                {variant.name}
              </h1>

              <p className="mt-4 text-[10px] !text-[#8b7972]">
                SKU: {variant.sku}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href={`/admin/products/${variant.productId}`}
                className="
                  group
                  inline-flex
                  min-h-[46px]
                  items-center
                  gap-4
                  border
                  border-[#d8d0ca]
                  px-5
                  text-[9px]
                  font-medium
                  !text-[#5d4943]

                  transition-colors

                  hover:border-[#9e7b70]
                "
              >
                View product

                <ArrowUpRight
                  className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  strokeWidth={1.4}
                />
              </Link>

              <Link
                href={`/admin/products/${variant.productId}/edit`}
                className="
                  group
                  inline-flex
                  min-h-[46px]
                  items-center
                  gap-5
                  bg-[#5a1425]
                  px-5
                  text-[9px]
                  font-medium
                  !text-white

                  transition-colors

                  hover:bg-[#6b1b2f]
                "
              >
                Edit product

                <Pencil
                  className="size-3.5"
                  strokeWidth={1.4}
                />
              </Link>
            </div>
          </div>

          {/* =====================================================
              SUMMARY
          ====================================================== */}

          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Stock on hand"
              value={`${variant.stock}`}
              helper="Physical units"
            />

            <SummaryCard
              label="Reserved"
              value={`${variant.reserved}`}
              helper="Allocated to orders"
            />

            <SummaryCard
              label="Available"
              value={`${variant.available}`}
              helper="Available to sell"
            />

            <SummaryCard
              label="Retail value"
              value={currency.format(
                variant.stock * variant.price
              )}
              helper="Current stock value"
            />
          </div>

          {/* =====================================================
              MAIN GRID
          ====================================================== */}

          <div className="mt-5 grid gap-5 xl:grid-cols-[390px_minmax(0,1fr)]">
            {/* LEFT */}

            <aside className="space-y-5">
              {/* Product image */}

              <section className="border border-[#e5ddd3] bg-[#f1ece6] p-5">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={variant.image}
                    alt={variant.name}
                    fill
                    priority
                    sizes="390px"
                    className="object-cover"
                  />
                </div>
              </section>

              {/* Variant information */}

              <AdminPanel
                eyebrow="Variant"
                title="Inventory details."
              >
                <div>
                  <InfoRow
                    label="Product"
                    value={variant.name}
                  />

                  <InfoRow
                    label="Size"
                    value={variant.size}
                  />

                  <InfoRow
                    label="SKU"
                    value={variant.sku}
                  />

                  <InfoRow
                    label="Price"
                    value={currency.format(
                      variant.price
                    )}
                  />

                  <InfoRow
                    label="Low stock threshold"
                    value={`${variant.threshold} units`}
                  />

                  <InfoRow
                    label="Product status"
                    value={variant.status}
                    last
                  />
                </div>
              </AdminPanel>
            </aside>

            {/* RIGHT */}

            <div className="space-y-5">
              {/* Stock overview */}

              <AdminPanel
                eyebrow="Stock control"
                title="Current position."
              >
                <div className="grid gap-4 sm:grid-cols-3">
                  <StockMetric
                    label="On hand"
                    value={variant.stock}
                  />

                  <StockMetric
                    label="Reserved"
                    value={variant.reserved}
                  />

                  <StockMetric
                    label="Available"
                    value={variant.available}
                  />
                </div>

                <div className="mt-6 border-t border-[#e5ddd3] pt-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[8px] uppercase tracking-[0.15em] !text-[#9b857c]">
                        Stock status
                      </p>

                      <p className="mt-2 text-[10px] font-medium !text-[#473530]">
                        {stockStatus}
                      </p>
                    </div>

                    <p className="text-[8px] !text-[#9c8b84]">
                      Last updated {variant.updatedAt}
                    </p>
                  </div>
                </div>
              </AdminPanel>

              {/* Warning */}

              {variant.stock <=
                variant.threshold && (
                <div
                  className={`
                    flex
                    gap-4
                    border
                    p-5

                    ${
                      variant.stock <= 0
                        ? "border-[#e1c5c1] bg-[#f5e8e6]"
                        : "border-[#dfcfc3] bg-[#f5ede6]"
                    }
                  `}
                >
                  <TriangleAlert
                    className="mt-0.5 size-4 shrink-0 !text-[#9c5a4e]"
                    strokeWidth={1.4}
                  />

                  <div>
                    <p className="text-[9px] font-medium !text-[#653f38]">
                      {variant.stock <= 0
                        ? "This variant is out of stock."
                        : "This variant is running low."}
                    </p>

                    <p className="mt-2 text-[9px] leading-5 !text-[#8b6f67]">
                      Your low-stock threshold is{" "}
                      {variant.threshold} units.
                      Consider replenishing this
                      variant before the remaining
                      stock is sold.
                    </p>
                  </div>
                </div>
              )}

              {/* Movement history */}

              <AdminPanel
                eyebrow="Inventory history"
                title="Stock movements."
              >
                <div>
                  {variant.movements.map(
                    (movement, index) => (
                      <div
                        key={movement.id}
                        className={`
                          grid
                          gap-4
                          py-5
                          sm:grid-cols-[1fr_110px_150px]

                          ${
                            index !== 0
                              ? "border-t border-[#e5ddd3]"
                              : "pt-0"
                          }
                        `}
                      >
                        <div>
                          <div className="flex items-center gap-3">
                            <MovementIcon
                              type={movement.type}
                            />

                            <p className="text-[10px] font-medium !text-[#46342f]">
                              {movement.type}
                            </p>
                          </div>

                          <p className="mt-2 text-[9px] leading-5 !text-[#8d7a73]">
                            {movement.note}
                          </p>
                        </div>

                        <div>
                          <p className="text-[8px] uppercase tracking-[0.14em] !text-[#9c8b84]">
                            Quantity
                          </p>

                          <p
                            className={`mt-2 text-[10px] font-medium ${
                              movement.quantity > 0
                                ? "!text-[#526357]"
                                : "!text-[#9a574b]"
                            }`}
                          >
                            {movement.quantity > 0
                              ? "+"
                              : ""}
                            {movement.quantity}
                          </p>
                        </div>

                        <div>
                          <p className="text-[8px] uppercase tracking-[0.14em] !text-[#9c8b84]">
                            Date
                          </p>

                          <p className="mt-2 text-[9px] !text-[#6e5c56]">
                            {movement.date}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </AdminPanel>

              {/* Future backend note */}

              <div className="border border-[#e5ddd3] bg-[#fbfaf7] p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  <Package2
                    className="mt-0.5 size-4 shrink-0 !text-[#907269]"
                    strokeWidth={1.4}
                  />

                  <div>
                    <p className="text-[9px] font-medium !text-[#493631]">
                      Inventory adjustments
                    </p>

                    <p className="mt-2 max-w-2xl text-[9px] leading-5 !text-[#89766f]">
                      Once the NestJS backend is
                      connected, manual stock
                      adjustments should create an
                      inventory movement instead of
                      changing stock silently.
                    </p>

                    <Link
                      href="/admin/inventory"
                      className="mt-4 inline-flex items-center gap-3 border-b border-[#5a1425] pb-1 text-[9px] !text-[#5a1425]"
                    >
                      Return to inventory

                      <ArrowUpRight
                        className="size-3"
                        strokeWidth={1.4}
                      />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function getStockStatus(
  variant: InventoryVariant
) {
  if (variant.stock <= 0) {
    return "Out of stock";
  }

  if (variant.stock <= variant.threshold) {
    return "Low stock";
  }

  return "In stock";
}

/* =========================================================
   PANEL
========================================================= */

function AdminPanel({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-[#e5ddd3] bg-[#fbfaf7] p-5 sm:p-7">
      <p className="text-[8px] font-medium uppercase tracking-[0.22em] !text-[#9a756c]">
        {eyebrow}
      </p>

      <h2 className="mt-3 font-display text-[27px] font-normal !text-[#382724]">
        {title}
      </h2>

      <div className="mt-6">
        {children}
      </div>
    </section>
  );
}

/* =========================================================
   SUMMARY
========================================================= */

function SummaryCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <article className="min-h-[145px] border border-[#e5ddd3] bg-[#fbfaf7] p-5">
      <p className="text-[8px] !text-[#8a7770]">
        {label}
      </p>

      <p className="mt-5 font-display text-[31px] leading-none !text-[#2e1e1d]">
        {value}
      </p>

      <p className="mt-5 text-[8px] leading-5 !text-[#9a8a84]">
        {helper}
      </p>
    </article>
  );
}

/* =========================================================
   INFO
========================================================= */

function InfoRow({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-start justify-between gap-4 py-4 ${
        !last
          ? "border-b border-[#e5ddd3]"
          : ""
      }`}
    >
      <p className="text-[8px] uppercase tracking-[0.13em] !text-[#9b8982]">
        {label}
      </p>

      <p className="max-w-[190px] break-words text-right text-[9px] font-medium !text-[#493732]">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   STOCK METRIC
========================================================= */

function StockMetric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="border border-[#e5ddd3] bg-[#f8f4ef] p-5">
      <p className="text-[8px] uppercase tracking-[0.15em] !text-[#9b857c]">
        {label}
      </p>

      <p className="mt-4 font-display text-[32px] !text-[#382724]">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   STOCK BADGE
========================================================= */

function StockBadge({
  stock,
  threshold,
}: {
  stock: number;
  threshold: number;
}) {
  const status =
    stock <= 0
      ? "Out of stock"
      : stock <= threshold
        ? "Low stock"
        : "In stock";

  const style =
    status === "Out of stock"
      ? "bg-[#f1e3e3] !text-[#9b4d4d]"
      : status === "Low stock"
        ? "bg-[#f4e6e2] !text-[#9c574b]"
        : "bg-[#e8eee8] !text-[#526357]";

  return (
    <span
      className={`inline-flex w-fit px-2.5 py-1.5 text-[8px] font-medium uppercase tracking-[0.1em] ${style}`}
    >
      {status}
    </span>
  );
}

/* =========================================================
   MOVEMENT ICON
========================================================= */

function MovementIcon({
  type,
}: {
  type: InventoryVariant["movements"][number]["type"];
}) {
  if (type === "Stock added") {
    return (
      <span className="flex size-7 items-center justify-center rounded-full bg-[#e8eee8]">
        <CheckCircle2
          className="size-3 !text-[#526357]"
          strokeWidth={1.5}
        />
      </span>
    );
  }

  if (type === "Order") {
    return (
      <span className="flex size-7 items-center justify-center rounded-full bg-[#eee8f0]">
        <Package2
          className="size-3 !text-[#735c78]"
          strokeWidth={1.4}
        />
      </span>
    );
  }

  return (
    <span className="flex size-7 items-center justify-center rounded-full bg-[#f2ebe5]">
      <Box
        className="size-3 !text-[#836b62]"
        strokeWidth={1.4}
      />
    </span>
  );
}