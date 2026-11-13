import { useEffect, useRef } from "react";

/**
 * Calls onAccept(label) once when the same confident prediction has been seen for
 * `frames` predictions in a row. The sign must change (or the hand leave) before the
 * same label can be accepted again, so holding "H" doesn't type HHHH.
 */
export function useStableSign(prediction, onAccept, { frames = 6, minConfidence = 0.7 } = {}) {
  const streak = useRef({ label: null, count: 0 });
  const locked = useRef(null);
  const accept = useRef(onAccept);
  accept.current = onAccept;

  useEffect(() => {
    if (!prediction || prediction.confidence < minConfidence) {
      streak.current = { label: null, count: 0 };
      if (!prediction) locked.current = null;
      return;
    }
    const { label } = prediction;
    streak.current =
      streak.current.label === label
        ? { label, count: streak.current.count + 1 }
        : { label, count: 1 };
    if (locked.current && locked.current !== label) locked.current = null;
    if (streak.current.count >= frames && locked.current !== label) {
      locked.current = label;
      accept.current(label);
    }
  }, [prediction, frames, minConfidence]);
}
