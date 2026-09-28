import type { Metadata } from "next";
import { AdminProductsPage } from "@/components/admin/products/products-page";

export const metadata: Metadata = {
  title: "Products | Admin",
};

export default function ProductsPage() {
  return <AdminProductsPage />;
}