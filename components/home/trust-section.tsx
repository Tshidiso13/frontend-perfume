import {
  BadgeCheck,
  PackageCheck,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";

const items = [
  {
    icon: BadgeCheck,
    title: "Authentic fragrances",
    description:
      "Products sourced with authenticity and quality at the centre.",
  },
  {
    icon: PackageCheck,
    title: "Carefully packed",
    description:
      "Your fragrance is packed securely before starting its journey.",
  },
  {
    icon: ShieldCheck,
    title: "Secure payments",
    description:
      "Checkout is protected and payment details are handled securely.",
  },
  {
    icon: RotateCcw,
    title: "Here if something's wrong",
    description:
      "Clear support for eligible returns, delivery issues and disputes.",
  },
];

export function TrustSection() {
  return (
    <section className="border-y border-border-soft bg-background-soft">
      <div className="container-main">
        <div className="grid divide-y divide-border-soft md:grid-cols-2 md:divide-x md:divide-y-0 xl:grid-cols-4">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="px-0 py-9 first:pl-0 md:px-8 xl:py-12"
              >
                <Icon
                  className="mb-5 size-5 text-accent"
                  strokeWidth={1.4}
                />

                <h3 className="font-display text-2xl">
                  {item.title}
                </h3>

                <p className="mt-2 max-w-xs text-sm leading-6 text-foreground-muted">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}