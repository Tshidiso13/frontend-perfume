// frontend/app/
import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create Account | Élan Parfums",
};

export default function RegisterPage() {
  return (
    <AuthShell
      eyebrow="Your Élan"
      title="Create an account."
      description="Save fragrances, follow your orders and make every return visit a little more personal."
    >
      <RegisterForm />
    </AuthShell>
  );
}