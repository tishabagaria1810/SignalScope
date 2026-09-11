import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Eyebrow, Glass } from "@/components/glass";
import { CALIBRATION_NOTE } from "@/lib/analysis";
import { SCAN_STAGES } from "@/components/ScanStages";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How SignalScope works — stages, evidence and limits" },
      {
        name: "description",
        content:
          "The five analysis stages behind a SignalScope assessment, how evidence is localized, and the limits of synthetic-media detection.",
      },
      { property: "og:title", content: "How SignalScope works" },
      {
        property: "og:description",
        content:
          "Analysis stages, localized evidence, robustness checks and the honest limits of detection.",
      },
    ],
  }),
  component: HowItWorks,
});

const STAGE_NOTES: Record<string, string> = {
  "Pre-processing": "Decode, normalise colour, and record dimensions and compression history.",
  "Visual analysis": "Assess texture, lighting and geometry at multiple scales.",
  "Signal extraction": "Pull frequency-domain and residual features that generators tend to leave.",
  "Confidence calibration":
    "Map raw scores onto a calibrated likelihood so 80% means roughly 80% of similar cases.",
  "Evidence localization": "Attribute the score back to specific regions of the frame.",
};

const LIMITS = [
  "A high likelihood is not proof. Editing, heavy compression and unusual capture conditions can all mimic generative artefacts.",
  "A low likelihood is not a clearance. Newer generators, careful post-processing and screenshots reduce the signals available.",
  "Provenance data can be stripped or forged, so absent C2PA or EXIF is context, not evidence.",
  "Assessments should support human judgement, never replace it — especially for anything consequential.",
];

function HowItWorks() {
  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-28 sm:pt-36">
      <Eyebrow>How it works</Eyebrow>
      <h1 className="text-balance-tight mt-3 text-[30px] font-semibold leading-tight sm:text-[44px]">
        Five stages, one calibrated likelihood, and the evidence behind it.
      </h1>
      <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
        {CALIBRATION_NOTE}
      </p>

      <div className="mt-10 space-y-3">
        {SCAN_STAGES.map((stage, i) => (
          <motion.div
            key={stage}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, delay: i * 0.05, ease: [0.22, 0.61, 0.28, 1] }}
          >
            <Glass className="p-5">
              <div className="relative z-[3] flex gap-4">
                <span className="font-mono text-[12px] text-subtle-foreground">0{i + 1}</span>
                <div className="min-w-0">
                  <h2 className="text-[16px] font-medium">{stage}</h2>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-muted-foreground">
                    {STAGE_NOTES[stage]}
                  </p>
                </div>
              </div>
            </Glass>
          </motion.div>
        ))}
      </div>

      <h2 className="mt-14 text-[22px] font-semibold sm:text-[26px]">Limits worth stating</h2>
      <ul className="mt-5 space-y-3">
        {LIMITS.map((limit) => (
          <li
            key={limit}
            className="flex gap-3 text-[14px] leading-relaxed text-muted-foreground"
          >
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--signal)]" />
            {limit}
          </li>
        ))}
      </ul>

      <p className="mt-10 text-[13px] leading-relaxed text-subtle-foreground">
        Results in this build come from realistic mock data. No accuracy figures are claimed,
        and no model is running yet — the interface is structured so a prediction service can be
        connected without changing what you see here.
      </p>
    </div>
  );
}
