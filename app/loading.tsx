export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />

        <p className="mt-4 text-sm text-foreground-muted">
          Loading your fragrance experience...
        </p>
      </div>
    </main>
  );
}