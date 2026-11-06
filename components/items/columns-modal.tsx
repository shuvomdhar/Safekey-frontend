"use client";

import { useState, type FormEvent } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Lock,
  Pencil,
  Plus,
  Trash2,
  X
} from "lucide-react";
import { api, errorMessage } from "@/lib/api";
import { cn } from "@/lib/format";
import { COLUMN_TYPE_META, COLUMN_TYPES } from "@/lib/columns";
import type { Column, ColumnType, Folder } from "@/lib/types";
import { useToast } from "@/components/ui/toast";
import { Button, IconButton } from "@/components/ui/button";
import { Input, Select, Switch } from "@/components/ui/field";
import { ConfirmDialog, Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/misc";
import { FormError } from "@/components/auth/auth-bits";

const MAX_COLUMNS = 20;

type ColumnsModalProps = {
  open: boolean;
  onClose: () => void;
  folder: Folder;
  onChanged: () => Promise<void> | void;
};

export function ColumnsModal({ open, onClose, folder, onChanged }: ColumnsModalProps) {
  const toast = useToast();
  const columns = [...folder.columns].sort((a, b) => a.position - b.position);

  const [addName, setAddName] = useState("");
  const [addType, setAddType] = useState<ColumnType>("text");
  const [addSecret, setAddSecret] = useState(false);
  const [addRequired, setAddRequired] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<unknown>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState<ColumnType>("text");
  const [editSecret, setEditSecret] = useState(false);
  const [editRequired, setEditRequired] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState<unknown>(null);

  const [deleting, setDeleting] = useState<Column | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [ordering, setOrdering] = useState(false);

  function startEdit(column: Column) {
    setEditingId(column.id);
    setEditName(column.name);
    setEditType(column.type);
    setEditSecret(column.isSecret);
    setEditRequired(column.isRequired);
    setEditError(null);
  }

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAddError(null);

    if (!addName.trim()) {
      setAddError(new Error("Give this column a name first."));
      return;
    }

    setAdding(true);
    try {
      await api.post(`/api/folders/${folder.id}/columns`, {
        name: addName.trim(),
        type: addType,
        isSecret: addType === "password" ? true : addSecret,
        isRequired: addRequired
      });
      setAddName("");
      setAddType("text");
      setAddSecret(false);
      setAddRequired(false);
      toast.success("Column added.");
      await onChanged();
    } catch (error) {
      setAddError(error);
    } finally {
      setAdding(false);
    }
  }

  async function handleEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (editingId === null) return;
    setEditError(null);

    if (!editName.trim()) {
      setEditError(new Error("A column needs a name."));
      return;
    }

    setSavingEdit(true);
    try {
      await api.patch(`/api/columns/${editingId}`, {
        name: editName.trim(),
        type: editType,
        isSecret: editType === "password" ? true : editSecret,
        isRequired: editRequired
      });
      setEditingId(null);
      toast.success("Column updated.");
      await onChanged();
    } catch (error) {
      setEditError(error);
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await api.delete(`/api/columns/${deleting.id}`);
      setDeleting(null);
      toast.success("Column removed.");
      await onChanged();
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setDeleteBusy(false);
    }
  }

  async function move(index: number, direction: -1 | 1) {
    const next = [...columns];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;

    [next[index], next[target]] = [next[target], next[index]];

    setOrdering(true);
    try {
      await api.put(`/api/folders/${folder.id}/columns/order`, {
        ids: next.map((column) => column.id)
      });
      await onChanged();
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setOrdering(false);
    }
  }

  const canAdd = columns.length < MAX_COLUMNS;

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title="Manage columns"
        description="These are the fields every entry in this vault will have. Change them whenever you like."
        size="lg"
        footer={
          <Button variant="secondary" size="sm" onClick={onClose}>
            Done
          </Button>
        }
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            {columns.length === 0 ? (
              <p className="rounded-xl border border-dashed border-line-strong bg-paper/60 px-4 py-6 text-center text-[12.5px] text-muted">
                No columns yet. Add the first one below — a username, password or
                anything else you want to keep.
              </p>
            ) : (
              columns.map((column, index) => {
                const isEditing = editingId === column.id;

                if (isEditing) {
                  return (
                    <form
                      key={column.id}
                      onSubmit={handleEdit}
                      className="flex flex-col gap-3 rounded-xl border border-ink bg-paper p-3.5"
                    >
                      <FormError message={editError ? errorMessage(editError) : undefined} />

                      <div className="grid gap-3 sm:grid-cols-2">
                        <Input
                          label="Name"
                          value={editName}
                          onChange={(event) => setEditName(event.target.value)}
                          maxLength={40}
                          required
                          autoFocus
                        />
                        <Select
                          label="Type"
                          value={editType}
                          onChange={(event) => {
                            const nextType = event.target.value as ColumnType;
                            setEditType(nextType);
                            if (nextType === "password") setEditSecret(true);
                          }}
                        >
                          {COLUMN_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {COLUMN_TYPE_META[type].label}
                            </option>
                          ))}
                        </Select>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-2">
                        <Switch
                          checked={editType === "password" ? true : editSecret}
                          onChange={setEditSecret}
                          disabled={editType === "password"}
                          label="Secret field"
                          description={
                            editType === "password"
                              ? "Passwords are always secret."
                              : "Encrypted at rest and masked in tables."
                          }
                        />
                        <Switch
                          checked={editRequired}
                          onChange={setEditRequired}
                          label="Required"
                          description="Must be filled in for new entries."
                        />
                      </div>

                      {editSecret !== column.isSecret ? (
                        <p className="text-[11px] leading-relaxed text-[#8a4f38]">
                          Changing secrecy will{" "}
                          {editSecret ? "encrypt" : "decrypt"} every existing value in
                          this column.
                        </p>
                      ) : null}

                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingId(null)}
                        >
                          <X className="h-3.5 w-3.5" />
                          Cancel
                        </Button>
                        <Button type="submit" size="sm" loading={savingEdit}>
                          <Check className="h-3.5 w-3.5" />
                          Save column
                        </Button>
                      </div>
                    </form>
                  );
                }

                return (
                  <div
                    key={column.id}
                    className="flex items-center gap-2 rounded-xl border border-line bg-paper px-3 py-2.5"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="truncate text-[12.5px] font-semibold text-ink">
                          {column.name}
                        </p>
                        {column.isSecret ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-sage px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wide text-[#425130]">
                            <Lock className="h-2.5 w-2.5" aria-hidden="true" />
                            Secret
                          </span>
                        ) : null}
                        {column.isRequired ? <Badge tone="outline">Required</Badge> : null}
                      </div>
                      <p className="mt-0.5 text-[10.5px] text-faint">
                        {COLUMN_TYPE_META[column.type].label} ·{" "}
                        {COLUMN_TYPE_META[column.type].hint}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-0.5">
                      <IconButton
                        label={`Move ${column.name} up`}
                        onClick={() => void move(index, -1)}
                        disabled={index === 0 || ordering}
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </IconButton>
                      <IconButton
                        label={`Move ${column.name} down`}
                        onClick={() => void move(index, 1)}
                        disabled={index === columns.length - 1 || ordering}
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </IconButton>
                      <IconButton label={`Edit ${column.name}`} onClick={() => startEdit(column)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </IconButton>
                      <IconButton
                        label={`Delete ${column.name}`}
                        variant="danger"
                        onClick={() => setDeleting(column)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </IconButton>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="rounded-xl border border-line bg-cream-deep/40 p-4">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink text-cream">
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[12.5px] font-semibold text-ink">Add a column</p>
                <p className="text-[10.5px] text-faint">
                  {columns.length} of {MAX_COLUMNS} used
                </p>
              </div>
            </div>

            {canAdd ? (
              <form onSubmit={handleAdd} className="mt-3 flex flex-col gap-3">
                <FormError message={addError ? errorMessage(addError) : undefined} />

                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    label="Name"
                    placeholder="Recovery email, PIN, branch…"
                    value={addName}
                    onChange={(event) => setAddName(event.target.value)}
                    maxLength={40}
                  />
                  <Select
                    label="Type"
                    value={addType}
                    onChange={(event) => {
                      const nextType = event.target.value as ColumnType;
                      setAddType(nextType);
                      if (nextType === "password") setAddSecret(true);
                    }}
                  >
                    {COLUMN_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {COLUMN_TYPE_META[type].label}
                      </option>
                    ))}
                  </Select>
                </div>

                <p className="text-[11px] leading-relaxed text-faint">
                  {COLUMN_TYPE_META[addType].hint}
                </p>

                <div className="grid gap-2 sm:grid-cols-2">
                  <Switch
                    checked={addType === "password" ? true : addSecret}
                    onChange={setAddSecret}
                    disabled={addType === "password"}
                    label="Secret field"
                    description={
                      addType === "password"
                        ? "Passwords are always secret."
                        : "Encrypt values and mask them in tables."
                    }
                  />
                  <Switch
                    checked={addRequired}
                    onChange={setAddRequired}
                    label="Required"
                    description="Must be filled in for new entries."
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="submit" size="sm" loading={adding}>
                    <Plus className="h-3.5 w-3.5" />
                    Add column
                  </Button>
                </div>
              </form>
            ) : (
              <p className="mt-3 text-[12px] text-muted">
                This vault has reached {MAX_COLUMNS} columns. Remove one to add another.
              </p>
            )}
          </div>

          <p
            className={cn(
              "text-[11px] leading-relaxed text-faint",
              columns.length === 0 && "text-center"
            )}
          >
            Deleting a column also deletes the values stored in it for every entry.
          </p>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => void handleDelete()}
        title={`Delete “${deleting?.name ?? "column"}”?`}
        description="Every value stored in this column — across all entries in this vault — will be removed. This cannot be undone."
        confirmLabel="Delete column"
        loading={deleteBusy}
      />
    </>
  );
}
