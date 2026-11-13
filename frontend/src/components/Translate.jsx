import { useState } from "react";
import CameraView from "./CameraView.jsx";
import { useSignPredictor } from "../lib/useSignPredictor.js";
import { useStableSign } from "../lib/useStableSign.js";

export default function Translate() {
  const { prediction, error, onHand } = useSignPredictor();
  const [sentence, setSentence] = useState("");

  useStableSign(prediction, (label) => setSentence((s) => s + label));

  const speak = () => {
    if (sentence.trim()) window.speechSynthesis.speak(new SpeechSynthesisUtterance(sentence));
  };

  return (
    <section className="layout">
      <CameraView onHand={onHand} />
      <div className="panel">
        <h2>Detected sign</h2>
        <p className="big-letter" aria-live="polite">
          {prediction ? prediction.label : "–"}
        </p>
        <p className="muted">
          {prediction ? `${Math.round(prediction.confidence * 100)}% confident` : "Show a hand to the camera"}
        </p>
        {error && <p className="error">{error}</p>}

        <h2>Sentence</h2>
        <p className="sentence">{sentence || "Hold a sign steady to add it."}</p>
        <div className="row">
          <button onClick={() => setSentence((s) => s + " ")}>Space</button>
          <button onClick={() => setSentence((s) => s.slice(0, -1))}>Delete</button>
          <button onClick={() => setSentence("")}>Clear</button>
          <button className="primary" onClick={speak}>Speak</button>
        </div>
      </div>
    </section>
  );
}
