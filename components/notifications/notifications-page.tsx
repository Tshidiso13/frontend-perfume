"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  Bell,
  Check,
  CircleAlert,
  CreditCard,
  LoaderCircle,
  MailOpen,
  MessageCircleWarning,
  Package,
  Search,
  ShieldAlert,
  Trash2,
  Truck,
  UserRound,
} from "lucide-react";

import {
  ordersService,
} from "@/services/orders.service";

import {
  announceNotificationsChanged,
  notificationsService,
  type NotificationItem,
  type NotificationType,
} from "@/services/notifications.service";

type NotificationsPageProps = {
  backHref:
    string;

  backLabel:
    string;

  eyebrow?:
    string;
};

const filters:
  Array<{
    label:
      string;

    value:
      "ALL" |
      NotificationType;
  }> = [
    {
      label:
        "All",
      value:
        "ALL",
    },
    {
      label:
        "Orders",
      value:
        "ORDER",
    },
    {
      label:
        "Payments",
      value:
        "PAYMENT",
    },
    {
      label:
        "Delivery",
      value:
        "DELIVERY",
    },
    {
      label:
        "Disputes",
      value:
        "DISPUTE",
    },
    {
      label:
        "System",
      value:
        "SYSTEM",
    },
  ];

export function NotificationsPage({
  backHref,
  backLabel,
  eyebrow =
    "Your ÉLAN",
}: NotificationsPageProps) {
  const [
    notifications,
    setNotifications,
  ] = useState<
    NotificationItem[]
  >([]);

  const [
    unreadCount,
    setUnreadCount,
  ] = useState(
    0
  );

  const [
    mode,
    setMode,
  ] = useState<
    "ACCOUNT" |
    "GUEST"
  >(
    "ACCOUNT"
  );

  const [
    filter,
    setFilter,
  ] = useState<
    "ALL" |
    NotificationType
  >(
    "ALL"
  );

  const [
    unreadOnly,
    setUnreadOnly,
  ] = useState(
    false
  );

  const [
    loading,
    setLoading,
  ] = useState(
    true
  );

  const [
    error,
    setError,
  ] = useState<
    string |
    null
  >(
    null
  );

  const [
    guestOrder,
    setGuestOrder,
  ] = useState("");

  const [
    guestEmail,
    setGuestEmail,
  ] = useState("");

  const [
    guestLookupLoading,
    setGuestLookupLoading,
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
            await notificationsService.getAll(
              {
                limit:
                  50,

                type:
                  filter ===
                    "ALL"
                    ? undefined
                    : filter,

                unreadOnly,
              }
            );

          setMode(
            "ACCOUNT"
          );

          setNotifications(
            response.data
          );

          setUnreadCount(
            response.unreadCount
          );
        } catch (
          accountError
        ) {
          if (
            !notificationsService.isUnauthorized(
              accountError
            )
          ) {
            setError(
              accountError instanceof
                Error
                ? accountError.message
                : "Unable to load notifications."
            );

            return;
          }

          /*
           * Logged-out customer:
           * switch to guest notifications backed by verified
           * guest order references stored in this browser.
           */
          setMode(
            "GUEST"
          );

          try {
            const response =
              await notificationsService.getGuestNotifications();

            const filtered =
              response.data.filter(
                (
                  item
                ) => {
                  if (
                    filter !==
                      "ALL" &&
                    item.type !==
                      filter
                  ) {
                    return false;
                  }

                  if (
                    unreadOnly &&
                    item.readAt
                  ) {
                    return false;
                  }

                  return true;
                }
              );

            setNotifications(
              filtered
            );

            setUnreadCount(
              response.unreadCount
            );
          } catch (
            guestError
          ) {
            setError(
              guestError instanceof
                Error
                ? guestError.message
                : "Unable to load guest notifications."
            );
          }
        } finally {
          setLoading(
            false
          );
        }
      },
      [
        filter,
        unreadOnly,
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

  async function verifyGuestOrder(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !guestOrder.trim() ||
      !guestEmail.trim()
    ) {
      setError(
        "Enter your order number and checkout email."
      );

      return;
    }

    setGuestLookupLoading(
      true
    );

    setError(
      null
    );

    try {
      await ordersService.lookupAndRememberGuest(
        guestOrder,
        guestEmail
      );

      setGuestOrder(
        ""
      );

      await load();
    } catch (
      error
    ) {
      setError(
        error instanceof
          Error
          ? error.message
          : "We could not verify that guest order."
      );
    } finally {
      setGuestLookupLoading(
        false
      );
    }
  }

  async function markRead(
    notification:
      NotificationItem
  ) {
    try {
      const updated =
        mode ===
        "GUEST"
          ? notificationsService.markGuestRead(
              notification
            )
          : await notificationsService.markRead(
              notification.id
            );

      setNotifications(
        (
          current
        ) =>
          current.map(
            (
              item
            ) =>
              item.id ===
              updated.id
                ? updated
                : item
          )
      );

      if (
        !notification.readAt
      ) {
        setUnreadCount(
          (
            count
          ) =>
            Math.max(
              0,
              count -
                1
            )
        );
      }

      announceNotificationsChanged();
    } catch {
      // Keep UI stable.
    }
  }

  async function markUnread(
    notification:
      NotificationItem
  ) {
    try {
      const updated =
        mode ===
        "GUEST"
          ? notificationsService.markGuestUnread(
              notification
            )
          : await notificationsService.markUnread(
              notification.id
            );

      setNotifications(
        (
          current
        ) =>
          current.map(
            (
              item
            ) =>
              item.id ===
              updated.id
                ? updated
                : item
          )
      );

      if (
        notification.readAt
      ) {
        setUnreadCount(
          (
            count
          ) =>
            count +
            1
        );
      }

      announceNotificationsChanged();
    } catch {
      // Keep UI stable.
    }
  }

  async function markAllRead() {
    try {
      if (
        mode ===
        "GUEST"
      ) {
        const allGuest =
          await notificationsService.getGuestNotifications();

        notificationsService.markAllGuestRead(
          allGuest.data
        );
      } else {
        await notificationsService.markAllRead();
      }

      const now =
        new Date()
          .toISOString();

      setNotifications(
        (
          current
        ) =>
          current.map(
            (
              item
            ) => ({
              ...item,

              readAt:
                item.readAt ??
                now,
            })
          )
      );

      setUnreadCount(
        0
      );

      if (
        unreadOnly
      ) {
        setNotifications(
          []
        );
      }

      announceNotificationsChanged();
    } catch {
      // Keep UI stable.
    }
  }

  async function remove(
    notification:
      NotificationItem
  ) {
    if (
      mode ===
      "GUEST"
    ) {
      return;
    }

    if (
      !notification.recipientUserId
    ) {
      return;
    }

    try {
      await notificationsService.remove(
        notification.id
      );

      setNotifications(
        (
          current
        ) =>
          current.filter(
            (
              item
            ) =>
              item.id !==
              notification.id
          )
      );

      if (
        !notification.readAt
      ) {
        setUnreadCount(
          (
            count
          ) =>
            Math.max(
              0,
              count -
                1
            )
        );
      }

      announceNotificationsChanged();
    } catch {
      // Keep UI stable.
    }
  }

  return (
    <section className="min-h-screen bg-[#fbfaf7] px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
      <div className="mx-auto max-w-[1100px]">
        <Link
          href={
            backHref
          }
          className="text-[9px] !text-[#81706a] transition hover:!text-[#6b2230]"
        >
          ←{" "}
          {
            backLabel
          }
        </Link>

        <div className="mt-8 flex flex-col justify-between gap-6 border-b border-[#dfd7d0] pb-9 md:flex-row md:items-end">
          <div>
            <p className="text-[9px] font-medium uppercase tracking-[0.28em] !text-[#9a756c]">
              {
                mode ===
                "GUEST"
                  ? "Guest updates"
                  : eyebrow
              }
            </p>

            <h1 className="mt-3 font-display text-[48px] leading-none tracking-[-0.035em] !text-[#342725] sm:text-[58px]">
              Notifications.
            </h1>

            <p className="mt-4 text-[10px] !text-[#86756e]">
              {
                unreadCount
              }{" "}
              unread{" "}
              {
                unreadCount ===
                1
                  ? "update"
                  : "updates"
              }
            </p>
          </div>

          {unreadCount >
            0 && (
            <button
              type="button"
              onClick={() =>
                void markAllRead()
              }
              className="inline-flex min-h-[42px] items-center gap-2 self-start border border-[#6b2230] px-4 text-[9px] font-medium !text-[#6b2230]"
            >
              <Check
                className="size-3.5"
                strokeWidth={
                  1.4
                }
              />

              Mark all read
            </button>
          )}
        </div>

        {mode ===
          "GUEST" && (
          <form
            onSubmit={
              verifyGuestOrder
            }
            className="grid gap-3 border-b border-[#dfd7d0] py-5 md:grid-cols-[1fr_1fr_auto]"
          >
            <div>
              <label className="mb-2 block text-[8px] uppercase tracking-[0.15em] !text-[#90766e]">
                Order number
              </label>

              <input
                value={
                  guestOrder
                }
                onChange={(
                  event
                ) =>
                  setGuestOrder(
                    event.target.value
                  )
                }
                placeholder="ELN-..."
                className="h-11 w-full border border-[#ddd4ce] bg-transparent px-3 text-[10px] !text-[#382724] outline-none focus:border-[#6b2230]"
              />
            </div>

            <div>
              <label className="mb-2 block text-[8px] uppercase tracking-[0.15em] !text-[#90766e]">
                Checkout email
              </label>

              <input
                type="email"
                value={
                  guestEmail
                }
                onChange={(
                  event
                ) =>
                  setGuestEmail(
                    event.target.value
                  )
                }
                placeholder="you@example.com"
                className="h-11 w-full border border-[#ddd4ce] bg-transparent px-3 text-[10px] !text-[#382724] outline-none focus:border-[#6b2230]"
              />
            </div>

            <button
              type="submit"
              disabled={
                guestLookupLoading
              }
              className="mt-[22px] flex h-11 items-center justify-center gap-2 bg-[#571628] px-5 text-[9px] font-medium !text-white disabled:opacity-60"
            >
              {guestLookupLoading ? (
                <LoaderCircle
                  className="size-4 animate-spin"
                  strokeWidth={
                    1.4
                  }
                />
              ) : (
                <Search
                  className="size-4"
                  strokeWidth={
                    1.4
                  }
                />
              )}

              Find updates
            </button>
          </form>
        )}

        <div className="flex flex-col gap-4 border-b border-[#dfd7d0] py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2 overflow-x-auto">
            {filters.map(
              (
                item
              ) => (
                <button
                  key={
                    item.value
                  }
                  type="button"
                  onClick={() =>
                    setFilter(
                      item.value
                    )
                  }
                  className={`shrink-0 border px-3.5 py-2 text-[8px] ${
                    filter ===
                    item.value
                      ? "border-[#571628] bg-[#571628] !text-white"
                      : "border-[#dcd3cd] !text-[#66544e]"
                  }`}
                >
                  {
                    item.label
                  }
                </button>
              )
            )}
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-[9px] !text-[#695852]">
            <input
              type="checkbox"
              checked={
                unreadOnly
              }
              onChange={(
                event
              ) =>
                setUnreadOnly(
                  event.target.checked
                )
              }
              className="accent-[#6b2230]"
            />

            Unread only
          </label>
        </div>

        {loading ? (
          <div className="flex min-h-[430px] items-center justify-center">
            <LoaderCircle
              className="size-5 animate-spin !text-[#6b2230]"
              strokeWidth={
                1.4
              }
            />
          </div>
        ) : error ? (
          <div className="flex min-h-[300px] items-center justify-center text-center">
            <div>
              <Bell
                className="mx-auto size-6 !text-[#9a756c]"
                strokeWidth={
                  1.25
                }
              />

              <p className="mt-5 font-display text-[30px] !text-[#382724]">
                Notifications unavailable.
              </p>

              <p className="mt-2 text-[10px] !text-[#8a7770]">
                {
                  error
                }
              </p>
            </div>
          </div>
        ) : notifications.length ===
          0 ? (
          <div className="flex min-h-[430px] items-center justify-center text-center">
            <div>
              <MailOpen
                className="mx-auto size-6 !text-[#9a756c]"
                strokeWidth={
                  1.25
                }
              />

              <p className="mt-5 font-display text-[31px] !text-[#382724]">
                Nothing new here.
              </p>

              <p className="mt-2 text-[10px] !text-[#8a7770]">
                {
                  mode ===
                  "GUEST"
                    ? "Enter a guest order number and checkout email above to see its updates."
                    : "New order, payment, delivery and account updates will appear here."
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[#e5ddd7]">
            {notifications.map(
              (
                notification
              ) => (
                <NotificationRow
                  key={
                    notification.id
                  }
                  notification={
                    notification
                  }
                  guest={
                    mode ===
                    "GUEST"
                  }
                  onRead={() =>
                    void markRead(
                      notification
                    )
                  }
                  onUnread={() =>
                    void markUnread(
                      notification
                    )
                  }
                  onDelete={() =>
                    void remove(
                      notification
                    )
                  }
                />
              )
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function NotificationRow({
  notification,
  guest,
  onRead,
  onUnread,
  onDelete,
}: {
  notification:
    NotificationItem;

  guest:
    boolean;

  onRead:
    () =>
      void;

  onUnread:
    () =>
      void;

  onDelete:
    () =>
      void;
}) {
  const Icon =
    iconForType(
      notification.type
    );

  return (
    <article
      className={`grid gap-4 py-5 sm:grid-cols-[44px_1fr_auto] sm:items-start ${
        notification.readAt
          ? ""
          : "bg-[#f7f2ee]"
      }`}
    >
      <div className="ml-4 flex size-10 items-center justify-center rounded-full bg-[#ece6e1] !text-[#6b2230] sm:ml-0">
        <Icon
          className="size-[17px]"
          strokeWidth={
            1.35
          }
        />
      </div>

      <div className="px-4 sm:px-0">
        <div className="flex flex-wrap items-center gap-2">
          {!notification.readAt && (
            <span className="size-1.5 rounded-full bg-[#6b2230]" />
          )}

          <h2 className="text-[11px] font-medium !text-[#3e2e29]">
            {
              notification.title
            }
          </h2>

          {notification.priority !==
            "NORMAL" && (
            <span className={`text-[7px] font-semibold uppercase tracking-[0.1em] ${
              notification.priority ===
              "URGENT"
                ? "!text-[#9d3e38]"
                : "!text-[#8a6734]"
            }`}>
              {
                notification.priority
              }
            </span>
          )}
        </div>

        <p className="mt-2 max-w-2xl text-[10px] leading-5 !text-[#796861]">
          {
            notification.message
          }
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-4">
          <span className="text-[8px] uppercase tracking-[0.12em] !text-[#9e8c85]">
            {
              formatDate(
                notification.createdAt
              )
            }
          </span>

          {notification.href && (
            <Link
              href={
                notification.href
              }
              onClick={
                onRead
              }
              className="border-b border-[#6b2230] pb-0.5 text-[8px] font-medium !text-[#6b2230]"
            >
              View
            </Link>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 px-4 sm:px-0">
        {notification.readAt ? (
          <button
            type="button"
            title="Mark unread"
            onClick={
              onUnread
            }
            className="flex size-9 items-center justify-center !text-[#77655f] hover:!text-[#6b2230]"
          >
            <Bell
              className="size-4"
              strokeWidth={
                1.35
              }
            />
          </button>
        ) : (
          <button
            type="button"
            title="Mark read"
            onClick={
              onRead
            }
            className="flex size-9 items-center justify-center !text-[#77655f] hover:!text-[#6b2230]"
          >
            <Check
              className="size-4"
              strokeWidth={
                1.35
              }
            />
          </button>
        )}

        {!guest &&
          notification.recipientUserId && (
          <button
            type="button"
            title="Delete"
            onClick={
              onDelete
            }
            className="flex size-9 items-center justify-center !text-[#98706a] hover:!text-[#8e3e37]"
          >
            <Trash2
              className="size-4"
              strokeWidth={
                1.35
              }
            />
          </button>
        )}
      </div>
    </article>
  );
}

function iconForType(
  type:
    NotificationType
) {
  switch (
    type
  ) {
    case "ORDER":
      return Package;

    case "PAYMENT":
      return CreditCard;

    case "DELIVERY":
      return Truck;

    case "DISPUTE":
      return MessageCircleWarning;

    case "INVENTORY":
      return CircleAlert;

    case "CUSTOMER":
      return UserRound;

    case "SYSTEM":
    default:
      return ShieldAlert;
  }
}

function formatDate(
  value:
    string
) {
  return new Intl.DateTimeFormat(
    "en-ZA",
    {
      day:
        "2-digit",
      month:
        "short",
      year:
        "numeric",
      hour:
        "2-digit",
      minute:
        "2-digit",
    }
  ).format(
    new Date(
      value
    )
  );
}
