import type { Metadata } from "next";

import { AdminProductDetailPage } from "@/components/admin/products/product-detail-page";

export const metadata: Metadata = {
  title: "Product | ÉLAN Parfums Admin",
};

type PageProps = {
  params: Promise<{
    productId: string;
  }>;
};

export default async function ProductPage({
  params,
}: PageProps) {
  const { productId } = await params;

  return (
    <AdminProductDetailPage
      productId={productId}
    />
  );
}