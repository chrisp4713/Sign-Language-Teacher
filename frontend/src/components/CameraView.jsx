import { useEffect, useRef, useState } from "react";
import { DrawingUtils, FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";

const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

/**
 * Opens the webcam, runs MediaPipe Hand Landmarker in the browser, draws the hand,
 * and calls onHand({ landmarks, handedness }) every frame (or onHand(null) if no hand).
 * Landmarks are sent raw; the backend does the normalization.
 */
export default function CameraView({ onHand }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const onHandRef = useRef(onHand);
  onHandRef.current = onHand;
  const [status, setStatus] = useState("Starting camera…");

  useEffect(() => {
    let stopped = false;
    let rafId;
    let stream;
    let landmarker;

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: "user" },
        });
        const video = videoRef.current;
        video.srcObject = stream;
        await video.play();

        setStatus("Loading hand tracking…");
        const fileset = await FilesetResolver.forVisionTasks(WASM_URL);
        landmarker = await HandLandmarker.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
          runningMode: "VIDEO",
          numHands: 1,
        });
        if (stopped) return;
        setStatus("");

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const drawing = new DrawingUtils(ctx);
        let lastVideoTime = -1;

        const loop = () => {
          if (stopped) return;
          if (video.currentTime !== lastVideoTime && video.videoWidth) {
            lastVideoTime = video.currentTime;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const result = landmarker.detectForVideo(video, performance.now());
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (result.landmarks.length) {
              const pts = result.landmarks[0];
              drawing.drawConnectors(pts, HandLandmarker.HAND_CONNECTIONS, {
                color: "#0b6e8a",
                lineWidth: 3,
              });
              drawing.drawLandmarks(pts, { color: "#ffffff", radius: 3 });
              onHandRef.current({
                landmarks: pts.map((p) => [p.x, p.y, p.z]),
                handedness: result.handedness[0][0].categoryName,
              });
            } else {
              onHandRef.current(null);
            }
          }
          rafId = requestAnimationFrame(loop);
        };
        loop();
      } catch (e) {
        setStatus(
          e.name === "NotAllowedError"
            ? "Camera access was blocked. Allow the camera in your browser's site settings."
            : `Could not start: ${e.message}`
        );
      }
    }

    start();
    return () => {
      stopped = true;
      cancelAnimationFrame(rafId);
      landmarker?.close();
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <div className="stage">
      <video ref={videoRef} playsInline muted />
      <canvas ref={canvasRef} />
      {status && <p className="stage-status">{status}</p>}
    </div>
  );
}
