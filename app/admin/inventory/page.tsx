import type { Metadata } from "next";
import { AdminInventoryPage } from "@/components/admin/inventory/inventory-page";

export const metadata: Metadata = {
  title: "Inventory | Admin",
  description:
    "Manage Élan Parfums product inventory and stock levels.",
};

export default function InventoryPage() {
  return <AdminInventoryPage />;
}