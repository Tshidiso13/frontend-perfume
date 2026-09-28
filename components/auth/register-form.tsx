"use client";

import { useState } from "react";
import type { FormEvent } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LoaderCircle,
} from "lucide-react";

import { toast } from "sonner";

import { authService } from "@/services/auth.service";
import { GoogleAuthButton } from "./google-auth-button";

export function RegisterForm() {
  const router = useRouter();

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

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

  const googleEnabled =
    process.env
      .NEXT_PUBLIC_GOOGLE_AUTH_ENABLED ===
    "true";

  const passwordRequirements = {
    length: password.length >= 8,
    maximum: password.length <= 128,
    matches:
      password.length > 0 &&
      password === confirmPassword,
  };

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const cleanName =
      name.trim();

    const cleanEmail =
      email
        .trim()
        .toLowerCase();

    /*
     * Match NestJS RegisterDto:
     *
     * name:
     * 2 - 80 characters
     *
     * email:
     * valid email
     *
     * password:
     * 8 - 128 characters
     */

    if (cleanName.length < 2) {
      toast.error(
        "Your name must contain at least 2 characters."
      );

      return;
    }

    if (cleanName.length > 80) {
      toast.error(
        "Your name cannot exceed 80 characters."
      );

      return;
    }

    if (!cleanEmail) {
      toast.error(
        "Enter your email address."
      );

      return;
    }

    if (cleanEmail.length > 160) {
      toast.error(
        "Your email address is too long."
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

    const toastId =
      toast.loading(
        "Creating your ÉLAN account..."
      );

    try {
      const response =
        await authService.register({
          name: cleanName,
          email: cleanEmail,
          password,
        });

      toast.success(
        `Welcome to ÉLAN, ${
          response.user.name.split(
            " "
          )[0]
        }.`,
        {
          id: toastId,
        }
      );

      /*
       * Backend currently registers normal
       * accounts as CUSTOMER.
       *
       * Keeping role handling here means
       * this remains safe if registration
       * behaviour changes later.
       */

      if (
        response.user.role === "ADMIN"
      ) {
        router.replace("/admin");
      } else {
        router.replace("/");
      }

      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to create your account.",
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
      {/* Name */}

      <AuthInput
        id="name"
        label="Full name"
        value={name}
        onChange={setName}
        placeholder="Your name"
        autoComplete="name"
        maxLength={80}
      />

      {/* Email */}

      <AuthInput
        id="email"
        label="Email address"
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="you@example.com"
        autoComplete="email"
        maxLength={160}
      />

      {/* Password */}

      <PasswordInput
        id="password"
        label="Password"
        value={password}
        onChange={setPassword}
        visible={showPassword}
        onToggle={() =>
          setShowPassword(
            (current) =>
              !current
          )
        }
        autoComplete="new-password"
      />

      {/* Password requirements */}

      {password.length > 0 && (
        <div className="grid gap-2 border-l border-[#ded5cf] pl-4">
          <Requirement
            complete={
              passwordRequirements.length
            }
          >
            At least 8 characters
          </Requirement>

          <Requirement
            complete={
              passwordRequirements.maximum
            }
          >
            Maximum 128 characters
          </Requirement>
        </div>
      )}

      {/* Confirmation */}

      <PasswordInput
        id="confirm-password"
        label="Confirm password"
        value={confirmPassword}
        onChange={
          setConfirmPassword
        }
        visible={
          showConfirmPassword
        }
        onToggle={() =>
          setShowConfirmPassword(
            (current) =>
              !current
          )
        }
        autoComplete="new-password"
      />

      {confirmPassword.length >
        0 && (
        <Requirement
          complete={
            passwordRequirements.matches
          }
        >
          Passwords match
        </Requirement>
      )}

      {/* Terms */}

      <p className="text-[8px] leading-5 !text-[#94827b]">
        By creating an account, you
        agree to ÉLAN&apos;s terms and
        privacy policy.
      </p>

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
        {loading
          ? "Creating account..."
          : "Create account"}

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

      {/* Google */}

      {googleEnabled && (
        <>
          <div className="flex items-center gap-4 py-1">
            <div className="h-px flex-1 bg-[#e2dad4]" />

            <span className="text-[8px] uppercase tracking-[0.14em] !text-[#a08d86]">
              or
            </span>

            <div className="h-px flex-1 bg-[#e2dad4]" />
          </div>

          <GoogleAuthButton
            label="Sign up with Google"
          />
        </>
      )}

      {/* Login */}

      <p className="pt-2 text-center text-[9px] !text-[#88766f]">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium !text-[#5a1425] hover:underline"
        >
          Sign in
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
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  maxLength,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  autoComplete?: string;
  maxLength?: number;
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
        disabled={false}
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
        "
      />
    </label>
  );
}

/* =========================================================
   PASSWORD
========================================================= */

function PasswordInput({
  id,
  label,
  value,
  onChange,
  visible,
  onToggle,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggle: () => void;
  autoComplete?: string;
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
          autoComplete={
            autoComplete
          }
          minLength={8}
          maxLength={128}
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
          "
        />

        <button
          type="button"
          onClick={onToggle}
          aria-label={
            visible
              ? `Hide ${label.toLowerCase()}`
              : `Show ${label.toLowerCase()}`
          }
          className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center !text-[#806d66] transition-colors hover:!text-[#5a1425]"
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