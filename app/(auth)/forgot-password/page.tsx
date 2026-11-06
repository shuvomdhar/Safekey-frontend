"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, KeyRound } from "lucide-react";
import {
  checkPasswordResetEmail,
  errorMessage,
  resetPasswordWithEmail
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input, PasswordInput } from "@/components/ui/field";
import { AuthHeading, FormError } from "@/components/auth/auth-bits";
import { PasswordStrength } from "@/components/auth/password-strength";

type Step = "email" | "password" | "done";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleCheckEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await checkPasswordResetEmail(email.trim());
      setStep("password");
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Use at least 8 characters for your new password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Those two passwords do not match yet.");
      return;
    }

    setSubmitting(true);
    try {
      await resetPasswordWithEmail({ email: email.trim(), password });
      setPassword("");
      setConfirmPassword("");
      setStep("done");
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  function useDifferentEmail() {
    setStep("email");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError(null);
  }

  if (step === "done") {
    return (
      <div className="animate-rise">
        <span className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sage text-[#425130]">
          <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
        </span>

        <AuthHeading
          title="Password updated."
          subtitle="Your new password is ready. Sign in with it now — every vault and entry is exactly where you left it."
        />

        <Link href="/login" className="mt-6 block w-full">
          <Button size="lg" className="w-full">
            Go to sign in
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </Link>
      </div>
    );
  }

  if (step === "password") {
    return (
      <div className="animate-rise">
        <span className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sage text-[#425130]">
          <KeyRound className="h-6 w-6" aria-hidden="true" />
        </span>

        <AuthHeading
          title="Choose a new password."
          subtitle={
            <>
              We found the account for{" "}
              <strong className="font-semibold text-ink">{email}</strong>. Pick a new
              password and you can sign in straight away.
            </>
          }
        />

        <form onSubmit={handleResetPassword} className="flex flex-col gap-4" noValidate>
          <FormError message={error ?? undefined} />

          <div className="flex flex-col gap-1.5">
            <PasswordInput
              label="New password"
              name="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoFocus
            />
            <PasswordStrength password={password} />
          </div>

          <PasswordInput
            label="Confirm new password"
            name="confirmPassword"
            autoComplete="new-password"
            placeholder="Type it once more"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />

          <Button type="submit" size="lg" loading={submitting} className="mt-1 w-full">
            Update password
            {!submitting ? <ArrowRight className="h-4 w-4" aria-hidden="true" /> : null}
          </Button>

          <button
            type="button"
            onClick={useDifferentEmail}
            disabled={submitting}
            className="text-center text-[12.5px] text-muted underline-offset-4 hover:text-ink hover:underline disabled:opacity-50"
          >
            Use a different email
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="animate-rise">
      <AuthHeading
        title="Forgot your password?"
        subtitle="Enter the email on your account. If it matches, you can set a new password right here — no email or reset link needed."
      />

      <form onSubmit={handleCheckEmail} className="flex flex-col gap-4" noValidate>
        <FormError message={error ?? undefined} />

        <Input
          label="Email address"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoFocus
        />

        <Button
          type="submit"
          size="lg"
          loading={submitting}
          disabled={!email.trim()}
          className="w-full"
        >
          Continue
          {!submitting ? <ArrowRight className="h-4 w-4" aria-hidden="true" /> : null}
        </Button>

        <p className="text-center text-[11.5px] leading-relaxed text-faint">
          Anyone who knows your email can change this account&apos;s password. Only
          use this on a device you trust.
        </p>
      </form>

      <p className="mt-7 text-center text-[13px] text-muted">
        Remembered it?{" "}
        <Link href="/login" className="font-semibold text-ink underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
