"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ChevronRight,
  Columns3,
  KeyRound,
  Lock,
  Pencil,
  Plus,
  Search,
  Trash2
} from "lucide-react";
import { api, errorMessage } from "@/lib/api";
import { relativeTime } from "@/lib/format";
import type { Folder, Item } from "@/lib/types";
import { Button, IconButton } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { EmptyState, FolderGlyph } from "@/components/ui/misc";
import { ConfirmDialog } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { EntryDrawer } from "@/components/items/entry-drawer";
import { ColumnsModal } from "@/components/items/columns-modal";
import { RevealSecret } from "@/components/items/reveal-secret";
import { FolderFormModal } from "@/components/folders/folder-form-modal";

export default function FolderPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();

  const rawId = (params as { id?: string | string[] }).id;
  const folderId = Array.isArray(rawId) ? rawId[0] : rawId ?? "";

  const [folder, setFolder] = useState<Folder | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [entryOpen, setEntryOpen] = useState(false);
  const [selected, setSelected] = useState<Item | null>(null);
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    if (!folderId) return;

    try {
      const [folderData, itemsData] = await Promise.all([
        api.get<{ folder: Folder }>(`/api/folders/${folderId}`),
        api.get<{ items: Item[] }>(`/api/folders/${folderId}/items`)
      ]);
      setFolder(folderData.folder);
      setItems(itemsData.items);
      setError(null);
    } catch (loadError) {
      setError(errorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, [folderId]);

  useEffect(() => {
    // Data loading is an external-system sync; state updates happen after the fetch resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  useEffect(() => {
    // Global search links open this vault with `?q=` so the matching entry is
    // visible straight away. Reading `window` avoids a Suspense boundary.
    const initial = new URLSearchParams(window.location.search).get("q");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (initial) setQuery(initial);
  }, []);

  const columns = useMemo(
    () => (folder ? [...folder.columns].sort((a, b) => a.position - b.position) : []),
    [folder]
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return items;

    return items.filter((item) => {
      const haystack = [
        item.title,
        item.notes ?? "",
        ...item.values.filter((value) => value.value).map((value) => value.value as string)
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [items, query]);

  function openEntry(item: Item | null) {
    setSelected(item);
    setEntryOpen(true);
  }

  function handleSaved(saved: Item) {
    const exists = items.some((item) => item.id === saved.id);

    setItems((current) =>
      exists ? current.map((item) => (item.id === saved.id ? saved : item)) : [saved, ...current]
    );
    setFolder((current) =>
      current
        ? {
            ...current,
            itemCount: current.itemCount + (exists ? 0 : 1),
            updatedAt: saved.updatedAt
          }
        : current
    );
    setSelected(saved);
  }

  function handleDeleted(itemId: number) {
    setItems((current) => current.filter((item) => item.id !== itemId));
    setFolder((current) =>
      current ? { ...current, itemCount: Math.max(0, current.itemCount - 1) } : current
    );
    setSelected(null);
  }

  async function handleDeleteFolder() {
    if (!folder) return;
    setDeleting(true);
    try {
      await api.delete(`/api/folders/${folder.id}`);
      toast.success("Vault deleted.");
      router.replace("/dashboard");
    } catch (deleteError) {
      toast.error(errorMessage(deleteError));
      setDeleting(false);
      setDeleteOpen(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-6xl animate-rise">
        <div className="skeleton h-3 w-24 rounded-md" />
        <div className="mt-6 flex items-center gap-4">
          <div className="skeleton h-14 w-14 rounded-2xl" />
          <div className="flex flex-col gap-2">
            <div className="skeleton h-7 w-52 rounded-md" />
            <div className="skeleton h-3 w-64 rounded-md" />
          </div>
        </div>
        <div className="skeleton mt-8 h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!folder || error) {
    return (
      <div className="mx-auto w-full max-w-2xl py-10">
        <div className="rounded-2xl border border-line bg-paper p-8 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-clay-soft text-[#8a4f38]">
            <AlertCircle className="h-5 w-5" aria-hidden="true" />
          </span>
          <h1 className="mt-4 font-serif text-[24px] tracking-[-0.02em]">
            We could not open this vault.
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-muted">
            {error ?? "It may have been deleted, or the link is not quite right."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link href="/dashboard">
              <Button variant="secondary" size="sm">
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to vaults
              </Button>
            </Link>
            <Button size="sm" onClick={() => void load()}>
              Try again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl animate-rise">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-[12px] font-medium text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        All vaults
      </Link>

      <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <FolderGlyph icon={folder.icon} color={folder.color} size="lg" className="mt-0.5" />
          <div className="min-w-0">
            <h1 className="truncate font-serif text-[clamp(1.9rem,4vw,2.7rem)] leading-[1.04] tracking-[-0.03em]">
              {folder.name}
            </h1>
            <p className="mt-1.5 max-w-xl text-[13.5px] leading-relaxed text-muted">
              {folder.description || "No description yet — just a quiet place for these accounts."}
            </p>
            <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-faint">
              <span>
                {folder.itemCount} {folder.itemCount === 1 ? "entry" : "entries"}
              </span>
              <span>
                {columns.length} {columns.length === 1 ? "column" : "columns"}
              </span>
              <span>Updated {relativeTime(folder.updatedAt)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={() => openEntry(null)}>
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            Add entry
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setColumnsOpen(true)}>
            <Columns3 className="h-3.5 w-3.5" aria-hidden="true" />
            Manage columns
          </Button>
          <IconButton
            label={`Edit ${folder.name}`}
            variant="secondary"
            onClick={() => setEditOpen(true)}
            className="h-9 w-9 border border-line bg-paper"
          >
            <Pencil className="h-3.5 w-3.5" />
          </IconButton>
          <IconButton
            label={`Delete ${folder.name}`}
            variant="danger"
            onClick={() => setDeleteOpen(true)}
            className="h-9 w-9 border border-line bg-paper"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </IconButton>
        </div>
      </div>

      {columns.length === 0 ? (
        <div className="mt-6 flex flex-col items-start gap-3 rounded-xl border border-dashed border-line-strong bg-paper/60 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12.5px] leading-relaxed text-muted">
            This vault has no columns yet, so entries can only hold a title. Add a
            username, password or any field you need.
          </p>
          <Button variant="secondary" size="sm" onClick={() => setColumnsOpen(true)}>
            Add columns
          </Button>
        </div>
      ) : null}

      {items.length === 0 ? (
        <EmptyState
          className="mt-8"
          icon={<KeyRound className="h-5 w-5" />}
          title="This vault is ready for its first entry."
          description={`Add an account and fill in the ${columns.length} ${
            columns.length === 1 ? "field" : "fields"
          } you set up. Secrets stay masked until you ask for them.`}
          action={
            <Button onClick={() => openEntry(null)}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add your first entry
            </Button>
          }
        />
      ) : (
        <div className="mt-7 overflow-hidden rounded-2xl border border-line bg-paper">
          <div className="flex flex-col gap-3 border-b border-line px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="w-full sm:max-w-xs">
              <Input
                aria-label="Search entries"
                placeholder="Search this vault…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                leading={<Search className="h-3.5 w-3.5" />}
                className="h-9 border-transparent bg-cream-deep/70 text-[12.5px]"
              />
            </div>
            <p className="text-[11px] text-faint">
              {filtered.length} of {items.length} {items.length === 1 ? "entry" : "entries"}
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="font-serif text-[19px]">No entries match that search.</p>
              <p className="mt-1 text-[12.5px] text-muted">
                Try a title, a note, or a value from a visible field.
              </p>
              <Button variant="secondary" size="sm" className="mt-4" onClick={() => setQuery("")}>
                Clear search
              </Button>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-line bg-cream-deep/30">
                      <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-faint">
                        Entry
                      </th>
                      {columns.map((column) => (
                        <th
                          key={column.id}
                          className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-faint"
                        >
                          <span className="inline-flex items-center gap-1">
                            {column.name}
                            {column.isSecret ? (
                              <Lock className="h-2.5 w-2.5" aria-label="Secret field" />
                            ) : null}
                          </span>
                        </th>
                      ))}
                      <th className="w-10 px-2 py-2.5">
                        <span className="sr-only">Open</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((item) => (
                      <tr
                        key={item.id}
                        onClick={() => openEntry(item)}
                        className="group cursor-pointer border-b border-line/70 transition-colors last:border-b-0 hover:bg-cream-deep/30"
                      >
                        <td className="max-w-[260px] px-4 py-3">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              openEntry(item);
                            }}
                            className="block max-w-full truncate text-left text-[13px] font-semibold text-ink underline-offset-4 hover:underline"
                          >
                            {item.title}
                          </button>
                          {item.notes ? (
                            <p className="mt-0.5 truncate text-[10.5px] text-faint">{item.notes}</p>
                          ) : null}
                        </td>

                        {columns.map((column) => {
                          const value = item.values.find(
                            (entry) => entry.columnId === column.id
                          );

                          return (
                            <td key={column.id} className="max-w-[220px] px-4 py-3">
                              {column.isSecret ? (
                                <RevealSecret
                                  itemId={item.id}
                                  columnId={column.id}
                                  label={column.name}
                                  isSecret
                                  hasValue={Boolean(value?.hasValue)}
                                />
                              ) : value?.hasValue ? (
                                <span className="block truncate text-[12.5px] text-ink-soft">
                                  {value.value}
                                </span>
                              ) : (
                                <span className="text-[12px] text-faint">—</span>
                              )}
                            </td>
                          );
                        })}

                        <td className="px-2 py-3">
                          <ChevronRight
                            className="h-4 w-4 text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-ink"
                            aria-hidden="true"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-line md:hidden">
                {filtered.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => openEntry(item)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-cream-deep/30"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-ink">{item.title}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] text-faint">
                        {columns.slice(0, 2).map((column) => {
                          const value = item.values.find(
                            (entry) => entry.columnId === column.id
                          );
                          return (
                            <span key={column.id} className="inline-flex items-center gap-1">
                              <span className="text-muted">{column.name}:</span>
                              {column.isSecret ? (
                                <span className="inline-flex items-center gap-1">
                                  <Lock className="h-2.5 w-2.5" />
                                  {value?.hasValue ? "Locked" : "—"}
                                </span>
                              ) : (
                                <span className="max-w-[130px] truncate">
                                  {value?.hasValue ? value.value : "—"}
                                </span>
                              )}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-faint" aria-hidden="true" />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <EntryDrawer
        open={entryOpen}
        onClose={() => {
          setEntryOpen(false);
          setSelected(null);
        }}
        folderId={folder.id}
        folderName={folder.name}
        columns={columns}
        item={selected}
        onSaved={handleSaved}
        onDeleted={handleDeleted}
      />

      <ColumnsModal
        open={columnsOpen}
        onClose={() => setColumnsOpen(false)}
        folder={folder}
        onChanged={load}
      />

      <FolderFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        folder={folder}
        onSaved={(updated) => {
          setFolder((current) =>
            current ? { ...current, ...updated, columns: current.columns } : updated
          );
          setEditOpen(false);
        }}
      />

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => void handleDeleteFolder()}
        title={`Delete “${folder.name}”?`}
        description={`This permanently removes the vault, its ${folder.itemCount} ${
          folder.itemCount === 1 ? "entry" : "entries"
        } and all ${columns.length} ${columns.length === 1 ? "column" : "columns"}. This cannot be undone.`}
        confirmLabel="Delete vault"
        loading={deleting}
      />
    </div>
  );
}
