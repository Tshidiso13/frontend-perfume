import type { Metadata } from "next";
import { NewArrivalsPage } from "@/components/new-arrivals/new-arrivals-page";

export const metadata: Metadata = {
  title: "New Arrivals",
  description:
    "Discover the newest fragrances to arrive at Élan Parfums.",
};

export default function Page() {
  return <NewArrivalsPage />;
}