import { useEffect, useRef, useState } from "react";
import CameraView from "./CameraView.jsx";
import { collectSample } from "../lib/api.js";

const LABELS = "ABCDEFGHIKLMNOPQRSTUVWXY".split("");

/** Record your own samples so the model works on your team's hands, lighting and camera. */
export default function Collect() {
  const [label, setLabel] = useState("A");
  const [recording, setRecording] = useState(false);
  const [counts, setCounts] = useState({});
  const hand = useRef(null);

  useEffect(() => {
    if (!recording) return;
    const id = setInterval(async () => {
      if (!hand.current) return;
      try {
        await collectSample(label, hand.current);
        setCounts((c) => ({ ...c, [label]: (c[label] || 0) + 1 }));
      } catch {
        /* ignore a dropped sample */
      }
    }, 100);
    return () => clearInterval(id);
  }, [recording, label]);

  return (
    <section className="layout">
      <CameraView onHand={(h) => (hand.current = h)} />
      <div className="panel">
        <h2>Record samples</h2>
        <p className="muted">
          Pick a letter, hold the sign, and press Record. Move your hand a little and change the
          angle while recording. Aim for 200+ samples per letter, ideally from several people.
        </p>
        <label>
          Letter{" "}
          <select value={label} onChange={(e) => setLabel(e.target.value)}>
            {LABELS.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </label>
        <button className={recording ? "primary active" : "primary"} onClick={() => setRecording((r) => !r)}>
          {recording ? "Stop" : "Record"}
        </button>
        <p>Saved for {label} this session: {counts[label] || 0}</p>
      </div>
    </section>
  );
}
