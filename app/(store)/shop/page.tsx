import type { Metadata } from "next";
import { ShopPage } from "@/components/shop/shop-page";

export const metadata: Metadata = {
  title: "Shop Fragrances",
  description:
    "Explore the Élan fragrance collection by mood, family and scent.",
};

export default function Page() {
  return <ShopPage />;
}