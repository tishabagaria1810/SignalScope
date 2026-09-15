import { Link, useRouterState } from "@tanstack/react-router";
import { Activity, Clock, FileText, LayoutDashboard, ScanSearch } from "lucide-react";
import { Glass } from "@/components/glass";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/scan", label: "Scan", icon: ScanSearch },
  { to: "/history", label: "History", icon: Clock },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/analysis", label: "Analysis", icon: Activity },
];

export function SidebarNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="fixed bottom-0 left-0 top-0 z-40 flex w-64 flex-col p-4">
      <Glass noSheen className="flex h-full flex-col px-4 py-6 shadow-xl backdrop-blur-md">
        <div className="mb-8 px-2">
          <Link to="/scan" className="text-xl font-bold tracking-tight text-foreground select-none" style={{ color: "var(--signal)" }}>
            Signal Scope
          </Link>
        </div>
        <div className="flex flex-1 flex-col gap-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.to || pathname.startsWith(item.to + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </Glass>
    </nav>
  );
}
