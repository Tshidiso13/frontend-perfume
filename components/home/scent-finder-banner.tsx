import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function ScentFinderBanner() {
  return (
    <section className="section-spacing">
      <div className="container-main">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#1b1917] px-6 py-14 text-white sm:px-10 md:rounded-[2.5rem] md:px-16 md:py-20 lg:px-20">
          <div className="absolute -right-28 -top-28 size-[400px] rounded-full bg-[#8a694d]/30 blur-[90px]" />

          <div className="absolute -bottom-40 left-[35%] size-[400px] rounded-full bg-[#9f8c70]/20 blur-[100px]" />

          <div className="relative z-10 grid items-center gap-12 lg:grid-cols-[1fr_0.7fr]">
            <div>
              <div className="mb-5 flex items-center gap-2">
                <Sparkles
                  className="size-4 text-[#c8a978]"
                  strokeWidth={1.5}
                />

                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/50">
                  Not sure where to start?
                </p>
              </div>

              <h2 className="font-display max-w-3xl text-5xl leading-[0.95] text-white sm:text-6xl lg:text-7xl">
                Tell us how you want to feel.
                <span className="block italic text-white/55">
                  We&apos;ll handle the perfume part.
                </span>
              </h2>

              <p className="mt-6 max-w-xl text-sm leading-7 text-white/60 sm:text-base">
                Answer a few simple questions about your taste, personality,
                occasion and budget. We&apos;ll narrow the collection down to
                fragrances that actually make sense for you.
              </p>

              <Link
                href="/scent-finder"
                className="group mt-8 inline-flex min-h-12 items-center gap-3 rounded-full bg-white px-6 text-sm font-medium text-black"
              >
                Find my scent

                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-1"
                  strokeWidth={1.5}
                />
              </Link>
            </div>

            <div className="hidden lg:block">
              <div className="ml-auto max-w-[340px] space-y-3">
                {[
                  "Where would you wear it?",
                  "What smells pull you in?",
                  "How strong should it feel?",
                  "What mood fits you?",
                ].map((question, index) => (
                  <div
                    key={question}
                    className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4 backdrop-blur"
                  >
                    <span className="font-display text-xl text-[#c8a978]">
                      0{index + 1}
                    </span>

                    <span className="text-sm text-white/70">
                      {question}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}