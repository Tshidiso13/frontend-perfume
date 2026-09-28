import type {
  Metadata,
} from "next";

import {
  AccountDashboard,
} from "@/components/account/account-dashboard";

export const metadata:
  Metadata = {
    title:
      "My Account | ÉLAN Parfums",

    description:
      "Manage your ÉLAN Parfums orders, saved fragrances, notifications and account details.",
  };

export default function AccountPage() {
  return (
    <AccountDashboard />
  );
}
