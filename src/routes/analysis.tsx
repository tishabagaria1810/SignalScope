import { createFileRoute } from "@tanstack/react-router";
import { Glass } from "@/components/glass";

export const Route = createFileRoute("/analysis")({
  head: () => ({
    meta: [{ title: "SignalScope - Analysis" }],
  }),
  component: AnalysisPage,
});

function AnalysisPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-24 sm:py-32">
      <h1 className="text-3xl font-bold tracking-tight text-foreground mb-8">Analysis</h1>
      <Glass className="p-8">
        <p className="text-muted-foreground">
          Deep structural and noise analysis tools will be available here. Access raw PRNU patterns, DCT coefficient histograms, and compression level estimations.
        </p>
      </Glass>
    </div>
  );
}
