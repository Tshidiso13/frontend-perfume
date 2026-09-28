"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowLeft,
  ChevronDown,
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
  familiesService,
  type FamilySummary,
} from "@/services/families.service";

import type {
  Product,
} from "@/services/products.service";

type AudienceFilter =
  | "ALL"
  | "WOMEN"
  | "MEN"
  | "UNISEX";

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

const PAGE_SIZE = 24;
const CART_STORAGE_KEY = "elan_cart";
const CART_UPDATED_EVENT = "elan:cart-updated";

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

export function FamiliesPage({
  slug,
}: {
  slug: string;
}) {
  const [
    family,
    setFamily,
  ] = useState<FamilySummary | null>(
    null
  );

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
    audience,
    setAudience,
  ] = useState<AudienceFilter>(
    "ALL"
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
  ] = useState<string | null>(
    null
  );

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

  useEffect(() => {
    setPage(1);
  }, [
    audience,
    slug,
  ]);

  const loadFamily =
    useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        const response =
          await familiesService.getFamily(
            slug,
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

              ...(audience !==
              "ALL"
                ? {
                    audience,
                  }
                : {}),
            }
          );

        setFamily(
          response.family
        );

        setProducts(
          response.data ?? []
        );

        setPagination(
          response.pagination
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load this fragrance family."
        );
      } finally {
        setLoading(false);
      }
    }, [
      slug,
      page,
      debouncedSearch,
      audience,
    ]);

  useEffect(() => {
    void loadFamily();
  }, [loadFamily]);

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
        quantity:
          cart[index].quantity +
          1,
        price,
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
        quantity:
          1,
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

    window.dispatchEvent(
      new CustomEvent(
        CART_UPDATED_EVENT,
        {
          detail: {
            count:
              cart.reduce(
                (
                  total,
                  item
                ) =>
                  total +
                  item.quantity,
                0
              ),
          },
        }
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

  if (
    loading &&
    !family
  ) {
    return (
      <section className="flex min-h-[70vh] flex-col items-center justify-center bg-[#fbfaf7]">
        <LoaderCircle
          className="size-6 animate-spin !text-[#5a1425]"
          strokeWidth={1.4}
        />

        <p className="mt-4 text-[9px] !text-[#88766f]">
          Loading fragrance family...
        </p>
      </section>
    );
  }

  if (
    error &&
    !family
  ) {
    return (
      <section className="flex min-h-[70vh] flex-col items-center justify-center bg-[#fbfaf7] px-6 text-center">
        <Package
          className="size-6 !text-[#9a8178]"
          strokeWidth={1.3}
        />

        <h1 className="mt-5 font-display text-[40px] !text-[#382724]">
          Family not found.
        </h1>

        <p className="mt-3 max-w-md text-[10px] leading-5 !text-[#88766f]">
          {error}
        </p>

        <Link
          href="/families"
          className="mt-7 inline-flex items-center gap-3 border-b border-[#5a1425] pb-2 text-[10px] !text-[#5a1425]"
        >
          <ArrowLeft
            className="size-3.5"
            strokeWidth={1.4}
          />
          Back to families
        </Link>
      </section>
    );
  }

  if (!family) {
    return null;
  }

  return (
    <section className="min-h-screen bg-[#fbfaf7] px-5 pb-24 pt-10 sm:px-8 lg:px-10 lg:pb-32 xl:px-12">
      <div className="mx-auto max-w-[1320px]">
        <nav
          aria-label="Breadcrumb"
          className="mb-10 flex flex-wrap items-center gap-1.5 text-[9px] !text-[#98877f]"
        >
          <Link
            href="/"
            className="transition-colors hover:!text-[#6b2230]"
          >
            Home
          </Link>

          <span
            aria-hidden="true"
            className="!text-[#b4a39d]"
          >
            /
          </span>

          <Link
            href="/families"
            className="transition-colors hover:!text-[#6b2230]"
          >
            Families
          </Link>

          <span
            aria-hidden="true"
            className="!text-[#b4a39d]"
          >
            /
          </span>

          <span
            aria-current="page"
            className="font-medium !text-[#5a1425]"
          >
            {family.name}
          </span>
        </nav>

        <div className="pb-10">
          <p className="mb-4 text-[9px] font-medium uppercase tracking-[0.32em] !text-[#8f6258]">
            Fragrance family
          </p>

          <h1 className="font-display text-[48px] font-normal leading-none tracking-[-0.04em] !text-[#342725] sm:text-[58px] lg:text-[72px]">
            {family.name}
          </h1>

          <p className="mt-5 max-w-xl text-[12px] leading-6 !text-[#8b7972]">
            Explore every active{" "}
            <span className="font-medium !text-[#5a1425]">
              {family.name}
            </span>{" "}
            fragrance in the Élan collection.
          </p>
        </div>

        <div className="h-px bg-[#dfd8d1]" />

        <div className="grid gap-3 py-5 lg:grid-cols-[1fr_180px]">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 !text-[#766760]"
              strokeWidth={1.4}
            />

            <input
              type="search"
              value={search}
              onChange={(
                event
              ) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder={`Search ${family.name.toLowerCase()} fragrances...`}
              className="h-[52px] w-full bg-[#f1eeea] pl-11 pr-11 text-[11px] !text-[#372b28] outline-none placeholder:!text-[#9b8e88] focus:bg-[#ece8e3]"
            />

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
                aria-label="Clear search"
                className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center !text-[#766760]"
              >
                <X
                  className="size-3.5"
                  strokeWidth={1.4}
                />
              </button>
            )}
          </div>

          <FilterSelect
            value={audience}
            onChange={(
              value
            ) =>
              setAudience(
                value as AudienceFilter
              )
            }
          />
        </div>

        <div className="h-px bg-[#dfd8d1]" />

        <div className="flex min-h-[64px] items-center justify-between">
          <p className="text-[9px] !text-[#8f817b]">
            {pagination.total}{" "}
            {pagination.total === 1
              ? "fragrance"
              : "fragrances"}
          </p>

          <Link
            href="/shop"
            className="hidden border-b border-[#6b2230] pb-1 text-[9px] font-medium !text-[#6b2230] sm:inline-flex"
          >
            Browse all fragrances
          </Link>
        </div>

        {loading && (
          <div className="flex min-h-[320px] items-center justify-center">
            <LoaderCircle
              className="size-5 animate-spin !text-[#5a1425]"
              strokeWidth={1.4}
            />
          </div>
        )}

        {!loading &&
          !error &&
          products.length >
            0 && (
            <div className="grid grid-cols-2 gap-x-3 gap-y-12 sm:gap-x-5 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-14">
              {products.map(
                (
                  product
                ) => (
                  <FamilyProductCard
                    key={
                      product.id
                    }
                    product={
                      product
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

        {!loading &&
          !error &&
          products.length ===
            0 && (
            <div className="flex min-h-[380px] flex-col items-center justify-center text-center">
              <p className="font-display text-[38px] !text-[#3d2926]">
                No fragrances found.
              </p>

              <p className="mt-4 max-w-md text-[11px] leading-6 !text-[#8d7b74]">
                There are no active products matching these filters in the {family.name} family.
              </p>
            </div>
          )}

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
                Page {pagination.page} of {pagination.pages}
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

function FamilyProductCard({
  product,
  onAddToBag,
}: {
  product: Product;
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
        >
          <div className="relative aspect-[4/5] overflow-hidden">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={`${product.name} perfume`}
                fill
                sizes="(max-width: 639px) 50vw, (max-width: 1023px) 50vw, 25vw"
                unoptimized
                className="object-cover transition-transform duration-[900ms] group-hover/product:scale-[1.025]"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#eee9e3]">
                <Package
                  className="size-7 !text-[#aa9991]"
                  strokeWidth={1.2}
                />
              </div>
            )}
          </div>
        </Link>

        {product.badge && (
          <span className="absolute left-3 top-3 z-20 bg-[#fbfaf7]/95 px-2.5 py-2 text-[8px] font-medium uppercase tracking-[0.14em] !text-[#544945]">
            {product.badge}
          </span>
        )}

        <div className="absolute inset-x-0 bottom-0 z-30 translate-y-0 transition-transform duration-500 md:translate-y-full md:group-hover/product:translate-y-0">
          <button
            type="button"
            disabled={
              !variant ||
              availableStock <=
                0
            }
            onClick={onAddToBag}
            className="flex h-[50px] w-full items-center justify-between bg-[#fbfaf7]/95 px-4 text-[11px] font-medium !text-[#382925] backdrop-blur disabled:opacity-60"
          >
            <span>
              {availableStock >
              0
                ? "Add to bag"
                : "Out of stock"}
            </span>

            <ShoppingBag
              className="size-4"
              strokeWidth={1.4}
            />
          </button>
        </div>
      </div>

      <div className="pt-4">
        <div className="mb-2.5 flex items-start justify-between gap-2">
          <p className="min-w-0 truncate text-[8px] font-medium uppercase tracking-[0.15em] !text-[#9a756c] sm:text-[9px]">
            {product.family} · {product.concentration}
          </p>

          {variant && (
            <span className="shrink-0 text-[8px] tracking-[0.1em] !text-[#9a756c]">
              {variant.size}
            </span>
          )}
        </div>

        <Link
          href={`/perfumes/${product.slug}`}
        >
          <h2 className="font-display text-[23px] font-normal leading-none tracking-[-0.02em] !text-[#382321] hover:opacity-60 sm:text-[27px]">
            {product.name}
          </h2>
        </Link>

        {product.shortDescription && (
          <p className="mt-2.5 hidden text-[11px] leading-5 !text-[#8c7871] sm:block">
            {product.shortDescription}
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

function FilterSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (
    value: string
  ) => void;
}) {
  return (
    <label className="relative flex h-[52px] flex-col justify-center border-b border-[#d8d0ca] px-3">
      <span className="text-[8px] !text-[#86746d]">
        For
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
        className="mt-0.5 w-full appearance-none bg-transparent pr-6 text-[10px] !text-[#3d302c] outline-none"
      >
        <option value="ALL">
          All
        </option>
        <option value="WOMEN">
          Women
        </option>
        <option value="MEN">
          Men
        </option>
        <option value="UNISEX">
          Unisex
        </option>
      </select>

      <ChevronDown
        className="pointer-events-none absolute bottom-[9px] right-2 size-3.5 !text-[#54443f]"
        strokeWidth={1.4}
      />
    </label>
  );
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
    product.images?.[0] as
      | {
          url?: string;
        }
      | string
      | undefined;

  if (
    typeof image ===
    "string"
  ) {
    return image.trim() ||
      null;
  }

  return image?.url?.trim() ||
    null;
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
