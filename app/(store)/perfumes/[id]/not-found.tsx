import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-lg text-center">
        <p className="mb-3 text-sm uppercase tracking-[0.25em] text-foreground-muted">
          404
        </p>

        <h1 className="font-display text-5xl md:text-6xl">
          This page slipped away.
        </h1>

        <p className="mt-5 text-foreground-soft">
          The page you&apos;re looking for doesn&apos;t exist or may have been
          moved.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Go home
          </Link>

          <Link
            href="/shop"
            className="rounded-full border border-border px-6 py-3 text-sm font-medium transition-colors hover:bg-background-soft"
          >
            Explore fragrances
          </Link>
        </div>
      </div>
    </main>
  );
}