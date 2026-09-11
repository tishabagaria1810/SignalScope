import { motion } from "motion/react";
import { useRef, useState } from "react";
import { ImageUp, Replace, ScanLine, Trash2 } from "lucide-react";
import { Eyebrow, Glass, MagneticButton } from "@/components/glass";
import { formatBytes } from "@/lib/analysis";
import { cn } from "@/lib/utils";

export interface PickedImage {
  filename: string;
  imageUrl: string;
  width: number;
  height: number;
  bytes: number;
}

export function Uploader({
  picked,
  onPick,
  onClear,
  onAnalyze,
  busy,
}: {
  picked: PickedImage | null;
  onPick: (image: PickedImage) => void;
  onClear: () => void;
  onAnalyze: () => void;
  busy: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      onPick({
        filename: file.name,
        imageUrl: url,
        width: img.naturalWidth,
        height: img.naturalHeight,
        bytes: file.size,
      });
    };
    img.src = url;
  };

  return (
    <Glass className="p-4 sm:p-6">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />

      {!picked ? (
        <motion.div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file) handleFile(file);
          }}
          onClick={() => inputRef.current?.click()}
          animate={{ scale: dragging ? 1.01 : 1 }}
          transition={{ type: "spring", stiffness: 240, damping: 23 }}
          className={cn(
            "relative z-[3] flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-14 text-center transition-colors duration-300",
            dragging ? "border-[var(--signal)] bg-[var(--signal-soft)]" : "border-border",
          )}
        >
          <span className="glass-surface grid size-14 place-items-center rounded-[999px]">
            <ImageUp className="relative z-[3] size-6 text-muted-foreground" />
          </span>
          <p className="mt-5 text-[17px] font-medium">Drop an image to analyze</p>
          <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-subtle-foreground">
            JPEG, PNG or WebP. Files stay in your browser — nothing is uploaded while the
            prediction service is mocked.
          </p>
        </motion.div>
      ) : (
        <div className="relative z-[3] grid gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:items-center">
          <div className="overflow-hidden rounded-2xl border border-border">
            <img
              src={picked.imageUrl}
              alt={picked.filename}
              loading="lazy"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <Eyebrow>Selected file</Eyebrow>
            <p className="mt-2 truncate text-[17px] font-medium">{picked.filename}</p>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-[13px]">
              <div>
                <dt className="text-subtle-foreground">Dimensions</dt>
                <dd className="mt-0.5 font-mono">
                  {picked.width} × {picked.height}
                </dd>
              </div>
              <div>
                <dt className="text-subtle-foreground">Size</dt>
                <dd className="mt-0.5 font-mono">{formatBytes(picked.bytes)}</dd>
              </div>
            </dl>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <MagneticButton onClick={onAnalyze} disabled={busy}>
                <ScanLine className="size-4" /> {busy ? "Analyzing…" : "Analyze image"}
              </MagneticButton>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-[999px] px-4 py-2.5 text-[14px] text-muted-foreground transition-colors hover:text-foreground"
              >
                <Replace className="size-4" /> Replace
              </button>
              <button
                type="button"
                onClick={onClear}
                className="inline-flex items-center gap-2 rounded-[999px] px-4 py-2.5 text-[14px] text-muted-foreground transition-colors hover:text-foreground"
              >
                <Trash2 className="size-4" /> Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </Glass>
  );
}
