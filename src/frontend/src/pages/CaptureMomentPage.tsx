import { useCallback, useEffect, useRef, useState } from "react";
import { useCamera } from "../camera/useCamera";
import { FinalSetupScreen } from "../components/FinalSetupScreen";
import {
  type MomentDraft,
  useMomentDraft,
} from "../context/MomentDraftContext";
import { usePackStyle } from "../context/PackStyleContext";

interface CaptureMomentPageProps {
  onBack: () => void;
  onMintComplete?: (draft: MomentDraft) => void;
}

// Step 0 = record video, Step 1 = preview/retake, Step 2 = details
type CaptureStep = 0 | 1 | 2;

const MAX_RECORDING_SECONDS = 7;

export function CaptureMomentPage({
  onBack,
  onMintComplete,
}: CaptureMomentPageProps) {
  const { addVideo } = useMomentDraft();
  const { activeStyle } = usePackStyle();

  const accentRgb = `${activeStyle.accentR},${activeStyle.accentG},${activeStyle.accentB}`;
  const accentColor = `oklch(${activeStyle.accentOklch})`;

  const [captureStep, setCaptureStep] = useState<CaptureStep>(0);
  const [pendingVideoUrl, setPendingVideoUrl] = useState<string | null>(null);

  // Recording state (managed manually via MediaRecorder)
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(MAX_RECORDING_SECONDS);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const camera = useCamera({ facingMode: "environment" });
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
    retry,
  } = camera;

  // Inject keyframes once
  useEffect(() => {
    const id = "capture-moment-styles";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
      }
      @keyframes recordPulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50%       { opacity: 0.7; transform: scale(1.08); }
      }
      @keyframes draftDotPulse {
        0%, 100% { opacity: 1; }
        50%       { opacity: 0.4; }
      }
    `;
    document.head.appendChild(style);
  }, []);

  // Start camera on step 0 (live viewfinder), stop on step 1+ or unmount
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional — re-run on step change only
  useEffect(() => {
    if (captureStep === 0 && !pendingVideoUrl) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [captureStep]);

  // Stop camera when showing preview
  useEffect(() => {
    if (pendingVideoUrl) {
      stopCamera();
    }
  }, [pendingVideoUrl, stopCamera]);

  // Stop camera on details step
  useEffect(() => {
    if (captureStep === 2) {
      stopCamera();
    }
  }, [captureStep, stopCamera]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, []);

  // ── Recording ─────────────────────────────────────────────────────────────
  const handleStartRecording = useCallback(() => {
    const stream = videoRef.current?.srcObject as MediaStream | null;
    if (!stream) return;

    videoChunksRef.current = [];
    setCountdown(MAX_RECORDING_SECONDS);

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
      const url = URL.createObjectURL(blob);
      setPendingVideoUrl(url);
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      // Advance to preview step
      setCaptureStep(1);
    };

    mediaRecorderRef.current = mr;
    mr.start(100);
    setIsRecording(true);

    // Countdown: 7 → 0, auto-stop at 0
    let remaining = MAX_RECORDING_SECONDS;
    setCountdown(remaining);
    recordingTimerRef.current = setInterval(() => {
      remaining -= 1;
      setCountdown(remaining);
      if (remaining <= 0) {
        clearInterval(recordingTimerRef.current!);
        recordingTimerRef.current = null;
        if (
          mediaRecorderRef.current &&
          mediaRecorderRef.current.state !== "inactive"
        ) {
          mediaRecorderRef.current.stop();
        }
      }
    }, 1000);
  }, [videoRef]);

  const handleStopRecording = useCallback(() => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
  }, []);

  // ── Preview actions ───────────────────────────────────────────────────────
  const handleRetake = useCallback(() => {
    if (pendingVideoUrl) URL.revokeObjectURL(pendingVideoUrl);
    setPendingVideoUrl(null);
    setCountdown(MAX_RECORDING_SECONDS);
    setCaptureStep(0);
  }, [pendingVideoUrl]);

  const handleUseVideo = useCallback(() => {
    if (!pendingVideoUrl) return;
    addVideo(pendingVideoUrl, Date.now());
    setCaptureStep(2);
  }, [pendingVideoUrl, addVideo]);

  // ── Setup submit ──────────────────────────────────────────────────────────
  function handleSetupSubmit(draft: MomentDraft) {
    onMintComplete?.(draft);
    setTimeout(() => onBack(), 100);
  }

  // ── Step label ────────────────────────────────────────────────────────────
  function getStepLabel(): string {
    if (captureStep === 0) return "1 / 2";
    if (captureStep === 1) return "1 / 2";
    return "Details";
  }

  // ── Shared styles ─────────────────────────────────────────────────────────
  const accentBorder = `rgba(${accentRgb},0.30)`;
  const accentBorderStrong = `rgba(${accentRgb},0.55)`;

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
          padding: "14px 20px",
          borderBottom: "1px solid rgba(0,0,0,0.05)",
          gap: "10px",
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          data-ocid="capture.cancel_button"
          onClick={onBack}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "14px",
            color: accentColor,
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
              stroke={accentColor}
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back
        </button>

        <h1
          style={{
            flex: 1,
            fontSize: "15px",
            fontWeight: 700,
            color: "#111",
            margin: 0,
            textAlign: "center",
            letterSpacing: "-0.01em",
          }}
        >
          Mint a Moment
        </h1>

        <span
          style={{
            fontSize: "11px",
            letterSpacing: "0.10em",
            textTransform: "uppercase",
            fontWeight: 600,
            color: `rgba(${accentRgb},0.70)`,
            minWidth: "40px",
            textAlign: "right",
          }}
        >
          {getStepLabel()}
        </span>
      </div>

      {/* Progress bar */}
      <div
        style={{
          height: "3px",
          background: `rgba(${accentRgb},0.10)`,
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
            width:
              captureStep === 2 ? "100%" : captureStep === 1 ? "50%" : "10%",
            background: `linear-gradient(90deg, ${accentColor}, rgba(${accentRgb},0.70))`,
            transition: "width 0.35s ease",
            borderRadius: "0 2px 2px 0",
          }}
        />
      </div>

      {/* ── STEP 0: Record Video ── */}
      {captureStep === 0 && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "20px 20px 32px",
            gap: 0,
          }}
        >
          {/* Step heading */}
          <div
            style={{
              width: "100%",
              maxWidth: "480px",
              paddingBottom: "16px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: "13px",
                color: `rgba(${accentRgb},0.70)`,
                margin: 0,
                fontWeight: 500,
                letterSpacing: "0.03em",
              }}
            >
              Record your 7-second moment
            </p>
          </div>

          {/* Camera not supported */}
          {isSupported === false && (
            <div
              data-ocid="capture.error_state"
              style={{
                margin: "32px 0",
                textAlign: "center",
                padding: "24px",
                background: "rgba(0,0,0,0.04)",
                borderRadius: "16px",
                border: `1.5px solid ${accentBorder}`,
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

          {/* Camera permission denied */}
          {isSupported !== false && error?.type === "permission" && (
            <div
              data-ocid="capture.error_state"
              style={{
                margin: "32px 0",
                textAlign: "center",
                padding: "24px",
                background: "rgba(0,0,0,0.04)",
                borderRadius: "16px",
                border: `1.5px solid ${accentBorder}`,
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
                onClick={() => retry()}
                style={{
                  padding: "10px 24px",
                  borderRadius: "10px",
                  background: accentColor,
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

          {/* Camera viewfinder */}
          {isSupported !== false && !error && (
            <>
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  maxWidth: "400px",
                  borderRadius: "20px",
                  overflow: "hidden",
                  background: "#000",
                  aspectRatio: "4/5",
                  boxShadow: `0 4px 32px rgba(${accentRgb},0.18)`,
                  border: `1.5px solid ${accentBorder}`,
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
                        stroke={accentColor}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                )}

                {/* Recording indicator + countdown overlay */}
                {isRecording && (
                  <>
                    {/* Red pulse dot top-left */}
                    <div
                      style={{
                        position: "absolute",
                        top: 14,
                        left: 14,
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
                          fontSize: 12,
                          fontWeight: 700,
                          color: "#fff",
                          letterSpacing: "0.02em",
                        }}
                      >
                        REC
                      </span>
                    </div>

                    {/* Big countdown number centered */}
                    <div
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        pointerEvents: "none",
                      }}
                    >
                      <div
                        key={countdown}
                        style={{
                          fontSize: "96px",
                          fontWeight: 800,
                          color: "rgba(255,255,255,0.90)",
                          lineHeight: 1,
                          textShadow: "0 4px 24px rgba(0,0,0,0.60)",
                          fontVariantNumeric: "tabular-nums",
                          fontFamily: "var(--font-ui)",
                          animation: "recordPulse 1s ease-in-out infinite",
                        }}
                      >
                        {countdown}
                      </div>
                    </div>
                  </>
                )}

                {/* Camera switch button — top-right */}
                {!isRecording && (
                  <button
                    type="button"
                    data-ocid="capture.toggle"
                    onClick={() => switchCamera()}
                    disabled={isLoading}
                    style={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: "rgba(0,0,0,0.45)",
                      border: "1.5px solid rgba(255,255,255,0.25)",
                      cursor: isLoading ? "not-allowed" : "pointer",
                      opacity: isLoading ? 0.5 : 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backdropFilter: "blur(4px)",
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
                        stroke="#fff"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <path
                        d="M17 7l-1.5 2.5L13 7"
                        stroke="#fff"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M3 13l1.5-2.5L7 13"
                        stroke="#fff"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                )}
              </div>

              {/* Hidden canvas for useCamera compatibility */}
              <canvas ref={canvasRef} style={{ display: "none" }} />

              {/* Record / Stop button */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: "28px",
                  width: "100%",
                  maxWidth: "400px",
                }}
              >
                {isRecording ? (
                  // Stop button
                  <button
                    type="button"
                    data-ocid="capture.primary_button"
                    onClick={handleStopRecording}
                    aria-label="Stop recording"
                    style={{
                      width: 76,
                      height: 76,
                      borderRadius: "50%",
                      background: "#ef4444",
                      border: "4px solid rgba(255,255,255,0.90)",
                      boxShadow: "0 4px 20px rgba(239,68,68,0.45)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      animation: "recordPulse 1.2s ease-in-out infinite",
                    }}
                  >
                    {/* Stop square */}
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "5px",
                        background: "rgba(255,255,255,0.95)",
                      }}
                    />
                  </button>
                ) : (
                  // Record button
                  <button
                    type="button"
                    data-ocid="capture.primary_button"
                    onClick={handleStartRecording}
                    disabled={!isActive || isLoading}
                    aria-label="Start recording"
                    style={{
                      width: 76,
                      height: 76,
                      borderRadius: "50%",
                      background:
                        isActive && !isLoading
                          ? `linear-gradient(145deg, ${accentColor}, rgba(${accentRgb},0.80))`
                          : "rgba(0,0,0,0.12)",
                      border: "4px solid rgba(255,255,255,0.90)",
                      boxShadow:
                        isActive && !isLoading
                          ? `0 4px 20px rgba(${accentRgb},0.40)`
                          : "none",
                      cursor: isActive && !isLoading ? "pointer" : "default",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "background 0.2s ease, box-shadow 0.2s ease",
                    }}
                  >
                    {/* Record circle */}
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.92)",
                      }}
                    />
                  </button>
                )}
              </div>

              {/* Helper text */}
              <p
                style={{
                  fontSize: "12px",
                  color: `rgba(${accentRgb},0.60)`,
                  marginTop: "12px",
                  textAlign: "center",
                  letterSpacing: "0.03em",
                }}
              >
                {isRecording
                  ? `${countdown}s remaining — tap to stop early`
                  : "Tap to start recording · 7 seconds max"}
              </p>
            </>
          )}
        </div>
      )}

      {/* ── STEP 1: Preview & Retake ── */}
      {captureStep === 1 && pendingVideoUrl && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "20px 20px 32px",
            gap: 0,
          }}
        >
          {/* Step heading */}
          <div
            style={{
              width: "100%",
              maxWidth: "480px",
              paddingBottom: "16px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: "13px",
                color: `rgba(${accentRgb},0.70)`,
                margin: 0,
                fontWeight: 500,
                letterSpacing: "0.03em",
              }}
            >
              Preview your video
            </p>
          </div>

          {/* Video preview */}
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "400px",
              borderRadius: "20px",
              overflow: "hidden",
              background: "#000",
              aspectRatio: "4/5",
              boxShadow: `0 4px 32px rgba(${accentRgb},0.18)`,
              border: `1.5px solid ${accentBorder}`,
              flexShrink: 0,
            }}
          >
            <video
              src={pendingVideoUrl}
              autoPlay
              loop
              muted
              playsInline
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          </div>

          {/* Retake / Use Video buttons */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "24px",
              width: "100%",
              maxWidth: "400px",
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
                border: `1.5px solid ${accentBorderStrong}`,
                background: "#fff",
                color: "#374151",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                letterSpacing: "0.01em",
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
                padding: "14px",
                borderRadius: "14px",
                background: `linear-gradient(160deg, ${accentColor}, rgba(${accentRgb},0.80))`,
                border: "none",
                color: "#fff",
                fontSize: "15px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: `0 2px 14px rgba(${accentRgb},0.30)`,
                letterSpacing: "0.01em",
              }}
            >
              Use Video
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: Details (FinalSetupScreen) ── */}
      {captureStep === 2 && (
        <FinalSetupScreen
          onBack={() => setCaptureStep(1)}
          onSubmit={handleSetupSubmit}
        />
      )}
    </div>
  );
}
