import type { Metadata } from "next";
import { AdminCreateProductPage } from "@/components/admin/products/create-product-page";

export const metadata: Metadata = {
  title: "Create Product | Admin",
  description: "Add a new fragrance to the Élan Parfums catalogue.",
};

export default function CreateProductPage() {
  return <AdminCreateProductPage />;
}