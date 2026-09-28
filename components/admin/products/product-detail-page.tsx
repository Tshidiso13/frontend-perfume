"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  Box,
  Edit3,
  LoaderCircle,
  Package,
  RefreshCcw,
  Store,
} from "lucide-react";

import {
  productsService,
  type Product,
} from "@/services/products.service";

/* =========================================================
   COMPONENT
========================================================= */

export function AdminProductDetailPage({
  productId,
}: {
  productId: string;
}) {
  const [product, setProduct] =
    useState<Product | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  /* =======================================================
     LOAD REAL PRODUCT
  ======================================================== */

  const loadProduct =
    useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        const result =
          await productsService.getAdminProduct(
            productId
          );

        setProduct(result);
      } catch (error) {
        setProduct(null);

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load product."
        );
      } finally {
        setLoading(false);
      }
    }, [productId]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  /* =======================================================
     LOADING
  ======================================================== */

  if (loading) {
    return (
      <section className="flex min-h-[70vh] flex-col items-center justify-center bg-[#fbfaf7]">
        <LoaderCircle
          className="size-6 animate-spin !text-[#5a1425]"
          strokeWidth={1.4}
        />

        <p className="mt-4 text-[9px] !text-[#88766f]">
          Loading fragrance...
        </p>
      </section>
    );
  }

  /* =======================================================
     ERROR
  ======================================================== */

  if (!product || error) {
    return (
      <section className="flex min-h-[70vh] flex-col items-center justify-center bg-[#fbfaf7] px-6 text-center">
        <AlertTriangle
          className="size-6 !text-[#9b5a51]"
          strokeWidth={1.4}
        />

        <p className="mt-5 text-[8px] font-medium uppercase tracking-[0.22em] !text-[#a0685e]">
          Product unavailable
        </p>

        <h1 className="mt-4 font-display text-[38px] !text-[#382724]">
          We couldn&apos;t load this
          fragrance.
        </h1>

        <p className="mt-4 max-w-md text-[9px] leading-5 !text-[#88766f]">
          {error ??
            "The product could not be found."}
        </p>

        <div className="mt-7 flex gap-3">
          <Link
            href="/admin/products"
            className="inline-flex min-h-[46px] items-center gap-2 border border-[#d8d0ca] px-5 text-[9px] !text-[#62514b]"
          >
            <ArrowLeft
              className="size-3"
              strokeWidth={1.4}
            />

            Products
          </Link>

          <button
            type="button"
            onClick={loadProduct}
            className="inline-flex min-h-[46px] items-center gap-2 bg-[#5a1425] px-5 text-[9px] !text-white"
          >
            <RefreshCcw
              className="size-3"
              strokeWidth={1.4}
            />

            Try again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-full bg-[#fbfaf7]">
      <div className="px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-[1450px]">
          {/* BACK */}

          <Link
            href="/admin/products"
            className="group inline-flex items-center gap-3 text-[9px] !text-[#806d66]"
          >
            <ArrowLeft
              className="size-3.5 transition-transform group-hover:-translate-x-1"
              strokeWidth={1.4}
            />

            Back to products
          </Link>

          {/* HEADER */}

          <div className="mt-8 flex flex-col gap-6 border-b border-[#ded6cf] pb-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-[9px] font-medium uppercase tracking-[0.28em] !text-[#9a7a70]">
                  Élan Parfums /
                  Catalogue
                </p>

                <StatusBadge
                  status={product.status}
                />
              </div>

              <h1 className="mt-4 font-display text-[46px] font-normal leading-none tracking-[-0.04em] !text-[#2e1e1d] sm:text-[58px]">
                {product.name}
              </h1>

              <p className="mt-4 max-w-2xl text-[11px] leading-6 !text-[#7f6f69]">
                {
                  product.shortDescription
                }
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {product.status ===
                "ACTIVE" && (
                <Link
                  href={`/perfumes/${product.slug}`}
                  target="_blank"
                  className="inline-flex min-h-[46px] items-center gap-3 border border-[#d8d0ca] px-5 text-[9px] !text-[#64524c]"
                >
                  Storefront

                  <ArrowUpRight
                    className="size-3.5"
                    strokeWidth={1.4}
                  />
                </Link>
              )}

              <Link
                href={`/admin/products/${product.id}/edit`}
                className="inline-flex min-h-[46px] items-center gap-3 bg-[#5a1425] px-5 text-[9px] font-medium !text-white"
              >
                <Edit3
                  className="size-3.5"
                  strokeWidth={1.4}
                />

                Edit product
              </Link>
            </div>
          </div>

          {/* STATS */}

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={Package}
              label="Variants"
              value={String(
                product.variants.length
              )}
            />

            <StatCard
              icon={Box}
              label="Total stock"
              value={String(
                product.totalStock
              )}
            />

            <StatCard
              icon={Store}
              label="Starting price"
              value={
                product.startingPrice !==
                null
                  ? currency.format(
                      product.startingPrice
                    )
                  : "—"
              }
            />

            <StatCard
              icon={Package}
              label="Audience"
              value={formatAudience(
                product.audience
              )}
            />
          </div>

          {/* CONTENT */}

          <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
            <div className="space-y-5">
              {/* DETAILS */}

              <Panel
                eyebrow="Fragrance"
                title="Product details"
              >
                <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
                  <Detail
                    label="Family"
                    value={product.family}
                  />

                  <Detail
                    label="Concentration"
                    value={
                      product.concentration
                    }
                  />

                  <Detail
                    label="Audience"
                    value={formatAudience(
                      product.audience
                    )}
                  />

                  <Detail
                    label="Badge"
                    value={
                      product.badge ||
                      "None"
                    }
                  />

                  <Detail
                    label="Feeling"
                    value={
                      product.feeling ||
                      "Not specified"
                    }
                  />

                  <Detail
                    label="Longevity"
                    value={
                      product.longevity ||
                      "Not specified"
                    }
                  />

                  <Detail
                    label="Sillage"
                    value={
                      product.sillage ||
                      "Not specified"
                    }
                  />

                  <Detail
                    label="Season"
                    value={
                      product.season ||
                      "Not specified"
                    }
                  />
                </div>
              </Panel>

              {/* STORY */}

              <Panel
                eyebrow="Story"
                title="The fragrance"
              >
                <p className="max-w-3xl whitespace-pre-line text-[11px] leading-7 !text-[#70605a]">
                  {product.story ||
                    "No product story has been added yet."}
                </p>
              </Panel>

              {/* NOTES */}

              <Panel
                eyebrow="Composition"
                title="Fragrance notes"
              >
                <div className="grid gap-6 md:grid-cols-3">
                  <Notes
                    title="Top"
                    notes={
                      product.topNotes
                    }
                  />

                  <Notes
                    title="Heart"
                    notes={
                      product.heartNotes
                    }
                  />

                  <Notes
                    title="Base"
                    notes={
                      product.baseNotes
                    }
                  />
                </div>
              </Panel>

              {/* VARIANTS */}

              <Panel
                eyebrow="Inventory"
                title="Sizes & pricing"
              >
                <div className="overflow-x-auto">
                  <div className="min-w-[620px]">
                    <div className="grid grid-cols-[1fr_1fr_1fr_1fr] border-b border-[#ded6cf] pb-3">
                      <Heading>
                        Size
                      </Heading>

                      <Heading>
                        SKU
                      </Heading>

                      <Heading>
                        Price
                      </Heading>

                      <Heading>
                        Stock
                      </Heading>
                    </div>

                    {product.variants.map(
                      (variant) => (
                        <div
                          key={
                            variant.id
                          }
                          className="grid min-h-[66px] grid-cols-[1fr_1fr_1fr_1fr] items-center border-b border-[#eee7e1] last:border-b-0"
                        >
                          <p className="text-[10px] font-medium !text-[#44332f]">
                            {
                              variant.size
                            }
                          </p>

                          <p className="text-[9px] !text-[#85736c]">
                            {
                              variant.sku
                            }
                          </p>

                          <p className="text-[10px] !text-[#44332f]">
                            {currency.format(
                              variant.price
                            )}
                          </p>

                          <div>
                            <p
                              className={`text-[10px] font-medium ${
                                variant.stock <=
                                0
                                  ? "!text-[#9a3f3f]"
                                  : variant.stock <=
                                      variant.threshold
                                    ? "!text-[#a05e48]"
                                    : "!text-[#4f6253]"
                              }`}
                            >
                              {
                                variant.stock
                              }
                            </p>

                            {variant.reservedStock >
                              0 && (
                              <p className="mt-1 text-[7px] !text-[#9a8780]">
                                {
                                  variant.reservedStock
                                }{" "}
                                reserved
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </Panel>
            </div>

            {/* RIGHT */}

            <aside className="space-y-5 xl:sticky xl:top-[92px] xl:self-start">
              {/* IMAGE */}

              <section className="border border-[#e5ddd3] bg-[#fbfaf7] p-5">
                <p className="text-[8px] font-medium uppercase tracking-[0.22em] !text-[#9a756c]">
                  Product image
                </p>

                <div className="mt-5 flex aspect-[4/5] items-center justify-center overflow-hidden bg-[#eee9e3]">
                  {product.images?.[0] ? (
                    // Native image avoids Next remote-host config
                    // until your upload provider is final.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={
                        product.images[0]?.url
                      }
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Store
                      className="size-8 !text-[#b1a19a]"
                      strokeWidth={1.1}
                    />
                  )}
                </div>

                {product.images.length ===
                  0 && (
                  <p className="mt-4 text-[8px] leading-5 !text-[#9a8982]">
                    No permanent
                    product image has
                    been uploaded yet.
                  </p>
                )}
              </section>

              {/* META */}

              <section className="border border-[#e5ddd3] bg-[#f1ece6] p-5">
                <p className="text-[8px] font-medium uppercase tracking-[0.22em] !text-[#9a756c]">
                  Catalogue record
                </p>

                <div className="mt-5 space-y-4">
                  <MetaRow
                    label="Product ID"
                    value={product.id}
                  />

                  <MetaRow
                    label="Slug"
                    value={product.slug}
                  />

                  <MetaRow
                    label="Status"
                    value={formatStatus(
                      product.status
                    )}
                  />

                  <MetaRow
                    label="Created"
                    value={formatDate(
                      product.createdAt
                    )}
                  />

                  <MetaRow
                    label="Updated"
                    value={formatDate(
                      product.updatedAt
                    )}
                  />
                </div>
              </section>

              {/* SEO */}

              <section className="border border-[#e5ddd3] bg-[#fbfaf7] p-5">
                <p className="text-[8px] font-medium uppercase tracking-[0.22em] !text-[#9a756c]">
                  Search appearance
                </p>

                <p className="mt-5 font-medium text-[11px] !text-[#44332f]">
                  {product.seoTitle ||
                    product.name}
                </p>

                <p className="mt-2 text-[8px] leading-5 !text-[#8c7a73]">
                  {product.seoDescription ||
                    product.shortDescription}
                </p>
              </section>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   PANEL
========================================================= */

function Panel({
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

      <h2 className="mt-2 font-display text-[28px] !text-[#382724]">
        {title}
      </h2>

      <div className="mt-7">
        {children}
      </div>
    </section>
  );
}

/* =========================================================
   DETAIL
========================================================= */

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border-b border-[#ece4de] pb-4">
      <p className="text-[8px] !text-[#927f77]">
        {label}
      </p>

      <p className="mt-2 text-[10px] font-medium !text-[#44332f]">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   NOTES
========================================================= */

function Notes({
  title,
  notes,
}: {
  title: string;
  notes: string[];
}) {
  return (
    <div className="border-t border-[#ded6cf] pt-4">
      <p className="font-display text-[20px] !text-[#40302c]">
        {title}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {notes.length > 0 ? (
          notes.map((note) => (
            <span
              key={note}
              className="bg-[#f0ebe5] px-3 py-2 text-[8px] !text-[#5c4943]"
            >
              {note}
            </span>
          ))
        ) : (
          <p className="text-[8px] !text-[#a28f88]">
            None added
          </p>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   STATS
========================================================= */

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{
    className?: string;
    strokeWidth?: number;
  }>;
  label: string;
  value: string;
}) {
  return (
    <article className="border border-[#e5ddd3] bg-[#fbfaf7] p-5">
      <div className="flex items-center justify-between">
        <p className="text-[8px] uppercase tracking-[0.14em] !text-[#907c75]">
          {label}
        </p>

        <Icon
          className="size-3.5 !text-[#9d857d]"
          strokeWidth={1.4}
        />
      </div>

      <p className="mt-5 font-display text-[31px] !text-[#30211f]">
        {value}
      </p>
    </article>
  );
}

/* =========================================================
   STATUS
========================================================= */

function StatusBadge({
  status,
}: {
  status:
    | "ACTIVE"
    | "DRAFT"
    | "ARCHIVED";
}) {
  return (
    <span
      className={`px-2.5 py-1.5 text-[7px] font-medium uppercase tracking-[0.12em] ${
        status === "ACTIVE"
          ? "bg-[#e8eee8] !text-[#526357]"
          : status === "DRAFT"
            ? "bg-[#eee9e4] !text-[#82726b]"
            : "bg-[#eee4e4] !text-[#875b5b]"
      }`}
    >
      {formatStatus(status)}
    </span>
  );
}

/* =========================================================
   TABLE
========================================================= */

function Heading({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <p className="text-[8px] font-medium uppercase tracking-[0.14em] !text-[#927f77]">
      {children}
    </p>
  );
}

/* =========================================================
   META
========================================================= */

function MetaRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-5 border-b border-[#ddd4cd] pb-3 last:border-0 last:pb-0">
      <span className="text-[8px] !text-[#8e7a73]">
        {label}
      </span>

      <span className="max-w-[220px] break-all text-right text-[8px] font-medium !text-[#44332f]">
        {value}
      </span>
    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function formatAudience(
  audience:
    | "WOMEN"
    | "MEN"
    | "UNISEX"
) {
  if (audience === "WOMEN") {
    return "Women";
  }

  if (audience === "MEN") {
    return "Men";
  }

  return "Unisex";
}

function formatStatus(
  status:
    | "ACTIVE"
    | "DRAFT"
    | "ARCHIVED"
) {
  if (status === "ACTIVE") {
    return "Active";
  }

  if (status === "DRAFT") {
    return "Draft";
  }

  return "Archived";
}

function formatDate(
  value: string
) {
  return new Intl.DateTimeFormat(
    "en-ZA",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(new Date(value));
}

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