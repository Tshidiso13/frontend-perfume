"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ElementType, ReactNode } from "react";

import {
  Activity,
  Bell,
  Check,
  CheckCheck,
  ChevronDown,
  CircleAlert,
  CreditCard,
  ExternalLink,
  Mail,
  Package2,
  Search,
  ShoppingBag,
  Trash2,
  Truck,
  UserRound,
  X,
} from "lucide-react";

import { toast } from "sonner";

type NotificationType =
  | "Order"
  | "Payment"
  | "Inventory"
  | "Dispute"
  | "Delivery"
  | "Customer"
  | "System";

type NotificationPriority =
  | "Normal"
  | "Important"
  | "Urgent";

type AdminNotification = {
  id: string;

  type: NotificationType;
  priority: NotificationPriority;

  title: string;
  message: string;

  read: boolean;

  createdAt: string;
  timestamp: number;

  href?: string;
  actionLabel?: string;
};

const initialNotifications: AdminNotification[] = [
  {
    id: "notification-1",

    type: "Order",
    priority: "Important",

    title: "New order received",
    message:
      "Order #ELAN-1001 has been paid and is ready for fulfilment.",

    read: false,

    createdAt: "17 Sep 2026 · 10:44",
    timestamp: 1789634640000,

    href: "/admin/orders/ELAN-1001",
    actionLabel: "View order",
  },

  {
    id: "notification-2",

    type: "Inventory",
    priority: "Urgent",

    title: "Cèdre Sauvage is out of stock",
    message:
      "The 100 ML variant has reached zero available units.",

    read: false,

    createdAt: "17 Sep 2026 · 10:20",
    timestamp: 1789633200000,

    href: "/admin/inventory/cedre-100",
    actionLabel: "View inventory",
  },

  {
    id: "notification-3",

    type: "Payment",
    priority: "Normal",

    title: "Payment confirmed",
    message:
      "PayFast confirmed a payment of R2,799 for order #ELAN-1001.",

    read: false,

    createdAt: "17 Sep 2026 · 10:44",
    timestamp: 1789634640000,

    href: "/admin/orders/ELAN-1001",
    actionLabel: "View payment",
  },

  {
    id: "notification-4",

    type: "Dispute",
    priority: "Urgent",

    title: "Customer opened a dispute",
    message:
      "Order #ELAN-1005 requires review from an administrator.",

    read: false,

    createdAt: "17 Sep 2026 · 09:16",
    timestamp: 1789629360000,

    href: "/admin/disputes",
    actionLabel: "Review dispute",
  },

  {
    id: "notification-5",

    type: "Delivery",
    priority: "Normal",

    title: "Parcel handed to Aramex",
    message:
      "Order #ELAN-1003 has been collected and is now in transit.",

    read: true,

    createdAt: "16 Sep 2026 · 17:42",
    timestamp: 1789573320000,

    href: "/admin/orders/ELAN-1003",
    actionLabel: "View shipment",
  },

  {
    id: "notification-6",

    type: "Customer",
    priority: "Normal",

    title: "New customer account",
    message:
      "A new customer has created an ÉLAN Parfums account.",

    read: true,

    createdAt: "16 Sep 2026 · 14:35",
    timestamp: 1789562100000,

    href: "/admin/customers",
    actionLabel: "View customers",
  },

  {
    id: "notification-7",

    type: "Inventory",
    priority: "Important",

    title: "Low stock warning",
    message:
      "Cèdre Sauvage 50 ML has only 3 units remaining.",

    read: true,

    createdAt: "16 Sep 2026 · 12:08",
    timestamp: 1789553280000,

    href: "/admin/inventory/cedre-50",
    actionLabel: "View variant",
  },

  {
    id: "notification-8",

    type: "System",
    priority: "Normal",

    title: "System health check complete",
    message:
      "The latest platform health check completed successfully.",

    read: true,

    createdAt: "15 Sep 2026 · 16:21",
    timestamp: 1789482060000,

    href: "/admin/system",
    actionLabel: "View system",
  },
];

export function AdminNotificationsPage() {
  const [notifications, setNotifications] =
    useState<AdminNotification[]>(
      initialNotifications
    );

  const [search, setSearch] = useState("");

  const [typeFilter, setTypeFilter] =
    useState("All");

  const [readFilter, setReadFilter] =
    useState("All");

  const [priorityFilter, setPriorityFilter] =
    useState("All");

  const filteredNotifications =
    useMemo(() => {
      let result = [...notifications];

      const term = search
        .trim()
        .toLowerCase();

      if (term) {
        result = result.filter(
          (notification) =>
            [
              notification.title,
              notification.message,
              notification.type,
              notification.priority,
            ]
              .join(" ")
              .toLowerCase()
              .includes(term)
        );
      }

      if (typeFilter !== "All") {
        result = result.filter(
          (notification) =>
            notification.type === typeFilter
        );
      }

      if (readFilter === "Unread") {
        result = result.filter(
          (notification) =>
            !notification.read
        );
      }

      if (readFilter === "Read") {
        result = result.filter(
          (notification) =>
            notification.read
        );
      }

      if (priorityFilter !== "All") {
        result = result.filter(
          (notification) =>
            notification.priority ===
            priorityFilter
        );
      }

      return result.sort(
        (a, b) =>
          b.timestamp - a.timestamp
      );
    }, [
      notifications,
      search,
      typeFilter,
      readFilter,
      priorityFilter,
    ]);

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.read
    ).length;

  const urgentCount =
    notifications.filter(
      (notification) =>
        notification.priority ===
          "Urgent" &&
        !notification.read
    ).length;

  const todayCount =
    notifications.filter(
      (notification) =>
        notification.createdAt.startsWith(
          "17 Sep 2026"
        )
    ).length;

  const hasFilters =
    search.trim() !== "" ||
    typeFilter !== "All" ||
    readFilter !== "All" ||
    priorityFilter !== "All";

  function clearFilters() {
    setSearch("");
    setTypeFilter("All");
    setReadFilter("All");
    setPriorityFilter("All");
  }

  function markAsRead(id: string) {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              read: true,
            }
          : notification
      )
    );
  }

  function markAsUnread(id: string) {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              read: false,
            }
          : notification
      )
    );
  }

  function markAllAsRead() {
    if (unreadCount === 0) {
      toast("Everything is already read.");
      return;
    }

    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        read: true,
      }))
    );

    toast.success(
      "All notifications marked as read"
    );
  }

  function deleteNotification(
    notification: AdminNotification
  ) {
    setNotifications((current) =>
      current.filter(
        (item) =>
          item.id !== notification.id
      )
    );

    toast.success(
      "Notification removed"
    );
  }

  function clearReadNotifications() {
    const readCount =
      notifications.filter(
        (notification) =>
          notification.read
      ).length;

    if (readCount === 0) {
      toast("There are no read notifications.");
      return;
    }

    setNotifications((current) =>
      current.filter(
        (notification) =>
          !notification.read
      )
    );

    toast.success(
      `${readCount} ${
        readCount === 1
          ? "notification"
          : "notifications"
      } cleared`
    );
  }

  return (
    <section className="min-h-full bg-[#fbfaf7]">
      <div className="px-5 py-8 sm:px-8 lg:px-9 lg:py-10 xl:px-10">
        <div className="mx-auto max-w-[1500px]">
          {/* =========================================
              HEADER
          ========================================== */}

          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-[9px] font-medium uppercase tracking-[0.28em] !text-[#9a7a70]">
                Élan Parfums / Back office
              </p>

              <div className="mt-4 flex items-center gap-4">
                <h1 className="font-display text-[46px] font-normal leading-none tracking-[-0.04em] !text-[#2e1e1d] sm:text-[54px] lg:text-[60px]">
                  Notifications
                </h1>

                {unreadCount > 0 && (
                  <span className="flex min-w-7 items-center justify-center bg-[#5a1425] px-2 py-1 text-[8px] font-medium !text-white">
                    {unreadCount}
                  </span>
                )}
              </div>

              <p className="mt-4 max-w-xl text-[11px] leading-5 !text-[#7f6f69] sm:text-[12px]">
                Stay close to orders, inventory,
                payments, delivery issues and
                anything that needs your attention.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={
                  clearReadNotifications
                }
                className="inline-flex min-h-[46px] items-center gap-3 border border-[#d8d0ca] px-5 text-[9px] font-medium !text-[#65534d] transition-colors hover:border-[#a68b81]"
              >
                <Trash2
                  className="size-3.5"
                  strokeWidth={1.4}
                />

                Clear read
              </button>

              <button
                type="button"
                onClick={markAllAsRead}
                className="inline-flex min-h-[46px] items-center gap-4 bg-[#5a1425] px-5 text-[9px] font-medium !text-white transition-colors hover:bg-[#6b1b2f]"
              >
                <CheckCheck
                  className="size-3.5"
                  strokeWidth={1.5}
                />

                Mark all read
              </button>
            </div>
          </div>

          {/* =========================================
              STATS
          ========================================== */}

          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="All notifications"
              value={notifications.length.toString()}
              helper="Current notification history"
            />

            <StatCard
              label="Unread"
              value={unreadCount.toString()}
              helper="Still waiting for you"
            />

            <StatCard
              label="Urgent"
              value={urgentCount.toString()}
              helper="Unread priority alerts"
            />

            <StatCard
              label="Today"
              value={todayCount.toString()}
              helper="Received today"
            />
          </div>

          {/* =========================================
              FILTERS
          ========================================== */}

          <div className="mt-6 border-y border-[#ded6cf] py-4">
            <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_170px_150px_160px]">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 !text-[#74625c]"
                  strokeWidth={1.4}
                />

                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search notifications..."
                  className="
                    h-[52px]
                    w-full
                    bg-[#f1eeea]
                    pl-11
                    pr-11
                    text-[10px]
                    !text-[#3d302c]
                    outline-none

                    placeholder:!text-[#9b8e88]

                    focus:bg-[#ece8e3]
                  "
                />

                {search && (
                  <button
                    type="button"
                    onClick={() =>
                      setSearch("")
                    }
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center !text-[#75635d]"
                  >
                    <X
                      className="size-3.5"
                      strokeWidth={1.4}
                    />
                  </button>
                )}
              </div>

              <FilterSelect
                label="Category"
                value={typeFilter}
                onChange={setTypeFilter}
                options={[
                  "All",
                  "Order",
                  "Payment",
                  "Inventory",
                  "Dispute",
                  "Delivery",
                  "Customer",
                  "System",
                ]}
              />

              <FilterSelect
                label="Read state"
                value={readFilter}
                onChange={setReadFilter}
                options={[
                  "All",
                  "Unread",
                  "Read",
                ]}
              />

              <FilterSelect
                label="Priority"
                value={priorityFilter}
                onChange={
                  setPriorityFilter
                }
                options={[
                  "All",
                  "Normal",
                  "Important",
                  "Urgent",
                ]}
              />
            </div>
          </div>

          {/* =========================================
              META
          ========================================== */}

          <div className="flex min-h-[58px] items-center justify-between gap-4">
            <p className="text-[9px] !text-[#8f817b]">
              {filteredNotifications.length}{" "}
              {filteredNotifications.length ===
              1
                ? "notification"
                : "notifications"}
            </p>

            {hasFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="border-b border-[#5a1425] pb-1 text-[8px] font-medium !text-[#5a1425]"
              >
                Clear filters
              </button>
            ) : (
              <p className="hidden text-[8px] uppercase tracking-[0.16em] !text-[#a08c84] sm:block">
                Latest first
              </p>
            )}
          </div>

          {/* =========================================
              NOTIFICATION LIST
          ========================================== */}

          {filteredNotifications.length >
          0 ? (
            <div className="border border-[#e5ddd3]">
              {filteredNotifications.map(
                (notification) => (
                  <NotificationRow
                    key={notification.id}
                    notification={
                      notification
                    }
                    onRead={() =>
                      markAsRead(
                        notification.id
                      )
                    }
                    onUnread={() =>
                      markAsUnread(
                        notification.id
                      )
                    }
                    onDelete={() =>
                      deleteNotification(
                        notification
                      )
                    }
                  />
                )
              )}
            </div>
          ) : (
            <EmptyNotifications
              filtered={hasFilters}
              onClear={clearFilters}
            />
          )}

          {/* =========================================
              FOOT NOTE
          ========================================== */}

          <div className="mt-5 border border-[#e5ddd3] bg-[#f3eee8] p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <Bell
                className="mt-0.5 size-4 shrink-0 !text-[#906f66]"
                strokeWidth={1.4}
              />

              <div>
                <p className="text-[9px] font-medium !text-[#483530]">
                  Real-time notifications later
                </p>

                <p className="mt-2 max-w-3xl text-[9px] leading-5 !text-[#85726b]">
                  When the NestJS backend is
                  connected, notifications can be
                  stored in PostgreSQL and created
                  by Inngest jobs after events such
                  as new orders, successful
                  payments, low stock, shipping
                  updates and disputes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   NOTIFICATION ROW
========================================================= */

function NotificationRow({
  notification,
  onRead,
  onUnread,
  onDelete,
}: {
  notification: AdminNotification;
  onRead: () => void;
  onUnread: () => void;
  onDelete: () => void;
}) {
  const Icon =
    getNotificationIcon(notification.type);

  return (
    <article
      className={`
        relative
        border-b
        border-[#e5ddd3]
        p-5
        last:border-b-0
        sm:p-6

        ${
          notification.read
            ? "bg-[#fbfaf7]"
            : "bg-[#f8f2ee]"
        }
      `}
    >
      {!notification.read && (
        <span className="absolute left-0 top-0 h-full w-[3px] bg-[#5a1425]" />
      )}

      <div className="grid gap-5 md:grid-cols-[44px_minmax(0,1fr)_auto] md:items-start">
        {/* Icon */}

        <span
          className={`
            flex
            size-11
            shrink-0
            items-center
            justify-center

            ${getIconStyle(
              notification.type
            )}
          `}
        >
          <Icon
            className="size-4"
            strokeWidth={1.4}
          />
        </span>

        {/* Content */}

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <NotificationTypeBadge
              type={notification.type}
            />

            <PriorityBadge
              priority={
                notification.priority
              }
            />

            {!notification.read && (
              <span className="text-[8px] font-medium uppercase tracking-[0.12em] !text-[#5a1425]">
                New
              </span>
            )}
          </div>

          <h2 className="mt-3 font-display text-[22px] font-normal !text-[#382724] sm:text-[24px]">
            {notification.title}
          </h2>

          <p className="mt-2 max-w-3xl text-[9px] leading-5 !text-[#806e67]">
            {notification.message}
          </p>

          <p className="mt-4 text-[8px] !text-[#a08d86]">
            {notification.createdAt}
          </p>

          {notification.href &&
            notification.actionLabel && (
              <Link
                href={notification.href}
                onClick={() => {
                  if (!notification.read) {
                    onRead();
                  }
                }}
                className="group mt-4 inline-flex items-center gap-3 border-b border-[#5a1425] pb-1 text-[9px] font-medium !text-[#5a1425]"
              >
                {
                  notification.actionLabel
                }

                <ExternalLink
                  className="size-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  strokeWidth={1.4}
                />
              </Link>
            )}
        </div>

        {/* Actions */}

        <div className="flex items-center gap-1 md:justify-end">
          {notification.read ? (
            <button
              type="button"
              onClick={onUnread}
              title="Mark as unread"
              aria-label="Mark as unread"
              className="flex size-9 items-center justify-center !text-[#77635d] transition-colors hover:bg-[#eee8e2] hover:!text-[#5a1425]"
            >
              <Mail
                className="size-3.5"
                strokeWidth={1.4}
              />
            </button>
          ) : (
            <button
              type="button"
              onClick={onRead}
              title="Mark as read"
              aria-label="Mark as read"
              className="flex size-9 items-center justify-center !text-[#77635d] transition-colors hover:bg-[#eee8e2] hover:!text-[#5a1425]"
            >
              <Check
                className="size-3.5"
                strokeWidth={1.5}
              />
            </button>
          )}

          <button
            type="button"
            onClick={onDelete}
            title="Delete notification"
            aria-label="Delete notification"
            className="flex size-9 items-center justify-center !text-[#977c75] transition-colors hover:bg-[#f5e9e7] hover:!text-[#9c3b3b]"
          >
            <Trash2
              className="size-3.5"
              strokeWidth={1.4}
            />
          </button>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   ICONS
========================================================= */

function getNotificationIcon(
  type: NotificationType
): ElementType {
  const icons: Record<
    NotificationType,
    ElementType
  > = {
    Order: ShoppingBag,
    Payment: CreditCard,
    Inventory: Package2,
    Dispute: CircleAlert,
    Delivery: Truck,
    Customer: UserRound,
    System: Activity,
  };

  return icons[type];
}

function getIconStyle(
  type: NotificationType
) {
  const styles: Record<
    NotificationType,
    string
  > = {
    Order:
      "bg-[#eee8f0] !text-[#735c78]",

    Payment:
      "bg-[#e8eee8] !text-[#526357]",

    Inventory:
      "bg-[#f4e9df] !text-[#95684f]",

    Dispute:
      "bg-[#f3e4e1] !text-[#99564e]",

    Delivery:
      "bg-[#e8edf2] !text-[#586b7c]",

    Customer:
      "bg-[#efeae5] !text-[#73635d]",

    System:
      "bg-[#e8ebea] !text-[#57655f]",
  };

  return styles[type];
}

/* =========================================================
   TYPE BADGE
========================================================= */

function NotificationTypeBadge({
  type,
}: {
  type: NotificationType;
}) {
  return (
    <span className="text-[8px] font-medium uppercase tracking-[0.14em] !text-[#8b756e]">
      {type}
    </span>
  );
}

/* =========================================================
   PRIORITY
========================================================= */

function PriorityBadge({
  priority,
}: {
  priority: NotificationPriority;
}) {
  if (priority === "Normal") {
    return null;
  }

  return (
    <span
      className={`
        inline-flex
        px-2
        py-1
        text-[7px]
        font-medium
        uppercase
        tracking-[0.1em]

        ${
          priority === "Urgent"
            ? "bg-[#f1e3e3] !text-[#994a4a]"
            : "bg-[#f4ebe1] !text-[#936548]"
        }
      `}
    >
      {priority}
    </span>
  );
}

/* =========================================================
   STATS
========================================================= */

function StatCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <article className="min-h-[145px] border border-[#e5ddd3] bg-[#fbfaf7] p-5">
      <p className="text-[9px] !text-[#8a7770]">
        {label}
      </p>

      <p className="mt-5 font-display text-[36px] leading-none tracking-[-0.03em] !text-[#2e1e1d]">
        {value}
      </p>

      <p className="mt-5 text-[9px] leading-5 !text-[#9a8a84]">
        {helper}
      </p>
    </article>
  );
}

/* =========================================================
   FILTER
========================================================= */

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="relative flex h-[52px] flex-col justify-center border-b border-[#d8d0ca] px-3">
      <span className="mb-1 text-[8px] !text-[#86746d]">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full cursor-pointer appearance-none bg-transparent pr-7 text-[10px] !text-[#3d302c] outline-none"
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>

      <ChevronDown
        className="pointer-events-none absolute bottom-[10px] right-2 size-3.5 !text-[#382b28]"
        strokeWidth={1.4}
      />
    </label>
  );
}

/* =========================================================
   EMPTY
========================================================= */

function EmptyNotifications({
  filtered,
  onClear,
}: {
  filtered: boolean;
  onClear: () => void;
}) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center border border-[#e5ddd3] px-6 text-center">
      <span className="flex size-12 items-center justify-center rounded-full border border-[#ddd3cd]">
        <Bell
          className="size-5 !text-[#927970]"
          strokeWidth={1.3}
        />
      </span>

      <p className="mt-7 text-[8px] font-medium uppercase tracking-[0.24em] !text-[#9a756c]">
        {filtered
          ? "Nothing matched"
          : "All caught up"}
      </p>

      <h2 className="mt-4 font-display text-[36px] font-normal !text-[#382724]">
        {filtered
          ? "No notifications found."
          : "Quiet for now."}
      </h2>

      <p className="mt-3 max-w-sm text-[10px] leading-5 !text-[#8b7972]">
        {filtered
          ? "Try changing your search or notification filters."
          : "New order, inventory and system activity will appear here."}
      </p>

      {filtered && (
        <button
          type="button"
          onClick={onClear}
          className="mt-6 border-b border-[#5a1425] pb-1 text-[9px] !text-[#5a1425]"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

/* =========================================================
   UNUSED GENERIC PANEL HELPER
========================================================= */

function Panel({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="border border-[#e5ddd3] bg-[#fbfaf7] p-5">
      {children}
    </div>
  );
}