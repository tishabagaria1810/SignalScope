import { createFileRoute } from "@tanstack/react-router";
import { Glass } from "@/components/glass";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [{ title: "SignalScope - Reports" }],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-24 sm:py-32">
      <h1 className="text-3xl font-bold tracking-tight text-foreground mb-8">Reports</h1>
      <Glass className="p-8">
        <p className="text-muted-foreground">
          Your generated reports will appear here. Run scans to gather intelligence and build detailed reports on manipulated images.
        </p>
      </Glass>
    </div>
  );
}
