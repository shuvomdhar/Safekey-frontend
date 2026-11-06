"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";
import type { Session } from "@supabase/supabase-js";
import { ApiError, api } from "./api";
import { supabase } from "./supabase";
import type { User } from "./types";

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  accountError: string | null;
  setUser: (user: User | null) => void;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [accountError, setAccountError] = useState<string | null>(null);
  const hadSession = useRef(false);

  useEffect(() => {
    let active = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return;
        setSession(data.session);
        hadSession.current = Boolean(data.session);
        if (!data.session) setLoading(false);
      })
      .catch(() => {
        if (active) setLoading(false);
      });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;

      if (!nextSession) {
        hadSession.current = false;
        setSession(null);
        setUser(null);
        setLoading(false);
        return;
      }

      // Show the loading state only on a real sign-in, not on token refresh.
      if (!hadSession.current) setLoading(true);
      hadSession.current = true;
      setSession(nextSession);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const refresh = useCallback(async () => {
    try {
      const data = await api.get<{ user: User }>("/api/auth/me");
      setUser(data.user);
      setAccountError(null);
    } catch (error) {
      setUser(null);

      // Archived accounts are refused by the API. Sign out and let the login
      // page explain what happened, matching the account soft-delete flow.
      if (error instanceof ApiError && error.status === 403) {
        setAccountError(error.message);
        try {
          await supabase.auth.signOut();
        } catch {
          // The UI is already signed out locally.
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // The Supabase session is external state; refresh syncs the API profile after it resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (session) void refresh();
  }, [session, refresh]);

  const signOut = useCallback(async () => {
    // Best effort: mark the profile inactive before the token is discarded.
    try {
      await api.post("/api/auth/logout");
    } catch {
      // Signing out locally still matters more than the presence flag.
    }

    try {
      await supabase.auth.signOut();
    } catch {
      // Clear local state even if Supabase is unreachable.
    } finally {
      setUser(null);
      setSession(null);
      setAccountError(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      accountError,
      setUser,
      refresh,
      signOut
    }),
    [user, session, loading, accountError, refresh, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>.");
  }
  return context;
}

/* -------------------------------------------------------------------------- */
/*  Supabase auth helpers                                                     */
/* -------------------------------------------------------------------------- */

/** The app URL Supabase returns to after Google OAuth or an email link. */
export function getAuthCallbackUrl(): string {
  return `${window.location.origin}/auth/callback`;
}

export function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: getAuthCallbackUrl(),
      queryParams: { prompt: "select_account" }
    }
  });
}

/** Only allow internal, relative paths from the `next` query parameter. */
export function safeNextPath(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return "/dashboard";
  }
  return value;
}

/** Actionable messages for Supabase email authentication problems. */
export function emailAuthErrorMessage(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes("email not confirmed")) {
    return "This account has not been confirmed yet. Create the account again with the same email and password on the registration page — Safekey confirms it automatically — then sign in.";
  }

  if (
    normalized.includes("email provider is disabled") ||
    normalized.includes("email signups are disabled") ||
    normalized.includes("email logins are disabled") ||
    normalized.includes("email sign-in is disabled")
  ) {
    return "Email sign-in is disabled in Supabase. Open Authentication → Providers → Email and turn on Enable Email Provider.";
  }

  if (
    normalized.includes("email_address_not_authorized") ||
    normalized.includes("not authorized")
  ) {
    return "Supabase's default email service can only deliver to project team members. Configure custom SMTP under Authentication → Emails → SMTP Settings for password-reset emails.";
  }

  if (normalized.includes("over_email_send_rate_limit") || normalized.includes("rate limit")) {
    return "Supabase's email service is rate-limited. Wait before trying again, or configure custom SMTP.";
  }

  if (normalized.includes("email_address_invalid")) {
    return "Supabase rejected this email address. Check it for typos and use a valid address.";
  }

  if (normalized.includes("invalid login credentials")) {
    return "That email and password combination is not correct. Try again or reset your password.";
  }

  if (normalized.includes("user already registered")) {
    return "An account already exists with this email. Sign in instead, or use the forgot-password flow.";
  }

  return message;
}

/** Turns common Supabase/Google OAuth errors into setup instructions. */
export function googleAuthErrorMessage(message: string): string {
  const normalized = message.toLowerCase();

  if (
    normalized.includes("provider is not enabled") ||
    normalized.includes("unsupported provider")
  ) {
    return "Google sign-in is not enabled for this Supabase project. Open Supabase Dashboard → Authentication → Providers → Google, enable it, and add your Google OAuth Client ID and Client Secret.";
  }

  if (normalized.includes("invalid redirect") || normalized.includes("redirect url")) {
    return `The callback URL is not allowlisted. Add ${getAuthCallbackUrl()} to Supabase Dashboard → Authentication → URL Configuration → Redirect URLs.`;
  }

  if (normalized.includes("redirect_uri_mismatch") || normalized.includes("redirect uri")) {
    return "Google rejected the redirect URI. In Google Cloud Console → APIs & Services → Credentials → your OAuth client, add https://<project-ref>.supabase.co/auth/v1/callback as an Authorized redirect URI. The app callback (/auth/callback) belongs in Supabase URL Configuration, not in Google Cloud.";
  }

  return message;
}
