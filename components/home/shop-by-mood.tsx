import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "./section-heading";

const moods = [
  {
    title: "Fresh & Clean",
    description:
      "Bright citrus, crisp greens and airy notes that feel effortless.",
    href: "/shop?mood=fresh-clean",
    number: "01",
    background:
      "bg-[linear-gradient(145deg,#dfe9e5_0%,#cbd9d4_45%,#aec1bb_100%)]",
    dark: false,
  },
  {
    title: "Warm & Seductive",
    description:
      "Vanilla, amber and soft spice for evenings that last a little longer.",
    href: "/shop?mood=warm-seductive",
    number: "02",
    background:
      "bg-[linear-gradient(145deg,#ecd9c8_0%,#cda887_50%,#9b7054_100%)]",
    dark: false,
  },
  {
    title: "Dark & Mysterious",
    description:
      "Oud, leather, smoke and deep woods with a confident presence.",
    href: "/shop?mood=dark-mysterious",
    number: "03",
    background:
      "bg-[linear-gradient(145deg,#59524c_0%,#282522_55%,#171513_100%)]",
    dark: true,
  },
  {
    title: "Soft & Romantic",
    description:
      "Delicate florals, soft musk and creamy notes with a dreamy feel.",
    href: "/shop?mood=soft-romantic",
    number: "04",
    background:
      "bg-[linear-gradient(145deg,#f1e2e3_0%,#dfc2c4_50%,#c69ea3_100%)]",
    dark: false,
  },
];

export function ShopByMood() {
  return (
    <section className="section-spacing">
      <div className="container-main">
        <SectionHeading
          eyebrow="Start with a feeling"
          title="What are you in the mood for?"
          description="You don’t need to know perfume terminology. Start with the kind of feeling you want your fragrance to leave behind."
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {moods.map((mood) => (
            <Link
              key={mood.title}
              href={mood.href}
              className={`group relative min-h-[390px] overflow-hidden rounded-[2rem] p-7 ${mood.background}`}
            >
              <div
                className={`relative z-10 flex h-full flex-col justify-between ${
                  mood.dark ? "text-white" : "text-foreground"
                }`}
              >
                <div className="flex items-start justify-between">
                  <span
                    className={`text-[10px] font-medium tracking-[0.22em] ${
                      mood.dark
                        ? "text-white/50"
                        : "text-foreground/50"
                    }`}
                  >
                    {mood.number}
                  </span>

                  <span
                    className={`flex size-10 items-center justify-center rounded-full border transition-all duration-300 group-hover:rotate-45 ${
                      mood.dark
                        ? "border-white/20 bg-white/5"
                        : "border-foreground/15 bg-white/10"
                    }`}
                  >
                    <ArrowUpRight
                      className="size-4"
                      strokeWidth={1.5}
                    />
                  </span>
                </div>

                <div>
                  <p
                    className={`mb-3 text-[9px] font-semibold uppercase tracking-[0.25em] ${
                      mood.dark
                        ? "text-white/45"
                        : "text-foreground-muted"
                    }`}
                  >
                    Shop by mood
                  </p>

                  <h3
                    className={`font-display text-4xl leading-none ${
                      mood.dark ? "text-white" : "text-foreground"
                    }`}
                  >
                    {mood.title}
                  </h3>

                  <p
                    className={`mt-4 max-w-[260px] text-sm leading-6 ${
                      mood.dark
                        ? "text-white/65"
                        : "text-foreground-soft"
                    }`}
                  >
                    {mood.description}
                  </p>

                  <div
                    className={`mt-6 h-px w-10 transition-all duration-500 group-hover:w-20 ${
                      mood.dark
                        ? "bg-white/50"
                        : "bg-foreground/40"
                    }`}
                  />
                </div>
              </div>

              <div className="absolute -bottom-16 -right-16 size-56 rounded-full border border-white/20 transition-transform duration-700 group-hover:scale-125" />

              <div className="absolute -bottom-6 -right-6 size-32 rounded-full border border-white/20" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}