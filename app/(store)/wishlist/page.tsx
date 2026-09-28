import type { Metadata } from "next";
import { WishlistPage } from "@/components/wishlist/wishlist-page";

export const metadata: Metadata = {
  title: "Wishlist",
  description:
    "Your saved fragrances, ready whenever you want to come back to them.",
};

export default function Page() {
  return <WishlistPage />;
}