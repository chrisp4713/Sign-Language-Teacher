"""Turn 21 raw MediaPipe hand landmarks into a model-ready feature vector.

This is the single source of truth: training, collection and the API all call
`landmarks_to_features`, so the model always sees identical preprocessing.
"""
import numpy as np

N_LANDMARKS = 21
N_FEATURES = N_LANDMARKS * 3
MIDDLE_FINGER_MCP = 9  # used as the scale reference (wrist -> middle knuckle)


def landmarks_to_features(landmarks, handedness: str = "Right") -> np.ndarray:
    """landmarks: 21 x [x, y, z]. handedness: 'Left' or 'Right' (MediaPipe label).

    - Left hands are mirrored so both hands map to one canonical shape.
    - Translated so the wrist is the origin (position in frame no longer matters).
    - Scaled by wrist->middle-knuckle distance (distance from camera no longer matters).
    """
    pts = np.asarray(landmarks, dtype=np.float32).reshape(N_LANDMARKS, 3).copy()
    if handedness == "Left":
        pts[:, 0] *= -1
    pts -= pts[0]
    scale = float(np.linalg.norm(pts[MIDDLE_FINGER_MCP]))
    if scale < 1e-6:
        scale = 1.0
    pts /= scale
    return pts.flatten()
