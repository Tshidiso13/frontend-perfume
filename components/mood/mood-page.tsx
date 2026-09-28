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
  useSearchParams,
} from "next/navigation";

import {
  ArrowLeft,
  Heart,
  LoaderCircle,
  Package,
  Search,
  ShoppingBag,
  X,
} from "lucide-react";

import {
  toast,
} from "sonner";

import {
  productsService,
  type Product,
} from "@/services/products.service";

import {
  SCENT_MOOD_OPTIONS,
  type ScentMood,
} from "@/lib/scent-finder-options";

/* =========================================================
   TYPES
========================================================= */

type PublicProductsResponse = {
  data: Product[];

  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

type StoredCartItem = {
  id: string;
  productId: string;
  variantId: string;
  slug: string;
  name: string;
  size: string;
  sku: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
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

const CART_STORAGE_KEY =
  "elan_cart";

const WISHLIST_STORAGE_KEY =
  "elan_wishlist";

const CART_UPDATED_EVENT =
  "elan:cart-updated";

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

export function MoodPage() {
  const searchParams =
    useSearchParams();

  const mood =
    parseMood(
      searchParams.get(
        "mood"
      )
    );

  const [
    products,
    setProducts,
  ] = useState<Product[]>([]);

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
    search,
    setSearch,
  ] = useState("");

  const [
    debouncedSearch,
    setDebouncedSearch,
  ] = useState("");

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
    wishlistedIds,
    setWishlistedIds,
  ] = useState<
    Set<string>
  >(() => new Set());

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
     SEARCH
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

    return () =>
      window.clearTimeout(
        timer
      );
  }, [search]);

  /* =======================================================
     LOAD PRODUCTS BY MOOD
  ======================================================== */

  const loadProducts =
    useCallback(async () => {
      if (!mood) {
        setProducts([]);
        setPagination({
          page: 1,
          limit: PAGE_SIZE,
          total: 0,
          pages: 1,
        });
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response =
          (await productsService.getPublicProducts(
            {
              page,
              limit: PAGE_SIZE,
              mood,

              ...(debouncedSearch
                ? {
                    search:
                      debouncedSearch,
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

        setError(
          message
        );
      } finally {
        setLoading(
          false
        );
      }
    }, [
      mood,
      page,
      debouncedSearch,
    ]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  /* =======================================================
     MOOD META
  ======================================================== */

  const moodOption =
    useMemo(
      () =>
        mood
          ? SCENT_MOOD_OPTIONS.find(
              (item) =>
                item.value ===
                mood
            ) ??
            null
          : null,
      [mood]
    );

  /* =======================================================
     ADD TO BAG
  ======================================================== */

  function handleAddToBag(
    product: Product
  ) {
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

    const availableStock =
      getVariantAvailableStock(
        variant
      );

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

    const cart =
      readStorageList<StoredCartItem>(
        CART_STORAGE_KEY
      );

    const id =
      `${product.id}:${variant.id}`;

    const index =
      cart.findIndex(
        (item) =>
          item.id === id
      );

    if (
      index >= 0
    ) {
      if (
        cart[index]
          .quantity >=
        availableStock
      ) {
        toast.error(
          `Only ${availableStock} ${
            availableStock === 1
              ? "unit is"
              : "units are"
          } available in ${variant.size}.`
        );

        return;
      }

      cart[index] = {
        ...cart[index],
        price,
        quantity:
          cart[index]
            .quantity +
          1,
      };
    } else {
      cart.push({
        id,
        productId:
          product.id,
        variantId:
          variant.id,
        slug:
          product.slug,
        name:
          product.name,
        size:
          variant.size,
        sku:
          variant.sku,
        price,
        quantity: 1,
        imageUrl:
          getPrimaryImage(
            product
          ),
      });
    }

    writeStorageList(
      CART_STORAGE_KEY,
      cart
    );

    dispatchCommerceEvent(
      CART_UPDATED_EVENT,
      cart.reduce(
        (
          total,
          item
        ) =>
          total +
          item.quantity,
        0
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
     INVALID MOOD
  ======================================================== */

  if (!mood || !moodOption) {
    return (
      <section className="min-h-screen bg-[#fbfaf7] px-5 py-20 sm:px-8 lg:px-10">
        <div className="mx-auto flex min-h-[520px] max-w-[900px] flex-col items-center justify-center text-center">
          <p className="text-[9px] font-medium uppercase tracking-[0.28em] !text-[#9a6f66]">
            Mood collection
          </p>

          <h1 className="mt-5 font-display text-[46px] leading-none !text-[#382724] sm:text-[58px]">
            Choose a feeling first.
          </h1>

          <p className="mt-5 max-w-md text-[11px] leading-6 !text-[#89766f]">
            Select a mood from the homepage to discover fragrances that were configured for that feeling.
          </p>

          <Link
            href="/"
            className="mt-8 inline-flex items-center gap-3 border-b border-[#6b2230] pb-2 text-[10px] font-medium !text-[#6b2230]"
          >
            <ArrowLeft
              className="size-3.5"
              strokeWidth={
                1.4
              }
            />
            Back home
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#fbfaf7] px-5 pb-24 pt-10 sm:px-8 lg:px-10 lg:pb-32 xl:px-12">
      <div className="mx-auto max-w-[1320px]">
        {/* BREADCRUMB */}

        <div className="mb-10 flex items-center gap-1.5 text-[9px] !text-[#98877f]">
          <Link
            href="/"
            className="transition-colors hover:!text-[#6b2230]"
          >
            Home
          </Link>

          <span>/</span>

          <span>
            Mood
          </span>

          <span>/</span>

          <span>
            {
              moodOption.label
            }
          </span>
        </div>

        {/* HEADING */}

        <div className="pb-10">
          <p className="mb-4 text-[9px] font-medium uppercase tracking-[0.32em] !text-[#8f6258]">
            Follow a feeling
          </p>

          <h1 className="font-display text-[44px] font-normal leading-none tracking-[-0.035em] !text-[#342725] sm:text-5xl lg:text-[64px]">
            {
              moodOption.label
            }.
          </h1>

          <p className="mt-5 max-w-xl text-[12px] leading-6 !text-[#8b7972]">
            Fragrances selected from the live catalogue because their Scent Finder profile includes{" "}
            <span className="font-medium !text-[#5a1425]">
              {
                moodOption.label
              }
            </span>
            .
          </p>
        </div>

        <div className="h-px bg-[#dfd8d1]" />

        {/* SEARCH */}

        <div className="py-5">
          <div className="relative max-w-[760px]">
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
                  event.target.value
                )
              }
              placeholder={`Search ${moodOption.label.toLowerCase()} fragrances...`}
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
        </div>

        <div className="h-px bg-[#dfd8d1]" />

        {/* META */}

        <div className="flex min-h-[64px] items-center justify-between">
          <p className="text-[9px] !text-[#8f817b]">
            {
              pagination.total
            }{" "}
            {pagination.total ===
            1
              ? "fragrance"
              : "fragrances"}
          </p>

          <Link
            href="/"
            className="hidden border-b border-[#6b2230] pb-1 text-[9px] font-medium !text-[#6b2230] sm:inline-flex"
          >
            Choose another mood
          </Link>
        </div>

        {/* LOADING */}

        {loading && (
          <div className="flex min-h-[420px] flex-col items-center justify-center">
            <LoaderCircle
              className="size-5 animate-spin !text-[#6b2230]"
              strokeWidth={
                1.4
              }
            />

            <p className="mt-4 text-[9px] !text-[#88766f]">
              Loading fragrances...
            </p>
          </div>
        )}

        {/* ERROR */}

        {!loading &&
          error && (
            <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
              <p className="font-display text-[34px] !text-[#382724]">
                We couldn&apos;t load this mood.
              </p>

              <p className="mt-3 max-w-md text-[10px] leading-5 !text-[#88766f]">
                {
                  error
                }
              </p>

              <button
                type="button"
                onClick={
                  loadProducts
                }
                className="mt-6 bg-[#5a1425] px-6 py-3 text-[9px] font-medium !text-white"
              >
                Try again
              </button>
            </div>
          )}

        {/* PRODUCTS */}

        {!loading &&
          !error &&
          products.length >
            0 && (
            <div className="grid grid-cols-2 gap-x-3 gap-y-12 sm:gap-x-5 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-14">
              {products.map(
                (
                  product
                ) => (
                  <MoodProductCard
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
                    onWishlist={() =>
                      toggleWishlist(
                        product
                      )
                    }
                    onAddToBag={() =>
                      handleAddToBag(
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
            <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
              <p className="font-display text-[38px] !text-[#3d2926] sm:text-[46px]">
                Nothing matches this mood yet.
              </p>

              <p className="mt-4 max-w-md text-[11px] leading-6 !text-[#8d7b74]">
                No active fragrance is currently configured with{" "}
                <span className="font-medium">
                  {
                    moodOption.label
                  }
                </span>
                . You can assign this mood from the admin product editor.
              </p>

              <Link
                href="/shop"
                className="mt-8 border-b border-[#6b2230] pb-2 text-[10px] font-medium !text-[#6b2230]"
              >
                Browse all fragrances
              </Link>
            </div>
          )}

        {/* PAGINATION */}

        {!loading &&
          !error &&
          pagination.pages >
            1 && (
            <div className="mt-14 flex items-center justify-between border-t border-[#dfd8d1] pt-6">
              <button
                type="button"
                disabled={
                  page <= 1
                }
                onClick={() =>
                  setPage(
                    (
                      current
                    ) =>
                      Math.max(
                        1,
                        current -
                          1
                      )
                  )
                }
                className="text-[9px] font-medium !text-[#6b2230] disabled:opacity-30"
              >
                Previous
              </button>

              <p className="text-[8px] uppercase tracking-[0.15em] !text-[#927f77]">
                Page{" "}
                {
                  pagination.page
                }{" "}
                of{" "}
                {
                  pagination.pages
                }
              </p>

              <button
                type="button"
                disabled={
                  page >=
                  pagination.pages
                }
                onClick={() =>
                  setPage(
                    (
                      current
                    ) =>
                      Math.min(
                        pagination.pages,
                        current +
                          1
                      )
                  )
                }
                className="text-[9px] font-medium !text-[#6b2230] disabled:opacity-30"
              >
                Next
              </button>
            </div>
          )}
      </div>
    </section>
  );
}

/* =========================================================
   CARD
========================================================= */

function MoodProductCard({
  product,
  wishlisted,
  onWishlist,
  onAddToBag,
}: {
  product: Product;
  wishlisted: boolean;
  onWishlist: () => void;
  onAddToBag: () => void;
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
    <article className="group/product min-w-0">
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
                className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/product:scale-[1.025]"
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
          <span className="absolute left-3 top-3 z-20 bg-[#fbfaf7]/95 px-2.5 py-2 text-[8px] font-medium uppercase tracking-[0.14em] !text-[#544945] backdrop-blur sm:left-4 sm:top-4">
            {
              product.badge
            }
          </span>
        )}

        <button
          type="button"
          onClick={
            onWishlist
          }
          aria-label={
            wishlisted
              ? `Remove ${product.name} from wishlist`
              : `Save ${product.name} to wishlist`
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
            backdrop-blur
            transition

            ${
              wishlisted
                ? "bg-[#6b2230] !text-white"
                : "bg-[#fbfaf7]/85 !text-[#6b2230]"
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

        <div className="absolute inset-x-0 bottom-0 z-30 translate-y-0 transition-transform duration-500 md:translate-y-full md:group-hover/product:translate-y-0 md:group-focus-within/product:translate-y-0">
          <button
            type="button"
            disabled={
              !variant ||
              availableStock <= 0
            }
            onClick={
              onAddToBag
            }
            className="flex h-[50px] w-full items-center justify-between bg-[#fbfaf7]/95 px-4 text-[11px] font-medium !text-[#382925] backdrop-blur hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 sm:h-[52px] sm:px-5"
          >
            <span>
              {availableStock >
              0
                ? "Add to bag"
                : "Out of stock"}
            </span>

            <ShoppingBag
              className="size-4"
              strokeWidth={
                1.4
              }
            />
          </button>
        </div>
      </div>

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

        <p className="mt-3 text-[11px] font-medium !text-[#382824] sm:text-[12px]">
          {price !== null
            ? currency.format(
                price
              )
            : "Price unavailable"}
        </p>
      </div>
    </article>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function parseMood(
  value: string | null
): ScentMood | null {
  if (
    value ===
      "fresh" ||
    value ===
      "warm" ||
    value ===
      "dark" ||
    value ===
      "soft"
  ) {
    return value;
  }

  return null;
}

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

  if (!image?.url) {
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
