import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { Glass } from "@/components/glass";

const ITEMS = [
  { to: "/", label: "Overview" },
  { to: "/scan", label: "Scan" },
  { to: "/history", label: "History" },
  { to: "/how-it-works", label: "How It Works" },
] as const;

export function PillNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { theme, toggle } = useTheme();

  return (
    <div className="fixed inset-x-0 top-4 z-50 flex justify-center px-3 sm:top-6">
      <Glass
        pill
        className="flex h-[58px] items-center gap-1 px-2 sm:h-[68px] sm:gap-1.5 sm:px-3"
      >
        <span className="ml-2 mr-1 hidden text-[15px] font-semibold tracking-tight sm:block">
          SignalScope
        </span>
        <nav className="relative flex items-center">
          {ITEMS.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className="relative rounded-[999px] px-3 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground sm:px-4 sm:text-[14px]"
              >
                {active && (
                  <motion.span
                    layoutId="nav-capsule"
                    transition={{ type: "spring", stiffness: 240, damping: 23 }}
                    className="glass-surface absolute inset-0 rounded-[999px]"
                  />
                )}
                <span
                  className={
                    active ? "relative z-[3] text-foreground" : "relative z-[3] whitespace-nowrap"
                  }
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
        <button
          type="button"
          onClick={toggle}
          aria-label="Toggle colour theme"
          className="glass-surface ml-1 grid size-9 place-items-center rounded-[999px] text-muted-foreground transition-colors hover:text-foreground sm:size-10"
        >
          <motion.span
            key={theme}
            initial={{ rotate: -70, opacity: 0, scale: 0.8 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 240, damping: 23 }}
            className="relative z-[3]"
          >
            {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </motion.span>
        </button>
      </Glass>
    </div>
  );
}
