"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { googleAuthErrorMessage, safeNextPath } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { AuthHeading, FormError } from "@/components/auth/auth-bits";

function CallbackShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-rise">
      <AuthHeading
        title="Finishing sign-in."
        subtitle="One moment while we open your Safekey vaults."
      />
      {children}
    </div>
  );
}

function CallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const nextPath = safeNextPath(searchParams.get("next"));
    const oauthError =
      searchParams.get("error_description") ?? searchParams.get("error");

    if (oauthError) {
      const errorTimer = window.setTimeout(() => {
        if (!cancelled) setError(googleAuthErrorMessage(oauthError));
      }, 0);

      return () => {
        cancelled = true;
        window.clearTimeout(errorTimer);
      };
    }

    function goToDestination() {
      if (!cancelled) router.replace(nextPath);
    }

    // Supabase exchanges the OAuth code automatically (`detectSessionInUrl`).
    // Wait for that session, then let the app route take over.
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) goToDestination();
    });

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (data.session) goToDestination();
      })
      .catch(() => {
        // The timeout below surfaces a friendly error.
      });

    const timeout = window.setTimeout(async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        goToDestination();
      } else if (!cancelled) {
        setError(
          "We could not complete that sign-in. The link may have expired — please try again."
        );
      }
    }, 10_000);

    return () => {
      cancelled = true;
      subscription.unsubscribe();
      window.clearTimeout(timeout);
    };
  }, [router, searchParams]);

  if (error) {
    return (
      <CallbackShell>
        <FormError message={error} />
        <div className="mt-5 flex flex-col gap-2">
          <Link href="/login">
            <Button size="lg" className="w-full">
              Back to sign in
            </Button>
          </Link>
          <Link
            href="/register"
            className="text-center text-[12.5px] text-muted underline-offset-4 transition-colors hover:text-ink hover:underline"
          >
            Create an account instead
          </Link>
        </div>
      </CallbackShell>
    );
  }

  return (
    <CallbackShell>
      <div className="flex items-center gap-3 rounded-xl border border-line bg-paper px-4 py-3.5 text-[13px] text-muted">
        <Loader2 className="h-4 w-4 animate-spin text-muted" aria-hidden="true" />
        Verifying your account…
      </div>
    </CallbackShell>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <CallbackShell>
          <div className="flex items-center gap-3 rounded-xl border border-line bg-paper px-4 py-3.5 text-[13px] text-muted">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Loading…
          </div>
        </CallbackShell>
      }
    >
      <CallbackInner />
    </Suspense>
  );
}
