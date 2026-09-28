"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import {
  Bell,
  CircleAlert,
  CreditCard,
  LoaderCircle,
  MessageCircleWarning,
  Package,
  ShieldAlert,
  Truck,
  UserRound,
  X,
} from "lucide-react";

import {
  announceNotificationsChanged,
  NOTIFICATIONS_CHANGED_EVENT,
  notificationsService,
  type NotificationItem,
  type NotificationType,
} from "@/services/notifications.service";

type NotificationButtonProps = {
  allNotificationsHref?:
    string;
};

export function NotificationButton({
  allNotificationsHref =
    "/account/notifications",
}: NotificationButtonProps) {
  const router =
    useRouter();

  const rootRef =
    useRef<HTMLDivElement>(
      null
    );

  const [
    open,
    setOpen,
  ] = useState(
    false
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
    unreadCount,
    setUnreadCount,
  ] = useState(
    0
  );

  const [
    notifications,
    setNotifications,
  ] = useState<
    NotificationItem[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(
    false
  );

  const refreshCount =
    useCallback(
      async () => {
        try {
          const response =
            await notificationsService.getUnreadCount();

          setMode(
            "ACCOUNT"
          );

          setUnreadCount(
            response.count
          );
        } catch (
          error
        ) {
          if (
            !notificationsService.isUnauthorized(
              error
            )
          ) {
            setUnreadCount(
              0
            );

            return;
          }

          setMode(
            "GUEST"
          );

          try {
            const response =
              await notificationsService.getGuestUnreadCount();

            setUnreadCount(
              response.count
            );
          } catch {
            setUnreadCount(
              0
            );
          }
        }
      },
      []
    );

  const loadLatest =
    useCallback(
      async () => {
        setLoading(
          true
        );

        try {
          try {
            const response =
              await notificationsService.getAll(
                {
                  limit:
                    8,
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

            return;
          } catch (
            error
          ) {
            if (
              !notificationsService.isUnauthorized(
                error
              )
            ) {
              throw error;
            }
          }

          const guest =
            await notificationsService.getGuestNotifications();

          setMode(
            "GUEST"
          );

          setNotifications(
            guest.data.slice(
              0,
              8
            )
          );

          setUnreadCount(
            guest.unreadCount
          );
        } catch {
          setNotifications(
            []
          );
        } finally {
          setLoading(
            false
          );
        }
      },
      []
    );

  useEffect(
    () => {
      void refreshCount();

      const interval =
        window.setInterval(
          () => {
            void refreshCount();
          },
          45_000
        );

      const onChanged =
        () => {
          void refreshCount();

          if (
            open
          ) {
            void loadLatest();
          }
        };

      window.addEventListener(
        NOTIFICATIONS_CHANGED_EVENT,
        onChanged
      );

      return () => {
        window.clearInterval(
          interval
        );

        window.removeEventListener(
          NOTIFICATIONS_CHANGED_EVENT,
          onChanged
        );
      };
    },
    [
      loadLatest,
      open,
      refreshCount,
    ]
  );

  useEffect(
    () => {
      if (
        open
      ) {
        void loadLatest();
      }
    },
    [
      loadLatest,
      open,
    ]
  );

  useEffect(
    () => {
      const onPointerDown =
        (
          event:
            PointerEvent
        ) => {
          if (
            rootRef.current &&
            !rootRef.current.contains(
              event.target as
                Node
            )
          ) {
            setOpen(
              false
            );
          }
        };

      document.addEventListener(
        "pointerdown",
        onPointerDown
      );

      return () => {
        document.removeEventListener(
          "pointerdown",
          onPointerDown
        );
      };
    },
    []
  );

  async function openNotification(
    notification:
      NotificationItem
  ) {
    if (
      !notification.readAt
    ) {
      try {
        if (
          mode ===
          "GUEST"
        ) {
          notificationsService.markGuestRead(
            notification
          );
        } else {
          await notificationsService.markRead(
            notification.id
          );
        }

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

        announceNotificationsChanged();
      } catch {
        // Navigation may continue.
      }
    }

    setOpen(
      false
    );

    if (
      notification.href
    ) {
      router.push(
        notification.href
      );
    }
  }

  async function markAllRead() {
    try {
      if (
        mode ===
        "GUEST"
      ) {
        const response =
          await notificationsService.getGuestNotifications();

        notificationsService.markAllGuestRead(
          response.data
        );
      } else {
        await notificationsService.markAllRead();
      }

      setUnreadCount(
        0
      );

      announceNotificationsChanged();

      await loadLatest();
    } catch {
      // Keep dropdown usable.
    }
  }

  return (
    <div
      ref={
        rootRef
      }
      className="relative"
    >
      <button
        type="button"
        aria-label="Notifications"
        aria-expanded={
          open
        }
        onClick={() =>
          setOpen(
            (
              value
            ) =>
              !value
          )
        }
        className="relative flex size-10 items-center justify-center !text-[#4a3934] transition hover:!text-[#6b2230]"
      >
        <Bell
          className="size-[18px]"
          strokeWidth={
            1.35
          }
        />

        {unreadCount >
          0 && (
          <span className="absolute right-0.5 top-0.5 flex min-h-[16px] min-w-[16px] items-center justify-center rounded-full bg-[#6b2230] px-1 text-[7px] font-semibold leading-none !text-white">
            {
              unreadCount >
              99
                ? "99+"
                : unreadCount
            }
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+12px)] z-[80] w-[min(390px,calc(100vw-32px))] border border-[#ddd5ce] bg-[#fbfaf7] shadow-[0_24px_70px_rgba(49,25,30,0.16)]">
          <div className="flex items-center justify-between border-b border-[#e7dfd8] px-5 py-4">
            <div>
              <p className="text-[8px] font-medium uppercase tracking-[0.2em] !text-[#9a756c]">
                {
                  mode ===
                  "GUEST"
                    ? "Guest"
                    : "ÉLAN"
                }
              </p>

              <h2 className="mt-1 font-display text-[23px] !text-[#382724]">
                Notifications
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {unreadCount >
                0 && (
                <button
                  type="button"
                  onClick={() =>
                    void markAllRead()
                  }
                  className="text-[8px] font-medium !text-[#6b2230]"
                >
                  Mark all read
                </button>
              )}

              <button
                type="button"
                onClick={() =>
                  setOpen(
                    false
                  )
                }
                aria-label="Close notifications"
                className="flex size-8 items-center justify-center !text-[#806f69]"
              >
                <X
                  className="size-4"
                  strokeWidth={
                    1.35
                  }
                />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <LoaderCircle
                className="size-5 animate-spin !text-[#6b2230]"
                strokeWidth={
                  1.4
                }
              />
            </div>
          ) : notifications.length ===
            0 ? (
            <div className="px-6 py-14 text-center">
              <Bell
                className="mx-auto size-5 !text-[#a28f87]"
                strokeWidth={
                  1.25
                }
              />

              <p className="mt-4 font-display text-[23px] !text-[#382724]">
                All quiet for now.
              </p>

              <p className="mt-2 text-[9px] leading-5 !text-[#8c7a73]">
                {
                  mode ===
                  "GUEST"
                    ? "Verify a guest order on the notifications page to see its updates."
                    : "Order, payment and delivery updates will appear here."
                }
              </p>
            </div>
          ) : (
            <div className="max-h-[430px] overflow-y-auto">
              {notifications.map(
                (
                  notification
                ) => {
                  const Icon =
                    iconForType(
                      notification.type
                    );

                  return (
                    <button
                      key={
                        notification.id
                      }
                      type="button"
                      onClick={() =>
                        void openNotification(
                          notification
                        )
                      }
                      className={`grid w-full grid-cols-[36px_1fr] gap-3 border-b border-[#ece5df] px-5 py-4 text-left ${
                        notification.readAt
                          ? "bg-[#fbfaf7]"
                          : "bg-[#f5f0eb]"
                      }`}
                    >
                      <div className="flex size-9 items-center justify-center rounded-full bg-[#ece6e1] !text-[#6b2230]">
                        <Icon
                          className="size-4"
                          strokeWidth={
                            1.35
                          }
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-[10px] font-medium !text-[#3d2c28]">
                          {
                            notification.title
                          }
                        </p>

                        <p className="mt-1 line-clamp-2 text-[9px] leading-4 !text-[#83726c]">
                          {
                            notification.message
                          }
                        </p>
                      </div>
                    </button>
                  );
                }
              )}
            </div>
          )}

          <div className="border-t border-[#e7dfd8] p-3">
            <Link
              href={
                allNotificationsHref
              }
              onClick={() =>
                setOpen(
                  false
                )
              }
              className="flex h-10 items-center justify-center bg-[#35101c] text-[9px] font-medium !text-white"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
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
