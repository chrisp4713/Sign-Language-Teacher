# ASL Translator & Tutor (MVP scaffold)

Camera → MediaPipe (in the browser) → 21 hand landmarks → FastAPI → classifier → letter on screen.

```
asl-app/
  backend/    FastAPI + scikit-learn (features, training, /predict, /collect)
  frontend/   React + Vite + MediaPipe Hand Landmarker (Translate, Learn, Collect tabs)
  docs/       datasets.md
```

## 1. Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Check http://localhost:8000/health. `model_loaded: false` is expected until you train.

## 2. Get data and train (first milestone)

1. Download the Kaggle ASL Alphabet dataset (see `docs/datasets.md`) and unzip it so images are at
   `backend/data/raw/asl_alphabet_train/asl_alphabet_train/<A-Z>/*.jpg`
2. From `backend/`:
```bash
python -m scripts.extract_landmarks --per-class 600   # images -> data/landmarks_kaggle.csv
python -m scripts.train                               # -> models/asl_letters.joblib
```
3. Restart uvicorn so it loads the model.

## 3. Frontend

```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:5173. `/api/*` is proxied to the backend on port 8000.

- **Translate**: hold a sign steady (about 6 predictions in a row) to add the letter to the sentence; Speak reads it aloud.
- **Learn**: shows a target letter and checks your sign. Drop reference images in `frontend/public/signs/A.png`, `B.png`, ...
- **Collect**: record your own samples. They go to `backend/data/collected.csv`, and `scripts.train` picks them up automatically. Do this on every teammate's laptop; it is the biggest accuracy win.

## Design notes for the team

- Landmarks are sent raw; `backend/app/features.py` is the only place they get normalized (wrist-centered, scaled, left hand mirrored). Training, collection and the API all use it, so they can't drift apart.
- J and Z are excluded from the static MVP because they involve motion. They come with the sequence-model phase.
- Kaggle's ASL Alphabet images are near-duplicate frames of one signer, so the test score will look better than real-world accuracy.
