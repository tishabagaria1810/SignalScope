import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Fingerprint, Layers, ScanLine, ShieldQuestion } from "lucide-react";
import { ScrollZoomHero } from "@/components/ScrollZoomHero";
import { Eyebrow, Glass, MagneticButton, TiltGlass } from "@/components/glass";
import { AnalysisStory } from "@/components/AnalysisStory";
import { CALIBRATION_NOTE } from "@/lib/analysis";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SignalScope — Telling real from synthetic media" },
      {
        name: "description",
        content:
          "Scan an image for signs of generative synthesis. SignalScope shows localized evidence, robustness checks and calibrated likelihoods.",
      },
      { property: "og:title", content: "SignalScope — Telling real from synthetic media" },
      {
        property: "og:description",
        content:
          "Forensic image analysis with localized evidence, robustness checks and calibrated likelihoods.",
      },
    ],
  }),
  component: Overview,
});

const CAPABILITIES = [
  {
    icon: ScanLine,
    title: "Five-stage forensic pass",
    body: "Pre-processing, visual analysis, signal extraction, confidence calibration and evidence localization — each stage visible while it runs.",
  },
  {
    icon: Layers,
    title: "Localized evidence",
    body: "Heat is confined to the regions that shaped the assessment, with matching explanation cards you can step through.",
  },
  {
    icon: ShieldQuestion,
    title: "Robustness checks",
    body: "The same image is re-tested after recompression, resizing, screen capture and light edits so you can see how stable the reading is.",
  },
  {
    icon: Fingerprint,
    title: "Provenance context",
    body: "C2PA, EXIF and editing history sit alongside the assessment as supporting context — never as the headline.",
  },
];

function Overview() {
  return (
    <>
      <ScrollZoomHero />

      <section className="mx-auto max-w-6xl px-4 pb-8 pt-10 sm:pt-20">
        <Eyebrow>What it does</Eyebrow>
        <h2 className="text-balance-tight mt-3 max-w-2xl text-[26px] font-semibold leading-tight sm:text-[38px]">
          Evidence first. A likelihood second. Never a claim of certainty.
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {CAPABILITIES.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.06, ease: [0.22, 0.61, 0.28, 1] }}
            >
              <TiltGlass className="h-full">
                <div className="relative z-[3] p-5 sm:p-6">
                  <span className="grid size-10 place-items-center rounded-[999px] bg-[var(--signal-soft)]">
                    <c.icon className="size-5 text-[var(--signal)]" />
                  </span>
                  <h3 className="mt-4 text-[17px] font-medium">{c.title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
                    {c.body}
                  </p>
                </div>
              </TiltGlass>
            </motion.div>
          ))}
        </div>
      </section>

      <AnalysisStory />

      <section className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
        <Glass className="p-6 sm:p-10">
          <div className="relative z-[3] flex flex-wrap items-center justify-between gap-6">
            <div className="min-w-0 max-w-lg">
              <h2 className="text-balance-tight text-[24px] font-semibold sm:text-[30px]">
                Run a scan on your own image.
              </h2>
              <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
                {CALIBRATION_NOTE} Predictions shown here are realistic mock data while the
                analysis service is being wired up.
              </p>
            </div>
            <Link to="/scan">
              <MagneticButton>
                <ScanLine className="size-4" /> Open the scanner
              </MagneticButton>
            </Link>
          </div>
        </Glass>
      </section>
    </>
  );
}
