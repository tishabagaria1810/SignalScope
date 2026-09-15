# Explanation Samples (Module A)

The model utilizes Grad-CAM (Gradient-weighted Class Activation Mapping) on the final ResNet-18 layer to isolate high-contribution regions for its decision.

## Sample Execution Pipeline
- **Input:** Image is resized to 224x224.
- **Prediction:** Output logit calculates a probability score (e.g. 0.92 = AI-Generated).
- **Saliency:** Gradients from the target class are passed back to `layer4[-1]` to create a spatial heatmap.
- **Region Highlighting:** The pipeline applies contours to find bounding boxes of hot spots on the heatmap.

## Textual Explanation Grounding
Rather than fabricating reasons, we compute regional statistics inside the hot spots:
1. **Texture Irregularity (Laplacian Variance):** Measures high-frequency noise deviations compared to the whole image.
2. **Geometry Anomaly (Canny Edge Density):** Compares edge-density consistency.
3. **Lighting Inconsistency (Intensity Variance):** Measures abnormal local contrast shifts.

If a region has a disproportionate Laplacian variance, the explanation outputs: "High-frequency texture statistics in this region contributed strongly to the classification."
This ensures all explanations are bounded by actual evidence rather than hallucinated text.
