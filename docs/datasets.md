# Datasets

## Start here: static letters (MVP)

**Kaggle "ASL Alphabet" (grassknoted)**: ~87,000 images, A-Z plus `del`, `space`, `nothing`.
https://www.kaggle.com/datasets/grassknoted/asl-alphabet
```bash
pip install kaggle   # needs a Kaggle account + API token in ~/.kaggle/kaggle.json
kaggle datasets download -d grassknoted/asl-alphabet -p backend/data/raw --unzip
```
Caveats: single signer, uniform backgrounds, J and Z shown as static poses (they are motion signs).

**Larger, more varied alphabet set**: a ~223,000-image Kaggle alphabet dataset with more background, lighting and hand-position variation was used in a Stanford CS231N project to fix real-time generalization problems. Search Kaggle for "ASL alphabet" and compare, and check each one's license.

**Sign Language MNIST** (Kaggle, `datamunge`): 28x28 grayscale, 24 letters. Too low-resolution for MediaPipe landmarks; only useful for CNN experiments.

## Next: words and motion signs (phase 2)

**ASL Citizen** (Microsoft Research): ~84k videos, 2,731 signs, 52 signers, collected with consent. Best fit for a common-words vocabulary: pick your 20-30 words (hello, thank you, yes, no, help, please ...) and extract landmark sequences from those videos.
https://www.microsoft.com/en-us/research/project/asl-citizen/ (zip is ~43 GB)
**License: non-commercial research use only, and you may not redistribute the data.** Fine for a class project; don't commit it to GitHub, and read the license before anything beyond coursework.

**WLASL** (word-level ASL, ~2,000 glosses, videos sourced from the web) and **MS-ASL** are the other common isolated-sign benchmarks. Many source videos have since gone offline, and licenses are restrictive, so treat these as backups.

**Your own recordings** (the Collect tab) are the highest-value data for the demo, because the model then matches your camera and hands.

## Suggested path

1. Kaggle ASL Alphabet + team Collect recordings -> letters (numbers 0-9 via your own recordings; several digits share handshapes with letters)
2. ASL Citizen subset (20-30 words) -> landmark sequences -> LSTM/GRU
3. Continuous signing stays out of scope for the class project
