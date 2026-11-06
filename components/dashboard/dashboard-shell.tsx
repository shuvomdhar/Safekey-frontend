"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FolderClosed, LogOut, Settings2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { BrandLink } from "@/components/brand";
import { Avatar } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/misc";
import { cn } from "@/lib/format";

const NAV = [
  { href: "/dashboard", label: "Vaults", icon: FolderClosed },
  { href: "/dashboard/settings", label: "Settings", icon: Settings2 }
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    router.replace("/login");
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-3 text-muted">
        <Spinner />
        <span className="text-[13px]">Opening your workspace…</span>
      </div>
    );
  }

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" || pathname.startsWith("/dashboard/folders") : pathname === href;

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto flex w-full max-w-[1440px]">
        <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col border-r border-line px-5 py-6 lg:flex">
          <BrandLink />

          <nav className="mt-9 flex flex-col gap-1" aria-label="Workspace">
            {NAV.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-ink text-cream"
                      : "text-ink-soft hover:bg-ink/[0.06] hover:text-ink"
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 rounded-xl border border-line bg-paper/70 p-3.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-faint">
              A small reminder
            </p>
            <p className="mt-1.5 text-[12px] leading-relaxed text-muted">
              Secrets are masked by default. Reveal one only when you need it — and it
              hides itself again after 20 seconds.
            </p>
          </div>

          <div className="mt-auto border-t border-line pt-4">
            <div className="flex items-center gap-2.5">
              <Avatar name={user.fullName} email={user.email} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12.5px] font-semibold text-ink">
                  {user.fullName ?? "Your account"}
                </p>
                <p className="truncate text-[11px] text-faint">{user.email}</p>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                title="Sign out"
                aria-label="Sign out"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-ink/[0.06] hover:text-ink disabled:opacity-40"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-line bg-cream/90 backdrop-blur-md lg:hidden">
            <div className="flex h-16 items-center justify-between px-5">
              <BrandLink />
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard/settings"
                  aria-label="Settings"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-ink/[0.06]"
                >
                  <Settings2 className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={signingOut}
                  aria-label="Sign out"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-ink/[0.06] disabled:opacity-40"
                >
                  <LogOut className="h-4 w-4" />
                </button>
                <Avatar name={user.fullName} email={user.email} size="sm" />
              </div>
            </div>

            <div className="flex gap-1 border-t border-line px-4 py-2">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12.5px] font-medium transition-colors",
                    isActive(item.href) ? "bg-ink text-cream" : "text-muted hover:bg-ink/[0.06]"
                  )}
                >
                  <item.icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {item.label}
                </Link>
              ))}
            </div>
          </header>

          <main className="px-5 py-7 sm:px-8 sm:py-10 lg:px-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
