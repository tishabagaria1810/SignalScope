import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Glass, Eyebrow } from "@/components/glass";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid,
} from "recharts";
import { ScanLine, TrendingUp, Target, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/analysis")({
  head: () => ({
    meta: [{ title: "SignalScope - Analysis" }],
  }),
  component: AnalysisPage,
});

interface ScanRow {
  verdict: string;
  confidence: number;
  created_at: string;
}

function confidenceBucket(c: number): string {
  if (c < 60) return "50–60%";
  if (c < 70) return "60–70%";
  if (c < 80) return "70–80%";
  if (c < 90) return "80–90%";
  return "90–100%";
}

function buildConfidenceHistogram(rows: ScanRow[]) {
  const buckets: Record<string, number> = {
    "50–60%": 0, "60–70%": 0, "70–80%": 0, "80–90%": 0, "90–100%": 0,
  };
  rows.forEach((r) => {
    const key = confidenceBucket(r.confidence);
    buckets[key] = (buckets[key] ?? 0) + 1;
  });
  return Object.entries(buckets).map(([name, count]) => ({ name, count }));
}

function buildRadarData(rows: ScanRow[]) {
  const total = rows.length || 1;
  const synthetic = rows.filter((r) => r.verdict === "synthetic").length;
  const authentic = rows.filter((r) => r.verdict === "authentic").length;
  const avgConf = rows.reduce((s, r) => s + r.confidence, 0) / (rows.length || 1);
  const highConf = rows.filter((r) => r.confidence >= 80).length;
  const recentDays = rows.filter((r) => {
    const d = new Date(r.created_at);
    const now = new Date();
    return now.getTime() - d.getTime() < 7 * 24 * 60 * 60 * 1000;
  }).length;

  return [
    { subject: "Volume", A: Math.min(100, total * 10), fullMark: 100 },
    { subject: "AI Detection", A: Math.round((synthetic / total) * 100), fullMark: 100 },
    { subject: "Avg Confidence", A: Math.round(avgConf), fullMark: 100 },
    { subject: "High Confidence", A: Math.round((highConf / total) * 100), fullMark: 100 },
    { subject: "7-day Activity", A: Math.min(100, recentDays * 20), fullMark: 100 },
    { subject: "Authentic Rate", A: Math.round((authentic / total) * 100), fullMark: 100 },
  ];
}

function MetricCard({ label, value, sub, icon, color }: {
  label: string; value: string; sub: string; icon: React.ReactNode; color: string;
}) {
  return (
    <Glass noSheen className="p-5">
      <div className="relative z-[3] flex items-start gap-3">
        <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", color)}>
          {icon}
        </div>
        <div>
          <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
          <p className="mt-0.5 text-[22px] font-bold leading-none text-foreground">{value}</p>
          <p className="mt-1 text-[11px] text-subtle-foreground">{sub}</p>
        </div>
      </div>
    </Glass>
  );
}

function AnalysisPage() {
  const [rows, setRows] = useState<ScanRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function fetchRows() {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      if (!session) { setLoading(false); return; }

      const { data, error } = await supabase
        .from("scans")
        .select("verdict, confidence, created_at")
        .order("created_at", { ascending: false });

      if (!error && data) setRows(data as ScanRow[]);
      else if (error && error.code !== "42P01" && error.code !== "42703") {
        console.warn("Analysis fetch error:", error.message);
      }
      setLoading(false);
    }
    fetchRows();
  }, []);

  const total = rows.length;
  const synthetic = rows.filter((r) => r.verdict === "synthetic").length;
  const authentic = rows.filter((r) => r.verdict === "authentic").length;
  const avgConf = total > 0 ? (rows.reduce((s, r) => s + r.confidence, 0) / total).toFixed(1) : "—";
  const highConf = rows.filter((r) => r.confidence >= 85).length;

  const histogram = buildConfidenceHistogram(rows);
  const radarData = buildRadarData(rows);
  const HIST_COLORS = ["#6366f1", "#8b5cf6", "#a855f7", "#c084fc", "#d8b4fe"];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Eyebrow>Forensic Intelligence</Eyebrow>
      <h1 className="mt-2 text-[30px] font-semibold tracking-tight text-foreground sm:text-[36px]">
        Analysis
      </h1>
      <p className="mt-2 text-[14px] text-muted-foreground">
        Statistical breakdown — confidence distributions, detection patterns, and model performance.
      </p>

      {/* Metric Cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total Scans" value={loading ? "—" : String(total)} sub="all time"
          icon={<ScanLine className="size-4" />} color="bg-primary/10 text-primary" />
        <MetricCard
          label="Detection Rate"
          value={loading ? "—" : total > 0 ? `${Math.round((synthetic / total) * 100)}%` : "0%"}
          sub="AI-generated found"
          icon={<Target className="size-4" />} color="bg-red-500/10 text-red-400" />
        <MetricCard label="Avg Confidence" value={loading ? "—" : `${avgConf}%`} sub="across all verdicts"
          icon={<TrendingUp className="size-4" />} color="bg-blue-500/10 text-blue-400" />
        <MetricCard label="High Confidence" value={loading ? "—" : String(highConf)} sub="scans ≥ 85%"
          icon={<Zap className="size-4" />} color="bg-yellow-500/10 text-yellow-400" />
      </div>

      {total === 0 && !loading ? (
        <Glass className="mt-8 p-10 text-center">
          <Target className="mx-auto mb-4 size-10 opacity-25" />
          <p className="text-[15px] font-medium text-foreground">No analysis data yet</p>
          <p className="mt-2 text-[13px] text-muted-foreground">
            {isLoggedIn
              ? "Start scanning images to build your forensic analysis profile."
              : "Sign in to view your analysis data."}
          </p>
          {isLoggedIn && (
            <Link
              to="/scan"
              className="mt-5 inline-flex items-center gap-2 rounded-[999px] bg-primary px-5 py-2.5 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <ScanLine className="size-4" /> Run your first scan
            </Link>
          )}
        </Glass>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Confidence histogram */}
          <Glass noSheen className="p-6">
            <h2 className="mb-1 text-[15px] font-semibold text-foreground">Confidence Distribution</h2>
            <p className="mb-4 text-[11px] text-muted-foreground">Number of scans per confidence band</p>
            {loading ? (
              <div className="h-[220px] animate-pulse rounded-lg bg-white/5" />
            ) : (
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={histogram} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" vertical={false} />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "rgba(15,15,20,0.92)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", fontSize: 11 }}
                      formatter={(v: number) => [`${v} scan${v !== 1 ? "s" : ""}`, "Count"]}
                    />
                    <Bar dataKey="count" name="Scans" radius={[4, 4, 0, 0]}>
                      {histogram.map((_, i) => (
                        <Cell key={i} fill={HIST_COLORS[i % HIST_COLORS.length]} opacity={0.85} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Glass>

          {/* Radar chart */}
          <Glass noSheen className="p-6">
            <h2 className="mb-1 text-[15px] font-semibold text-foreground">Detection Profile</h2>
            <p className="mb-4 text-[11px] text-muted-foreground">Multi-dimensional forensic performance radar</p>
            {loading ? (
              <div className="h-[220px] animate-pulse rounded-lg bg-white/5" />
            ) : (
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} />
                    <Radar
                      name="Profile"
                      dataKey="A"
                      stroke="var(--signal, #6366f1)"
                      fill="var(--signal, #6366f1)"
                      fillOpacity={0.25}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Glass>

          {/* Verdict summary table */}
          <Glass noSheen className="p-6 lg:col-span-2">
            <h2 className="mb-4 text-[15px] font-semibold text-foreground">Verdict Summary</h2>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => <div key={i} className="h-10 animate-pulse rounded-lg bg-white/5" />)}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] font-medium text-muted-foreground">
                      <th className="pb-3 pr-4">Verdict</th>
                      <th className="pb-3 pr-4">Count</th>
                      <th className="pb-3 pr-4">Share</th>
                      <th className="pb-3">Avg Confidence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {(["synthetic", "authentic", "uncertain"] as const).map((v) => {
                      const vRows = rows.filter((r) => r.verdict === v);
                      const count = vRows.length;
                      const share = total > 0 ? ((count / total) * 100).toFixed(1) : "0";
                      const avg = count > 0
                        ? (vRows.reduce((s, r) => s + r.confidence, 0) / count).toFixed(1)
                        : "—";
                      const colors = {
                        synthetic: "text-red-400",
                        authentic: "text-green-400",
                        uncertain: "text-yellow-400",
                      };
                      const barColors = {
                        synthetic: "bg-red-400",
                        authentic: "bg-green-400",
                        uncertain: "bg-yellow-400",
                      };
                      const labels = {
                        synthetic: "AI-Generated",
                        authentic: "Authentic",
                        uncertain: "Uncertain",
                      };
                      return (
                        <tr key={v}>
                          <td className={cn("py-3 pr-4 font-medium", colors[v])}>{labels[v]}</td>
                          <td className="py-3 pr-4 font-semibold text-foreground">{count}</td>
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-24 rounded-full bg-white/10 overflow-hidden">
                                <div
                                  className={cn("h-full rounded-full transition-all duration-700", barColors[v])}
                                  style={{ width: `${share}%` }}
                                />
                              </div>
                              <span className="text-[11px] text-muted-foreground">{share}%</span>
                            </div>
                          </td>
                          <td className="py-3 text-muted-foreground">
                            {avg}{avg !== "—" ? "%" : ""}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Glass>
        </div>
      )}
    </div>
  );
}
