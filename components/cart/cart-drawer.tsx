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
  X,
} from "lucide-react";

import {
  toast,
} from "sonner";

import {
  cartService,
  type CartItem,
  type CartResponse,
} from "@/services/cart.service";

export const CART_DRAWER_OPEN_EVENT =
  "elan:cart-drawer-open";

export const CART_UPDATED_EVENT =
  "elan:cart-updated";

export const WISHLIST_UPDATED_EVENT =
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

export function CartDrawer() {
  const [
    open,
    setOpen,
  ] = useState(false);

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
  ] = useState(false);

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
    useState<Set<string>>(
      () => new Set()
    );

  const loadCart =
    useCallback(
      async () => {
        setLoading(true);
        setError(null);

        try {
          const response =
            await cartService.getCart();

          setCart(
            response
          );
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
          setLoading(false);
        }
      },
      []
    );

  useEffect(() => {
    function handleOpen() {
      setOpen(true);
      void loadCart();
    }

    function handleCartUpdated() {
      if (open) {
        void loadCart();
      }
    }

    window.addEventListener(
      CART_DRAWER_OPEN_EVENT,
      handleOpen
    );

    window.addEventListener(
      CART_UPDATED_EVENT,
      handleCartUpdated
    );

    return () => {
      window.removeEventListener(
        CART_DRAWER_OPEN_EVENT,
        handleOpen
      );

      window.removeEventListener(
        CART_UPDATED_EVENT,
        handleCartUpdated
      );
    };
  }, [
    loadCart,
    open,
  ]);

  useEffect(() => {
    document.body.style.overflow =
      open
        ? "hidden"
        : "";

    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (
        event.key ===
        "Escape"
      ) {
        setOpen(false);
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        "";

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    open,
  ]);

  const items =
    cart?.data ??
    [];

  const summary =
    cart?.summary;

  const itemCount =
    summary?.itemCount ??
    0;

  const subtotal =
    summary?.subtotal ??
    0;

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

  function broadcastCart(
    response: CartResponse
  ) {
    setCart(
      response
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
  }

  async function changeQuantity(
    item: CartItem,
    quantity: number
  ) {
    if (
      updatingIds.has(
        item.id
      ) ||
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
        } available.`
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

      broadcastCart(
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

    try {
      const response =
        await cartService.remove(
          item.id
        );

      broadcastCart(
        response
      );

      toast.success(
        `${item.name} removed from your bag`
      );
    } catch (
      error
    ) {
      toast.error(
        error instanceof
          Error
          ? error.message
          : "Unable to remove this fragrance."
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

    try {
      const response =
        await cartService.moveToWishlist(
          item.id
        );

      broadcastCart(
        response
      );

      window.dispatchEvent(
        new CustomEvent(
          WISHLIST_UPDATED_EVENT
        )
      );

      toast.success(
        response.message
      );
    } catch (
      error
    ) {
      toast.error(
        error instanceof
          Error
          ? error.message
          : "Unable to move this fragrance to your wishlist."
      );
    } finally {
      setUpdating(
        item.id,
        false
      );
    }
  }

  return (
    <>
      {/* BACKDROP */}

      <button
        type="button"
        aria-label="Close shopping bag"
        onClick={() =>
          setOpen(false)
        }
        className={`
          fixed inset-0 z-[100]
          bg-black/35
          backdrop-blur-[2px]
          transition-opacity
          duration-300

          ${
            open
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }
        `}
      />

      {/* DRAWER */}

      <aside
        aria-hidden={
          !open
        }
        aria-label="Shopping bag"
        className={`
          fixed
          right-0
          top-0
          z-[110]
          flex
          h-dvh
          w-full
          flex-col
          bg-[#fbfaf7]
          shadow-[-24px_0_70px_rgba(35,18,16,0.16)]

          transition-transform
          duration-500
          ease-[cubic-bezier(0.22,1,0.36,1)]

          sm:w-[92%]
          sm:max-w-[480px]
          lg:max-w-[520px]

          ${
            open
              ? "translate-x-0"
              : "translate-x-full"
          }
        `}
      >
        {/* HEADER */}

        <div className="flex min-h-[84px] items-center justify-between border-b border-[#e6ddd5] px-5 sm:px-7">
          <div>
            <p className="text-[8px] font-semibold uppercase tracking-[0.24em] !text-[#9a6c62]">
              Your bag
            </p>

            <h2 className="mt-1 font-display text-[28px] leading-none !text-[#382725]">
              {itemCount}{" "}
              {itemCount ===
              1
                ? "item"
                : "items"}
            </h2>
          </div>

          <button
            type="button"
            onClick={() =>
              setOpen(false)
            }
            aria-label="Close bag"
            className="flex size-10 items-center justify-center rounded-full !text-[#493a35] transition-colors hover:bg-[#f1ebe5]"
          >
            <X
              className="size-5"
              strokeWidth={
                1.4
              }
            />
          </button>
        </div>

        {/* CONTENT */}

        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex min-h-[360px] flex-col items-center justify-center">
              <LoaderCircle
                className="size-5 animate-spin !text-[#5a1425]"
                strokeWidth={
                  1.4
                }
              />

              <p className="mt-3 text-[9px] !text-[#8e7c75]">
                Loading your bag...
              </p>
            </div>
          )}

          {!loading &&
            error && (
              <div className="flex min-h-[360px] flex-col items-center justify-center px-8 text-center">
                <ShoppingBag
                  className="size-6 !text-[#a28980]"
                  strokeWidth={
                    1.2
                  }
                />

                <p className="mt-5 font-display text-[28px] !text-[#382725]">
                  We couldn&apos;t load your bag.
                </p>

                <p className="mt-3 text-[9px] leading-5 !text-[#8d7b74]">
                  {
                    error
                  }
                </p>

                <button
                  type="button"
                  onClick={() =>
                    void loadCart()
                  }
                  className="mt-5 bg-[#571628] px-5 py-3 text-[9px] font-medium !text-white"
                >
                  Try again
                </button>
              </div>
            )}

          {!loading &&
            !error &&
            items.length ===
              0 && (
              <div className="flex min-h-[390px] flex-col items-center justify-center px-8 text-center">
                <ShoppingBag
                  className="size-6 !text-[#a28980]"
                  strokeWidth={
                    1.2
                  }
                />

                <p className="mt-5 font-display text-[30px] !text-[#382725]">
                  Your bag is empty.
                </p>

                <p className="mt-3 max-w-xs text-[10px] leading-5 !text-[#8d7b74]">
                  Find a fragrance worth remembering and add it to your bag.
                </p>

                <Link
                  href="/shop"
                  onClick={() =>
                    setOpen(false)
                  }
                  className="mt-6 inline-flex min-h-[46px] items-center gap-6 bg-[#571628] px-5 text-[10px] font-medium !text-white"
                >
                  Explore fragrances

                  <ArrowRight
                    className="size-4"
                    strokeWidth={
                      1.4
                    }
                  />
                </Link>
              </div>
            )}

          {!loading &&
            !error &&
            items.length >
              0 && (
              <div className="px-5 sm:px-7">
                {items.map(
                  (
                    item
                  ) => {
                    const updating =
                      updatingIds.has(
                        item.id
                      );

                    return (
                      <article
                        key={
                          item.id
                        }
                        className="grid grid-cols-[88px_1fr] gap-4 border-b border-[#e5ddd6] py-6 sm:grid-cols-[105px_1fr]"
                      >
                        <Link
                          href={`/perfumes/${item.slug}`}
                          onClick={() =>
                            setOpen(false)
                          }
                          className="relative aspect-[4/5] overflow-hidden bg-[#e9e3dd]"
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
                              sizes="105px"
                              unoptimized
                              className="object-cover"
                            />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center">
                              <Package
                                className="size-5 !text-[#ad9a92]"
                                strokeWidth={
                                  1.2
                                }
                              />
                            </span>
                          )}
                        </Link>

                        <div className="min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-[8px] uppercase tracking-[0.14em] !text-[#9a756c]">
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
                                onClick={() =>
                                  setOpen(false)
                                }
                              >
                                <h3 className="mt-1.5 truncate font-display text-[21px] leading-none !text-[#382725] sm:text-[24px]">
                                  {
                                    item.name
                                  }
                                </h3>
                              </Link>

                              <p className="mt-2 text-[9px] !text-[#89766f]">
                                {
                                  item.size
                                }
                              </p>
                            </div>

                            <p className="shrink-0 text-[10px] font-medium !text-[#382824]">
                              {currency.format(
                                item.lineTotal
                              )}
                            </p>
                          </div>

                          {!item.canPurchase && (
                            <p className="mt-2 text-[8px] font-medium !text-[#984a4a]">
                              {item.availableStock <=
                              0
                                ? "Out of stock"
                                : `Only ${item.availableStock} available`}
                            </p>
                          )}

                          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex h-[36px] w-[104px] items-center justify-between border border-[#d8cfc9]">
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
                                className="flex h-full w-8 items-center justify-center disabled:opacity-30"
                                aria-label={`Decrease ${item.name} quantity`}
                              >
                                <Minus
                                  className="size-3"
                                  strokeWidth={
                                    1.4
                                  }
                                />
                              </button>

                              <span className="text-[10px] !text-[#463733]">
                                {updating ? (
                                  <LoaderCircle
                                    className="size-3 animate-spin"
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
                                className="flex h-full w-8 items-center justify-center disabled:opacity-30"
                                aria-label={`Increase ${item.name} quantity`}
                              >
                                <Plus
                                  className="size-3"
                                  strokeWidth={
                                    1.4
                                  }
                                />
                              </button>
                            </div>

                            <div className="flex items-center gap-3">
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
                                aria-label={`Save ${item.name} for later`}
                                className="flex size-8 items-center justify-center !text-[#806a62] transition-colors hover:!text-[#6b2230] disabled:opacity-35"
                              >
                                <Heart
                                  className="size-3.5"
                                  strokeWidth={
                                    1.4
                                  }
                                />
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
                                className="flex size-8 items-center justify-center !text-[#8f7b74] transition-colors hover:!text-[#6b2230] disabled:opacity-35"
                              >
                                <Trash2
                                  className="size-3.5"
                                  strokeWidth={
                                    1.4
                                  }
                                />
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  }
                )}
              </div>
            )}
        </div>

        {/* FOOTER */}

        {!loading &&
          !error &&
          items.length >
            0 && (
            <div className="border-t border-[#e1d8d1] bg-[#f5efe8] px-5 py-5 sm:px-7 sm:py-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[8px] uppercase tracking-[0.16em] !text-[#927d75]">
                    Subtotal
                  </p>

                  <p className="mt-1 text-[8px] !text-[#a08f88]">
                    Delivery at checkout
                  </p>
                </div>

                <p className="font-display text-[26px] !text-[#382623]">
                  {currency.format(
                    subtotal
                  )}
                </p>
              </div>

              {hasUnavailableItems ? (
                <div className="mt-4 border border-[#dfc7c7] bg-[#f8eeee] px-4 py-3 text-[9px] leading-5 !text-[#8b4d4d]">
                  Update or remove unavailable items before checkout.
                </div>
              ) : (
                <Link
                  href="/checkout"
                  onClick={() =>
                    setOpen(false)
                  }
                  className="group mt-5 flex min-h-[54px] w-full items-center justify-between bg-[#571628] px-5 text-[10px] font-medium !text-white transition-colors hover:bg-[#681d31]"
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

              <Link
                href="/cart"
                onClick={() =>
                  setOpen(false)
                }
                className="mt-3 flex min-h-[44px] w-full items-center justify-center border border-[#cfc2ba] text-[9px] font-medium !text-[#5b4039]"
              >
                View full bag
              </Link>
            </div>
          )}
      </aside>
    </>
  );
}
