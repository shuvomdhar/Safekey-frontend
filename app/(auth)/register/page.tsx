"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { errorMessage, registerAccount } from "@/lib/api";
import { emailAuthErrorMessage, useAuth } from "@/lib/auth";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input, PasswordInput } from "@/components/ui/field";
import { AuthHeading, FormError } from "@/components/auth/auth-bits";
import { GoogleButton } from "@/components/auth/google-button";
import { PasswordStrength } from "@/components/auth/password-strength";

export default function RegisterPage() {
  const router = useRouter();
  const toast = useToast();
  const { user, loading, refresh } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<unknown>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [loading, user, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLocalError(null);
    setNotice(null);

    if (!isSupabaseConfigured) {
      setError(
        new Error(
          "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to frontend/.env."
        )
      );
      return;
    }

    if (password.length < 8) {
      setLocalError("Use at least 8 characters for your password.");
      return;
    }

    if (password !== confirmPassword) {
      setLocalError("Those two passwords do not match yet.");
      return;
    }

    const credentials = { email: email.trim(), password };
    const account = { ...credentials, fullName: fullName.trim() || null };

    setSubmitting(true);
    try {
      // The API creates a confirmed Supabase user, so registration works even
      // if the project's "Confirm email" setting is still on.
      await registerAccount(account);

      let { error: signInError } = await supabase.auth.signInWithPassword(credentials);

      // An account created by an older build (or by `signUp` while "Confirm
      // email" was on) stays unconfirmed. Registering again completes it, so
      // retry once instead of sending the user to the Supabase dashboard.
      if (signInError && signInError.message.toLowerCase().includes("email not confirmed")) {
        await registerAccount(account);
        ({ error: signInError } = await supabase.auth.signInWithPassword(credentials));
      }

      if (signInError) {
        setError(new Error(emailAuthErrorMessage(signInError.message)));
        return;
      }

      await refresh();
      toast.success("Your account is ready. Let’s build your first vault.");
      router.replace("/dashboard");
    } catch (error) {
      setError(error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="animate-rise">
      <AuthHeading
        title="Make a little room for calm."
        subtitle="One account, then as many vaults as life needs. No confirmation email waiting in your inbox."
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <FormError message={localError ?? (error ? errorMessage(error) : undefined)} />

        {notice ? (
          <div className="rounded-xl border border-line-strong bg-cream-deep px-4 py-3 text-[12.5px] leading-relaxed text-ink-soft">
            {notice}{" "}
            <Link href="/login" className="font-semibold text-ink underline underline-offset-2">
              Go to sign in
            </Link>
          </div>
        ) : null}

        <Input
          label="Your name"
          name="name"
          autoComplete="name"
          placeholder="Ada Lovelace"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          optional
          maxLength={80}
          autoFocus
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
        />

        <div className="flex flex-col gap-1.5">
          <PasswordInput
            label="Password"
            name="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <PasswordStrength password={password} />
        </div>

        <PasswordInput
          label="Confirm password"
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="Type it once more"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
        />

        <Button type="submit" size="lg" loading={submitting} className="mt-1 w-full">
          Create my account
          {!submitting ? <ArrowRight className="h-4 w-4" aria-hidden="true" /> : null}
        </Button>

        <p className="text-center text-[11.5px] leading-relaxed text-faint">
          Secrets are encrypted before they are stored, and only decrypted when you
          ask to reveal one.
        </p>
      </form>

      <div className="mt-5">
        <GoogleButton disabled={submitting} />
      </div>

      <p className="mt-7 text-center text-[13px] text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-ink underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
