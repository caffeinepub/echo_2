import { useCallback, useEffect, useRef, useState } from "react";
import { useCamera } from "../camera/useCamera";
import {
  type MomentDraft,
  useMomentDraft,
} from "../context/MomentDraftContext";

interface CaptureMomentPageProps {
  onBack: () => void;
  onMintComplete?: (draft: MomentDraft) => void;
}

const MINT_GREEN = "rgba(52,168,132,1)";
const MINT_BORDER = "rgba(52,168,132,0.3)";
const MINT_BORDER_STRONG = "rgba(52,168,132,0.55)";

// Steps 0–8 = photos, 9 = video, 10 = review
type CaptureStep = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export function CaptureMomentPage({
  onBack,
  onMintComplete,
}: CaptureMomentPageProps) {
  const { activeDraft, hasDraft, addPhoto, addVideo, completeDraft } =
    useMomentDraft();

  const photos = activeDraft?.photos ?? [];
  const video = activeDraft?.video ?? null;
  const photoCount = photos.length;
  const hasVideo = video !== null;
  const isComplete = photoCount === 9 && hasVideo;

  const [captureStep, setCaptureStep] = useState<CaptureStep>(
    () => Math.min(photoCount, 9) as CaptureStep,
  );
  const [isPrinting, setIsPrinting] = useState(false);
  const [printDone, setPrintDone] = useState(false);

  // Preview state after capture (before "Use" or "Retake")
  const [pendingPhotoUrl, setPendingPhotoUrl] = useState<string | null>(null);
  const [pendingVideoUrl, setPendingVideoUrl] = useState<string | null>(null);

  // Video recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const camera = useCamera({ facingMode: "environment" });
  const {
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
    capturePhoto,
    switchCamera,
    isActive,
    isLoading,
    isSupported,
    error,
  } = camera;

  // Inject animation styles
  useEffect(() => {
    const id = "capture-moment-styles";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      @keyframes capturePrintPulse {
        0%, 100% { opacity: 1; }
        50%       { opacity: 0.65; }
      }
      @keyframes spin {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
      }
      @keyframes draftDotPulse {
        0%, 100% { opacity: 1; }
        50%       { opacity: 0.4; }
      }
      @keyframes recordPulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50%       { opacity: 0.7; transform: scale(1.08); }
      }
    `;
    document.head.appendChild(style);
  }, []);

  // Start camera on mount (steps 0–9), stop on step 10 or unmount
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional — only re-run on step change
  useEffect(() => {
    if (captureStep <= 9 && !pendingPhotoUrl && !pendingVideoUrl) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [captureStep]);

  // Stop camera when entering review step
  useEffect(() => {
    if (captureStep === 10) {
      stopCamera();
    }
  }, [captureStep, stopCamera]);

  // Clean up recording timer on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  // ── Photo capture ──────────────────────────────────────────────────────────
  const handleShutterPress = useCallback(async () => {
    if (!isActive) return;
    const file = await capturePhoto();
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPendingPhotoUrl(url);
  }, [isActive, capturePhoto]);

  const handleUsePhoto = useCallback(() => {
    if (!pendingPhotoUrl) return;
    addPhoto(pendingPhotoUrl, Date.now());
    setPendingPhotoUrl(null);
    const nextStep = (captureStep + 1) as CaptureStep;
    setCaptureStep(nextStep);
  }, [pendingPhotoUrl, addPhoto, captureStep]);

  const handleRetakePhoto = useCallback(() => {
    if (pendingPhotoUrl) URL.revokeObjectURL(pendingPhotoUrl);
    setPendingPhotoUrl(null);
    // Restart camera for retake
    startCamera();
  }, [pendingPhotoUrl, startCamera]);

  // ── Video recording ────────────────────────────────────────────────────────
  const handleStartRecording = useCallback(() => {
    const stream = videoRef.current?.srcObject as MediaStream | null;
    if (!stream) return;

    videoChunksRef.current = [];
    setRecordingSeconds(0);

    let mr: MediaRecorder;
    try {
      mr = new MediaRecorder(stream, { mimeType: "video/webm" });
    } catch {
      // Fallback without mimeType
      mr = new MediaRecorder(stream);
    }

    mr.ondataavailable = (e) => {
      if (e.data.size > 0) videoChunksRef.current.push(e.data);
    };

    mr.onstop = () => {
      const blob = new Blob(videoChunksRef.current, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      setPendingVideoUrl(url);
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    };

    mediaRecorderRef.current = mr;
    mr.start(100); // collect chunks every 100ms
    setIsRecording(true);

    // Countdown timer — auto-stop at 30 seconds
    let elapsed = 0;
    recordingTimerRef.current = setInterval(() => {
      elapsed += 1;
      setRecordingSeconds(elapsed);
      if (elapsed >= 30) {
        handleStopRecording();
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

  const handleUseVideo = useCallback(() => {
    if (!pendingVideoUrl) return;
    addVideo(pendingVideoUrl, Date.now());
    setPendingVideoUrl(null);
    setCaptureStep(10);
  }, [pendingVideoUrl, addVideo]);

  const handleRetakeVideo = useCallback(() => {
    if (pendingVideoUrl) URL.revokeObjectURL(pendingVideoUrl);
    setPendingVideoUrl(null);
    setRecordingSeconds(0);
    // Restart camera for retake
    startCamera();
  }, [pendingVideoUrl, startCamera]);

  // ── Print/Mint ─────────────────────────────────────────────────────────────
  function handlePrint() {
    if (!isComplete || isPrinting || printDone) return;
    setIsPrinting(true);
    setTimeout(() => {
      const draftSnapshot = activeDraft;
      completeDraft();
      setIsPrinting(false);
      setPrintDone(true);
      if (draftSnapshot) {
        onMintComplete?.(draftSnapshot);
      }
      setTimeout(() => {
        onBack();
      }, 1200);
    }, 1400);
  }

  // ── Progress bar ──────────────────────────────────────────────────────────
  const filledSteps = Math.min(captureStep, 10);
  const progressPct = Math.round((filledSteps / 10) * 100);

  // ── Step label ────────────────────────────────────────────────────────────
  function getStepLabel() {
    if (captureStep <= 8) return `Photo ${captureStep + 1} of 9`;
    if (captureStep === 9) return "Video capture";
    return "Review & Print";
  }

  // ── Render ────────────────────────────────────────────────────────────────
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
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "16px 20px",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          gap: "12px",
        }}
      >
        <button
          type="button"
          data-ocid="capture.back_button"
          onClick={onBack}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "14px",
            color: MINT_GREEN,
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
              stroke={MINT_GREEN}
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back
        </button>

        {hasDraft && (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "6px",
            }}
          >
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: MINT_GREEN,
                animation: "draftDotPulse 2s ease-in-out infinite",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: "11px",
                color: "rgba(52,168,132,0.85)",
                fontWeight: 500,
                letterSpacing: "0.03em",
              }}
            >
              Moment In Progress
            </span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div
        style={{
          height: "3px",
          background: "rgba(52,168,132,0.10)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            height: "100%",
            width: `${progressPct}%`,
            background: `linear-gradient(90deg, ${MINT_GREEN}, rgba(80,210,165,1))`,
            transition: "width 0.35s ease",
            borderRadius: "0 2px 2px 0",
          }}
        />
      </div>

      {/* ── STEP INDICATOR ── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: "18px",
          gap: "8px",
        }}
      >
        <span
          style={{
            fontSize: "11px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            fontWeight: 600,
            color: MINT_GREEN,
          }}
        >
          {getStepLabel()}
        </span>

        {/* Step dots */}
        {captureStep < 10 && (
          <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
            {["s0", "s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9"].map(
              (id, i) => (
                <div
                  key={id}
                  style={{
                    width: i === captureStep ? 14 : 6,
                    height: 6,
                    borderRadius: 3,
                    background:
                      i < captureStep
                        ? MINT_GREEN
                        : i === captureStep
                          ? MINT_GREEN
                          : "rgba(52,168,132,0.18)",
                    transition: "width 0.2s ease, background 0.2s ease",
                    opacity: i < captureStep ? 0.7 : 1,
                  }}
                />
              ),
            )}
          </div>
        )}
      </div>

      {/* ── CAMERA STEPS 0–9 ── */}
      {captureStep <= 9 && (
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
          {/* Camera error states */}
          {isSupported === false && (
            <div
              data-ocid="capture.error_state"
              style={{
                margin: "32px 0",
                textAlign: "center",
                padding: "24px",
                background: "rgba(0,0,0,0.04)",
                borderRadius: "16px",
                border: `1.5px solid ${MINT_BORDER}`,
              }}
            >
              <svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
                style={{ marginBottom: 12 }}
                aria-hidden="true"
              >
                <circle
                  cx="20"
                  cy="20"
                  r="18"
                  stroke={MINT_BORDER_STRONG}
                  strokeWidth="1.5"
                />
                <path
                  d="M20 13v8M20 24v2"
                  stroke={MINT_GREEN}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
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
                border: `1.5px solid ${MINT_BORDER}`,
              }}
            >
              <svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
                style={{ marginBottom: 12 }}
                aria-hidden="true"
              >
                <circle
                  cx="20"
                  cy="20"
                  r="18"
                  stroke={MINT_BORDER_STRONG}
                  strokeWidth="1.5"
                />
                <path
                  d="M20 12a5 5 0 0 1 5 5v3H15v-3a5 5 0 0 1 5-5z"
                  stroke={MINT_GREEN}
                  strokeWidth="1.5"
                />
                <rect
                  x="13"
                  y="20"
                  width="14"
                  height="10"
                  rx="2"
                  stroke={MINT_GREEN}
                  strokeWidth="1.5"
                />
              </svg>
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
                  background: MINT_GREEN,
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

          {/* Camera viewfinder — shown when no preview pending */}
          {isSupported !== false &&
            !error &&
            !pendingPhotoUrl &&
            !pendingVideoUrl && (
              <>
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    maxWidth: "360px",
                    borderRadius: "16px",
                    overflow: "hidden",
                    background: "#000",
                    aspectRatio: "3/4",
                    boxShadow: "0 4px 24px rgba(52,168,132,0.18)",
                    border: `1.5px solid ${MINT_BORDER}`,
                    flexShrink: 0,
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
                    }}
                  />

                  {/* Loading overlay */}
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
                          stroke={MINT_GREEN}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  )}

                  {/* Recording indicator */}
                  {captureStep === 9 && isRecording && (
                    <div
                      style={{
                        position: "absolute",
                        top: 12,
                        left: 12,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        background: "rgba(0,0,0,0.55)",
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
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#fff",
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {String(
                          Math.floor((30 - recordingSeconds) / 60),
                        ).padStart(2, "0")}
                        :{String((30 - recordingSeconds) % 60).padStart(2, "0")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Hidden canvas for photo capture */}
                <canvas ref={canvasRef} style={{ display: "none" }} />

                {/* Camera controls */}
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
                  {/* Flip camera */}
                  <button
                    type="button"
                    data-ocid="capture.toggle"
                    onClick={() => switchCamera()}
                    disabled={isLoading || isRecording}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: "rgba(0,0,0,0.08)",
                      border: `1.5px solid ${MINT_BORDER}`,
                      cursor:
                        isLoading || isRecording ? "not-allowed" : "pointer",
                      opacity: isLoading || isRecording ? 0.5 : 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    aria-label="Switch camera"
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
                        stroke={MINT_GREEN}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <path
                        d="M17 7l-1.5 2.5L13 7"
                        stroke={MINT_GREEN}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M3 13l1.5-2.5L7 13"
                        stroke={MINT_GREEN}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  {/* Shutter / Record / Stop */}
                  {captureStep < 9 ? (
                    // Photo shutter
                    <button
                      type="button"
                      data-ocid="capture.primary_button"
                      onClick={handleShutterPress}
                      disabled={!isActive || isLoading}
                      aria-label="Take photo"
                      style={{
                        width: 70,
                        height: 70,
                        borderRadius: "50%",
                        background:
                          isActive && !isLoading
                            ? `linear-gradient(160deg, ${MINT_GREEN}, rgba(42,144,112,1))`
                            : "rgba(0,0,0,0.10)",
                        border: "3px solid rgba(255,255,255,0.9)",
                        boxShadow:
                          isActive && !isLoading
                            ? "0 4px 18px rgba(52,168,132,0.38)"
                            : "none",
                        cursor: isActive && !isLoading ? "pointer" : "default",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition:
                          "background 0.2s ease, box-shadow 0.2s ease",
                      }}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          background: "rgba(255,255,255,0.92)",
                        }}
                      />
                    </button>
                  ) : isRecording ? (
                    // Stop recording
                    <button
                      type="button"
                      data-ocid="capture.primary_button"
                      onClick={handleStopRecording}
                      aria-label="Stop recording"
                      style={{
                        width: 70,
                        height: 70,
                        borderRadius: "50%",
                        background: "#ef4444",
                        border: "3px solid rgba(255,255,255,0.9)",
                        boxShadow: "0 4px 18px rgba(239,68,68,0.40)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        animation: "recordPulse 1.2s ease-in-out infinite",
                      }}
                    >
                      <div
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: "4px",
                          background: "rgba(255,255,255,0.95)",
                        }}
                      />
                    </button>
                  ) : (
                    // Start recording
                    <button
                      type="button"
                      data-ocid="capture.primary_button"
                      onClick={handleStartRecording}
                      disabled={!isActive || isLoading}
                      aria-label="Start recording"
                      style={{
                        width: 70,
                        height: 70,
                        borderRadius: "50%",
                        background:
                          isActive && !isLoading
                            ? "#ef4444"
                            : "rgba(0,0,0,0.10)",
                        border: "3px solid rgba(255,255,255,0.9)",
                        boxShadow:
                          isActive && !isLoading
                            ? "0 4px 18px rgba(239,68,68,0.38)"
                            : "none",
                        cursor: isActive && !isLoading ? "pointer" : "default",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "background 0.2s ease",
                      }}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          background: "rgba(255,255,255,0.92)",
                        }}
                      />
                    </button>
                  )}

                  {/* Spacer to balance layout */}
                  <div style={{ width: 44, height: 44 }} />
                </div>

                {/* Helper text */}
                <p
                  style={{
                    fontSize: "12px",
                    color: "rgba(52,168,132,0.65)",
                    marginTop: "10px",
                    textAlign: "center",
                    letterSpacing: "0.03em",
                  }}
                >
                  {captureStep < 9
                    ? "Tap to capture"
                    : isRecording
                      ? `Recording · ${recordingSeconds}s / 30s max`
                      : "Tap to start recording"}
                </p>
              </>
            )}

          {/* ── PHOTO PREVIEW (after shutter, before "Use") ── */}
          {pendingPhotoUrl && !pendingVideoUrl && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "16px",
                width: "100%",
              }}
            >
              <img
                src={pendingPhotoUrl}
                alt="Captured preview"
                style={{
                  width: "100%",
                  maxWidth: "360px",
                  aspectRatio: "3/4",
                  objectFit: "cover",
                  borderRadius: "16px",
                  border: `1.5px solid ${MINT_BORDER}`,
                  boxShadow: "0 4px 24px rgba(52,168,132,0.15)",
                  display: "block",
                }}
              />
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
                  onClick={handleRetakePhoto}
                  style={{
                    flex: 1,
                    padding: "13px",
                    borderRadius: "14px",
                    border: `1.5px solid ${MINT_BORDER}`,
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
                  onClick={handleUsePhoto}
                  style={{
                    flex: 2,
                    padding: "13px",
                    borderRadius: "14px",
                    background: `linear-gradient(160deg, ${MINT_GREEN}, rgba(42,144,112,1))`,
                    border: "none",
                    color: "#fff",
                    fontSize: "15px",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 2px 12px rgba(52,168,132,0.28)",
                  }}
                >
                  Use Photo
                </button>
              </div>
            </div>
          )}

          {/* ── VIDEO PREVIEW (after recording stops) ── */}
          {pendingVideoUrl && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "16px",
                width: "100%",
              }}
            >
              <video
                src={pendingVideoUrl}
                controls
                playsInline
                style={{
                  width: "100%",
                  maxWidth: "360px",
                  aspectRatio: "3/4",
                  objectFit: "cover",
                  borderRadius: "16px",
                  border: `1.5px solid ${MINT_BORDER}`,
                  boxShadow: "0 4px 24px rgba(52,168,132,0.15)",
                  display: "block",
                  background: "#000",
                }}
              >
                <track kind="captions" />
              </video>
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
                  onClick={handleRetakeVideo}
                  style={{
                    flex: 1,
                    padding: "13px",
                    borderRadius: "14px",
                    border: `1.5px solid ${MINT_BORDER}`,
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
                  style={{
                    flex: 2,
                    padding: "13px",
                    borderRadius: "14px",
                    background: `linear-gradient(160deg, ${MINT_GREEN}, rgba(42,144,112,1))`,
                    border: "none",
                    color: "#fff",
                    fontSize: "15px",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 2px 12px rgba(52,168,132,0.28)",
                  }}
                >
                  Use Video
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── REVIEW STEP (step 10) ── */}
      {captureStep === 10 && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "24px 20px 40px",
            gap: "0",
            overflowY: "auto",
          }}
        >
          <h1
            style={{
              fontSize: "22px",
              fontWeight: 700,
              color: "#111111",
              margin: 0,
              textAlign: "center",
              letterSpacing: "-0.01em",
            }}
          >
            Your Moment
          </h1>
          <p
            style={{
              fontSize: "13px",
              color: "#5a6a62",
              lineHeight: 1.6,
              marginTop: "8px",
              textAlign: "center",
              maxWidth: "280px",
            }}
          >
            All media captured. Ready to print.
          </p>

          {/* 3-column photo grid */}
          <div
            style={{
              marginTop: "24px",
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "8px",
              width: "100%",
              maxWidth: "320px",
            }}
          >
            {photos.map((src, i) => (
              <div
                key={src}
                data-ocid={`capture.item.${i + 1}`}
                style={{
                  aspectRatio: "1",
                  borderRadius: "12px",
                  overflow: "hidden",
                  border: `2px solid ${MINT_BORDER_STRONG}`,
                }}
              >
                <img
                  src={src}
                  alt={`Captured moment ${i + 1}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Video slot */}
          {video && (
            <div
              style={{
                marginTop: "8px",
                width: "100%",
                maxWidth: "320px",
                height: "60px",
                borderRadius: "12px",
                background: "rgba(52,168,132,0.06)",
                border: `1.5px solid ${MINT_BORDER_STRONG}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                aria-hidden="true"
              >
                <rect
                  x="2"
                  y="3"
                  width="10"
                  height="12"
                  rx="2"
                  stroke={MINT_GREEN}
                  strokeWidth="1.2"
                />
                <path
                  d="M12 7l4-2.5v7L12 9V7z"
                  stroke={MINT_GREEN}
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
              </svg>
              <span
                style={{ fontSize: "13px", color: MINT_GREEN, fontWeight: 600 }}
              >
                Video captured ✓
              </span>
            </div>
          )}

          {/* Progress counts */}
          <div
            style={{
              marginTop: "20px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <span
              style={{
                fontSize: "13px",
                color: photoCount === 9 ? MINT_GREEN : "#9B9B9B",
                fontWeight: photoCount === 9 ? 600 : 400,
                letterSpacing: "0.02em",
              }}
            >
              {photoCount} / 9 photos
            </span>
            <span style={{ fontSize: "11px", color: "rgba(0,0,0,0.15)" }}>
              ·
            </span>
            <span
              style={{
                fontSize: "13px",
                color: hasVideo ? MINT_GREEN : "#9B9B9B",
                fontWeight: hasVideo ? 600 : 400,
                letterSpacing: "0.02em",
              }}
            >
              {hasVideo ? 1 : 0} / 1 video
            </span>
          </div>

          {/* Print button */}
          <div
            style={{
              marginTop: "28px",
              width: "100%",
              maxWidth: "320px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
            }}
          >
            {printDone ? (
              <div
                data-ocid="capture.success_state"
                style={{
                  width: "100%",
                  height: "52px",
                  borderRadius: "14px",
                  background: "rgba(52,168,132,0.12)",
                  border: `1px solid ${MINT_BORDER_STRONG}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
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
                    d="M2.5 8l3.5 3.5 7-7"
                    stroke={MINT_GREEN}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: MINT_GREEN,
                  }}
                >
                  Moment Created!
                </span>
              </div>
            ) : (
              <button
                type="button"
                data-ocid="capture.submit_button"
                disabled={!isComplete || isPrinting}
                onClick={handlePrint}
                style={{
                  width: "100%",
                  height: "52px",
                  borderRadius: "14px",
                  fontSize: "15px",
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                  border: "none",
                  cursor: isComplete && !isPrinting ? "pointer" : "default",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "opacity 0.2s ease, background 0.2s ease",
                  background: isComplete
                    ? "linear-gradient(160deg, #34A884, #2a9070)"
                    : "rgba(0,0,0,0.06)",
                  color: isComplete ? "#ffffff" : "rgba(0,0,0,0.28)",
                  boxShadow: isComplete
                    ? "0 2px 12px rgba(52,168,132,0.28), inset 0 1px 0 rgba(255,255,255,0.18)"
                    : "none",
                  animation: isPrinting
                    ? "capturePrintPulse 1s ease-in-out infinite"
                    : "none",
                }}
              >
                {isPrinting ? (
                  <>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden="true"
                      style={{ animation: "spin 0.9s linear infinite" }}
                    >
                      <circle
                        cx="8"
                        cy="8"
                        r="6"
                        stroke="rgba(255,255,255,0.4)"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M8 2a6 6 0 0 1 6 6"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                    Printing…
                  </>
                ) : (
                  "Print Moment"
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
