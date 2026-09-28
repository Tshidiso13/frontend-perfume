import Link from "next/link";
import { FaFacebookF, FaInstagram } from "react-icons/fa";
const shopLinks = [
  { label: "New arrivals", href: "/new-arrivals" },
  { label: "Best sellers", href: "/best-sellers" },
  { label: "Women", href: "/women" },
  { label: "Men", href: "/men" },
  { label: "Unisex", href: "/unisex" },
  { label: "Brands", href: "/brands" },
];

const discoverLinks = [
  { label: "Find my scent", href: "/scent-finder" },
  { label: "Collections", href: "/collections" },
  { label: "Fragrance families", href: "/fragrance-families" },
  { label: "Discover fragrances", href: "/discover" },
];

const helpLinks = [
  { label: "Contact us", href: "/contact" },
  { label: "FAQs", href: "/faq" },
  { label: "Delivery", href: "/shipping" },
  { label: "Returns", href: "/returns" },
  { label: "Track order", href: "/track-order" },
];

export function Footer() {
  return (
    <footer className="border-t border-border-soft bg-[#171512] text-white">
      {/* Newsletter */}

      <div className="border-b border-white/10">
        <div className="container-main grid gap-8 py-12 md:grid-cols-2 md:items-end lg:py-16">
          <div className="max-w-xl">
            <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.3em] text-white/50">
              Stay close
            </p>

            <h2 className="font-display text-4xl leading-none text-white md:text-5xl">
              A little fragrance in your inbox.
            </h2>

            <p className="mt-4 max-w-md text-sm leading-6 text-white/60">
              New arrivals, scent stories and thoughtful recommendations.
              Nothing excessive.
            </p>
          </div>

          <div className="md:justify-self-end">
            <div className="flex w-full max-w-md border-b border-white/30 md:min-w-[400px]">
              <input
                type="email"
                placeholder="Your email address"
                aria-label="Email address"
                className="min-w-0 flex-1 bg-transparent py-3 text-sm text-white outline-none placeholder:text-white/40"
              />

              <button
                type="button"
                className="shrink-0 px-2 text-xs font-semibold uppercase tracking-[0.18em] text-white transition-opacity hover:opacity-60"
              >
                Join
              </button>
            </div>

            <p className="mt-3 text-[11px] leading-5 text-white/40">
              By joining, you agree to receive occasional marketing emails.
            </p>
          </div>
        </div>
      </div>

      {/* Main footer */}

      <div className="container-main py-12 lg:py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}

          <div className="lg:col-span-2">
            <Link href="/" aria-label="Élan Parfums home">
              <span className="font-display text-3xl tracking-[0.08em] text-white">
                ÉLAN
              </span>

              <span className="ml-2 text-[8px] tracking-[0.3em] text-white/50">
                PARFUMS
              </span>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-7 text-white/55">
              Fragrance without the intimidation. Find something that feels
              like you — whether you know every perfume note or none at all.
            </p>

            <div className="mt-6 flex items-center gap-2">
  <a
    href="#"
    aria-label="Instagram"
    className="flex size-10 items-center justify-center rounded-full border border-white/15 transition-colors hover:bg-white hover:text-black"
  >
    <FaInstagram className="size-4" />
  </a>

  <a
    href="#"
    aria-label="Facebook"
    className="flex size-10 items-center justify-center rounded-full border border-white/15 transition-colors hover:bg-white hover:text-black"
  >
    <FaFacebookF className="size-4" />
  </a>
</div>
          </div>

          <FooterColumn title="Shop" links={shopLinks} />

          <FooterColumn title="Discover" links={discoverLinks} />

          <FooterColumn title="Help" links={helpLinks} />
        </div>
      </div>

      {/* Bottom */}

      <div className="border-t border-white/10">
        <div className="container-main flex flex-col gap-5 py-6 text-[11px] text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Élan Parfums. All rights reserved.
          </p>

          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link
              href="/privacy"
              className="transition-colors hover:text-white"
            >
              Privacy
            </Link>

            <Link
              href="/terms"
              className="transition-colors hover:text-white"
            >
              Terms
            </Link>

            <Link
              href="/shipping"
              className="transition-colors hover:text-white"
            >
              Shipping
            </Link>

            <Link
              href="/returns"
              className="transition-colors hover:text-white"
            >
              Returns
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

type FooterColumnProps = {
  title: string;
  links: {
    label: string;
    href: string;
  }[];
};

function FooterColumn({ title, links }: FooterColumnProps) {
  return (
    <div>
      <h3 className="font-sans text-[10px] font-semibold uppercase tracking-[0.25em] text-white/45">
        {title}
      </h3>

      <ul className="mt-5 space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-white/70 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}