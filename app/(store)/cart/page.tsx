import type { Metadata } from "next";
import { CartPage } from "@/components/cart/cart-page";

export const metadata: Metadata = {
  title: "Your Bag",
  description:
    "Review the fragrances in your Élan Parfums shopping bag.",
};

export default function Page() {
  return <CartPage />;
}