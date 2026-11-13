"""Train the static-sign classifier from landmark CSVs.

Usage (from backend/):
    python -m scripts.train
Uses data/landmarks_kaggle.csv plus data/collected.csv (your team's own recordings) if present.
"""
from pathlib import Path

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split

ROOT = Path(__file__).resolve().parent.parent
CSVS = [ROOT / "data" / "landmarks_kaggle.csv", ROOT / "data" / "collected.csv"]
OUT = ROOT / "models" / "asl_letters.joblib"


def main():
    frames = [pd.read_csv(p) for p in CSVS if p.exists()]
    if not frames:
        raise SystemExit("No landmark CSVs found. Run scripts.extract_landmarks first.")
    df = pd.concat(frames, ignore_index=True)
    X, y = df.drop(columns="label").values, df["label"].astype(str).values
    print(f"{len(df)} samples, {len(set(y))} classes")

    X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, stratify=y, random_state=0)
    clf = RandomForestClassifier(n_estimators=300, n_jobs=-1, random_state=0)
    clf.fit(X_tr, y_tr)

    print(classification_report(y_te, clf.predict(X_te)))
    print(
        "NOTE: the Kaggle images are near-duplicate frames from one signer, so this score is "
        "optimistic. Judge the model by trying it live and by adding your own recordings."
    )
    joblib.dump({"model": clf, "classes": clf.classes_}, OUT)
    print(f"Saved {OUT}")


if __name__ == "__main__":
    main()
