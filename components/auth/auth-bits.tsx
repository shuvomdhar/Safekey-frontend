import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";

export function AuthHeading({
  title,
  subtitle
}: {
  title: string;
  subtitle: ReactNode;
}) {
  return (
    <div className="mb-7">
      <h1 className="font-serif text-[clamp(1.9rem,4vw,2.45rem)] leading-[1.06] tracking-[-0.025em] text-ink">
        {title}
      </h1>
      <p className="mt-2.5 text-[14px] leading-relaxed text-muted">{subtitle}</p>
    </div>
  );
}

export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-xl border border-[#e0bdb3] bg-[#fbeee9] px-3.5 py-3 text-[13px] leading-snug text-[#7a2b21]"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
