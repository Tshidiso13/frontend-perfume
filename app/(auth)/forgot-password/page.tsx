import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password | Élan Parfums",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Forgot your password?"
      description="Enter your email and we'll send you a secure link to choose a new password."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}