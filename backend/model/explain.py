"""Grad-CAM Visual Explainability module for SignalScope (Bonus Module A)."""

import os
import cv2
import base64
from io import BytesIO
from typing import Dict, Any, Tuple, List, Optional
import numpy as np
from PIL import Image
import torch
import torch.nn as nn
import torch.nn.functional as F

from model.config import DEVICE, NORMALIZE_MEAN, NORMALIZE_STD, IMAGE_SIZE
from model.transforms import get_inference_transforms

class GradCAM:
    """Computes genuine Gradient-weighted Class Activation Mapping (Grad-CAM)."""

    def __init__(self, model: nn.Module, target_layer: nn.Module) -> None:
        self.model = model
        self.target_layer = target_layer
        self.gradients: Optional[torch.Tensor] = None
        self.activations: Optional[torch.Tensor] = None

        # Register forward and backward hooks
        self.target_layer.register_forward_hook(self._save_activation)
        self.target_layer.register_full_backward_hook(self._save_gradient)

    def _save_activation(self, module: nn.Module, input: Any, output: torch.Tensor) -> None:
        self.activations = output.detach()

    def _save_gradient(self, module: nn.Module, grad_input: Any, grad_output: Tuple[torch.Tensor, ...]) -> None:
        self.gradients = grad_output[0].detach()

    def generate_heatmap(self, input_tensor: torch.Tensor, class_idx: int = 0) -> np.ndarray:
        """Generates a normalized 2D Grad-CAM heatmap array (values 0.0 to 1.0)."""
        self.model.eval()

        # Forward pass
        logit = self.model(input_tensor)
        self.model.zero_grad()

        # Target score: for binary classification with 1 logit, positive means AI, negative means Real
        if logit.numel() == 1:
            score = logit[0] if class_idx == 1 else -logit[0]
        else:
            score = logit[0, class_idx] if logit.size(1) > class_idx else logit[0]
        score.backward(retain_graph=True)

        if self.gradients is None or self.activations is None:
            return np.zeros((IMAGE_SIZE[1], IMAGE_SIZE[0]), dtype=np.float32)

        # Global Average Pooling of gradients
        weights = torch.mean(self.gradients, dim=(2, 3), keepdim=True)
        cam = torch.sum(weights * self.activations, dim=1, keepdim=True)
        cam = F.relu(cam)

        cam_np = cam.squeeze().cpu().numpy()
        cam_np = cam_np - np.min(cam_np)
        max_val = np.max(cam_np)
        if max_val > 1e-7:
            cam_np = cam_np / max_val

        # Resize heatmap to input image size
        cam_img = Image.fromarray((cam_np * 255).astype(np.uint8))
        cam_img = cam_img.resize(IMAGE_SIZE, resample=Image.Resampling.BILINEAR)
        return np.array(cam_img, dtype=np.float32) / 255.0


def extract_evidence_regions(heatmap: np.ndarray, pil_image: Image.Image, predicted_label: str, base_confidence: float) -> List[Dict[str, Any]]:
    """Extracts bounding boxes and computes measurable statistics to categorize evidence."""
    # Scale heatmap back to original image size for accurate ROI extraction
    orig_w, orig_h = pil_image.size
    scaled_heatmap = cv2.resize(heatmap, (orig_w, orig_h))
    
    # Threshold to find hot regions (> 50% of max)
    thresh_val = np.max(scaled_heatmap) * 0.5
    if thresh_val < 0.1: # Fallback if heatmap is extremely flat
        thresh_val = 0.1
    
    thresh = (scaled_heatmap > thresh_val).astype(np.uint8) * 255
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    gray_img = np.array(pil_image.convert('L'))
    img_lap_var = cv2.Laplacian(gray_img, cv2.CV_64F).var()
    img_edges = cv2.Canny(gray_img, 100, 200)
    img_edge_density = np.sum(img_edges) / (orig_w * orig_h * 255 + 1e-6)
    img_var = np.var(gray_img)
    
    regions = []
    
    for idx, cnt in enumerate(contours):
        x, y, w, h = cv2.boundingRect(cnt)
        if w < orig_w * 0.05 or h < orig_h * 0.05:
            continue # Skip tiny regions
            
        roi = gray_img[y:y+h, x:x+w]
        if roi.size == 0:
            continue
            
        # 1. Texture measure (Laplacian variance)
        roi_lap_var = cv2.Laplacian(roi, cv2.CV_64F).var()
        # 2. Geometry/Edge measure
        roi_edges = cv2.Canny(roi, 100, 200)
        roi_edge_density = np.sum(roi_edges) / (w * h * 255 + 1e-6)
        # 3. Lighting/Contrast variance
        roi_var = np.var(roi)
        
        # Determine category based on most dominant deviation
        tex_ratio = roi_lap_var / (img_lap_var + 1e-6)
        edge_ratio = roi_edge_density / (img_edge_density + 1e-6)
        var_ratio = roi_var / (img_var + 1e-6)
        
        # Calculate region weight based on Grad-CAM activation
        roi_heatmap = scaled_heatmap[y:y+h, x:x+w]
        region_weight = float(np.sum(roi_heatmap) / (np.sum(scaled_heatmap) + 1e-6))
        
        # Determine human-readable descriptions based on label
        if tex_ratio > edge_ratio and tex_ratio > var_ratio:
            kind = "texture"
            title = "Texture irregularity" if predicted_label == "AI-generated" else "Natural texture variation"
            desc = "High-frequency texture statistics in this region contributed strongly to the classification." if predicted_label == "AI-generated" else "Local texture statistics are consistent with naturally captured image detail."
            feature_name = "laplacian_variance"
            feature_val = roi_lap_var
            base_val = img_lap_var
        elif edge_ratio > var_ratio:
            kind = "geometry"
            title = "Geometry anomaly" if predicted_label == "AI-generated" else "Consistent geometry"
            desc = "Edge continuity and geometry density differs from expected natural patterns." if predicted_label == "AI-generated" else "Edge transitions and geometry density are consistent with optical capture."
            feature_name = "canny_edge_density"
            feature_val = roi_edge_density
            base_val = img_edge_density
        else:
            kind = "reflection" # or lighting
            title = "Lighting inconsistency" if predicted_label == "AI-generated" else "Consistent lighting"
            desc = "Local illumination and contrast statistics contributed to the classification." if predicted_label == "AI-generated" else "Highlight and shadow transitions are spatially consistent across this region."
            feature_name = "intensity_variance"
            feature_val = roi_var
            base_val = img_var

        regions.append({
            "id": f"region-{idx+1}",
            "kind": kind,
            "title": title,
            "description": desc,
            "weight": round(region_weight, 4),
            "attribution_score": round(region_weight, 4),
            "confidence": round(min(1.0, base_confidence * (0.8 + 0.2 * region_weight)), 4),
            "feature": feature_name,
            "feature_value": round(float(feature_val), 4),
            "baseline_value": round(float(base_val), 4),
            "bbox": {
                "x": int(x),
                "y": int(y),
                "width": int(w),
                "height": int(h)
            }
        })
        
    # Sort by weight descending
    regions.sort(key=lambda x: x["weight"], reverse=True)
    # Take top 3 max to avoid clutter
    return regions[:3]


def generate_visual_explanation(
    model: nn.Module,
    pil_image: Image.Image,
    predicted_label: str,
    confidence: float,
) -> Dict[str, Any]:
    """Generates visual explanation cues and heatmap summary for an input image."""
    model.eval()
    transform = get_inference_transforms()
    # Grad-CAM requires gradient tracking on the tensor
    tensor = transform(pil_image.resize(IMAGE_SIZE, resample=Image.Resampling.BILINEAR)).unsqueeze(0).to(DEVICE)
    tensor.requires_grad = True

    target_layer = model.get_gradcam_target_layer()
    gradcam = GradCAM(model, target_layer)

    heatmap_grid = gradcam.generate_heatmap(tensor, class_idx=1 if predicted_label == "AI-generated" else 0)

    # Calculate regional intensity stats for summary
    peak_intensity = float(np.max(heatmap_grid))
    
    # Extract evidence regions using computer vision
    evidence_items = extract_evidence_regions(heatmap_grid, pil_image, predicted_label, confidence)
    
    # Normalize weights so they sum to ~1.0 if there are items
    total_weight = sum(item["weight"] for item in evidence_items)
    if total_weight > 0:
        for item in evidence_items:
            item["weight"] = round(item["weight"] / total_weight, 4)

    # Generate a base64 overlay of the heatmap
    import matplotlib.pyplot as plt
    from matplotlib import cm
    heatmap_colored = np.uint8(255 * cm.jet(heatmap_grid)[..., :3])
    heatmap_pil = Image.fromarray(heatmap_colored).resize(pil_image.size, Image.Resampling.BILINEAR)
    
    # Blend with original image
    overlay = Image.blend(pil_image.convert('RGB'), heatmap_pil, alpha=0.4)
    buffer = BytesIO()
    overlay.save(buffer, format="JPEG")
    overlay_b64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
    
    buffer_hm = BytesIO()
    heatmap_pil.save(buffer_hm, format="JPEG")
    heatmap_b64 = base64.b64encode(buffer_hm.getvalue()).decode('utf-8')

    summary = (
        f"The model classified this image as {predicted_label} based on several high-contribution regions."
    )

    return {
        "visual_evidence": {
            "heatmap_available": True,
            "target_layer": "backbone.layer4[-1]",
            "peak_saliency_intensity": round(peak_intensity, 4),
            "regional_distribution": {
                "top": 0.0,
                "bottom": 0.0,
                "left": 0.0,
                "right": 0.0,
            }
        },
        "explanation": {
            "summary": summary,
            "evidence": evidence_items,
            "heatmap_base64": f"data:image/jpeg;base64,{heatmap_b64}",
            "overlay_base64": f"data:image/jpeg;base64,{overlay_b64}"
        }
    }
