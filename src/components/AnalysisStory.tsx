import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";
import { Check, ImageUp, ScanLine, AlertTriangle, ShieldCheck } from "lucide-react";
import { Eyebrow, Glass } from "@/components/glass";
import { ScanBeam } from "@/components/HeatmapLayer";

const STORY_STEPS = [
  {
    id: "upload",
    title: "01 — UPLOAD",
    caption: "Provide the image to analyze.",
    render: () => (
      <div className="relative flex aspect-[4/3] flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border bg-background/50 p-6 text-center">
        <span className="glass-surface grid size-14 place-items-center rounded-[999px]">
          <ImageUp className="size-6 text-muted-foreground" />
        </span>
        <p className="mt-5 text-[15px] font-medium">Choose File</p>
        <div className="absolute -bottom-10 -right-10 opacity-20 blur-xl">
          <div className="size-40 rounded-full bg-[var(--signal)]" />
        </div>
      </div>
    ),
  },
  {
    id: "preprocessing",
    title: "02 — PRE-PROCESSING",
    caption: "Normalize the image before analysis.",
    render: () => (
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-muted/30">
        <img
          src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80"
          alt="Original"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 backdrop-saturate-50 [clip-path:polygon(50%_0,100%_0,100%_100%,50%_100%)]" />
        <div className="absolute inset-y-0 left-1/2 w-0.5 bg-[var(--signal)]/50" />
        <div className="absolute bottom-4 left-4 rounded-[999px] bg-black/60 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-md">
          Original
        </div>
        <div className="absolute bottom-4 right-4 rounded-[999px] bg-black/60 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-md">
          Processed
        </div>
      </div>
    ),
  },
  {
    id: "visual-analysis",
    title: "03 — VISUAL ANALYSIS",
    caption: "Inspect textures, lighting, geometry and visual patterns.",
    render: () => (
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border">
        <img
          src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1200&q=80"
          alt="Visual Analysis"
          className="absolute inset-0 h-full w-full scale-150 object-cover"
        />
        <div className="absolute inset-0 bg-[var(--signal)]/10 mix-blend-overlay" />
        <ScanBeam running />
        <div className="absolute left-1/4 top-1/4 size-24 rounded-full border border-dashed border-[var(--signal)]/50 bg-[var(--signal)]/10" />
        <div className="absolute bottom-1/3 right-1/4 size-32 rounded-full border border-dashed border-cyan-500/50 bg-cyan-500/10" />
      </div>
    ),
  },
  {
    id: "signal-extraction",
    title: "04 — SIGNAL EXTRACTION",
    caption: "Extract signals that may indicate synthetic generation.",
    render: () => (
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-[#06070c]">
        <img
          src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80"
          alt="Signal Background"
          className="absolute inset-0 h-full w-full object-cover opacity-20 grayscale"
        />
        <div className="absolute inset-0 flex flex-col justify-end p-6">
          <div className="h-32 w-full">
            <svg viewBox="0 0 100 40" className="h-full w-full preserve-3d" preserveAspectRatio="none">
              <motion.path
                d="M0,20 Q10,5 20,20 T40,20 T60,20 T80,20 T100,20"
                fill="none"
                stroke="var(--signal)"
                strokeWidth="0.5"
                animate={{
                  d: [
                    "M0,20 Q10,5 20,20 T40,20 T60,20 T80,20 T100,20",
                    "M0,20 Q10,35 20,20 T40,20 T60,20 T80,20 T100,20",
                    "M0,20 Q10,5 20,20 T40,20 T60,20 T80,20 T100,20",
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.path
                d="M0,25 Q15,10 30,25 T60,25 T90,25 T100,25"
                fill="none"
                stroke="cyan"
                strokeWidth="0.5"
                opacity="0.6"
                animate={{
                  d: [
                    "M0,25 Q15,10 30,25 T60,25 T90,25 T100,25",
                    "M0,25 Q15,40 30,25 T60,25 T90,25 T100,25",
                    "M0,25 Q15,10 30,25 T60,25 T90,25 T100,25",
                  ]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              />
            </svg>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "confidence-calibration",
    title: "05 — CONFIDENCE CALIBRATION",
    caption: "Convert model output into a calibrated likelihood.",
    render: () => (
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl border border-border bg-card p-6">
        <div className="relative flex size-48 items-center justify-center">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/30" />
            <motion.circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="var(--signal)"
              strokeWidth="6"
              strokeDasharray="289"
              strokeLinecap="round"
              initial={{ strokeDashoffset: 289 }}
              whileInView={{ strokeDashoffset: 289 - (289 * 0.76) }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, type: "spring", bounce: 0.2 }}
            />
          </svg>
          <div className="text-center">
            <span className="text-4xl font-bold tracking-tight">76%</span>
            <span className="block text-[11px] uppercase tracking-wider text-muted-foreground mt-1">Likelihood</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "evidence-localization",
    title: "06 — EVIDENCE LOCALIZATION",
    caption: "Highlight the regions contributing to the assessment.",
    render: () => (
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border">
        <img
          src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80"
          alt="Evidence"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Mock Heatmap */}
        <div className="absolute inset-0 bg-black/40 mix-blend-overlay" />
        <div className="absolute left-1/3 top-1/4 h-32 w-48 rounded-[100%] bg-[var(--signal)]/60 blur-[30px] mix-blend-screen" />
        <div className="absolute bottom-1/4 right-1/3 h-24 w-32 rounded-[100%] bg-cyan-500/50 blur-[20px] mix-blend-screen" />

        {/* Markers */}
        <div className="absolute left-[40%] top-[30%] flex size-6 items-center justify-center rounded-full bg-[var(--signal)] text-[11px] font-bold text-white shadow-[0_0_15px_var(--signal)]">
          01
        </div>
        <div className="absolute bottom-[30%] right-[40%] flex size-6 items-center justify-center rounded-full bg-cyan-500 text-[11px] font-bold text-white shadow-[0_0_15px_rgba(6,182,212,0.8)]">
          02
        </div>
      </div>
    ),
  },
  {
    id: "responsible-verdict",
    title: "07 — RESPONSIBLE VERDICT",
    caption: "Likely AI-generated / Likely authentic / Uncertain.",
    render: () => (
      <div className="relative flex aspect-[4/3] flex-col justify-between overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card to-background p-6">
        <div>
          <div className="flex items-center gap-2 text-[var(--signal)]">
            <AlertTriangle className="size-5" />
            <span className="text-[14px] font-medium uppercase tracking-widest">Assessment Complete</span>
          </div>
          <h3 className="mt-4 text-3xl font-semibold">Likely AI-generated</h3>
          <p className="mt-2 max-w-[250px] text-[13px] leading-relaxed text-muted-foreground">
            Analysis found strong signals of synthetic generation in lighting and structural geometry.
          </p>
        </div>
        <div className="flex items-center justify-between border-t border-border/50 pt-4">
          <div className="text-[13px] font-medium text-muted-foreground">Confidence</div>
          <div className="text-[20px] font-semibold tracking-tight text-[var(--signal)]">76%</div>
        </div>
      </div>
    ),
  },
];

export function AnalysisStory() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  // Create a tall container to allow scrolling
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  // Smooth the scroll progress
  const p = useSpring(scrollYProgress, { stiffness: 240, damping: 23, restDelta: 0.0005 });

  // We have 7 cards. We want to translate the container left by a percentage
  // that leaves the last card in view.
  const shift = 100 - (100 / STORY_STEPS.length);
  const x = useTransform(p, [0, 1], ["0%", `-${shift}%`]);

  if (reduce) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-16">
        <Eyebrow>How SignalScope Works</Eyebrow>
        <h2 className="mt-3 text-[26px] font-semibold sm:text-[38px]">
          The seven-stage analysis.
        </h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {STORY_STEPS.map((step) => (
            <Glass key={step.id} className="p-4">
              <div className="relative z-[3]">
                {step.render()}
                <div className="mt-5">
                  <h3 className="text-[14px] font-semibold tracking-wider text-muted-foreground">{step.title}</h3>
                  <p className="mt-2 text-[15px] text-foreground">{step.caption}</p>
                </div>
              </div>
            </Glass>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} style={{ height: `${STORY_STEPS.length * 80}vh` }} className="relative bg-background">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">

        {/* Header */}
        <div className="mx-auto w-full max-w-[85vw] px-4 md:max-w-6xl">
          <Eyebrow>How SignalScope Works</Eyebrow>
          <h2 className="mt-3 text-balance-tight text-[24px] font-semibold sm:text-[34px]">
            The seven-stage forensic pass.
          </h2>
        </div>

        {/* Horizontal Scroll Track */}
        <motion.div style={{ x }} className="mt-10 flex w-max gap-6 px-4 md:px-10 lg:gap-10">
          {STORY_STEPS.map((step, i) => {
            // Calculate active state based on scroll progress
            const segmentStart = i / STORY_STEPS.length;
            const segmentEnd = (i + 1) / STORY_STEPS.length;

            // Transform opacity and scale based on whether this card is the "active" one in the center of the viewport
            // For a simpler approach, we can just let Framer Motion handle the translation,
            // and use a slight spring scale effect if desired, but sticking to standard translation is often smoothest.

            return (
              <div
                key={step.id}
                className="w-[85vw] max-w-[420px] shrink-0 sm:w-[60vw] md:w-[45vw] lg:w-[400px]"
              >
                <Glass className="h-full p-4 sm:p-5">
                  <div className="relative z-[3] flex h-full flex-col">
                    {step.render()}
                    <div className="mt-6 flex-1">
                      <h3 className="text-[13px] font-bold tracking-widest text-muted-foreground">
                        {step.title}
                      </h3>
                      <p className="mt-3 text-[16px] leading-relaxed text-foreground">
                        {step.caption}
                      </p>
                    </div>
                  </div>
                </Glass>
              </div>
            );
          })}
        </motion.div>

        {/* Progress Bar */}
        <div className="mx-auto mt-12 h-[3px] w-48 overflow-hidden rounded-[999px] bg-border/50">
          <motion.div
            style={{ scaleX: p, transformOrigin: "left" }}
            className="h-full w-full rounded-[999px] bg-[var(--signal)]"
          />
        </div>

      </div>
    </section>
  );
}
