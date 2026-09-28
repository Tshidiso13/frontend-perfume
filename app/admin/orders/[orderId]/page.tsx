import type {
  Metadata,
} from "next";

import {
  AdminOrderDetails,
} from "@/components/admin/orders/admin-order-details";

export const metadata: Metadata = {
  title:
    "Order | ÉLAN Admin",

  description:
    "Manage order fulfilment, payment and shipment information.",
};

type PageProps = {
  params: Promise<{
    orderId: string;
  }>;
};

export default async function AdminOrderPage({
  params,
}: PageProps) {
  const {
    orderId,
  } =
    await params;

  return (
    <AdminOrderDetails
      orderId={
        orderId
      }
    />
  );
}
