import type {
  Metadata,
} from "next";

import {
  MoodPage,
} from"@/components/mood/mood-page";

export const metadata: Metadata = {
  title:
    "Shop by Mood | ÉLAN Parfums",
  description:
    "Discover ÉLAN fragrances by mood and feeling.",
};

export default function Page() {
  return <MoodPage />;
}
