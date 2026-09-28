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
  Search,
  ShoppingBag,
  Store,
  X,
} from "lucide-react";

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

type AudienceFilter =
  | "ALL"
  | "WOMEN"
  | "MEN"
  | "UNISEX";

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

const PAGE_SIZE = 24;

const WISHLIST_STORAGE_KEY =
  "elan_wishlist";

const WISHLIST_UPDATED_EVENT =
  "elan:wishlist-updated";

/* =========================================================
   PAGE
========================================================= */

export function ShopPage() {
  const [products, setProducts] =
    useState<Product[]>([]);

  const [search, setSearch] =
    useState("");

  const [
    debouncedSearch,
    setDebouncedSearch,
  ] = useState("");

  const [family, setFamily] =
    useState("All");

  const [
    audience,
    setAudience,
  ] =
    useState<AudienceFilter>(
      "ALL"
    );

  const [sort, setSort] =
    useState<SortOption>(
      "recommended"
    );

  const [page, setPage] =
    useState(1);

  const [
    pagination,
    setPagination,
  ] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    pages: 1,
  });

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(
      null
    );

  const [
    wishlistedIds,
    setWishlistedIds,
  ] = useState<Set<string>>(
    () => new Set()
  );

  const [
    addingProductIds,
    setAddingProductIds,
  ] = useState<Set<string>>(
    () => new Set()
  );

  /* =======================================================
     WISHLIST STATE
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
     LOAD PRODUCTS FROM NESTJS
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

              ...(audience !==
              "ALL"
                ? {
                    audience,
                  }
                : {}),
            }
          )) as PublicProductsResponse;

        setProducts(
          response.data ??
            []
        );

        setPagination(
          response.pagination
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to load fragrances.";

        setError(message);

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
      audience,
    ]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  /* =======================================================
     DISPLAY SORT

     Backend currently returns newest products first.
     Price/name sorting here applies to the current
     backend result page.
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
            getProductPrice(
              a
            ) -
            getProductPrice(
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
            getProductPrice(
              b
            ) -
            getProductPrice(
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
    family !== "All" ||
    audience !== "ALL";

  function clearFilters() {
    setSearch("");
    setDebouncedSearch("");
    setFamily("All");
    setAudience("ALL");
    setSort(
      "recommended"
    );
    setPage(1);
  }

  function handleFamilyChange(
    value: string
  ) {
    setFamily(value);
    setPage(1);
  }

  function handleAudienceChange(
    value: string
  ) {
    setAudience(
      value as AudienceFilter
    );

    setPage(1);
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
                getProductImageUrl(
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
     ADD TO BAG — BACKEND
  ======================================================== */

  async function handleAddToBag(
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
      getPurchasableVariant(
        product
      );

    if (!variant) {
      toast.error(
        "This fragrance is currently out of stock."
      );

      return;
    }

    setAddingProductIds(
      (
        current
      ) => {
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
       * Keep the Navbar badge synchronized with the
       * authoritative cart returned by NestJS.
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
       * Open the global cart drawer immediately after
       * a successful backend add.
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
              Number(
                variant.price
              )
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
        (
          current
        ) => {
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
     UI
  ======================================================== */

  return (
    <>
      <section className="min-h-screen bg-[#fbfaf7] px-5 pb-24 pt-10 sm:px-8 lg:px-10 lg:pb-32 xl:px-12">
      <div className="mx-auto max-w-[1320px]">
        {/* BREADCRUMB */}

        <div className="mb-10 flex items-center gap-1.5 text-[9px] text-[#98877f]">
          <Link
            href="/"
            className="transition-colors hover:text-[#5d2932]"
          >
            Home
          </Link>

          <span>/</span>

          <span>
            Collection
          </span>
        </div>

        {/* HEADING */}

        <div className="pb-10">
          <p className="mb-4 text-[9px] font-medium uppercase tracking-[0.32em] !text-[#8f6258]">
            Find something that stays
            with you
          </p>

          <h1 className="font-display text-[44px] font-normal leading-none tracking-[-0.035em] !text-[#342725] sm:text-5xl lg:text-[64px]">
            The fragrance collection.
          </h1>

          <p className="mt-5 text-[12px] leading-6 !text-[#8b7972]">
            Different notes. Different
            moods. One that feels like
            you.
          </p>
        </div>

        <div className="h-px bg-[#dfd8d1]" />

        {/* =====================================================
            SEARCH + FILTERS
        ====================================================== */}

        <div className="grid gap-3 py-5 lg:grid-cols-[1fr_160px_140px_160px]">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#766760]"
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
              placeholder="Search fragrances..."
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
            label="For"
            value={
              audience
            }
            onChange={
              handleAudienceChange
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
                  "WOMEN",
                label:
                  "Women",
              },
              {
                value:
                  "MEN",
                label:
                  "Men",
              },
              {
                value:
                  "UNISEX",
                label:
                  "Unisex",
              },
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
                  "Newest",
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

        {/* RESULT META */}

        <div className="flex min-h-[64px] items-center justify-between gap-5">
          <p className="text-[9px] !text-[#8f817b]">
            {pagination.total}{" "}
            {pagination.total ===
            1
              ? "fragrance"
              : "fragrances"}
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
            <p className="hidden text-[9px] !text-[#9e918a] sm:block">
              Élan collection
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

        {/* PRODUCT GRID */}

        {!loading &&
          !error &&
          displayedProducts.length >
            0 && (
            <div className="grid grid-cols-2 gap-x-3 gap-y-12 sm:gap-x-5 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-14">
              {displayedProducts.map(
                (product) => (
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
                    onToggleWishlist={() =>
                      toggleWishlist(
                        product
                      )
                    }
                    adding={
                      addingProductIds.has(
                        product.id
                      )
                    }
                    onAddToBag={() =>
                      void handleAddToBag(
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
          displayedProducts.length ===
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
  onToggleWishlist,
  onAddToBag,
}: {
  product: Product;
  wishlisted: boolean;
  adding: boolean;
  onToggleWishlist: () => void;
  onAddToBag: () => void;
}) {
  const imageUrl =
    getProductImageUrl(
      product
    );

  const primaryVariant =
    getPrimaryVariant(
      product
    );

  const purchasableVariant =
    getPurchasableVariant(
      product
    );

  const availableStock =
    purchasableVariant
      ? getVariantAvailableStock(
          purchasableVariant
        )
      : 0;

  const price =
    getProductPrice(
      product
    );

  return (
    <article className="group/product min-w-0">
      <div className="relative overflow-hidden bg-[#e6e2dc]">
        <Link
          href={`/perfumes/${product.slug}`}
          aria-label={`View ${product.name}`}
          className="block"
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
                <Store
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
          <span className="absolute left-3 top-3 z-20 bg-[#fbfaf7]/95 px-2.5 py-2 text-[8px] font-medium uppercase tracking-[0.14em] !text-[#544945] backdrop-blur sm:left-4 sm:top-4">
            {
              product.badge
            }
          </span>
        )}

        {/* WISHLIST */}

        <button
          type="button"
          onClick={
            onToggleWishlist
          }
          aria-label={
            wishlisted
              ? `Remove ${product.name} from wishlist`
              : `Save ${product.name} to wishlist`
          }
          aria-pressed={
            wishlisted
          }
          title={
            wishlisted
              ? "Remove from wishlist"
              : "Add to wishlist"
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
            backdrop-blur
            transition-all
            duration-300
            sm:right-4
            sm:top-4

            ${
              wishlisted
                ? "bg-[#6b2230] !text-white"
                : "bg-[#fbfaf7]/85 !text-[#694d46] hover:scale-110 hover:bg-white"
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

        {/* PRODUCT CTA */}

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
              !purchasableVariant ||
              availableStock <=
                0 ||
              adding
            }
            onClick={
              onAddToBag
            }
            className="
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
                : purchasableVariant &&
                    availableStock >
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

      <div className="pt-4">
        <div className="mb-2.5 flex items-start justify-between gap-2">
          <p className="min-w-0 truncate text-[8px] font-medium uppercase tracking-[0.15em] !text-[#9a756c] sm:text-[9px]">
            {product.family} ·{" "}
            {
              product.concentration
            }
          </p>

          {primaryVariant && (
            <span className="shrink-0 text-[8px] tracking-[0.1em] !text-[#9a756c] sm:text-[9px]">
              {
                primaryVariant.size
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
            {Number.isFinite(
              price
            )
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
    </article>
  );
}

/* =========================================================
   FILTER SELECT
========================================================= */

type SimpleOption =
  string;

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
    | SimpleOption
    | DetailedOption
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
        Loading fragrances...
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
        the fragrances.
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
    <div className="flex min-h-[420px] flex-col items-center justify-center px-6 text-center">
      <p className="font-display text-3xl !text-[#3d2926]">
        {hasFilters
          ? "Nothing matched that feeling."
          : "The collection is being prepared."}
      </p>

      <p className="mt-3 max-w-md text-[12px] leading-6 !text-[#8d7b74]">
        {hasFilters
          ? "Try another fragrance family, audience or search term."
          : "There are no active fragrances available right now."}
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
   HELPERS
========================================================= */

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

function getPrimaryVariant(
  product: Product
) {
  return (
    product.variants?.find(
      (
        variant
      ) =>
        variant.active
    ) ??
    product.variants?.[0] ??
    null
  );
}

function getPurchasableVariant(
  product: Product
) {
  return (
    product.variants?.find(
      (
        variant
      ) =>
        variant.active &&
        getVariantAvailableStock(
          variant
        ) >
          0
    ) ??
    null
  );
}

function getProductImageUrl(
  product: Product
): string | null {
  const image =
    product.images?.[0];

  if (!image) {
    return null;
  }

  const url =
    image.url?.trim();

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

  const rawPrice =
    product.variants?.[0]
      ?.price;

  const price =
    Number(
      rawPrice
    );

  return Number.isFinite(
    price
  )
    ? price
    : null;
}

function getProductPrice(
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
    audience === "MEN"
  ) {
    return "Men";
  }

  return "Unisex";
}

/* =========================================================
   WISHLIST STORAGE
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
