import { useState } from "react";
import CameraView from "./CameraView.jsx";
import { useSignPredictor } from "../lib/useSignPredictor.js";
import { useStableSign } from "../lib/useStableSign.js";

// J and Z need motion, so they come later.
const LETTERS = "ABCDEFGHIKLMNOPQRSTUVWXY".split("");

export default function Learn() {
  const [target, setTarget] = useState("A");
  const [result, setResult] = useState(null); // "correct" | "wrong" | null
  const { prediction, error, onHand } = useSignPredictor();

  useStableSign(prediction, (label) => setResult(label === target ? "correct" : "wrong"), {
    frames: 8,
    minConfidence: 0.8,
  });

  const pick = (letter) => {
    setTarget(letter);
    setResult(null);
  };

  return (
    <section className="layout">
      <CameraView onHand={onHand} />
      <div className="panel">
        <h2>Sign the letter {target}</h2>
        <img
          className="reference"
          src={`/signs/${target}.png`}
          alt={`Reference for the letter ${target}`}
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
        {result === "correct" && <p className="ok">Correct!</p>}
        {result === "wrong" && <p className="warn">Not quite. Try again.</p>}
        {!result && <p className="muted">Hold the sign steady for a moment.</p>}
        {error && <p className="error">{error}</p>}
        {result === "correct" && (
          <button
            className="primary"
            onClick={() => pick(LETTERS[(LETTERS.indexOf(target) + 1) % LETTERS.length])}
          >
            Next letter
          </button>
        )}
        <div className="letters" role="group" aria-label="Choose a letter">
          {LETTERS.map((l) => (
            <button key={l} className={l === target ? "chip active" : "chip"} onClick={() => pick(l)}>
              {l}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
