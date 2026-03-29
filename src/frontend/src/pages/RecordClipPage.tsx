import { CameraOff, FlipHorizontal, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { AddClipData } from "../hooks/useClipsData";

interface RecordClipPageProps {
  onBack: () => void;
  onPublish: (data: AddClipData) => void;
}

type RecordState = "idle" | "recording" | "review" | "publishing" | "done";

const MAX_DURATION_MS = 7000;

export function RecordClipPage({ onBack, onPublish }: RecordClipPageProps) {
  const [state, setState] = useState<RecordState>("idle");
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment",
  );
  const [_recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [progress, setProgress] = useState(0);

  const liveVideoRef = useRef<HTMLVideoElement>(null);
  const reviewVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Start camera on mount / facingMode change
  useEffect(() => {
    if (state !== "idle" && state !== "recording") return;

    let active = true;

    async function startCam() {
      try {
        if (streamRef.current) {
          for (const t of streamRef.current.getTracks()) {
            t.stop();
          }
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
          audio: false,
        });
        if (!active) {
          for (const t of stream.getTracks()) {
            t.stop();
          }
          return;
        }
        streamRef.current = stream;
        if (liveVideoRef.current) {
          liveVideoRef.current.srcObject = stream;
          liveVideoRef.current.play().catch(() => {});
        }
      } catch {
        if (active) setPermissionDenied(true);
      }
    }

    startCam();

    return () => {
      active = false;
    };
  }, [facingMode, state]);

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      for (const t of streamRef.current?.getTracks() ?? []) {
        t.stop();
      }
      if (progressIntervalRef.current)
        clearInterval(progressIntervalRef.current);
      if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
    };
  }, []);

  function startRecording() {
    if (!streamRef.current) return;

    chunksRef.current = [];
    const recorder = new MediaRecorder(streamRef.current, {
      mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm",
    });

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      setRecordedBlob(blob);
      setRecordedUrl(url);
      setState("review");
    };

    recorder.start(100);
    recorderRef.current = recorder;
    setState("recording");
    setProgress(0);

    const start = Date.now();
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      setProgress(Math.min(1, elapsed / MAX_DURATION_MS));
    }, 50);

    stopTimerRef.current = setTimeout(() => {
      stopRecording();
    }, MAX_DURATION_MS);
  }

  function stopRecording() {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    if (stopTimerRef.current) {
      clearTimeout(stopTimerRef.current);
      stopTimerRef.current = null;
    }
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    for (const t of streamRef.current?.getTracks() ?? []) {
      t.stop();
    }
  }

  function captureFrame(position: number) {
    const vid = reviewVideoRef.current;
    if (!vid) return;
    vid.currentTime = position * (vid.duration || 0);

    const onSeeked = () => {
      vid.removeEventListener("seeked", onSeeked);
      const canvas = document.createElement("canvas");
      canvas.width = vid.videoWidth || 640;
      canvas.height = vid.videoHeight || 360;
      canvas.getContext("2d")?.drawImage(vid, 0, 0);
      setThumbnail(canvas.toDataURL("image/jpeg", 0.8));
    };
    vid.addEventListener("seeked", onSeeked);
  }

  async function handlePost() {
    if (!recordedUrl) return;
    setState("publishing");

    const thumb = thumbnail ?? recordedUrl;

    await new Promise((r) => setTimeout(r, 800));

    onPublish({
      creatorName: "You",
      creatorWallet: "local",
      caption: caption.trim() || "untitled clip",
      videoUrl: recordedUrl,
      thumbnailUrl: thumb,
    });
    setState("done");
  }

  const circumference = 2 * Math.PI * 34;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {/* PERMISSION DENIED */}
      {permissionDenied && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8 text-center">
          <CameraOff className="w-12 h-12 text-white/30" />
          <p className="text-white/70 text-sm leading-relaxed">
            Camera access required. Please allow camera permission and try
            again.
          </p>
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 rounded-full bg-white/10 text-white text-sm"
          >
            Go back
          </button>
        </div>
      )}

      {/* IDLE / RECORDING STATE */}
      <AnimatePresence>
        {(state === "idle" || state === "recording") && !permissionDenied && (
          <motion.div
            key="camera"
            className="relative flex-1 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Camera preview */}
            <video
              ref={liveVideoRef}
              muted
              playsInline
              autoPlay
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                transform: facingMode === "user" ? "scaleX(-1)" : "none",
              }}
            />

            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 pt-4 pb-2">
              <button
                type="button"
                onClick={onBack}
                data-ocid="record.close_button"
                className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center"
                aria-label="Back"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              <button
                type="button"
                onClick={async () => {
                  const next = facingMode === "user" ? "environment" : "user";
                  setFacingMode(next);
                }}
                data-ocid="record.toggle"
                disabled={state === "recording"}
                className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center disabled:opacity-40"
                aria-label="Flip camera"
              >
                <FlipHorizontal className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Bottom controls */}
            <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-3">
              {/* Record button with SVG progress ring */}
              <div
                className="relative flex items-center justify-center"
                style={{ width: 80, height: 80 }}
              >
                {state === "recording" && (
                  <svg
                    width="80"
                    height="80"
                    viewBox="0 0 80 80"
                    className="absolute inset-0"
                    style={{ transform: "rotate(-90deg)" }}
                    aria-hidden="true"
                  >
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      fill="none"
                      stroke="rgba(255,255,255,0.15)"
                      strokeWidth="3"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={circumference * (1 - progress)}
                      style={{ transition: "stroke-dashoffset 0.05s linear" }}
                    />
                  </svg>
                )}
                <button
                  type="button"
                  data-ocid="record.primary_button"
                  onClick={state === "idle" ? startRecording : stopRecording}
                  className="relative z-10 flex items-center justify-center rounded-full transition-all active:scale-95"
                  style={{
                    width: 64,
                    height: 64,
                    background:
                      state === "recording"
                        ? "rgba(239,68,68,0.9)"
                        : "rgba(255,255,255,0.95)",
                    boxShadow:
                      state === "recording"
                        ? "0 0 24px rgba(239,68,68,0.6)"
                        : "0 0 20px rgba(255,255,255,0.3)",
                  }}
                  aria-label={
                    state === "recording" ? "Stop recording" : "Start recording"
                  }
                >
                  {state === "recording" ? (
                    <span
                      className="rounded-sm bg-white"
                      style={{ width: 18, height: 18 }}
                    />
                  ) : (
                    <span
                      className="rounded-full bg-red-500"
                      style={{ width: 44, height: 44 }}
                    />
                  )}
                </button>
              </div>
              <p className="text-white/50 text-[11px] tracking-widest uppercase">
                {state === "recording"
                  ? "Recording…"
                  : "Hold to record · 7 seconds"}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* REVIEW STATE */}
      <AnimatePresence>
        {state === "review" && recordedUrl && (
          <motion.div
            key="review"
            className="flex-1 flex flex-col overflow-hidden"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
          >
            {/* Video preview */}
            <div className="relative flex-1 bg-black overflow-hidden">
              <video
                ref={reviewVideoRef}
                src={recordedUrl}
                muted
                loop
                playsInline
                autoPlay
                className="absolute inset-0 w-full h-full object-contain"
              />

              {/* Back button */}
              <button
                type="button"
                onClick={onBack}
                className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/40 flex items-center justify-center"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              {/* Thumbnail preview */}
              {thumbnail && (
                <div className="absolute bottom-3 right-3 w-14 h-14 rounded-lg overflow-hidden border-2 border-violet-400/60">
                  <img
                    src={thumbnail}
                    alt="thumbnail"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* Bottom panel */}
            <div className="bg-[#111] px-5 pt-4 pb-6 flex flex-col gap-4">
              <div>
                <label
                  htmlFor="thumb-scrubber"
                  className="text-white/40 text-[10px] uppercase tracking-widest mb-1.5 block"
                >
                  Choose thumbnail
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  defaultValue={0}
                  className="w-full accent-violet-500"
                  onMouseUp={(e) =>
                    captureFrame(Number(e.currentTarget.value) / 100)
                  }
                  onTouchEnd={(e) =>
                    captureFrame(Number(e.currentTarget.value) / 100)
                  }
                  id="thumb-scrubber"
                  aria-label="Scrub to choose thumbnail frame"
                />
              </div>

              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Add a caption..."
                data-ocid="record.input"
                maxLength={120}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/30 outline-none focus:border-violet-500/50"
              />

              <button
                type="button"
                onClick={handlePost}
                data-ocid="record.submit_button"
                className="w-full py-3.5 rounded-xl text-[14px] font-semibold text-white"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                  boxShadow: "0 0 20px rgba(124,58,237,0.4)",
                }}
              >
                Post Clip
              </button>

              <button
                type="button"
                onClick={() => {
                  setRecordedUrl(null);
                  setRecordedBlob(null);
                  setThumbnail(null);
                  setState("idle");
                }}
                data-ocid="record.cancel_button"
                className="w-full py-3 rounded-xl text-[13px] font-medium text-white/50 border border-white/10"
              >
                Re-record
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PUBLISHING */}
      <AnimatePresence>
        {state === "publishing" && (
          <motion.div
            key="publishing"
            className="flex-1 flex flex-col items-center justify-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            data-ocid="record.loading_state"
          >
            <div className="w-12 h-12 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
            <p className="text-white/50 text-sm">Posting…</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
