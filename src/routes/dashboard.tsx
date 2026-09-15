import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Glass } from "@/components/glass";
import { Activity, LayoutDashboard, Search } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [{ title: "SignalScope - Dashboard" }],
  }),
  component: DashboardPage,
});

const MOCK_DATA = {
  day: [
    { name: "Mon", reports: 12 },
    { name: "Tue", reports: 19 },
    { name: "Wed", reports: 15 },
    { name: "Thu", reports: 22 },
    { name: "Fri", reports: 30 },
    { name: "Sat", reports: 28 },
    { name: "Sun", reports: 25 },
  ],
  month: [
    { name: "Jan", reports: 120 },
    { name: "Feb", reports: 150 },
    { name: "Mar", reports: 180 },
    { name: "Apr", reports: 220 },
    { name: "May", reports: 170 },
    { name: "Jun", reports: 240 },
    { name: "Jul", reports: 290 },
    { name: "Aug", reports: 310 },
    { name: "Sep", reports: 270 },
    { name: "Oct", reports: 330 },
    { name: "Nov", reports: 350 },
    { name: "Dec", reports: 410 },
  ],
  year: [
    { name: "2020", reports: 1200 },
    { name: "2021", reports: 1900 },
    { name: "2022", reports: 1500 },
    { name: "2023", reports: 2800 },
    { name: "2024", reports: 3400 },
  ]
};

function DashboardPage() {
  const [timeRange, setTimeRange] = useState<"day" | "month" | "year">("month");
  
  const data = MOCK_DATA[timeRange];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Glass noSheen className="flex items-center gap-4 p-6">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Search className="size-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Scans</p>
            <p className="text-2xl font-bold text-foreground">1,432</p>
          </div>
        </Glass>
        <Glass noSheen className="flex items-center gap-4 p-6">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Activity className="size-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Active Anomalies</p>
            <p className="text-2xl font-bold text-foreground">24</p>
          </div>
        </Glass>
        <Glass noSheen className="flex items-center gap-4 p-6">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <LayoutDashboard className="size-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Reports</p>
            <p className="text-2xl font-bold text-foreground">890</p>
          </div>
        </Glass>
      </div>

      <Glass noSheen className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Analysis Reports Over Time</h2>
            <p className="text-sm text-muted-foreground">Number of reports generated</p>
          </div>
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="rounded-md border border-border bg-background/50 px-3 py-1.5 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="day">By Day</option>
            <option value="month">By Month</option>
            <option value="year">By Year</option>
          </select>
        </div>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--signal)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--signal)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(20,20,25,0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                itemStyle={{ color: 'var(--signal)' }}
              />
              <Area 
                type="monotone" 
                dataKey="reports" 
                stroke="var(--signal)" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorReports)" 
                animationDuration={800}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Glass>
    </div>
  );
}
