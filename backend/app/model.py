import os
from pathlib import Path

import joblib
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
MODEL_PATH = Path(os.getenv("MODEL_PATH", ROOT / "models" / "asl_letters.joblib"))

_bundle = None


def load_bundle():
    """Lazy-load the trained model. Returns None if it hasn't been trained yet."""
    global _bundle
    if _bundle is None and MODEL_PATH.exists():
        _bundle = joblib.load(MODEL_PATH)
    return _bundle


def predict(features: np.ndarray, top_k: int = 3):
    bundle = load_bundle()
    if bundle is None:
        return None
    probs = bundle["model"].predict_proba(features.reshape(1, -1))[0]
    classes = bundle["classes"]
    order = np.argsort(probs)[::-1][:top_k]
    top = [{"label": str(classes[i]), "confidence": float(probs[i])} for i in order]
    return {"label": top[0]["label"], "confidence": top[0]["confidence"], "top": top}
