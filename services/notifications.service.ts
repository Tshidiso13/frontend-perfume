import {
  api,
} from "@/lib/api";

import {
  ordersService,
  type GuestOrderReference,
} from "@/services/orders.service";

export type NotificationType =
  | "ORDER"
  | "PAYMENT"
  | "INVENTORY"
  | "DISPUTE"
  | "DELIVERY"
  | "CUSTOMER"
  | "SYSTEM";

export type NotificationPriority =
  | "NORMAL"
  | "IMPORTANT"
  | "URGENT";

export type NotificationItem = {
  id: string;

  recipientUserId:
    string |
    null;

  targetRole:
    "CUSTOMER" |
    "ADMIN" |
    null;

  type:
    NotificationType;

  priority:
    NotificationPriority;

  title:
    string;

  message:
    string;

  href:
    string |
    null;

  metadata:
    Record<
      string,
      unknown
    > |
    null;

  readAt:
    string |
    null;

  createdAt:
    string;
};

export type NotificationsResponse = {
  data:
    NotificationItem[];

  unreadCount:
    number;

  pagination: {
    page:
      number;

    limit:
      number;

    total:
      number;

    pages:
      number;
  };
};

const GUEST_READ_KEY =
  "elan_guest_notification_reads";

export const notificationsService = {
  /* =======================================================
     ACCOUNT / ADMIN
  ======================================================== */

  getAll(
    params: {
      page?:
        number;

      limit?:
        number;

      type?:
        NotificationType;

      priority?:
        NotificationPriority;

      unreadOnly?:
        boolean;
    } = {}
  ) {
    const query =
      new URLSearchParams();

    if (
      params.page
    ) {
      query.set(
        "page",
        String(
          params.page
        )
      );
    }

    if (
      params.limit
    ) {
      query.set(
        "limit",
        String(
          params.limit
        )
      );
    }

    if (
      params.type
    ) {
      query.set(
        "type",
        params.type
      );
    }

    if (
      params.priority
    ) {
      query.set(
        "priority",
        params.priority
      );
    }

    if (
      params.unreadOnly !==
      undefined
    ) {
      query.set(
        "unreadOnly",
        String(
          params.unreadOnly
        )
      );
    }

    const suffix =
      query.toString();

    return api<NotificationsResponse>(
      `/notifications${
        suffix
          ? `?${suffix}`
          : ""
      }`
    );
  },

  getUnreadCount() {
    return api<{
      count:
        number;
    }>(
      "/notifications/unread-count"
    );
  },

  getAdminBadges() {
    return api<{
      newOrders:
        number;

      unreadNotifications:
        number;
    }>(
      "/notifications/admin-badges"
    );
  },

  markAdminOrderAlertsRead() {
    return api<{
      updated:
        number;
    }>(
      "/notifications/admin-orders/read",
      {
        method:
          "PATCH",
      }
    );
  },

  markRead(
    notificationId:
      string
  ) {
    return api<NotificationItem>(
      `/notifications/${encodeURIComponent(
        notificationId
      )}/read`,
      {
        method:
          "PATCH",
      }
    );
  },

  markUnread(
    notificationId:
      string
  ) {
    return api<NotificationItem>(
      `/notifications/${encodeURIComponent(
        notificationId
      )}/unread`,
      {
        method:
          "PATCH",
      }
    );
  },

  markAllRead() {
    return api<{
      updated:
        number;
    }>(
      "/notifications/read-all",
      {
        method:
          "PATCH",
      }
    );
  },

  remove(
    notificationId:
      string
  ) {
    return api<{
      deleted:
        boolean;
    }>(
      `/notifications/${encodeURIComponent(
        notificationId
      )}`,
      {
        method:
          "DELETE",
      }
    );
  },

  /* =======================================================
     GUEST
  ======================================================== */

  async getGuestNotifications(
    refs?:
      GuestOrderReference[]
  ):
    Promise<NotificationsResponse> {
    const references =
      refs ??
      ordersService.getGuestReferences();

    if (
      references.length ===
      0
    ) {
      return emptyResponse();
    }

    const response =
      await api<{
        data:
          NotificationItem[];
      }>(
        "/notifications/guest",
        {
          method:
            "POST",

          body:
            JSON.stringify({
              orders:
                references.map(
                  (
                    reference
                  ) => ({
                    orderId:
                      reference.orderId,

                    email:
                      reference.email,
                  })
                ),
            }),
        }
      );

    const data =
      applyGuestReadState(
        response.data
      );

    return {
      data,

      unreadCount:
        data.filter(
          (
            item
          ) =>
            !item.readAt
        ).length,

      pagination: {
        page:
          1,

        limit:
          data.length,

        total:
          data.length,

        pages:
          1,
      },
    };
  },

  markGuestRead(
    notification:
      NotificationItem
  ) {
    const ids =
      readGuestReadIds();

    ids.add(
      notification.id
    );

    writeGuestReadIds(
      ids
    );

    return {
      ...notification,

      readAt:
        notification.readAt ??
        new Date()
          .toISOString(),
    };
  },

  markGuestUnread(
    notification:
      NotificationItem
  ) {
    const ids =
      readGuestReadIds();

    ids.delete(
      notification.id
    );

    writeGuestReadIds(
      ids
    );

    return {
      ...notification,

      readAt:
        null,
    };
  },

  markAllGuestRead(
    notifications:
      NotificationItem[]
  ) {
    const ids =
      readGuestReadIds();

    for (
      const notification
      of notifications
    ) {
      ids.add(
        notification.id
      );
    }

    writeGuestReadIds(
      ids
    );
  },

  async getGuestUnreadCount() {
    const response =
      await this.getGuestNotifications();

    return {
      count:
        response.unreadCount,
    };
  },

  isGuestNotification(
    notification:
      NotificationItem
  ) {
    return notification.id.startsWith(
      "guest:"
    );
  },

  isUnauthorized(
    error:
      unknown
  ) {
    return isUnauthorized(
      error
    );
  },
};

export const NOTIFICATIONS_CHANGED_EVENT =
  "elan:notifications-changed";

export function announceNotificationsChanged() {
  if (
    typeof window !==
    "undefined"
  ) {
    window.dispatchEvent(
      new Event(
        NOTIFICATIONS_CHANGED_EVENT
      )
    );
  }
}

function emptyResponse():
  NotificationsResponse {
  return {
    data: [],
    unreadCount:
      0,

    pagination: {
      page:
        1,
      limit:
        0,
      total:
        0,
      pages:
        1,
    },
  };
}

function applyGuestReadState(
  notifications:
    NotificationItem[]
) {
  const readIds =
    readGuestReadIds();

  const now =
    new Date()
      .toISOString();

  return notifications.map(
    (
      notification
    ) => ({
      ...notification,

      readAt:
        readIds.has(
          notification.id
        )
          ? notification.readAt ??
            now
          : null,
    })
  );
}

function readGuestReadIds() {
  const ids =
    new Set<string>();

  if (
    typeof window ===
    "undefined"
  ) {
    return ids;
  }

  try {
    const raw =
      window.localStorage.getItem(
        GUEST_READ_KEY
      );

    if (
      !raw
    ) {
      return ids;
    }

    const parsed =
      JSON.parse(
        raw
      );

    if (
      Array.isArray(
        parsed
      )
    ) {
      for (
        const id
        of parsed
      ) {
        if (
          typeof id ===
          "string"
        ) {
          ids.add(
            id
          );
        }
      }
    }
  } catch {
    return ids;
  }

  return ids;
}

function writeGuestReadIds(
  ids:
    Set<string>
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  window.localStorage.setItem(
    GUEST_READ_KEY,
    JSON.stringify(
      Array.from(
        ids
      )
    )
  );
}

function isUnauthorized(
  error:
    unknown
) {
  const pattern =
    /401|unauthori[sz]ed|not authenticated|authentication required|sign in|session has expired/i;

  if (
    typeof error ===
    "string"
  ) {
    return pattern.test(
      error
    );
  }

  if (
    error instanceof
      Error
  ) {
    return pattern.test(
      error.message
    );
  }

  if (
    typeof error ===
      "object" &&
    error !==
      null
  ) {
    const candidate =
      error as {
        status?:
          unknown;

        statusCode?:
          unknown;

        message?:
          unknown;

        error?:
          unknown;

        response?:
          unknown;
      };

    if (
      Number(
        candidate.status
      ) ===
        401 ||
      Number(
        candidate.statusCode
      ) ===
        401
    ) {
      return true;
    }

    for (
      const value
      of [
        candidate.message,
        candidate.error,
      ]
    ) {
      if (
        typeof value ===
          "string" &&
        pattern.test(
          value
        )
      ) {
        return true;
      }
    }

    if (
      typeof candidate.response ===
        "object" &&
      candidate.response !==
        null
    ) {
      const response =
        candidate.response as {
          status?:
            unknown;
        };

      if (
        Number(
          response.status
        ) ===
        401
      ) {
        return true;
      }
    }
  }

  return false;
}
