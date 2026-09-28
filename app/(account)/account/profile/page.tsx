import type {
  Metadata,
} from "next";

import {
  ProfilePage,
} from "@/components/account/profile/profile-page";

export const metadata:
  Metadata = {
    title:
      "Profile | ÉLAN Parfums",

    description:
      "Manage the personal information connected to your ÉLAN Parfums account.",
  };

export default function Page() {
  return (
    <ProfilePage />
  );
}
