import type {
  Metadata,
} from "next";

import {
  SecurityPage,
} from "@/components/account/security/security-page";

export const metadata:
  Metadata = {
    title:
      "Password & Security | ÉLAN Parfums",

    description:
      "Manage your ÉLAN Parfums password and active account sessions.",
  };

export default function SecurityRoutePage() {
  return (
    <SecurityPage />
  );
}
