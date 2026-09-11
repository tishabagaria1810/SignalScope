import { motion } from "motion/react";
import { Eyebrow, Glass } from "@/components/glass";
import type { AnalysisResult } from "@/lib/analysis";

export function SecondaryPanels({ result }: { result: AnalysisResult }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Glass className="p-5">
        <div className="relative z-[3]">
          <Eyebrow>Provenance &amp; metadata</Eyebrow>
          <dl className="mt-4 space-y-3 text-[13px]">
            {[
              ["C2PA", result.provenance.c2pa],
              ["EXIF", result.provenance.exif],
              ["Editing history", result.provenance.editingHistory],
              ["Source", result.provenance.source],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-subtle-foreground">{k}</dt>
                <dd className="mt-0.5 leading-relaxed text-muted-foreground">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Glass>

      <Glass className="p-5">
        <div className="relative z-[3]">
          <Eyebrow>Generator attribution</Eyebrow>
          <p className="mt-3 text-[12px] leading-relaxed text-subtle-foreground">
            Family-level likelihoods only. Attribution is weaker than the primary assessment and
            should not be quoted alone.
          </p>
          <ul className="mt-4 space-y-3">
            {result.attribution.map((a) => (
              <li key={a.family}>
                <div className="flex items-baseline justify-between text-[13px]">
                  <span className="text-muted-foreground">{a.family}</span>
                  <span className="font-mono text-subtle-foreground">
                    {(a.probability * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="mt-1.5 h-[3px] overflow-hidden rounded-[999px] bg-border">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${a.probability * 100}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, ease: [0.22, 0.61, 0.28, 1] }}
                    className="h-full rounded-[999px] bg-[var(--signal)]"
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Glass>

      <Glass className="p-5">
        <div className="relative z-[3]">
          <Eyebrow>Caption consistency</Eyebrow>
          <div className="mt-4 overflow-hidden rounded-xl border border-border">
            <img
              src={result.imageUrl}
              alt={result.filename}
              loading="lazy"
              className="aspect-[16/9] w-full object-cover"
            />
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
            “{result.caption}”
          </p>
          <p className="mt-2 text-[12px] leading-relaxed text-subtle-foreground">
            The generic caption is broadly consistent with the frame, so it neither supports nor
            weakens the assessment.
          </p>
        </div>
      </Glass>
    </div>
  );
}
