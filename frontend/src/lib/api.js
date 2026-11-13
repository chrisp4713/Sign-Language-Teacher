const BASE = "/api";

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail.detail || `Request failed (${res.status})`);
  }
  return res.json();
}

export const predictSign = (hand) => post("/predict", hand);
export const collectSample = (label, hand) => post("/collect", { label, ...hand });
export const getHealth = () => fetch(`${BASE}/health`).then((r) => r.json());
