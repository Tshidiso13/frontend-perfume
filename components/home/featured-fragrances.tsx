"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  Heart,
  LoaderCircle,
  Package,
  ShoppingBag,
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

const FEATURED_LIMIT = 4;

const WISHLIST_STORAGE_KEY =
  "elan_wishlist";

const WISHLIST_UPDATED_EVENT =
  "elan:wishlist-updated";

const currencyFormatter =
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
   COMPONENT
========================================================= */

export function FeaturedFragrances() {
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
     LOAD REAL PRODUCTS
  ======================================================== */

  const loadProducts =
    useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        const response =
          (await productsService.getPublicProducts(
            {
              page: 1,
              limit:
                FEATURED_LIMIT,
            }
          )) as PublicProductsResponse;

        setProducts(
          response.data ??
            []
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to load featured fragrances.";

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
    void loadProducts();
  }, [loadProducts]);

  /* =======================================================
     ADD TO BAG — BACKEND + DRAWER
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
       * Update the Navbar badge from the backend cart.
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
       * Open the shared responsive cart drawer.
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
            `${variant.size} · ${currencyFormatter.format(
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

  function handleWishlist(
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

  return (
    <>
      <section className="bg-[#fbfaf7] px-5 py-20 sm:px-8 lg:px-10 lg:py-28 xl:px-12">
      <div className="mx-auto max-w-[1500px]">
        {/* =====================================================
            SECTION HEADING
        ====================================================== */}

        <div className="mb-10 flex items-end justify-between gap-8 lg:mb-12">
          <div>
            <p className="mb-4 text-[9px] font-medium uppercase tracking-[0.3em] !text-[#9a5d4f] sm:text-[10px]">
              The ones you&apos;ll
              come back to
            </p>

            <h2 className="font-display text-[40px] font-normal leading-[0.95] tracking-[-0.03em] !text-[#351a1d] sm:text-5xl lg:text-[58px]">
              A few lasting
              impressions.
            </h2>
          </div>

          <Link
            href="/shop"
            className="
              group
              hidden
              items-center
              gap-5
              border-b
              border-[#552027]
              pb-2.5
              text-[12px]
              font-medium
              !text-[#552027]
              transition-opacity
              hover:opacity-70
              md:flex
            "
          >
            <span>
              Explore the collection
            </span>

            <ArrowRight
              className="size-4 transition-transform duration-300 group-hover:translate-x-1.5"
              strokeWidth={
                1.4
              }
            />
          </Link>
        </div>

        {/* =====================================================
            LOADING
        ====================================================== */}

        {loading && (
          <div className="flex min-h-[360px] flex-col items-center justify-center">
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
        )}

        {/* =====================================================
            ERROR
        ====================================================== */}

        {!loading &&
          error && (
            <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
              <p className="text-[8px] uppercase tracking-[0.24em] !text-[#a1625b]">
                Collection unavailable
              </p>

              <p className="mt-4 max-w-md text-[10px] leading-5 !text-[#88766f]">
                {error}
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

        {/* =====================================================
            PRODUCTS
        ====================================================== */}

        {!loading &&
          !error &&
          products.length >
            0 && (
            <div className="grid grid-cols-2 gap-x-3 gap-y-12 sm:gap-x-5 lg:grid-cols-4 lg:gap-x-6">
              {products.map(
                (
                  product
                ) => (
                  <FeaturedProductCard
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
                      void handleAddToBag(
                        product
                      )
                    }
                    onWishlist={() =>
                      handleWishlist(
                        product
                      )
                    }
                  />
                )
              )}
            </div>
          )}

        {/* =====================================================
            EMPTY
        ====================================================== */}

        {!loading &&
          !error &&
          products.length ===
            0 && (
            <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
              <p className="font-display text-3xl !text-[#3d2926]">
                No fragrances yet.
              </p>

              <p className="mt-3 text-[11px] !text-[#8d7b74]">
                Active products will
                appear here from the
                catalogue.
              </p>
            </div>
          )}

        {/* =====================================================
            MOBILE COLLECTION LINK
        ====================================================== */}

        <div className="mt-12 md:hidden">
          <Link
            href="/shop"
            className="
              group
              inline-flex
              items-center
              gap-5
              border-b
              border-[#552027]
              pb-2.5
              text-[12px]
              font-medium
              !text-[#552027]
            "
          >
            <span>
              Explore the collection
            </span>

            <ArrowRight
              className="size-4 transition-transform duration-300 group-hover:translate-x-1"
              strokeWidth={
                1.4
              }
            />
          </Link>
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

function FeaturedProductCard({
  product,
  wishlisted,
  adding,
  onAddToBag,
  onWishlist,
}: {
  product: Product;
  wishlisted: boolean;
  adding: boolean;
  onAddToBag: () => void;
  onWishlist: () => void;
}) {
  const image =
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
      {/* =================================================
          PRODUCT IMAGE
      ================================================== */}

      <div className="relative overflow-hidden bg-[#e7e3dc]">
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
                alt={`${product.name} by Élan Parfums`}
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

        {/* Badge */}

        {product.badge && (
          <span
            className="
              absolute
              left-3
              top-3
              z-20
              bg-[#fbfaf7]/95
              px-2.5
              py-2
              text-[8px]
              font-medium
              uppercase
              tracking-[0.14em]
              !text-[#544945]
              backdrop-blur-sm
              sm:left-4
              sm:top-4
              sm:px-3
              sm:text-[9px]
            "
          >
            {
              product.badge
            }
          </span>
        )}

        {/* Wishlist */}

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
            transition-all
            duration-300
            sm:right-4
            sm:top-4

            ${
              wishlisted
                ? "bg-[#6b2230] !text-white"
                : "bg-[#fbfaf7]/80 !text-[#66483f] hover:scale-110 hover:bg-white"
            }
          `}
        >
          <Heart
            className={`size-[18px] ${
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
              border-t
              border-black/[0.04]
              bg-[#fbfaf7]/95
              px-4
              text-left
              text-[11px]
              font-medium
              !text-[#3b2926]
              backdrop-blur-md
              transition-colors
              duration-300
              hover:bg-white
              disabled:cursor-not-allowed
              disabled:opacity-60
              sm:h-[52px]
              sm:px-5
              sm:text-[12px]
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

      {/* =================================================
          PRODUCT INFORMATION
      ================================================== */}

      <div className="pt-4 sm:pt-5">
        <div className="mb-2.5 flex items-start justify-between gap-2 sm:mb-3">
          <p
            className="
              min-w-0
              truncate
              text-[8px]
              font-medium
              uppercase
              tracking-[0.15em]
              !text-[#9a6c61]
              sm:text-[9px]
              xl:text-[10px]
            "
          >
            {
              product.family
            }{" "}
            ·{" "}
            {
              product.concentration
            }
          </p>

          {variant && (
            <span className="shrink-0 text-[8px] tracking-[0.1em] !text-[#9a6c61] sm:text-[9px] xl:text-[10px]">
              {
                variant.size
              }
            </span>
          )}
        </div>

        <Link
          href={`/perfumes/${product.slug}`}
          className="inline-block"
        >
          <h3
            className="
              font-display
              text-[22px]
              font-normal
              leading-[1]
              tracking-[-0.025em]
              !text-[#351a1d]
              transition-opacity
              duration-300
              hover:opacity-60
              sm:text-[26px]
              xl:text-[29px]
            "
          >
            {
              product.name
            }
          </h3>
        </Link>

        {product.shortDescription && (
          <p className="mt-2.5 hidden min-h-[20px] text-[11px] leading-5 !text-[#8a7470] sm:block xl:text-[13px]">
            {
              product.shortDescription
            }
          </p>
        )}

        <p className="mt-3 text-[12px] font-medium !text-[#321f1d] sm:mt-4 sm:text-[13px]">
          {price !== null
            ? currencyFormatter.format(
                price
              )
            : "Price unavailable"}
        </p>
      </div>
    </article>
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
