"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  ReactNode,
} from "react";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  LoaderCircle,
  Package,
  Plus,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

import { motion } from "framer-motion";
import { toast } from "sonner";

import type {
  Product,
  ProductImage,
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

type ProductDetailProps = {
  product: Product;
  relatedProducts: Product[];
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
   STORAGE
========================================================= */

const WISHLIST_STORAGE_KEY =
  "elan_wishlist";

const WISHLIST_UPDATED_EVENT =
  "elan:wishlist-updated";

/* =========================================================
   CURRENCY
========================================================= */

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
   PRODUCT DETAIL
========================================================= */

export function ProductDetail({
  product,
  relatedProducts,
}: ProductDetailProps) {
  const activeVariants =
    useMemo(
      () =>
        (product.variants ?? []).filter(
          (variant) =>
            variant.active
        ),
      [product.variants]
    );

  const defaultVariant =
    activeVariants.find(
      (variant) =>
        variant.size
          .trim()
          .toLowerCase() ===
        "50 ml"
    ) ??
    activeVariants[0] ??
    null;

  const [
    selectedVariantId,
    setSelectedVariantId,
  ] = useState<string | null>(
    defaultVariant?.id ??
      null
  );

  const selectedVariant =
    activeVariants.find(
      (variant) =>
        variant.id ===
        selectedVariantId
    ) ??
    defaultVariant;

  const [
    selectedImageIndex,
    setSelectedImageIndex,
  ] = useState(0);

  const [
    openSection,
    setOpenSection,
  ] = useState<
    string | null
  >("feeling");

  const [
    isWishlisted,
    setIsWishlisted,
  ] = useState(false);

  const [
    addedToBag,
    setAddedToBag,
  ] = useState(false);

  const [
    addingToBag,
    setAddingToBag,
  ] = useState(false);

  const images =
    product.images ?? [];

  const selectedImage =
    images[
      selectedImageIndex
    ] ??
    images[0] ??
    null;

  const availableStock =
    selectedVariant
      ? Math.max(
          0,
          selectedVariant.stock -
            (
              selectedVariant.reservedStock ??
              0
            )
        )
      : 0;

  /* =======================================================
     LOAD WISHLIST STATE
  ======================================================== */

  useEffect(() => {
    const wishlist =
      readStorageList<StoredWishlistItem>(
        WISHLIST_STORAGE_KEY
      );

    setIsWishlisted(
      wishlist.some(
        (item) =>
          item.productId ===
          product.id
      )
    );
  }, [product.id]);

  /* =======================================================
     IMAGE GALLERY
  ======================================================== */

  function selectImage(
    index: number
  ) {
    if (
      index < 0 ||
      index >= images.length
    ) {
      return;
    }

    setSelectedImageIndex(
      index
    );
  }

  function previousImage() {
    if (
      images.length <= 1
    ) {
      return;
    }

    setSelectedImageIndex(
      (current) =>
        current <= 0
          ? images.length - 1
          : current - 1
    );
  }

  function nextImage() {
    if (
      images.length <= 1
    ) {
      return;
    }

    setSelectedImageIndex(
      (current) =>
        current >=
        images.length - 1
          ? 0
          : current + 1
    );
  }

  /* =======================================================
     ADD TO BAG — BACKEND + DRAWER
  ======================================================== */

  async function handleAddToBag() {
    if (
      addingToBag
    ) {
      return;
    }

    if (
      !selectedVariant
    ) {
      toast.error(
        "Choose a size before adding this fragrance to your bag."
      );

      return;
    }

    if (
      availableStock <= 0
    ) {
      toast.error(
        "This size is currently out of stock."
      );

      return;
    }

    const price =
      Number(
        selectedVariant.price
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

    setAddingToBag(
      true
    );

    try {
      const response =
        await cartService.add(
          selectedVariant.id,
          1
        );

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

      window.dispatchEvent(
        new CustomEvent(
          CART_DRAWER_OPEN_EVENT
        )
      );

      setAddedToBag(
        true
      );

      window.setTimeout(
        () =>
          setAddedToBag(
            false
          ),
        1400
      );

      toast.success(
        `${product.name} added to your bag`,
        {
          description:
            `${selectedVariant.size} · ${currency.format(
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
      setAddingToBag(
        false
      );
    }
  }

  /* =======================================================
     WISHLIST
  ======================================================== */

  function handleWishlist() {
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
                  product.images
                ),

              startingPrice:
                product.startingPrice,

              createdAt:
                new Date().toISOString(),
            },
          ];

    writeStorageList(
      WISHLIST_STORAGE_KEY,
      nextWishlist
    );

    setIsWishlisted(
      !exists
    );

    dispatchCommerceEvent(
      WISHLIST_UPDATED_EVENT,
      {
        count:
          nextWishlist.length,
      }
    );

    if (
      exists
    ) {
      toast.success(
        `${product.name} removed from your wishlist`
      );

      return;
    }

    toast.success(
      `${product.name} saved to your wishlist`
    );
  }

  return (
    <div className="bg-[#fbfaf7]">
      {/* =====================================================
          PRODUCT
      ====================================================== */}

      <section className="mx-auto max-w-[1420px] px-5 pb-24 pt-8 sm:px-8 lg:px-10 lg:pb-32 xl:px-12">
        {/* Breadcrumb */}

        <div className="mb-8 flex items-center gap-1.5 text-[9px] !text-[#9a8b84]">
          <Link
            href="/shop"
            className="transition-colors hover:!text-[#6b2230]"
          >
            The collection
          </Link>

          <span>/</span>

          <span>
            {product.name}
          </span>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16 xl:gap-24">
          {/* =================================================
              IMAGE GALLERY
          ================================================== */}

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
          >
            <div className="relative min-h-[560px] overflow-hidden bg-[#e9e4de] sm:min-h-[680px] lg:min-h-[720px]">
              {selectedImage?.url ? (
                <Image
                  src={
                    selectedImage.url
                  }
                  alt={`${product.name} perfume`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-[#eee9e3]">
                  <Package
                    className="size-10 !text-[#b3a39c]"
                    strokeWidth={
                      1.1
                    }
                  />
                </div>
              )}

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={
                      previousImage
                    }
                    aria-label="Previous product image"
                    className="absolute left-4 top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center bg-[#fbfaf7]/90 !text-[#5a1425] backdrop-blur transition-colors hover:bg-white"
                  >
                    <ChevronLeft
                      className="size-4"
                      strokeWidth={
                        1.4
                      }
                    />
                  </button>

                  <button
                    type="button"
                    onClick={
                      nextImage
                    }
                    aria-label="Next product image"
                    className="absolute right-4 top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center bg-[#fbfaf7]/90 !text-[#5a1425] backdrop-blur transition-colors hover:bg-white"
                  >
                    <ChevronRight
                      className="size-4"
                      strokeWidth={
                        1.4
                      }
                    />
                  </button>
                </>
              )}
            </div>

            {images.length >
              1 && (
              <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-6">
                {images.map(
                  (
                    image,
                    index
                  ) => (
                    <button
                      key={
                        image.id
                      }
                      type="button"
                      onClick={() =>
                        selectImage(
                          index
                        )
                      }
                      aria-label={`View product image ${index + 1}`}
                      className={`relative aspect-[4/5] overflow-hidden border ${
                        selectedImageIndex ===
                        index
                          ? "border-[#5a1425]"
                          : "border-[#ded6d0]"
                      }`}
                    >
                      {image.url ? (
                        <Image
                          src={
                            image.url
                          }
                          alt={`${product.name} ${index + 1}`}
                          fill
                          sizes="120px"
                          unoptimized
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-[#eee9e3]" />
                      )}
                    </button>
                  )
                )}
              </div>
            )}
          </motion.div>

          {/* =================================================
              INFORMATION
          ================================================== */}

          <motion.div
            initial={{
              opacity: 0,
              x: 30,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.8,
              delay: 0.1,
              ease: [
                0.22,
                1,
                0.36,
                1,
              ],
            }}
            className="lg:sticky lg:top-[150px] lg:self-start lg:pt-7"
          >
            <p className="text-[9px] font-semibold uppercase tracking-[0.23em] !text-[#73504b]">
              Élan Parfums ·{" "}
              {
                product.family
              }
            </p>

            <h1 className="mt-7 font-display text-[50px] font-normal leading-[0.93] tracking-[-0.04em] !text-[#392826] sm:text-[62px] lg:text-[68px]">
              {product.name}
            </h1>

            {product.shortDescription && (
              <p className="mt-5 text-[13px] !text-[#89756e]">
                {
                  product.shortDescription
                }
              </p>
            )}

            {product.story && (
              <p className="mt-7 max-w-[530px] text-[12px] leading-7 !text-[#83726c]">
                {
                  product.story
                }
              </p>
            )}

            <p className="mt-9 text-[21px] font-medium !text-[#322421]">
              {selectedVariant
                ? currency.format(
                    Number(
                      selectedVariant.price
                    )
                  )
                : product.startingPrice !==
                    null
                  ? currency.format(
                      product.startingPrice
                    )
                  : "Price unavailable"}
            </p>

            {/* Variant selection */}

            {activeVariants.length >
              0 && (
              <div className="mt-8">
                <p className="mb-3 text-[9px] !text-[#8c7972]">
                  {
                    product.concentration
                  }{" "}
                  · Choose your
                  size
                </p>

                <div className="flex flex-wrap gap-2">
                  {activeVariants.map(
                    (
                      variant
                    ) => {
                      const active =
                        selectedVariant?.id ===
                        variant.id;

                      const stock =
                        Math.max(
                          0,
                          variant.stock -
                            (
                              variant.reservedStock ??
                              0
                            )
                        );

                      return (
                        <button
                          key={
                            variant.id
                          }
                          type="button"
                          disabled={
                            stock <= 0
                          }
                          onClick={() =>
                            setSelectedVariantId(
                              variant.id
                            )
                          }
                          className={`
                            min-w-[72px]
                            border
                            px-5
                            py-3
                            text-[10px]
                            transition-all
                            duration-300

                            ${
                              active
                                ? "border-[#6b2230] bg-[#fbfaf7] !text-[#6b2230]"
                                : "border-[#d9d0ca] !text-[#6f625d] hover:border-[#9d8178]"
                            }

                            disabled:cursor-not-allowed
                            disabled:opacity-35
                          `}
                        >
                          {
                            variant.size
                          }
                        </button>
                      );
                    }
                  )}
                </div>

                {selectedVariant && (
                  <div className="mt-3 flex items-center gap-4 text-[8px] !text-[#8b7770]">
                    <span>
                      SKU ·{" "}
                      {
                        selectedVariant.sku
                      }
                    </span>

                    <span>
                      {availableStock >
                      0
                        ? `${availableStock} available`
                        : "Out of stock"}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* =================================================
                ADD TO BAG + WISHLIST
            ================================================== */}

            <div className="mt-7 flex gap-3">
              <button
                type="button"
                disabled={
                  !selectedVariant ||
                  availableStock <= 0 ||
                  addingToBag
                }
                onClick={
                  handleAddToBag
                }
                className="
                  group
                  flex
                  min-h-[54px]
                  flex-1
                  items-center
                  justify-center
                  gap-3
                  bg-[#571628]
                  px-6
                  text-[10px]
                  font-medium
                  !text-white
                  transition-colors
                  hover:bg-[#6a1b31]
                  disabled:cursor-not-allowed
                  disabled:bg-[#b9aaa7]
                "
              >
                {addingToBag ? (
                  <>
                    Adding...

                    <LoaderCircle
                      className="size-[15px] animate-spin"
                      strokeWidth={
                        1.5
                      }
                    />
                  </>
                ) : addedToBag ? (
                  <>
                    Added to bag

                    <Check
                      className="size-[15px]"
                      strokeWidth={
                        1.6
                      }
                    />
                  </>
                ) : availableStock <=
                  0 ? (
                  <>
                    Out of stock

                    <ShoppingBag
                      className="size-[15px]"
                      strokeWidth={
                        1.4
                      }
                    />
                  </>
                ) : (
                  <>
                    Add to bag

                    <ShoppingBag
                      className="size-[15px] transition-transform group-hover:-translate-y-0.5"
                      strokeWidth={
                        1.4
                      }
                    />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={
                  handleWishlist
                }
                aria-label={
                  isWishlisted
                    ? `Remove ${product.name} from wishlist`
                    : `Add ${product.name} to wishlist`
                }
                aria-pressed={
                  isWishlisted
                }
                title={
                  isWishlisted
                    ? "Remove from wishlist"
                    : "Add to wishlist"
                }
                className={`
                  flex
                  size-[54px]
                  shrink-0
                  items-center
                  justify-center
                  border
                  transition-all

                  ${
                    isWishlisted
                      ? "border-[#6b2230] bg-[#6b2230] !text-white"
                      : "border-[#d9d0ca] !text-[#6b2230] hover:border-[#7e4e55] hover:bg-[#f2ebe5]"
                  }
                `}
              >
                <Heart
                  className={`size-[18px] ${
                    isWishlisted
                      ? "fill-current"
                      : ""
                  }`}
                  strokeWidth={
                    1.4
                  }
                />
              </button>
            </div>

            <div className="mt-3 flex items-center justify-between gap-4">
              <Link
                href="/cart"
                className="text-[8px] !text-[#88766f] underline-offset-4 hover:underline"
              >
                View bag
              </Link>

              <Link
                href="/wishlist"
                className="text-[8px] !text-[#88766f] underline-offset-4 hover:underline"
              >
                View wishlist
              </Link>
            </div>

            {/* Real backend-backed information only */}

            <div className="mt-8 grid grid-cols-2 gap-3 border-y border-[#ded6d0] py-5">
              <DetailMeta
                label="For"
                value={formatAudience(
                  product.audience
                )}
              />

              <DetailMeta
                label="Concentration"
                value={
                  product.concentration
                }
              />

              {product.longevity && (
                <DetailMeta
                  label="Longevity"
                  value={
                    product.longevity
                  }
                />
              )}

              {product.sillage && (
                <DetailMeta
                  label="Sillage"
                  value={
                    product.sillage
                  }
                />
              )}

              {product.season && (
                <DetailMeta
                  label="Season"
                  value={
                    product.season
                  }
                />
              )}
            </div>

            {/* Accordions */}

            <div className="mt-8 border-t border-[#ded6d0]">
              {product.feeling && (
                <Accordion
                  title="The feeling"
                  open={
                    openSection ===
                    "feeling"
                  }
                  onClick={() =>
                    setOpenSection(
                      openSection ===
                        "feeling"
                        ? null
                        : "feeling"
                    )
                  }
                >
                  {
                    product.feeling
                  }
                </Accordion>
              )}

              {product.longevity && (
                <Accordion
                  title="Longevity"
                  open={
                    openSection ===
                    "longevity"
                  }
                  onClick={() =>
                    setOpenSection(
                      openSection ===
                        "longevity"
                        ? null
                        : "longevity"
                    )
                  }
                >
                  {
                    product.longevity
                  }
                </Accordion>
              )}

              {product.sillage && (
                <Accordion
                  title="Sillage"
                  open={
                    openSection ===
                    "sillage"
                  }
                  onClick={() =>
                    setOpenSection(
                      openSection ===
                        "sillage"
                        ? null
                        : "sillage"
                    )
                  }
                >
                  {
                    product.sillage
                  }
                </Accordion>
              )}

              {product.season && (
                <Accordion
                  title="Best season"
                  open={
                    openSection ===
                    "season"
                  }
                  onClick={() =>
                    setOpenSection(
                      openSection ===
                        "season"
                        ? null
                        : "season"
                    )
                  }
                >
                  {
                    product.season
                  }
                </Accordion>
              )}
            </div>

            <div className="mt-7 flex flex-wrap gap-x-7 gap-y-3">
              <div className="flex items-center gap-2">
                <Package
                  className="size-3.5 !text-[#9a847b]"
                  strokeWidth={
                    1.3
                  }
                />

                <span className="text-[9px] !text-[#8b7770]">
                  {
                    activeVariants.length
                  }{" "}
                  {activeVariants.length ===
                  1
                    ? "size"
                    : "sizes"}{" "}
                  available
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Sparkles
                  className="size-3.5 !text-[#9a847b]"
                  strokeWidth={
                    1.3
                  }
                />

                <span className="text-[9px] !text-[#8b7770]">
                  {formatAudience(
                    product.audience
                  )}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* =====================================================
          NOTES
      ====================================================== */}

      <section className="bg-[#f1ece6] px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-[1350px]">
          <motion.div
            initial={{
              opacity: 0,
              y: 25,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              amount: 0.3,
            }}
            transition={{
              duration: 0.7,
            }}
            className="text-center"
          >
            <p className="text-[9px] font-semibold uppercase tracking-[0.3em] !text-[#775452]">
              Every scent has a
              story
            </p>

            <h2 className="mt-6 font-display text-[42px] font-normal tracking-[-0.03em] !text-[#392826] sm:text-[54px]">
              Get to know the
              notes.
            </h2>
          </motion.div>

          <div className="mt-14 grid lg:grid-cols-3">
            <NoteColumn
              number="01"
              title="Top notes"
              notes={
                product.topNotes ??
                []
              }
            />

            <NoteColumn
              number="02"
              title="Heart notes"
              notes={
                product.heartNotes ??
                []
              }
              bordered
            />

            <NoteColumn
              number="03"
              title="Base notes"
              notes={
                product.baseNotes ??
                []
              }
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          KEEP DISCOVERING
      ====================================================== */}

      {relatedProducts.length >
        0 && (
        <section className="bg-[#fbfaf7] px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
          <div className="mx-auto max-w-[1350px]">
            <div className="mb-10 flex items-end justify-between gap-8">
              <h2 className="font-display text-[44px] font-normal tracking-[-0.03em] !text-[#382725] sm:text-[54px]">
                Keep discovering.
              </h2>

              <Link
                href="/shop"
                className="group hidden items-center gap-5 border-b border-[#6b2230] pb-2 text-[10px] font-medium !text-[#6b2230] sm:flex"
              >
                All fragrances

                <ArrowRight
                  className="size-3.5 transition-transform group-hover:translate-x-1"
                  strokeWidth={
                    1.4
                  }
                />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-12 sm:gap-x-5 lg:grid-cols-4 lg:gap-x-6">
              {relatedProducts.map(
                (item) => (
                  <RelatedProduct
                    key={
                      item.id
                    }
                    product={
                      item
                    }
                  />
                )
              )}
            </div>

            <Link
              href="/shop"
              className="mt-10 inline-flex items-center gap-4 border-b border-[#6b2230] pb-2 text-[10px] font-medium !text-[#6b2230] sm:hidden"
            >
              All fragrances

              <ArrowRight
                className="size-3.5"
                strokeWidth={
                  1.4
                }
              />
            </Link>
          </div>
        </section>
      )}

      <CartDrawer />
    </div>
  );
}

/* =========================================================
   ACCORDION
========================================================= */

type AccordionProps = {
  title: string;
  children:
    ReactNode;
  open: boolean;
  onClick: () => void;
};

function Accordion({
  title,
  children,
  open,
  onClick,
}: AccordionProps) {
  return (
    <div className="border-b border-[#ded6d0]">
      <button
        type="button"
        onClick={
          onClick
        }
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="text-[10px] font-medium !text-[#473632]">
          {title}
        </span>

        <Plus
          className={`size-3.5 transition-transform duration-300 ${
            open
              ? "rotate-45"
              : ""
          }`}
          strokeWidth={
            1.4
          }
        />
      </button>

      <motion.div
        initial={false}
        animate={{
          height:
            open
              ? "auto"
              : 0,

          opacity:
            open
              ? 1
              : 0,
        }}
        transition={{
          duration:
            0.3,
        }}
        className="overflow-hidden"
      >
        <div className="max-w-lg pb-5 text-[11px] leading-6 !text-[#89766f]">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

/* =========================================================
   DETAIL META
========================================================= */

function DetailMeta({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[8px] uppercase tracking-[0.14em] !text-[#9a8982]">
        {label}
      </p>

      <p className="mt-1.5 text-[10px] !text-[#4a3732]">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   NOTES
========================================================= */

type NoteColumnProps = {
  number: string;
  title: string;
  notes: string[];
  bordered?: boolean;
};

function NoteColumn({
  number,
  title,
  notes,
  bordered = false,
}: NoteColumnProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
      }}
      transition={{
        duration: 0.6,
      }}
      className={`
        px-4
        py-8
        text-center

        sm:px-10
        lg:px-14

        ${
          bordered
            ? "border-y border-[#d9cec7] lg:border-x lg:border-y-0"
            : ""
        }
      `}
    >
      <p className="text-[9px] !text-[#a37768]">
        {number}
      </p>

      <h3 className="mt-6 font-display text-[27px] font-normal !text-[#3c2c28] sm:text-[30px]">
        {title}
      </h3>

      {notes.length > 0 ? (
        <p className="mt-5 text-[11px] font-medium leading-6 !text-[#56433e]">
          {notes.join(
            " · "
          )}
        </p>
      ) : (
        <p className="mt-5 text-[10px] !text-[#9a8982]">
          No notes listed.
        </p>
      )}
    </motion.div>
  );
}

/* =========================================================
   RELATED PRODUCT
========================================================= */

function RelatedProduct({
  product,
}: {
  product: Product;
}) {
  const image =
    getPrimaryImage(
      product.images
    );

  const variant =
    product.variants?.find(
      (item) =>
        item.active &&
        getVariantAvailableStock(
          item
        ) > 0
    ) ??
    product.variants?.find(
      (item) =>
        item.active
    ) ??
    product.variants?.[0] ??
    null;

  const availableStock =
    variant
      ? getVariantAvailableStock(
          variant
        )
      : 0;

  const price =
    product.startingPrice ??
    (
      variant
        ? Number(
            variant.price
          )
        : null
    );

  const [
    isWishlisted,
    setIsWishlisted,
  ] = useState(false);

  const [
    addingToBag,
    setAddingToBag,
  ] = useState(false);

  useEffect(() => {
    const wishlist =
      readStorageList<StoredWishlistItem>(
        WISHLIST_STORAGE_KEY
      );

    setIsWishlisted(
      wishlist.some(
        (item) =>
          item.productId ===
          product.id
      )
    );
  }, [product.id]);

  async function addRelatedToBag() {
    if (
      addingToBag
    ) {
      return;
    }

    if (
      !variant ||
      availableStock <= 0
    ) {
      toast.error(
        "This fragrance is currently out of stock."
      );

      return;
    }

    const itemPrice =
      Number(
        variant.price
      );

    if (
      !Number.isFinite(
        itemPrice
      )
    ) {
      toast.error(
        "This fragrance does not have a valid price."
      );

      return;
    }

    setAddingToBag(
      true
    );

    try {
      const response =
        await cartService.add(
          variant.id,
          1
        );

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
              itemPrice
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
      setAddingToBag(
        false
      );
    }
  }

  function toggleRelatedWishlist() {
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
                image,

              startingPrice:
                price,

              createdAt:
                new Date().toISOString(),
            },
          ];

    writeStorageList(
      WISHLIST_STORAGE_KEY,
      nextWishlist
    );

    setIsWishlisted(
      !exists
    );

    dispatchCommerceEvent(
      WISHLIST_UPDATED_EVENT,
      {
        count:
          nextWishlist.length,
      }
    );

    toast.success(
      exists
        ? `${product.name} removed from your wishlist`
        : `${product.name} saved to your wishlist`
    );
  }

  return (
    <article className="group/product min-w-0">
      <div className="relative overflow-hidden bg-[#e6e2dc]">
        <Link
          href={`/perfumes/${product.slug}`}
        >
          <div className="relative aspect-[4/5]">
            {image ? (
              <Image
                src={
                  image
                }
                alt={
                  product.name
                }
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                unoptimized
                className="object-cover transition-transform duration-[900ms] group-hover/product:scale-[1.025]"
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
          <span className="absolute left-3 top-3 z-20 bg-[#fbfaf7]/95 px-3 py-2 text-[8px] font-medium uppercase tracking-[0.14em] !text-[#574842]">
            {
              product.badge
            }
          </span>
        )}

        <button
          type="button"
          onClick={
            toggleRelatedWishlist
          }
          aria-label={
            isWishlisted
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
          aria-pressed={
            isWishlisted
          }
          className={`
            absolute
            right-3
            top-3
            z-20
            flex
            size-9
            items-center
            justify-center
            rounded-full
            backdrop-blur
            transition-all

            ${
              isWishlisted
                ? "bg-[#6b2230] !text-white"
                : "bg-[#fbfaf7]/90 !text-[#6a4d46] hover:bg-white"
            }
          `}
        >
          <Heart
            className={`size-[17px] ${
              isWishlisted
                ? "fill-current"
                : ""
            }`}
            strokeWidth={
              1.35
            }
          />
        </button>

        <div className="absolute inset-x-0 bottom-0 translate-y-0 transition-transform duration-500 md:translate-y-full md:group-hover/product:translate-y-0">
          <button
            type="button"
            disabled={
              !variant ||
              availableStock <= 0 ||
              addingToBag
            }
            onClick={() =>
              void addRelatedToBag()
            }
            className="flex h-[50px] w-full items-center justify-between bg-[#fbfaf7]/95 px-4 text-[10px] !text-[#3b2926] backdrop-blur disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span>
              {addingToBag
                ? "Adding..."
                : availableStock >
                    0
                  ? "Add to bag"
                  : "Out of stock"}
            </span>

            {addingToBag ? (
              <LoaderCircle
                className="size-3.5 animate-spin"
                strokeWidth={
                  1.4
                }
              />
            ) : (
              <ShoppingBag
                className="size-3.5"
                strokeWidth={
                  1.4
                }
              />
            )}
          </button>
        </div>
      </div>

      <div className="pt-4">
        <div className="flex justify-between gap-2">
          <p className="truncate text-[8px] uppercase tracking-[0.14em] !text-[#9a756c]">
            {
              product.family
            }{" "}
            ·{" "}
            {
              product.concentration
            }
          </p>

          {variant && (
            <span className="text-[8px] !text-[#9a756c]">
              {
                variant.size
              }
            </span>
          )}
        </div>

        <Link
          href={`/perfumes/${product.slug}`}
        >
          <h3 className="mt-3 font-display text-[24px] font-normal leading-none !text-[#382321] sm:text-[27px]">
            {
              product.name
            }
          </h3>
        </Link>

        {product.shortDescription && (
          <p className="mt-2 hidden text-[11px] leading-5 !text-[#8c7871] sm:block">
            {
              product.shortDescription
            }
          </p>
        )}

        <p className="mt-3 text-[11px] font-medium !text-[#382824]">
          {price !== null &&
          Number.isFinite(
            price
          )
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
  detail: {
    count: number;
  }
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
        detail,
      }
    )
  );
}

/* =========================================================
   HELPERS
========================================================= */

function getVariantAvailableStock(
  variant: Product["variants"][number]
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
  images:
    | ProductImage[]
    | undefined
): string | null {
  const image =
    images?.[0];

  if (
    !image?.url
  ) {
    return null;
  }

  const url =
    image.url.trim();

  return url || null;
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
