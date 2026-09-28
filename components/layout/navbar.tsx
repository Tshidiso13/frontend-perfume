"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  ChevronDown,
  Heart,
  LogIn,
  LogOut,
  Menu,
  Search,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react";

import {
  toast,
} from "sonner";

import {
  authService,
  type AuthUser,
} from "@/services/auth.service";

import {
  wishlistService,
} from "@/services/wishlist.service";

import {
  cartService,
} from "@/services/cart.service";

/* =========================================================
   NAVIGATION
========================================================= */

const navigation = [
  {
    label:
      "Shop all",
    href:
      "/shop",
  },
  {
    label:
      "New arrivals",
    href:
      "/new-arrivals",
  },
  {
    label:
      "Women",
    href:
      "/women",
  },
  {
    label:
      "Men",
    href:
      "/men",
  },
  {
    label:
      "Unisex",
    href:
      "/unisex",
  },
  {
    label:
      "Discover",
    href:
      "/discover",

    children: [
      {
        label:
          "Find my scent",
        href:
          "/scent-finder",
      },

      {
        label:
          "Families",
        href:
          "/families",
      },
    ],
  },
] as const;

const WISHLIST_UPDATED_EVENT =
  "elan:wishlist-updated";

const CART_UPDATED_EVENT =
  "elan:cart-updated";

/* =========================================================
   NAVBAR
========================================================= */

export function Navbar() {
  const pathname =
    usePathname();

  const router =
    useRouter();

  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] = useState(
    false
  );

  const [
    mobileDiscoverOpen,
    setMobileDiscoverOpen,
  ] = useState(
    false
  );

  const [
    user,
    setUser,
  ] =
    useState<AuthUser | null>(
      null
    );

  const [
    authLoading,
    setAuthLoading,
  ] = useState(
    true
  );

  const [
    loggingOut,
    setLoggingOut,
  ] = useState(
    false
  );

  const [
    wishlistCount,
    setWishlistCount,
  ] = useState(
    0
  );

  const [
    cartCount,
    setCartCount,
  ] = useState(
    0
  );

  /* =====================================================
     AUTH
  ====================================================== */

  useEffect(() => {
    let mounted =
      true;

    async function loadUser() {
      try {
        setAuthLoading(
          true
        );

        const currentUser =
          await authService.me();

        if (
          mounted
        ) {
          setUser(
            currentUser
          );
        }
      } catch {
        if (
          mounted
        ) {
          setUser(
            null
          );

          setWishlistCount(
            0
          );

          setCartCount(
            0
          );
        }
      } finally {
        if (
          mounted
        ) {
          setAuthLoading(
            false
          );
        }
      }
    }

    void loadUser();

    return () => {
      mounted =
        false;
    };
  }, [
    pathname,
  ]);

  /* =====================================================
     BACKEND WISHLIST COUNT
  ====================================================== */

  const loadWishlistCount =
    useCallback(
      async () => {
        if (!user) {
          setWishlistCount(
            0
          );

          return;
        }

        try {
          const response =
            await wishlistService.getCount();

          setWishlistCount(
            Math.max(
              0,
              response.count ??
                0
            )
          );
        } catch {
          /*
           * Navbar count should never break navigation.
           * Keep the last known value if the count request fails.
           */
        }
      },
      [
        user,
      ]
    );

  useEffect(() => {
    void loadWishlistCount();
  }, [
    loadWishlistCount,
  ]);

  useEffect(() => {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    const handleWishlistUpdated =
      () => {
        /*
         * Re-read from backend instead of trusting a client-side
         * count so the badge always reflects Neon.
         */
        void loadWishlistCount();
      };

    window.addEventListener(
      WISHLIST_UPDATED_EVENT,
      handleWishlistUpdated
    );

    return () => {
      window.removeEventListener(
        WISHLIST_UPDATED_EVENT,
        handleWishlistUpdated
      );
    };
  }, [
    loadWishlistCount,
  ]);

  /* =====================================================
     BACKEND CART COUNT
  ====================================================== */

  const loadCartCount =
    useCallback(
      async () => {
        if (!user) {
          setCartCount(
            0
          );

          return;
        }

        try {
          const response =
            await cartService.getCount();

          setCartCount(
            Math.max(
              0,
              response.count ??
                0
            )
          );
        } catch {
          /*
           * Navbar count must never break navigation.
           * Keep the last known value if the request fails.
           */
        }
      },
      [
        user,
      ]
    );

  useEffect(() => {
    void loadCartCount();
  }, [
    loadCartCount,
  ]);

  useEffect(() => {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    const handleCartUpdated =
      () => {
        /*
         * Re-read the authoritative count from Neon.
         * This keeps the badge correct after add/update/remove.
         */
        void loadCartCount();
      };

    window.addEventListener(
      CART_UPDATED_EVENT,
      handleCartUpdated
    );

    return () => {
      window.removeEventListener(
        CART_UPDATED_EVENT,
        handleCartUpdated
      );
    };
  }, [
    loadCartCount,
  ]);

  /* =====================================================
     MOBILE BODY LOCK
  ====================================================== */

  useEffect(() => {
    document.body.style.overflow =
      mobileMenuOpen
        ? "hidden"
        : "";

    return () => {
      document.body.style.overflow =
        "";
    };
  }, [
    mobileMenuOpen,
  ]);

  /* =====================================================
     ROUTE CHANGE
  ====================================================== */

  useEffect(() => {
    setMobileMenuOpen(
      false
    );

    setMobileDiscoverOpen(
      false
    );
  }, [
    pathname,
  ]);

  /* =====================================================
     LOGOUT
  ====================================================== */

  async function handleLogout() {
    if (
      loggingOut
    ) {
      return;
    }

    setLoggingOut(
      true
    );

    const toastId =
      toast.loading(
        "Signing you out..."
      );

    try {
      await authService.logout();

      setUser(
        null
      );

      setWishlistCount(
        0
      );

      setCartCount(
        0
      );

      setMobileMenuOpen(
        false
      );

      toast.success(
        "You have been signed out.",
        {
          id:
            toastId,
        }
      );

      router.replace(
        "/login"
      );

      router.refresh();
    } catch (
      error
    ) {
      toast.error(
        error instanceof
          Error
          ? error.message
          : "Unable to sign out.",
        {
          id:
            toastId,
        }
      );
    } finally {
      setLoggingOut(
        false
      );
    }
  }

  /* =====================================================
     HELPERS
  ====================================================== */

  function isActive(
    href: string
  ) {
    if (
      href ===
      "/shop"
    ) {
      return (
        pathname ===
        "/shop"
      );
    }

    return pathname.startsWith(
      href
    );
  }

  function isDiscoverActive() {
    return (
      pathname.startsWith(
        "/discover"
      ) ||
      pathname.startsWith(
        "/scent-finder"
      ) ||
      pathname.startsWith(
        "/families"
      )
    );
  }

  const accountHref =
    user?.role ===
    "ADMIN"
      ? "/admin"
      : "/account";

  const firstName =
    user?.name
      ?.trim()
      .split(
        /\s+/
      )[0] ??
    "Account";

  return (
    <>
      {/* =====================================================
          DESKTOP / MAIN NAVBAR
      ====================================================== */}

      <header className="sticky top-0 z-50 border-b border-t border-[#e9e1d9] border-t-[#6b2230] bg-[#fbfaf7]/98 backdrop-blur-md">
        <div className="mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-10 xl:px-12">
          <div className="grid h-[104px] grid-cols-[1fr_auto_1fr] items-center lg:h-[112px]">
            {/* BRAND */}

            <div className="flex items-center">
              <Link
                href="/"
                aria-label="Élan Parfums home"
                className="group inline-block"
              >
                <div className="flex flex-col">
                  <span className="font-display text-[28px] font-normal tracking-[0.12em] !text-[#541a26] transition-opacity duration-300 group-hover:opacity-70 sm:text-[30px]">
                    ÉLAN PARFUMS
                  </span>

                  <span className="mt-1 text-[8px] font-medium uppercase tracking-[0.24em] !text-[#7f4e55] sm:text-[9px]">
                    Scents worth remembering
                  </span>
                </div>
              </Link>
            </div>

            {/* DESKTOP NAVIGATION */}

            <nav
              className="hidden items-center gap-7 lg:flex xl:gap-8"
              aria-label="Main navigation"
            >
              {navigation.map(
                (
                  item
                ) => {
                  const hasChildren =
                    "children" in
                    item;

                  const active =
                    hasChildren
                      ? isDiscoverActive()
                      : isActive(
                          item.href
                        );

                  if (
                    hasChildren
                  ) {
                    return (
                      <div
                        key={
                          item.href
                        }
                        className="group/discover relative"
                      >
                        <button
                          type="button"
                          className="group relative flex items-center gap-1.5 py-3 text-[12px] font-medium !text-[#2d2421] transition-colors duration-300 hover:!text-[#6b2230]"
                          aria-haspopup="menu"
                        >
                          <span>
                            {
                              item.label
                            }
                          </span>

                          <ChevronDown
                            className="size-3 transition-transform duration-300 group-hover/discover:rotate-180"
                            strokeWidth={
                              1.5
                            }
                          />

                          <span
                            className={`absolute bottom-0 left-0 h-px bg-[#6b2230] transition-all duration-300 ${
                              active
                                ? "w-full"
                                : "w-0 group-hover/discover:w-full"
                            }`}
                          />
                        </button>

                        <div className="pointer-events-none absolute left-1/2 top-full z-[70] w-[230px] -translate-x-1/2 translate-y-2 border border-[#e7ddd5] bg-[#fbfaf7] p-2 opacity-0 shadow-[0_18px_50px_rgba(54,30,25,0.12)] transition-all duration-200 group-hover/discover:pointer-events-auto group-hover/discover:translate-y-0 group-hover/discover:opacity-100">
                          {item.children.map(
                            (
                              child
                            ) => (
                              <Link
                                key={
                                  child.href
                                }
                                href={
                                  child.href
                                }
                                className="flex min-h-[46px] items-center justify-between px-4 text-[10px] font-medium !text-[#493833] transition-colors hover:bg-[#f3ede7] hover:!text-[#6b2230]"
                              >
                                {
                                  child.label
                                }

                                <span className="text-[13px] !text-[#9d8178]">
                                  →
                                </span>
                              </Link>
                            )
                          )}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={
                        item.href
                      }
                      href={
                        item.href
                      }
                      className="group relative flex items-center gap-1.5 py-3 text-[12px] font-medium !text-[#2d2421] transition-colors duration-300 hover:!text-[#6b2230]"
                    >
                      <span>
                        {
                          item.label
                        }
                      </span>

                      <span
                        className={`absolute bottom-0 left-0 h-px bg-[#6b2230] transition-all duration-300 ${
                          active
                            ? "w-full"
                            : "w-0 group-hover:w-full"
                        }`}
                      />
                    </Link>
                  );
                }
              )}
            </nav>

            {/* DESKTOP ACTIONS */}

            <div className="flex items-center justify-end gap-1">
              <Link
                href="/search"
                aria-label="Search"
                className="hidden size-10 items-center justify-center rounded-full !text-[#2d2421] transition-all duration-300 hover:bg-[#f1ebe5] hover:!text-[#6b2230] sm:flex"
              >
                <Search
                  className="size-[19px]"
                  strokeWidth={
                    1.45
                  }
                />
              </Link>

              {!authLoading &&
                (user ? (
                  <>
                    <Link
                      href={
                        accountHref
                      }
                      aria-label={
                        user.role ===
                        "ADMIN"
                          ? "Admin dashboard"
                          : "My account"
                      }
                      className="hidden items-center gap-2 rounded-full px-3 py-2 !text-[#2d2421] transition-all duration-300 hover:bg-[#f1ebe5] hover:!text-[#6b2230] sm:flex"
                    >
                      <UserRound
                        className="size-[18px]"
                        strokeWidth={
                          1.45
                        }
                      />

                      <div className="hidden text-left xl:block">
                        <p className="max-w-[90px] truncate text-[10px] font-medium !text-[#382724]">
                          {
                            firstName
                          }
                        </p>

                        <p className="text-[7px] uppercase tracking-[0.12em] !text-[#927b73]">
                          {user.role ===
                          "ADMIN"
                            ? "Admin"
                            : "Account"}
                        </p>
                      </div>
                    </Link>

                    <button
                      type="button"
                      onClick={
                        handleLogout
                      }
                      disabled={
                        loggingOut
                      }
                      aria-label="Sign out"
                      title="Sign out"
                      className="hidden size-10 items-center justify-center rounded-full !text-[#2d2421] transition-all duration-300 hover:bg-[#f1ebe5] hover:!text-[#6b2230] disabled:cursor-not-allowed disabled:opacity-50 sm:flex"
                    >
                      <LogOut
                        className="size-[18px]"
                        strokeWidth={
                          1.45
                        }
                      />
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    aria-label="Sign in"
                    className="hidden items-center gap-2 rounded-full px-3 py-2 !text-[#2d2421] transition-all duration-300 hover:bg-[#f1ebe5] hover:!text-[#6b2230] sm:flex"
                  >
                    <UserRound
                      className="size-[19px]"
                      strokeWidth={
                        1.45
                      }
                    />

                    <span className="hidden text-[10px] font-medium xl:inline">
                      Sign in
                    </span>
                  </Link>
                ))}

              {/* WISHLIST + BACKEND COUNT */}

              <Link
                href="/wishlist"
                aria-label={`Wishlist${
                  wishlistCount >
                  0
                    ? `, ${wishlistCount} saved`
                    : ""
                }`}
                className="relative hidden size-10 items-center justify-center rounded-full !text-[#2d2421] transition-all duration-300 hover:bg-[#f1ebe5] hover:!text-[#6b2230] sm:flex"
              >
                <Heart
                  className="size-[19px]"
                  strokeWidth={
                    1.45
                  }
                />

                {wishlistCount >
                  0 && (
                  <span className="absolute -right-0.5 top-0 flex min-h-[16px] min-w-[16px] items-center justify-center rounded-full bg-[#5a1425] px-1 text-[8px] font-medium leading-none !text-white">
                    {wishlistCount >
                    99
                      ? "99+"
                      : wishlistCount}
                  </span>
                )}
              </Link>

              <Link
                href="/cart"
                aria-label={`Shopping bag${
                  cartCount >
                  0
                    ? `, ${cartCount} ${
                        cartCount === 1
                          ? "item"
                          : "items"
                      }`
                    : ""
                }`}
                className="group relative flex size-10 items-center justify-center rounded-full !text-[#2d2421] transition-all duration-300 hover:bg-[#f1ebe5] hover:!text-[#6b2230]"
              >
                <ShoppingBag
                  className="size-[19px]"
                  strokeWidth={
                    1.45
                  }
                />

                {cartCount >
                  0 && (
                  <span className="absolute -right-0.5 top-0 flex min-h-[16px] min-w-[16px] items-center justify-center rounded-full bg-[#5a1425] px-1 text-[8px] font-medium leading-none !text-white">
                    {cartCount >
                    99
                      ? "99+"
                      : cartCount}
                  </span>
                )}
              </Link>

              <button
                type="button"
                onClick={() =>
                  setMobileMenuOpen(
                    true
                  )
                }
                aria-label="Open menu"
                aria-expanded={
                  mobileMenuOpen
                }
                className="ml-1 flex size-10 items-center justify-center rounded-full !text-[#2d2421] transition-colors hover:bg-[#f1ebe5] lg:hidden"
              >
                <Menu
                  className="size-5"
                  strokeWidth={
                    1.5
                  }
                />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE OVERLAY */}

      <div
        onClick={() =>
          setMobileMenuOpen(
            false
          )
        }
        className={`fixed inset-0 z-[80] bg-black/35 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden ${
          mobileMenuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      {/* MOBILE DRAWER */}

      <aside
        className={`fixed right-0 top-0 z-[90] flex h-dvh w-[88%] max-w-[390px] flex-col bg-[#fbfaf7] shadow-[-20px_0_60px_rgba(0,0,0,0.12)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden ${
          mobileMenuOpen
            ? "translate-x-0"
            : "translate-x-full"
        }`}
      >
        <div className="flex h-[88px] items-center justify-between border-b border-[#e9e1d9] px-6">
          <Link
            href="/"
            onClick={() =>
              setMobileMenuOpen(
                false
              )
            }
          >
            <div>
              <p className="font-display text-2xl tracking-[0.12em] !text-[#541a26]">
                ÉLAN
              </p>

              <p className="mt-0.5 text-[7px] uppercase tracking-[0.22em] !text-[#87616a]">
                Parfums
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() =>
              setMobileMenuOpen(
                false
              )
            }
            aria-label="Close menu"
            className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-[#f1ebe5]"
          >
            <X
              className="size-5"
              strokeWidth={
                1.5
              }
            />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-8">
          {!authLoading &&
            user && (
              <div className="mb-8 border border-[#e4dbd3] bg-[#f5efe8] p-5">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#fbfaf7]">
                    <UserRound
                      className="size-[18px] !text-[#6b2230]"
                      strokeWidth={
                        1.4
                      }
                    />
                  </span>

                  <div className="min-w-0">
                    <p className="truncate font-display text-[19px] !text-[#3d2a27]">
                      {
                        user.name
                      }
                    </p>

                    <p className="mt-0.5 truncate text-[8px] !text-[#8a746c]">
                      {
                        user.email
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

          <p className="mb-5 text-[9px] font-semibold uppercase tracking-[0.28em] !text-[#a27b72]">
            Explore
          </p>

          <nav>
            {navigation.map(
              (
                item
              ) => {
                const hasChildren =
                  "children" in
                  item;

                if (
                  hasChildren
                ) {
                  return (
                    <div
                      key={
                        item.href
                      }
                      className="border-b border-[#e9e1d9]"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setMobileDiscoverOpen(
                            (
                              current
                            ) =>
                              !current
                          )
                        }
                        className="flex w-full items-center justify-between py-4 text-left"
                      >
                        <span
                          className={`font-display text-[27px] font-normal tracking-[-0.02em] ${
                            isDiscoverActive()
                              ? "!text-[#6b2230]"
                              : "!text-[#372725]"
                          }`}
                        >
                          {
                            item.label
                          }
                        </span>

                        <ChevronDown
                          className={`size-4 !text-[#8b7068] transition-transform ${
                            mobileDiscoverOpen
                              ? "rotate-180"
                              : ""
                          }`}
                          strokeWidth={
                            1.4
                          }
                        />
                      </button>

                      {mobileDiscoverOpen && (
                        <div className="pb-4 pl-4">
                          {item.children.map(
                            (
                              child
                            ) => (
                              <Link
                                key={
                                  child.href
                                }
                                href={
                                  child.href
                                }
                                className="flex min-h-[42px] items-center border-l border-[#dfd4cb] pl-4 text-[12px] !text-[#5f4b45]"
                              >
                                {
                                  child.label
                                }
                              </Link>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={
                      item.href
                    }
                    href={
                      item.href
                    }
                    className="group flex items-center justify-between border-b border-[#e9e1d9] py-4"
                  >
                    <span
                      className={`font-display text-[27px] font-normal tracking-[-0.02em] ${
                        isActive(
                          item.href
                        )
                          ? "!text-[#6b2230]"
                          : "!text-[#372725]"
                      }`}
                    >
                      {
                        item.label
                      }
                    </span>
                  </Link>
                );
              }
            )}
          </nav>

          <div className="mt-10">
            <p className="mb-4 text-[9px] font-semibold uppercase tracking-[0.28em] !text-[#a27b72]">
              {user
                ? "Your account"
                : "Account"}
            </p>

            <div className="space-y-1">
              {!authLoading &&
                user && (
                  <>
                    <Link
                      href={
                        accountHref
                      }
                      className="flex items-center gap-3 py-3 text-[13px] !text-[#4c3a35]"
                    >
                      <UserRound
                        className="size-[17px]"
                        strokeWidth={
                          1.4
                        }
                      />

                      {user.role ===
                      "ADMIN"
                        ? "Admin dashboard"
                        : "My account"}
                    </Link>

                    <Link
                      href="/wishlist"
                      className="flex items-center justify-between py-3 text-[13px] !text-[#4c3a35]"
                    >
                      <span className="flex items-center gap-3">
                        <Heart
                          className="size-[17px]"
                          strokeWidth={
                            1.4
                          }
                        />

                        Wishlist
                      </span>

                      {wishlistCount >
                        0 && (
                        <span className="flex min-h-[20px] min-w-[20px] items-center justify-center rounded-full bg-[#5a1425] px-1.5 text-[8px] font-medium !text-white">
                          {wishlistCount >
                          99
                            ? "99+"
                            : wishlistCount}
                        </span>
                      )}
                    </Link>

                    <button
                      type="button"
                      onClick={
                        handleLogout
                      }
                      disabled={
                        loggingOut
                      }
                      className="flex w-full items-center gap-3 py-3 text-left text-[13px] !text-[#7d2938] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <LogOut
                        className="size-[17px]"
                        strokeWidth={
                          1.4
                        }
                      />

                      {loggingOut
                        ? "Signing out..."
                        : "Sign out"}
                    </button>
                  </>
                )}

              {!authLoading &&
                !user && (
                  <>
                    <Link
                      href="/login"
                      className="flex items-center gap-3 py-3 text-[13px] !text-[#4c3a35]"
                    >
                      <LogIn
                        className="size-[17px]"
                        strokeWidth={
                          1.4
                        }
                      />

                      Sign in
                    </Link>

                    <Link
                      href="/register"
                      className="flex items-center gap-3 py-3 text-[13px] !text-[#4c3a35]"
                    >
                      <UserRound
                        className="size-[17px]"
                        strokeWidth={
                          1.4
                        }
                      />

                      Create account
                    </Link>
                  </>
                )}

              <Link
                href="/search"
                className="flex items-center gap-3 py-3 text-[13px] !text-[#4c3a35]"
              >
                <Search
                  className="size-[17px]"
                  strokeWidth={
                    1.4
                  }
                />

                Search
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-[#e9e1d9] bg-[#f5efe8] px-6 py-6">
          <p className="text-[11px] leading-5 !text-[#876f67]">
            Not sure what suits you?
          </p>

          <Link
            href="/scent-finder"
            className="mt-1 inline-block border-b border-[#6b2230] pb-1 text-[12px] font-medium !text-[#6b2230]"
          >
            Find your scent
          </Link>
        </div>
      </aside>
    </>
  );
}
