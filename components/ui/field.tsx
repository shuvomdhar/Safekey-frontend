"use client";

import {
  forwardRef,
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes
} from "react";
import { Eye, EyeOff, ChevronDown } from "lucide-react";
import { cn } from "@/lib/format";

const controlBase =
  "w-full rounded-xl border bg-paper text-[14px] text-ink placeholder:text-faint transition-colors duration-150 hover:border-line-strong focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/15 disabled:cursor-not-allowed disabled:opacity-60";

type FieldShellProps = {
  label?: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  htmlFor?: string;
  className?: string;
  children: ReactNode;
};

export function FieldShell({
  label,
  hint,
  error,
  optional,
  htmlFor,
  className,
  children
}: FieldShellProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label ? (
        <div className="flex items-baseline justify-between gap-2">
          <label
            htmlFor={htmlFor}
            className="text-[11px] font-semibold uppercase tracking-[0.09em] text-muted"
          >
            {label}
          </label>
          {optional ? <span className="text-[11px] text-faint">Optional</span> : null}
        </div>
      ) : null}
      {children}
      {error ? (
        <p className="text-[12.5px] leading-snug text-[#9c3b2e]">{error}</p>
      ) : hint ? (
        <p className="text-[12.5px] leading-snug text-faint">{hint}</p>
      ) : null}
    </div>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  leading?: ReactNode;
  trailing?: ReactNode;
  wrapperClassName?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, optional, leading, trailing, className, wrapperClassName, id, ...props },
  ref
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const describedBy = error || hint ? `${inputId}-description` : undefined;

  return (
    <FieldShell
      label={label}
      hint={hint}
      error={error}
      optional={optional}
      htmlFor={inputId}
      className={wrapperClassName}
    >
      <div className="relative">
        {leading ? (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint">
            {leading}
          </span>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={cn(
            controlBase,
            "h-11 px-3.5",
            leading ? "pl-10" : null,
            trailing ? "pr-11" : null,
            error ? "border-[#c07a6b]" : "border-line",
            className
          )}
          {...props}
        />
        {trailing ? (
          <span className="absolute right-1.5 top-1/2 -translate-y-1/2">{trailing}</span>
        ) : null}
      </div>
    </FieldShell>
  );
});

type PasswordInputProps = Omit<InputProps, "type" | "trailing">;

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput(props, ref) {
    const [visible, setVisible] = useState(false);

    return (
      <Input
        ref={ref}
        {...props}
        type={visible ? "text" : "password"}
        trailing={
          <button
            type="button"
            onClick={() => setVisible((current) => !current)}
            aria-label={visible ? "Hide password" : "Show password"}
            title={visible ? "Hide password" : "Show password"}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-ink/[0.06] hover:text-ink"
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        }
      />
    );
  }
);

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
  error?: string;
  optional?: boolean;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, optional, className, id, ...props },
  ref
) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;

  return (
    <FieldShell
      label={label}
      hint={hint}
      error={error}
      optional={optional}
      htmlFor={textareaId}
    >
      <textarea
        ref={ref}
        id={textareaId}
        aria-invalid={Boolean(error)}
        className={cn(
          controlBase,
          "min-h-[92px] resize-y px-3.5 py-3 leading-relaxed",
          error ? "border-[#c07a6b]" : "border-line",
          className
        )}
        {...props}
      />
    </FieldShell>
  );
});

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  wrapperClassName?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, className, children, id, wrapperClassName, ...props },
  ref
) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <FieldShell
      label={label}
      hint={hint}
      error={error}
      htmlFor={selectId}
      className={wrapperClassName}
    >
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={cn(
            controlBase,
            "h-11 appearance-none pl-3.5 pr-10",
            error ? "border-[#c07a6b]" : "border-line",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
      </div>
    </FieldShell>
  );
});

export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-paper px-3.5 py-3 transition-colors",
        disabled ? "cursor-not-allowed opacity-60" : "hover:border-line-strong"
      )}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "mt-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors",
          checked ? "border-ink bg-ink" : "border-line-strong bg-cream-deep"
        )}
      >
        <span
          className={cn(
            "h-3.5 w-3.5 rounded-full bg-cream transition-transform",
            checked ? "translate-x-[18px]" : "translate-x-[3px]"
          )}
        />
      </button>
      <span className="flex flex-col gap-0.5">
        <span className="text-[13px] font-medium text-ink">{label}</span>
        {description ? (
          <span className="text-[12px] leading-snug text-muted">{description}</span>
        ) : null}
      </span>
    </label>
  );
}
