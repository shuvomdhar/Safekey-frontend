"use client";

import Link from "next/link";
import { ArrowRight, LayoutDashboard } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

/**
 * The landing page is prerendered, so the marketing chrome cannot know about
 * the Supabase session on the server. These small client components swap the
 * "Sign in / Get started" calls to action for dashboard links once a session is
 * present, and show a neutral placeholder while that is being resolved.
 */
function Placeholder({ className }: { className: string }) {
  return <span aria-hidden="true" className={`inline-block ${className}`} />;
}

export function HeaderAuthActions() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <Placeholder className="h-9 w-[92px] rounded-full bg-ink/[0.05]" />
        <Placeholder className="h-9 w-[112px] rounded-full bg-ink/[0.05]" />
      </div>
    );
  }

  if (user) {
    return (
      <Link
        href="/dashboard"
        className={buttonClasses("primary", "sm", "rounded-full px-4")}
      >
        <LayoutDashboard className="h-3.5 w-3.5" aria-hidden="true" />
        Dashboard
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link href="/login" className={buttonClasses("ghost", "sm", "hidden sm:inline-flex")}>
        Sign in
      </Link>
      <Link href="/register" className={buttonClasses("primary", "sm", "rounded-full px-4")}>
        Get started
        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </Link>
    </div>
  );
}

export function HeroAuthActions() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Placeholder className="h-12 w-44 rounded-full bg-ink/[0.05]" />;
  }

  return (
    <Link
      href={user ? "/dashboard" : "/register"}
      className={buttonClasses("primary", "lg", "rounded-full")}
    >
      {user ? "Open your vaults" : "Create your vault"}
      <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </Link>
  );
}

export function CtaAuthActions() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Placeholder className="h-12 w-48 rounded-full bg-ink/[0.05]" />;
  }

  if (user) {
    return (
      <Link href="/dashboard" className={buttonClasses("primary", "lg", "rounded-full")}>
        <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
        Open your dashboard
      </Link>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Link href="/register" className={buttonClasses("primary", "lg", "rounded-full")}>
        Get started free
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
      <Link href="/login" className={buttonClasses("secondary", "lg", "rounded-full")}>
        I already have an account
      </Link>
    </div>
  );
}

export function FooterAuthActions() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Placeholder className="h-3 w-16 rounded bg-ink/[0.06]" />;
  }

  if (user) {
    return (
      <Link className="transition-colors hover:text-ink" href="/dashboard">
        Dashboard
      </Link>
    );
  }

  return (
    <>
      <Link className="transition-colors hover:text-ink" href="/login">
        Sign in
      </Link>
      <Link className="transition-colors hover:text-ink" href="/register">
        Create account
      </Link>
    </>
  );
}
