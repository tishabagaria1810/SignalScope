import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { loadHistory, type HistoryEntry, VERDICT_LABEL, formatDate } from "@/lib/analysis";
import { Eyebrow, Glass } from "@/components/glass";
import { History, ScanLine } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [{ title: "SignalScope - History" }],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function fetchHistory() {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      const entries = await loadHistory();
      setHistory(entries);
      setLoading(false);
    }
    fetchHistory();
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-24 sm:py-32">
      <Eyebrow>Past Scans</Eyebrow>
      <h1 className="mt-3 text-[30px] font-semibold tracking-tight sm:text-[38px]">
        Scan History
      </h1>

      <div className="mt-10 grid gap-4">
        {loading ? (
          /* Loading skeleton */
          [1, 2, 3].map((i) => (
            <Glass key={i} className="p-4 sm:p-5">
              <div className="relative z-[3] flex gap-4 animate-pulse">
                <div className="size-16 rounded-lg bg-white/10 sm:size-20" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 w-48 rounded bg-white/10" />
                  <div className="h-3 w-32 rounded bg-white/10" />
                  <div className="h-3 w-64 rounded bg-white/10" />
                </div>
              </div>
            </Glass>
          ))
        ) : history.length === 0 ? (
          /* Empty state */
          <Glass className="p-10 text-center text-muted-foreground">
            <History className="mx-auto mb-4 size-10 opacity-40" />
            <p className="text-[16px] font-medium text-foreground">No scans yet</p>
            <p className="mt-2 text-[13px] text-muted-foreground">
              {isLoggedIn
                ? "Your scan history will appear here after you analyze your first image."
                : "Sign in to see your scan history."}
            </p>
            {isLoggedIn && (
              <Link
                to="/scan"
                className="mt-6 inline-flex items-center gap-2 rounded-[999px] bg-primary px-5 py-2.5 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                <ScanLine className="size-4" />
                Scan your first image
              </Link>
            )}
          </Glass>
        ) : (
          history.map((entry) => (
            <Glass key={entry.id} className="p-4 sm:p-5">
              <div className="relative z-[3] flex flex-col gap-4 sm:flex-row sm:items-center">
                {/* Thumbnail or placeholder */}
                {entry.thumbnail ? (
                  <img
                    src={entry.thumbnail}
                    alt={entry.filename}
                    className="size-16 rounded-lg object-cover sm:size-20"
                    onError={(e) => {
                      // If blob URL is expired, show placeholder
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-white/5 sm:size-20">
                    <History className="size-6 opacity-30" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="truncate text-[16px] font-medium">{entry.filename}</h3>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider shrink-0",
                        entry.verdict === "synthetic"
                          ? "bg-red-500/10 text-red-500"
                          : entry.verdict === "authentic"
                            ? "bg-green-500/10 text-green-500"
                            : "bg-yellow-500/10 text-yellow-500"
                      )}
                    >
                      {entry.verdict}
                    </span>
                  </div>
                  <p className="mt-1 text-[13px] text-muted-foreground">
                    {formatDate(entry.createdAt)} • {entry.confidence}% confidence
                  </p>
                  <p className="mt-2 text-[14px] text-subtle-foreground">
                    {VERDICT_LABEL[entry.verdict]}
                  </p>
                </div>

                <Link
                  to="/scan"
                  className="shrink-0 rounded-[999px] bg-secondary px-4 py-2 text-[13px] font-medium transition-colors hover:bg-secondary/80 text-center"
                >
                  Scan another
                </Link>
              </div>
            </Glass>
          ))
        )}
      </div>
    </div>
  );
}
