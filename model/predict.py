import sys
import os
import json
from PIL import Image

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from backend.model.inference import SignalScopeDetector

def predict(image_path: str):
    image = Image.open(image_path).convert('RGB')
    detector = SignalScopeDetector()
    return detector.predict(image)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        res = predict(sys.argv[1])
        print(json.dumps(res, indent=2))
    else:
        print("Usage: python predict.py <image_path>")
