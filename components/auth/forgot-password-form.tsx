"use client";

import { useState } from "react";
import type { FormEvent } from "react";

import Link from "next/link";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  LoaderCircle,
  Mail,
} from "lucide-react";

import { toast } from "sonner";

import { authService } from "@/services/auth.service";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] =
    useState(false);

  const [sent, setSent] =
    useState(false);

  const [submittedEmail, setSubmittedEmail] =
    useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const cleanEmail = email
      .trim()
      .toLowerCase();

    /*
     * Matches backend ForgotPasswordDto:
     *
     * email:
     * - valid email
     * - max 160 characters
     */

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

    if (cleanEmail.length > 160) {
      toast.error(
        "Your email address is too long."
      );

      return;
    }

    setLoading(true);

    const toastId = toast.loading(
      "Sending reset instructions..."
    );

    try {
      const response =
        await authService.forgotPassword(
          cleanEmail
        );

      setSubmittedEmail(cleanEmail);
      setSent(true);

      toast.success(
        response.message ||
          "Check your email for reset instructions.",
        {
          id: toastId,
        }
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to send reset instructions.",
        {
          id: toastId,
        }
      );
    } finally {
      setLoading(false);
    }
  }

  /* =======================================================
     SUCCESS STATE
  ======================================================== */

  if (sent) {
    return (
      <div className="border border-[#e5ddd3] bg-[#fbfaf7] p-6 sm:p-7">
        <span className="flex size-11 items-center justify-center rounded-full bg-[#e8eee8]">
          <CheckCircle2
            className="size-5 !text-[#526357]"
            strokeWidth={1.4}
          />
        </span>

        <p className="mt-7 text-[8px] font-medium uppercase tracking-[0.22em] !text-[#9a756c]">
          Reset requested
        </p>

        <h2 className="mt-3 font-display text-[30px] font-normal leading-none !text-[#382724]">
          Check your inbox.
        </h2>

        <p className="mt-4 text-[9px] leading-6 !text-[#806e67]">
          If an ÉLAN account exists for{" "}
          <strong className="font-medium !text-[#493732]">
            {submittedEmail}
          </strong>
          , we&apos;ve sent password reset
          instructions.
        </p>

        <p className="mt-3 text-[8px] leading-5 !text-[#9a8982]">
          The reset link expires after one hour.
          If you don&apos;t see the email, check
          your spam or junk folder.
        </p>

        <div className="mt-7 space-y-3">
          <Link
            href="/login"
            className="
              group
              flex
              min-h-[50px]
              w-full
              items-center
              justify-between
              bg-[#5a1425]
              px-5
              text-[9px]
              font-medium
              !text-white

              transition-colors

              hover:bg-[#6b1b2f]
            "
          >
            Back to sign in

            <ArrowRight
              className="size-3.5 transition-transform group-hover:translate-x-1"
              strokeWidth={1.4}
            />
          </Link>

          <button
            type="button"
            onClick={() => {
              setSent(false);
              setSubmittedEmail("");
            }}
            className="flex min-h-[46px] w-full items-center justify-center text-[8px] !text-[#75635d] transition-opacity hover:opacity-60"
          >
            Try another email
          </button>
        </div>
      </div>
    );
  }

  /* =======================================================
     FORM
  ======================================================== */

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
      noValidate
    >
      <div className="border border-[#e5ddd3] bg-[#f5f0ea] p-5">
        <div className="flex gap-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#fbfaf7]">
            <Mail
              className="size-3.5 !text-[#80685f]"
              strokeWidth={1.4}
            />
          </span>

          <p className="text-[9px] leading-5 !text-[#806e67]">
            Enter the email address connected
            to your ÉLAN account and we&apos;ll
            send you a secure password reset
            link.
          </p>
        </div>
      </div>

      {/* Email */}

      <label
        htmlFor="email"
        className="block"
      >
        <span className="mb-2 block text-[8px] uppercase tracking-[0.14em] !text-[#806e67]">
          Email address
        </span>

        <input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(event) =>
            setEmail(
              event.target.value
            )
          }
          autoComplete="email"
          maxLength={160}
          disabled={loading}
          placeholder="you@example.com"
          className="
            h-[52px]
            w-full
            border
            border-[#d8d0ca]
            bg-transparent
            px-4
            text-[10px]
            !text-[#382b28]
            outline-none

            placeholder:!text-[#aaa09b]

            transition-colors

            focus:border-[#7e4c55]

            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        />
      </label>

      {/* Submit */}

      <button
        type="submit"
        disabled={loading}
        className="
          group
          flex
          min-h-[52px]
          w-full
          items-center
          justify-between
          bg-[#5a1425]
          px-5
          text-[9px]
          font-medium
          !text-white

          transition-colors

          hover:bg-[#6b1b2f]

          disabled:cursor-not-allowed
          disabled:opacity-60
        "
      >
        <span>
          {loading
            ? "Sending..."
            : "Send reset link"}
        </span>

        {loading ? (
          <LoaderCircle
            className="size-4 animate-spin"
            strokeWidth={1.4}
          />
        ) : (
          <ArrowRight
            className="size-3.5 transition-transform group-hover:translate-x-1"
            strokeWidth={1.4}
          />
        )}
      </button>

      {/* Back */}

      <Link
        href="/login"
        className="group inline-flex items-center gap-2 text-[9px] !text-[#6d5b55] transition-opacity hover:opacity-60"
      >
        <ArrowLeft
          className="size-3 transition-transform group-hover:-translate-x-1"
          strokeWidth={1.4}
        />

        Back to sign in
      </Link>
    </form>
  );
}