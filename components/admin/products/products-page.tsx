"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import type { ReactNode } from "react";

import Image from "next/image";
import Link from "next/link";

import {
  Archive,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  Eye,
  LoaderCircle,
  Pencil,
  Plus,
  Search,
  Store,
  X,
} from "lucide-react";

import { toast } from "sonner";

import {
  productsService,
  type Product,
} from "@/services/products.service";

/* =========================================================
   TYPES
========================================================= */

type StatusFilter =
  | "ALL"
  | "ACTIVE"
  | "DRAFT"
  | "ARCHIVED";

type AdminProductResponse = {
  data: Product[];

  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

const PAGE_SIZE = 20;

/* =========================================================
   PAGE
========================================================= */

export function AdminProductsPage() {
  const [products, setProducts] =
    useState<Product[]>([]);

  const [search, setSearch] =
    useState("");

  const [debouncedSearch, setDebouncedSearch] =
    useState("");

  const [family, setFamily] =
    useState("All");

  const [status, setStatus] =
    useState<StatusFilter>("ALL");

  const [page, setPage] =
    useState(1);

  const [pagination, setPagination] =
    useState({
      page: 1,
      limit: PAGE_SIZE,
      total: 0,
      pages: 1,
    });

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [
    productToArchive,
    setProductToArchive,
  ] = useState<Product | null>(
    null
  );

  const [
    archiving,
    setArchiving,
  ] = useState(false);

  /* =======================================================
     SEARCH DEBOUNCE
  ======================================================== */

  useEffect(() => {
    const timer =
      window.setTimeout(() => {
        setDebouncedSearch(
          search.trim()
        );

        setPage(1);
      }, 350);

    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, [search]);

  /* =======================================================
     LOAD PRODUCTS
  ======================================================== */

  const loadProducts =
    useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        const response =
          (await productsService.getAdminProducts(
            {
              page,
              limit: PAGE_SIZE,

              ...(debouncedSearch
                ? {
                    search:
                      debouncedSearch,
                  }
                : {}),

              ...(family !== "All"
                ? {
                    family,
                  }
                : {}),

              ...(status !== "ALL"
                ? {
                    status,
                  }
                : {}),
            }
          )) as AdminProductResponse;

        setProducts(
          response.data
        );

        setPagination(
          response.pagination
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to load products.";

        setError(message);

        toast.error(message);
      } finally {
        setLoading(false);
      }
    }, [
      page,
      debouncedSearch,
      family,
      status,
    ]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  /* =======================================================
     FILTER CHANGES
  ======================================================== */

  function handleFamilyChange(
    value: string
  ) {
    setFamily(value);
    setPage(1);
  }

  function handleStatusChange(
    value: string
  ) {
    setStatus(
      value as StatusFilter
    );

    setPage(1);
  }

  function clearFilters() {
    setSearch("");
    setDebouncedSearch("");
    setFamily("All");
    setStatus("ALL");
    setPage(1);
  }

  /* =======================================================
     ARCHIVE
  ======================================================== */

  async function confirmArchive() {
    if (
      !productToArchive ||
      archiving
    ) {
      return;
    }

    setArchiving(true);

    const toastId =
      toast.loading(
        "Archiving product..."
      );

    try {
      const response =
        await productsService.archive(
          productToArchive.id
        );

      toast.success(
        response.message ||
          "Product archived.",
        {
          id: toastId,
        }
      );

      setProductToArchive(
        null
      );

      await loadProducts();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to archive product.",
        {
          id: toastId,
        }
      );
    } finally {
      setArchiving(false);
    }
  }

  /* =======================================================
     STATS FROM CURRENT RESULT
  ======================================================== */

  const activeCount =
    products.filter(
      (product) =>
        product.status ===
        "ACTIVE"
    ).length;

  const draftCount =
    products.filter(
      (product) =>
        product.status ===
        "DRAFT"
    ).length;

  const lowStockCount =
    products.filter(
      (product) =>
        product.totalStock <=
          7 &&
        product.status !==
          "ARCHIVED"
    ).length;

  const hasFilters =
    search.trim() !== "" ||
    family !== "All" ||
    status !== "ALL";

  /* =======================================================
     UI
  ======================================================== */

  return (
    <>
      <section className="min-h-full bg-[#fbfaf7]">
        <div className="px-5 py-8 sm:px-8 lg:px-9 lg:py-10 xl:px-10">
          <div className="mx-auto max-w-[1500px]">
            {/* HEADER */}

            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[9px] font-medium uppercase tracking-[0.28em] !text-[#9a7a70]">
                  Élan Parfums /
                  Back office
                </p>

                <h1 className="mt-4 font-display text-[46px] font-normal leading-none tracking-[-0.04em] !text-[#2e1e1d] sm:text-[54px] lg:text-[60px]">
                  Products
                </h1>

                <p className="mt-4 max-w-xl text-[11px] leading-5 !text-[#7f6f69] sm:text-[12px]">
                  Manage the live
                  fragrance catalogue,
                  product visibility,
                  pricing and inventory.
                </p>
              </div>

              <Link
                href="/admin/products/create"
                className="
                  group
                  inline-flex
                  min-h-[48px]
                  w-fit
                  items-center
                  justify-between
                  gap-8
                  bg-[#5a1425]
                  px-6
                  text-[10px]
                  font-medium
                  !text-white

                  transition-colors
                  duration-300

                  hover:bg-[#6b1b2f]
                "
              >
                Add product

                <Plus
                  className="size-3.5 transition-transform duration-300 group-hover:rotate-90"
                  strokeWidth={
                    1.5
                  }
                />
              </Link>
            </div>

            {/* STATS */}

            <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Matching products"
                value={pagination.total.toString()}
                helper="From the live catalogue"
              />

              <StatCard
                label="Active shown"
                value={activeCount.toString()}
                helper="On this page"
              />

              <StatCard
                label="Drafts shown"
                value={draftCount.toString()}
                helper="On this page"
              />

              <StatCard
                label="Low stock shown"
                value={lowStockCount.toString()}
                helper="7 units or fewer"
              />
            </div>

            {/* FILTERS */}

            <div className="mt-6 border-y border-[#ded6cf] py-4">
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_160px]">
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#74625c]"
                    strokeWidth={
                      1.4
                    }
                  />

                  <input
                    type="search"
                    value={
                      search
                    }
                    onChange={(
                      event
                    ) =>
                      setSearch(
                        event.target
                          .value
                      )
                    }
                    placeholder="Search name, slug, family or SKU..."
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
                      onClick={() =>
                        setSearch(
                          ""
                        )
                      }
                      aria-label="Clear search"
                      className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-[#74625c] transition-colors hover:bg-black/[0.04]"
                    >
                      <X
                        className="size-3.5"
                        strokeWidth={
                          1.4
                        }
                      />
                    </button>
                  )}
                </div>

                <FilterSelect
                  label="Fragrance family"
                  value={
                    family
                  }
                  onChange={
                    handleFamilyChange
                  }
                  options={[
                    "All",
                    "Amber",
                    "Floral",
                    "Woody",
                    "Fresh",
                    "Gourmand",
                    "Leather",
                    "Citrus",
                    "Musk",
                  ]}
                />

                <FilterSelect
                  label="Status"
                  value={
                    status
                  }
                  onChange={
                    handleStatusChange
                  }
                  options={[
                    {
                      value:
                        "ALL",
                      label:
                        "All",
                    },
                    {
                      value:
                        "ACTIVE",
                      label:
                        "Active",
                    },
                    {
                      value:
                        "DRAFT",
                      label:
                        "Draft",
                    },
                    {
                      value:
                        "ARCHIVED",
                      label:
                        "Archived",
                    },
                  ]}
                />
              </div>
            </div>

            {/* RESULT META */}

            <div className="flex min-h-[58px] items-center justify-between gap-5">
              <p className="text-[9px] !text-[#8f817b]">
                {pagination.total}{" "}
                {pagination.total ===
                1
                  ? "product"
                  : "products"}
              </p>

              {hasFilters ? (
                <button
                  type="button"
                  onClick={
                    clearFilters
                  }
                  className="border-b border-[#5a1425] pb-1 text-[8px] font-medium !text-[#5a1425]"
                >
                  Clear filters
                </button>
              ) : (
                <p className="hidden text-[8px] uppercase tracking-[0.15em] !text-[#a08c84] sm:block">
                  Live catalogue
                </p>
              )}
            </div>

            {/* LOADING */}

            {loading && (
              <LoadingState />
            )}

            {/* ERROR */}

            {!loading &&
              error && (
                <ErrorState
                  message={
                    error
                  }
                  onRetry={
                    loadProducts
                  }
                />
              )}

            {/* DESKTOP */}

            {!loading &&
              !error &&
              products.length >
                0 && (
                <div className="hidden overflow-x-auto border border-[#e5ddd3] bg-[#fbfaf7] md:block">
                  <div className="min-w-[900px]">
                    <div className="grid grid-cols-[80px_minmax(190px,1.35fr)_0.8fr_0.7fr_0.7fr_0.65fr_120px] border-b border-[#e5ddd3] bg-[#f5f0ea] px-5 py-4">
                      <TableHeading>
                        Product
                      </TableHeading>

                      <TableHeading>
                        Name
                      </TableHeading>

                      <TableHeading>
                        Family
                      </TableHeading>

                      <TableHeading>
                        From
                      </TableHeading>

                      <TableHeading>
                        Stock
                      </TableHeading>

                      <TableHeading>
                        Status
                      </TableHeading>

                      <TableHeading align="right">
                        Actions
                      </TableHeading>
                    </div>

                    {products.map(
                      (product) => (
                        <DesktopProductRow
                          key={
                            product.id
                          }
                          product={
                            product
                          }
                          onArchive={() =>
                            setProductToArchive(
                              product
                            )
                          }
                        />
                      )
                    )}
                  </div>
                </div>
              )}

            {/* MOBILE */}

            {!loading &&
              !error &&
              products.length >
                0 && (
                <div className="grid gap-3 md:hidden">
                  {products.map(
                    (product) => (
                      <MobileProductCard
                        key={
                          product.id
                        }
                        product={
                          product
                        }
                        onArchive={() =>
                          setProductToArchive(
                            product
                          )
                        }
                      />
                    )
                  )}
                </div>
              )}

            {/* EMPTY */}

            {!loading &&
              !error &&
              products.length ===
                0 && (
                <EmptyState
                  hasFilters={
                    hasFilters
                  }
                  onClear={
                    clearFilters
                  }
                />
              )}

            {/* PAGINATION */}

            {!loading &&
              !error &&
              pagination.total >
                0 && (
                <Pagination
                  page={
                    pagination.page
                  }
                  pages={
                    pagination.pages
                  }
                  onPageChange={
                    setPage
                  }
                />
              )}
          </div>
        </div>
      </section>

      {/* ARCHIVE MODAL */}

      {productToArchive && (
        <ArchiveProductModal
          product={
            productToArchive
          }
          loading={
            archiving
          }
          onCancel={() => {
            if (!archiving) {
              setProductToArchive(
                null
              );
            }
          }}
          onConfirm={
            confirmArchive
          }
        />
      )}
    </>
  );
}

/* =========================================================
   DESKTOP ROW
========================================================= */

function DesktopProductRow({
  product,
  onArchive,
}: {
  product: Product;
  onArchive: () => void;
}) {
  return (
    <div
      className="
        grid
        min-h-[104px]
        grid-cols-[80px_minmax(190px,1.35fr)_0.8fr_0.7fr_0.7fr_0.65fr_120px]
        items-center
        border-b
        border-[#e5ddd3]
        px-5

        transition-colors

        last:border-b-0

        hover:bg-[#faf7f3]
      "
    >
      <ProductImage
        product={
          product
        }
        width={58}
        height={58}
      />

      <div className="min-w-0 pr-5">
        <Link
          href={`/admin/products/${product.id}`}
        >
          <p className="truncate font-display text-[19px] !text-[#382724] transition-opacity hover:opacity-60">
            {product.name}
          </p>
        </Link>

        <p className="mt-1 truncate text-[8px] uppercase tracking-[0.12em] !text-[#9a8279]">
          {
            product.concentration
          }{" "}
          ·{" "}
          {formatAudience(
            product.audience
          )}
        </p>
      </div>

      <p className="text-[10px] !text-[#685650]">
        {product.family}
      </p>

      <p className="text-[10px] font-medium !text-[#3f302c]">
        {product.startingPrice !==
        null
          ? currency.format(
              product.startingPrice
            )
          : "—"}
      </p>

      <StockValue
        stock={
          product.totalStock
        }
      />

      <StatusBadge
        status={
          product.status
        }
      />

      <div className="flex items-center justify-end gap-1">
        <Link
          href={`/admin/products/${product.id}`}
          aria-label={`View ${product.name}`}
          title="View product"
          className="flex size-8 items-center justify-center !text-[#77635d] transition-colors hover:bg-[#f1ebe5] hover:!text-[#5a1425]"
        >
          <Eye
            className="size-3.5"
            strokeWidth={1.4}
          />
        </Link>

        <Link
          href={`/admin/products/${product.id}/edit`}
          aria-label={`Edit ${product.name}`}
          title="Edit product"
          className="flex size-8 items-center justify-center !text-[#77635d] transition-colors hover:bg-[#f1ebe5] hover:!text-[#5a1425]"
        >
          <Pencil
            className="size-3.5"
            strokeWidth={1.4}
          />
        </Link>

        {product.status ===
          "ACTIVE" && (
          <Link
            href={`/perfumes/${product.slug}`}
            target="_blank"
            aria-label={`Open ${product.name} in storefront`}
            title="Open storefront"
            className="flex size-8 items-center justify-center !text-[#77635d] transition-colors hover:bg-[#f1ebe5] hover:!text-[#5a1425]"
          >
            <ArrowUpRight
              className="size-3.5"
              strokeWidth={
                1.4
              }
            />
          </Link>
        )}

        {product.status !==
          "ARCHIVED" && (
          <button
            type="button"
            onClick={
              onArchive
            }
            aria-label={`Archive ${product.name}`}
            title="Archive product"
            className="flex size-8 items-center justify-center !text-[#977c75] transition-colors hover:bg-[#f5e9e7] hover:!text-[#9c3b3b]"
          >
            <Archive
              className="size-3.5"
              strokeWidth={
                1.4
              }
            />
          </button>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   MOBILE CARD
========================================================= */

function MobileProductCard({
  product,
  onArchive,
}: {
  product: Product;
  onArchive: () => void;
}) {
  return (
    <article className="border border-[#e5ddd3] bg-[#fbfaf7] p-4">
      <div className="flex gap-4">
        <ProductImage
          product={
            product
          }
          width={86}
          height={108}
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link
                href={`/admin/products/${product.id}`}
              >
                <h2 className="truncate font-display text-[22px] font-normal !text-[#382724]">
                  {
                    product.name
                  }
                </h2>
              </Link>

              <p className="mt-1 text-[8px] uppercase tracking-[0.12em] !text-[#9a8279]">
                {
                  product.family
                }{" "}
                ·{" "}
                {formatAudience(
                  product.audience
                )}
              </p>
            </div>

            <StatusBadge
              status={
                product.status
              }
            />
          </div>

          <div className="mt-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-medium !text-[#3f302c]">
                {product.startingPrice !==
                null
                  ? currency.format(
                      product.startingPrice
                    )
                  : "—"}
              </p>

              <div className="mt-2">
                <StockValue
                  stock={
                    product.totalStock
                  }
                />
              </div>
            </div>

            <p className="text-[8px] !text-[#9b8982]">
              {
                product.concentration
              }
            </p>
          </div>
        </div>
      </div>

      <div
        className={`mt-4 grid border-t border-[#e5ddd3] pt-3 ${
          product.status ===
          "ARCHIVED"
            ? "grid-cols-2"
            : product.status ===
                "ACTIVE"
              ? "grid-cols-4"
              : "grid-cols-3"
        }`}
      >
        <Link
          href={`/admin/products/${product.id}`}
          className="flex items-center justify-center gap-1.5 py-2 text-[8px] !text-[#685650]"
        >
          <Eye
            className="size-3"
            strokeWidth={1.4}
          />

          View
        </Link>

        <Link
          href={`/admin/products/${product.id}/edit`}
          className="flex items-center justify-center gap-1.5 border-l border-[#e5ddd3] py-2 text-[8px] !text-[#685650]"
        >
          <Pencil
            className="size-3"
            strokeWidth={1.4}
          />

          Edit
        </Link>

        {product.status ===
          "ACTIVE" && (
          <Link
            href={`/perfumes/${product.slug}`}
            target="_blank"
            className="flex items-center justify-center gap-1.5 border-l border-[#e5ddd3] py-2 text-[8px] !text-[#685650]"
          >
            <Store
              className="size-3"
              strokeWidth={
                1.4
              }
            />

            Store
          </Link>
        )}

        {product.status !==
          "ARCHIVED" && (
          <button
            type="button"
            onClick={
              onArchive
            }
            className="flex items-center justify-center gap-1.5 border-l border-[#e5ddd3] py-2 text-[8px] !text-[#9a5e57]"
          >
            <Archive
              className="size-3"
              strokeWidth={
                1.4
              }
            />

            Archive
          </button>
        )}
      </div>
    </article>
  );
}

/* =========================================================
   PRODUCT IMAGE
========================================================= */

type ProductImageValue =
  | string
  | {
      url?: string | null;
    };

function getProductImageUrl(
  product: Product
): string | null {
  /*
   * Compatibility layer:
   *
   * Old API:
   * images: string[]
   *
   * New API:
   * images: ProductImage[]
   *
   * This keeps the admin page safe while every
   * frontend screen is migrated to ProductImage.
   */
  const images =
    (product.images ??
      []) as unknown as ProductImageValue[];

  for (const item of images) {
    const candidate =
      typeof item ===
      "string"
        ? item
        : item?.url;

    if (
      typeof candidate ===
        "string" &&
      candidate.trim()
        .length > 0
    ) {
      return candidate.trim();
    }
  }

  return null;
}

function ProductImage({
  product,
  width,
  height,
}: {
  product: Product;
  width: number;
  height: number;
}) {
  const imageUrl =
    getProductImageUrl(
      product
    );

  return (
    <Link
      href={`/admin/products/${product.id}`}
      className="group relative shrink-0 overflow-hidden bg-[#e8e3dd]"
      style={{
        width,
        height,
      }}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={
            product.name ||
            "Product image"
          }
          fill
          sizes={`${width}px`}
          unoptimized
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[#eee9e3]">
          <Store
            className="size-5 !text-[#aa9991]"
            strokeWidth={
              1.2
            }
          />
        </div>
      )}
    </Link>
  );
}

/* =========================================================
   STATS
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

      <p className="mt-5 font-display text-[38px] font-normal leading-none tracking-[-0.03em] !text-[#2e1e1d]">
        {value}
      </p>

      <p className="mt-5 text-[9px] leading-5 !text-[#9a8a84]">
        {helper}
      </p>
    </article>
  );
}

/* =========================================================
   STOCK
========================================================= */

function StockValue({
  stock,
}: {
  stock: number;
}) {
  const outOfStock =
    stock <= 0;

  const low =
    stock > 0 &&
    stock <= 7;

  return (
    <div>
      <p
        className={`text-[10px] font-medium ${
          outOfStock
            ? "!text-[#963d3d]"
            : low
              ? "!text-[#a05345]"
              : "!text-[#4e6254]"
        }`}
      >
        {stock}
      </p>

      {outOfStock ? (
        <p className="mt-1 text-[8px] !text-[#a55b55]">
          Out of stock
        </p>
      ) : low ? (
        <p className="mt-1 text-[8px] !text-[#ad7568]">
          Low stock
        </p>
      ) : null}
    </div>
  );
}

/* =========================================================
   STATUS
========================================================= */

function StatusBadge({
  status,
}: {
  status:
    | "DRAFT"
    | "ACTIVE"
    | "ARCHIVED";
}) {
  return (
    <span
      className={`
        inline-flex
        w-fit
        shrink-0
        px-2.5
        py-1.5
        text-[8px]
        font-medium
        uppercase
        tracking-[0.1em]

        ${
          status === "ACTIVE"
            ? "bg-[#e8eee8] !text-[#526357]"
            : status ===
                "DRAFT"
              ? "bg-[#eee9e4] !text-[#82726b]"
              : "bg-[#eee4e4] !text-[#875b5b]"
        }
      `}
    >
      {status === "ACTIVE"
        ? "Active"
        : status === "DRAFT"
          ? "Draft"
          : "Archived"}
    </span>
  );
}

/* =========================================================
   TABLE
========================================================= */

function TableHeading({
  children,
  align = "left",
}: {
  children: ReactNode;
  align?:
    | "left"
    | "right";
}) {
  return (
    <p
      className={`
        text-[8px]
        font-medium
        uppercase
        tracking-[0.15em]
        !text-[#917d75]

        ${
          align === "right"
            ? "text-right"
            : "text-left"
        }
      `}
    >
      {children}
    </p>
  );
}

/* =========================================================
   FILTER
========================================================= */

type DetailedOption = {
  value: string;
  label: string;
};

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  options: Array<
    string | DetailedOption
  >;
}) {
  return (
    <label className="relative flex h-[52px] flex-col justify-center border-b border-[#d8d0ca] px-3">
      <span className="mb-1 text-[8px] !text-[#86746d]">
        {label}
      </span>

      <select
        value={value}
        onChange={(
          event
        ) =>
          onChange(
            event.target.value
          )
        }
        className="
          w-full
          cursor-pointer
          appearance-none
          bg-transparent
          pr-7
          text-[10px]
          !text-[#3d302c]
          outline-none
        "
      >
        {options.map(
          (option) => {
            const item =
              typeof option ===
              "string"
                ? {
                    value:
                      option,
                    label:
                      option,
                  }
                : option;

            return (
              <option
                key={
                  item.value
                }
                value={
                  item.value
                }
              >
                {
                  item.label
                }
              </option>
            );
          }
        )}
      </select>

      <ChevronDown
        className="pointer-events-none absolute bottom-[10px] right-2 size-3.5 !text-[#382b28]"
        strokeWidth={1.5}
      />
    </label>
  );
}

/* =========================================================
   PAGINATION
========================================================= */

function Pagination({
  page,
  pages,
  onPageChange,
}: {
  page: number;
  pages: number;
  onPageChange: (
    page: number
  ) => void;
}) {
  if (pages <= 1) {
    return null;
  }

  return (
    <div className="mt-6 flex items-center justify-between border-t border-[#ded6cf] pt-5">
      <button
        type="button"
        disabled={
          page <= 1
        }
        onClick={() =>
          onPageChange(
            page - 1
          )
        }
        className="inline-flex items-center gap-2 text-[9px] font-medium !text-[#5a1425] disabled:cursor-not-allowed disabled:opacity-30"
      >
        <ArrowLeft
          className="size-3"
          strokeWidth={1.4}
        />

        Previous
      </button>

      <p className="text-[8px] uppercase tracking-[0.15em] !text-[#927f77]">
        Page {page} of{" "}
        {pages}
      </p>

      <button
        type="button"
        disabled={
          page >= pages
        }
        onClick={() =>
          onPageChange(
            page + 1
          )
        }
        className="inline-flex items-center gap-2 text-[9px] font-medium !text-[#5a1425] disabled:cursor-not-allowed disabled:opacity-30"
      >
        Next

        <ArrowRight
          className="size-3"
          strokeWidth={1.4}
        />
      </button>
    </div>
  );
}

/* =========================================================
   STATES
========================================================= */

function LoadingState() {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center border border-[#e5ddd3]">
      <LoaderCircle
        className="size-5 animate-spin !text-[#5a1425]"
        strokeWidth={1.4}
      />

      <p className="mt-4 text-[9px] !text-[#88766f]">
        Loading catalogue...
      </p>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center border border-[#e5ddd3] px-6 text-center">
      <p className="text-[8px] uppercase tracking-[0.24em] !text-[#a1625b]">
        Catalogue unavailable
      </p>

      <h2 className="mt-4 font-display text-[32px] !text-[#382724]">
        We couldn&apos;t load
        the products.
      </h2>

      <p className="mt-3 max-w-md text-[9px] leading-5 !text-[#88766f]">
        {message}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-6 bg-[#5a1425] px-6 py-3 text-[9px] font-medium !text-white"
      >
        Try again
      </button>
    </div>
  );
}

function EmptyState({
  hasFilters,
  onClear,
}: {
  hasFilters: boolean;
  onClear: () => void;
}) {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center border border-[#e5ddd3] px-6 text-center">
      <p className="text-[8px] font-medium uppercase tracking-[0.24em] !text-[#9a756c]">
        Catalogue
      </p>

      <h2 className="mt-4 font-display text-[32px] font-normal !text-[#382724] sm:text-[38px]">
        No products found.
      </h2>

      <p className="mt-3 max-w-sm text-[10px] leading-5 !text-[#8b7972]">
        {hasFilters
          ? "Try changing your search or catalogue filters."
          : "Create your first fragrance to begin building the ÉLAN catalogue."}
      </p>

      {hasFilters ? (
        <button
          type="button"
          onClick={onClear}
          className="mt-6 border-b border-[#5a1425] pb-1 text-[9px] font-medium !text-[#5a1425]"
        >
          Clear filters
        </button>
      ) : (
        <Link
          href="/admin/products/create"
          className="mt-6 bg-[#5a1425] px-6 py-3 text-[9px] font-medium !text-white"
        >
          Add first product
        </Link>
      )}
    </div>
  );
}

/* =========================================================
   ARCHIVE MODAL
========================================================= */

function ArchiveProductModal({
  product,
  loading,
  onCancel,
  onConfirm,
}: {
  product: Product;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-5">
      <button
        type="button"
        disabled={loading}
        aria-label="Close archive confirmation"
        onClick={
          onCancel
        }
        className="absolute inset-0 bg-[#1f1412]/45 backdrop-blur-[2px]"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="archive-product-title"
        className="relative z-10 w-full max-w-[460px] bg-[#fbfaf7] p-6 shadow-2xl sm:p-8"
      >
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-[8px] font-medium uppercase tracking-[0.24em] !text-[#a0685e]">
              Archive product
            </p>

            <h2
              id="archive-product-title"
              className="mt-4 font-display text-[32px] font-normal leading-none !text-[#382724]"
            >
              Remove from the
              catalogue?
            </h2>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={
              onCancel
            }
            aria-label="Close"
            className="flex size-9 items-center justify-center !text-[#6f5c56] transition-colors hover:bg-[#f0ebe5] disabled:opacity-40"
          >
            <X
              className="size-4"
              strokeWidth={
                1.4
              }
            />
          </button>
        </div>

        <p className="mt-5 text-[10px] leading-6 !text-[#81706a]">
          <strong className="font-medium !text-[#4a3732]">
            {product.name}
          </strong>{" "}
          will be archived and
          removed from the public
          storefront. Historical
          order data and variants
          remain in the database.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={
              onCancel
            }
            className="min-h-[48px] border border-[#d8d0ca] text-[9px] font-medium !text-[#685650] disabled:opacity-50"
          >
            Keep product
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={
              onConfirm
            }
            className="flex min-h-[48px] items-center justify-center gap-2 bg-[#711f2e] text-[9px] font-medium !text-white transition-colors hover:bg-[#821f31] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && (
              <LoaderCircle
                className="size-3.5 animate-spin"
                strokeWidth={
                  1.4
                }
              />
            )}

            {loading
              ? "Archiving..."
              : "Archive product"}
          </button>
        </div>
      </div>
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
  if (
    audience === "WOMEN"
  ) {
    return "Women";
  }

  if (
    audience === "MEN"
  ) {
    return "Men";
  }

  return "Unisex";
}

const currency =
  new Intl.NumberFormat(
    "en-ZA",
    {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits:
        0,
      maximumFractionDigits:
        0,
    }
  );