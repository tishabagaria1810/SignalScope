# SignalScope Vision

Build the complete SignalScope frontend as a polished production-style React web app.

PRODUCT:

SignalScope — “Telling Real From Synthetic in the Age of Generative Media.”

Core flow:

Landing → Scroll-Zoom Hero → Upload → Scan → Result → Evidence → Explanation → History.

VISUAL THEME — EXACT LIQUID GLASS:

Use Inter/system sans.

Light bg #ecedf2, dark bg #06070c.

Light text #171a21/#4a5060/#7c8496.

Dark text #eef1f8/#a7b0c4/#6c7591.

Glass: translucent white/light-blue tint, backdrop blur 7–8px, saturation 150–180%.

Use illuminated 1px rim, subtle refraction/warp, cursor-following radial sheen, deep soft shadows, 999px pill radius.

Light mesh: pink/amber/blue/purple.

Dark mesh: indigo/magenta/cyan/violet.

Add a subtle 46px center-focused grid.

Do NOT use generic SaaS cards, neon cyberpunk, or basic glassmorphism.

NAV:

Floating pill nav: Overview, Scan, History, How It Works + theme toggle.

68px desktop / 58px mobile.

Active item uses a spring-moving glass capsule.

Primary easing: cubic-bezier(.22,.61,.28,1).

Spring: stiffness 240, damping 23.

HERO:

Create a full-screen cinematic Motion-style Scroll Zoom Hero.

Central forensic image inside Liquid Glass.

On vertical scroll:

image zooms toward viewer → glass frame expands → mesh/parallax moves → headline fades/scales → forensic labels appear → scan beam sweeps → heatmap/evidence markers emerge → hero continuously transforms into the analysis interface.

Narrative: DISCOVER → ZOOM → INSPECT → ANALYZE → UNDERSTAND.

Use Motion/Framer Motion scroll-linked transforms.

UPLOAD / SCAN:

Premium drag-and-drop image area with preview, filename, dimensions, size, replace/remove and Analyze Image.

Scanning animation: beam sweep, signal pulses, analysis rings, progressive stages:

Pre-processing → Visual Analysis → Signal Extraction → Confidence Calibration → Evidence Localization.

RESULT:

Create 3 states:

LIKELY AI-GENERATED

LIKELY AUTHENTIC

UNCERTAIN

Show large confidence percentage + animated confidence ring.

Use responsible language; never “100% fake” or “definitely AI”.

Add “Confidence is calibrated and should be interpreted as likelihood, not certainty.”

EVIDENCE:

Large image viewer with Original / Evidence / Overlay / Heatmap.

Localized heatmap only.

Evidence markers 01/02/03.

Clicking a marker highlights both the image region and matching explanation card.

EXPLANATION:

“Why SignalScope thinks this”

Cards for Texture Irregularity, Reflection Inconsistency, Geometry Anomaly.

Use cautious language: “may indicate”, “consistent with”, “contributes to the assessment”.

HORIZONTAL SCROLL:

Create a sticky Motion-style scroll-linked horizontal gallery for Evidence:

Original → Texture → Lighting → Geometry → Heatmap.

Vertical scrolling drives horizontal movement; NOT a normal carousel.

Create another sticky horizontal gallery for Robustness:

Original → JPEG → Resized → Screenshot → Lightly Edited.

Show verdict, confidence and confidence delta for each.

OPTIONAL PANELS:

Provenance & Metadata: C2PA, EXIF, editing history, source.

Generator Attribution: diffusion/GAN family probabilities.

Caption Consistency: image + generic caption.

Keep these secondary to the main verdict.

HISTORY:

Searchable scan history with thumbnail, filename, date, verdict and confidence.

Filters: All / Authentic / AI-generated / Uncertain.

MOTION:

Use Motion/Framer Motion extensively but purposefully:

scroll zoom, horizontal scroll galleries, parallax, spring capsule, magnetic CTA, scanning beam, heatmap reveal, evidence synchronization, confidence count-up, glass tilt, theme transition and smooth page transitions.

Use premium cinematic motion, never cartoonish.

Support prefers-reduced-motion.

RESPONSIVE:

Desktop 1440, tablet 1024, mobile 390.

At ≤620px reduce nav to 58px, icons to 20px, text to 15px, stack result panels and simplify parallax.

ARCHITECTURE:

Use reusable components and shared theme tokens.

Keep frontend ready for a future FastAPI/PyTorch prediction API.

Use realistic mock prediction data for now.

Do not build a fake backend or invent ML accuracy.

IMPORTANT:

Build the frontend in ONE coherent pass.

Reuse components instead of duplicating them.

Prioritize:

1. Hero

2. Upload/scan

3. Result

4. Evidence/heatmap

5. Horizontal galleries

6. Responsive polish

Do not waste effort on unnecessary marketing sections.



## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
