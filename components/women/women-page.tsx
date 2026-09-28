"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Heart,
  LoaderCircle,
  Package,
  Search,
  ShoppingBag,
  X,
} from "lucide-react";

import { motion } from "framer-motion";
import { toast } from "sonner";

import {
  productsService,
  type Product,
} from "@/services/products.service";

import {
  cartService,
} from "@/services/cart.service";

import {
  CART_DRAWER_OPEN_EVENT,
  CART_UPDATED_EVENT,
  CartDrawer,
} from "@/components/cart/cart-drawer";

/* =========================================================
   TYPES
========================================================= */

type SortOption =
  | "recommended"
  | "price-low"
  | "price-high"
  | "name";

type PublicProductsResponse = {
  data: Product[];

  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};



type StoredWishlistItem = {
  productId: string;
  slug: string;
  name: string;
  family: string;
  concentration: string;
  imageUrl: string | null;
  startingPrice: number | null;
  createdAt: string;
};

/* =========================================================
   CONSTANTS
========================================================= */

const PAGE_SIZE = 24;

const WISHLIST_STORAGE_KEY =
  "elan_wishlist";

const WISHLIST_UPDATED_EVENT =
  "elan:wishlist-updated";

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

/* =========================================================
   PAGE
========================================================= */

export function WomenPage() {
  const [
    products,
    setProducts,
  ] = useState<Product[]>([]);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    debouncedSearch,
    setDebouncedSearch,
  ] = useState("");

  const [
    family,
    setFamily,
  ] = useState("All");

  const [
    knownFamilies,
    setKnownFamilies,
  ] = useState<string[]>([]);

  const [
    sort,
    setSort,
  ] =
    useState<SortOption>(
      "recommended"
    );

  const [
    page,
    setPage,
  ] = useState(1);

  const [
    pagination,
    setPagination,
  ] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    pages: 1,
  });

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

  const [
    wishlistedIds,
    setWishlistedIds,
  ] = useState<
    Set<string>
  >(() => new Set());

  const [
    addingProductIds,
    setAddingProductIds,
  ] = useState<
    Set<string>
  >(() => new Set());

  /* =======================================================
     SEARCH DEBOUNCE
  ======================================================== */

  useEffect(() => {
    const timer =
      window.setTimeout(
        () => {
          setDebouncedSearch(
            search.trim()
          );

          setPage(1);
        },
        350
      );

    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, [search]);

  /* =======================================================
     LOAD WISHLIST
  ======================================================== */

  useEffect(() => {
    const wishlist =
      readStorageList<StoredWishlistItem>(
        WISHLIST_STORAGE_KEY
      );

    setWishlistedIds(
      new Set(
        wishlist.map(
          (item) =>
            item.productId
        )
      )
    );
  }, []);

  /* =======================================================
     LOAD WOMEN'S PRODUCTS FROM BACKEND
  ======================================================== */

  const loadProducts =
    useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        const response =
          (await productsService.getPublicProducts(
            {
              page,
              limit:
                PAGE_SIZE,

              audience:
                "WOMEN",

              ...(debouncedSearch
                ? {
                    search:
                      debouncedSearch,
                  }
                : {}),

              ...(family !==
              "All"
                ? {
                    family,
                  }
                : {}),
            }
          )) as PublicProductsResponse;

        const nextProducts =
          response.data ??
          [];

        setProducts(
          nextProducts
        );

        setPagination(
          response.pagination
        );

        setKnownFamilies(
          (current) => {
            const merged =
              new Set(
                current
              );

            for (
              const product
              of nextProducts
            ) {
              const value =
                product.family?.trim();

              if (value) {
                merged.add(
                  value
                );
              }
            }

            return Array.from(
              merged
            ).sort(
              (a, b) =>
                a.localeCompare(
                  b
                )
            );
          }
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to load women's fragrances.";

        setError(
          message
        );

        toast.error(
          message
        );
      } finally {
        setLoading(
          false
        );
      }
    }, [
      page,
      debouncedSearch,
      family,
    ]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  /* =======================================================
     SORT CURRENT BACKEND RESULT
  ======================================================== */

  const displayedProducts =
    useMemo(() => {
      const result = [
        ...products,
      ];

      if (
        sort ===
        "price-low"
      ) {
        result.sort(
          (a, b) =>
            getSortablePrice(
              a
            ) -
            getSortablePrice(
              b
            )
        );
      }

      if (
        sort ===
        "price-high"
      ) {
        result.sort(
          (a, b) =>
            getSortablePrice(
              b
            ) -
            getSortablePrice(
              a
            )
        );
      }

      if (
        sort === "name"
      ) {
        result.sort(
          (a, b) =>
            a.name.localeCompare(
              b.name
            )
        );
      }

      return result;
    }, [
      products,
      sort,
    ]);

  const hasFilters =
    search.trim() !== "" ||
    family !== "All";

  /* =======================================================
     FILTERS
  ======================================================== */

  function handleFamilyChange(
    value: string
  ) {
    setFamily(value);
    setPage(1);
  }

  function resetFilters() {
    setSearch("");
    setDebouncedSearch("");
    setFamily("All");
    setSort(
      "recommended"
    );
    setPage(1);
  }

  /* =======================================================
     CART — BACKEND + DRAWER
  ======================================================== */

  async function addToBag(
    product: Product
  ) {
    if (
      addingProductIds.has(
        product.id
      )
    ) {
      return;
    }

    const variant =
      getPrimaryPurchasableVariant(
        product
      );

    if (!variant) {
      toast.error(
        "This fragrance is currently out of stock."
      );

      return;
    }

    const price =
      Number(
        variant.price
      );

    if (
      !Number.isFinite(
        price
      )
    ) {
      toast.error(
        "This fragrance does not have a valid price."
      );

      return;
    }

    setAddingProductIds(
      (current) => {
        const next =
          new Set(
            current
          );

        next.add(
          product.id
        );

        return next;
      }
    );

    try {
      const response =
        await cartService.add(
          variant.id,
          1
        );

      /*
       * Refresh the Navbar count from the backend.
       */
      window.dispatchEvent(
        new CustomEvent(
          CART_UPDATED_EVENT,
          {
            detail: {
              count:
                response.summary
                  .itemCount,
            },
          }
        )
      );

      /*
       * Open the responsive cart drawer after a successful add.
       */
      window.dispatchEvent(
        new CustomEvent(
          CART_DRAWER_OPEN_EVENT
        )
      );

      toast.success(
        `${product.name} added to your bag`,
        {
          description:
            `${variant.size} · ${currency.format(
              price
            )}`,
        }
      );
    } catch (
      error
    ) {
      toast.error(
        error instanceof
          Error
          ? error.message
          : "Unable to add this fragrance to your bag."
      );
    } finally {
      setAddingProductIds(
        (current) => {
          const next =
            new Set(
              current
            );

          next.delete(
            product.id
          );

          return next;
        }
      );
    }
  }

  /* =======================================================
     WISHLIST
  ======================================================== */

  function toggleWishlist(
    product: Product
  ) {
    const wishlist =
      readStorageList<StoredWishlistItem>(
        WISHLIST_STORAGE_KEY
      );

    const exists =
      wishlist.some(
        (item) =>
          item.productId ===
          product.id
      );

    const nextWishlist =
      exists
        ? wishlist.filter(
            (item) =>
              item.productId !==
              product.id
          )
        : [
            ...wishlist,
            {
              productId:
                product.id,

              slug:
                product.slug,

              name:
                product.name,

              family:
                product.family,

              concentration:
                product.concentration,

              imageUrl:
                getPrimaryImage(
                  product
                ),

              startingPrice:
                getNullableProductPrice(
                  product
                ),

              createdAt:
                new Date().toISOString(),
            },
          ];

    writeStorageList(
      WISHLIST_STORAGE_KEY,
      nextWishlist
    );

    setWishlistedIds(
      new Set(
        nextWishlist.map(
          (item) =>
            item.productId
        )
      )
    );

    dispatchCommerceEvent(
      WISHLIST_UPDATED_EVENT,
      nextWishlist.length
    );

    toast.success(
      exists
        ? `${product.name} removed from your wishlist`
        : `${product.name} saved to your wishlist`
    );
  }

  /* =======================================================
     UI
  ======================================================== */

  return (
    <>
      <section className="min-h-screen bg-[#fbfaf7] px-5 pb-24 pt-10 sm:px-8 lg:px-10 lg:pb-32 xl:px-12">
      <div className="mx-auto max-w-[1320px]">
        {/* Breadcrumb */}

        <div className="mb-10 flex items-center gap-1.5 text-[9px] !text-[#98877f]">
          <Link
            href="/"
            className="transition-colors hover:!text-[#6b2230]"
          >
            Home
          </Link>

          <span>/</span>

          <span>
            Women
          </span>
        </div>

        {/* Intro */}

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.8,
            ease: [
              0.22,
              1,
              0.36,
              1,
            ],
          }}
          className="pb-10"
        >
          <p className="mb-4 text-[9px] font-medium uppercase tracking-[0.32em] !text-[#965f5f]">
            Made to feel like you
          </p>

          <h1 className="font-display text-[50px] font-normal leading-[0.95] tracking-[-0.04em] !text-[#342725] sm:text-[62px] lg:text-[72px]">
            Fragrances for her.
          </h1>

          <p className="mt-5 max-w-[560px] text-[12px] leading-6 !text-[#8b7972] sm:text-[13px]">
            Explore active
            fragrances from the
            Élan women&apos;s
            collection.
          </p>
        </motion.div>

        <div className="h-px bg-[#dfd8d1]" />

        {/* Search + filters */}

        <div className="grid gap-3 py-5 lg:grid-cols-[1fr_180px_180px]">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 !text-[#766760]"
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
              placeholder="Search women's fragrances..."
              className="
                h-[52px]
                w-full
                bg-[#f1eeea]
                pl-11
                pr-11
                text-[11px]
                !text-[#372b28]
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
                className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center !text-[#766760]"
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
              ...knownFamilies,
            ]}
          />

          <FilterSelect
            label="Sort by"
            value={
              sort
            }
            onChange={(
              value
            ) =>
              setSort(
                value as SortOption
              )
            }
            options={[
              {
                value:
                  "recommended",
                label:
                  "Our selection",
              },
              {
                value:
                  "price-low",
                label:
                  "Price: low to high",
              },
              {
                value:
                  "price-high",
                label:
                  "Price: high to low",
              },
              {
                value:
                  "name",
                label:
                  "Name",
              },
            ]}
          />
        </div>

        <div className="h-px bg-[#dfd8d1]" />

        {/* Count */}

        <div className="flex min-h-[64px] items-center justify-between gap-5">
          <p className="text-[9px] !text-[#8f817b]">
            {
              pagination.total
            }{" "}
            {pagination.total ===
            1
              ? "fragrance"
              : "fragrances"}
          </p>

          {hasFilters ? (
            <button
              type="button"
              onClick={
                resetFilters
              }
              className="border-b border-[#6b2230] pb-1 text-[9px] font-medium !text-[#6b2230]"
            >
              Clear filters
            </button>
          ) : (
            <p className="hidden text-[9px] !text-[#9e918a] sm:block">
              Élan women&apos;s
              collection
            </p>
          )}
        </div>

        {/* Loading */}

        {loading && (
          <LoadingState />
        )}

        {/* Error */}

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

        {/* Product grid */}

        {!loading &&
        !error &&
        displayedProducts.length >
          0 ? (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},

              show: {
                transition: {
                  staggerChildren:
                    0.07,
                },
              },
            }}
            className="grid grid-cols-2 gap-x-3 gap-y-12 sm:gap-x-5 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-14"
          >
            {displayedProducts.map(
              (
                product
              ) => (
                <ProductCard
                  key={
                    product.id
                  }
                  product={
                    product
                  }
                  wishlisted={
                    wishlistedIds.has(
                      product.id
                    )
                  }
                  adding={
                    addingProductIds.has(
                      product.id
                    )
                  }
                  onAddToBag={() =>
                    void addToBag(
                      product
                    )
                  }
                  onToggleWishlist={() =>
                    toggleWishlist(
                      product
                    )
                  }
                />
              )
            )}
          </motion.div>
        ) : null}

        {/* Empty */}

        {!loading &&
          !error &&
          displayedProducts.length ===
            0 && (
            <EmptyState
              hasFilters={
                hasFilters
              }
              onClear={
                resetFilters
              }
            />
          )}

        {/* Pagination */}

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

        {/* Bottom editorial CTA */}

        <div className="mt-20 border-t border-[#ded6cf] pt-10 sm:mt-28">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-3 text-[9px] uppercase tracking-[0.28em] !text-[#9a6a5d]">
                Still discovering?
              </p>

              <h3 className="max-w-xl font-display text-3xl font-normal !text-[#392724] sm:text-4xl">
                Sometimes the right
                fragrance starts with
                a feeling.
              </h3>
            </div>

            <Link
              href="/discover"
              className="inline-flex w-fit border-b border-[#6b2230] pb-2 text-[11px] font-medium !text-[#6b2230]"
            >
              Find my scent
            </Link>
          </div>
        </div>
      </div>
      </section>

      <CartDrawer />
    </>
  );
}

/* =========================================================
   PRODUCT CARD
========================================================= */

function ProductCard({
  product,
  wishlisted,
  adding,
  onAddToBag,
  onToggleWishlist,
}: {
  product: Product;
  wishlisted: boolean;
  adding: boolean;
  onAddToBag: () => void;
  onToggleWishlist: () => void;
}) {
  const imageUrl =
    getPrimaryImage(
      product
    );

  const variant =
    getPrimaryVariant(
      product
    );

  const availableStock =
    variant
      ? getVariantAvailableStock(
          variant
        )
      : 0;

  const price =
    getNullableProductPrice(
      product
    );

  return (
    <motion.article
      variants={{
        hidden: {
          opacity: 0,
          y: 22,
        },

        show: {
          opacity: 1,
          y: 0,

          transition: {
            duration: 0.6,
            ease: [
              0.22,
              1,
              0.36,
              1,
            ],
          },
        },
      }}
      className="group/product min-w-0"
    >
      {/* Product image */}

      <div className="relative overflow-hidden bg-[#e6e2dc]">
        <Link
          href={`/perfumes/${product.slug}`}
          className="block"
          aria-label={`View ${product.name}`}
        >
          <div className="relative aspect-[4/5] overflow-hidden">
            {imageUrl ? (
              <Image
                src={
                  imageUrl
                }
                alt={`${product.name} perfume`}
                fill
                sizes="
                  (max-width: 639px) 50vw,
                  (max-width: 1023px) 50vw,
                  25vw
                "
                unoptimized
                className="
                  object-cover
                  transition-transform
                  duration-[900ms]
                  ease-[cubic-bezier(0.22,1,0.36,1)]
                  group-hover/product:scale-[1.025]
                "
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#eee9e3]">
                <Package
                  className="size-7 !text-[#aa9991]"
                  strokeWidth={
                    1.2
                  }
                />
              </div>
            )}
          </div>
        </Link>

        {product.badge && (
          <span className="absolute left-3 top-3 z-20 bg-[#fbfaf7]/95 px-2.5 py-2 text-[8px] font-medium uppercase tracking-[0.14em] !text-[#544945] backdrop-blur-sm sm:left-4 sm:top-4">
            {
              product.badge
            }
          </span>
        )}

        {/* Wishlist */}

        <button
          type="button"
          onClick={
            onToggleWishlist
          }
          aria-label={
            wishlisted
              ? `Remove ${product.name} from wishlist`
              : `Save ${product.name}`
          }
          aria-pressed={
            wishlisted
          }
          className={`
            absolute
            right-3
            top-3
            z-30
            flex
            size-9
            items-center
            justify-center
            rounded-full
            backdrop-blur-sm
            transition-all
            duration-300
            sm:right-4
            sm:top-4

            ${
              wishlisted
                ? "bg-[#6b2230] !text-white"
                : "bg-[#fbfaf7]/75 !text-[#694d46] hover:scale-110 hover:bg-white"
            }
          `}
        >
          <Heart
            className={`size-[17px] ${
              wishlisted
                ? "fill-current"
                : ""
            }`}
            strokeWidth={
              1.35
            }
          />
        </button>

        {/* Add to bag */}

        <div
          className="
            absolute
            inset-x-0
            bottom-0
            z-30
            translate-y-0
            transition-transform
            duration-500
            ease-[cubic-bezier(0.22,1,0.36,1)]
            md:translate-y-full
            md:group-hover/product:translate-y-0
            md:group-focus-within/product:translate-y-0
          "
        >
          <button
            type="button"
            disabled={
              !variant ||
              availableStock <= 0 ||
              adding
            }
            onClick={
              onAddToBag
            }
            className="
              group/bag
              flex
              h-[50px]
              w-full
              items-center
              justify-between
              bg-[#fbfaf7]/95
              px-4
              text-[11px]
              font-medium
              !text-[#382925]
              backdrop-blur
              transition-colors
              hover:bg-white
              disabled:cursor-not-allowed
              disabled:opacity-65
              sm:h-[52px]
              sm:px-5
            "
          >
            <span>
              {adding
                ? "Adding..."
                : availableStock >
                    0
                  ? "Add to bag"
                  : "Out of stock"}
            </span>

            {adding ? (
              <LoaderCircle
                className="size-4 animate-spin"
                strokeWidth={
                  1.4
                }
              />
            ) : (
              <ShoppingBag
                className="size-4"
                strokeWidth={
                  1.4
                }
              />
            )}
          </button>
        </div>
      </div>

      {/* Info */}

      <div className="pt-4">
        <div className="mb-2.5 flex items-start justify-between gap-2">
          <p className="min-w-0 truncate text-[8px] font-medium uppercase tracking-[0.15em] !text-[#9a756c] sm:text-[9px]">
            {
              product.family
            }{" "}
            ·{" "}
            {
              product.concentration
            }
          </p>

          {variant && (
            <span className="shrink-0 text-[8px] tracking-[0.1em] !text-[#9a756c] sm:text-[9px]">
              {
                variant.size
              }
            </span>
          )}
        </div>

        <Link
          href={`/perfumes/${product.slug}`}
        >
          <h2 className="font-display text-[23px] font-normal leading-none tracking-[-0.02em] !text-[#382321] transition-opacity hover:opacity-60 sm:text-[27px]">
            {
              product.name
            }
          </h2>
        </Link>

        {product.shortDescription && (
          <p className="mt-2.5 hidden text-[11px] leading-5 !text-[#8c7871] sm:block">
            {
              product.shortDescription
            }
          </p>
        )}

        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-[11px] font-medium !text-[#382824] sm:text-[12px]">
            {price !== null
              ? currency.format(
                  price
                )
              : "Price unavailable"}
          </p>

          <span className="text-[8px] !text-[#9a8279]">
            {formatAudience(
              product.audience
            )}
          </span>
        </div>
      </div>
    </motion.article>
  );
}

/* =========================================================
   FILTER SELECT
========================================================= */

type DetailedOption = {
  value: string;
  label: string;
};

type FilterSelectProps = {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  options: Array<
    string | DetailedOption
  >;
};

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: FilterSelectProps) {
  return (
    <label className="relative flex h-[52px] flex-col justify-center border-b border-[#d8d0ca] px-3">
      <span className="text-[8px] !text-[#86746d]">
        {label}
      </span>

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
        className="
          mt-0.5
          w-full
          appearance-none
          bg-transparent
          pr-6
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
        className="pointer-events-none absolute bottom-[9px] right-2 size-3.5 !text-[#54443f]"
        strokeWidth={
          1.4
        }
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
  if (
    pages <= 1
  ) {
    return null;
  }

  function changePage(
    nextPage: number
  ) {
    onPageChange(
      nextPage
    );

    window.scrollTo({
      top: 0,
      behavior:
        "smooth",
    });
  }

  return (
    <div className="mt-14 flex items-center justify-between border-t border-[#dfd8d1] pt-6">
      <button
        type="button"
        disabled={
          page <= 1
        }
        onClick={() =>
          changePage(
            page - 1
          )
        }
        className="inline-flex items-center gap-2 text-[9px] font-medium !text-[#5a1425] disabled:cursor-not-allowed disabled:opacity-30"
      >
        <ArrowLeft
          className="size-3"
          strokeWidth={
            1.4
          }
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
          changePage(
            page + 1
          )
        }
        className="inline-flex items-center gap-2 text-[9px] font-medium !text-[#5a1425] disabled:cursor-not-allowed disabled:opacity-30"
      >
        Next

        <ArrowRight
          className="size-3"
          strokeWidth={
            1.4
          }
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
    <div className="flex min-h-[420px] flex-col items-center justify-center">
      <LoaderCircle
        className="size-5 animate-spin !text-[#5a1425]"
        strokeWidth={
          1.4
        }
      />

      <p className="mt-4 text-[9px] !text-[#88766f]">
        Loading women&apos;s
        fragrances...
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
    <div className="flex min-h-[420px] flex-col items-center justify-center px-6 text-center">
      <p className="text-[8px] uppercase tracking-[0.24em] !text-[#a1625b]">
        Collection unavailable
      </p>

      <h2 className="mt-4 font-display text-[32px] !text-[#382724]">
        We couldn&apos;t load
        the women&apos;s collection.
      </h2>

      <p className="mt-3 max-w-md text-[9px] leading-5 !text-[#88766f]">
        {message}
      </p>

      <button
        type="button"
        onClick={
          onRetry
        }
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
    <div className="flex min-h-[380px] flex-col items-center justify-center text-center">
      <p className="font-display text-[38px] !text-[#3d2926]">
        {hasFilters
          ? "Nothing matched that feeling."
          : "No women's fragrances yet."}
      </p>

      <p className="mt-3 max-w-md text-[12px] leading-6 !text-[#8d7b74]">
        {hasFilters
          ? "Try another fragrance family or search term."
          : "Active products with the Women audience will appear here."}
      </p>

      {hasFilters && (
        <button
          type="button"
          onClick={
            onClear
          }
          className="mt-6 border-b border-[#6b2230] pb-1 text-[11px] font-medium !text-[#6b2230]"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

/* =========================================================
   PRODUCT HELPERS
========================================================= */

function getPrimaryVariant(
  product: Product
) {
  return (
    product.variants?.find(
      (variant) =>
        variant.active &&
        getVariantAvailableStock(
          variant
        ) > 0
    ) ??
    product.variants?.find(
      (variant) =>
        variant.active
    ) ??
    product.variants?.[0] ??
    null
  );
}

function getPrimaryPurchasableVariant(
  product: Product
) {
  return (
    product.variants?.find(
      (variant) =>
        variant.active &&
        getVariantAvailableStock(
          variant
        ) > 0
    ) ??
    null
  );
}

function getVariantAvailableStock(
  variant:
    Product["variants"][number]
) {
  return Math.max(
    0,
    variant.stock -
      (
        variant.reservedStock ??
        0
      )
  );
}

function getPrimaryImage(
  product: Product
): string | null {
  const image =
    product.images?.[0];

  if (
    !image?.url
  ) {
    return null;
  }

  const url =
    image.url.trim();

  return url || null;
}

function getNullableProductPrice(
  product: Product
): number | null {
  if (
    typeof product.startingPrice ===
      "number" &&
    Number.isFinite(
      product.startingPrice
    )
  ) {
    return product.startingPrice;
  }

  const variant =
    getPrimaryVariant(
      product
    );

  if (!variant) {
    return null;
  }

  const price =
    Number(
      variant.price
    );

  return Number.isFinite(
    price
  )
    ? price
    : null;
}

function getSortablePrice(
  product: Product
) {
  return (
    getNullableProductPrice(
      product
    ) ??
    Number.POSITIVE_INFINITY
  );
}

function formatAudience(
  audience:
    | "WOMEN"
    | "MEN"
    | "UNISEX"
) {
  if (
    audience ===
    "WOMEN"
  ) {
    return "Women";
  }

  if (
    audience ===
    "MEN"
  ) {
    return "Men";
  }

  return "Unisex";
}

/* =========================================================
   STORAGE HELPERS
========================================================= */

function readStorageList<T>(
  key: string
): T[] {
  if (
    typeof window ===
    "undefined"
  ) {
    return [];
  }

  try {
    const raw =
      window.localStorage.getItem(
        key
      );

    if (!raw) {
      return [];
    }

    const parsed =
      JSON.parse(
        raw
      );

    return Array.isArray(
      parsed
    )
      ? (parsed as T[])
      : [];
  } catch {
    return [];
  }
}

function writeStorageList<T>(
  key: string,
  value: T[]
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  window.localStorage.setItem(
    key,
    JSON.stringify(
      value
    )
  );
}

function dispatchCommerceEvent(
  eventName: string,
  count: number
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(
      eventName,
      {
        detail: {
          count,
        },
      }
    )
  );
}
