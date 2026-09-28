import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { VerifyEmailForm } from "@/components/auth/verify-email-form";

export const metadata: Metadata = {
  title: "Verify Email | Élan Parfums",
  description:
    "Verify your Élan Parfums email address.",
};

type PageProps = {
  searchParams: Promise<{
    token?: string;
  }>;
};

export default async function VerifyEmailPage({
  searchParams,
}: PageProps) {
  const { token = "" } =
    await searchParams;

  return (
    <AuthShell
      eyebrow="Account verification"
      title="Verify your email."
      description="One quick check keeps your ÉLAN account secure and makes sure important order updates reach you."
    >
      <VerifyEmailForm
        token={token}
      />
    </AuthShell>
  );
}