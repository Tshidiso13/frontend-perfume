import Link from "next/link";
import type { ReactNode } from "react";

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#fbfaf7]">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Brand side */}

        <section className="hidden bg-[#35101c] p-10 lg:flex lg:flex-col lg:justify-between xl:p-14">
          <Link
            href="/"
            className="w-fit"
          >
            <p className="font-display text-[25px] tracking-[0.12em] !text-white">
              ÉLAN PARFUMS
            </p>

            <p className="mt-1 text-[8px] uppercase tracking-[0.2em] !text-white/45">
              Scents worth remembering
            </p>
          </Link>

          <div className="max-w-lg">
            <p className="text-[8px] uppercase tracking-[0.25em] !text-[#d5afb6]">
              Your Élan
            </p>

            <h2 className="mt-5 font-display text-[54px] font-normal leading-[0.95] tracking-[-0.04em] !text-[#f7ede7] xl:text-[68px]">
              A fragrance should feel personal.
            </h2>

            <p className="mt-6 max-w-md text-[10px] leading-6 !text-white/50">
              Sign in to follow your orders,
              save the fragrances that stay with
              you and make your next visit feel
              familiar.
            </p>
          </div>

          <p className="text-[8px] uppercase tracking-[0.16em] !text-white/30">
            Élan Parfums · South Africa
          </p>
        </section>

        {/* Form side */}

        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-[470px]">
            <Link
              href="/"
              className="mb-12 inline-block lg:hidden"
            >
              <p className="font-display text-[22px] tracking-[0.12em] !text-[#35101c]">
                ÉLAN PARFUMS
              </p>
            </Link>

            <p className="text-[8px] font-medium uppercase tracking-[0.25em] !text-[#9a756c]">
              {eyebrow}
            </p>

            <h1 className="mt-4 font-display text-[46px] font-normal leading-none tracking-[-0.04em] !text-[#342725] sm:text-[54px]">
              {title}
            </h1>

            <p className="mt-4 max-w-md text-[10px] leading-6 !text-[#81706a]">
              {description}
            </p>

            <div className="mt-8">
              {children}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}