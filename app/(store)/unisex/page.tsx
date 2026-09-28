import type { Metadata } from "next";
import { UnisexPage } from "@/components/unisex/unisex-page";

export const metadata: Metadata = {
  title: "Unisex Fragrances",
  description:
    "Discover versatile amber, woody, fresh and floral fragrances made to be worn by whoever loves them.",
};

export default function Page() {
  return <UnisexPage />;
}