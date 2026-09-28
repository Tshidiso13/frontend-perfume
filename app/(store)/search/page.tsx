import type { Metadata } from "next";
import { SearchPage } from "@/components/search/search-page";

export const metadata: Metadata = {
  title: "Search Fragrances",
  description:
    "Search Élan fragrances by name, note, fragrance family or mood.",
};

export default function Page() {
  return <SearchPage />;
}