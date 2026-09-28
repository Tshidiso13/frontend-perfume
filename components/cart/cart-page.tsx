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
  ArrowRight,
  Heart,
  LoaderCircle,
  Minus,
  Package,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";

import {
  motion,
} from "framer-motion";

import {
  toast,
} from "sonner";

import {
  cartService,
  type CartItem,
  type CartResponse,
  type SyncCartItem,
} from "@/services/cart.service";

/* =========================================================
   LEGACY LOCAL CART

   Existing storefront Add-to-Bag buttons currently write
   these fields to localStorage. The new Cart page migrates
   those rows to the authenticated backend cart once.
========================================================= */

type LegacyStoredCartItem = {
  variantId?: string;
  quantity?: number;
};

const LEGACY_CART_STORAGE_KEY =
  "elan_cart";

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

/* =========================================================
   PAGE
========================================================= */

export function CartPage() {
  const [
    cart,
    setCart,
  ] =
    useState<CartResponse | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] =
    useState(
      true
    );

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );

  const [
    updatingIds,
    setUpdatingIds,
  ] =
    useState<
      Set<string>
    >(
      () =>
        new Set()
    );

  /* =======================================================
     APPLY BACKEND CART RESPONSE
  ======================================================== */

  const applyCart =
    useCallback(
      (
        response: CartResponse
      ) => {
        setCart(
          response
        );

        if (
          typeof window !==
          "undefined"
        ) {
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
        }
      },
      []
    );

  /* =======================================================
     LOAD / MIGRATE CART
  ======================================================== */

  const loadCart =
    useCallback(
      async () => {
        setLoading(
          true
        );

        setError(
          null
        );

        try {
          const legacy =
            readStorageList<LegacyStoredCartItem>(
              LEGACY_CART_STORAGE_KEY
            );

          const validLegacy =
            legacy
              .map(
                (
                  item
                ): SyncCartItem | null => {
                  const variantId =
                    item.variantId?.trim();

                  const quantity =
                    Number(
                      item.quantity ??
                        1
                    );

                  if (
                    !variantId ||
                    !Number.isFinite(
                      quantity
                    ) ||
                    quantity <
                      1
                  ) {
                    return null;
                  }

                  return {
                    variantId,

                    quantity:
                      Math.min(
                        99,
                        Math.max(
                          1,
                          Math.floor(
                            quantity
                          )
                        )
                      ),
                  };
                }
              )
              .filter(
                (
                  item
                ): item is SyncCartItem =>
                  item !==
                  null
              );

          if (
            validLegacy.length >
            0
          ) {
            const response =
              await cartService.sync(
                validLegacy
              );

            applyCart(
              response
            );

            /*
             * Only clear browser cart after the backend
             * has successfully accepted the migration.
             */
            window.localStorage.removeItem(
              LEGACY_CART_STORAGE_KEY
            );
          } else {
            const response =
              await cartService.getCart();

            applyCart(
              response
            );
          }
        } catch (
          error
        ) {
          setError(
            error instanceof
              Error
              ? error.message
              : "Unable to load your bag."
          );
        } finally {
          setLoading(
            false
          );
        }
      },
      [
        applyCart,
      ]
    );

  useEffect(
    () => {
      void loadCart();
    },
    [
      loadCart,
    ]
  );

  /* =======================================================
     DERIVED STATE
  ======================================================== */

  const items =
    cart?.data ??
    [];

  const summary =
    cart?.summary ??
    {
      itemCount:
        0,

      subtotal:
        0,

      freeDeliveryThreshold:
        0,

      amountUntilFreeDelivery:
        0,

      freeDeliveryUnlocked:
        false,
    };

  const deliveryProgress =
    useMemo(
      () => {
        if (
          summary.freeDeliveryThreshold <=
          0
        ) {
          return 0;
        }

        return Math.min(
          100,
          (
            summary.subtotal /
            summary.freeDeliveryThreshold
          ) *
            100
        );
      },
      [
        summary.subtotal,
        summary.freeDeliveryThreshold,
      ]
    );

  const hasUnavailableItems =
    useMemo(
      () =>
        items.some(
          (
            item
          ) =>
            !item.canPurchase
        ),
      [
        items,
      ]
    );

  /* =======================================================
     MUTATION HELPERS
  ======================================================== */

  function setUpdating(
    itemId: string,
    value: boolean
  ) {
    setUpdatingIds(
      (
        current
      ) => {
        const next =
          new Set(
            current
          );

        if (
          value
        ) {
          next.add(
            itemId
          );
        } else {
          next.delete(
            itemId
          );
        }

        return next;
      }
    );
  }

  async function changeQuantity(
    item: CartItem,
    quantity: number
  ) {
    if (
      updatingIds.has(
        item.id
      )
    ) {
      return;
    }

    if (
      quantity <
      1
    ) {
      return;
    }

    if (
      quantity >
      item.availableStock
    ) {
      toast.error(
        `Only ${item.availableStock} ${
          item.availableStock ===
          1
            ? "unit is"
            : "units are"
        } currently available.`
      );

      return;
    }

    setUpdating(
      item.id,
      true
    );

    try {
      const response =
        await cartService.updateQuantity(
          item.id,
          quantity
        );

      applyCart(
        response
      );
    } catch (
      error
    ) {
      toast.error(
        error instanceof
          Error
          ? error.message
          : "Unable to update quantity."
      );
    } finally {
      setUpdating(
        item.id,
        false
      );
    }
  }

  async function removeItem(
    item: CartItem
  ) {
    if (
      updatingIds.has(
        item.id
      )
    ) {
      return;
    }

    setUpdating(
      item.id,
      true
    );

    const toastId =
      toast.loading(
        `Removing ${item.name}...`
      );

    try {
      const response =
        await cartService.remove(
          item.id
        );

      applyCart(
        response
      );

      toast.success(
        `${item.name} removed from your bag`,
        {
          id:
            toastId,
        }
      );
    } catch (
      error
    ) {
      toast.error(
        error instanceof
          Error
          ? error.message
          : "Unable to remove this fragrance.",
        {
          id:
            toastId,
        }
      );
    } finally {
      setUpdating(
        item.id,
        false
      );
    }
  }

  async function moveToWishlist(
    item: CartItem
  ) {
    if (
      updatingIds.has(
        item.id
      )
    ) {
      return;
    }

    setUpdating(
      item.id,
      true
    );

    const toastId =
      toast.loading(
        `Saving ${item.name} for later...`
      );

    try {
      const response =
        await cartService.moveToWishlist(
          item.id
        );

      applyCart(
        response
      );

      window.dispatchEvent(
        new CustomEvent(
          WISHLIST_UPDATED_EVENT
        )
      );

      toast.success(
        response.message,
        {
          id:
            toastId,
        }
      );
    } catch (
      error
    ) {
      toast.error(
        error instanceof
          Error
          ? error.message
          : "Unable to move this fragrance to your wishlist.",
        {
          id:
            toastId,
        }
      );
    } finally {
      setUpdating(
        item.id,
        false
      );
    }
  }

  /* =======================================================
     LOADING
  ======================================================== */

  if (
    loading
  ) {
    return (
      <section className="flex min-h-[70vh] flex-col items-center justify-center bg-[#fbfaf7]">
        <LoaderCircle
          className="size-6 animate-spin !text-[#5a1425]"
          strokeWidth={
            1.4
          }
        />

        <p className="mt-4 text-[9px] !text-[#88766f]">
          Loading your bag...
        </p>
      </section>
    );
  }

  /* =======================================================
     ERROR
  ======================================================== */

  if (
    error ||
    !cart
  ) {
    return (
      <section className="flex min-h-[70vh] flex-col items-center justify-center bg-[#fbfaf7] px-5 py-20 text-center">
        <ShoppingBag
          className="size-6 !text-[#9c7a70]"
          strokeWidth={
            1.2
          }
        />

        <h1 className="mt-6 font-display text-[42px] !text-[#382725]">
          We couldn&apos;t load your bag.
        </h1>

        <p className="mt-4 max-w-md text-[11px] leading-6 !text-[#8d7b74]">
          {error ??
            "Please try again."}
        </p>

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() =>
              void loadCart()
            }
            className="bg-[#571628] px-6 py-3 text-[10px] font-medium !text-white"
          >
            Try again
          </button>

          <Link
            href="/login"
            className="border border-[#d8cfc9] px-6 py-3 text-[10px] font-medium !text-[#5a1425]"
          >
            Sign in
          </Link>
        </div>
      </section>
    );
  }

  if (
    items.length ===
    0
  ) {
    return (
      <EmptyCart />
    );
  }

  return (
    <section className="min-h-screen bg-[#fbfaf7]">
      <div className="mx-auto max-w-[1420px] px-5 pb-24 pt-10 sm:px-8 lg:px-10 lg:pb-32 xl:px-12">
        {/* BREADCRUMB */}

        <nav
          aria-label="Breadcrumb"
          className="mb-10 flex items-center gap-1.5 text-[9px] !text-[#98877f]"
        >
          <Link
            href="/"
            className="transition-colors hover:!text-[#6b2230]"
          >
            Home
          </Link>

          <span
            aria-hidden="true"
          >
            /
          </span>

          <span
            aria-current="page"
            className="font-medium !text-[#5a1425]"
          >
            Bag
          </span>
        </nav>

        {/* HEADING */}

        <motion.div
          initial={{
            opacity:
              0,

            y:
              18,
          }}
          animate={{
            opacity:
              1,

            y:
              0,
          }}
          transition={{
            duration:
              0.7,

            ease: [
              0.22,
              1,
              0.36,
              1,
            ],
          }}
          className="mb-10"
        >
          <p className="mb-4 text-[9px] font-medium uppercase tracking-[0.32em] !text-[#8f6258]">
            Almost yours
          </p>

          <div className="flex flex-wrap items-end justify-between gap-5">
            <h1 className="font-display text-[50px] font-normal leading-none tracking-[-0.04em] !text-[#342725] sm:text-[62px] lg:text-[72px]">
              Your bag.
            </h1>

            <p className="pb-1 text-[10px] !text-[#8b7972]">
              {
                summary.itemCount
              }{" "}
              {summary.itemCount ===
              1
                ? "item"
                : "items"}
            </p>
          </div>
        </motion.div>

        <div className="h-px bg-[#ded6cf]" />

        {/* FREE DELIVERY */}

        {summary.freeDeliveryThreshold >
          0 && (
          <>
            <div className="py-6">
              <div className="flex items-center justify-between gap-5">
                <p className="text-[10px] !text-[#715d56]">
                  {summary.freeDeliveryUnlocked ? (
                    <>
                      You&apos;ve unlocked{" "}
                      <strong className="font-medium !text-[#5b2732]">
                        free delivery.
                      </strong>
                    </>
                  ) : (
                    <>
                      You&apos;re{" "}
                      <strong className="font-medium !text-[#5b2732]">
                        {currency.format(
                          summary.amountUntilFreeDelivery
                        )}
                      </strong>{" "}
                      away from free delivery.
                    </>
                  )}
                </p>

                <span className="hidden text-[9px] !text-[#9a8982] sm:block">
                  Free from{" "}
                  {currency.format(
                    summary.freeDeliveryThreshold
                  )}
                </span>
              </div>

              <div className="mt-4 h-px overflow-hidden bg-[#e1d9d3]">
                <motion.div
                  initial={{
                    width:
                      0,
                  }}
                  animate={{
                    width:
                      `${deliveryProgress}%`,
                  }}
                  transition={{
                    duration:
                      0.7,

                    ease: [
                      0.22,
                      1,
                      0.36,
                      1,
                    ],
                  }}
                  className="h-full bg-[#6b2230]"
                />
              </div>
            </div>

            <div className="h-px bg-[#ded6cf]" />
          </>
        )}

        {/* CART CONTENT */}

        <div className="grid gap-14 pt-8 lg:grid-cols-[1fr_390px] lg:gap-16 xl:gap-24">
          {/* ITEMS */}

          <div>
            {items.map(
              (
                item,
                index
              ) => {
                const updating =
                  updatingIds.has(
                    item.id
                  );

                return (
                  <motion.article
                    key={
                      item.id
                    }
                    initial={{
                      opacity:
                        0,

                      y:
                        18,
                    }}
                    animate={{
                      opacity:
                        1,

                      y:
                        0,
                    }}
                    transition={{
                      duration:
                        0.55,

                      delay:
                        index *
                        0.07,

                      ease: [
                        0.22,
                        1,
                        0.36,
                        1,
                      ],
                    }}
                    className="grid grid-cols-[105px_1fr] gap-5 border-b border-[#ded6cf] py-7 first:pt-0 sm:grid-cols-[150px_1fr] sm:gap-7"
                  >
                    {/* IMAGE */}

                    <Link
                      href={`/perfumes/${item.slug}`}
                      className="relative aspect-[4/5] overflow-hidden bg-[#e8e3dd]"
                    >
                      {item.imageUrl ? (
                        <Image
                          src={
                            item.imageUrl
                          }
                          alt={
                            item.name
                          }
                          fill
                          sizes="150px"
                          unoptimized
                          className="object-cover transition-transform duration-700 hover:scale-[1.025]"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center">
                          <Package
                            className="size-6 !text-[#aa9991]"
                            strokeWidth={
                              1.2
                            }
                          />
                        </span>
                      )}
                    </Link>

                    {/* INFO */}

                    <div className="flex min-w-0 flex-col">
                      <div className="flex justify-between gap-4">
                        <div>
                          <p className="text-[8px] font-medium uppercase tracking-[0.16em] !text-[#9a756c]">
                            {
                              item.family
                            }{" "}
                            ·{" "}
                            {
                              item.concentration
                            }
                          </p>

                          <Link
                            href={`/perfumes/${item.slug}`}
                          >
                            <h2 className="mt-2 font-display text-[24px] font-normal leading-none !text-[#382321] transition-opacity hover:opacity-60 sm:text-[30px]">
                              {
                                item.name
                              }
                            </h2>
                          </Link>

                          <p className="mt-3 text-[10px] !text-[#88756e]">
                            {
                              item.size
                            }
                          </p>

                          {!item.canPurchase && (
                            <p className="mt-3 text-[9px] font-medium !text-[#9b4d4d]">
                              {item.availableStock <=
                              0
                                ? "Currently out of stock"
                                : `Only ${item.availableStock} available`}
                            </p>
                          )}
                        </div>

                        <p className="shrink-0 text-[12px] font-medium !text-[#382824]">
                          {currency.format(
                            item.lineTotal
                          )}
                        </p>
                      </div>

                      {/* CONTROLS */}

                      <div className="mt-auto flex flex-wrap items-end justify-between gap-5 pt-7">
                        <div>
                          <p className="mb-2 text-[8px] uppercase tracking-[0.16em] !text-[#9b8982]">
                            Quantity
                          </p>

                          <div className="flex h-[40px] w-[116px] items-center justify-between border border-[#d8cfc9]">
                            <button
                              type="button"
                              disabled={
                                updating ||
                                item.quantity <=
                                  1
                              }
                              onClick={() =>
                                void changeQuantity(
                                  item,
                                  item.quantity -
                                    1
                                )
                              }
                              aria-label={`Decrease ${item.name} quantity`}
                              className="flex h-full w-9 items-center justify-center transition-colors hover:bg-[#f0ebe6] disabled:cursor-not-allowed disabled:opacity-35"
                            >
                              <Minus
                                className="size-3"
                                strokeWidth={
                                  1.4
                                }
                              />
                            </button>

                            <span className="text-[11px] !text-[#453632]">
                              {updating ? (
                                <LoaderCircle
                                  className="size-3.5 animate-spin"
                                  strokeWidth={
                                    1.4
                                  }
                                />
                              ) : (
                                item.quantity
                              )}
                            </span>

                            <button
                              type="button"
                              disabled={
                                updating ||
                                !item.canPurchase ||
                                item.quantity >=
                                  item.availableStock
                              }
                              onClick={() =>
                                void changeQuantity(
                                  item,
                                  item.quantity +
                                    1
                                )
                              }
                              aria-label={`Increase ${item.name} quantity`}
                              className="flex h-full w-9 items-center justify-center transition-colors hover:bg-[#f0ebe6] disabled:cursor-not-allowed disabled:opacity-35"
                            >
                              <Plus
                                className="size-3"
                                strokeWidth={
                                  1.4
                                }
                              />
                            </button>
                          </div>

                          <p className="mt-2 text-[8px] !text-[#9d8d86]">
                            {
                              item.availableStock
                            }{" "}
                            available
                          </p>
                        </div>

                        <div className="flex items-center gap-5">
                          <button
                            type="button"
                            disabled={
                              updating
                            }
                            onClick={() =>
                              void moveToWishlist(
                                item
                              )
                            }
                            className="group flex items-center gap-2 text-[9px] !text-[#79655e] transition-colors hover:!text-[#6b2230] disabled:opacity-45"
                          >
                            <Heart
                              className="size-3.5"
                              strokeWidth={
                                1.4
                              }
                            />

                            <span className="hidden sm:inline">
                              Save for later
                            </span>
                          </button>

                          <button
                            type="button"
                            disabled={
                              updating
                            }
                            onClick={() =>
                              void removeItem(
                                item
                              )
                            }
                            aria-label={`Remove ${item.name}`}
                            className="group flex items-center gap-2 text-[9px] !text-[#927f78] transition-colors hover:!text-[#6b2230] disabled:opacity-45"
                          >
                            <Trash2
                              className="size-3.5"
                              strokeWidth={
                                1.4
                              }
                            />

                            <span className="hidden sm:inline">
                              Remove
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                );
              }
            )}

            <Link
              href="/shop"
              className="group mt-8 inline-flex items-center gap-4 border-b border-[#6b2230] pb-2 text-[10px] font-medium !text-[#6b2230]"
            >
              Continue discovering

              <ArrowRight
                className="size-3.5 transition-transform group-hover:translate-x-1"
                strokeWidth={
                  1.4
                }
              />
            </Link>
          </div>

          {/* SUMMARY */}

          <aside className="lg:sticky lg:top-[145px] lg:self-start">
            <div className="bg-[#f1ece6] p-6 sm:p-8">
              <p className="text-[9px] font-semibold uppercase tracking-[0.28em] !text-[#8e655b]">
                Your order
              </p>

              <h2 className="mt-4 font-display text-[36px] font-normal leading-none !text-[#392825]">
                A little closer.
              </h2>

              <div className="mt-8 space-y-4 border-b border-[#d8cec7] pb-6">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="!text-[#75645e]">
                    Subtotal
                  </span>

                  <span className="font-medium !text-[#392b27]">
                    {currency.format(
                      summary.subtotal
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="!text-[#75645e]">
                    Delivery
                  </span>

                  <span className="!text-[#917c74]">
                    Calculated at checkout
                  </span>
                </div>
              </div>

              <div className="flex items-end justify-between py-6">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.16em] !text-[#927d75]">
                    Total
                  </p>

                  <p className="mt-1 text-[9px] !text-[#9d8d86]">
                    Excluding delivery
                  </p>
                </div>

                <p className="font-display text-[28px] !text-[#382623]">
                  {currency.format(
                    summary.subtotal
                  )}
                </p>
              </div>

              {hasUnavailableItems ? (
                <div className="border border-[#dfc7c7] bg-[#f8eeee] px-4 py-4 text-[9px] leading-5 !text-[#8b4d4d]">
                  Update or remove unavailable items before checkout.
                </div>
              ) : (
                <Link
                  href="/checkout"
                  className="group flex min-h-[56px] w-full items-center justify-between bg-[#571628] px-6 text-[11px] font-medium !text-white transition-colors hover:bg-[#681d31]"
                >
                  Secure checkout

                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-1"
                    strokeWidth={
                      1.4
                    }
                  />
                </Link>
              )}

              <div className="mt-6 space-y-3">
                <div className="flex items-start gap-3">
                  <ShoppingBag
                    className="mt-0.5 size-3.5 shrink-0 !text-[#9c7a70]"
                    strokeWidth={
                      1.35
                    }
                  />

                  <p className="text-[9px] leading-5 !text-[#85736c]">
                    Product prices and stock are loaded from the backend before checkout.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <Heart
                    className="mt-0.5 size-3.5 shrink-0 !text-[#9c7a70]"
                    strokeWidth={
                      1.35
                    }
                  />

                  <p className="text-[9px] leading-5 !text-[#85736c]">
                    Save something for later and it moves into your account wishlist.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 border border-[#ded6cf] p-5">
              <p className="text-[9px] font-medium uppercase tracking-[0.2em] !text-[#8e655b]">
                Delivery
              </p>

              <p className="mt-3 text-[10px] leading-5 !text-[#86746d]">
                Aramex and PAXI options will be calculated at checkout from the customer&apos;s delivery details.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   EMPTY CART
========================================================= */

function EmptyCart() {
  return (
    <section className="flex min-h-[70vh] items-center justify-center bg-[#fbfaf7] px-5 py-20">
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
            0.7,

          ease: [
            0.22,
            1,
            0.36,
            1,
          ],
        }}
        className="mx-auto max-w-xl text-center"
      >
        <ShoppingBag
          className="mx-auto size-6 !text-[#9c7a70]"
          strokeWidth={
            1.2
          }
        />

        <p className="mt-7 text-[9px] font-medium uppercase tracking-[0.3em] !text-[#9a6c62]">
          Your bag is waiting
        </p>

        <h1 className="mt-5 font-display text-[46px] font-normal leading-[0.95] tracking-[-0.04em] !text-[#382725] sm:text-[60px]">
          Nothing has caught your eye yet.
        </h1>

        <p className="mx-auto mt-5 max-w-md text-[12px] leading-6 !text-[#8d7b74]">
          Take another look around. Your next signature might be one fragrance away.
        </p>

        <Link
          href="/shop"
          className="group mx-auto mt-8 inline-flex min-h-[50px] items-center gap-8 bg-[#571628] px-6 text-[11px] font-medium !text-white"
        >
          Explore fragrances

          <ArrowRight
            className="size-4 transition-transform group-hover:translate-x-1"
            strokeWidth={
              1.4
            }
          />
        </Link>
      </motion.div>
    </section>
  );
}

/* =========================================================
   STORAGE
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
      ? (
          parsed as T[]
        )
      : [];
  } catch {
    return [];
  }
}
