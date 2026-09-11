import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";
import { Eyebrow, Glass } from "@/components/glass";
import { ScanBeam } from "@/components/HeatmapLayer";
import { cn } from "@/lib/utils";

export const SCAN_STAGES = [
  "Pre-processing",
  "Visual analysis",
  "Signal extraction",
  "Confidence calibration",
  "Evidence localization",
] as const;

export function ScanStages({
  imageUrl,
  stage,
}: {
  imageUrl: string;
  stage: number;
}) {
  return (
    <Glass className="p-4 sm:p-6">
      <div className="relative z-[3] grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-center">
        <div className="relative overflow-hidden rounded-2xl border border-border">
          <img
            src={imageUrl}
            alt="Image being analyzed"
            className="aspect-[4/3] w-full object-cover"
          />
          <ScanBeam running />
          {/* analysis rings + signal pulses */}
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                initial={{ scale: 0.5, opacity: 0.5 }}
                animate={{ scale: [0.5, 1.5], opacity: [0.5, 0] }}
                transition={{ duration: 2.6, repeat: Infinity, delay: i * 0.75, ease: "easeOut" }}
                className="absolute size-40 rounded-full border border-white/50 sm:size-56"
              />
            ))}
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
              className="absolute size-28 rounded-full border border-dashed border-white/60 sm:size-40"
            />
          </div>
        </div>

        <div>
          <Eyebrow>Forensic pass in progress</Eyebrow>
          <ol className="mt-4 space-y-1">
            {SCAN_STAGES.map((label, i) => {
              const done = i < stage;
              const active = i === stage;
              return (
                <li
                  key={label}
                  className={cn(
                    "flex items-center gap-3 rounded-[999px] px-3 py-2.5 text-[14px] transition-colors duration-500 sm:text-[15px]",
                    active && "bg-[var(--signal-soft)] text-foreground",
                    !active && (done ? "text-muted-foreground" : "text-subtle-foreground"),
                  )}
                >
                  <span className="grid size-6 shrink-0 place-items-center rounded-[999px] border border-border">
                    <AnimatePresence mode="wait" initial={false}>
                      {done ? (
                        <motion.span
                          key="done"
                          initial={{ scale: 0.4, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 240, damping: 23 }}
                        >
                          <Check className="size-3.5" />
                        </motion.span>
                      ) : active ? (
                        <motion.span
                          key="active"
                          animate={{ opacity: [1, 0.25, 1] }}
                          transition={{ duration: 1.2, repeat: Infinity }}
                          className="size-2 rounded-full bg-[var(--signal)]"
                        />
                      ) : (
                        <span key="idle" className="size-1.5 rounded-full bg-border" />
                      )}
                    </AnimatePresence>
                  </span>
                  <span className="min-w-0 truncate">{label}</span>
                </li>
              );
            })}
          </ol>
          <div className="mt-5 h-[3px] w-full overflow-hidden rounded-[999px] bg-border">
            <motion.div
              animate={{ width: `${((stage + 1) / SCAN_STAGES.length) * 100}%` }}
              transition={{ type: "spring", stiffness: 240, damping: 23 }}
              className="h-full rounded-[999px] bg-[var(--signal)]"
            />
          </div>
        </div>
      </div>
    </Glass>
  );
}
