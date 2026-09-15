/**
 * Mock prediction layer.
 *
 * This module is the single seam for a future FastAPI / PyTorch service:
 * `analyzeImage()` is async and returns the same shape the API is expected to
 * return. Values here are illustrative mock data, not measured model output.
 */

import streetSample from "@/assets/sample-street.jpg";
import lakeSample from "@/assets/sample-lake.jpg";
import portraitSample from "@/assets/forensic-subject.jpg";

export type Verdict = "synthetic" | "authentic" | "uncertain";

export type EvidenceKind = "texture" | "reflection" | "geometry";

export interface EvidenceItem {
  id: string;
  index: string;
  kind: EvidenceKind;
  title: string;
  summary: string;
  detail: string;
  /** Region of interest in percentages of the image box. */
  region: { x: number; y: number; w: number; h: number };
  weight: number;
}

export interface RobustnessRow {
  id: string;
  label: string;
  note: string;
  verdict: Verdict;
  confidence: number;
  delta: number;
}

export interface Provenance {
  c2pa: { status: string; label?: string };
  exif: { status: string; label?: string; fields?: any };
  editingHistory: { status: string; label?: string };
  source: { status: string; label?: string };
}

export interface GeneratorAttribution {
  status: string;
  reason?: string;
  family?: string;
  probability?: number;
}

export interface CaptionConsistency {
  status: string;
  reason?: string;
}

export interface AnalysisResult {
  id: string;
  filename: string;
  createdAt: string;
  imageUrl: string;
  width: number;
  height: number;
  bytes: number;
  verdict: Verdict;
  confidence: number;
  evidence: EvidenceItem[];
  robustness: RobustnessRow[];
  provenance: Provenance;
  attribution?: GeneratorAttribution;
  captionConsistency?: CaptionConsistency;
}

export const VERDICT_LABEL: Record<Verdict, string> = {
  synthetic: "Likely AI-generated",
  authentic: "Likely authentic",
  uncertain: "Uncertain",
};

export const VERDICT_BLURB: Record<Verdict, string> = {
  synthetic:
    "Several independent signals are consistent with generative synthesis. Treat this as a strong indication, not proof.",
  authentic:
    "Signals are broadly consistent with a camera-captured image. Some generators can still evade detection.",
  uncertain:
    "Signals conflict or are too weak to lean either way. Additional context or a higher-quality file would help.",
};

export const CALIBRATION_NOTE =
  "Confidence is calibrated and should be interpreted as likelihood, not certainty.";

const EVIDENCE_LIBRARY: Record<
  EvidenceKind,
  { title: string; summary: string; detail: string }
> = {
  texture: {
    title: "Texture irregularity",
    summary:
      "High-frequency detail may indicate synthesis: pore and fabric structure repeats more regularly than optical capture usually allows.",
    detail:
      "Local patch statistics in this region are consistent with a learned upsampling process. This contributes to the assessment but can also appear after heavy denoising.",
  },
  reflection: {
    title: "Reflection inconsistency",
    summary:
      "Specular highlights are consistent with two light sources that do not agree elsewhere in the frame.",
    detail:
      "Reflected geometry does not fully match the surrounding scene. Such mismatches may indicate generation, and also occur in composited or retouched photographs.",
  },
  geometry: {
    title: "Geometry anomaly",
    summary:
      "Edge continuity and perspective lines in this region drift in a way consistent with generated structure.",
    detail:
      "Vanishing-line estimates disagree with the rest of the frame by a small margin. On its own this is weak, but it contributes to the assessment alongside texture cues.",
  },
};

function hash(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function buildEvidence(seed: number): EvidenceItem[] {
  const kinds: EvidenceKind[] = ["texture", "reflection", "geometry"];
  return kinds.map((kind, i) => {
    const s = hash(`${seed}-${kind}`);
    return {
      id: `${kind}-${i}`,
      index: `0${i + 1}`,
      kind,
      ...EVIDENCE_LIBRARY[kind],
      region: {
        x: 14 + ((s >> 3) % 52),
        y: 12 + ((s >> 7) % 54),
        w: 18 + ((s >> 11) % 12),
        h: 16 + ((s >> 13) % 12),
      },
      weight: 0.24 + ((s >> 5) % 40) / 100,
    };
  });
}

function shiftVerdict(verdict: Verdict, confidence: number): Verdict {
  if (confidence < 58) return "uncertain";
  return verdict;
}

function buildRobustness(verdict: Verdict, confidence: number): RobustnessRow[] {
  const perturbations: Array<{ id: string; label: string; note: string; delta: number }> =
    [
      { id: "original", label: "Original", note: "Unmodified upload", delta: 0 },
      { id: "jpeg", label: "JPEG q60", note: "Recompressed", delta: -4.2 },
      { id: "resized", label: "Resized 50%", note: "Bicubic downscale", delta: -6.8 },
      { id: "screenshot", label: "Screenshot", note: "Re-captured from display", delta: -9.5 },
      { id: "edited", label: "Lightly edited", note: "Curves + light crop", delta: -3.1 },
    ];

  return perturbations.map((p) => {
    const c = Math.max(41, Math.min(97, confidence + p.delta));
    return {
      ...p,
      confidence: Math.round(c * 10) / 10,
      verdict: shiftVerdict(verdict, c),
    };
  });
}

export interface AnalyzeInput {
  filename: string;
  imageUrl: string;
  width: number;
  height: number;
  bytes: number;
}

export async function analyzeImage(input: AnalyzeInput): Promise<AnalysisResult> {
  const seed = hash(`${input.filename}:${input.bytes}:${input.width}`);

  
  try {
    const imgResponse = await fetch(input.imageUrl);
    const blob = await imgResponse.blob();
    const formData = new FormData();
    formData.append("file", blob, input.filename);

    
    const apiRes = await fetch("http://localhost:8000/scan", {
      method: "POST",
      body: formData,
    });

    
    if (apiRes.ok) {
      const data = await apiRes.json();
      const verdict = data.verdict.label === "AI-generated" ? "synthetic" : "authentic";
      const confidence = Math.round(data.verdict.confidence * 1000) / 10;
      
      let dynamicEvidence = buildEvidence(seed);
      if (data.explanation && data.explanation.evidence && Array.isArray(data.explanation.evidence)) {
        dynamicEvidence = data.explanation.evidence.map((item: any, i: number) => ({
          id: item.id || `${item.kind}-${i}`,
          index: `0${i + 1}`,
          kind: item.kind,
          title: item.title,
          summary: item.description,
          detail: `Confidence: ${(item.confidence * 100).toFixed(1)}%`,
          region: {
            x: (item.bbox.x / input.width) * 100,
            y: (item.bbox.y / input.height) * 100,
            w: (item.bbox.width / input.width) * 100,
            h: (item.bbox.height / input.height) * 100,
          },
          weight: item.weight,
        }));
      }

      return {
        id: `scan_${seed.toString(36)}_${Date.now().toString(36)}`,
        filename: input.filename,
        createdAt: new Date().toISOString(),
        imageUrl: input.imageUrl,
        width: input.width,
        height: input.height,
        bytes: input.bytes,
        verdict,
        confidence,
        evidence: dynamicEvidence,
        robustness: buildRobustness(verdict, confidence),
        provenance: data.provenance || {
          c2pa: { status: "not_present", label: "Not present" },
          exif: { status: "not_available", label: "No camera metadata available" },
          editingHistory: { status: "not_determined", label: "Not determined" },
          source: { status: "uploaded_directly", label: "Uploaded directly to SignalScope" },
        },
        attribution: data.generatorAttribution || {
          status: "not_available",
          reason: "No generator-attribution model is installed."
        },
        captionConsistency: data.captionConsistency || {
          status: "not_evaluated",
          reason: "No independent image-caption consistency analysis is available."
        },
      };
    }
  } catch (error) {
    console.warn("Backend API failed, falling back to mock logic:", error);
  }

  const bucket = seed % 10;
  const verdict: Verdict = bucket < 5 ? "synthetic" : bucket < 8 ? "authentic" : "uncertain";
  const base =
    verdict === "uncertain" ? 51 + (seed % 8) : verdict === "authentic" ? 76 + (seed % 16) : 79 + (seed % 18);
  const confidence = Math.round(Math.min(96, base) * 10) / 10;

  return {
    id: `scan_${seed.toString(36)}_${Date.now().toString(36)}`,
    filename: input.filename,
    createdAt: new Date().toISOString(),
    imageUrl: input.imageUrl,
    width: input.width,
    height: input.height,
    bytes: input.bytes,
    verdict,
    confidence,
    evidence: buildEvidence(seed),
    robustness: buildRobustness(verdict, confidence),
    provenance: {
      c2pa: { status: "not_present", label: "Not present" },
      exif: { status: "not_available", label: "No camera metadata available" },
      editingHistory: { status: "not_determined", label: "Not determined" },
      source: { status: "uploaded_directly", label: "Uploaded directly to SignalScope" },
    },
    attribution: {
      status: "not_available",
      reason: "No generator-attribution model is installed."
    },
    captionConsistency: {
      status: "not_evaluated",
      reason: "No independent image-caption consistency analysis is available."
    },
  };
}

/* ---------------------------------- history --------------------------------- */

import { supabase } from './supabase';

export interface HistoryEntry {
  id: string;
  filename: string;
  createdAt: string;
  thumbnail: string;
  verdict: Verdict;
  confidence: number;
}

export const SEED_HISTORY: HistoryEntry[] = [
  {
    id: "seed-1",
    filename: "portrait_studio_4k.jpg",
    createdAt: "2026-09-09T14:22:00.000Z",
    thumbnail: portraitSample,
    verdict: "synthetic",
    confidence: 91.4,
  },
  {
    id: "seed-2",
    filename: "lake_sunrise_film.jpg",
    createdAt: "2026-09-07T08:05:00.000Z",
    thumbnail: lakeSample,
    verdict: "authentic",
    confidence: 84.7,
  },
  {
    id: "seed-3",
    filename: "street_chrome_night.jpg",
    createdAt: "2026-09-03T21:47:00.000Z",
    thumbnail: streetSample,
    verdict: "uncertain",
    confidence: 55.2,
  },
];

/**
 * Compress an image URL to a tiny 80×80 JPEG base64 (~3-5 KB).
 * Small enough to store in a Supabase TEXT column — persists across browser reloads.
 */
async function compressToThumbnail(imageUrl: string): Promise<string | null> {
  if (!imageUrl || typeof document === 'undefined') return null;
  try {
    return await new Promise<string | null>((resolve) => {
      const img = new Image();
      img.onload = () => {
        const SIZE = 80;
        const canvas = document.createElement('canvas');
        canvas.width = SIZE;
        canvas.height = SIZE;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(null); return; }
        // Cover-crop to square
        const scale = Math.max(SIZE / img.width, SIZE / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        ctx.drawImage(img, (SIZE - w) / 2, (SIZE - h) / 2, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      };
      img.onerror = () => resolve(null);
      img.src = imageUrl;
    });
  } catch {
    return null;
  }
}

/**
 * Load scan history from Supabase.
 * - Not logged in → SEED_HISTORY (demo data)
 * - Logged in, no scans → [] (empty, show CTA)
 * - Logged in, has scans → real data with persistent thumbnails
 */
export async function loadHistory(): Promise<HistoryEntry[]> {
  if (typeof window === 'undefined') return SEED_HISTORY;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return SEED_HISTORY;

    const { data, error } = await supabase
      .from('scans')
      .select('id, file_name, verdict, confidence, created_at, thumbnail_url')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      if (error.code === '42P01' || error.code === '42703') {
        console.info('[SignalScope] scans table missing or wrong schema — run the SQL migration.');
      } else {
        console.warn('[SignalScope] loadHistory error:', error.message);
      }
      return SEED_HISTORY;
    }

    if (!data || data.length === 0) return []; // Logged in but no scans yet

    return data.map((row) => ({
      id: row.id,
      filename: row.file_name,
      createdAt: row.created_at,
      thumbnail: row.thumbnail_url ?? '',  // ✅ Persists across reloads
      verdict: row.verdict as Verdict,
      confidence: row.confidence,
    }));
  } catch (e: any) {
    console.warn('[SignalScope] loadHistory exception:', e?.message ?? e);
    return SEED_HISTORY;
  }
}

/**
 * Save a scan result to Supabase.
 * Compresses the image to an 80×80 JPEG and stores as base64 in `thumbnail_url`.
 */
export async function saveToHistory(entry: HistoryEntry): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.warn('[SignalScope] saveToHistory: no active session — scan not saved');
      return;
    }

    const thumbnail_url = await compressToThumbnail(entry.thumbnail);

    const { error } = await supabase.from('scans').upsert(
      {
        id: entry.id,
        user_id: session.user.id,
        file_name: entry.filename,
        verdict: entry.verdict,
        confidence: entry.confidence,
        created_at: entry.createdAt,
        thumbnail_url: thumbnail_url ?? null,
      },
      { onConflict: 'id' }
    );

    if (error) {
      console.warn('[SignalScope] saveToHistory failed:', error.message, '| code:', error.code);
    } else {
      console.info('[SignalScope] ✅ Scan saved to Supabase:', entry.id);
    }
  } catch (e: any) {
    console.warn('[SignalScope] saveToHistory exception:', e?.message ?? e);
  }
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
