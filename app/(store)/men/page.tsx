import type { Metadata } from "next";
import { MenPage } from "@/components/men/men-page";

export const metadata: Metadata = {
  title: "Men's Fragrances",
  description:
    "Discover woody, amber, fresh and distinctive men's fragrances from Élan Parfums.",
};

export default function Page() {
  return <MenPage />;
}