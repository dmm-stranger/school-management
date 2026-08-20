"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/features/auth/auth.api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await authApi.forgotPassword({ email });
      setSent(true);
      // Backend never reveals whether the email exists, so we always
      // move forward to the reset screen after a short pause.
      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      }, 1500);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-heading">Forgot password</h1>
        <p className="mt-1 text-sm text-muted">
          Enter your email and we&apos;ll send you a 6-digit code to reset your password.
        </p>

        {sent ? (
          <div className="mt-6 rounded-[var(--radius-control)] bg-[var(--color-status-active-bg)] px-4 py-3 text-sm text-[var(--color-status-active-text)]">
            If an account exists for that email, a reset code has been sent. Redirecting…
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4" noValidate>
            <Input
              label="Email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@school.edu"
            />
            <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full">
              {isSubmitting ? "Sending…" : "Send reset code"}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-muted">
          Remembered your password?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
