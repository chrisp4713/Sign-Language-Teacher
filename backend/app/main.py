import csv
import os
import threading
from typing import List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from . import model
from .features import N_FEATURES, landmarks_to_features

app = FastAPI(title="ASL App API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:5173").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

COLLECTED_CSV = model.ROOT / "data" / "collected.csv"
_csv_lock = threading.Lock()


class HandPayload(BaseModel):
    # 21 landmarks, each [x, y, z], straight from MediaPipe (normalized image coords)
    landmarks: List[List[float]] = Field(..., min_length=21, max_length=21)
    handedness: str = "Right"


class CollectPayload(HandPayload):
    label: str = Field(..., min_length=1, max_length=16)


def _features(payload: HandPayload):
    if any(len(p) != 3 for p in payload.landmarks):
        raise HTTPException(422, "Each landmark must be [x, y, z].")
    return landmarks_to_features(payload.landmarks, payload.handedness)


@app.get("/health")
def health():
    bundle = model.load_bundle()
    return {
        "status": "ok",
        "model_loaded": bundle is not None,
        "classes": [str(c) for c in bundle["classes"]] if bundle else [],
    }


@app.post("/predict")
def predict(payload: HandPayload):
    result = model.predict(_features(payload))
    if result is None:
        raise HTTPException(
            503, "No trained model found. Run scripts.extract_landmarks then scripts.train."
        )
    return result


@app.post("/collect")
def collect(payload: CollectPayload):
    """Append one labelled sample to data/collected.csv (teammates' own recordings)."""
    feats = _features(payload)
    with _csv_lock:
        new_file = not COLLECTED_CSV.exists()
        with open(COLLECTED_CSV, "a", newline="") as f:
            writer = csv.writer(f)
            if new_file:
                writer.writerow(["label"] + [f"f{i}" for i in range(N_FEATURES)])
            writer.writerow([payload.label.upper()] + feats.tolist())
    return {"saved": True}
