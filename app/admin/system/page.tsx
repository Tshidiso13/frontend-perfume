import type { Metadata } from "next";
import { AdminSystemPage } from "@/components/admin/system/system-page";

export const metadata: Metadata = {
  title: "System | Admin",
  description:
    "Monitor Élan Parfums platform services and integrations.",
};

export default function SystemPage() {
  return <AdminSystemPage />;
}