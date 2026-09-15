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
              ["C2PA", result.provenance.c2pa.label || result.provenance.c2pa.status],
              ["EXIF", result.provenance.exif.label || result.provenance.exif.status],
              ["Editing history", result.provenance.editingHistory.label || result.provenance.editingHistory.status],
              ["Source", result.provenance.source.label || result.provenance.source.status],
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
          {result.attribution?.status === "not_available" ? (
            <div className="mt-4 text-[13px] leading-relaxed text-muted-foreground">
              <span className="block mb-2 text-foreground">Not determined</span>
              <span className="block text-subtle-foreground">
                Current model identifies REAL vs AI but does not identify the specific generator.
              </span>
            </div>
          ) : (
             <div className="mt-4 text-[13px] text-muted-foreground">Not determined</div>
          )}
        </div>
      </Glass>

      <Glass className="p-5">
        <div className="relative z-[3]">
          <Eyebrow>Caption consistency</Eyebrow>
          <div className="mt-4 text-[13px] leading-relaxed text-muted-foreground">
              <span className="block mb-2 text-foreground">Not evaluated</span>
              <span className="block text-subtle-foreground">
                No independent image-caption consistency analysis is available.
              </span>
          </div>
        </div>
      </Glass>
    </div>
  );
}
