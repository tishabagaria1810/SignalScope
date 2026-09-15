import io
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image

# Import the original detector which has all the heuristics (VAE, crops, etc.)
from model.inference import SignalScopeDetector

detector = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global detector
    print("Initializing SignalScope ML Detector...")
    detector = SignalScopeDetector()
    yield
    detector = None

app = FastAPI(title="SignalScope API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/scan")
async def scan_image(file: UploadFile = File(...)):
    if not detector or not detector.is_loaded:
        return JSONResponse(status_code=500, content={"error": "Model not loaded"})

    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception as e:
        return JSONResponse(status_code=400, content={"error": "Invalid image file"})

    # Use the full inference pipeline (ResNet crops + VAE heuristics)
    try:
        result = detector.predict(image)
        return result
    except Exception as e:
        print(f"Error during inference: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
