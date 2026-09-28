import Link from "next/link";

import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type SuccessPageProps = {
  searchParams:
    Promise<{
      order?: string;
      method?: string;
    }>;
};

/* =========================================================
   PAGE
========================================================= */

export default async function CheckoutSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const params =
    await searchParams;

  const orderNumber =
    params.order?.trim() ||
    null;

  const paymentMethod =
    params.method
      ?.trim()
      .toLowerCase();

  const isPayfast =
    paymentMethod ===
    "payfast";

  const isCod =
    paymentMethod ===
      "cod" ||
    paymentMethod ===
      "cash_on_delivery";

  return (
    <main className="min-h-screen bg-[#fbfaf7] text-[#35101c]">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-5 py-16 sm:px-8 lg:px-12">
        <div className="w-full max-w-3xl">
          <div className="overflow-hidden rounded-[2rem] border border-[#35101c]/10 bg-white shadow-[0_24px_80px_rgba(53,16,28,0.08)]">
            <div className="border-b border-[#35101c]/10 bg-[#f5efe8] px-6 py-4 sm:px-10">
              <p className="text-[10px] font-medium uppercase tracking-[0.34em] text-[#6b2230]/70">
                ÉLAN Parfums
              </p>
            </div>

            <div className="px-6 py-10 sm:px-10 sm:py-14 lg:px-14">
              <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-[#6b2230]/10">
                {isPayfast ? (
                  <Clock3
                    className="h-8 w-8 text-[#6b2230]"
                    strokeWidth={1.6}
                  />
                ) : (
                  <CheckCircle2
                    className="h-8 w-8 text-[#6b2230]"
                    strokeWidth={1.6}
                  />
                )}
              </div>

              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#6b2230]/60">
                {isPayfast
                  ? "Payment submitted"
                  : "Order confirmed"}
              </p>

              <h1 className="max-w-2xl font-serif text-4xl leading-[1.05] tracking-[-0.03em] sm:text-5xl lg:text-6xl">
                {isPayfast
                  ? "We’re verifying your payment."
                  : "Thank you for your order."}
              </h1>

              <p className="mt-6 max-w-xl text-sm leading-7 text-[#35101c]/65 sm:text-base">
                {isPayfast
                  ? "Your PayFast payment has been submitted. ÉLAN will confirm the payment securely from PayFast before your order moves into processing."
                  : isCod
                    ? "Your Cash on Delivery order has been placed successfully. We’ll keep you updated as it moves through preparation and delivery."
                    : "Your order has been received. We’ll send updates as it moves through preparation and delivery."}
              </p>

              {orderNumber ? (
                <div className="mt-8 rounded-2xl border border-[#35101c]/10 bg-[#fbfaf7] px-5 py-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#35101c]/45">
                    Order number
                  </p>

                  <p className="mt-2 break-all font-serif text-2xl tracking-[-0.02em] text-[#35101c]">
                    {orderNumber}
                  </p>
                </div>
              ) : null}

              {isPayfast ? (
                <div className="mt-8 flex gap-4 rounded-2xl border border-[#6b2230]/10 bg-[#6b2230]/[0.035] p-5">
                  <ShieldCheck
                    className="mt-0.5 h-5 w-5 shrink-0 text-[#6b2230]"
                    strokeWidth={1.7}
                  />

                  <div>
                    <p className="text-sm font-semibold">
                      Secure payment verification
                    </p>

                    <p className="mt-1 text-sm leading-6 text-[#35101c]/60">
                      Returning to this page does not mark an order as paid. The backend waits for PayFast’s verified payment notification before confirming payment.
                    </p>
                  </div>
                </div>
              ) : null}

              <div className="mt-10 grid gap-3 sm:grid-cols-2">
                <Link
                  href="/account/orders"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#35101c] px-6 text-xs font-semibold uppercase tracking-[0.17em] text-white transition hover:bg-[#541627]"
                >
                  View orders

                  <ArrowRight
                    className="h-4 w-4"
                    strokeWidth={1.8}
                  />
                </Link>

                <Link
                  href="/perfumes"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#35101c]/15 bg-transparent px-6 text-xs font-semibold uppercase tracking-[0.17em] text-[#35101c] transition hover:bg-[#35101c]/5"
                >
                  <ShoppingBag
                    className="h-4 w-4"
                    strokeWidth={1.7}
                  />

                  Continue shopping
                </Link>
              </div>

              <p className="mt-8 text-xs leading-6 text-[#35101c]/45">
                Checked out as a guest? Keep your order number safe. If you later create and verify an account using the same email address, eligible guest orders can be connected to your account.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
