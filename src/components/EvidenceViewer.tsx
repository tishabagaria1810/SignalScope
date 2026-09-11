import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Eyebrow, Glass } from "@/components/glass";
import { EvidenceMarkers, HeatmapLayer } from "@/components/HeatmapLayer";
import type { AnalysisResult } from "@/lib/analysis";
import { cn } from "@/lib/utils";

const MODES = ["Original", "Evidence", "Overlay", "Heatmap"] as const;
type Mode = (typeof MODES)[number];

export function EvidenceViewer({ result }: { result: AnalysisResult }) {
  const [mode, setMode] = useState<Mode>("Overlay");
  const [activeId, setActiveId] = useState<string | null>(result.evidence[0]?.id ?? null);

  const showHeat = mode === "Heatmap" || mode === "Overlay";
  const showMarkers = mode === "Evidence" || mode === "Overlay";
  const filter =
    mode === "Evidence"
      ? "grayscale(1) contrast(1.35)"
      : mode === "Heatmap"
        ? "grayscale(0.65) brightness(0.72)"
        : "none";

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-start">
      <Glass className="p-3 sm:p-4">
        <div className="relative z-[3]">
          <div className="mb-3 flex flex-wrap items-center gap-1">
            {MODES.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className="relative rounded-[999px] px-3.5 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground sm:text-[14px]"
              >
                {mode === m && (
                  <motion.span
                    layoutId="viewer-capsule"
                    transition={{ type: "spring", stiffness: 240, damping: 23 }}
                    className="glass-surface absolute inset-0 rounded-[999px]"
                  />
                )}
                <span className={cn("relative z-[3]", mode === m && "text-foreground")}>{m}</span>
              </button>
            ))}
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-border">
            <motion.img
              src={result.imageUrl}
              alt={result.filename}
              animate={{ filter }}
              transition={{ duration: 0.5, ease: [0.22, 0.61, 0.28, 1] }}
              className="aspect-[4/3] w-full object-cover"
            />
            <AnimatePresence>
              {showHeat && (
                <motion.div
                  key="heat"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0"
                >
                  <HeatmapLayer
                    evidence={result.evidence}
                    activeId={activeId}
                    intensity={mode === "Heatmap" ? 1 : 0.7}
                  />
                </motion.div>
              )}
            </AnimatePresence>
            {showMarkers && (
              <EvidenceMarkers
                evidence={result.evidence}
                activeId={activeId}
                onSelect={setActiveId}
              />
            )}
          </div>
          <p className="mt-3 text-[12px] leading-relaxed text-subtle-foreground">
            Heat is localized to the regions that contributed most to the assessment. Select a
            marker to isolate it.
          </p>
        </div>
      </Glass>

      <div className="space-y-3">
        <div className="px-1">
          <Eyebrow>Why SignalScope thinks this</Eyebrow>
        </div>
        {result.evidence.map((item) => {
          const active = activeId === item.id;
          return (
            <motion.button
              key={item.id}
              type="button"
              onClick={() => setActiveId(item.id)}
              animate={{ scale: active ? 1 : 0.99 }}
              transition={{ type: "spring", stiffness: 240, damping: 23 }}
              className="block w-full text-left"
            >
              <Glass
                className={cn(
                  "p-4 transition-colors duration-300 sm:p-5",
                  active && "ring-1 ring-[var(--ring)]",
                )}
              >
                <div className="relative z-[3]">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[11px] tracking-[0.2em] text-subtle-foreground">
                      {item.index}
                    </span>
                    <h3 className="text-[15px] font-medium">{item.title}</h3>
                    <span className="ml-auto font-mono text-[11px] text-subtle-foreground">
                      w {item.weight.toFixed(2)}
                    </span>
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                    {item.summary}
                  </p>
                  <AnimatePresence initial={false}>
                    {active && (
                      <motion.p
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.22, 0.61, 0.28, 1] }}
                        className="overflow-hidden text-[13px] leading-relaxed text-subtle-foreground"
                      >
                        <span className="mt-2 block">{item.detail}</span>
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </Glass>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
