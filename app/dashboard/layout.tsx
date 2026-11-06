import { Suspense } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Spinner } from "@/components/ui/misc";

function DashboardFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center gap-3 text-muted">
      <Spinner />
      <span className="text-[13px]">Opening your workspace…</span>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<DashboardFallback />}>
      <DashboardShell>{children}</DashboardShell>
    </Suspense>
  );
}
