import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Uploader, type PickedImage } from "@/components/Uploader";
import { ScanStages, SCAN_STAGES } from "@/components/ScanStages";
import { VerdictPanel } from "@/components/VerdictPanel";
import { SecondaryPanels } from "@/components/SecondaryPanels";
import { EvidenceViewer } from "@/components/EvidenceViewer";
import { analyzeImage, type AnalysisResult, saveToHistory } from "@/lib/analysis";

export const Route = createFileRoute("/scan")({
  head: () => ({
    meta: [{ title: "SignalScope - Scan" }],
  }),
  component: ScanPage,
});

function ScanPage() {
  const [picked, setPicked] = useState<PickedImage | null>(null);
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState(-1);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleClear = () => {
    setPicked(null);
    setResult(null);
    setStage(-1);
  };

  const handleAnalyze = async () => {
    if (!picked) return;
    setBusy(true);
    setStage(0);
    
    // Simulate stages
    for (let i = 1; i < SCAN_STAGES.length; i++) {
      await new Promise(r => setTimeout(r, 800));
      setStage(i);
    }
    
    const res = await analyzeImage(picked);
    
    await new Promise(r => setTimeout(r, 500));
    setResult(res);
    setBusy(false);

    saveToHistory({
      id: res.id,
      filename: res.filename,
      createdAt: res.createdAt,
      thumbnail: res.imageUrl,
      verdict: res.verdict,
      confidence: res.confidence,
    });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-24 sm:py-32 space-y-8">
      {!result ? (
        <>
          <Uploader
            picked={picked}
            onPick={setPicked}
            onClear={handleClear}
            onAnalyze={handleAnalyze}
            busy={busy}
          />
          {busy && picked && (
            <div className="animate-in fade-in slide-in-from-bottom-4">
               <ScanStages imageUrl={picked.imageUrl} stage={stage} />
            </div>
          )}
        </>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
           <VerdictPanel result={result} />
           <EvidenceViewer result={result} />
           <SecondaryPanels result={result} />
           <div className="flex justify-center pt-4">
             <button
               onClick={handleClear}
               className="inline-flex items-center justify-center rounded-[999px] bg-secondary px-6 py-3 text-[14px] font-medium transition-colors hover:bg-secondary/80"
             >
               Scan another image
             </button>
           </div>
        </div>
      )}
    </div>
  );
}
