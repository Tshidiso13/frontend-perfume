import type {
  Metadata,
} from "next";

import {
  NotificationsPage,
} from "@/components/notifications/notifications-page";

export const metadata: Metadata = {
  title:
    "Notifications | ÉLAN Admin",

  description:
    "View operational and system notifications for ÉLAN.",
};

export default function Page() {
  return (
    <NotificationsPage
      backHref="/admin"
      backLabel="Back to admin"
      eyebrow="ÉLAN Admin"
    />
  );
}
