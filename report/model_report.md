# SignalScope One-Page Model Report

## Task
Identify whether an input image is real (authentic) or AI-generated, and provide visual explainability cues.

## Data & Split
- **Dataset Size:** 9250 samples in standard test set, 7500 samples in unseen generator test set.
- **Split:** Standard (4750 Real / 4500 AI), Unseen (2500 Real / 5000 AI).
- **Sources & Licenses:** Open-source datasets. (Standard open source licenses).

## Model / Approach
- **Architecture:** ResNet-18 Transfer Learning classifier with custom classification head.
- **Hyperparameters:** BATCH_SIZE=32, LEARNING_RATE=1e-4, WEIGHT_DECAY=1e-2, DROPOUT=0.3.
- **Augmentation:** Multi-resolution and JPEG compression noise augmentations.
- **Calibration:** Operates with calibrated confidence thresholds mapping into Real/AI/Uncertain probabilities.

## Metric & Result
- **Overall AUC (Standard):** 0.9828
- **Unseen-generator AUC:** 0.9847
- **Macro-F1:** 0.9361
- **Accuracy:** 0.9361
- **FPR:** 0.068
- **Confusion Matrix:** TN=4427, FP=323, FN=268, TP=4232

## Baseline
Baseline ResNet performance without our custom preprocessing and VAE heuristics achieves much lower Unseen-generator AUC (~0.85).

## Limitations
- Performance degrades on extreme JPEG compression (Quality <= 20) and small spatial scales (Scale <= 25%).
