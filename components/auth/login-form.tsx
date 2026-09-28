"use client";

import { useState } from "react";
import type { FormEvent } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
} from "lucide-react";

import { toast } from "sonner";

import { authService } from "@/services/auth.service";
import { GoogleAuthButton } from "./google-auth-button";

export function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [loading, setLoading] =
    useState(false);

  const googleEnabled =
    process.env
      .NEXT_PUBLIC_GOOGLE_AUTH_ENABLED ===
    "true";

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const cleanEmail = email
      .trim()
      .toLowerCase();

    /*
     * Backend LoginDto:
     *
     * email:
     * - valid email
     * - max 160 characters
     *
     * password:
     * - string
     * - max 128 characters
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

    if (!password) {
      toast.error(
        "Enter your password."
      );
      return;
    }

    if (password.length > 128) {
      toast.error(
        "Your password is too long."
      );
      return;
    }

    setLoading(true);

    const toastId = toast.loading(
      "Signing you in..."
    );

    try {
      const response =
        await authService.login({
          email: cleanEmail,
          password,
        });

      const firstName =
        response.user.name
          ?.trim()
          .split(/\s+/)[0];

      toast.success(
        firstName
          ? `Welcome back, ${firstName}.`
          : "Welcome back.",
        {
          id: toastId,
        }
      );

      /*
       * Backend roles:
       *
       * ADMIN    -> admin dashboard
       * CUSTOMER -> customer account
       */

      if (
        response.user.role === "ADMIN"
      ) {
        router.replace("/admin");
      } else {
        router.replace("/");
      }

      /*
       * Refresh Server Components after
       * authentication cookie changes.
       */
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to sign in.",
        {
          id: toastId,
        }
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
      noValidate
    >
      {/* =============================================
          EMAIL
      ============================================== */}

      <AuthInput
        id="email"
        label="Email address"
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="you@example.com"
        autoComplete="email"
        maxLength={160}
        disabled={loading}
      />

      {/* =============================================
          PASSWORD
      ============================================== */}

      <div>
        <div className="mb-2 flex items-center justify-between gap-4">
          <label
            htmlFor="password"
            className="text-[8px] uppercase tracking-[0.14em] !text-[#806e67]"
          >
            Password
          </label>

          <Link
            href="/forgot-password"
            className="
              text-[8px]
              !text-[#5a1425]
              transition-opacity

              hover:opacity-65
            "
          >
            Forgot password?
          </Link>
        </div>

        <div className="relative">
          <input
            id="password"
            name="password"
            type={
              showPassword
                ? "text"
                : "password"
            }
            value={password}
            onChange={(event) =>
              setPassword(
                event.target.value
              )
            }
            autoComplete="current-password"
            maxLength={128}
            disabled={loading}
            placeholder="Enter your password"
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
            onClick={() =>
              setShowPassword(
                (current) => !current
              )
            }
            disabled={loading}
            aria-label={
              showPassword
                ? "Hide password"
                : "Show password"
            }
            className="
              absolute
              right-3
              top-1/2
              flex
              size-8
              -translate-y-1/2
              items-center
              justify-center
              !text-[#806d66]

              transition-colors

              hover:!text-[#5a1425]

              disabled:pointer-events-none
              disabled:opacity-50
            "
          >
            {showPassword ? (
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
      </div>

      {/* =============================================
          SUBMIT
      ============================================== */}

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
            ? "Signing in..."
            : "Sign in"}
        </span>

        {loading ? (
          <LoaderCircle
            className="size-4 animate-spin"
            strokeWidth={1.4}
          />
        ) : (
          <ArrowRight
            className="size-3.5 transition-transform duration-300 group-hover:translate-x-1"
            strokeWidth={1.4}
          />
        )}
      </button>

      {/* =============================================
          GOOGLE
      ============================================== */}

      {googleEnabled && (
        <>
          <AuthDivider />

          <GoogleAuthButton />
        </>
      )}

      {/* =============================================
          REGISTER
      ============================================== */}

      <p className="pt-2 text-center text-[9px] !text-[#88766f]">
        New to ÉLAN?{" "}

        <Link
          href="/register"
          className="font-medium !text-[#5a1425] transition-opacity hover:opacity-65"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}

/* =========================================================
   INPUT
========================================================= */

function AuthInput({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  maxLength,
  disabled = false,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  autoComplete?: string;
  maxLength?: number;
  disabled?: boolean;
}) {
  return (
    <label
      htmlFor={id}
      className="block"
    >
      <span className="mb-2 block text-[8px] uppercase tracking-[0.14em] !text-[#806e67]">
        {label}
      </span>

      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={placeholder}
        autoComplete={autoComplete}
        maxLength={maxLength}
        disabled={disabled}
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
  );
}

/* =========================================================
   DIVIDER
========================================================= */

function AuthDivider() {
  return (
    <div className="flex items-center gap-4 py-1">
      <div className="h-px flex-1 bg-[#e2dad4]" />

      <span className="text-[8px] uppercase tracking-[0.14em] !text-[#a08d86]">
        or
      </span>

      <div className="h-px flex-1 bg-[#e2dad4]" />
    </div>
  );
}