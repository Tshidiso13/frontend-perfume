import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Reset Password | Élan Parfums",
};

type PageProps = {
  searchParams: Promise<{
    token?: string;
  }>;
};

export default async function ResetPasswordPage({
  searchParams,
}: PageProps) {
  const { token = "" } =
    await searchParams;

  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Choose a new password."
      description="Use something secure that you haven't used for this account before."
    >
      <ResetPasswordForm
        token={token}
      />
    </AuthShell>
  );
}