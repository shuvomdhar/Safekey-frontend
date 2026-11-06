import type { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/format";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "soft";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-ink text-cream hover:bg-ink-soft active:bg-ink border border-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]",
  secondary:
    "bg-paper text-ink border border-line-strong hover:bg-cream-deep active:bg-[#ece5d2]",
  ghost: "bg-transparent text-ink-soft border border-transparent hover:bg-ink/[0.06] hover:text-ink",
  danger:
    "bg-[#9c3b2e] text-[#fff8f4] border border-transparent hover:bg-[#8a3226] active:bg-[#7a2b21]",
  soft: "bg-ink/[0.06] text-ink border border-transparent hover:bg-ink/[0.1]"
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-[13px] gap-1.5 rounded-lg",
  md: "h-11 px-5 text-sm gap-2 rounded-xl",
  lg: "h-12 px-6 text-[15px] gap-2 rounded-xl"
};

export function buttonClasses(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(
    "inline-flex select-none items-center justify-center font-medium tracking-[-0.005em] transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50",
    variants[variant],
    sizes[size],
    className
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonClasses(variant, size, className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  variant?: "ghost" | "secondary" | "danger";
  size?: "sm" | "md";
};

export function IconButton({
  label,
  variant = "ghost",
  size = "sm",
  className,
  children,
  ...props
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex items-center justify-center rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        size === "sm" ? "h-8 w-8" : "h-10 w-10",
        variant === "ghost" && "text-muted hover:bg-ink/[0.06] hover:text-ink",
        variant === "secondary" && "border border-line bg-paper text-ink-soft hover:bg-cream-deep",
        variant === "danger" && "text-[#9c3b2e] hover:bg-[#9c3b2e]/10",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
