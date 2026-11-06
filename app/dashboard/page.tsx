"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ChevronRight, FolderPlus, Plus, Search, Sparkles } from "lucide-react";
import { api, errorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { greeting } from "@/lib/format";
import type { Folder, FolderSummary, SearchHit, TemplateKey } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { EmptyState, FolderGlyph } from "@/components/ui/misc";
import { FolderCard } from "@/components/folders/folder-card";
import { FolderFormModal } from "@/components/folders/folder-form-modal";

const QUICK_TEMPLATES: Array<{ template: TemplateKey; label: string; hint: string }> = [
  { template: "social", label: "Instagram & socials", hint: "Username, password, 2FA" },
  { template: "banking", label: "Banking", hint: "Account numbers and PINs" },
  { template: "api", label: "API keys", hint: "Keys, environments, docs" }
];

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [folders, setFolders] = useState<FolderSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<SearchHit[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [template, setTemplate] = useState<TemplateKey>("login");

  const load = useCallback(async () => {
    try {
      const data = await api.get<{ folders: FolderSummary[] }>("/api/folders");
      setFolders(data.folders);
      setError(null);
    } catch (loadError) {
      setError(errorMessage(loadError));
      setFolders([]);
    }
  }, []);

  useEffect(() => {
    // Data loading is an external-system sync; state updates happen after the fetch resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!folders) return [];
    const needle = query.trim().toLowerCase();
    if (!needle) return folders;

    return folders.filter((folder) => {
      const haystack = [folder.name, folder.description ?? "", ...folder.columnNames]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [folders, query]);

  // Search entries across every vault as well, debounced so typing stays smooth.
  useEffect(() => {
    const needle = query.trim();

    if (needle.length < 2) {
      setHits(null);
      setSearching(false);
      return;
    }

    const controller = new AbortController();
    setSearching(true);

    const timer = window.setTimeout(() => {
      api
        .get<{ items: SearchHit[] }>(
          `/api/search?q=${encodeURIComponent(needle)}&limit=20`,
          controller.signal
        )
        .then((data) => {
          if (!controller.signal.aborted) setHits(data.items);
        })
        .catch(() => {
          if (!controller.signal.aborted) setHits([]);
        })
        .finally(() => {
          if (!controller.signal.aborted) setSearching(false);
        });
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const totalEntries = folders?.reduce((sum, folder) => sum + folder.itemCount, 0) ?? 0;
  const firstName = user?.fullName?.trim().split(/\s+/)[0];

  function openCreate(withTemplate: TemplateKey = "login") {
    setTemplate(withTemplate);
    setCreateOpen(true);
  }

  return (
    <div className="mx-auto w-full max-w-6xl animate-rise">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7a8a5f]">
            Your workspace
          </p>
          <h1 className="mt-2 font-serif text-[clamp(1.95rem,4vw,2.9rem)] leading-[1.02] tracking-[-0.03em]">
            {greeting()}
            {firstName ? `, ${firstName}` : ""}.
          </h1>
          <p className="mt-2 text-[13px] text-muted">
            {folders === null
              ? "Opening your vaults…"
              : `${folders.length} ${folders.length === 1 ? "vault" : "vaults"} · ${totalEntries} ${
                  totalEntries === 1 ? "entry" : "entries"
                }`}
          </p>
        </div>

        <Button size="md" onClick={() => openCreate()} className="shrink-0 sm:h-11">
          <Plus className="h-4 w-4" aria-hidden="true" />
          New vault
        </Button>
      </div>

      {folders && folders.length > 0 ? (
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:max-w-xs">
            <Input
              placeholder="Search vaults, entries, columns…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              leading={<Search className="h-4 w-4" />}
              aria-label="Search vaults and entries"
              className="h-10 bg-paper/70"
            />
          </div>
          <p className="text-[11.5px] text-faint">
            {filtered.length} {filtered.length === 1 ? "vault" : "vaults"} shown
          </p>
        </div>
      ) : null}

      {folders && folders.length > 0 && query.trim().length >= 2 ? (
        <div className="mt-3 overflow-hidden rounded-2xl border border-line bg-paper">
          <div className="flex items-center justify-between border-b border-line bg-cream-deep/30 px-4 py-2.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-faint">
              Entries
            </span>
            <span className="text-[11px] text-faint">
              {searching ? "Searching…" : `${hits?.length ?? 0} ${hits?.length === 1 ? "match" : "matches"}`}
            </span>
          </div>

          {searching && !hits ? (
            <div className="flex flex-col gap-2 px-4 py-3">
              {[0, 1].map((index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="skeleton h-8 w-8 rounded-lg" />
                  <div className="flex flex-1 flex-col gap-1.5">
                    <div className="skeleton h-3 w-1/3 rounded-md" />
                    <div className="skeleton h-2.5 w-1/5 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          ) : hits && hits.length > 0 ? (
            <ul className="divide-y divide-line/70">
              {hits.map((hit) => (
                <li key={hit.id}>
                  <Link
                    href={`/dashboard/folders/${hit.folderId}?q=${encodeURIComponent(hit.title)}`}
                    className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-cream-deep/40"
                  >
                    <FolderGlyph icon={hit.folderIcon} color={hit.folderColor} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium text-ink">
                        {hit.title}
                      </span>
                      <span className="block truncate text-[11px] text-muted">
                        {hit.folderName}
                        {hit.matchedField ? ` · ${hit.matchedField}` : ""}
                      </span>
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-faint" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-4 text-[12.5px] text-muted">
              No entries match “{query.trim()}”. Titles, notes and visible fields are searched.
            </p>
          )}
        </div>
      ) : null}

      {error ? (
        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-[#e0bdb3] bg-[#fbeee9] px-4 py-3.5 text-[13px] text-[#7a2b21]">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <div className="flex flex-1 flex-col gap-2">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => void load()}
              className="self-start text-[12px] font-semibold underline underline-offset-4"
            >
              Try again
            </button>
          </div>
        </div>
      ) : null}

      {folders === null ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <div key={index} className="rounded-2xl border border-line bg-paper p-5">
              <div className="skeleton h-11 w-11 rounded-xl" />
              <div className="skeleton mt-4 h-5 w-2/3 rounded-md" />
              <div className="skeleton mt-2 h-3 w-full rounded-md" />
              <div className="skeleton mt-1.5 h-3 w-4/5 rounded-md" />
              <div className="skeleton mt-6 h-3 w-1/2 rounded-md" />
            </div>
          ))}
        </div>
      ) : folders.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={<FolderPlus className="h-5 w-5" />}
            title="Your first vault can be a small one."
            description="Group the accounts that belong together — Instagram in one, banking in another — and choose exactly which fields each one needs."
            action={
              <Button onClick={() => openCreate()}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                Create your first vault
              </Button>
            }
          />

          <div className="mt-6 rounded-2xl border border-line bg-paper/60 p-5">
            <div className="flex items-center gap-2 text-[12px] font-semibold text-ink">
              <Sparkles className="h-3.5 w-3.5 text-[#7a8a5f]" aria-hidden="true" />
              Or start from a template
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {QUICK_TEMPLATES.map((item) => (
                <button
                  key={item.template}
                  type="button"
                  onClick={() => openCreate(item.template)}
                  className="flex flex-col rounded-xl border border-line bg-cream px-3.5 py-2.5 text-left transition-colors hover:border-ink"
                >
                  <span className="text-[12.5px] font-semibold text-ink">{item.label}</span>
                  <span className="text-[10.5px] text-faint">{item.hint}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        hits && hits.length > 0 ? (
          <p className="mt-6 text-[12.5px] text-muted">
            No vault names match — the entries above did.
          </p>
        ) : (
          <EmptyState
            className="mt-8"
            icon={<Search className="h-5 w-5" />}
            title="Nothing matches that search."
            description="Try a vault name, a description, an entry title, a note, or one of its visible fields — like “Instagram” or “password”."
            action={
              <Button variant="secondary" onClick={() => setQuery("")}>
                Clear search
              </Button>
            }
          />
        )
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((folder) => (
            <FolderCard key={folder.id} folder={folder} />
          ))}

          <button
            type="button"
            onClick={() => openCreate()}
            className="flex min-h-[196px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line-strong bg-paper/40 p-5 text-muted transition-colors hover:border-ink hover:text-ink"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-paper">
              <Plus className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="text-[12.5px] font-medium">New vault</span>
          </button>
        </div>
      )}

      <FolderFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        defaultTemplate={template}
        onSaved={(folder: Folder) => {
          setFolders((current) => (current ? [folder, ...current] : [folder]));
          router.push(`/dashboard/folders/${folder.id}`);
        }}
      />
    </div>
  );
}
