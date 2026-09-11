import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import { Eyebrow, Glass } from "@/components/glass";
import {
  CALIBRATION_NOTE,
  VERDICT_BLURB,
  VERDICT_LABEL,
  type AnalysisResult,
  type Verdict,
} from "@/lib/analysis";

export const verdictColor: Record<Verdict, string> = {
  synthetic: "var(--synthetic)",
  authentic: "var(--authentic)",
  uncertain: "var(--uncertain)",
};

export const verdictSoft: Record<Verdict, string> = {
  synthetic: "var(--synthetic-soft)",
  authentic: "var(--authentic-soft)",
  uncertain: "var(--uncertain-soft)",
};

export function ConfidenceRing({
  value,
  verdict,
  size = 208,
}: {
  value: number;
  verdict: Verdict;
  size?: number;
}) {
  const reduce = useReducedMotion();
  const stroke = size < 120 ? 6 : 10;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const progress = useMotionValue(reduce ? value / 100 : 0);
  const dash = useTransform(progress, (p) => `${p * circumference} ${circumference}`);
  const [shown, setShown] = useState(reduce ? value : 0);

  useEffect(() => {
    if (reduce) {
      setShown(value);
      progress.set(value / 100);
      return;
    }
    const controls = animate(progress, value / 100, {
      duration: 1.5,
      ease: [0.22, 0.61, 0.28, 1],
      onUpdate: (v) => setShown(Math.round(v * 1000) / 10),
    });
    return () => controls.stop();
  }, [value, reduce, progress]);

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          stroke="var(--border)"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          stroke={verdictColor[verdict]}
          style={{ strokeDasharray: dash }}
        />
      </svg>
      <div className="absolute text-center">
        <span
          className="font-mono tracking-tight"
          style={{ fontSize: size / 4.6, color: verdictColor[verdict] }}
        >
          {shown.toFixed(1)}
        </span>
        <span className="ml-0.5 font-mono text-[0.7em] text-muted-foreground">%</span>
        <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-subtle-foreground">
          likelihood
        </p>
      </div>
    </div>
  );
}

export function VerdictPanel({ result }: { result: AnalysisResult }) {
  return (
    <Glass className="p-5 sm:p-8">
      <div className="relative z-[3] grid gap-8 md:grid-cols-[auto_minmax(0,1fr)] md:items-center">
        <div className="mx-auto">
          <ConfidenceRing value={result.confidence} verdict={result.verdict} />
        </div>
        <div className="min-w-0">
          <Eyebrow>Assessment</Eyebrow>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span
              className="rounded-[999px] px-4 py-1.5 text-[15px] font-medium sm:text-[17px]"
              style={{
                background: verdictSoft[result.verdict],
                color: verdictColor[result.verdict],
              }}
            >
              {VERDICT_LABEL[result.verdict]}
            </span>
            <span className="font-mono text-[12px] text-subtle-foreground">
              {result.filename}
            </span>
          </div>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
            {VERDICT_BLURB[result.verdict]}
          </p>
          <div className="mt-5 flex items-start gap-2.5 rounded-2xl bg-[var(--muted)] px-4 py-3">
            <Info className="mt-0.5 size-4 shrink-0 text-subtle-foreground" />
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              {CALIBRATION_NOTE}
            </p>
          </div>
        </div>
      </div>
    </Glass>
  );
}
