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
  ChevronDown,
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

import type {
  Product,
} from "@/services/products.service";

import {
  cartService,
} from "@/services/cart.service";

import {
  wishlistService,
  type WishlistItem,
} from "@/services/wishlist.service";

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

/* =========================================================
   CONSTANTS
========================================================= */

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

export function WishlistPage() {
  const [
    items,
    setItems,
  ] = useState<
    WishlistItem[]
  >([]);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    family,
    setFamily,
  ] = useState("All");

  const [
    audience,
    setAudience,
  ] =
    useState<AudienceFilter>(
      "ALL"
    );

  const [
    sort,
    setSort,
  ] =
    useState<SortOption>(
      "recommended"
    );

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
    removingIds,
    setRemovingIds,
  ] = useState<
    Set<string>
  >(() => new Set());

  const [
    addingIds,
    setAddingIds,
  ] = useState<
    Set<string>
  >(() => new Set());

  /* =======================================================
     LOAD WISHLIST

     wishlistService.getWishlist() now decides where the data
     comes from:

     - authenticated customer -> PostgreSQL
     - guest -> localStorage
     - authenticated customer with old guest wishlist ->
       sync guest IDs into PostgreSQL, then clear localStorage
       only after a successful sync
  ======================================================== */

  const loadWishlist =
    useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        const response =
          await wishlistService.getWishlist();

        setItems(
          response.data ??
            []
        );

        dispatchCommerceEvent(
          WISHLIST_UPDATED_EVENT,
          response.total ??
            response.data.length
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to load your wishlist.";

        setError(
          message
        );
      } finally {
        setLoading(
          false
        );
      }
    }, []);

  useEffect(() => {
    void loadWishlist();
  }, [loadWishlist]);

  /* =======================================================
     FILTER DATA
  ======================================================== */

  const families =
    useMemo(() => {
      return [
        ...new Set(
          items
            .map(
              (item) =>
                item.product.family
                  ?.trim()
            )
            .filter(
              (
                value
              ): value is string =>
                Boolean(
                  value
                )
            )
        ),
      ].sort(
        (a, b) =>
          a.localeCompare(
            b
          )
      );
    }, [items]);

  const filteredItems =
    useMemo(() => {
      let result = [
        ...items,
      ];

      const term =
        search
          .trim()
          .toLowerCase();

      if (term) {
        result =
          result.filter(
            ({
              product,
            }) =>
              [
                product.name,
                product.family,
                product.shortDescription,
                product.story,
                product.concentration,
                product.feeling,
                product.season,
                ...(product.topNotes ??
                  []),
                ...(product.heartNotes ??
                  []),
                ...(product.baseNotes ??
                  []),
              ]
                .filter(
                  Boolean
                )
                .join(" ")
                .toLowerCase()
                .includes(
                  term
                )
          );
      }

      if (
        family !==
        "All"
      ) {
        result =
          result.filter(
            ({
              product,
            }) =>
              product.family ===
              family
          );
      }

      if (
        audience !==
        "ALL"
      ) {
        result =
          result.filter(
            ({
              product,
            }) =>
              product.audience ===
              audience
          );
      }

      if (
        sort ===
        "price-low"
      ) {
        result.sort(
          (a, b) =>
            comparePrices(
              a.product,
              b.product,
              "asc"
            )
        );
      }

      if (
        sort ===
        "price-high"
      ) {
        result.sort(
          (a, b) =>
            comparePrices(
              a.product,
              b.product,
              "desc"
            )
        );
      }

      if (
        sort ===
        "name"
      ) {
        result.sort(
          (a, b) =>
            a.product.name.localeCompare(
              b.product.name
            )
        );
      }

      return result;
    }, [
      items,
      search,
      family,
      audience,
      sort,
    ]);

  /* =======================================================
     ADD TO BAG

     cartService now handles both:
     - signed-in database cart
     - guest localStorage cart
  ======================================================== */

  async function handleAddToBag(
    product: Product
  ) {
    if (
      addingIds.has(
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

    setAddingIds(
      (current) =>
        new Set(
          current
        ).add(
          product.id
        )
    );

    try {
      const response =
        await cartService.add(
          variant.id,
          1
        );

      dispatchCommerceEvent(
        CART_UPDATED_EVENT,
        response.summary.itemCount
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
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : `Unable to add ${product.name} to your bag.`
      );
    } finally {
      setAddingIds(
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
     REMOVE FROM WISHLIST

     wishlistService.remove() handles:
     - signed-in database wishlist
     - guest localStorage wishlist
  ======================================================== */

  async function handleRemoveFromWishlist(
    product: Product
  ) {
    if (
      removingIds.has(
        product.id
      )
    ) {
      return;
    }

    setRemovingIds(
      (current) =>
        new Set(
          current
        ).add(
          product.id
        )
    );

    try {
      const response =
        await wishlistService.remove(
          product.id
        );

      setItems(
        (current) => {
          const next =
            current.filter(
              (item) =>
                item.product.id !==
                product.id
            );

          dispatchCommerceEvent(
            WISHLIST_UPDATED_EVENT,
            next.length
          );

          return next;
        }
      );

      toast.success(
        response.message ||
          `${product.name} removed from wishlist`
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to remove fragrance from your wishlist."
      );
    } finally {
      setRemovingIds(
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

  function resetFilters() {
    setSearch("");
    setFamily("All");
    setAudience("ALL");
    setSort(
      "recommended"
    );
  }

  const wishlistIsEmpty =
    items.length === 0;

  const hasFilters =
    search.trim() !== "" ||
    family !== "All" ||
    audience !== "ALL";

  /* =======================================================
     UI
  ======================================================== */

  return (
    <section className="min-h-screen bg-[#fbfaf7] px-5 pb-24 pt-10 sm:px-8 lg:px-10 lg:pb-32 xl:px-12">
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-10 flex items-center gap-1.5 text-[9px] !text-[#98877f]">
          <Link
            href="/"
            className="transition-colors hover:!text-[#6b2230]"
          >
            Home
          </Link>

          <span>/</span>

          <span>
            Wishlist
          </span>
        </div>

        <div className="pb-10">
          <p className="mb-4 text-[9px] font-medium uppercase tracking-[0.32em] !text-[#8f6258]">
            Saved for later
          </p>

          <h1 className="font-display text-[44px] font-normal leading-none tracking-[-0.035em] !text-[#342725] sm:text-5xl lg:text-[64px]">
            Your little obsessions.
          </h1>

          <p className="mt-5 text-[12px] leading-6 !text-[#8b7972]">
            Fragrances you&apos;ve saved for later.
          </p>
        </div>

        <div className="h-px bg-[#dfd8d1]" />

        {/* LOADING */}

        {loading && (
          <div className="flex min-h-[460px] flex-col items-center justify-center">
            <LoaderCircle
              className="size-5 animate-spin !text-[#6b2230]"
              strokeWidth={
                1.4
              }
            />

            <p className="mt-4 text-[9px] !text-[#88766f]">
              Loading your wishlist...
            </p>
          </div>
        )}

        {/* ERROR */}

        {!loading &&
          error && (
            <div className="flex min-h-[460px] flex-col items-center justify-center px-6 text-center">
              <Heart
                className="size-6 !text-[#8a5e59]"
                strokeWidth={
                  1.3
                }
              />

              <h2 className="mt-5 font-display text-[34px] !text-[#382724]">
                We couldn&apos;t load
                your wishlist.
              </h2>

              <p className="mt-3 max-w-md text-[10px] leading-5 !text-[#88766f]">
                {error}
              </p>

              <button
                type="button"
                onClick={
                  loadWishlist
                }
                className="mt-7 bg-[#5a1425] px-6 py-3 text-[9px] font-medium !text-white"
              >
                Try again
              </button>
            </div>
          )}

        {!loading &&
          !error && (
            <>
              {/* FILTERS */}

              <div className="grid gap-3 py-5 lg:grid-cols-[1fr_180px_150px_180px]">
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
                        event.target.value
                      )
                    }
                    placeholder="Search your saved fragrances..."
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
                    setFamily
                  }
                  options={[
                    "All",
                    ...families,
                  ]}
                />

                <FilterSelect
                  label="For"
                  value={
                    audience
                  }
                  onChange={(
                    value
                  ) =>
                    setAudience(
                      value as AudienceFilter
                    )
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
                        "Recently saved",
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

              <div className="flex min-h-[64px] items-center justify-between gap-5">
                <p className="text-[9px] !text-[#8f817b]">
                  {
                    filteredItems.length
                  }{" "}
                  {filteredItems.length ===
                  1
                    ? "fragrance"
                    : "fragrances"}
                </p>

                {hasFilters && (
                  <button
                    type="button"
                    onClick={
                      resetFilters
                    }
                    className="border-b border-[#6b2230] pb-1 text-[9px] font-medium !text-[#6b2230]"
                  >
                    Clear filters
                  </button>
                )}
              </div>

              {/* EMPTY WISHLIST */}

              {wishlistIsEmpty ? (
                <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                  <p className="font-display text-[40px] leading-none !text-[#3b2926] sm:text-[52px]">
                    Nothing saved yet.
                  </p>

                  <p className="mt-4 max-w-md text-[12px] leading-6 !text-[#8d7b74]">
                    Save a fragrance
                    you love and it
                    will appear here.
                    No account is
                    required.
                  </p>

                  <Link
                    href="/shop"
                    className="mt-8 inline-flex border-b border-[#6b2230] pb-2 text-[11px] font-medium !text-[#6b2230]"
                  >
                    Explore the collection
                  </Link>
                </div>
              ) : filteredItems.length >
                0 ? (
                <div className="grid grid-cols-2 gap-x-3 gap-y-12 sm:gap-x-5 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-14">
                  {filteredItems.map(
                    ({
                      id,
                      product,
                    }) => (
                      <WishlistCard
                        key={
                          id
                        }
                        product={
                          product
                        }
                        removing={
                          removingIds.has(
                            product.id
                          )
                        }
                        adding={
                          addingIds.has(
                            product.id
                          )
                        }
                        onRemove={() =>
                          void handleRemoveFromWishlist(
                            product
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
              ) : (
                <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
                  <p className="font-display text-3xl !text-[#3d2926]">
                    Nothing matched
                    that feeling.
                  </p>

                  <p className="mt-3 max-w-md text-[12px] leading-6 !text-[#8d7b74]">
                    Try another
                    fragrance family,
                    audience or search
                    term.
                  </p>

                  <button
                    type="button"
                    onClick={
                      resetFilters
                    }
                    className="mt-6 border-b border-[#6b2230] pb-1 text-[11px] font-medium !text-[#6b2230]"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </>
          )}
      </div>
    </section>
  );
}

/* =========================================================
   CARD
========================================================= */

function WishlistCard({
  product,
  removing,
  adding,
  onRemove,
  onAddToBag,
}: {
  product: Product;
  removing: boolean;
  adding: boolean;
  onRemove: () => void;
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
          disabled={
            removing
          }
          onClick={
            onRemove
          }
          aria-label={`Remove ${product.name} from wishlist`}
          className="absolute right-3 top-3 z-30 flex size-9 items-center justify-center rounded-full bg-[#6b2230] !text-white backdrop-blur transition duration-300 hover:scale-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {removing ? (
            <LoaderCircle
              className="size-[16px] animate-spin"
              strokeWidth={
                1.35
              }
            />
          ) : (
            <Heart
              className="size-[17px] fill-current"
              strokeWidth={
                1.35
              }
            />
          )}
        </button>

        <div className="absolute inset-x-0 bottom-0 z-30 translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:translate-y-full md:group-hover/product:translate-y-0 md:group-focus-within/product:translate-y-0">
          <button
            type="button"
            disabled={
              adding ||
              !variant ||
              availableStock <= 0
            }
            onClick={
              onAddToBag
            }
            className="flex h-[50px] w-full items-center justify-between bg-[#fbfaf7]/95 px-4 text-[11px] font-medium !text-[#382925] backdrop-blur transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 sm:h-[52px] sm:px-5"
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
        className="mt-0.5 w-full appearance-none bg-transparent pr-6 text-[10px] !text-[#3d302c] outline-none"
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

function comparePrices(
  a: Product,
  b: Product,
  direction:
    | "asc"
    | "desc"
) {
  const aPrice =
    getNullableProductPrice(
      a
    );

  const bPrice =
    getNullableProductPrice(
      b
    );

  if (
    aPrice === null &&
    bPrice === null
  ) {
    return 0;
  }

  if (
    aPrice === null
  ) {
    return 1;
  }

  if (
    bPrice === null
  ) {
    return -1;
  }

  return direction ===
    "asc"
    ? aPrice -
        bPrice
    : bPrice -
        aPrice;
}

/* =========================================================
   EVENTS
========================================================= */

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
