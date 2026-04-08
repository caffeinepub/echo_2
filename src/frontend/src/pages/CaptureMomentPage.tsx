import { Play, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useCamera } from "../camera/useCamera";
import { FinalSetupScreen } from "../components/FinalSetupScreen";
import {
  type MomentDraft,
  useMomentDraft,
} from "../context/MomentDraftContext";
import { useVideoUpload } from "../hooks/useVideoUpload";

interface CaptureMomentPageProps {
  onBack: () => void;
  onMintComplete?: (draft: MomentDraft) => void;
}

const PURPLE = "rgba(124,58,237,1)";
const PURPLE_BORDER = "rgba(124,58,237,0.30)";
const MAX_SECONDS = 15;

type CaptureState = "recording" | "preview" | "uploading" | "setup";

export function CaptureMomentPage({
  onBack,
  onMintComplete,
}: CaptureMomentPageProps) {
  const { activeDraft, hasDraft, setVideoBlobUrl, setPersistedUrls } =
    useMomentDraft();
  const {
    uploadVideo,
    uploading,
    progress,
    error: uploadError,
  } = useVideoUpload();

  const [captureState, setCaptureState] = useState<CaptureState>(
    activeDraft?.videoBlobUrl ? "preview" : "recording",
  );
  const [pendingBlobUrl, setPendingBlobUrl] = useState<string | null>(
    activeDraft?.videoBlobUrl ?? null,
  );
  const pendingBlobRef = useRef<Blob | null>(null);
  const [uploadFallbackMsg, setUploadFallbackMsg] = useState<string | null>(
    null,
  );

  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [previewMuted, setPreviewMuted] = useState(false);
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const camera = useCamera({ facingMode: "user" });
  const {
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
    switchCamera,
    isActive,
    isLoading,
    isSupported,
    error,
    currentFacingMode,
  } = camera;

  // Inject animation styles once
  useEffect(() => {
    const id = "capture-moment-styles-v3";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      @keyframes draftDotPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      @keyframes recordPulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.75; transform: scale(1.08); } }
      @keyframes countdownPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.08); } }
    `;
    document.head.appendChild(style);
  }, []);

  // Camera lifecycle — only active in recording state
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional
  useEffect(() => {
    if (captureState === "recording") {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [captureState]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, []);

  // ── Recording controls ──────────────────────────────────────────────────────
  const handleStartRecording = useCallback(() => {
    const stream = videoRef.current?.srcObject as MediaStream | null;
    if (!stream) return;

    videoChunksRef.current = [];
    setRecordingSeconds(0);

    let mr: MediaRecorder;
    try {
      mr = new MediaRecorder(stream, { mimeType: "video/webm" });
    } catch {
      mr = new MediaRecorder(stream);
    }

    mr.ondataavailable = (e) => {
      if (e.data.size > 0) videoChunksRef.current.push(e.data);
    };

    mr.onstop = () => {
      const blob = new Blob(videoChunksRef.current, { type: "video/webm" });
      pendingBlobRef.current = blob;
      const url = URL.createObjectURL(blob);
      setPendingBlobUrl(url);
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      setCaptureState("preview");
    };

    mediaRecorderRef.current = mr;
    mr.start(100);
    setIsRecording(true);

    let elapsed = 0;
    recordingTimerRef.current = setInterval(() => {
      elapsed += 1;
      setRecordingSeconds(elapsed);
      if (elapsed >= MAX_SECONDS) {
        if (
          mediaRecorderRef.current &&
          mediaRecorderRef.current.state !== "inactive"
        ) {
          mediaRecorderRef.current.stop();
        }
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }
      }
    }, 1000);
  }, [videoRef]);

  const handleStopRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  }, []);

  const handleRetake = useCallback(() => {
    if (pendingBlobUrl) URL.revokeObjectURL(pendingBlobUrl);
    setPendingBlobUrl(null);
    pendingBlobRef.current = null;
    setRecordingSeconds(0);
    setUploadFallbackMsg(null);
    setCaptureState("recording");
  }, [pendingBlobUrl]);

  // Imperatively drive preview video playback to avoid blob URL + autoPlay pitfalls
  useEffect(() => {
    if (
      captureState !== "preview" ||
      !pendingBlobUrl ||
      !previewVideoRef.current
    )
      return;
    const video = previewVideoRef.current;
    setPreviewPlaying(false);
    video.src = pendingBlobUrl;
    video.load();
    video
      .play()
      .then(() => {
        setPreviewPlaying(true);
      })
      .catch(() => {
        // Autoplay blocked — show tap-to-play overlay
        setPreviewPlaying(false);
      });
  }, [captureState, pendingBlobUrl]);

  // Keep pendingBlobRef in sync with pendingBlobUrl so the ref is always
  // available even if it was lost on a component remount.
  useEffect(() => {
    if (pendingBlobUrl && !pendingBlobRef.current) {
      fetch(pendingBlobUrl)
        .then((r) => r.blob())
        .then((b) => {
          pendingBlobRef.current = b;
        })
        .catch(() => {
          // Non-fatal — handleUseVideo will re-fetch if needed
        });
    }
  }, [pendingBlobUrl]);

  const handleUseVideo = useCallback(async () => {
    // Guard on state only — the ref may be null after a remount even when the
    // blob URL is still valid.
    if (!pendingBlobUrl) {
      setUploadFallbackMsg("No video recorded. Please record a clip first.");
      return;
    }

    // Re-hydrate the ref if it was lost (e.g. on remount)
    let videoBlob = pendingBlobRef.current;
    if (!videoBlob) {
      try {
        const res = await fetch(pendingBlobUrl);
        videoBlob = await res.blob();
        pendingBlobRef.current = videoBlob;
      } catch {
        setUploadFallbackMsg("Could not read recorded video. Please retake.");
        return;
      }
    }

    if (!videoBlob) {
      setUploadFallbackMsg("Could not read recorded video. Please retake.");
      return;
    }

    // Store blob URL for immediate preview, advance to uploading state
    setVideoBlobUrl(pendingBlobUrl);
    setUploadFallbackMsg(null);
    setCaptureState("uploading");

    try {
      const { videoUrl, previewUrl } = await uploadVideo(videoBlob);
      setPersistedUrls(videoUrl, previewUrl);
      setCaptureState("setup");
    } catch (err) {
      // Upload failed — stay on preview, show clear error
      const message =
        err instanceof Error ? err.message : "Upload failed. Please try again.";
      setUploadFallbackMsg(message);
      setCaptureState("preview");
    }
  }, [pendingBlobUrl, uploadVideo, setVideoBlobUrl, setPersistedUrls]);

  function handleSetupSubmit(draft: MomentDraft) {
    onMintComplete?.(draft);
    setTimeout(() => onBack(), 100);
  }

  const countdown = MAX_SECONDS - recordingSeconds;

  // ── Shared layout wrapper ───────────────────────────────────────────────────
  return (
    <div
      data-ocid="capture.page"
      style={{
        minHeight: "calc(100vh - 68px - 64px)",
        background: "#F7F6F2",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {/* Top bar — shown in recording + preview + uploading states */}
      {captureState !== "setup" && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "14px 20px",
            borderBottom: "1px solid rgba(0,0,0,0.05)",
            gap: "10px",
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={onBack}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
              color: PURPLE,
              fontWeight: 500,
              padding: "4px 0",
              flexShrink: 0,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M10 3L5 8l5 5"
                stroke={PURPLE}
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back
          </button>

          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#111",
                letterSpacing: "-0.01em",
              }}
            >
              {captureState === "recording"
                ? "Record Moment"
                : captureState === "uploading"
                  ? "Uploading…"
                  : "Preview"}
            </span>
          </div>

          {hasDraft && (
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <div
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: PURPLE,
                  animation: "draftDotPulse 2s ease-in-out infinite",
                }}
              />
              <span
                style={{
                  fontSize: "11px",
                  color: "rgba(124,58,237,0.85)",
                  fontWeight: 500,
                }}
              >
                In Progress
              </span>
            </div>
          )}
        </div>
      )}

      {/* Step indicator pill */}
      {captureState !== "setup" && captureState !== "uploading" && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            paddingTop: "14px",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "8px",
              alignItems: "center",
              background: "rgba(124,58,237,0.06)",
              border: "1px solid rgba(124,58,237,0.15)",
              borderRadius: "20px",
              padding: "5px 14px",
            }}
          >
            {(["recording", "preview", "setup"] as const).map((s) => (
              <div
                key={s}
                style={{
                  width: captureState === s ? 18 : 7,
                  height: 7,
                  borderRadius: 4,
                  background:
                    s === captureState
                      ? PURPLE
                      : ["recording", "preview", "setup"].indexOf(
                            captureState,
                          ) > ["recording", "preview", "setup"].indexOf(s)
                        ? "rgba(124,58,237,0.50)"
                        : "rgba(124,58,237,0.15)",
                  transition: "width 0.2s ease, background 0.2s ease",
                }}
              />
            ))}
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: PURPLE,
                letterSpacing: "0.05em",
                marginLeft: "2px",
              }}
            >
              {captureState === "recording" ? "1/2" : "2/2"}
            </span>
          </div>
        </div>
      )}

      {/* ── UPLOADING STATE ── */}
      {captureState === "uploading" && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "32px 24px",
            gap: "20px",
          }}
        >
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            style={{ animation: "spin 0.9s linear infinite" }}
            aria-hidden="true"
          >
            <circle
              cx="24"
              cy="24"
              r="18"
              stroke="rgba(124,58,237,0.15)"
              strokeWidth="3"
            />
            <path
              d="M24 6a18 18 0 0 1 18 18"
              stroke={PURPLE}
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          <div style={{ textAlign: "center" }}>
            <p
              style={{
                fontSize: "16px",
                fontWeight: 700,
                color: "#111",
                margin: "0 0 6px",
              }}
            >
              Uploading video…
            </p>
            <p
              style={{
                fontSize: "13px",
                color: "rgba(124,58,237,0.65)",
                margin: 0,
              }}
            >
              {progress > 0 ? `${progress}% complete` : "Preparing upload…"}
            </p>
          </div>
          {/* Progress bar */}
          <div
            style={{
              width: "100%",
              maxWidth: "280px",
              height: 6,
              borderRadius: 3,
              background: "rgba(124,58,237,0.12)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${Math.max(10, progress)}%`,
                background: `linear-gradient(90deg, ${PURPLE}, rgba(167,139,250,1))`,
                borderRadius: 3,
                transition: "width 0.4s ease",
              }}
            />
          </div>
          {uploadError && (
            <p
              style={{
                fontSize: "12px",
                color: "#ef4444",
                textAlign: "center",
                margin: 0,
              }}
            >
              {uploadError}
            </p>
          )}
        </div>
      )}

      {/* ── RECORDING STATE ── */}
      {captureState === "recording" && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "16px 20px 32px",
            gap: "0",
          }}
        >
          {isSupported === false && (
            <div
              data-ocid="capture.error_state"
              style={{
                margin: "32px 0",
                textAlign: "center",
                padding: "24px",
                background: "rgba(0,0,0,0.04)",
                borderRadius: "16px",
                border: `1.5px solid ${PURPLE_BORDER}`,
              }}
            >
              <p
                style={{
                  fontSize: "15px",
                  fontWeight: 600,
                  color: "#111",
                  margin: "0 0 6px",
                }}
              >
                Camera not available
              </p>
              <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>
                Camera is not supported on this device.
              </p>
            </div>
          )}

          {isSupported !== false && error?.type === "permission" && (
            <div
              data-ocid="capture.error_state"
              style={{
                margin: "32px 0",
                textAlign: "center",
                padding: "24px",
                background: "rgba(0,0,0,0.04)",
                borderRadius: "16px",
                border: `1.5px solid ${PURPLE_BORDER}`,
              }}
            >
              <p
                style={{
                  fontSize: "15px",
                  fontWeight: 600,
                  color: "#111",
                  margin: "0 0 6px",
                }}
              >
                Camera permission required
              </p>
              <p
                style={{
                  fontSize: "13px",
                  color: "#6b7280",
                  margin: "0 0 16px",
                }}
              >
                Please allow camera access and try again.
              </p>
              <button
                type="button"
                data-ocid="capture.button"
                onClick={() => camera.retry()}
                style={{
                  padding: "10px 24px",
                  borderRadius: "10px",
                  background: PURPLE,
                  border: "none",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Retry
              </button>
            </div>
          )}

          {isSupported !== false && !error && (
            <>
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  maxWidth: "360px",
                  borderRadius: "20px",
                  overflow: "hidden",
                  background: "#000",
                  aspectRatio: "9/16",
                  boxShadow: "0 4px 32px rgba(124,58,237,0.22)",
                  border: `1.5px solid ${isRecording ? "rgba(239,68,68,0.60)" : PURPLE_BORDER}`,
                  flexShrink: 0,
                  transition: "border-color 0.3s",
                }}
              >
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                    // Mirror only when using front-facing camera (selfie mode)
                    transform:
                      currentFacingMode === "user" ? "scaleX(-1)" : "none",
                  }}
                />

                {isLoading && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(0,0,0,0.55)",
                    }}
                  >
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 32 32"
                      fill="none"
                      style={{ animation: "spin 0.9s linear infinite" }}
                      aria-hidden="true"
                    >
                      <circle
                        cx="16"
                        cy="16"
                        r="12"
                        stroke="rgba(255,255,255,0.25)"
                        strokeWidth="2.5"
                      />
                      <path
                        d="M16 4a12 12 0 0 1 12 12"
                        stroke={PURPLE}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                )}

                {isRecording && (
                  <>
                    <div
                      style={{
                        position: "absolute",
                        top: 12,
                        left: 12,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        background: "rgba(0,0,0,0.60)",
                        borderRadius: 20,
                        padding: "5px 10px",
                      }}
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: "#ef4444",
                          animation: "recordPulse 1s ease-in-out infinite",
                        }}
                      />
                      <span
                        style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}
                      >
                        REC
                      </span>
                    </div>

                    <div
                      style={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        background:
                          countdown <= 5
                            ? "rgba(239,68,68,0.80)"
                            : "rgba(0,0,0,0.60)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        animation:
                          countdown <= 5
                            ? "countdownPulse 0.5s ease-in-out infinite"
                            : "none",
                        transition: "background 0.3s",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 20,
                          fontWeight: 800,
                          color: "#fff",
                          fontVariantNumeric: "tabular-nums",
                          lineHeight: 1,
                        }}
                      >
                        {countdown}
                      </span>
                    </div>
                  </>
                )}

                {isRecording && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: "rgba(255,255,255,0.20)",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${(recordingSeconds / MAX_SECONDS) * 100}%`,
                        background:
                          countdown <= 5
                            ? "#ef4444"
                            : `linear-gradient(90deg, ${PURPLE}, rgba(167,139,250,1))`,
                        transition: "width 0.9s linear, background 0.3s",
                        borderRadius: "0 2px 2px 0",
                      }}
                    />
                  </div>
                )}
              </div>

              <canvas ref={canvasRef} style={{ display: "none" }} />

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "32px",
                  marginTop: "24px",
                  width: "100%",
                  maxWidth: "360px",
                }}
              >
                <button
                  type="button"
                  data-ocid="capture.toggle"
                  onClick={() => switchCamera()}
                  disabled={isLoading || isRecording}
                  aria-label="Switch camera"
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: "rgba(0,0,0,0.06)",
                    border: `1.5px solid ${PURPLE_BORDER}`,
                    cursor:
                      isLoading || isRecording ? "not-allowed" : "pointer",
                    opacity: isLoading || isRecording ? 0.4 : 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "opacity 0.2s",
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M3 7a7 7 0 0 1 13.5-2M17 13a7 7 0 0 1-13.5 2"
                      stroke={PURPLE}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M17 7l-1.5 2.5L13 7"
                      stroke={PURPLE}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M3 13l1.5-2.5L7 13"
                      stroke={PURPLE}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {isRecording ? (
                  <button
                    type="button"
                    data-ocid="capture.primary_button"
                    onClick={handleStopRecording}
                    aria-label="Stop recording"
                    style={{
                      width: 74,
                      height: 74,
                      borderRadius: "50%",
                      background: "#ef4444",
                      border: "4px solid rgba(255,255,255,0.92)",
                      boxShadow: "0 4px 20px rgba(239,68,68,0.45)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      animation: "recordPulse 1.2s ease-in-out infinite",
                    }}
                  >
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "4px",
                        background: "rgba(255,255,255,0.95)",
                      }}
                    />
                  </button>
                ) : (
                  <button
                    type="button"
                    data-ocid="capture.primary_button"
                    onClick={handleStartRecording}
                    disabled={!isActive || isLoading}
                    aria-label="Start recording"
                    style={{
                      width: 74,
                      height: 74,
                      borderRadius: "50%",
                      background:
                        isActive && !isLoading ? PURPLE : "rgba(0,0,0,0.10)",
                      border: "4px solid rgba(255,255,255,0.92)",
                      boxShadow:
                        isActive && !isLoading
                          ? "0 4px 20px rgba(124,58,237,0.42)"
                          : "none",
                      cursor: isActive && !isLoading ? "pointer" : "default",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "background 0.2s, box-shadow 0.2s",
                    }}
                  >
                    <svg
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <rect
                        x="2"
                        y="7"
                        width="14"
                        height="10"
                        rx="2"
                        stroke="rgba(255,255,255,0.92)"
                        strokeWidth="1.8"
                      />
                      <path
                        d="M16 10l5-3v10l-5-3V10z"
                        stroke="rgba(255,255,255,0.92)"
                        strokeWidth="1.8"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                )}

                <div style={{ width: 48 }} />
              </div>

              <p
                style={{
                  fontSize: "12px",
                  color: isRecording
                    ? "rgba(239,68,68,0.75)"
                    : "rgba(124,58,237,0.55)",
                  marginTop: "12px",
                  textAlign: "center",
                  letterSpacing: "0.03em",
                  transition: "color 0.3s",
                }}
              >
                {isRecording
                  ? `Recording — ${recordingSeconds}s / ${MAX_SECONDS}s max`
                  : "Tap the camera to start recording"}
              </p>
            </>
          )}
        </div>
      )}

      {/* ── PREVIEW STATE ── */}
      {captureState === "preview" && pendingBlobUrl && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "16px 20px 32px",
            gap: "16px",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "360px",
            }}
          >
            {/* Preview video — imperative playback via useEffect, NOT mirrored */}
            <video
              ref={previewVideoRef}
              loop
              muted={previewMuted}
              playsInline
              controls={false}
              onClick={() => {
                const vid = previewVideoRef.current;
                if (!vid) return;
                if (vid.paused) {
                  vid
                    .play()
                    .then(() => setPreviewPlaying(true))
                    .catch(() => {});
                } else {
                  vid.pause();
                  setPreviewPlaying(false);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  const vid = previewVideoRef.current;
                  if (!vid) return;
                  if (vid.paused) {
                    vid
                      .play()
                      .then(() => setPreviewPlaying(true))
                      .catch(() => {});
                  } else {
                    vid.pause();
                    setPreviewPlaying(false);
                  }
                }
              }}
              onPlay={() => setPreviewPlaying(true)}
              onPause={() => setPreviewPlaying(false)}
              style={{
                width: "100%",
                aspectRatio: "9/16",
                objectFit: "cover",
                borderRadius: "20px",
                border: `1.5px solid ${PURPLE_BORDER}`,
                boxShadow: "0 4px 32px rgba(124,58,237,0.18)",
                display: "block",
                background: "#000",
                cursor: "pointer",
              }}
            >
              <track kind="captions" />
            </video>

            {/* Tap-to-play overlay — shown when autoplay is blocked */}
            {!previewPlaying && (
              <button
                type="button"
                aria-label="Play preview"
                onClick={() => {
                  const vid = previewVideoRef.current;
                  if (!vid) return;
                  vid
                    .play()
                    .then(() => setPreviewPlaying(true))
                    .catch(() => {});
                }}
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  background: "rgba(0,0,0,0.45)",
                  borderRadius: "20px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    background: PURPLE,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 20px rgba(124,58,237,0.5)",
                  }}
                >
                  <Play size={26} color="#fff" fill="#fff" />
                </div>
                <span
                  style={{
                    fontSize: "13px",
                    color: "rgba(255,255,255,0.85)",
                    fontWeight: 500,
                  }}
                >
                  Tap to play
                </span>
              </button>
            )}

            {/* Sound toggle button */}
            <button
              type="button"
              onClick={() => setPreviewMuted((m) => !m)}
              aria-label={previewMuted ? "Unmute preview" : "Mute preview"}
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                background: "rgba(0,0,0,0.50)",
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
                border: "none",
                borderRadius: "50%",
                width: 36,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              {previewMuted ? (
                <VolumeX size={16} color="rgba(255,255,255,0.80)" />
              ) : (
                <Volume2 size={16} color="rgba(255,255,255,0.95)" />
              )}
            </button>
          </div>

          <p
            style={{
              fontSize: "12px",
              color: "rgba(124,58,237,0.60)",
              textAlign: "center",
              margin: 0,
            }}
          >
            {previewMuted
              ? "🔇 Muted — tap 🔊 to hear audio"
              : "🔊 Audio on — your recording includes sound"}
          </p>

          {uploadFallbackMsg && (
            <p
              style={{
                fontSize: "12px",
                color: "#ef4444",
                textAlign: "center",
                margin: 0,
                background: "rgba(239,68,68,0.06)",
                border: "1px solid rgba(239,68,68,0.20)",
                borderRadius: "10px",
                padding: "8px 12px",
                width: "100%",
                maxWidth: "360px",
              }}
            >
              {uploadFallbackMsg}
            </p>
          )}

          <div
            style={{
              display: "flex",
              gap: "12px",
              width: "100%",
              maxWidth: "360px",
            }}
          >
            <button
              type="button"
              data-ocid="capture.secondary_button"
              onClick={handleRetake}
              style={{
                flex: 1,
                padding: "14px",
                borderRadius: "14px",
                border: `1.5px solid ${PURPLE_BORDER}`,
                background: "#fff",
                color: "#374151",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Retake
            </button>
            <button
              type="button"
              data-ocid="capture.primary_button"
              onClick={handleUseVideo}
              disabled={uploading}
              style={{
                flex: 2,
                padding: "14px",
                borderRadius: "14px",
                background: `linear-gradient(160deg, ${PURPLE}, rgba(109,40,217,1))`,
                border: "none",
                color: "#fff",
                fontSize: "15px",
                fontWeight: 700,
                cursor: uploading ? "not-allowed" : "pointer",
                boxShadow: "0 2px 16px rgba(124,58,237,0.32)",
                opacity: uploading ? 0.7 : 1,
              }}
            >
              Use Video →
            </button>
          </div>
        </div>
      )}

      {/* ── SETUP STATE ── */}
      {captureState === "setup" && (
        <FinalSetupScreen
          onBack={() => {
            setCaptureState(pendingBlobUrl ? "preview" : "recording");
          }}
          onSubmit={handleSetupSubmit}
        />
      )}
    </div>
  );
}
