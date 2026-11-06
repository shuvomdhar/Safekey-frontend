import type { ComponentType, ReactNode } from "react";
import {
  Briefcase,
  Building2,
  Camera,
  Cloud,
  Code2,
  Folder,
  Gamepad2,
  Globe2,
  KeyRound,
  Lock,
  Mail,
  UserRound
} from "lucide-react";
import { cn, FOLDER_COLOR_STYLES } from "@/lib/format";
import type { FolderColor, FolderIcon } from "@/lib/types";

const ICONS: Record<FolderIcon, ComponentType<{ className?: string }>> = {
  folder: Folder,
  key: KeyRound,
  globe: Globe2,
  bank: Building2,
  briefcase: Briefcase,
  user: UserRound,
  cloud: Cloud,
  gamepad: Gamepad2,
  mail: Mail,
  lock: Lock,
  code: Code2,
  camera: Camera
};

export function FolderGlyph({
  icon,
  color,
  size = "md",
  className
}: {
  icon: FolderIcon;
  color: FolderColor;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const Icon = ICONS[icon] ?? Folder;
  const styles = FOLDER_COLOR_STYLES[color] ?? FOLDER_COLOR_STYLES.olive;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]",
        styles.tile,
        size === "sm" && "h-8 w-8 rounded-lg",
        size === "md" && "h-11 w-11",
        size === "lg" && "h-14 w-14 rounded-2xl",
        className
      )}
      aria-hidden="true"
    >
      <Icon
        className={cn(
          size === "sm" && "h-4 w-4",
          size === "md" && "h-[19px] w-[19px]",
          size === "lg" && "h-6 w-6"
        )}
      />
    </span>
  );
}

export function Badge({
  children,
  tone = "neutral",
  className
}: {
  children: ReactNode;
  tone?: "neutral" | "sage" | "clay" | "outline" | "dark";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.06em]",
        tone === "neutral" && "bg-ink/[0.06] text-ink-soft",
        tone === "sage" && "bg-sage text-[#425130]",
        tone === "clay" && "bg-clay-soft text-[#8a4f38]",
        tone === "outline" && "border border-line-strong text-muted",
        tone === "dark" && "bg-ink text-cream",
        className
      )}
    >
      {children}
    </span>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        "inline-block h-5 w-5 animate-spin rounded-full border-2 border-ink/20 border-t-ink",
        className
      )}
    />
  );
}

export function PageLoader({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-muted">
      <Spinner />
      <span className="text-[13px]">{label}…</span>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-line-strong bg-paper/60 px-6 py-14 text-center",
        className
      )}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-ink/[0.06] text-ink-soft">
        {icon}
      </div>
      <h3 className="font-serif text-[20px] tracking-[-0.01em]">{title}</h3>
      <p className="mt-1.5 max-w-sm text-[13.5px] leading-relaxed text-muted">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-faint">
      {children}
    </span>
  );
}
