import {
  Check,
  Columns3,
  Copy,
  EyeOff,
  FolderPlus,
  KeyRound,
  Lock,
  RefreshCw,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { BrandLink } from "@/components/brand";
import {
  CtaAuthActions,
  FooterAuthActions,
  HeaderAuthActions,
  HeroAuthActions
} from "@/components/landing/auth-actions";
import { buttonClasses } from "@/components/ui/button";
import { FolderGlyph } from "@/components/ui/misc";
import { CopyrightYear } from "@/components/ui/copyright-year";

const features = [
  {
    icon: FolderPlus,
    title: "A vault for every corner",
    body: "Instagram, banking, work, side projects. Give each one its own folder and stop scrolling through a single endless list."
  },
  {
    icon: Columns3,
    title: "Columns you design",
    body: "Every vault gets its own fields — username, password, recovery email, 2FA codes, account number. Add, rename or reorder them any time."
  },
  {
    icon: Lock,
    title: "Encrypted field by field",
    body: "Secrets are sealed with AES-256-GCM before they reach Postgres, and bound to their owner, entry and field."
  },
  {
    icon: EyeOff,
    title: "Hidden until you ask",
    body: "Passwords stay masked in every list and search response. Reveal for a moment, copy, and it hides itself again."
  },
  {
    icon: KeyRound,
    title: "Email or Google, your call",
    body: "Create an account in seconds — no confirmation email. Or continue with Google and skip the form entirely."
  },
  {
    icon: RefreshCw,
    title: "Reset without losing anything",
    body: "Forgot your password? A single-use link lets you choose a new one. Your vaults and secrets stay exactly where they were."
  }
];

const steps = [
  {
    number: "01",
    title: "Create your account",
    body: "Sign up with an email address and a password, or continue with Google. You are in immediately."
  },
  {
    number: "02",
    title: "Shape a vault",
    body: "Name it after the site or the part of your life. Start from a template, then make the columns yours."
  },
  {
    number: "03",
    title: "Add every account",
    body: "One row per account. Multiple Instagram profiles? Add them all to the same vault, side by side."
  }
];

export default function Home() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-40 border-b border-line/80 bg-cream/85 backdrop-blur-md">
        <div className="mx-auto flex h-[76px] w-full max-w-6xl items-center justify-between px-5 sm:px-8">
          <BrandLink />

          <nav className="hidden items-center gap-8 text-[13.5px] font-medium text-ink-soft md:flex">
            <a className="transition-colors hover:text-ink" href="#features">
              Features
            </a>
            <a className="transition-colors hover:text-ink" href="#how">
              How it works
            </a>
            <a className="transition-colors hover:text-ink" href="#security">
              Security
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <HeaderAuthActions />
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ---------------------------------------------------------------- Hero */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute -top-24 right-0 hidden h-[560px] w-[560px] opacity-70 lg:block">
            <div className="dot-grid h-full w-full" />
          </div>

          <div className="relative mx-auto grid w-full max-w-6xl items-center gap-14 px-5 pb-20 pt-14 sm:px-8 lg:grid-cols-[1.04fr_0.96fr] lg:gap-10 lg:pb-28 lg:pt-24">
            <div className="animate-rise">
              <span className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-paper px-3 py-1.5 text-[11.5px] font-semibold uppercase tracking-[0.09em] text-ink-soft">
                <Sparkles className="h-3.5 w-3.5 text-[#7a8a5f]" aria-hidden="true" />
                One quiet home for many accounts
              </span>

              <h1 className="mt-6 font-serif text-[clamp(2.9rem,7vw,4.6rem)] font-normal leading-[0.96] tracking-[-0.035em] text-ink">
                Every password,
                <br />
                in one{" "}
                <span className="relative inline-block italic text-ink-soft">
                  quiet
                  <svg
                    className="absolute -bottom-1 left-0 h-3 w-full text-sage-deep"
                    viewBox="0 0 120 12"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 9c22-6 44-7 58-6 20 1 42 4 58-1"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>{" "}
                place.
              </h1>

              <p className="mt-6 max-w-md text-[16.5px] leading-[1.7] text-muted">
                Safekey is a password and secret manager built around folders, not
                one long list. Keep three Instagram accounts, a dozen API keys and
                your banking details apart — each with exactly the fields it needs.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <HeroAuthActions />
                <a href="#how" className={buttonClasses("secondary", "lg", "rounded-full")}>
                  See how it works
                </a>
              </div>

              <ul className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px] text-muted">
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-[#7a8a5f]" aria-hidden="true" />
                  Free to start
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-[#7a8a5f]" aria-hidden="true" />
                  No card required
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-[#7a8a5f]" aria-hidden="true" />
                  Encrypted secrets
                </li>
              </ul>
            </div>

            {/* Product preview */}
            <div className="relative animate-rise [animation-delay:120ms]">
              <div className="relative rounded-[26px] border border-line-strong bg-paper p-2.5 shadow-lift sm:p-3">
                <div className="flex items-center gap-2 px-2 pb-2.5 pt-1">
                  <span className="h-2 w-2 rounded-full bg-[#d8b5a4]" />
                  <span className="h-2 w-2 rounded-full bg-[#ddd3ae]" />
                  <span className="h-2 w-2 rounded-full bg-[#c0cbb2]" />
                  <span className="ml-2 flex-1 truncate rounded-md bg-cream-deep px-2 py-1 text-center text-[10px] font-medium tracking-wide text-muted">
                    safekey.app/dashboard
                  </span>
                </div>

                <div className="rounded-[18px] border border-line bg-cream p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-faint">
                        Your vaults
                      </p>
                      <p className="mt-0.5 font-serif text-[19px] tracking-[-0.01em] text-ink">
                        Good evening, Ada
                      </p>
                    </div>
                    <span className="rounded-full bg-ink px-3 py-1.5 text-[10px] font-semibold text-cream">
                      + New vault
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {[
                      { icon: "camera" as const, color: "clay" as const, name: "Instagram", count: "3 accounts" },
                      { icon: "bank" as const, color: "sand" as const, name: "Banking", count: "2 accounts" },
                      { icon: "briefcase" as const, color: "sage" as const, name: "Work", count: "7 accounts" }
                    ].map((folder) => (
                      <div
                        key={folder.name}
                        className="rounded-xl border border-line bg-paper p-2.5"
                      >
                        <FolderGlyph icon={folder.icon} color={folder.color} size="sm" />
                        <p className="mt-2 truncate text-[11px] font-semibold text-ink">
                          {folder.name}
                        </p>
                        <p className="text-[9.5px] text-faint">{folder.count}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 overflow-hidden rounded-xl border border-line bg-paper">
                    <div className="flex items-center justify-between border-b border-line px-3 py-2">
                      <span className="flex items-center gap-1.5 text-[10.5px] font-semibold text-ink">
                        <FolderGlyph icon="camera" color="clay" size="sm" className="h-5 w-5 rounded-md" />
                        Instagram
                      </span>
                      <span className="rounded-full bg-ink/[0.06] px-2 py-0.5 text-[9px] font-semibold text-ink-soft">
                        3 entries
                      </span>
                    </div>
                    <div className="grid grid-cols-[1fr_auto] gap-2 px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.08em] text-faint">
                      <span>Account</span>
                      <span>Secret</span>
                    </div>
                    {["personal", "studio", "shop"].map((account, index) => (
                      <div
                        key={account}
                        className="grid grid-cols-[1fr_auto] items-center gap-2 border-t border-line/70 px-3 py-2"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-[10.5px] font-medium text-ink">
                            @ada.{account}
                          </p>
                          <p className="text-[9px] text-faint">ada+{account}@mail.com</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="tracking-[0.18em] text-ink-soft">
                            {index === 1 ? "••••••••" : "••••••"}
                          </span>
                          <span className="rounded-full border border-line px-1.5 py-0.5 text-[8.5px] font-semibold text-muted">
                            Reveal
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="absolute -right-3 -top-4 hidden items-center gap-2 rounded-full border border-line-strong bg-paper px-3 py-2 text-[11px] font-medium text-ink shadow-soft sm:flex">
                <ShieldCheck className="h-3.5 w-3.5 text-[#6d7f52]" aria-hidden="true" />
                AES-256 · sealed
              </div>

              <div className="absolute -bottom-5 left-2 hidden items-center gap-2 rounded-xl border border-line-strong bg-paper px-3 py-2.5 text-[11.5px] text-ink shadow-lift sm:flex">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sage text-[#425130]">
                  <Copy className="h-3 w-3" aria-hidden="true" />
                </span>
                Password copied — hides in 20s
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------- Features */}
        <section id="features" className="border-t border-line bg-paper/50 py-20 sm:py-24">
          <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
            <div className="max-w-2xl">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7a8a5f]">
                Why Safekey
              </span>
              <h2 className="mt-3 font-serif text-[clamp(2rem,4.4vw,3rem)] leading-[1.05] tracking-[-0.025em]">
                Built for the accounts you actually juggle.
              </h2>
              <p className="mt-4 text-[15.5px] leading-relaxed text-muted">
                Most managers give you one flat list. Safekey gives you structure —
                without making you think about it.
              </p>
            </div>

            <div className="mt-12 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <article
                    key={feature.title}
                    className="group rounded-2xl border border-line bg-cream p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-soft"
                  >
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sage text-[#4f5f43]">
                      <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                    </span>
                    <h3 className="mt-4 text-[15.5px] font-semibold tracking-[-0.01em] text-ink">
                      {feature.title}
                    </h3>
                    <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">{feature.body}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------------------- How */}
        <section id="how" className="py-20 sm:py-24">
          <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
              <div className="max-w-xl">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7a8a5f]">
                  How it works
                </span>
                <h2 className="mt-3 font-serif text-[clamp(2rem,4.4vw,3rem)] leading-[1.05] tracking-[-0.025em]">
                  Three steps, then out of your way.
                </h2>
              </div>
              <p className="max-w-sm text-[14px] leading-relaxed text-muted">
                No setup marathon, no browser extension to install. Just a place for
                the things you can never quite remember.
              </p>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-3 md:gap-6">
              {steps.map((step, index) => (
                <div key={step.number} className="relative">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full border border-line-strong bg-paper font-serif text-[15px] text-ink">
                      {step.number}
                    </span>
                    <span className="h-px flex-1 bg-line md:hidden" />
                  </div>
                  <h3 className="mt-4 text-[15.5px] font-semibold tracking-[-0.01em]">{step.title}</h3>
                  <p className="mt-1.5 max-w-xs text-[13.5px] leading-relaxed text-muted">{step.body}</p>
                  {index < steps.length - 1 ? (
                    <span className="absolute left-[54px] top-5 hidden h-px w-[calc(100%-54px)] bg-line md:block" />
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------ Security */}
        <section id="security" className="px-5 pb-20 sm:px-8 sm:pb-24">
          <div className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-[28px] bg-ink px-7 py-12 text-cream sm:px-12 sm:py-16">
            <div
              className="pointer-events-none absolute -right-16 -top-20 hidden h-80 w-80 rounded-full border border-cream/10 sm:block"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute -bottom-24 right-10 hidden h-56 w-56 rounded-full border border-cream/10 sm:block"
              aria-hidden="true"
            />

            <div className="relative grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#b9c6a8]">
                  Security, plainly
                </span>
                <h2 className="mt-3 max-w-md font-serif text-[clamp(2rem,4vw,2.85rem)] leading-[1.06] tracking-[-0.025em]">
                  Quiet on the surface. Careful underneath.
                </h2>
                <p className="mt-4 max-w-sm text-[14.5px] leading-relaxed text-cream/70">
                  Secrets are encrypted on the server before storage, kept out of list
                  responses, and only decrypted when you explicitly ask for one.
                </p>
              </div>

              <ul className="grid gap-3.5 sm:grid-cols-2 lg:pt-2">
                {[
                  "AES-256-GCM with authenticated, per-field binding",
                  "Passwords hashed with bcrypt, cost factor 12",
                  "Signed, HttpOnly session cookies",
                  "Single-use reset links that expire",
                  "Secrets masked in every list and search response",
                  "Every query scoped to the signed-in owner"
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 rounded-xl border border-cream/10 bg-cream/[0.04] px-3.5 py-3"
                  >
                    <ShieldCheck
                      className="mt-0.5 h-4 w-4 shrink-0 text-[#b9c6a8]"
                      aria-hidden="true"
                    />
                    <span className="text-[12.5px] leading-snug text-cream/85">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------------------- CTA */}
        <section className="relative overflow-hidden border-t border-line py-20 sm:py-28">
          <div className="pointer-events-none absolute inset-0 opacity-40">
            <div className="dot-grid h-full w-full" />
          </div>
          <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center px-5 text-center sm:px-8">
            <FolderGlyph icon="key" color="olive" size="lg" />
            <h2 className="mt-6 font-serif text-[clamp(2.1rem,5vw,3.4rem)] leading-[1.03] tracking-[-0.03em]">
              Ready for a calmer password shelf?
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted">
              Start with one vault. Add a second when life gets complicated. Your
              future self will thank you.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <CtaAuthActions />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-paper/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-10 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2">
            <BrandLink />
            <p className="text-[12px] text-muted">
              A folders-and-columns password manager. Built with Next.js, Express and
              Supabase Postgres.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[12.5px] text-muted">
            <a className="transition-colors hover:text-ink" href="#features">
              Features
            </a>
            <a className="transition-colors hover:text-ink" href="#security">
              Security
            </a>
            <FooterAuthActions />
            <span className="text-faint">© <CopyrightYear /> Safekey</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
