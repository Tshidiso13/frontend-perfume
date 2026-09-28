import type {
  Metadata,
} from "next";

import {
  NotificationsPage,
} from "@/components/notifications/notifications-page";

export const metadata: Metadata = {
  title:
    "Notifications | ÉLAN Parfums",

  description:
    "View your ÉLAN order, payment and delivery updates.",
};

export default function Page() {
  return (
    <NotificationsPage
      backHref="/account"
      backLabel="Back to account"
    />
  );
}
