"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Lock, Trash2 } from "lucide-react";
import { api, errorMessage } from "@/lib/api";
import { cn, formatDate, relativeTime } from "@/lib/format";
import { inputTypeFor } from "@/lib/columns";
import type { Column, Item } from "@/lib/types";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input, PasswordInput, Textarea } from "@/components/ui/field";
import { ConfirmDialog, Modal } from "@/components/ui/modal";
import { SectionLabel } from "@/components/ui/misc";
import { FormError } from "@/components/auth/auth-bits";
import { CopyText, RevealSecret } from "./reveal-secret";

type EntryDrawerProps = {
  open: boolean;
  onClose: () => void;
  folderId: number;
  folderName: string;
  columns: Column[];
  item: Item | null;
  onSaved: (item: Item) => void;
  onDeleted: (itemId: number) => void;
};

export function EntryDrawer({
  open,
  onClose,
  folderId,
  folderName,
  columns,
  item,
  onSaved,
  onDeleted
}: EntryDrawerProps) {
  const toast = useToast();

  const [current, setCurrent] = useState<Item | null>(item);
  const [mode, setMode] = useState<"view" | "edit">(item ? "view" : "edit");
  const [title, setTitle] = useState(item?.title ?? "");
  const [notes, setNotes] = useState(item?.notes ?? "");
  const [values, setValues] = useState<Record<string, string>>({});
  const [secretValues, setSecretValues] = useState<Record<string, string>>({});
  const [error, setError] = useState<unknown>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!open) return;

    // Reset the drawer to the selected entry whenever it opens.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrent(item);
    setMode(item ? "view" : "edit");
    setTitle(item?.title ?? "");
    setNotes(item?.notes ?? "");
    setSecretValues({});
    setError(null);
    setConfirmDelete(false);

    const nextValues: Record<string, string> = {};
    for (const column of columns) {
      if (!column.isSecret) {
        const stored = item?.values.find((value) => value.columnId === column.id);
        nextValues[column.id] = stored?.value ?? "";
      }
    }
    setValues(nextValues);
  }, [open, item, columns]);

  function hasStoredValue(columnId: number): boolean {
    return Boolean(current?.values.find((value) => value.columnId === columnId)?.hasValue);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError(new Error("Give this entry a title first."));
      return;
    }

    for (const column of columns) {
      if (!column.isRequired) continue;

      const filled = column.isSecret
        ? Boolean(secretValues[column.id]?.trim()) || hasStoredValue(column.id)
        : Boolean(values[column.id]?.trim());

      if (!filled) {
        setError(new Error(`“${column.name}” is required.`));
        return;
      }
    }

    const payloadValues: Record<string, string> = {};
    for (const column of columns) {
      if (column.isSecret) {
        const next = secretValues[column.id];
        if (next !== undefined && next.trim() !== "") {
          payloadValues[column.id] = next;
        }
      } else {
        payloadValues[column.id] = values[column.id] ?? "";
      }
    }

    setSubmitting(true);
    try {
      if (current) {
        const data = await api.patch<{ item: Item }>(`/api/items/${current.id}`, {
          title: title.trim(),
          notes: notes.trim() ? notes : null,
          values: payloadValues
        });
        setCurrent(data.item);
        setMode("view");
        onSaved(data.item);
        toast.success("Entry updated.");
      } else {
        const data = await api.post<{ item: Item }>(`/api/folders/${folderId}/items`, {
          title: title.trim(),
          notes: notes.trim() ? notes : null,
          values: payloadValues
        });
        onSaved(data.item);
        toast.success("Entry saved.");
        onClose();
      }
    } catch (submitError) {
      setError(submitError);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!current) return;
    setDeleting(true);
    try {
      await api.delete(`/api/items/${current.id}`);
      toast.success("Entry deleted.");
      onDeleted(current.id);
      onClose();
    } catch (deleteError) {
      toast.error(errorMessage(deleteError));
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  const displayed = current ?? item;
  const editing = mode === "edit";

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        variant="drawer"
        title={editing ? (displayed ? "Edit entry" : "New entry") : displayed?.title ?? "Entry"}
        description={editing ? undefined : folderName}
        footer={
          editing ? (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => (displayed ? setMode("view") : onClose())}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button size="sm" type="submit" form="entry-form" loading={submitting}>
                {displayed ? "Save changes" : "Save entry"}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="mr-auto text-[#9c3b2e] hover:bg-[#9c3b2e]/10"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                Delete
              </Button>
              <Button variant="secondary" size="sm" onClick={onClose}>
                Close
              </Button>
              <Button size="sm" onClick={() => setMode("edit")}>
                Edit entry
              </Button>
            </>
          )
        }
      >
        {editing ? (
          <form id="entry-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
            <FormError message={error ? errorMessage(error) : undefined} />

            <Input
              label="Title"
              placeholder="e.g. Instagram — personal"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={120}
              required
              autoFocus
            />

            {columns.length === 0 ? (
              <p className="rounded-xl border border-dashed border-line-strong bg-paper/60 px-4 py-3 text-[12.5px] leading-relaxed text-muted">
                This vault has no columns yet. You can still save a titled entry, or
                add fields with <strong className="font-semibold">Manage columns</strong>.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {columns.map((column) => {
                  const stored = hasStoredValue(column.id);

                  if (column.isSecret) {
                    return (
                      <PasswordInput
                        key={column.id}
                        wrapperClassName={cn(column.type === "note" && "sm:col-span-2")}
                        label={column.name}
                        hint={
                          stored
                            ? "Leave blank to keep the current secret."
                            : column.isRequired
                              ? "Required"
                              : undefined
                        }
                        placeholder={stored ? "•••••••• (kept unless changed)" : "Add a secret"}
                        value={secretValues[column.id] ?? ""}
                        onChange={(event) =>
                          setSecretValues((current) => ({
                            ...current,
                            [column.id]: event.target.value
                          }))
                        }
                        autoComplete="off"
                        spellCheck={false}
                      />
                    );
                  }

                  if (column.type === "note") {
                    return (
                      <Textarea
                        key={column.id}
                        label={column.name}
                        hint={column.isRequired ? "Required" : undefined}
                        placeholder="Anything worth remembering."
                        value={values[column.id] ?? ""}
                        onChange={(event) =>
                          setValues((current) => ({
                            ...current,
                            [column.id]: event.target.value
                          }))
                        }
                        rows={3}
                        className="sm:col-span-2"
                      />
                    );
                  }

                  return (
                    <Input
                      key={column.id}
                      label={column.name}
                      hint={column.isRequired ? "Required" : undefined}
                      type={inputTypeFor(column.type)}
                      placeholder={column.name}
                      value={values[column.id] ?? ""}
                      onChange={(event) =>
                        setValues((current) => ({
                          ...current,
                          [column.id]: event.target.value
                        }))
                      }
                      autoComplete="off"
                      spellCheck={column.type === "text"}
                    />
                  );
                })}
              </div>
            )}

            <Textarea
              label="Notes"
              hint="Free-form notes for this entry."
              placeholder="Recovery email, security questions, anything else."
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              maxLength={5000}
            />
          </form>
        ) : displayed ? (
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-line bg-paper px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted">
                {columns.length} {columns.length === 1 ? "field" : "fields"}
              </span>
              <span className="text-[11.5px] text-faint">
                Updated {relativeTime(displayed.updatedAt)}
              </span>
            </div>

            {displayed.notes ? (
              <section>
                <SectionLabel>Notes</SectionLabel>
                <p className="mt-2 whitespace-pre-wrap text-[13.5px] leading-relaxed text-ink-soft">
                  {displayed.notes}
                </p>
              </section>
            ) : null}

            {columns.length === 0 ? (
              <p className="rounded-xl border border-dashed border-line-strong bg-paper/60 px-4 py-3 text-[12.5px] text-muted">
                This vault has no columns yet. Use “Manage columns” to add the fields
                you want to keep here.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {columns.map((column) => {
                  const stored = displayed.values.find(
                    (value) => value.columnId === column.id
                  );
                  const hasValue = Boolean(stored?.hasValue);
                  const spanBoth = column.type === "note" || column.type === "url";

                  return (
                    <div
                      key={column.id}
                      className={cn("flex min-w-0 flex-col gap-1.5", spanBoth && "sm:col-span-2")}
                    >
                      <span className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.09em] text-muted">
                        {column.name}
                        {column.isSecret ? (
                          <Lock className="h-3 w-3 text-faint" aria-label="Secret" />
                        ) : null}
                      </span>

                      {column.isSecret ? (
                        <RevealSecret
                          variant="field"
                          itemId={displayed.id}
                          columnId={column.id}
                          label={column.name}
                          isSecret
                          hasValue={hasValue}
                        />
                      ) : hasValue ? (
                        <div className="flex min-h-[44px] items-center gap-2 rounded-xl border border-line bg-paper px-3.5 py-2.5">
                          <span className="min-w-0 flex-1 break-all text-[13.5px] text-ink">
                            {column.type === "url" ? (
                              <a
                                href={stored?.value ?? "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline decoration-line-strong underline-offset-4 hover:decoration-ink"
                              >
                                {stored?.value}
                              </a>
                            ) : column.type === "email" ? (
                              <a
                                href={`mailto:${stored?.value}`}
                                className="underline decoration-line-strong underline-offset-4 hover:decoration-ink"
                              >
                                {stored?.value}
                              </a>
                            ) : (
                              stored?.value
                            )}
                          </span>
                          <CopyText text={stored?.value ?? ""} label={column.name} />
                        </div>
                      ) : (
                        <div className="flex min-h-[44px] items-center rounded-xl border border-dashed border-line px-3.5 py-2.5 text-[13px] text-faint">
                          —
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-auto flex flex-wrap gap-x-5 gap-y-1 border-t border-line pt-4 text-[11px] text-faint">
              <span>Created {formatDate(displayed.createdAt)}</span>
              <span>Updated {formatDate(displayed.updatedAt)}</span>
            </div>
          </div>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => void handleDelete()}
        title="Delete this entry?"
        description={`“${displayed?.title ?? "This entry"}” and every value inside it will be removed permanently. This cannot be undone.`}
        confirmLabel="Delete entry"
        loading={deleting}
      />
    </>
  );
}
