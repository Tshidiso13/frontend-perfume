"use client";

import { useState } from "react";
import Link from "next/link";

import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Database,
  Mail,
  RefreshCcw,
  Server,
  ShieldCheck,
  Truck,
  WalletCards,
  Workflow,
  XCircle,
} from "lucide-react";

import { toast } from "sonner";

type ServiceStatus =
  | "Operational"
  | "Not connected"
  | "Warning"
  | "Offline";

type SystemService = {
  id: string;
  name: string;
  description: string;
  status: ServiceStatus;
  detail: string;
  environment?: string;
  icon: React.ElementType;
};

const initialServices: SystemService[] = [
  {
    id: "frontend",
    name: "Storefront",
    description:
      "Next.js customer storefront and admin interface.",
    status: "Operational",
    detail: "Frontend running normally",
    environment: "Development",
    icon: Activity,
  },
  {
    id: "api",
    name: "NestJS API",
    description:
      "Authentication, products, orders, inventory and admin APIs.",
    status: "Not connected",
    detail: "Backend integration pending",
    environment: "Pending",
    icon: Server,
  },
  {
    id: "database",
    name: "Neon PostgreSQL",
    description:
      "Primary database managed through Prisma.",
    status: "Not connected",
    detail: "Database connection pending",
    environment: "Pending",
    icon: Database,
  },
  {
    id: "payfast",
    name: "PayFast",
    description:
      "Secure customer payments and payment callbacks.",
    status: "Not connected",
    detail: "Payment gateway not configured",
    environment: "Sandbox",
    icon: WalletCards,
  },
  {
    id: "inngest",
    name: "Inngest",
    description:
      "Background jobs for orders, notifications and workflows.",
    status: "Not connected",
    detail: "Background worker pending",
    environment: "Development",
    icon: Workflow,
  },
  {
    id: "smtp",
    name: "Email / SMTP",
    description:
      "Transactional mail for orders, accounts and notifications.",
    status: "Not connected",
    detail: "SMTP credentials not configured",
    environment: "Pending",
    icon: Mail,
  },
  {
    id: "aramex",
    name: "Aramex",
    description:
      "Door-to-door shipping and tracking integration.",
    status: "Not connected",
    detail: "Shipping API integration pending",
    environment: "Pending",
    icon: Truck,
  },
  {
    id: "paxi",
    name: "PAXI",
    description:
      "Collection-point delivery and tracking.",
    status: "Not connected",
    detail: "PAXI integration pending",
    environment: "Pending",
    icon: Truck,
  },
];

export function AdminSystemPage() {
  const [services, setServices] =
    useState<SystemService[]>(initialServices);

  const [checking, setChecking] = useState(false);
  const [lastChecked, setLastChecked] =
    useState("Not checked yet");

  const operational = services.filter(
    (service) => service.status === "Operational"
  ).length;

  const warnings = services.filter(
    (service) => service.status === "Warning"
  ).length;

  const unavailable = services.filter(
    (service) =>
      service.status === "Offline" ||
      service.status === "Not connected"
  ).length;

  async function runHealthCheck() {
    setChecking(true);

    const toastId = toast.loading(
      "Checking system services..."
    );

    try {
      /*
       * Frontend-only simulation for now.
       *
       * Later this should call something like:
       *
       * GET /admin/system/health
       *
       * NestJS can then check:
       * - PostgreSQL
       * - PayFast config
       * - SMTP connection
       * - Inngest
       * - Aramex
       * - PAXI
       */

      await new Promise((resolve) =>
        setTimeout(resolve, 900)
      );

      setServices((current) =>
        current.map((service) => {
          if (service.id === "frontend") {
            return {
              ...service,
              status: "Operational",
              detail: "Frontend responding normally",
            };
          }

          return service;
        })
      );

      setLastChecked(
        new Intl.DateTimeFormat("en-ZA", {
          hour: "2-digit",
          minute: "2-digit",
          day: "2-digit",
          month: "short",
          year: "numeric",
        }).format(new Date())
      );

      toast.success("Health check complete", {
        id: toastId,
      });
    } catch {
      toast.error("Health check failed", {
        id: toastId,
      });
    } finally {
      setChecking(false);
    }
  }

  return (
    <section className="min-h-full bg-[#fbfaf7]">
      <div className="px-5 py-8 sm:px-8 lg:px-9 lg:py-10 xl:px-10">
        <div className="mx-auto max-w-[1500px]">
          {/* =====================================================
              HEADER
          ====================================================== */}

          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[9px] font-medium uppercase tracking-[0.28em] !text-[#9a7a70]">
                Élan Parfums / Back office
              </p>

              <h1 className="mt-4 font-display text-[46px] font-normal leading-none tracking-[-0.04em] !text-[#2e1e1d] sm:text-[54px] lg:text-[60px]">
                System
              </h1>

              <p className="mt-4 max-w-xl text-[11px] leading-5 !text-[#7f6f69] sm:text-[12px]">
                Keep an eye on the services behind
                your store, payments, orders,
                delivery and notifications.
              </p>
            </div>

            <button
              type="button"
              onClick={runHealthCheck}
              disabled={checking}
              className="
                group
                inline-flex
                min-h-[48px]
                w-fit
                items-center
                gap-8
                bg-[#5a1425]
                px-6
                text-[10px]
                font-medium
                !text-white

                transition-colors

                hover:bg-[#6b1b2f]

                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {checking
                ? "Checking..."
                : "Run health check"}

              <RefreshCcw
                className={`size-3.5 ${
                  checking ? "animate-spin" : ""
                }`}
                strokeWidth={1.4}
              />
            </button>
          </div>

          {/* =====================================================
              DEVELOPMENT NOTICE
          ====================================================== */}

          <div className="mt-8 flex items-start gap-4 border-l border-[#d0af82] bg-[#f3ece4] px-5 py-4">
            <CircleAlert
              className="mt-0.5 size-4 shrink-0 !text-[#9a7358]"
              strokeWidth={1.4}
            />

            <div>
              <p className="text-[9px] font-medium !text-[#6c5142]">
                Frontend system preview
              </p>

              <p className="mt-1 max-w-3xl text-[9px] leading-5 !text-[#8b7163]">
                Only the Next.js interface can be
                checked right now. Backend,
                database, payment, email and
                shipping statuses will become real
                once their NestJS integrations are
                connected.
              </p>
            </div>
          </div>

          {/* =====================================================
              STATS
          ====================================================== */}

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Services"
              value={services.length.toString()}
              helper="Configured system checks"
            />

            <StatCard
              label="Operational"
              value={operational.toString()}
              helper="Responding normally"
            />

            <StatCard
              label="Warnings"
              value={warnings.toString()}
              helper="Needs investigation"
            />

            <StatCard
              label="Unavailable"
              value={unavailable.toString()}
              helper="Offline or not connected"
            />
          </div>

          {/* =====================================================
              LAST CHECK
          ====================================================== */}

          <div className="mt-5 flex flex-col gap-3 border border-[#e5ddd3] bg-[#fbfaf7] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Clock3
                className="size-3.5 !text-[#92766d]"
                strokeWidth={1.4}
              />

              <p className="text-[9px] !text-[#7f6d66]">
                Last health check
              </p>
            </div>

            <p className="text-[9px] font-medium !text-[#473530]">
              {lastChecked}
            </p>
          </div>

          {/* =====================================================
              SERVICES
          ====================================================== */}

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
              />
            ))}
          </div>

          {/* =====================================================
              ENVIRONMENT
          ====================================================== */}

          <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.8fr]">
            <AdminPanel
              eyebrow="Environment"
              title="Runtime information."
            >
              <div>
                <InfoRow
                  label="Application"
                  value="Élan Parfums"
                />

                <InfoRow
                  label="Frontend"
                  value="Next.js 16.3.5"
                />

                <InfoRow
                  label="Rendering"
                  value="App Router"
                />

                <InfoRow
                  label="Bundler"
                  value="Turbopack"
                />

                <InfoRow
                  label="Environment"
                  value="Development"
                  last
                />
              </div>
            </AdminPanel>

            <AdminPanel
              eyebrow="Security"
              title="Protected by design."
            >
              <div className="flex items-start gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#e8eee8]">
                  <ShieldCheck
                    className="size-4 !text-[#526357]"
                    strokeWidth={1.4}
                  />
                </span>

                <div>
                  <p className="text-[10px] font-medium !text-[#46342f]">
                    Admin authentication
                  </p>

                  <p className="mt-2 text-[9px] leading-5 !text-[#89766f]">
                    Once authentication is connected,
                    all system information and
                    configuration endpoints should
                    require an administrator role.
                  </p>
                </div>
              </div>

              <div className="mt-6 border-t border-[#e5ddd3] pt-5">
                <p className="text-[8px] uppercase tracking-[0.14em] !text-[#9a857d]">
                  Important
                </p>

                <p className="mt-2 text-[9px] leading-5 !text-[#7d6962]">
                  Never expose database passwords,
                  API secrets, PayFast passphrases,
                  SMTP passwords or shipping API
                  credentials on this page.
                </p>
              </div>
            </AdminPanel>
          </div>

          {/* =====================================================
              BACKEND PLAN
          ====================================================== */}

          <section className="mt-5 border border-[#e5ddd3] bg-[#35101c] p-6 sm:p-8">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="text-[8px] font-medium uppercase tracking-[0.24em] !text-[#d4aeb3]">
                  Backend health API
                </p>

                <h2 className="mt-4 font-display text-[32px] font-normal leading-none !text-[#f8eee7] sm:text-[38px]">
                  One place to know what&apos;s
                  working.
                </h2>

                <p className="mt-4 max-w-2xl text-[9px] leading-5 !text-white/55">
                  Later the NestJS system module can
                  expose a protected health endpoint
                  that checks PostgreSQL, SMTP,
                  PayFast, Inngest, Aramex and PAXI
                  without exposing credentials to
                  the browser.
                </p>
              </div>

              <Link
                href="/admin"
                className="group inline-flex w-fit items-center gap-5 border-b border-white/50 pb-1 text-[9px] !text-white"
              >
                Back to overview

                <ArrowUpRight
                  className="size-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  strokeWidth={1.4}
                />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   SERVICE CARD
========================================================= */

function ServiceCard({
  service,
}: {
  service: SystemService;
}) {
  const Icon = service.icon;

  return (
    <article className="border border-[#e5ddd3] bg-[#fbfaf7] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-5">
        <span className="flex size-10 items-center justify-center border border-[#e0d7d1] bg-[#f5f0ea]">
          <Icon
            className="size-4 !text-[#765b53]"
            strokeWidth={1.4}
          />
        </span>

        <StatusBadge status={service.status} />
      </div>

      <h2 className="mt-6 font-display text-[24px] font-normal !text-[#382724]">
        {service.name}
      </h2>

      <p className="mt-2 min-h-[40px] text-[9px] leading-5 !text-[#8b7972]">
        {service.description}
      </p>

      <div className="mt-6 border-t border-[#e5ddd3] pt-4">
        <InfoRow
          label="Status"
          value={service.detail}
        />

        {service.environment && (
          <InfoRow
            label="Environment"
            value={service.environment}
            last
          />
        )}
      </div>
    </article>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
  status,
}: {
  status: ServiceStatus;
}) {
  const config: Record<
    ServiceStatus,
    {
      className: string;
      icon: React.ElementType;
    }
  > = {
    Operational: {
      className:
        "bg-[#e8eee8] !text-[#526357]",
      icon: CheckCircle2,
    },

    "Not connected": {
      className:
        "bg-[#eee9e4] !text-[#82726b]",
      icon: Clock3,
    },

    Warning: {
      className:
        "bg-[#f4e6df] !text-[#99604e]",
      icon: CircleAlert,
    },

    Offline: {
      className:
        "bg-[#f1e3e3] !text-[#9b4d4d]",
      icon: XCircle,
    },
  };

  const selected = config[status];
  const Icon = selected.icon;

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1.5
        px-2.5
        py-1.5
        text-[8px]
        font-medium
        uppercase
        tracking-[0.08em]

        ${selected.className}
      `}
    >
      <Icon
        className="size-2.5"
        strokeWidth={1.7}
      />

      {status}
    </span>
  );
}

/* =========================================================
   STAT
========================================================= */

function StatCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <article className="min-h-[145px] border border-[#e5ddd3] bg-[#fbfaf7] p-5">
      <p className="text-[9px] !text-[#8a7770]">
        {label}
      </p>

      <p className="mt-5 font-display text-[36px] leading-none tracking-[-0.03em] !text-[#2e1e1d]">
        {value}
      </p>

      <p className="mt-5 text-[9px] leading-5 !text-[#9a8a84]">
        {helper}
      </p>
    </article>
  );
}

/* =========================================================
   ADMIN PANEL
========================================================= */

function AdminPanel({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-[#e5ddd3] bg-[#fbfaf7] p-5 sm:p-7">
      <p className="text-[8px] font-medium uppercase tracking-[0.22em] !text-[#9a756c]">
        {eyebrow}
      </p>

      <h2 className="mt-3 font-display text-[27px] font-normal !text-[#382724]">
        {title}
      </h2>

      <div className="mt-6">
        {children}
      </div>
    </section>
  );
}

/* =========================================================
   INFO
========================================================= */

function InfoRow({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-start justify-between gap-5 py-3 ${
        !last
          ? "border-b border-[#e5ddd3]"
          : ""
      }`}
    >
      <span className="text-[8px] uppercase tracking-[0.13em] !text-[#9b8982]">
        {label}
      </span>

      <span className="max-w-[65%] break-words text-right text-[9px] font-medium !text-[#493732]">
        {value}
      </span>
    </div>
  );
}