import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign In | Élan Parfums",
};

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in."
      description="Return to your saved fragrances, orders and ÉLAN account."
    >
      <LoginForm />
    </AuthShell>
  );
}