"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { errorMessage } from "@/lib/api";
import { emailAuthErrorMessage, useAuth } from "@/lib/auth";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input, PasswordInput } from "@/components/ui/field";
import { AuthHeading, FormError } from "@/components/auth/auth-bits";
import { GoogleButton } from "@/components/auth/google-button";

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const { user, loading, accountError, refresh } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<unknown>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [loading, user, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!isSupabaseConfigured) {
      setError(
        new Error(
          "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to frontend/.env."
        )
      );
      return;
    }

    setSubmitting(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (signInError) {
        setError(new Error(emailAuthErrorMessage(signInError.message)));
        return;
      }

      await refresh();
      toast.success("Welcome back.");
      router.replace("/dashboard");
    } catch {
      setError(new Error("Could not sign you in. Please try again."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="animate-rise">
      <AuthHeading
        title="Welcome back."
        subtitle="Sign in to open your vaults — your secrets are exactly where you left them."
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <FormError
          message={accountError ?? (error ? errorMessage(error) : undefined)}
        />

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

        <div className="flex flex-col gap-1.5">
          <PasswordInput
            label="Password"
            name="password"
            autoComplete="current-password"
            placeholder="Your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-[12px] font-medium text-muted transition-colors hover:text-ink"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button type="submit" size="lg" loading={submitting} className="mt-1 w-full">
          Sign in
          {!submitting ? <ArrowRight className="h-4 w-4" aria-hidden="true" /> : null}
        </Button>
      </form>

      <div className="mt-5">
        <GoogleButton disabled={submitting} />
      </div>

      <p className="mt-7 text-center text-[13px] text-muted">
        New to Safekey?{" "}
        <Link href="/register" className="font-semibold text-ink underline-offset-4 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
