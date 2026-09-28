"use client";

import { useEffect } from "react";

type ErrorPageProps = {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
};

export default function ErrorPage({
  error,
  reset,
}: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="mb-3 text-sm uppercase tracking-[0.25em] text-foreground-muted">
          Something went wrong
        </p>

        <h1 className="font-display text-4xl md:text-5xl">
          We couldn&apos;t load this page.
        </h1>

        <p className="mt-5 text-foreground-soft">
          Something unexpected happened. Please try again.
        </p>

        <button
          type="button"
          onClick={reset}
          className="mt-8 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Try again
        </button>
      </div>
    </main>
  );
}