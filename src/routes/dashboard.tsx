import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar,
} from "recharts";
import { Glass } from "@/components/glass";
import { Activity, LayoutDashboard, Search, TrendingUp, ShieldCheck, ShieldAlert } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [{ title: "SignalScope - Dashboard" }],
  }),
  component: DashboardPage,
});

interface ScanStats {
  total: number;
  synthetic: number;
  authentic: number;
  uncertain: number;
}

interface ChartPoint {
  name: string;
  scans: number;
  synthetic: number;
  authentic: number;
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const VERDICT_COLORS: Record<string, string> = {
  synthetic: "#ef4444",
  authentic: "#22c55e",
  uncertain: "#f59e0b",
};

function buildChartData(
  rows: Array<{ verdict: string; created_at: string }>,
  range: "day" | "month" | "year"
): ChartPoint[] {
  const now = new Date();

  if (range === "day") {
    // Last 7 days grouped by day-of-week
    const buckets: Record<string, ChartPoint> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = DAYS[d.getDay()];
      const label = `${key} ${d.getDate()}`;
      buckets[d.toDateString()] = { name: key, scans: 0, synthetic: 0, authentic: 0 };
    }
    rows.forEach((r) => {
      const d = new Date(r.created_at);
      const key = d.toDateString();
      if (buckets[key]) {
        buckets[key].scans++;
        if (r.verdict === "synthetic") buckets[key].synthetic++;
        if (r.verdict === "authentic") buckets[key].authentic++;
      }
    });
    return Object.values(buckets);
  }

  if (range === "month") {
    const buckets: ChartPoint[] = MONTHS.map((m) => ({ name: m, scans: 0, synthetic: 0, authentic: 0 }));
    rows.forEach((r) => {
      const month = new Date(r.created_at).getMonth();
      buckets[month].scans++;
      if (r.verdict === "synthetic") buckets[month].synthetic++;
      if (r.verdict === "authentic") buckets[month].authentic++;
    });
    return buckets;
  }

  // year — last 5 years
  const years: Record<number, ChartPoint> = {};
  for (let y = now.getFullYear() - 4; y <= now.getFullYear(); y++) {
    years[y] = { name: String(y), scans: 0, synthetic: 0, authentic: 0 };
  }
  rows.forEach((r) => {
    const y = new Date(r.created_at).getFullYear();
    if (years[y]) {
      years[y].scans++;
      if (r.verdict === "synthetic") years[y].synthetic++;
      if (r.verdict === "authentic") years[y].authentic++;
    }
  });
  return Object.values(years);
}

function StatCard({ icon, label, value, loading, color }: {
  icon: React.ReactNode; label: string; value: number; loading: boolean; color: string;
}) {
  return (
    <Glass noSheen className="flex items-center gap-4 p-6">
      <div className={`flex size-12 items-center justify-center rounded-full ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-foreground">
          {loading ? (
            <span className="inline-block h-7 w-10 animate-pulse rounded bg-white/10" />
          ) : (
            value.toLocaleString()
          )}
        </p>
      </div>
    </Glass>
  );
}

function DashboardPage() {
  const [timeRange, setTimeRange] = useState<"day" | "month" | "year">("month");
  const [stats, setStats] = useState<ScanStats>({ total: 0, synthetic: 0, authentic: 0, uncertain: 0 });
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [allRows, setAllRows] = useState<Array<{ verdict: string; created_at: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { setLoading(false); return; }

        const { data, error } = await supabase
          .from("scans")
          .select("verdict, created_at")
          .order("created_at", { ascending: true });

        if (error) {
          if (error.code !== '42P01' && error.code !== '42703') {
            console.warn("Dashboard fetch error:", error.message);
          }
          setLoading(false);
          return;
        }

        const rows = data ?? [];
        setAllRows(rows);
        setStats({
          total: rows.length,
          synthetic: rows.filter((r) => r.verdict === "synthetic").length,
          authentic: rows.filter((r) => r.verdict === "authentic").length,
          uncertain: rows.filter((r) => r.verdict === "uncertain").length,
        });
        setChartData(buildChartData(rows, timeRange));
      } catch (e: any) {
        console.warn("fetchAll error:", e?.message);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  // Rebuild chart when range changes
  useEffect(() => {
    if (allRows.length > 0) {
      setChartData(buildChartData(allRows, timeRange));
    }
  }, [timeRange, allRows]);

  const pieData = [
    { name: "Synthetic", value: stats.synthetic, color: "#ef4444" },
    { name: "Authentic", value: stats.authentic, color: "#22c55e" },
    { name: "Uncertain", value: stats.uncertain, color: "#f59e0b" },
  ].filter((d) => d.value > 0);

  const hasPie = stats.total > 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Real-time scan intelligence from Supabase</p>
        </div>
        <Link
          to="/scan"
          className="flex items-center gap-2 rounded-[999px] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Search className="size-4" /> New Scan
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Search className="size-6" />} label="Total Scans" value={stats.total} loading={loading} color="bg-primary/10 text-primary" />
        <StatCard icon={<ShieldAlert className="size-6" />} label="AI-Generated" value={stats.synthetic} loading={loading} color="bg-red-500/10 text-red-400" />
        <StatCard icon={<ShieldCheck className="size-6" />} label="Likely Authentic" value={stats.authentic} loading={loading} color="bg-green-500/10 text-green-400" />
        <StatCard icon={<Activity className="size-6" />} label="Uncertain" value={stats.uncertain} loading={loading} color="bg-yellow-500/10 text-yellow-400" />
      </div>

      {/* Charts row */}
      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        {/* Area chart — 2/3 width */}
        <Glass noSheen className="p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">Scans Over Time</h2>
              <p className="text-xs text-muted-foreground">
                {stats.total > 0 ? `${stats.total} total scan${stats.total !== 1 ? "s" : ""}` : "No scans yet"}
              </p>
            </div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="rounded-md border border-border bg-background/50 px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary"
            >
              <option value="day">Last 7 days</option>
              <option value="month">By Month</option>
              <option value="year">By Year</option>
            </select>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradScans" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--signal, #6366f1)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--signal, #6366f1)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradSynth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "rgba(15,15,20,0.92)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", fontSize: 12 }}
                />
                <Area type="monotone" dataKey="scans" name="Total Scans" stroke="var(--signal, #6366f1)" strokeWidth={2.5} fill="url(#gradScans)" dot={false} activeDot={{ r: 4 }} />
                <Area type="monotone" dataKey="synthetic" name="AI-Generated" stroke="#ef4444" strokeWidth={1.5} fill="url(#gradSynth)" dot={false} strokeDasharray="4 2" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Glass>

        {/* Pie chart — 1/3 width */}
        <Glass noSheen className="p-6 flex flex-col">
          <h2 className="mb-1 text-base font-semibold text-foreground">Verdict Breakdown</h2>
          <p className="mb-4 text-xs text-muted-foreground">Distribution of results</p>
          {!hasPie ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
              <LayoutDashboard className="size-10 opacity-20" />
              <p className="text-sm text-muted-foreground">No data yet</p>
              <p className="text-xs text-subtle-foreground">Scan images to populate this chart</p>
            </div>
          ) : (
            <div className="flex-1">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={75} innerRadius={45} paddingAngle={3} strokeWidth={0}>
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} opacity={0.9} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "rgba(15,15,20,0.92)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", fontSize: 12 }}
                    formatter={(value: number, name: string) => [`${value} scan${value !== 1 ? "s" : ""}`, name]}
                  />
                  <Legend
                    formatter={(value) => <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>{value}</span>}
                    iconType="circle"
                    iconSize={8}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 space-y-2">
                {pieData.map((d) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="inline-block size-2 rounded-full" style={{ background: d.color }} />
                      <span className="text-muted-foreground">{d.name}</span>
                    </div>
                    <span className="font-medium text-foreground">
                      {stats.total > 0 ? Math.round((d.value / stats.total) * 100) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Glass>
      </div>

      {/* Bar chart — confidence distribution would go here; show verdict bar chart */}
      <Glass noSheen className="p-6">
        <h2 className="mb-1 text-base font-semibold text-foreground">Verdict Comparison by Period</h2>
        <p className="mb-4 text-xs text-muted-foreground">Grouped by {timeRange === "day" ? "day of week" : timeRange === "month" ? "month" : "year"}</p>
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" vertical={false} />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "rgba(15,15,20,0.92)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", fontSize: 12 }}
              />
              <Legend formatter={(v) => <span style={{ fontSize: 11, color: "rgba(255,255,255,0.65)" }}>{v}</span>} iconSize={8} />
              <Bar dataKey="scans" name="Total" fill="var(--signal, #6366f1)" radius={[3, 3, 0, 0]} opacity={0.85} />
              <Bar dataKey="synthetic" name="AI-Generated" fill="#ef4444" radius={[3, 3, 0, 0]} opacity={0.8} />
              <Bar dataKey="authentic" name="Authentic" fill="#22c55e" radius={[3, 3, 0, 0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Glass>
    </div>
  );
}
