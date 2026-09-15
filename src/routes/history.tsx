import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { loadHistory, type HistoryEntry, VERDICT_LABEL, formatDate } from "@/lib/analysis";
import { Eyebrow, Glass } from "@/components/glass";
import { History } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [{ title: "SignalScope - History" }],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    loadHistory().then(setHistory);
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-24 sm:py-32">
      <Eyebrow>Past Scans</Eyebrow>
      <h1 className="mt-3 text-[30px] font-semibold tracking-tight sm:text-[38px]">
        Scan History
      </h1>
      
      <div className="mt-10 grid gap-4">
        {history.length === 0 ? (
          <Glass className="p-8 text-center text-muted-foreground">
            <History className="mx-auto mb-4 size-8 opacity-50" />
            <p>No scans yet.</p>
          </Glass>
        ) : (
          history.map((entry) => (
            <Glass key={entry.id} className="p-4 sm:p-5">
              <div className="relative z-[3] flex flex-col gap-4 sm:flex-row sm:items-center">
                <img
                  src={entry.thumbnail}
                  alt={entry.filename}
                  className="size-16 rounded-lg object-cover sm:size-20"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-[16px] font-medium">{entry.filename}</h3>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider",
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
