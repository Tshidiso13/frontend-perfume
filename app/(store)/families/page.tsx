import type {
  Metadata,
} from "next";

import {
  FamiliesIndexPage,
} from "@/components/families/families-index-page";

export const metadata: Metadata = {
  title:
    "Fragrance Families | ÉLAN Parfums",

  description:
    "Explore the fragrance families in the ÉLAN collection.",
};

export default function Page() {
  return (
    <FamiliesIndexPage />
  );
}
