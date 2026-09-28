import type { Metadata } from "next";
import { WomenPage } from "@/components/women/women-page";

export const metadata: Metadata = {
  title: "Women's Fragrances",
  description:
    "Explore floral, fresh, amber and softly sensual fragrances from Élan Parfums.",
};

export default function Page() {
  return <WomenPage />;
}