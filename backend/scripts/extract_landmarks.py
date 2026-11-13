"""Run MediaPipe over the Kaggle ASL Alphabet images and save landmark features.

Usage (from backend/):
    python -m scripts.extract_landmarks --per-class 600
"""
import argparse
import csv
import random
import urllib.request
from pathlib import Path

import mediapipe as mp
from mediapipe.tasks import python as mp_python
from mediapipe.tasks.python import vision

from app.features import N_FEATURES, landmarks_to_features

ROOT = Path(__file__).resolve().parent.parent
MODEL_URL = (
    "https://storage.googleapis.com/mediapipe-models/hand_landmarker/"
    "hand_landmarker/float16/1/hand_landmarker.task"
)
MODEL_FILE = ROOT / "models" / "hand_landmarker.task"
DEFAULT_IMAGES = ROOT / "data" / "raw" / "asl_alphabet_train" / "asl_alphabet_train"
OUT_CSV = ROOT / "data" / "landmarks_kaggle.csv"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--images", type=Path, default=DEFAULT_IMAGES)
    ap.add_argument("--per-class", type=int, default=600, help="max images per class")
    ap.add_argument(
        "--exclude",
        nargs="*",
        default=["J", "Z", "del", "space", "nothing"],
        help="J and Z involve motion, so they are skipped for the static MVP",
    )
    args = ap.parse_args()

    if not args.images.exists():
        raise SystemExit(f"Image folder not found: {args.images} (see docs/datasets.md)")

    if not MODEL_FILE.exists():
        print("Downloading MediaPipe hand_landmarker.task ...")
        urllib.request.urlretrieve(MODEL_URL, MODEL_FILE)

    options = vision.HandLandmarkerOptions(
        base_options=mp_python.BaseOptions(model_asset_path=str(MODEL_FILE)),
        running_mode=vision.RunningMode.IMAGE,
        num_hands=1,
        min_hand_detection_confidence=0.3,
    )
    detector = vision.HandLandmarker.create_from_options(options)

    random.seed(0)
    kept = skipped = 0
    with open(OUT_CSV, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["label"] + [f"f{i}" for i in range(N_FEATURES)])
        for class_dir in sorted(p for p in args.images.iterdir() if p.is_dir()):
            label = class_dir.name
            if label in args.exclude:
                continue
            files = sorted(class_dir.glob("*.jpg"))
            random.shuffle(files)
            for img_path in files[: args.per_class]:
                image = mp.Image.create_from_file(str(img_path))
                result = detector.detect(image)
                if not result.hand_landmarks:
                    skipped += 1
                    continue
                pts = [[p.x, p.y, p.z] for p in result.hand_landmarks[0]]
                hand = result.handedness[0][0].category_name
                writer.writerow([label] + landmarks_to_features(pts, hand).tolist())
                kept += 1
            print(f"{label}: done")
    print(f"Saved {kept} samples to {OUT_CSV} ({skipped} images had no detected hand)")


if __name__ == "__main__":
    main()
