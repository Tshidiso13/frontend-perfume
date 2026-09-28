import type { Metadata } from "next";
import { CheckoutPage } from "@/components/checkout/checkout-page";

export const metadata: Metadata = {
  title: "Checkout",
  description:
    "Complete your Élan Parfums order securely.",
};

export default function Page() {
  return <CheckoutPage />;
}