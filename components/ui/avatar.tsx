import { cn, initials } from "@/lib/format";

const SIZES = {
  sm: "h-8 w-8 text-[11px]",
  md: "h-9 w-9 text-[12px]",
  lg: "h-14 w-14 text-[17px]"
};

export function Avatar({
  name,
  email,
  size = "md",
  className
}: {
  name: string | null;
  email: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border border-line bg-sage font-semibold tracking-wide text-[#425130]",
        SIZES[size],
        className
      )}
    >
      {initials(name, email)}
    </span>
  );
}
