import type {
  Metadata,
} from "next";

import {
  HelpPage,
} from "@/components/account/help/help-page";

export const metadata:
  Metadata = {
    title:
      "Need Help? | ÉLAN Parfums",

    description:
      "Contact ÉLAN Parfums customer care and follow your support conversations.",
  };

export default function HelpRoutePage() {
  return (
    <HelpPage />
  );
}
