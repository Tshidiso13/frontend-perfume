"use client";

import {
  useEffect,
} from "react";

import {
  announceNotificationsChanged,
  notificationsService,
} from "@/services/notifications.service";

export function AdminOrdersSeenMarker() {
  useEffect(
    () => {
      let cancelled =
        false;

      async function markSeen() {
        try {
          await notificationsService.markAdminOrderAlertsRead();

          if (
            !cancelled
          ) {
            announceNotificationsChanged();
          }
        } catch {
          /*
           * Do not block the Orders page if marking alerts
           * as seen fails.
           */
        }
      }

      void markSeen();

      return () => {
        cancelled =
          true;
      };
    },
    []
  );

  return null;
}
