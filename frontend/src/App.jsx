import { useEffect, useState } from "react";
import Translate from "./components/Translate.jsx";
import Learn from "./components/Learn.jsx";
import Collect from "./components/Collect.jsx";
import { getHealth } from "./lib/api.js";

const TABS = { Translate, Learn, Collect };

export default function App() {
  const [tab, setTab] = useState("Translate");
  const [health, setHealth] = useState(null);
  const Active = TABS[tab];

  useEffect(() => {
    getHealth().then(setHealth).catch(() => setHealth({ status: "down" }));
  }, []);

  return (
    <main>
      <header>
        <h1>ASL Translator &amp; Tutor</h1>
        <nav aria-label="Mode">
          {Object.keys(TABS).map((t) => (
            <button key={t} className={t === tab ? "tab active" : "tab"} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </nav>
      </header>
      {health?.status === "down" && (
        <p className="banner">The backend isn't reachable. Start it with <code>uvicorn app.main:app --reload</code> in <code>backend/</code>.</p>
      )}
      {health?.status === "ok" && !health.model_loaded && (
        <p className="banner">No trained model yet. Run the extract and train scripts (see README), then restart the backend.</p>
      )}
      <Active />
    </main>
  );
}
