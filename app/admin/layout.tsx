"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Activity,
  ArrowUpRight,
  BellRing,
  Box,
  LayoutGrid,
  Menu,
  Package2,
  PanelLeftClose,
  PanelLeftOpen,
  Scale,
  ShoppingBag,
  Store,
  TicketPercent,
  X,
} from "lucide-react";

import {
  AdminNavBadge,
} from "@/components/admin/admin-nav-badge";

import {
  useAdminNavBadges,
} from "@/hooks/use-admin-nav-badges";

const navigation = [
  {
    label: "Overview",
    href: "/admin",
    icon: LayoutGrid,
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: Box,
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: ShoppingBag,
  },
  {
    label: "Inventory",
    href: "/admin/inventory",
    icon: Package2,
  },
  {
label: "Coupons",
href: "/admin/coupons",
icon: TicketPercent,
  },
  {
    label: "Notifications",
    href: "/admin/notifications",
    icon: BellRing,
  },
  {
    label: "Disputes",
    href: "/admin/disputes",
    icon: Scale,
  },
  {
    label: "System",
    href: "/admin/system",
    icon: Activity,
  },
];

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({
  children,
}: AdminLayoutProps) {
  const pathname = usePathname();

  const {
    newOrders,
    unreadNotifications,
  } = useAdminNavBadges();

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const [collapsed, setCollapsed] =
    useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen
      ? "hidden"
      : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  function isActive(href: string) {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname.startsWith(href);
  }

  return (
    <div className="min-h-screen bg-[#fbfaf7]">
      <div className="flex min-h-screen">
        {/* =====================================================
            DESKTOP SIDEBAR
        ====================================================== */}

        <aside
          className={`
            sticky
            top-0
            hidden
            h-screen
            shrink-0
            flex-col
            overflow-hidden
            bg-[#35101c]
            text-white

            transition-[width]
            duration-500
            ease-[cubic-bezier(0.22,1,0.36,1)]

            lg:flex

            ${
              collapsed
                ? "w-[86px]"
                : "w-[230px]"
            }
          `}
        >
          {/* Brand */}

          <div
            className={`
              flex
              min-h-[120px]
              items-center
              border-b
              border-white/[0.08]

              ${
                collapsed
                  ? "justify-center px-4"
                  : "px-7"
              }
            `}
          >
            <Link
              href="/admin"
              className="min-w-0"
            >
              {collapsed ? (
                <div className="flex size-11 items-center justify-center border border-white/20">
                  <span className="font-display text-xl !text-[#f8eee7]">
                    É
                  </span>
                </div>
              ) : (
                <>
                  <p className="whitespace-nowrap font-display text-[24px] font-normal uppercase tracking-[0.08em] !text-[#f8eee7]">
                    Élan Parfums
                  </p>

                  <p className="mt-2 whitespace-nowrap text-[8px] font-medium uppercase tracking-[0.23em] !text-[#d5afb5]">
                    The back office
                  </p>
                </>
              )}
            </Link>
          </div>

          {/* Navigation */}

          <div className="flex flex-1 flex-col overflow-y-auto px-3 py-7">
            {!collapsed && (
              <p className="mb-4 px-3 text-[8px] font-semibold uppercase tracking-[0.28em] !text-[#bc929b]">
                Your maison
              </p>
            )}

            <nav className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(
                  item.href
                );

                const badgeCount =
                  item.href === "/admin/orders"
                    ? newOrders
                    : item.href === "/admin/notifications"
                    ? unreadNotifications
                    : 0;

                const badgeLabel =
                  item.href === "/admin/orders"
                    ? "new orders"
                    : "unread notifications";

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={
                      collapsed
                        ? item.label
                        : undefined
                    }
                    className={`
                      group
                      relative
                      flex
                      min-h-[46px]
                      items-center
                      rounded-none
                      text-[11px]

                      transition-all
                      duration-300

                      ${
                        collapsed
                          ? "justify-center px-3"
                          : "gap-3 px-4"
                      }

                      ${
                        active
                          ? "bg-[#5a2430] !text-white"
                          : "!text-white/65 hover:bg-white/[0.05] hover:!text-white"
                      }
                    `}
                  >
                    <Icon
                      className="size-[16px] shrink-0"
                      strokeWidth={1.4}
                    />

                    {!collapsed && (
                      <>
                        <span className="whitespace-nowrap">
                          {item.label}
                        </span>

                        <AdminNavBadge
                          count={badgeCount}
                          label={badgeLabel}
                        />
                      </>
                    )}

                    {collapsed &&
                      badgeCount > 0 && (
                        <span
                          aria-label={`${badgeCount} ${badgeLabel}`}
                          title={`${badgeCount} ${badgeLabel}`}
                          className="absolute right-2 top-1.5 flex min-h-[16px] min-w-[16px] items-center justify-center rounded-full bg-[#f2d9df] px-1 text-[7px] font-semibold leading-none !text-[#65182b]"
                        >
                          {badgeCount > 99
                            ? "99+"
                            : badgeCount}
                        </span>
                      )}
                  </Link>
                );
              })}
            </nav>

            {/* Bottom */}

            <div className="mt-auto space-y-2 pt-10">
              <Link
                href="/"
                title={
                  collapsed
                    ? "Visit storefront"
                    : undefined
                }
                className={`
                  group
                  flex
                  min-h-[44px]
                  items-center
                  text-[10px]
                  !text-white/70

                  transition-colors

                  hover:!text-white

                  ${
                    collapsed
                      ? "justify-center px-2"
                      : "justify-between px-4"
                  }
                `}
              >
                {!collapsed && (
                  <span>
                    Visit storefront
                  </span>
                )}

                <ArrowUpRight
                  className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  strokeWidth={1.4}
                />
              </Link>

              {/* Collapse */}

              <button
                type="button"
                onClick={() =>
                  setCollapsed(
                    (current) => !current
                  )
                }
                title={
                  collapsed
                    ? "Expand sidebar"
                    : "Collapse sidebar"
                }
                className={`
                  flex
                  min-h-[44px]
                  w-full
                  items-center
                  !text-white/45

                  transition-colors

                  hover:!text-white

                  ${
                    collapsed
                      ? "justify-center"
                      : "gap-3 px-4"
                  }
                `}
              >
                {collapsed ? (
                  <PanelLeftOpen
                    className="size-4"
                    strokeWidth={1.4}
                  />
                ) : (
                  <>
                    <PanelLeftClose
                      className="size-4"
                      strokeWidth={1.4}
                    />

                    <span className="text-[9px]">
                      Collapse
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </aside>

        {/* =====================================================
            MAIN AREA
        ====================================================== */}

        <div className="flex min-w-0 flex-1 flex-col">
          {/* =================================================
              TOP BAR
          ================================================== */}

          <header
            className="
              sticky
              top-0
              z-40
              border-b
              border-[#e5ddd3]
              bg-[#fbfaf7]/95
              backdrop-blur-md
            "
          >
            <div className="flex h-[72px] items-center justify-between px-5 sm:px-8 lg:px-9">
              {/* Mobile */}

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setMobileMenuOpen(true)
                  }
                  aria-label="Open admin menu"
                  className="flex size-10 items-center justify-center !text-[#3b2a27] lg:hidden"
                >
                  <Menu
                    className="size-5"
                    strokeWidth={1.4}
                  />
                </button>

                <div>
                  <p className="text-[10px] font-medium !text-[#574844] sm:text-[11px]">
                    Store management
                  </p>

                  <p className="mt-0.5 hidden text-[8px] !text-[#a18f88] sm:block">
                    Élan Parfums back office
                  </p>
                </div>
              </div>

              {/* Actions */}

              <div className="flex items-center gap-2">
                <Link
                  href="/"
                  className="
                    group
                    inline-flex
                    items-center
                    gap-2
                    px-3
                    py-2
                    text-[9px]
                    !text-[#806c65]

                    transition-colors

                    hover:!text-[#5a1425]
                  "
                >
                  <Store
                    className="size-3.5"
                    strokeWidth={1.4}
                  />

                  <span className="hidden sm:inline">
                    Preview storefront
                  </span>

                  <ArrowUpRight
                    className="hidden size-3 sm:block"
                    strokeWidth={1.4}
                  />
                </Link>
              </div>
            </div>
          </header>

          {/* PAGE CONTENT */}

          <main className="min-w-0 flex-1">
            {children}
          </main>
        </div>
      </div>

      {/* =====================================================
          MOBILE OVERLAY
      ====================================================== */}

      <div
        onClick={() =>
          setMobileMenuOpen(false)
        }
        className={`
          fixed
          inset-0
          z-[80]
          bg-black/40
          backdrop-blur-[2px]

          transition-opacity
          duration-300

          lg:hidden

          ${
            mobileMenuOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }
        `}
      />

      {/* =====================================================
          MOBILE SIDEBAR
      ====================================================== */}

      <aside
        className={`
          fixed
          left-0
          top-0
          z-[90]

          flex
          h-dvh
          w-[86%]
          max-w-[320px]
          flex-col

          bg-[#35101c]
          text-white

          shadow-[20px_0_60px_rgba(0,0,0,0.2)]

          transition-transform
          duration-500
          ease-[cubic-bezier(0.22,1,0.36,1)]

          lg:hidden

          ${
            mobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* Mobile brand */}

        <div className="flex min-h-[96px] items-center justify-between border-b border-white/[0.08] px-6">
          <Link
            href="/admin"
            onClick={() =>
              setMobileMenuOpen(false)
            }
          >
            <p className="font-display text-[22px] uppercase tracking-[0.08em] !text-[#f8eee7]">
              Élan Parfums
            </p>

            <p className="mt-1 text-[7px] uppercase tracking-[0.22em] !text-[#d5afb5]">
              The back office
            </p>
          </Link>

          <button
            type="button"
            onClick={() =>
              setMobileMenuOpen(false)
            }
            aria-label="Close admin menu"
            className="flex size-9 items-center justify-center !text-white/80"
          >
            <X
              className="size-5"
              strokeWidth={1.4}
            />
          </button>
        </div>

        {/* Mobile navigation */}

        <div className="flex flex-1 flex-col overflow-y-auto px-4 py-7">
          <p className="mb-4 px-3 text-[8px] font-semibold uppercase tracking-[0.28em] !text-[#bc929b]">
            Your maison
          </p>

          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(
                item.href
              );

              const badgeCount =
                item.href === "/admin/orders"
                  ? newOrders
                  : item.href === "/admin/notifications"
                  ? unreadNotifications
                  : 0;

              const badgeLabel =
                item.href === "/admin/orders"
                  ? "new orders"
                  : "unread notifications";

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex
                    min-h-[48px]
                    items-center
                    gap-3
                    px-4
                    text-[11px]

                    ${
                      active
                        ? "bg-[#5a2430] !text-white"
                        : "!text-white/65"
                    }
                  `}
                >
                  <Icon
                    className="size-4"
                    strokeWidth={1.4}
                  />

                  <span className="whitespace-nowrap">
                    {item.label}
                  </span>

                  <AdminNavBadge
                    count={badgeCount}
                    label={badgeLabel}
                  />
                </Link>
              );
            })}
          </nav>

          <Link
            href="/"
            className="mt-auto flex items-center justify-between px-4 py-4 text-[10px] !text-white/70"
          >
            Visit storefront

            <ArrowUpRight
              className="size-3.5"
              strokeWidth={1.4}
            />
          </Link>
        </div>
      </aside>
    </div>
  );
}