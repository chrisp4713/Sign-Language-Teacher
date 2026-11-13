import { useCallback, useRef, useState } from "react";
import { predictSign } from "./api.js";

const MIN_INTERVAL_MS = 100; // ~10 predictions per second is plenty

/** Throttled calls to /predict. Feed it every frame via `onHand` (null = no hand). */
export function useSignPredictor() {
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const busy = useRef(false);
  const lastCall = useRef(0);

  const onHand = useCallback(async (hand) => {
    if (!hand) {
      setPrediction(null);
      return;
    }
    const now = performance.now();
    if (busy.current || now - lastCall.current < MIN_INTERVAL_MS) return;
    busy.current = true;
    lastCall.current = now;
    try {
      setPrediction(await predictSign(hand));
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      busy.current = false;
    }
  }, []);

  return { prediction, error, onHand };
}
