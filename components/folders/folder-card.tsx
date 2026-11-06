import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { relativeTime } from "@/lib/format";
import type { FolderSummary } from "@/lib/types";
import { FolderGlyph } from "@/components/ui/misc";

export function FolderCard({ folder }: { folder: FolderSummary }) {
  const preview = folder.columnNames.slice(0, 3);
  const remaining = folder.columnNames.length - preview.length;

  return (
    <Link
      href={`/dashboard/folders/${folder.id}`}
      className="group relative flex flex-col rounded-2xl border border-line bg-paper p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lift"
    >
      <div className="flex items-start justify-between gap-3">
        <FolderGlyph icon={folder.icon} color={folder.color} />
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-muted transition-colors group-hover:border-ink group-hover:bg-ink group-hover:text-cream">
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>

      <h3 className="mt-4 truncate font-serif text-[21px] leading-tight tracking-[-0.015em] text-ink">
        {folder.name}
      </h3>
      <p className="mt-1.5 line-clamp-2 min-h-[34px] text-[12.5px] leading-relaxed text-muted">
        {folder.description || "No description yet."}
      </p>

      <div className="mt-3 flex flex-wrap gap-1">
        {preview.map((column) => (
          <span
            key={column}
            className="rounded-md bg-ink/[0.055] px-1.5 py-0.5 text-[10px] font-medium text-ink-soft"
          >
            {column}
          </span>
        ))}
        {remaining > 0 ? (
          <span className="rounded-md px-1 py-0.5 text-[10px] font-medium text-faint">
            +{remaining}
          </span>
        ) : null}
        {folder.columnNames.length === 0 ? (
          <span className="text-[10.5px] italic text-faint">No columns yet</span>
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-[11px] text-faint">
        <span>
          {folder.itemCount} {folder.itemCount === 1 ? "entry" : "entries"}
        </span>
        <span>Updated {relativeTime(folder.updatedAt)}</span>
      </div>
    </Link>
  );
}
