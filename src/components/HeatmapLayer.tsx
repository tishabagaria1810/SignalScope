import { motion } from "motion/react";
import type { EvidenceItem } from "@/lib/analysis";
import { cn } from "@/lib/utils";

/**
 * Localized heat only — one soft blob per evidence region, never a full-frame wash.
 */
export function HeatmapLayer({
  evidence,
  className,
  activeId,
  intensity = 1,
}: {
  evidence: EvidenceItem[];
  className?: string | undefined;
  activeId?: string | null | undefined;
  intensity?: number | undefined;
}) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden mix-blend-plus-lighter", className)}>
      {evidence.map((item) => {
        const dim = activeId ? (activeId === item.id ? 1 : 0.28) : 1;
        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 0.85 * dim * intensity, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 0.61, 0.28, 1] }}
            style={{
              left: `${item.region.x}%`,
              top: `${item.region.y}%`,
              width: `${item.region.w}%`,
              height: `${item.region.h}%`,
              background:
                "radial-gradient(closest-side, oklch(0.72 0.2 25 / 0.95), oklch(0.78 0.18 78 / 0.55) 46%, oklch(0.6 0.2 275 / 0.22) 72%, transparent 78%)",
              filter: "blur(14px)",
            }}
            className="absolute rounded-full"
          />
        );
      })}
    </div>
  );
}

export function EvidenceMarkers({
  evidence,
  activeId,
  onSelect,
  compact,
}: {
  evidence: EvidenceItem[];
  activeId?: string | null | undefined;
  onSelect?: ((id: string) => void) | undefined;
  compact?: boolean | undefined;
}) {
  return (
    <div className="absolute inset-0">
      {evidence.map((item, i) => {
        const active = activeId === item.id;
        return (
          <motion.button
            key={item.id}
            type="button"
            onClick={() => onSelect?.(item.id)}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 0.12 * i,
              type: "spring",
              stiffness: 240,
              damping: 23,
            }}
            style={{
              left: `${item.region.x}%`,
              top: `${item.region.y}%`,
              width: `${item.region.w}%`,
              height: `${item.region.h}%`,
            }}
            className={cn(
              "absolute rounded-2xl border text-left transition-colors duration-300",
              active
                ? "border-[oklch(0.85_0.16_78)] bg-[oklch(0.85_0.16_78/0.14)]"
                : "border-white/50 bg-white/5 hover:border-white/80",
            )}
          >
            <span
              className={cn(
                "absolute -top-3 left-2 rounded-[999px] bg-background/85 px-2 py-0.5 font-mono text-[10px] tracking-widest text-foreground backdrop-blur",
                compact && "text-[9px]",
              )}
            >
              {item.index}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

export function ScanBeam({ running }: { running: boolean }) {
  if (!running) return null;
  return (
    <motion.div
      aria-hidden
      initial={{ top: "-12%" }}
      animate={{ top: ["-12%", "104%"] }}
      transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
      className="pointer-events-none absolute inset-x-0 h-[14%]"
      style={{
        background:
          "linear-gradient(to bottom, transparent, oklch(0.95 0.06 200 / 0.5), oklch(1 0 0 / 0.9), oklch(0.95 0.06 200 / 0.5), transparent)",
        filter: "blur(1px)",
        mixBlendMode: "screen",
      }}
    />
  );
}
