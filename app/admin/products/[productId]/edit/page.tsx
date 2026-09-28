import type { Metadata } from "next";

import { AdminEditProductPage } from "@/components/admin/products/edit-product-page";

export const metadata: Metadata = {
  title: "Edit Product | ÉLAN Parfums Admin",
  description:
    "Edit fragrance information, variants, inventory and catalogue visibility.",
};

type PageProps = {
  params: Promise<{
    productId: string;
  }>;
};

export default async function EditProductPage({
  params,
}: PageProps) {
  const { productId } = await params;

  return (
    <AdminEditProductPage
      productId={productId}
    />
  );
}