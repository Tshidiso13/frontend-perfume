"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  LoaderCircle,
  Mail,
  RefreshCcw,
  ShieldAlert,
} from "lucide-react";

import { toast } from "sonner";

import { authService } from "@/services/auth.service";

type VerificationState =
  | "idle"
  | "verifying"
  | "success"
  | "error";

export function VerifyEmailForm({
  token,
}: {
  token: string;
}) {
  const router = useRouter();

  const verificationStarted =
    useRef(false);

  const [status, setStatus] =
    useState<VerificationState>("idle");

  const [message, setMessage] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [resending, setResending] =
    useState(false);

  const validToken =
    Boolean(token) &&
    token.length >= 20;

  useEffect(() => {
    if (
      !validToken ||
      verificationStarted.current
    ) {
      return;
    }

    verificationStarted.current = true;

    async function verify() {
      setStatus("verifying");

      try {
        const response =
          await authService.verifyEmail(
            token
          );

        setMessage(
          response.message ||
            "Your email has been verified."
        );

        setStatus("success");

        toast.success(
          "Email verified successfully."
        );
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "This verification link could not be used."
        );

        setStatus("error");
      }
    }

    verify();
  }, [token, validToken]);

  async function resendVerification() {
    const cleanEmail = email
      .trim()
      .toLowerCase();

    if (!cleanEmail) {
      toast.error(
        "Enter your email address."
      );

      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        cleanEmail
      )
    ) {
      toast.error(
        "Enter a valid email address."
      );

      return;
    }

    setResending(true);

    const toastId = toast.loading(
      "Sending a new verification email..."
    );

    try {
      const response =
        await authService.resendVerificationEmail(
          cleanEmail
        );

      toast.success(
        response.message ||
          "Verification email sent.",
        {
          id: toastId,
        }
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to send verification email.",
        {
          id: toastId,
        }
      );
    } finally {
      setResending(false);
    }
  }

  /* =======================================================
     INVALID / MISSING TOKEN
  ======================================================== */

  if (!validToken) {
    return (
      <VerificationCard>
        <span className="flex size-11 items-center justify-center rounded-full bg-[#f1e5e4]">
          <ShieldAlert
            className="size-5 !text-[#95564f]"
            strokeWidth={1.4}
          />
        </span>

        <p className="mt-7 text-[8px] font-medium uppercase tracking-[0.22em] !text-[#9a756c]">
          Verification link
        </p>

        <h2 className="mt-3 font-display text-[31px] font-normal leading-none !text-[#382724]">
          This link isn&apos;t valid.
        </h2>

        <p className="mt-4 text-[9px] leading-6 !text-[#806e67]">
          The verification token is missing or
          incomplete. You can request another
          verification email below.
        </p>

        <ResendSection
          email={email}
          setEmail={setEmail}
          loading={resending}
          onResend={resendVerification}
        />

        <Link
          href="/login"
          className="group mt-6 inline-flex items-center gap-2 text-[9px] !text-[#6d5b55]"
        >
          <ArrowLeft
            className="size-3 transition-transform group-hover:-translate-x-1"
            strokeWidth={1.4}
          />

          Back to sign in
        </Link>
      </VerificationCard>
    );
  }

  /* =======================================================
     VERIFYING
  ======================================================== */

  if (
    status === "idle" ||
    status === "verifying"
  ) {
    return (
      <VerificationCard>
        <span className="flex size-11 items-center justify-center rounded-full bg-[#f0ebe5]">
          <LoaderCircle
            className="size-5 animate-spin !text-[#6c5148]"
            strokeWidth={1.4}
          />
        </span>

        <p className="mt-7 text-[8px] font-medium uppercase tracking-[0.22em] !text-[#9a756c]">
          Just a moment
        </p>

        <h2 className="mt-3 font-display text-[31px] font-normal leading-none !text-[#382724]">
          Verifying your email.
        </h2>

        <p className="mt-4 text-[9px] leading-6 !text-[#806e67]">
          We&apos;re checking your ÉLAN
          verification link. This should only
          take a moment.
        </p>
      </VerificationCard>
    );
  }

  /* =======================================================
     SUCCESS
  ======================================================== */

  if (status === "success") {
    return (
      <VerificationCard>
        <span className="flex size-11 items-center justify-center rounded-full bg-[#e8eee8]">
          <CheckCircle2
            className="size-5 !text-[#526357]"
            strokeWidth={1.5}
          />
        </span>

        <p className="mt-7 text-[8px] font-medium uppercase tracking-[0.22em] !text-[#78907e]">
          Email verified
        </p>

        <h2 className="mt-3 font-display text-[31px] font-normal leading-none !text-[#382724]">
          Welcome properly.
        </h2>

        <p className="mt-4 text-[9px] leading-6 !text-[#806e67]">
          {message ||
            "Your email address has been verified successfully."}
        </p>

        <button
          type="button"
          onClick={() => {
            router.replace("/account");
            router.refresh();
          }}
          className="group mt-7 flex min-h-[50px] w-full items-center justify-between bg-[#5a1425] px-5 text-[9px] font-medium !text-white transition-colors hover:bg-[#6b1b2f]"
        >
          Go to your account

          <ArrowRight
            className="size-3.5 transition-transform group-hover:translate-x-1"
            strokeWidth={1.4}
          />
        </button>
      </VerificationCard>
    );
  }

  /* =======================================================
     FAILED / EXPIRED
  ======================================================== */

  return (
    <VerificationCard>
      <span className="flex size-11 items-center justify-center rounded-full bg-[#f1e5e4]">
        <ShieldAlert
          className="size-5 !text-[#95564f]"
          strokeWidth={1.4}
        />
      </span>

      <p className="mt-7 text-[8px] font-medium uppercase tracking-[0.22em] !text-[#9a756c]">
        Couldn&apos;t verify
      </p>

      <h2 className="mt-3 font-display text-[31px] font-normal leading-none !text-[#382724]">
        This link may have expired.
      </h2>

      <p className="mt-4 text-[9px] leading-6 !text-[#806e67]">
        {message ||
          "We couldn't verify your email address using this link."}
      </p>

      <p className="mt-3 text-[8px] leading-5 !text-[#9a8982]">
        Enter your email address and we&apos;ll
        send you a fresh verification link.
      </p>

      <ResendSection
        email={email}
        setEmail={setEmail}
        loading={resending}
        onResend={resendVerification}
      />

      <Link
        href="/login"
        className="group mt-6 inline-flex items-center gap-2 text-[9px] !text-[#6d5b55]"
      >
        <ArrowLeft
          className="size-3 transition-transform group-hover:-translate-x-1"
          strokeWidth={1.4}
        />

        Back to sign in
      </Link>
    </VerificationCard>
  );
}

/* =========================================================
   RESEND
========================================================= */

function ResendSection({
  email,
  setEmail,
  loading,
  onResend,
}: {
  email: string;
  setEmail: (value: string) => void;
  loading: boolean;
  onResend: () => void;
}) {
  return (
    <div className="mt-7 border-t border-[#e5ddd3] pt-6">
      <label
        htmlFor="verification-email"
        className="block"
      >
        <span className="mb-2 block text-[8px] uppercase tracking-[0.14em] !text-[#806e67]">
          Email address
        </span>

        <div className="relative">
          <Mail
            className="pointer-events-none absolute left-4 top-1/2 size-3.5 -translate-y-1/2 !text-[#927970]"
            strokeWidth={1.4}
          />

          <input
            id="verification-email"
            name="verification-email"
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            maxLength={160}
            disabled={loading}
            autoComplete="email"
            placeholder="you@example.com"
            className="h-[52px] w-full border border-[#d8d0ca] bg-transparent pl-11 pr-4 text-[10px] !text-[#382b28] outline-none placeholder:!text-[#aaa09b] focus:border-[#7e4c55] disabled:opacity-60"
          />
        </div>
      </label>

      <button
        type="button"
        onClick={onResend}
        disabled={loading}
        className="group mt-3 flex min-h-[48px] w-full items-center justify-between border border-[#d8d0ca] px-5 text-[9px] font-medium !text-[#594741] transition-colors hover:bg-[#f3eee9] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading
          ? "Sending..."
          : "Send a new verification link"}

        {loading ? (
          <LoaderCircle
            className="size-3.5 animate-spin"
            strokeWidth={1.4}
          />
        ) : (
          <RefreshCcw
            className="size-3.5 transition-transform duration-500 group-hover:rotate-180"
            strokeWidth={1.4}
          />
        )}
      </button>
    </div>
  );
}

/* =========================================================
   CARD
========================================================= */

function VerificationCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="border border-[#e5ddd3] bg-[#fbfaf7] p-6 sm:p-7">
      {children}
    </div>
  );
}