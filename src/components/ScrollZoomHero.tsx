import { Link } from "@tanstack/react-router";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useRef } from "react";
import { ArrowDown, ScanLine } from "lucide-react";
import heroImage from "@/assets/forensic-subject.jpg";
import { Eyebrow, Glass, MagneticButton } from "@/components/glass";
import { EvidenceMarkers, HeatmapLayer } from "@/components/HeatmapLayer";
import type { EvidenceItem } from "@/lib/analysis";

const STAGES = ["Discover", "Zoom", "Inspect", "Analyze", "Understand"] as const;

const HERO_EVIDENCE: EvidenceItem[] = [
  {
    id: "hero-1",
    index: "01",
    kind: "texture",
    title: "Texture irregularity",
    summary: "",
    detail: "",
    region: { x: 52, y: 44, w: 22, h: 20 },
    weight: 0.4,
  },
  {
    id: "hero-2",
    index: "02",
    kind: "reflection",
    title: "Reflection inconsistency",
    summary: "",
    detail: "",
    region: { x: 26, y: 24, w: 18, h: 14 },
    weight: 0.3,
  },
  {
    id: "hero-3",
    index: "03",
    kind: "geometry",
    title: "Geometry anomaly",
    summary: "",
    detail: "",
    region: { x: 16, y: 62, w: 20, h: 18 },
    weight: 0.24,
  },
];

const LABELS = [
  { at: "left-[6%] top-[26%]", text: "HF residual · 0.41" },
  { at: "right-[6%] top-[38%]", text: "specular Δ · 12.4°" },
  { at: "left-[10%] bottom-[22%]", text: "edge drift · 0.8 px" },
  { at: "right-[9%] bottom-[28%]", text: "PRNU · absent" },
];

function StageRail({ progress }: { progress: MotionValue<number> }) {
  return (
    <div className="pointer-events-none absolute bottom-6 left-1/2 z-20 -translate-x-1/2">
      <Glass pill className="flex items-center gap-1 px-2 py-1.5 sm:gap-2 sm:px-3">
        {STAGES.map((stage, i) => {
          const start = i / STAGES.length;
          const opacity = useTransform(
            progress,
            [start - 0.12, start + 0.02, start + 0.18, start + 0.3],
            [0.35, 1, 1, 0.35],
          );
          return (
            <motion.span
              key={stage}
              style={{ opacity }}
              className="relative z-[3] px-2 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground sm:text-[11px]"
            >
              {stage}
            </motion.span>
          );
        })}
      </Glass>
    </div>
  );
}

export function ScrollZoomHero() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 240, damping: 23, restDelta: 0.0005 });

  const frameWidth = useTransform(
    p,
    [0, 0.42],
    reduce ? ["90%", "90%"] : ["58%", "94%"],
    { clamp: true },
  );
  const frameHeight = useTransform(
    p,
    [0, 0.42],
    reduce ? ["62vh", "62vh"] : ["52vh", "84vh"],
    { clamp: true },
  );
  const frameRadius = useTransform(p, [0, 0.42], reduce ? [28, 28] : [999, 28], {
    clamp: true,
  });
  const imageScale = useTransform(p, [0, 0.55], reduce ? [1.04, 1.04] : [1, 1.85]);
  const imageY = useTransform(p, [0, 1], reduce ? [0, 0] : [0, -60]);
  const grade = useTransform(p, [0.25, 0.6], reduce ? [1, 1] : [1, 0.55]);
  const imageFilter = useTransform(grade, (g) => `saturate(${g}) contrast(${2 - g})`);

  const headlineOpacity = useTransform(p, [0, 0.16], [1, 0]);
  const headlineScale = useTransform(p, [0, 0.16], [1, 1.1]);
  const headlineY = useTransform(p, [0, 0.16], [0, -40]);

  const labelOpacity = useTransform(p, [0.24, 0.36, 0.86, 0.98], [0, 1, 1, 0.4]);
  const beamY = useTransform(p, [0.4, 0.68], ["-15%", "108%"]);
  const beamOpacity = useTransform(p, [0.38, 0.44, 0.66, 0.72], [0, 1, 1, 0]);
  const heatOpacity = useTransform(p, [0.6, 0.78], [0, 1]);
  const markerOpacity = useTransform(p, [0.74, 0.88], [0, 1]);
  const readoutY = useTransform(p, [0.8, 1], [40, 0]);
  const readoutOpacity = useTransform(p, [0.8, 0.95], [0, 1]);

  return (
    <section ref={ref} className="relative h-[420vh]">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        {/* headline layer */}
        <motion.div
          style={{ opacity: headlineOpacity, scale: headlineScale, y: headlineY }}
          className="pointer-events-none absolute inset-x-0 top-[16vh] z-20 mx-auto max-w-3xl px-6 text-center"
        >
          <Eyebrow>SignalScope</Eyebrow>
          <h1 className="text-balance-tight mt-4 text-[34px] font-semibold leading-[1.05] sm:text-[54px] lg:text-[64px]">
            Telling real from synthetic in the age of generative media.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:text-base">
            Upload an image, watch the forensic pass, and read the evidence behind every
            likelihood — not a verdict shouted without proof.
          </p>
          <div className="pointer-events-auto mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/scan">
              <MagneticButton>
                <ScanLine className="size-4" /> Scan an image
              </MagneticButton>
            </Link>
            <span className="inline-flex items-center gap-2 text-[13px] text-subtle-foreground">
              <ArrowDown className="size-3.5" /> scroll to inspect
            </span>
          </div>
        </motion.div>

        {/* glass frame + forensic image */}
        <motion.div
          style={{ width: frameWidth, height: frameHeight, borderRadius: frameRadius }}
          className="glass-surface glass-refract relative z-10 overflow-hidden"
        >
          <motion.img
            src={heroImage}
            alt="Studio portrait under forensic inspection"
            width={1280}
            height={1280}
            style={{ scale: imageScale, y: imageY, filter: imageFilter }}
            className="absolute inset-0 size-full object-cover"
          />

          <motion.div style={{ opacity: labelOpacity }} className="absolute inset-0 z-[3]">
            {LABELS.map((l) => (
              <span
                key={l.text}
                className={`absolute ${l.at} rounded-[999px] bg-background/70 px-3 py-1 font-mono text-[10px] tracking-widest text-foreground backdrop-blur-md sm:text-[11px]`}
              >
                {l.text}
              </span>
            ))}
          </motion.div>

          <motion.div
            style={{ top: beamY, opacity: beamOpacity }}
            className="pointer-events-none absolute inset-x-0 z-[4] h-[16%]"
          >
            <div
              className="size-full"
              style={{
                background:
                  "linear-gradient(to bottom, transparent, oklch(0.96 0.06 200 / 0.45), oklch(1 0 0 / 0.85), oklch(0.96 0.06 200 / 0.45), transparent)",
                mixBlendMode: "screen",
              }}
            />
          </motion.div>

          <motion.div style={{ opacity: heatOpacity }} className="absolute inset-0 z-[3]">
            <HeatmapLayer evidence={HERO_EVIDENCE} />
          </motion.div>
          <motion.div style={{ opacity: markerOpacity }} className="absolute inset-0 z-[4]">
            <EvidenceMarkers evidence={HERO_EVIDENCE} compact />
          </motion.div>

          <motion.div
            style={{ opacity: readoutOpacity, y: readoutY }}
            className="absolute inset-x-3 bottom-16 z-[5] sm:inset-x-6 sm:bottom-20"
          >
            <Glass className="flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3">
              <div className="relative z-[3] min-w-0">
                <Eyebrow>Illustrative pass</Eyebrow>
                <p className="mt-1 truncate text-[15px] font-medium">
                  Likely AI-generated · 91.4% likelihood
                </p>
              </div>
              <p className="relative z-[3] max-w-sm text-[12px] leading-relaxed text-subtle-foreground">
                Confidence is calibrated and should be interpreted as likelihood, not certainty.
              </p>
            </Glass>
          </motion.div>
        </motion.div>

        <StageRail progress={p} />
      </div>
    </section>
  );
}
