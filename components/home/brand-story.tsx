import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function BrandStory() {
  return (
    <section className="section-spacing">
      <div className="container-main">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
          <div className="relative min-h-[500px] overflow-hidden rounded-[2rem] bg-[linear-gradient(145deg,#d9c6aa,#967957)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,.4),transparent_40%)]" />

            <div className="absolute left-1/2 top-1/2 h-[330px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-[110px_110px_45px_45px] border border-white/30 bg-white/10 backdrop-blur-md" />

            <p className="absolute bottom-8 left-8 max-w-[230px] font-display text-3xl italic text-white">
              Fragrance should feel personal before it feels technical.
            </p>
          </div>

          <div className="flex flex-col justify-center py-4 lg:py-12">
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.3em] text-foreground-muted">
              Why we&apos;re here
            </p>

            <h2 className="font-display text-5xl leading-[0.95] sm:text-6xl">
              Perfume doesn&apos;t need to be intimidating.
            </h2>

            <div className="mt-7 max-w-xl space-y-5 text-sm leading-7 text-foreground-soft sm:text-base">
              <p>
                You shouldn&apos;t need to understand every French fragrance
                term before buying something you love.
              </p>

              <p>
                We translate notes, families, strength and performance into
                language that actually helps you choose.
              </p>

              <p>
                Whether you&apos;re looking for your first proper fragrance or
                your twentieth bottle, the goal stays the same: find something
                that feels like you.
              </p>
            </div>

            <Link
              href="/about"
              className="group mt-8 inline-flex w-fit items-center gap-2 border-b border-foreground pb-1 text-sm font-medium"
            >
              Our story

              <ArrowUpRight
                className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                strokeWidth={1.5}
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}