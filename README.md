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

## SIH 2026 Hackathon Requirements

### 1. Modules Built
- **Core Module:** AI vs. Real Image Classification.
- **Bonus Module A (Explainable AI):** Visual explainability using Grad-CAM with textual descriptions.
- **Bonus Module C/G (Robustness):** Robustness evaluation against JPEG compression and resizing.
- **Bonus Module D (Provenance):** C2PA / Content Credentials parsing.
- **Bonus Module E (Multimodal):** Caption consistency verification.

### 2. Setup and Run Instructions
To reproduce predictions locally in under 10 minutes:
1. Ensure Python 3.10+ and Node.js are installed.
2. Clone the repository and install dependencies:
   ```bash
   pip install -r requirements.txt
   npm i
   ```
3. Run the prediction script on any image:
   ```bash
   python model/predict.py public/real_test.jpg
   ```
4. Start the frontend:
   ```bash
   npm run dev
   ```

### 3. Datasets, Sources, and Licenses
- **Dataset Size:** 9250 standard test samples, 7500 unseen generator test samples.
- **Sources:** Various open-source datasets and internal generative AI sources.
- **Licenses:** MIT / Open source where applicable.

### 4. Metrics
- **Overall AUC (Standard Test Split):** 0.9828
- **Unseen-generator-split AUC:** 0.9847
- **Macro-F1:** 0.9361
- **Accuracy:** 0.9361 (Standard), 0.9424 (Unseen Generator)
- **FPR at chosen threshold (0.5):** 0.068
- **Confusion Matrix:** True Negatives: 4427, False Positives: 323, False Negatives: 268, True Positives: 4232

### 5. Architecture Overview
- **Model:** ResNet-18 Transfer Learning classifier with custom classification head.
- **Input:** 224x224 RGB image (with center crop validation for high resolutions).
- **Secondary Feature:** VAE 8x8 Latent Block Discontinuity Analysis for diffusion trace detection.

### 6. Robustness Approach
Evaluated against JPEG compression, spatial resizing, and Gaussian noise. The model maintains >0.97 AUC for JPEG qualities above 40.

### 7. Calibration Approach
Confidence is calibrated. The decision threshold (0.50 by default, 0.35 in some configs for unseen generators) maps directly to prediction likelihood, offering 'Likely AI', 'Likely Authentic', and 'Uncertain' margins.

### 8. Known Limitations
High JPEG compression (Quality <= 20) and aggressive spatial downscaling (Scale <= 25%) attenuate high-frequency generative artifacts, significantly reducing classification accuracy.

### 9. Demo Video & Deployment Links
- **Demo Video:** (https://drive.google.com/drive/folders/1i4Xvl8k6doj4xKroFw7K0esO_STG0IEB?usp=sharing)
- **Deployed Application:** Not yet deployed

