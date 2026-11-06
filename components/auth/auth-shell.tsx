import Link from "next/link";
import { Lock, ShieldCheck, Sparkles } from "lucide-react";
import { BrandLink } from "@/components/brand";
import { CopyrightYear } from "@/components/ui/copyright-year";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_0.92fr]">
      <div className="flex min-h-screen flex-col px-5 py-7 sm:px-10">
        <header className="flex items-center justify-between">
          <BrandLink />
          <Link
            href="/"
            className="text-[12.5px] font-medium text-muted transition-colors hover:text-ink"
          >
            Back to home
          </Link>
        </header>

        <main className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-10">
          {children}
        </main>

        <footer className="mx-auto flex w-full max-w-[400px] items-center justify-between text-[11.5px] text-faint">
          <span>© <CopyrightYear /> Safekey</span>
          <span className="flex items-center gap-1.5">
            <Lock className="h-3 w-3" aria-hidden="true" />
            Encrypted secrets
          </span>
        </footer>
      </div>

      <aside className="relative hidden overflow-hidden bg-ink p-12 text-cream lg:flex lg:flex-col lg:justify-between">
        <div
          className="pointer-events-none absolute -right-24 top-10 h-[420px] w-[420px] rounded-full border border-cream/10"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-32 -left-16 h-[360px] w-[360px] rounded-full border border-cream/10"
          aria-hidden="true"
        />

        <div className="relative flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-cream/50">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          A calmer password shelf
        </div>

        <div className="relative">
          <p className="max-w-md font-serif text-[clamp(2rem,2.6vw,2.9rem)] leading-[1.08] tracking-[-0.025em]">
            “Three Instagram accounts, one bank, a dozen API keys — all in their own
            quiet little folders.”
          </p>

          <div className="mt-10 w-full max-w-md rounded-2xl border border-cream/12 bg-cream/[0.05] p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between px-1 pb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-cream/45">
              <span>Instagram</span>
              <span>5 entries</span>
            </div>

            <div className="space-y-2">
              {[
                { title: "Personal", meta: "ada@example.com" },
                { title: "Studio", meta: "studio@example.com" },
                { title: "Shop", meta: "shop@example.com" }
              ].map((row) => (
                <div
                  key={row.title}
                  className="flex items-center justify-between gap-3 rounded-xl border border-cream/10 bg-ink/40 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[12.5px] font-medium text-cream/90">{row.title}</p>
                    <p className="truncate text-[10.5px] text-cream/40">{row.meta}</p>
                  </div>
                  <span className="shrink-0 rounded-full border border-cream/15 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-cream/50">
                    Locked
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative flex items-center gap-2 text-[11.5px] text-cream/40">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
          AES-256-GCM field encryption · bcrypt passwords · HttpOnly sessions
        </div>
      </aside>
    </div>
  );
}
