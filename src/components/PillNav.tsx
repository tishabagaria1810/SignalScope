import { Link, useRouterState } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "motion/react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { Glass } from "@/components/glass";
import { AccountMenu } from "./AccountMenu";

const ITEMS = [
  { to: "/", label: "Overview" },
  { to: "/how-it-works", label: "How It Works" },
] as const;

export function PillNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { theme, toggle } = useTheme();

  const { scrollY } = useScroll();
  const backgroundColor = useTransform(
    scrollY,
    [0, 50],
    ["rgba(131, 155, 250, 0)", "rgba(131, 155, 250, 0.03)"]
  );
  const backdropFilter = useTransform(
    scrollY,
    [0, 50],
    ["blur(0px)", "blur(12px)"]
  );
  const borderBottom = useTransform(
    scrollY,
    [0, 50],
    ["1px solid rgba(131, 155, 250, 0)", "1px solid rgba(131, 155, 250, 0.08)"]
  );

  return (
    <motion.header 
      style={{ backgroundColor, backdropFilter, borderBottom }}
      className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-4 sm:px-10 sm:py-5 transition-colors duration-200"
    >
      {/* Logo */}
      <Link to="/" className="relative z-10 flex h-full items-center gap-2 outline-none select-none">
        <span className="text-[26px] font-bold tracking-tight sm:text-[32px] text-[var(--signal)] pb-1">
          Signal Scope
        </span>
      </Link>
      {/* Nav */}
      <Glass
        pill
        className="flex h-[58px] items-center gap-1 px-2 sm:h-[68px] sm:gap-1.5 sm:px-3"
      >

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
        <AccountMenu />
      </Glass>
    </motion.header>
  );
}
