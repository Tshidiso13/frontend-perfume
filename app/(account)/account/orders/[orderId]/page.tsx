import type {
  Metadata,
} from "next";

import OrderDetailsPage from "@/components/account/order-details/order-details-page";

export const metadata: Metadata = {
  title:
    "Order Details | Élan Parfums",

  description:
    "View your Élan Parfums order details, payment status and delivery progress.",
};

type PageProps = {
  params: Promise<{
    orderId: string;
  }>;
};

export default async function Page({
  params,
}: PageProps) {
  const {
    orderId,
  } =
    await params;

  return (
    <OrderDetailsPage
      orderId={
        orderId
      }
    />
  );
}
