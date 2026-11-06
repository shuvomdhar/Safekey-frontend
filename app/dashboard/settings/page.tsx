"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowUpRight,
  Check,
  KeyRound,
  Link2,
  LogOut,
  Mail,
  ShieldCheck,
  Trash2,
  UserRound,
  X
} from "lucide-react";
import { api, errorMessage, fieldError } from "@/lib/api";
import { emailAuthErrorMessage, useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/format";
import type { User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input, PasswordInput } from "@/components/ui/field";
import { Avatar } from "@/components/ui/avatar";
import { Badge, SectionLabel } from "@/components/ui/misc";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { PasswordStrength } from "@/components/auth/password-strength";

function Card({
  children,
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-line bg-paper ${className}`}>{children}</section>
  );
}

function CardHeader({
  icon,
  title,
  description
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-line px-5 py-4 sm:px-6">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ink/[0.06] text-ink-soft">
        {icon}
      </span>
      <div className="min-w-0">
        <h2 className="font-serif text-[19px] leading-tight tracking-[-0.01em]">{title}</h2>
        <p className="mt-1 text-[12.5px] leading-relaxed text-muted">{description}</p>
      </div>
    </div>
  );
}

function StatusRow({
  title,
  description,
  connected,
  connectedLabel = "Connected"
}: {
  title: string;
  description: string;
  connected: boolean;
  connectedLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-2 py-3.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
            connected ? "bg-sage text-[#425130]" : "bg-ink/[0.06] text-faint"
          }`}
        >
          {connected ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
        </span>
        <div>
          <p className="text-[13px] font-semibold text-ink">{title}</p>
          <p className="mt-0.5 text-[12px] leading-relaxed text-muted">{description}</p>
        </div>
      </div>
      <Badge tone={connected ? "sage" : "outline"} className="ml-10 self-start sm:ml-0 sm:self-center">
        {connected ? connectedLabel : "Not connected"}
      </Badge>
    </div>
  );
}

export default function SettingsPage() {
  const { user, setUser, signOut } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [profileBusy, setProfileBusy] = useState(false);
  const [profileError, setProfileError] = useState<unknown>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<unknown>(null);
  const [passwordLocalError, setPasswordLocalError] = useState<string | null>(null);
  const [passwordBusy, setPasswordBusy] = useState(false);

  const [signingOut, setSigningOut] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // The dashboard shell guarantees a user, but keep a graceful fallback for HMR.
  if (!user) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <div className="skeleton h-8 w-40 rounded-md" />
        <div className="skeleton mt-6 h-64 w-full rounded-2xl" />
      </div>
    );
  }

  const hasPassword = user.hasPassword;

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfileBusy(true);
    setProfileError(null);

    try {
      const data = await api.patch<{ user: User }>("/api/auth/me", {
        fullName: fullName.trim() ? fullName.trim() : null
      });
      setUser(data.user);
      setFullName(data.user.fullName ?? "");
      toast.success("Profile updated.");
    } catch (error) {
      setProfileError(error);
    } finally {
      setProfileBusy(false);
    }
  }

  async function savePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordError(null);
    setPasswordLocalError(null);

    if (newPassword.length < 8) {
      setPasswordLocalError("Use at least 8 characters for your new password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordLocalError("Those two passwords do not match yet.");
      return;
    }

    setPasswordBusy(true);
    try {
      // Supabase owns the credential. Confirm the current password first so an
      // unattended browser cannot quietly replace it.
      if (hasPassword) {
        const { error: verifyError } = await supabase.auth.signInWithPassword({
          email: user!.email,
          password: currentPassword
        });

        if (verifyError) {
          setPasswordError(new Error(emailAuthErrorMessage(verifyError.message)));
          return;
        }
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        setPasswordError(new Error(emailAuthErrorMessage(updateError.message)));
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Record the capability locally so the sign-in methods stay accurate.
      try {
        const me = await api.post<{ user: User }>("/api/auth/password-set");
        setUser(me.user);
      } catch {
        // The password change itself succeeded; a stale profile is not fatal.
      }

      toast.success(hasPassword ? "Password changed." : "Password added to your account.");
    } catch {
      setPasswordError(new Error("Could not update your password. Please try again."));
    } finally {
      setPasswordBusy(false);
    }
  }

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    router.replace("/login");
  }

  async function handleDeleteAccount() {
    setDeleteError(null);

    if (confirmEmail.trim().toLowerCase() !== user!.email.toLowerCase()) {
      setDeleteError("Type your email address exactly to confirm.");
      return;
    }

    setDeleteBusy(true);
    try {
      await api.delete("/api/auth/me", { confirmEmail: confirmEmail.trim().toLowerCase() });
      setDeleteOpen(false);
      await signOut();
      toast.success("Your account and all vaults have been deleted. This email can no longer be used.");
      router.replace("/");
    } catch (error) {
      setDeleteError(errorMessage(error));
      setDeleteBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl animate-rise">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7a8a5f]">
          Account
        </p>
        <h1 className="mt-2 font-serif text-[clamp(1.95rem,4vw,2.7rem)] leading-[1.04] tracking-[-0.03em]">
          Settings
        </h1>
        <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-muted">
          Your profile, sign-in methods and the keys to your workspace. Vault contents stay
          untouched when you change any of these.
        </p>
      </div>

      <div className="mt-7 flex flex-col gap-5">
        <Card>
          <CardHeader
            icon={<UserRound className="h-4 w-4" aria-hidden="true" />}
            title="Profile"
            description="How your name appears in the sidebar and on the dashboard."
          />

          <form onSubmit={saveProfile} className="flex flex-col gap-5 px-5 py-5 sm:px-6" noValidate>
            <div className="flex items-center gap-4">
              <Avatar name={user.fullName} email={user.email} size="lg" />
              <div className="min-w-0">
                <p className="truncate text-[14px] font-semibold text-ink">
                  {user.fullName ?? "Your account"}
                </p>
                <p className="truncate text-[12.5px] text-muted">{user.email}</p>
                <p className="mt-1 text-[11px] text-faint">
                  Member since {formatDate(user.createdAt)}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Full name"
                name="fullName"
                autoComplete="name"
                placeholder="Your name"
                maxLength={80}
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                error={fieldError(profileError, "fullName")}
                leading={<UserRound className="h-4 w-4" />}
              />
              <Input
                label="Email address"
                name="email"
                type="email"
                value={user.email}
                readOnly
                disabled
                hint="Email changes are not available yet."
                leading={<Mail className="h-4 w-4" />}
              />
            </div>

            {profileError ? (
              <p className="rounded-lg bg-[#fbeee9] px-3 py-2 text-[12.5px] text-[#7a2b21]">
                {errorMessage(profileError)}
              </p>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[11.5px] text-faint">
                Your initials are used as your avatar across Safekey.
              </p>
              <Button type="submit" size="sm" loading={profileBusy}>
                Save profile
              </Button>
            </div>
          </form>
        </Card>

        <Card>
          <CardHeader
            icon={<ShieldCheck className="h-4 w-4" aria-hidden="true" />}
            title={hasPassword ? "Change password" : "Set a password"}
            description={
              hasPassword
                ? "Choose a new password. You'll use it the next time you sign in."
                : "You signed in with Google. Add a password to also sign in with email."
            }
          />

          <form onSubmit={savePassword} className="flex flex-col gap-4 px-5 py-5 sm:px-6" noValidate>
            {passwordLocalError ? (
              <p className="rounded-lg bg-[#fbeee9] px-3 py-2 text-[12.5px] text-[#7a2b21]">
                {passwordLocalError}
              </p>
            ) : passwordError ? (
              <p className="rounded-lg bg-[#fbeee9] px-3 py-2 text-[12.5px] text-[#7a2b21]">
                {errorMessage(passwordError)}
              </p>
            ) : null}

            {hasPassword ? (
              <PasswordInput
                label="Current password"
                name="currentPassword"
                autoComplete="current-password"
                placeholder="Your existing password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                error={fieldError(passwordError, "currentPassword")}
                leading={<KeyRound className="h-4 w-4" />}
                required
              />
            ) : null}

            <div className="flex flex-col gap-1.5">
              <PasswordInput
                label={hasPassword ? "New password" : "Password"}
                name="newPassword"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                error={fieldError(passwordError, "newPassword")}
                leading={<KeyRound className="h-4 w-4" />}
                required
              />
              <PasswordStrength password={newPassword} />
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

            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link
                href="/forgot-password"
                className="text-[12px] text-muted underline-offset-4 transition-colors hover:text-ink hover:underline"
              >
                Forgot your current password?
              </Link>
              <Button type="submit" size="sm" loading={passwordBusy}>
                {hasPassword ? "Update password" : "Set password"}
              </Button>
            </div>
          </form>
        </Card>

        <Card>
          <CardHeader
            icon={<Link2 className="h-4 w-4" aria-hidden="true" />}
            title="Sign-in methods"
            description="Two ways in, one account. Either method opens the same vaults."
          />

          <div className="divide-y divide-line px-5 py-1 sm:px-6">
            <StatusRow
              title="Email and password"
              description={user.email}
              connected={hasPassword}
            />
            <StatusRow
              title="Google"
              description={
                user.hasGoogle
                  ? "Linked to this account."
                  : "Sign in with Google using this same email to link it automatically."
              }
              connected={user.hasGoogle}
            />
          </div>

          {!user.hasGoogle ? (
            <p className="border-t border-line px-5 py-3 text-[11.5px] leading-relaxed text-faint sm:px-6">
              Google linking is automatic: choose “Continue with Google” on the sign-in page
              and use {user.email}.
            </p>
          ) : null}
        </Card>

        <Card>
          <CardHeader
            icon={<LogOut className="h-4 w-4" aria-hidden="true" />}
            title="This session"
            description="You stay signed in on this browser with a secure Supabase session. Signing out here ends it."
          />
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
            <p className="text-[12px] text-muted">
              Signed in as <span className="font-medium text-ink">{user.email}</span>
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void handleSignOut()}
              loading={signingOut}
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              Sign out
            </Button>
          </div>
        </Card>

        <Card className="border-[#e0bdb3]">
          <div className="flex items-start gap-3 border-b border-[#e8cfc7] px-5 py-4 sm:px-6">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#fbeee9] text-[#9c3b2e]">
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-serif text-[19px] leading-tight tracking-[-0.01em]">
                Delete account
              </h2>
              <p className="mt-1 text-[12.5px] leading-relaxed text-muted">
                Permanently removes your account, every vault and every entry. Once
                deleted, this email address cannot be used to create a Safekey
                account again.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
            <p className="text-[11.5px] leading-relaxed text-faint">
              Export anything you need before continuing.
            </p>
            <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Delete account
            </Button>
          </div>
        </Card>

        <div className="flex flex-wrap items-center justify-between gap-2 px-1 pb-2 text-[11.5px] text-faint">
          <SectionLabel>End of settings</SectionLabel>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 transition-colors hover:text-ink"
          >
            Back to vaults
            <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        </div>
      </div>

      <Modal
        open={deleteOpen}
        onClose={() => {
          if (deleteBusy) return;
          setDeleteOpen(false);
          setConfirmEmail("");
          setDeleteError(null);
        }}
        title="Delete your account?"
        description="Every vault and entry will be removed immediately. This email address will be reserved and cannot be used to create a new Safekey account."
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setDeleteOpen(false)}
              disabled={deleteBusy}
            >
              Keep my account
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => void handleDeleteAccount()}
              loading={deleteBusy}
            >
              Delete forever
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <div className="rounded-xl border border-[#e8cfc7] bg-[#fbeee9] px-3.5 py-3 text-[12.5px] leading-relaxed text-[#7a2b21]">
            <strong className="font-semibold">This email cannot be reused.</strong>{" "}
            After deletion you cannot sign in or create another Safekey account with{" "}
            {user.email}.
          </div>
          <p className="text-[13px] leading-relaxed text-ink-soft">
            Type <span className="font-semibold text-ink">{user.email}</span> to confirm.
          </p>
          <Input
            label="Email address"
            name="confirmEmail"
            type="email"
            autoComplete="off"
            placeholder={user.email}
            value={confirmEmail}
            onChange={(event) => {
              setConfirmEmail(event.target.value);
              setDeleteError(null);
            }}
            error={deleteError ?? undefined}
            leading={<Mail className="h-4 w-4" />}
            autoFocus
          />
        </div>
      </Modal>
    </div>
  );
}
