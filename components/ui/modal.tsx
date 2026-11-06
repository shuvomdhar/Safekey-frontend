"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/format";
import { Button, IconButton } from "./button";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  variant?: "center" | "drawer";
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  variant = "center",
  size = "md",
  className
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // React 19 portals need the client mount flag before document.body exists.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl"
  };

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-50 flex",
        variant === "center" ? "items-center justify-center p-4" : "justify-end"
      )}
    >
      <div
        className="absolute inset-0 bg-[#1d211a]/40 backdrop-blur-[2px] animate-fade"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "relative z-10 flex flex-col border border-line bg-cream shadow-lift",
          variant === "center"
            ? cn("max-h-[calc(100vh-2rem)] w-full rounded-[22px] animate-rise", sizes[size])
            : "h-full w-full max-w-xl animate-slide-in rounded-l-[22px]",
          className
        )}
      >
        {title ? (
          <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6 sm:py-5">
            <div className="flex flex-col gap-1">
              <h2 className="font-serif text-[21px] leading-tight tracking-[-0.01em]">{title}</h2>
              {description ? (
                <p className="text-[13px] leading-snug text-muted">{description}</p>
              ) : null}
            </div>
            <IconButton label="Close" onClick={onClose} className="-mr-1 -mt-0.5 shrink-0">
              <X className="h-4 w-4" />
            </IconButton>
          </div>
        ) : null}

        <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {children}
        </div>

        {footer ? (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line bg-paper/60 px-5 py-4 sm:px-6">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body
  );
}

type ConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "default";
  loading?: boolean;
  children?: ReactNode;
};

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  tone = "danger",
  loading,
  children
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={tone === "danger" ? "danger" : "primary"}
            size="sm"
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-[13.5px] leading-relaxed text-ink-soft">{description}</p>
        {children}
      </div>
    </Modal>
  );
}
