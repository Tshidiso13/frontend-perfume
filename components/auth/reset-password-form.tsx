"use client";

import { useState } from "react";
import type { FormEvent } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";

import { toast } from "sonner";

import { authService } from "@/services/auth.service";

export function ResetPasswordForm({
  token,
}: {
  token: string;
}) {
  const router = useRouter();

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [loading, setLoading] =
    useState(false);

  const [completed, setCompleted] =
    useState(false);

  const requirements = {
    minimum: password.length >= 8,
    maximum:
      password.length > 0 &&
      password.length <= 128,
    matches:
      confirmPassword.length > 0 &&
      password === confirmPassword,
  };

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    /*
     * Backend ResetPasswordDto:
     *
     * token:
     * - string
     * - minimum 20 characters
     *
     * password:
     * - 8 to 128 characters
     */

    if (!token || token.length < 20) {
      toast.error(
        "This password reset link is invalid."
      );

      return;
    }

    if (password.length < 8) {
      toast.error(
        "Password must contain at least 8 characters."
      );

      return;
    }

    if (password.length > 128) {
      toast.error(
        "Password cannot exceed 128 characters."
      );

      return;
    }

    if (
      password !== confirmPassword
    ) {
      toast.error(
        "Passwords do not match."
      );

      return;
    }

    setLoading(true);

    const toastId = toast.loading(
      "Updating your password..."
    );

    try {
      const response =
        await authService.resetPassword({
          token,
          password,
        });

      toast.success(
        response.message ||
          "Password updated successfully.",
        {
          id: toastId,
        }
      );

      setCompleted(true);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to reset your password.",
        {
          id: toastId,
        }
      );
    } finally {
      setLoading(false);
    }
  }

  /* =======================================================
     INVALID TOKEN
  ======================================================== */

  if (!token || token.length < 20) {
    return (
      <div className="border border-[#e5ddd3] bg-[#fbfaf7] p-6 sm:p-7">
        <span className="flex size-11 items-center justify-center rounded-full bg-[#f1e5e4]">
          <ShieldCheck
            className="size-5 !text-[#95564f]"
            strokeWidth={1.4}
          />
        </span>

        <p className="mt-7 text-[8px] font-medium uppercase tracking-[0.22em] !text-[#9a756c]">
          Invalid reset link
        </p>

        <h2 className="mt-3 font-display text-[30px] font-normal leading-none !text-[#382724]">
          We can&apos;t use this link.
        </h2>

        <p className="mt-4 text-[9px] leading-6 !text-[#806e67]">
          This password reset link is missing,
          invalid or incomplete. Request a new
          one and we&apos;ll send fresh reset
          instructions to your email.
        </p>

        <Link
          href="/forgot-password"
          className="group mt-7 flex min-h-[50px] w-full items-center justify-between bg-[#5a1425] px-5 text-[9px] font-medium !text-white transition-colors hover:bg-[#6b1b2f]"
        >
          Request another link

          <ArrowRight
            className="size-3.5 transition-transform group-hover:translate-x-1"
            strokeWidth={1.4}
          />
        </Link>

        <Link
          href="/login"
          className="group mt-5 inline-flex items-center gap-2 text-[9px] !text-[#6d5b55]"
        >
          <ArrowLeft
            className="size-3 transition-transform group-hover:-translate-x-1"
            strokeWidth={1.4}
          />

          Back to sign in
        </Link>
      </div>
    );
  }

  /* =======================================================
     SUCCESS
  ======================================================== */

  if (completed) {
    return (
      <div className="border border-[#e5ddd3] bg-[#fbfaf7] p-6 sm:p-7">
        <span className="flex size-11 items-center justify-center rounded-full bg-[#e8eee8]">
          <CheckCircle2
            className="size-5 !text-[#526357]"
            strokeWidth={1.5}
          />
        </span>

        <p className="mt-7 text-[8px] font-medium uppercase tracking-[0.22em] !text-[#9a756c]">
          Password updated
        </p>

        <h2 className="mt-3 font-display text-[30px] font-normal leading-none !text-[#382724]">
          You&apos;re all set.
        </h2>

        <p className="mt-4 text-[9px] leading-6 !text-[#806e67]">
          Your ÉLAN password has been changed.
          For security, your previous sessions
          have been signed out.
        </p>

        <button
          type="button"
          onClick={() =>
            router.replace("/login")
          }
          className="group mt-7 flex min-h-[50px] w-full items-center justify-between bg-[#5a1425] px-5 text-[9px] font-medium !text-white transition-colors hover:bg-[#6b1b2f]"
        >
          Sign in

          <ArrowRight
            className="size-3.5 transition-transform group-hover:translate-x-1"
            strokeWidth={1.4}
          />
        </button>
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
            <ShieldCheck
              className="size-3.5 !text-[#80685f]"
              strokeWidth={1.4}
            />
          </span>

          <p className="text-[9px] leading-5 !text-[#806e67]">
            Choose a new password for your
            ÉLAN account. Once changed, all
            existing sessions will be revoked.
          </p>
        </div>
      </div>

      {/* New password */}

      <PasswordInput
        id="new-password"
        label="New password"
        value={password}
        onChange={setPassword}
        visible={showPassword}
        onToggle={() =>
          setShowPassword(
            (current) => !current
          )
        }
        disabled={loading}
      />

      {password.length > 0 && (
        <div className="grid gap-2 border-l border-[#ded5cf] pl-4">
          <Requirement
            complete={
              requirements.minimum
            }
          >
            At least 8 characters
          </Requirement>

          <Requirement
            complete={
              requirements.maximum
            }
          >
            Maximum 128 characters
          </Requirement>
        </div>
      )}

      {/* Confirm */}

      <PasswordInput
        id="confirm-password"
        label="Confirm new password"
        value={confirmPassword}
        onChange={
          setConfirmPassword
        }
        visible={
          showConfirmPassword
        }
        onToggle={() =>
          setShowConfirmPassword(
            (current) => !current
          )
        }
        disabled={loading}
      />

      {confirmPassword.length >
        0 && (
        <Requirement
          complete={requirements.matches}
        >
          Passwords match
        </Requirement>
      )}

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
            ? "Updating password..."
            : "Set new password"}
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

/* =========================================================
   PASSWORD INPUT
========================================================= */

function PasswordInput({
  id,
  label,
  value,
  onChange,
  visible,
  onToggle,
  disabled,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggle: () => void;
  disabled: boolean;
}) {
  return (
    <label
      htmlFor={id}
      className="block"
    >
      <span className="mb-2 block text-[8px] uppercase tracking-[0.14em] !text-[#806e67]">
        {label}
      </span>

      <div className="relative">
        <input
          id={id}
          name={id}
          type={
            visible
              ? "text"
              : "password"
          }
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          autoComplete="new-password"
          minLength={8}
          maxLength={128}
          disabled={disabled}
          placeholder="At least 8 characters"
          className="
            h-[52px]
            w-full
            border
            border-[#d8d0ca]
            bg-transparent
            px-4
            pr-12
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

        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          aria-label={
            visible
              ? `Hide ${label.toLowerCase()}`
              : `Show ${label.toLowerCase()}`
          }
          className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center !text-[#806d66] transition-colors hover:!text-[#5a1425] disabled:pointer-events-none disabled:opacity-50"
        >
          {visible ? (
            <EyeOff
              className="size-4"
              strokeWidth={1.4}
            />
          ) : (
            <Eye
              className="size-4"
              strokeWidth={1.4}
            />
          )}
        </button>
      </div>
    </label>
  );
}

/* =========================================================
   REQUIREMENT
========================================================= */

function Requirement({
  complete,
  children,
}: {
  complete: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`
          flex
          size-4
          items-center
          justify-center
          rounded-full

          ${
            complete
              ? "bg-[#e8eee8] !text-[#526357]"
              : "border border-[#d7cec8] !text-[#a08e87]"
          }
        `}
      >
        {complete && (
          <Check
            className="size-2.5"
            strokeWidth={1.8}
          />
        )}
      </span>

      <span
        className={`text-[8px] ${
          complete
            ? "!text-[#526357]"
            : "!text-[#988780]"
        }`}
      >
        {children}
      </span>
    </div>
  );
}