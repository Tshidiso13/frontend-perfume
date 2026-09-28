"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  NOTIFICATIONS_CHANGED_EVENT,
  notificationsService,
} from "@/services/notifications.service";

export type AdminNavBadgeCounts = {
  newOrders:
    number;

  unreadNotifications:
    number;
};

const EMPTY_BADGES:
  AdminNavBadgeCounts = {
    newOrders:
      0,

    unreadNotifications:
      0,
  };

export function useAdminNavBadges() {
  const [
    badges,
    setBadges,
  ] = useState<
    AdminNavBadgeCounts
  >(
    EMPTY_BADGES
  );

  const [
    loading,
    setLoading,
  ] = useState(
    true
  );

  const refresh =
    useCallback(
      async () => {
        try {
          const response =
            await notificationsService.getAdminBadges();

          setBadges(
            response
          );
        } catch {
          /*
           * Admin layout/auth handles authentication errors.
           * Avoid breaking the sidebar if the request happens
           * while a session is refreshing.
           */
          setBadges(
            EMPTY_BADGES
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
      void refresh();

      /*
       * V1 uses lightweight polling. New orders and Inngest
       * notifications can arrive without a browser event.
       */
      const interval =
        window.setInterval(
          () => {
            void refresh();
          },
          20_000
        );

      const onChanged =
        () => {
          void refresh();
        };

      const onVisibility =
        () => {
          if (
            document.visibilityState ===
            "visible"
          ) {
            void refresh();
          }
        };

      window.addEventListener(
        NOTIFICATIONS_CHANGED_EVENT,
        onChanged
      );

      window.addEventListener(
        "focus",
        onChanged
      );

      document.addEventListener(
        "visibilitychange",
        onVisibility
      );

      return () => {
        window.clearInterval(
          interval
        );

        window.removeEventListener(
          NOTIFICATIONS_CHANGED_EVENT,
          onChanged
        );

        window.removeEventListener(
          "focus",
          onChanged
        );

        document.removeEventListener(
          "visibilitychange",
          onVisibility
        );
      };
    },
    [
      refresh,
    ]
  );

  return {
    ...badges,
    loading,
    refresh,
  };
}
