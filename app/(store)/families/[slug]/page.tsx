import type {
  Metadata,
} from "next";

import {
  FamiliesPage,
} from "@/components/families/families-page";

export const metadata: Metadata = {
  title:
    "Fragrance Families | ÉLAN Parfums",

  description:
    "Explore ÉLAN fragrances by fragrance family.",
};

export default async function Page({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}) {
  const {
    slug,
  } =
    await params;

  return (
    <FamiliesPage
      slug={slug}
    />
  );
}
