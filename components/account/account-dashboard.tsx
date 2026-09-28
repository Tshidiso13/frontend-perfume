"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowRight,
  Bell,
  CircleAlert,
  Heart,
  HelpCircle,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  MapPin,
  Package,
  RefreshCcw,
  RotateCcw,
  ShieldCheck,
  Truck,
  UserRound,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  toast,
} from "sonner";

import {
  authService,
} from "@/services/auth.service";

import {
  accountDashboardService,
  type AccountDashboardData,
  type AccountDashboardOrder,
} from "@/services/account-dashboard.service";

/* =========================================================
   FORMATTERS
========================================================= */

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

const dateFormatter =
  new Intl.DateTimeFormat(
    "en-ZA",
    {
      day:
        "2-digit",

      month:
        "short",

      year:
        "numeric",
    }
  );

/* =========================================================
   PAGE
========================================================= */

export function AccountDashboard() {
  const router =
    useRouter();

  const [
    data,
    setData,
  ] = useState<
    AccountDashboardData |
    null
  >(
    null
  );

  const [
    loading,
    setLoading
  ] = useState(
    true
  );

  const [
    error,
    setError
  ] = useState<
    string |
    null
  >(
    null
  );

  const [
    loggingOut,
    setLoggingOut
  ] = useState(
    false
  );

  const load =
    useCallback(
      async () => {
        setLoading(
          true
        );

        setError(
          null
        );

        try {
          const response =
            await accountDashboardService.getOverview();

          setData(
            response
          );
        } catch (
          error
        ) {
          /*
           * /account is an authenticated customer area.
           * If auth/me fails, send the visitor to login.
           */
          const message =
            error instanceof
              Error
              ? error.message
              : "Unable to load your account.";

          if (
            /401|unauthori[sz]ed|authentication|sign in|session/i.test(
              message
            )
          ) {
            router.replace(
              "/login?redirect=%2Faccount"
            );

            return;
          }

          setError(
            message
          );
        } finally {
          setLoading(
            false
          );
        }
      },
      [
        router,
      ]
    );

  useEffect(
    () => {
      void load();
    },
    [
      load,
    ]
  );

  async function logout() {
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

      toast.success(
        "You have been signed out.",
        {
          id:
            toastId,
        }
      );

      router.replace(
        "/"
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

  const firstName =
    useMemo(
      () =>
        data?.user.name
          ?.trim()
          .split(
            /\s+/
          )[0] ||
        "there",
      [
        data?.user.name,
      ]
    );

  if (
    loading
  ) {
    return (
      <section className="flex min-h-[650px] items-center justify-center bg-[#fbfaf7]">
        <div className="text-center">
          <LoaderCircle
            className="mx-auto size-5 animate-spin !text-[#6b2230]"
            strokeWidth={
              1.4
            }
          />

          <p className="mt-4 text-[9px] !text-[#8a7871]">
            Opening your ÉLAN account...
          </p>
        </div>
      </section>
    );
  }

  if (
    error ||
    !data
  ) {
    return (
      <section className="flex min-h-[650px] items-center justify-center bg-[#fbfaf7] px-5">
        <div className="max-w-md text-center">
          <CircleAlert
            className="mx-auto size-6 !text-[#9a756c]"
            strokeWidth={
              1.3
            }
          />

          <h1 className="mt-6 font-display text-[38px] !text-[#382724]">
            Account unavailable.
          </h1>

          <p className="mt-3 text-[10px] leading-6 !text-[#88766f]">
            {
              error ??
              "We could not load your account."
            }
          </p>

          <button
            type="button"
            onClick={() =>
              void load()
            }
            className="mt-7 inline-flex items-center gap-2 border-b border-[#6b2230] pb-1 text-[9px] font-medium !text-[#6b2230]"
          >
            <RefreshCcw
              className="size-3.5"
              strokeWidth={
                1.4
              }
            />

            Try again
          </button>
        </div>
      </section>
    );
  }

  const hasPartialErrors =
    Object.keys(
      data.partialErrors
    ).length >
    0;

  const cards = [
    {
      href:
        "/account/orders",

      icon:
        Package,

      eyebrow:
        "Orders",

      title:
        "Your orders",

      description:
        "Track current orders, deliveries and your complete purchase history.",

      value:
        countLabel(
          data.stats.totalOrders,
          "order",
          "orders"
        ),
    },

    {
      href:
        "/wishlist",

      icon:
        Heart,

      eyebrow:
        "Saved",

      title:
        "Wishlist",

      description:
        "Keep the fragrances you want to revisit in one place.",

      value:
        countLabel(
          data.stats.wishlist,
          "fragrance",
          "fragrances"
        ),
    },

    {
      href:
        "/account/notifications",

      icon:
        Bell,

      eyebrow:
        "Updates",

      title:
        "Notifications",

      description:
        "Payment, order and delivery updates from ÉLAN.",

      value:
        data.stats.unreadNotifications ===
        null
          ? "Unavailable"
          : data.stats.unreadNotifications ===
            0
          ? "All caught up"
          : `${data.stats.unreadNotifications} unread`,
    },

    {
      href:
        "/account/addresses",

      icon:
        MapPin,

      eyebrow:
        "Delivery",

      title:
        "Addresses",

      description:
        "Manage the delivery details you use when placing orders.",

      value:
        "Manage",
    },

    {
      href:
        "/account/profile",

      icon:
        UserRound,

      eyebrow:
        "Personal",

      title:
        "Profile",

      description:
        "Update your personal details and the email attached to your account.",

      value:
        data.user.email,
    },

    {
      href:
        "/account/returns",

      icon:
        RotateCcw,

      eyebrow:
        "Aftercare",

      title:
        "Returns & disputes",

      description:
        "Request help for a return, damaged parcel or order concern.",

      value:
        data.stats.openReturns ===
        null
          ? "View"
          : data.stats.openReturns ===
            0
          ? "No open requests"
          : `${data.stats.openReturns} open`,
    },

    {
      href:
        "/account/security",

      icon:
        LockKeyhole,

      eyebrow:
        "Security",

      title:
        "Password & security",

      description:
        "Keep your account credentials and sign-in settings secure.",

      value:
        "Manage",
    },

    {
      href:
        "/account/help",

      icon:
        HelpCircle,

      eyebrow:
        "Support",

      title:
        "Need help?",

      description:
        "Get in touch with ÉLAN if you need help with your account or an order.",

      value:
        "Contact us",
    },
  ];

  return (
    <section className="min-h-screen bg-[#fbfaf7]">
      <div className="mx-auto max-w-[1280px] px-5 pb-24 pt-10 sm:px-8 lg:px-10 lg:pb-32 lg:pt-14">
        {/* BREADCRUMB */}

        <div className="flex items-center gap-1.5 text-[9px] !text-[#98877f]">
          <Link
            href="/"
            className="transition-colors hover:!text-[#5a1425]"
          >
            Home
          </Link>

          <span>
            /
          </span>

          <span>
            Account
          </span>
        </div>

        {/* HEADER */}

        <div className="mt-9 grid gap-8 border-b border-[#ded6cf] pb-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-[9px] font-medium uppercase tracking-[0.3em] !text-[#9a756c]">
              Your ÉLAN
            </p>

            <h1 className="mt-4 font-display text-[48px] font-normal leading-[0.95] tracking-[-0.04em] !text-[#342725] sm:text-[58px] lg:text-[68px]">
              Welcome back,
              <br />
              {
                firstName
              }.
            </h1>

            <p className="mt-5 max-w-xl text-[11px] leading-6 !text-[#85746e]">
              Orders, deliveries, saved fragrances and account details — all in one place.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 lg:justify-end">
            <div className="border border-[#dfd6cf] px-4 py-3">
              <p className="text-[7px] uppercase tracking-[0.17em] !text-[#a18c84]">
                Signed in as
              </p>

              <p className="mt-1 max-w-[250px] truncate text-[9px] font-medium !text-[#4b3833]">
                {
                  data.user.email
                }
              </p>
            </div>

            <button
              type="button"
              disabled={
                loggingOut
              }
              onClick={() =>
                void logout()
              }
              className="inline-flex min-h-[46px] items-center gap-2 border border-[#5a1425] px-4 text-[9px] font-medium !text-[#5a1425] transition hover:bg-[#5a1425] hover:!text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loggingOut ? (
                <LoaderCircle
                  className="size-3.5 animate-spin"
                  strokeWidth={
                    1.4
                  }
                />
              ) : (
                <LogOut
                  className="size-3.5"
                  strokeWidth={
                    1.4
                  }
                />
              )}

              Sign out
            </button>
          </div>
        </div>

        {/* PARTIAL BACKEND WARNING */}

        {hasPartialErrors && (
          <div className="mt-6 flex items-start gap-3 border border-[#ead9cc] bg-[#faf4ee] px-4 py-4">
            <CircleAlert
              className="mt-0.5 size-4 shrink-0 !text-[#9a6c52]"
              strokeWidth={
                1.35
              }
            />

            <div>
              <p className="text-[9px] font-medium !text-[#69483c]">
                Some account information could not be refreshed.
              </p>

              <p className="mt-1 text-[8px] leading-4 !text-[#98776b]">
                The available sections below still use live backend data. Refresh to try the unavailable sections again.
              </p>
            </div>
          </div>
        )}

        {/* LIVE SUMMARY */}

        <div className="mt-8 grid gap-px border border-[#ded6cf] bg-[#ded6cf] sm:grid-cols-2 lg:grid-cols-4">
          <AccountStat
            icon={
              Package
            }
            label="Orders"
            value={
              statValue(
                data.stats.totalOrders
              )
            }
            helper="All account orders"
          />

          <AccountStat
            icon={
              Truck
            }
            label="In transit"
            value={
              statValue(
                data.stats.activeDeliveries
              )
            }
            helper="Active fulfilment"
          />

          <AccountStat
            icon={
              Heart
            }
            label="Wishlist"
            value={
              statValue(
                data.stats.wishlist
              )
            }
            helper="Saved fragrances"
          />

          <AccountStat
            icon={
              Bell
            }
            label="Unread"
            value={
              statValue(
                data.stats.unreadNotifications
              )
            }
            helper="Account notifications"
          />
        </div>

        {/* ACCOUNT NAVIGATION */}

        <div className="mt-10">
          <div className="flex items-end justify-between gap-5">
            <div>
              <p className="text-[8px] font-medium uppercase tracking-[0.24em] !text-[#9a756c]">
                Account
              </p>

              <h2 className="mt-3 font-display text-[32px] font-normal !text-[#382724]">
                Everything you need.
              </h2>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map(
              (
                card
              ) => (
                <AccountCard
                  key={
                    card.href
                  }
                  {...card}
                />
              )
            )}
          </div>
        </div>

        {/* RECENT ORDERS */}

        <section className="mt-12 border border-[#e5ddd3]">
          <div className="flex flex-col gap-5 border-b border-[#e5ddd3] p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
            <div>
              <p className="text-[8px] font-medium uppercase tracking-[0.24em] !text-[#9a756c]">
                Recent activity
              </p>

              <h2 className="mt-3 font-display text-[31px] font-normal !text-[#382724]">
                Your latest orders.
              </h2>

              <p className="mt-3 max-w-lg text-[9px] leading-5 !text-[#88766f]">
                Live order status from the ÉLAN backend — no sample purchases or placeholder delivery data.
              </p>
            </div>

            <Link
              href="/account/orders"
              className="group inline-flex w-fit items-center gap-3 border-b border-[#5a1425] pb-1 text-[9px] font-medium !text-[#5a1425]"
            >
              View all orders

              <ArrowRight
                className="size-3 transition-transform group-hover:translate-x-1"
                strokeWidth={
                  1.4
                }
              />
            </Link>
          </div>

          {data.partialErrors.orders ? (
            <div className="flex min-h-[230px] items-center justify-center px-6 text-center">
              <div>
                <CircleAlert
                  className="mx-auto size-5 !text-[#9a756c]"
                  strokeWidth={
                    1.3
                  }
                />

                <p className="mt-4 text-[10px] font-medium !text-[#57433d]">
                  We could not refresh your orders.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    void load()
                  }
                  className="mt-4 border-b border-[#6b2230] pb-1 text-[8px] !text-[#6b2230]"
                >
                  Try again
                </button>
              </div>
            </div>
          ) : data.recentOrders.length >
            0 ? (
            <div className="divide-y divide-[#e5ddd3]">
              {data.recentOrders.map(
                (
                  order
                ) => (
                  <RecentOrder
                    key={
                      order.id
                    }
                    order={
                      order
                    }
                  />
                )
              )}
            </div>
          ) : (
            <div className="flex min-h-[260px] items-center justify-center px-6 text-center">
              <div>
                <Package
                  className="mx-auto size-6 !text-[#a08b83]"
                  strokeWidth={
                    1.25
                  }
                />

                <h3 className="mt-5 font-display text-[29px] !text-[#382724]">
                  No orders yet.
                </h3>

                <p className="mt-2 text-[9px] leading-5 !text-[#88766f]">
                  When you place your first ÉLAN order, it will appear here automatically.
                </p>

                <Link
                  href="/shop"
                  className="mt-6 inline-flex items-center gap-3 bg-[#541627] px-5 py-3 text-[9px] font-medium !text-white"
                >
                  Explore fragrances

                  <ArrowRight
                    className="size-3"
                    strokeWidth={
                      1.4
                    }
                  />
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* ACCOUNT CARE */}

        <section className="mt-4 grid border border-[#e5ddd3] lg:grid-cols-3">
          <AccountCareItem
            icon={
              ShieldCheck
            }
            title="Your account is private"
            description="Orders and account information are loaded through your authenticated ÉLAN session."
          />

          <AccountCareItem
            icon={
              Truck
            }
            title="Delivery updates"
            description="Track fulfilment from processing and packing through shipment and delivery."
            bordered
          />

          <AccountCareItem
            icon={
              RotateCcw
            }
            title="Something not right?"
            description="Returns and disputes stay connected to the original order so support has the right context."
          />
        </section>
      </div>
    </section>
  );
}

/* =========================================================
   ACCOUNT STAT
========================================================= */

function AccountStat({
  icon:
    Icon,

  label,
  value,
  helper,
}: {
  icon:
    React.ElementType;

  label:
    string;

  value:
    string;

  helper:
    string;
}) {
  return (
    <div className="bg-[#fbfaf7] p-5 sm:p-6">
      <div className="flex items-start justify-between">
        <p className="text-[8px] uppercase tracking-[0.17em] !text-[#90766e]">
          {
            label
          }
        </p>

        <Icon
          className="size-4 !text-[#8b6960]"
          strokeWidth={
            1.3
          }
        />
      </div>

      <p className="mt-5 font-display text-[34px] !text-[#342725]">
        {
          value
        }
      </p>

      <p className="mt-2 text-[8px] !text-[#9a8982]">
        {
          helper
        }
      </p>
    </div>
  );
}

/* =========================================================
   ACCOUNT CARD
========================================================= */

function AccountCard({
  href,
  icon:
    Icon,

  eyebrow,
  title,
  description,
  value,
}: {
  href:
    string;

  icon:
    React.ElementType;

  eyebrow:
    string;

  title:
    string;

  description:
    string;

  value:
    string;
}) {
  return (
    <Link
      href={
        href
      }
      className="group flex min-h-[250px] flex-col border border-[#e5ddd3] bg-[#fbfaf7] p-6 transition-colors hover:bg-[#f7f2ed]"
    >
      <div className="flex items-start justify-between gap-5">
        <span className="flex size-10 items-center justify-center border border-[#ded5cf] bg-[#f3eee8]">
          <Icon
            className="size-4 !text-[#7e6259]"
            strokeWidth={
              1.4
            }
          />
        </span>

        <ArrowRight
          className="size-3.5 !text-[#9a8178] transition-transform group-hover:translate-x-1"
          strokeWidth={
            1.4
          }
        />
      </div>

      <p className="mt-7 text-[8px] font-medium uppercase tracking-[0.2em] !text-[#9a756c]">
        {
          eyebrow
        }
      </p>

      <h3 className="mt-3 font-display text-[25px] font-normal !text-[#382724]">
        {
          title
        }
      </h3>

      <p className="mt-3 text-[9px] leading-5 !text-[#88766f]">
        {
          description
        }
      </p>

      <p className="mt-auto pt-5 text-[8px] font-medium !text-[#6b2230]">
        {
          value
        }
      </p>
    </Link>
  );
}

/* =========================================================
   RECENT ORDER
========================================================= */

function RecentOrder({
  order,
}: {
  order:
    AccountDashboardOrder;
}) {
  return (
    <Link
      href={`/account/orders/${encodeURIComponent(
        order.id
      )}`}
      className="group grid gap-5 p-6 transition-colors hover:bg-[#f8f4f0] sm:grid-cols-[1fr_auto] sm:items-center sm:p-7"
    >
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-[10px] font-medium !text-[#3e2d29]">
            {
              order.orderNumber
            }
          </p>

          <StatusBadge
            status={
              order.orderStatus
            }
          />
        </div>

        <p className="mt-2 text-[9px] !text-[#95837c]">
          {
            formatDate(
              order.createdAt
            )
          }

          {order.deliveryMethod && (
            <>
              {" · "}
              {
                formatEnum(
                  order.deliveryMethod
                )
              }
            </>
          )}

          {order.itemCount !==
            null && (
            <>
              {" · "}
              {
                order.itemCount
              }{" "}
              {
                order.itemCount ===
                1
                  ? "item"
                  : "items"
              }
            </>
          )}
        </p>
      </div>

      <div className="flex items-center justify-between gap-6 sm:justify-end">
        <div className="sm:text-right">
          <p className="text-[10px] font-medium !text-[#392925]">
            {
              currency.format(
                order.total
              )
            }
          </p>

          <p className="mt-1 text-[8px] !text-[#9b8881]">
            {
              formatEnum(
                order.paymentStatus
              )
            }
          </p>
        </div>

        <ArrowRight
          className="size-3.5 !text-[#8b7068] transition-transform group-hover:translate-x-1"
          strokeWidth={
            1.4
          }
        />
      </div>
    </Link>
  );
}

function StatusBadge({
  status,
}: {
  status:
    string;
}) {
  const className =
    status ===
    "DELIVERED"
      ? "bg-[#e7eee8] !text-[#4f6455]"
      : status ===
          "SHIPPED"
      ? "bg-[#e9edf2] !text-[#536171]"
      : status ===
          "CANCELLED" ||
        status ===
          "REFUNDED"
      ? "bg-[#f2e3e2] !text-[#914e49]"
      : status ===
          "RETURN_REQUESTED" ||
        status ===
          "DISPUTED"
      ? "bg-[#f3e7df] !text-[#91624d]"
      : "bg-[#f1ebe5] !text-[#786158]";

  return (
    <span
      className={`px-2.5 py-1 text-[7px] font-medium uppercase tracking-[0.08em] ${className}`}
    >
      {
        formatEnum(
          status
        )
      }
    </span>
  );
}

/* =========================================================
   ACCOUNT CARE
========================================================= */

function AccountCareItem({
  icon:
    Icon,

  title,
  description,
  bordered =
    false,
}: {
  icon:
    React.ElementType;

  title:
    string;

  description:
    string;

  bordered?:
    boolean;
}) {
  return (
    <div
      className={`p-6 sm:p-8 ${
        bordered
          ? "border-y border-[#e5ddd3] lg:border-x lg:border-y-0"
          : ""
      }`}
    >
      <Icon
        className="size-4 !text-[#7e6259]"
        strokeWidth={
          1.3
        }
      />

      <h3 className="mt-5 font-display text-[22px] !text-[#382724]">
        {
          title
        }
      </h3>

      <p className="mt-3 text-[9px] leading-5 !text-[#88766f]">
        {
          description
        }
      </p>
    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function countLabel(
  value:
    number |
    null,

  singular:
    string,

  plural:
    string
) {
  if (
    value ===
    null
  ) {
    return "Unavailable";
  }

  return `${value} ${
    value ===
    1
      ? singular
      : plural
  }`;
}

function statValue(
  value:
    number |
    null
) {
  return value ===
    null
    ? "—"
    : String(
        value
      );
}

function formatDate(
  value:
    string
) {
  const parsed =
    new Date(
      value
    );

  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return value;
  }

  return dateFormatter.format(
    parsed
  );
}

function formatEnum(
  value:
    string
) {
  return value
    .replaceAll(
      "_",
      " "
    )
    .toLowerCase()
    .replace(
      /\b\w/g,
      (
        letter
      ) =>
        letter.toUpperCase()
    );
}
