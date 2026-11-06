"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Check } from "lucide-react";
import { api, errorMessage, fieldError } from "@/lib/api";
import {
  cn,
  FOLDER_COLORS,
  FOLDER_COLOR_LABELS,
  FOLDER_COLOR_STYLES,
  FOLDER_ICONS,
  FOLDER_ICON_LABELS
} from "@/lib/format";
import type { Folder, FolderColor, FolderIcon, TemplateKey } from "@/lib/types";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { FolderGlyph } from "@/components/ui/misc";
import { FormError } from "@/components/auth/auth-bits";

const TEMPLATES: Array<{
  value: TemplateKey;
  label: string;
  description: string;
  fields: string;
}> = [
  {
    value: "login",
    label: "Website login",
    description: "The classic trio",
    fields: "Username · Password · Website"
  },
  {
    value: "social",
    label: "Social accounts",
    description: "Many accounts, one platform",
    fields: "Username · Email · Password · Recovery · 2FA"
  },
  {
    value: "api",
    label: "API & developer keys",
    description: "Keys and environments",
    fields: "API key · Environment · Docs · Expiry"
  },
  {
    value: "banking",
    label: "Banking & cards",
    description: "Numbers and PINs",
    fields: "Holder · Account no. · PIN · Routing"
  },
  {
    value: "identity",
    label: "Identity documents",
    description: "Passports and licences",
    fields: "Name · Document no. · Issued · Expires"
  },
  {
    value: "blank",
    label: "Blank vault",
    description: "Start from nothing",
    fields: "Add your own columns"
  }
];

type FolderFormModalProps = {
  open: boolean;
  onClose: () => void;
  onSaved: (folder: Folder) => void;
  folder?: Folder | null;
  defaultTemplate?: TemplateKey;
};

export function FolderFormModal({
  open,
  onClose,
  onSaved,
  folder,
  defaultTemplate = "login"
}: FolderFormModalProps) {
  const toast = useToast();
  const editing = Boolean(folder);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState<FolderColor>("olive");
  const [icon, setIcon] = useState<FolderIcon>("folder");
  const [template, setTemplate] = useState<TemplateKey>("login");
  const [error, setError] = useState<unknown>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    // Repopulate the form each time the dialog opens for a different vault.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setName(folder?.name ?? "");
    setDescription(folder?.description ?? "");
    setColor(folder?.color ?? "olive");
    setIcon(folder?.icon ?? "folder");
    setTemplate(defaultTemplate);
    setError(null);
  }, [open, folder, defaultTemplate]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError(new Error("Give this vault a name first."));
      return;
    }

    setSubmitting(true);
    try {
      if (folder) {
        const data = await api.patch<{ folder: Folder }>(`/api/folders/${folder.id}`, {
          name: name.trim(),
          description: description.trim() || null,
          color,
          icon
        });
        toast.success("Vault updated.");
        onSaved(data.folder);
      } else {
        const data = await api.post<{ folder: Folder }>("/api/folders", {
          name: name.trim(),
          description: description.trim() || null,
          color,
          icon,
          template
        });
        toast.success("Vault created. Add your first entry whenever you are ready.");
        onSaved(data.folder);
      }
      onClose();
    } catch (submitError) {
      setError(submitError);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Edit vault" : "New vault"}
      description={
        editing
          ? "Rename it, give it a different colour, or change the icon."
          : "Think of a vault as a shelf for one part of your life."
      }
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button size="sm" form="folder-form" type="submit" loading={submitting}>
            {editing ? "Save changes" : "Create vault"}
          </Button>
        </>
      }
    >
      <form id="folder-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
        <FormError message={error ? errorMessage(error) : undefined} />

        <Input
          label="Vault name"
          placeholder="Instagram, Banking, Work…"
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={fieldError(error, "name")}
          maxLength={60}
          required
          autoFocus
        />

        <Textarea
          label="Description"
          placeholder="A short note about what lives in this vault."
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={240}
          optional
          rows={2}
        />

        {!editing ? (
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.09em] text-muted">
              Start from
            </span>
            <div className="grid gap-2 sm:grid-cols-2">
              {TEMPLATES.map((option) => {
                const selected = template === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setTemplate(option.value)}
                    aria-pressed={selected}
                    className={cn(
                      "relative flex flex-col gap-0.5 rounded-xl border px-3.5 py-3 text-left transition-colors",
                      selected
                        ? "border-ink bg-paper shadow-[inset_0_0_0_1px_rgba(49,55,43,0.9)]"
                        : "border-line bg-paper/60 hover:border-line-strong"
                    )}
                  >
                    {selected ? (
                      <span className="absolute right-2.5 top-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-ink text-cream">
                        <Check className="h-2.5 w-2.5" aria-hidden="true" />
                      </span>
                    ) : null}
                    <span className="pr-5 text-[12.5px] font-semibold text-ink">
                      {option.label}
                    </span>
                    <span className="text-[11px] text-muted">{option.description}</span>
                    <span className="mt-1 text-[10px] leading-snug text-faint">
                      {option.fields}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.09em] text-muted">
            Colour
          </span>
          <div className="flex flex-wrap gap-2">
            {FOLDER_COLORS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setColor(option)}
                aria-label={FOLDER_COLOR_LABELS[option]}
                aria-pressed={color === option}
                title={FOLDER_COLOR_LABELS[option]}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full transition-transform",
                  FOLDER_COLOR_STYLES[option].swatch,
                  color === option
                    ? "ring-2 ring-ink ring-offset-2 ring-offset-cream"
                    : "hover:scale-105"
                )}
              >
                {color === option ? <Check className="h-3.5 w-3.5 text-ink/70" /> : null}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.09em] text-muted">
            Icon
          </span>
          <div className="grid grid-cols-6 gap-1.5">
            {FOLDER_ICONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setIcon(option)}
                aria-label={FOLDER_ICON_LABELS[option]}
                aria-pressed={icon === option}
                title={FOLDER_ICON_LABELS[option]}
                className={cn(
                  "flex h-9 items-center justify-center rounded-lg border transition-colors",
                  icon === option
                    ? "border-ink bg-paper shadow-[inset_0_0_0_1px_rgba(49,55,43,0.9)]"
                    : "border-transparent text-muted hover:border-line hover:bg-paper/70"
                )}
              >
                <FolderGlyph icon={option} color={icon === option ? color : "olive"} size="sm" />
              </button>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  );
}
