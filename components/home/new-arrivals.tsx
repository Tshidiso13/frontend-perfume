import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "./section-heading";

const arrivals = [
  {
    brand: "Valentino",
    name: "Born in Roma Intense",
    price: "R 2,650",
    gradient: "from-[#e6c3ce] to-[#76505d]",
  },
  {
    brand: "Jean Paul Gaultier",
    name: "Le Male Elixir",
    price: "R 2,399",
    gradient: "from-[#d2b76c] to-[#6e5425]",
  },
  {
    brand: "Prada",
    name: "Paradoxe",
    price: "R 2,499",
    gradient: "from-[#eee4dd] to-[#c49c8c]",
  },
];

export function NewArrivals() {
  return (
    <section className="section-spacing bg-surface">
      <div className="container-main">
        <SectionHeading
          eyebrow="Just arrived"
          title="New on the shelf."
          link={{
            label: "See all new arrivals",
            href: "/new-arrivals",
          }}
        />

        <div className="grid gap-5 md:grid-cols-3">
          {arrivals.map((product) => (
            <Link
              key={product.name}
              href="/new-arrivals"
              className="group"
            >
              <div
                className={`relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-gradient-to-br ${product.gradient}`}
              >
                <div className="absolute left-1/2 top-1/2 w-[34%] -translate-x-1/2 -translate-y-1/2 transition-transform duration-700 group-hover:scale-105">
                  <div className="mx-auto h-10 w-2/5 rounded-t-lg bg-black/70" />

                  <div className="aspect-[0.75] rounded-[1.4rem_1.4rem_2rem_2rem] border border-white/30 bg-black/25 shadow-2xl backdrop-blur-md" />
                </div>

                <div className="absolute inset-x-6 bottom-6 flex items-end justify-between">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/70">
                      {product.brand}
                    </p>

                    <h3 className="mt-1 font-display text-3xl text-white">
                      {product.name}
                    </h3>

                    <p className="mt-2 text-sm text-white/70">
                      {product.price}
                    </p>
                  </div>

                  <span className="flex size-11 items-center justify-center rounded-full bg-white text-black transition-transform duration-300 group-hover:translate-x-1">
                    <ArrowRight className="size-4" strokeWidth={1.5} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}