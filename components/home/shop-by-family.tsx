import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "./section-heading";

const fragranceFamilies = [
  {
    name: "Woody",
    description:
      "Warm woods, sandalwood, cedar and earthy notes with quiet confidence.",
    href: "/fragrance-families/woody",
    number: "01",
    background:
      "bg-[linear-gradient(145deg,#d6c4aa_0%,#a68b68_45%,#6f5842_100%)]",
    textClass: "text-white",
  },
  {
    name: "Fresh",
    description:
      "Clean citrus, airy greens and crisp notes that feel effortless.",
    href: "/fragrance-families/fresh",
    number: "02",
    background:
      "bg-[linear-gradient(145deg,#dfece8_0%,#b8d0c9_45%,#88aaa1_100%)]",
    textClass: "text-foreground",
  },
  {
    name: "Floral",
    description:
      "Rose, jasmine and soft petals without feeling old-fashioned.",
    href: "/fragrance-families/floral",
    number: "03",
    background:
      "bg-[linear-gradient(145deg,#f2e4e7_0%,#d9bcc4_45%,#bb929e_100%)]",
    textClass: "text-foreground",
  },
  {
    name: "Amber",
    description:
      "Rich warmth built around vanilla, resin, spice and glowing sweetness.",
    href: "/fragrance-families/amber",
    number: "04",
    background:
      "bg-[linear-gradient(145deg,#e4c49d_0%,#b9834d_50%,#765033_100%)]",
    textClass: "text-white",
  },
  {
    name: "Gourmand",
    description:
      "Vanilla, caramel, coffee and edible sweetness made sophisticated.",
    href: "/fragrance-families/gourmand",
    number: "05",
    background:
      "bg-[linear-gradient(145deg,#ead8ca_0%,#c79e82_50%,#8c644e_100%)]",
    textClass: "text-foreground",
  },
  {
    name: "Leather",
    description:
      "Dark, smoky and polished with a bold character that stays memorable.",
    href: "/fragrance-families/leather",
    number: "06",
    background:
      "bg-[linear-gradient(145deg,#625750_0%,#342e2a_55%,#1d1a18_100%)]",
    textClass: "text-white",
  },
];

export function SectionByFamily() {
  return (
    <section className="section-spacing bg-background">
      <div className="container-main">
        <SectionHeading
          eyebrow="Explore your taste"
          title="Shop by fragrance family."
          description="Fragrance families are simply groups of scents that share a similar character. Start with one that sounds like you."
          link={{
            label: "Explore all families",
            href: "/fragrance-families",
          }}
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {fragranceFamilies.map((family) => (
            <Link
              key={family.name}
              href={family.href}
              className={`group relative min-h-[320px] overflow-hidden rounded-[2rem] p-7 sm:min-h-[360px] ${family.background}`}
            >
              {/* Decorative circles */}
              <div className="absolute -right-20 -top-20 size-56 rounded-full border border-white/20 transition-transform duration-700 group-hover:scale-125" />

              <div className="absolute -bottom-16 -left-14 size-44 rounded-full border border-white/15" />

              <div
                className={`relative z-10 flex h-full flex-col justify-between ${family.textClass}`}
              >
                {/* Top */}
                <div className="flex items-start justify-between">
                  <span
                    className={`text-[10px] font-medium tracking-[0.22em] ${
                      family.textClass === "text-white"
                        ? "text-white/55"
                        : "text-foreground/50"
                    }`}
                  >
                    {family.number}
                  </span>

                  <span
                    className={`flex size-10 items-center justify-center rounded-full border transition-all duration-300 group-hover:rotate-45 ${
                      family.textClass === "text-white"
                        ? "border-white/25 bg-white/5"
                        : "border-foreground/15 bg-white/10"
                    }`}
                  >
                    <ArrowUpRight
                      className="size-4"
                      strokeWidth={1.5}
                    />
                  </span>
                </div>

                {/* Bottom */}
                <div>
                  <p
                    className={`mb-3 text-[9px] font-semibold uppercase tracking-[0.25em] ${
                      family.textClass === "text-white"
                        ? "text-white/50"
                        : "text-foreground-muted"
                    }`}
                  >
                    Fragrance family
                  </p>

                  <h3
                    className={`font-display text-4xl sm:text-5xl ${
                      family.textClass === "text-white"
                        ? "text-white"
                        : "text-foreground"
                    }`}
                  >
                    {family.name}
                  </h3>

                  <p
                    className={`mt-4 max-w-[290px] text-sm leading-6 ${
                      family.textClass === "text-white"
                        ? "text-white/65"
                        : "text-foreground-soft"
                    }`}
                  >
                    {family.description}
                  </p>

                  <div
                    className={`mt-6 h-px w-10 transition-all duration-500 group-hover:w-20 ${
                      family.textClass === "text-white"
                        ? "bg-white/50"
                        : "bg-foreground/40"
                    }`}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}