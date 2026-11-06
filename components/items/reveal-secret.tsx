"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy, Eye, EyeOff, Loader2 } from "lucide-react";
import { api, errorMessage } from "@/lib/api";
import { copyToClipboard } from "@/lib/clipboard";
import { cn } from "@/lib/format";
import { useToast } from "@/components/ui/toast";

const HIDE_AFTER_MS = 20_000;

type RevealSecretProps = {
  itemId: number;
  columnId: number;
  label: string;
  isSecret: boolean;
  hasValue: boolean;
  variant?: "inline" | "field";
  className?: string;
};

export function RevealSecret({
  itemId,
  columnId,
  label,
  isSecret,
  hasValue,
  variant = "inline",
  className
}: RevealSecretProps) {
  const toast = useToast();
  const [value, setValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    if (copiedTimer.current) {
      clearTimeout(copiedTimer.current);
      copiedTimer.current = null;
    }
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  async function fetchValue(store: boolean): Promise<string | null> {
    setLoading(true);
    try {
      const data = await api.get<{ value: string }>(
        `/api/items/${itemId}/reveal/${columnId}`
      );

      if (store) {
        setValue(data.value);
        if (isSecret) {
          if (hideTimer.current) clearTimeout(hideTimer.current);
          hideTimer.current = setTimeout(() => setValue(null), HIDE_AFTER_MS);
        }
      }

      return data.value;
    } catch (error) {
      toast.error(errorMessage(error));
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function toggle(event: React.MouseEvent) {
    event.stopPropagation();
    if (value !== null) {
      setValue(null);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      return;
    }
    await fetchValue(true);
  }

  async function copy(event: React.MouseEvent) {
    event.stopPropagation();
    const text = value ?? (await fetchValue(false));
    if (text === null) return;

    const ok = await copyToClipboard(text);
    if (!ok) {
      toast.error("Your browser would not let us copy. Reveal and select it instead.");
      return;
    }

    setCopied(true);
    toast.success(`${label} copied.`);
    if (copiedTimer.current) clearTimeout(copiedTimer.current);
    copiedTimer.current = setTimeout(() => setCopied(false), 1600);
  }

  if (!hasValue) {
    return <span className={cn("text-faint", className)}>—</span>;
  }

  const revealed = value !== null;

  const buttons = (
    <span className="flex shrink-0 items-center gap-0.5">
      <button
        type="button"
        onClick={copy}
        aria-label={`Copy ${label}`}
        title={`Copy ${label}`}
        className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted transition-colors hover:bg-ink/[0.07] hover:text-ink"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
      <button
        type="button"
        onClick={toggle}
        aria-label={revealed ? `Hide ${label}` : `Reveal ${label}`}
        title={revealed ? `Hide ${label}` : `Reveal ${label}`}
        className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted transition-colors hover:bg-ink/[0.07] hover:text-ink"
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : revealed ? (
          <EyeOff className="h-3.5 w-3.5" />
        ) : (
          <Eye className="h-3.5 w-3.5" />
        )}
      </button>
    </span>
  );

  if (variant === "field") {
    return (
      <div
        className={cn(
          "flex min-h-[44px] items-center gap-2 rounded-xl border border-line bg-paper px-3.5 py-2.5",
          className
        )}
      >
        <span className="min-w-0 flex-1">
          {revealed ? (
            <span className="break-all font-mono text-[13.5px] leading-relaxed text-ink">
              {value}
            </span>
          ) : (
            <span className="select-none font-mono text-[13.5px] tracking-[0.22em] text-ink-soft">
              ••••••••
            </span>
          )}
        </span>
        {buttons}
      </div>
    );
  }

  return (
    <span className={cn("inline-flex max-w-full items-center gap-1", className)}>
      {revealed ? (
        <span className="max-w-[200px] truncate font-mono text-[12px] text-ink">{value}</span>
      ) : (
        <span className="select-none font-mono text-[11.5px] tracking-[0.14em] text-ink-soft">
          ••••••
        </span>
      )}
      {buttons}
    </span>
  );
}

export function CopyText({
  text,
  label,
  className
}: {
  text: string;
  label: string;
  className?: string;
}) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  async function handleCopy(event: React.MouseEvent) {
    event.stopPropagation();
    const ok = await copyToClipboard(text);
    if (!ok) {
      toast.error("Your browser would not let us copy this.");
      return;
    }
    setCopied(true);
    toast.success(`${label} copied.`);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={`Copy ${label}`}
      title={`Copy ${label}`}
      className={cn(
        "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-ink/[0.07] hover:text-ink",
        className
      )}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}
