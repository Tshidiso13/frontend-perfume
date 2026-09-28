import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  link?: {
    label: string;
    href: string;
  };
  centered?: boolean;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  link,
  centered = false,
}: SectionHeadingProps) {
  return (
    <div
      className={`mb-10 flex flex-col gap-6 md:mb-14 ${
        centered
          ? "items-center text-center"
          : "md:flex-row md:items-end md:justify-between"
      }`}
    >
      <div className={centered ? "max-w-2xl" : "max-w-2xl"}>
        {eyebrow && (
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-foreground-muted">
            {eyebrow}
          </p>
        )}

        <h2 className="font-display text-4xl leading-[0.95] sm:text-5xl lg:text-6xl">
          {title}
        </h2>

        {description && (
          <p className="mt-4 max-w-xl text-sm leading-7 text-foreground-soft sm:text-base">
            {description}
          </p>
        )}
      </div>

      {link && (
        <Link
          href={link.href}
          className="group inline-flex w-fit items-center gap-2 text-sm font-medium"
        >
          {link.label}

          <ArrowUpRight
            className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            strokeWidth={1.5}
          />
        </Link>
      )}
    </div>
  );
}