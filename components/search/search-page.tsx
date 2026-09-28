"use client";

import {
  useEffect,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  ChevronDown,
  Heart,
  LoaderCircle,
  Package,
  Plus,
  Search,
  X,
} from "lucide-react";

import {
  motion,
} from "framer-motion";

import {
  toast,
} from "sonner";

import {
  cartService,
} from "@/services/cart.service";

import {
  searchService,
  type SearchAudience,
  type SearchProduct,
  type SearchSort,
} from "@/services/search.service";

import {
  wishlistService,
} from "@/services/wishlist.service";

type AudienceFilter =
  | "All"
  | SearchAudience;

const popularSearches = [
  "Vanilla",
  "Rose",
  "Woody",
  "Fresh & clean",
  "Date night",
  "Unisex",
];

const CART_UPDATED_EVENT =
  "elan:cart-updated";

const WISHLIST_UPDATED_EVENT =
  "elan:wishlist-updated";

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

export function SearchPage() {
  const [
    query,
    setQuery,
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
      "All"
    );

  const [
    sort,
    setSort,
  ] =
    useState<SearchSort>(
      "recommended"
    );

  const [
    results,
    setResults,
  ] = useState<
    SearchProduct[]
  >([]);

  const [
    families,
    setFamilies,
  ] = useState<
    string[]
  >([]);

  const [
    total,
    setTotal,
  ] = useState(0);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  const [
    addingIds,
    setAddingIds,
  ] = useState<
    Set<string>
  >(
    () =>
      new Set()
  );

  const [
    savingIds,
    setSavingIds,
  ] = useState<
    Set<string>
  >(
    () =>
      new Set()
  );

  const [
    savedIds,
    setSavedIds,
  ] = useState<
    Set<string>
  >(
    () =>
      new Set()
  );

  const hasSearch =
    query.trim().length >
      0 ||
    family !==
      "All" ||
    audience !==
      "All";

  /* =======================================================
     REAL BACKEND SEARCH
  ======================================================== */

  useEffect(() => {
    if (
      !hasSearch
    ) {
      setResults([]);
      setTotal(0);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled =
      false;

    const timer =
      window.setTimeout(
        async () => {
          setLoading(true);
          setError(null);

          try {
            const response =
              await searchService.search(
                {
                  q:
                    query,
                  family:
                    family ===
                    "All"
                      ? undefined
                      : family,
                  audience:
                    audience ===
                    "All"
                      ? undefined
                      : audience,
                  sort,
                  limit:
                    60,
                }
              );

            if (
              cancelled
            ) {
              return;
            }

            setResults(
              response.data
            );

            setTotal(
              response.total
            );

            setFamilies(
              response.facets
                .families
            );
          } catch (
            searchError
          ) {
            if (
              cancelled
            ) {
              return;
            }

            setResults([]);
            setTotal(0);

            setError(
              searchError instanceof
                Error
                ? searchError.message
                : "Unable to search fragrances."
            );
          } finally {
            if (
              !cancelled
            ) {
              setLoading(false);
            }
          }
        },
        300
      );

    return () => {
      cancelled =
        true;

      window.clearTimeout(
        timer
      );
    };
  }, [
    query,
    family,
    audience,
    sort,
    hasSearch,
  ]);

  function clearSearch() {
    setQuery("");
    setFamily("All");
    setAudience("All");
    setSort(
      "recommended"
    );
    setResults([]);
    setTotal(0);
    setError(null);
  }

  /* =======================================================
     REAL CART
  ======================================================== */

  async function addToBag(
    product:
      SearchProduct
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

    if (
      !variant
    ) {
      toast.error(
        "This fragrance is currently out of stock."
      );

      return;
    }

    setAddingIds(
      (
        current
      ) =>
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
        response.summary
          .itemCount
      );

      toast.success(
        `${product.name} added to your bag`,
        {
          description:
            `${variant.size} · ${currency.format(
              variant.price
            )}`,
        }
      );
    } catch (
      addError
    ) {
      toast.error(
        addError instanceof
          Error
          ? addError.message
          : "Unable to add this fragrance to your bag."
      );
    } finally {
      setAddingIds(
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
     REAL WISHLIST
  ======================================================== */

  async function addToWishlist(
    product:
      SearchProduct
  ) {
    if (
      savingIds.has(
        product.id
      ) ||
      savedIds.has(
        product.id
      )
    ) {
      return;
    }

    setSavingIds(
      (
        current
      ) =>
        new Set(
          current
        ).add(
          product.id
        )
    );

    try {
      await wishlistService.add(
        product.id
      );

      setSavedIds(
        (
          current
        ) =>
          new Set(
            current
          ).add(
            product.id
          )
      );

      const count =
        await wishlistService.getCount();

      dispatchCommerceEvent(
        WISHLIST_UPDATED_EVENT,
        count.count
      );

      toast.success(
        `${product.name} saved to your wishlist`
      );
    } catch (
      saveError
    ) {
      toast.error(
        saveError instanceof
          Error
          ? saveError.message
          : "Unable to save this fragrance."
      );
    } finally {
      setSavingIds(
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

  return (
    <section className="min-h-screen bg-[#fbfaf7] px-5 pb-24 pt-10 sm:px-8 lg:px-10 lg:pb-32 xl:px-12">
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-10 flex items-center gap-1.5 text-[9px] text-[#98877f]">
          <Link
            href="/"
            className="transition-colors hover:text-[#6b2230]"
          >
            Home
          </Link>

          <span>/</span>

          <span>
            Search
          </span>
        </div>

        <motion.div
          initial={{
            opacity:
              0,
            y:
              20,
          }}
          animate={{
            opacity:
              1,
            y:
              0,
          }}
          transition={{
            duration:
              0.75,
            ease: [
              0.22,
              1,
              0.36,
              1,
            ],
          }}
          className="max-w-[760px]"
        >
          <p className="mb-4 text-[9px] font-medium uppercase tracking-[0.32em] !text-[#8f6258]">
            Find what stays with you
          </p>

          <h1 className="font-display text-[50px] font-normal leading-[0.95] tracking-[-0.04em] !text-[#342725] sm:text-[62px] lg:text-[72px]">
            What are you looking for?
          </h1>

          <p className="mt-5 max-w-[570px] text-[12px] leading-6 !text-[#8b7972] sm:text-[13px]">
            Search by fragrance, note, mood or simply the feeling you&apos;re after.
          </p>
        </motion.div>

        <div className="mt-10 border-y border-[#ded6cf] py-5">
          <div className="relative">
            <Search
              className="absolute left-5 top-1/2 size-[18px] -translate-y-1/2 text-[#6d5d57]"
              strokeWidth={
                1.4
              }
            />

            <input
              type="search"
              autoFocus
              value={
                query
              }
              onChange={(
                event
              ) =>
                setQuery(
                  event.target.value
                )
              }
              placeholder="Try vanilla, woody, date night..."
              className="
                h-[66px]
                w-full
                bg-[#f1eeea]
                pl-14
                pr-14
                text-[13px]
                !text-[#382b28]
                outline-none
                placeholder:!text-[#9c8c85]
                transition-colors
                focus:bg-[#ece8e3]
                sm:text-[14px]
              "
            />

            {query && (
              <button
                type="button"
                onClick={() =>
                  setQuery(
                    ""
                  )
                }
                aria-label="Clear search"
                className="absolute right-4 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full transition-colors hover:bg-black/[0.05]"
              >
                <X
                  className="size-4"
                  strokeWidth={
                    1.4
                  }
                />
              </button>
            )}
          </div>
        </div>

        {!hasSearch && (
          <motion.div
            initial={{
              opacity:
                0,
            }}
            animate={{
              opacity:
                1,
            }}
            transition={{
              delay:
                0.2,
              duration:
                0.6,
            }}
            className="py-10"
          >
            <p className="mb-5 text-[9px] font-medium uppercase tracking-[0.25em] !text-[#9b776d]">
              Try searching for
            </p>

            <div className="flex flex-wrap gap-2">
              {popularSearches.map(
                (
                  item
                ) => (
                  <button
                    key={
                      item
                    }
                    type="button"
                    onClick={() =>
                      setQuery(
                        item
                      )
                    }
                    className="
                      border
                      border-[#d8cfc9]
                      px-4
                      py-2.5
                      text-[10px]
                      !text-[#5a4741]
                      transition-all
                      duration-300
                      hover:border-[#6b2230]
                      hover:bg-[#f3ece7]
                      hover:!text-[#6b2230]
                    "
                  >
                    {
                      item
                    }
                  </button>
                )
              )}
            </div>
          </motion.div>
        )}

        {hasSearch && (
          <>
            <div className="grid gap-3 py-5 lg:grid-cols-[1fr_170px_170px]">
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
                    value as
                      AudienceFilter
                  )
                }
                options={[
                  {
                    value:
                      "All",
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
                    value as
                      SearchSort
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

            <div className="h-px bg-[#ded6cf]" />

            <div className="flex items-center justify-between py-6">
              <p className="text-[9px] !text-[#8f817b]">
                {loading
                  ? "Searching..."
                  : `${total} ${
                      total ===
                      1
                        ? "fragrance found"
                        : "fragrances found"
                    }`}
              </p>

              <button
                type="button"
                onClick={
                  clearSearch
                }
                className="text-[9px] !text-[#7b4d54] transition-opacity hover:opacity-60"
              >
                Clear search
              </button>
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
              <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                <p className="font-display text-[38px] !text-[#3b2926]">
                  Search is taking a moment.
                </p>

                <p className="mt-4 max-w-md text-[12px] leading-6 !text-[#8d7b74]">
                  {
                    error
                  }
                </p>
              </div>
            ) : results.length >
              0 ? (
              <motion.div
                initial="hidden"
                animate="show"
                variants={{
                  hidden:
                    {},
                  show: {
                    transition: {
                      staggerChildren:
                        0.06,
                    },
                  },
                }}
                className="grid grid-cols-2 gap-x-3 gap-y-12 sm:gap-x-5 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-14"
              >
                {results.map(
                  (
                    product
                  ) => {
                    const variant =
                      getPrimaryVariant(
                        product
                      );

                    const price =
                      product.startingPrice;

                    const image =
                      product.imageUrl;

                    const available =
                      variant
                        ?.availableStock ??
                      0;

                    const adding =
                      addingIds.has(
                        product.id
                      );

                    const saving =
                      savingIds.has(
                        product.id
                      );

                    const saved =
                      savedIds.has(
                        product.id
                      );

                    return (
                      <motion.article
                        key={
                          product.id
                        }
                        variants={{
                          hidden: {
                            opacity:
                              0,
                            y:
                              20,
                          },
                          show: {
                            opacity:
                              1,
                            y:
                              0,
                            transition: {
                              duration:
                                0.55,
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
                        <div className="relative overflow-hidden bg-[#e6e2dc]">
                          <Link
                            href={`/perfumes/${product.slug}`}
                            className="block"
                            aria-label={`View ${product.name}`}
                          >
                            <div className="relative aspect-[4/5] overflow-hidden">
                              {image ? (
                                <Image
                                  src={
                                    image
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
                              saving ||
                              saved
                            }
                            onClick={() =>
                              void addToWishlist(
                                product
                              )
                            }
                            aria-label={`Save ${product.name}`}
                            className="absolute right-3 top-3 z-30 flex size-9 items-center justify-center rounded-full !text-[#694d46] transition-all duration-300 hover:bg-white/60 hover:scale-110 disabled:opacity-60"
                          >
                            {saving ? (
                              <LoaderCircle
                                className="size-[17px] animate-spin"
                                strokeWidth={
                                  1.35
                                }
                              />
                            ) : (
                              <Heart
                                className={`size-[17px] ${
                                  saved
                                    ? "fill-current"
                                    : ""
                                }`}
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
                                available <=
                                  0
                              }
                              onClick={() =>
                                void addToBag(
                                  product
                                )
                              }
                              className="group/bag flex h-[50px] w-full items-center justify-between bg-[#fbfaf7]/95 px-4 text-[11px] font-medium !text-[#382925] backdrop-blur transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 sm:h-[52px] sm:px-5"
                            >
                              <span>
                                {adding
                                  ? "Adding..."
                                  : available >
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
                                <Plus
                                  className="size-4 transition-transform duration-300 group-hover/bag:rotate-90"
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
                            {price !==
                            null
                              ? currency.format(
                                  price
                                )
                              : "Price unavailable"}
                          </p>
                        </div>
                      </motion.article>
                    );
                  }
                )}
              </motion.div>
            ) : (
              <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                <p className="mb-3 text-[9px] font-medium uppercase tracking-[0.28em] !text-[#9a6c62]">
                  Nothing quite matched
                </p>

                <h2 className="font-display text-[38px] leading-none !text-[#3b2926] sm:text-[50px]">
                  Try another feeling.
                </h2>

                <p className="mt-4 max-w-md text-[12px] leading-6 !text-[#8d7b74]">
                  Search another note, family, mood or occasion.
                </p>

                <button
                  type="button"
                  onClick={
                    clearSearch
                  }
                  className="mt-7 border-b border-[#6b2230] pb-2 text-[11px] font-medium !text-[#6b2230]"
                >
                  Start again
                </button>
              </div>
            )}
          </>
        )}

        {!hasSearch && (
          <div className="mt-10 grid gap-4 border-t border-[#ded6cf] pt-10 md:grid-cols-2">
            <Link
              href="/discover"
              className="group flex min-h-[190px] flex-col justify-between bg-[#35101c] p-7"
            >
              <p className="text-[9px] font-medium uppercase tracking-[0.25em] !text-[#d4afb3]">
                Not sure what to search?
              </p>

              <div className="flex items-end justify-between">
                <div>
                  <h2 className="font-display text-[32px] leading-none !text-[#f8eee7] sm:text-[38px]">
                    Find your scent.
                  </h2>

                  <p className="mt-3 text-[11px] !text-white/55">
                    Four questions. A more personal answer.
                  </p>
                </div>

                <ArrowRight
                  className="size-4 !text-white transition-transform group-hover:translate-x-1"
                  strokeWidth={
                    1.4
                  }
                />
              </div>
            </Link>

            <Link
              href="/shop"
              className="group flex min-h-[190px] flex-col justify-between bg-[#eee7df] p-7"
            >
              <p className="text-[9px] font-medium uppercase tracking-[0.25em] !text-[#987065]">
                Prefer to browse?
              </p>

              <div className="flex items-end justify-between">
                <div>
                  <h2 className="font-display text-[32px] leading-none !text-[#3b2926] sm:text-[38px]">
                    Explore them all.
                  </h2>

                  <p className="mt-3 text-[11px] !text-[#8d7770]">
                    Take your time with the full collection.
                  </p>
                </div>

                <ArrowRight
                  className="size-4 text-[#6b2230] transition-transform group-hover:translate-x-1"
                  strokeWidth={
                    1.4
                  }
                />
              </div>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

type DetailedOption = {
  value:
    string;
  label:
    string;
};

type FilterSelectProps = {
  label:
    string;
  value:
    string;
  onChange:
    (
      value:
        string
    ) =>
      void;
  options:
    Array<
      string |
      DetailedOption
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
        {
          label
        }
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
          (
            option
          ) => {
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

function getPrimaryVariant(
  product:
    SearchProduct
) {
  return (
    product.variants.find(
      (
        variant
      ) =>
        variant.active &&
        variant.availableStock >
          0
    ) ??
    product.variants.find(
      (
        variant
      ) =>
        variant.active
    ) ??
    product.variants[0] ??
    null
  );
}

function getPrimaryPurchasableVariant(
  product:
    SearchProduct
) {
  return (
    product.variants.find(
      (
        variant
      ) =>
        variant.active &&
        variant.availableStock >
          0
    ) ??
    null
  );
}

function dispatchCommerceEvent(
  eventName:
    string,
  count:
    number
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
