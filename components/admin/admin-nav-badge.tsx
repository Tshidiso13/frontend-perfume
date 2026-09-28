"use client";

type AdminNavBadgeProps = {
  count:
    number;

  label:
    string;
};

export function AdminNavBadge({
  count,
  label,
}: AdminNavBadgeProps) {
  if (
    count <=
    0
  ) {
    return null;
  }

  return (
    <span
      aria-label={`${count} ${label}`}
      title={`${count} ${label}`}
      className="ml-auto flex min-h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full bg-[#f4e5e8] px-1.5 text-[8px] font-semibold leading-none !text-[#65182b]"
    >
      {
        count >
        99
          ? "99+"
          : count
      }
    </span>
  );
}
