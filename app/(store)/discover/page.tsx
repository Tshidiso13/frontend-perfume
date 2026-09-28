import type { Metadata } from "next";
import { ScentFinder } from "@/components/discover/scent-finder";

export const metadata: Metadata = {
  title: "Find Your Scent",
  description:
    "Answer a few simple questions and discover fragrances that feel like you.",
};

export default function DiscoverPage() {
  return <ScentFinder />;
}