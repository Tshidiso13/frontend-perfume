import type {
  Metadata,
} from "next";

import {
  AddressesPage,
} from "@/components/account/addresses/addresses-page";

export const metadata:
  Metadata = {
    title:
      "Addresses | ÉLAN Parfums",

    description:
      "Manage the delivery addresses saved to your ÉLAN Parfums account.",
  };

export default function AddressesRoutePage() {
  return (
    <AddressesPage />
  );
}
