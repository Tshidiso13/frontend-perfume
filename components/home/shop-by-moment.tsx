import Link from "next/link";
import { SectionHeading } from "./section-heading";

const moments = [
  {
    title: "First date",
    subtitle: "Memorable, not overwhelming.",
    href: "/shop?occasion=first-date",
  },
  {
    title: "Everyday",
    subtitle: "Easy to wear. Hard to get tired of.",
    href: "/shop?occasion=everyday",
  },
  {
    title: "Office",
    subtitle: "Clean confidence without filling the room.",
    href: "/shop?occasion=office",
  },
  {
    title: "Night out",
    subtitle: "A little louder. A little darker.",
    href: "/shop?occasion=night-out",
  },
  {
    title: "Wedding",
    subtitle: "Something worthy of remembering.",
    href: "/shop?occasion=wedding",
  },
  {
    title: "Summer",
    subtitle: "Bright, fresh and made for warm skin.",
    href: "/shop?occasion=summer",
  },
];

export function ShopByMoment() {
  return (
    <section className="section-spacing bg-[#eeeae2]">
      <div className="container-main">
        <SectionHeading
          eyebrow="Where are you going?"
          title="Shop by moment."
          description="Sometimes the easiest way to choose a fragrance is to start with where you'll wear it."
        />

        <div className="border-t border-foreground/15">
          {moments.map((moment, index) => (
            <Link
              key={moment.title}
              href={moment.href}
              className="group grid gap-3 border-b border-foreground/15 py-6 transition-all md:grid-cols-[80px_1fr_1fr_40px] md:items-center md:py-8"
            >
              <span className="hidden text-xs text-foreground-muted md:block">
                0{index + 1}
              </span>

              <h3 className="font-display text-3xl transition-transform duration-300 group-hover:translate-x-2 sm:text-4xl">
                {moment.title}
              </h3>

              <p className="text-sm text-foreground-muted">
                {moment.subtitle}
              </p>

              <span className="hidden text-right text-xl transition-transform group-hover:translate-x-1 md:block">
                →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}