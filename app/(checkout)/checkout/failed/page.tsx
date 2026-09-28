import Link from "next/link";

import {
  ArrowLeft,
  CreditCard,
  ShoppingBag,
  XCircle,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type FailedPageProps = {
  searchParams:
    Promise<{
      order?: string;
      reason?: string;
    }>;
};

/* =========================================================
   PAGE
========================================================= */

export default async function CheckoutFailedPage({
  searchParams,
}: FailedPageProps) {
  const params =
    await searchParams;

  const orderNumber =
    params.order?.trim() ||
    null;

  const reason =
    params.reason
      ?.trim()
      .toLowerCase();

  const cancelled =
    reason ===
      "cancelled" ||
    reason ===
      "canceled";

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
                <XCircle
                  className="h-8 w-8 text-[#6b2230]"
                  strokeWidth={1.6}
                />
              </div>

              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#6b2230]/60">
                {cancelled
                  ? "Payment cancelled"
                  : "Payment unsuccessful"}
              </p>

              <h1 className="max-w-2xl font-serif text-4xl leading-[1.05] tracking-[-0.03em] sm:text-5xl lg:text-6xl">
                {cancelled
                  ? "Your payment was cancelled."
                  : "Your payment could not be completed."}
              </h1>

              <p className="mt-6 max-w-xl text-sm leading-7 text-[#35101c]/65 sm:text-base">
                {cancelled
                  ? "No payment confirmation was received. You can return to checkout and try again when you’re ready."
                  : "We did not receive a successful payment confirmation. You can return to checkout and try PayFast again or choose another available payment method."}
              </p>

              {orderNumber ? (
                <div className="mt-8 rounded-2xl border border-[#35101c]/10 bg-[#fbfaf7] px-5 py-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#35101c]/45">
                    Order reference
                  </p>

                  <p className="mt-2 break-all font-serif text-2xl tracking-[-0.02em] text-[#35101c]">
                    {orderNumber}
                  </p>
                </div>
              ) : null}

              <div className="mt-8 rounded-2xl border border-[#35101c]/10 p-5">
                <div className="flex gap-4">
                  <CreditCard
                    className="mt-0.5 h-5 w-5 shrink-0 text-[#6b2230]"
                    strokeWidth={1.7}
                  />

                  <div>
                    <p className="text-sm font-semibold">
                      Your cart can still be used
                    </p>

                    <p className="mt-1 text-sm leading-6 text-[#35101c]/60">
                      Return to checkout to review your delivery details and payment method before trying again.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-2">
                <Link
                  href="/checkout"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#35101c] px-6 text-xs font-semibold uppercase tracking-[0.17em] text-white transition hover:bg-[#541627]"
                >
                  <ArrowLeft
                    className="h-4 w-4"
                    strokeWidth={1.8}
                  />

                  Return to checkout
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
                If money appears to have left your account but this page was shown, avoid repeatedly paying. Check your order status or contact support with the order reference above.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
