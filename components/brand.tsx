import Link from "next/link";
import { cn } from "@/lib/format";

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-ink text-cream shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]",
        className
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-[19px] w-[19px]">
        <circle cx="12" cy="9.1" r="3.15" fill="currentColor" />
        <path
          d="M12 12.4v6.1"
          stroke="currentColor"
          strokeWidth="2.1"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <BrandMark />
      <span className="font-serif text-[22px] leading-none tracking-[-0.015em]">
        Safekey
      </span>
    </span>
  );
}

export function BrandLink({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex rounded-xl", className)} aria-label="Safekey home">
      <Wordmark />
    </Link>
  );
}
