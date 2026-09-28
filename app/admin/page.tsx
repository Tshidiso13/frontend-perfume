import type { Metadata } from "next";
import { AdminOverviewDashboard } from "@/components/admin/dashboard/dashboard-page";

export const metadata: Metadata = {
  title: "Admin Overview",
  description: "Maison Sillage back office overview dashboard.",
};

export default function AdminPage() {
  return <AdminOverviewDashboard />;
}