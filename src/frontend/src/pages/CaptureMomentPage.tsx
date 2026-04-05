import { useCallback, useEffect, useRef, useState } from "react";
import { useCamera } from "../camera/useCamera";
import { FinalSetupScreen } from "../components/FinalSetupScreen";
import {
  type MomentDraft,
  useMomentDraft,
} from "../context/MomentDraftContext";

interface CaptureMomentPageProps {
  onBack: () => void;
  onMintComplete?: (draft: MomentDraft) => void;
}

const MINT_GREEN = "rgba(52,168,132,1)";
const MINT_BORDER_STRONG = "rgba(52,168,132,0.55)";

// Steps 0–8 = images (file upload), 9 = video recording, 10 = review
type CaptureStep = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/jpg,image/png,image/webp";

export function CaptureMomentPage({
  onBack,
  onMintComplete,
}: CaptureMomentPageProps) {
  const { activeDraft, media, addImage, setVideoFile } = useMomentDraft();

  const imageCount = media.images.length;

  const [captureStep, setCaptureStep] = useState<CaptureStep>(
    () => Math.min(imageCount, 9) as CaptureStep,
  );

  // Pending states before user confirms Use/Retake
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [pendingImageUrl, setPendingImageUrl] = useState<string | null>(null);
  const [pendingVideoUrl, setPendingVideoUrl] = useState<string | null>(null);
  const [pendingVideoBlob, setPendingVideoBlob] = useState<Blob | null>(null);

  // Video recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // File input ref for image upload
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const camera = useCamera({ facingMode: "environment" });
  const {
    videoRef,
    startCamera,
    stopCamera,
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

  // Start/stop camera on video step only
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional
  useEffect(() => {
    if (captureStep === 9 && !pendingVideoUrl) {
      startCamera();
    }
    return () => {
      if (captureStep === 9) stopCamera();
    };
  }, [captureStep]);

  useEffect(() => {
    if (captureStep === 10) stopCamera();
  }, [captureStep, stopCamera]);

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, []);

  // ── Image upload ──────────────────────────────────────────────────────────
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      // Reset input value so same file can be re-selected
      e.target.value = "";
      const url = URL.createObjectURL(file);
      setPendingImageFile(file);
      setPendingImageUrl(url);
    },
    [],
  );

  const handleUseImage = useCallback(() => {
    if (!pendingImageFile) return;
    addImage(pendingImageFile);
    if (pendingImageUrl) {
      URL.revokeObjectURL(pendingImageUrl);
    }
    setPendingImageFile(null);
    setPendingImageUrl(null);
    const nextStep = (captureStep + 1) as CaptureStep;
    setCaptureStep(nextStep);
  }, [pendingImageFile, pendingImageUrl, addImage, captureStep]);

  const handleRetakeImage = useCallback(() => {
    if (pendingImageUrl) URL.revokeObjectURL(pendingImageUrl);
    setPendingImageFile(null);
    setPendingImageUrl(null);
    fileInputRef.current?.click();
  }, [pendingImageUrl]);

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
      mr = new MediaRecorder(stream);
    }

    mr.ondataavailable = (e) => {
      if (e.data.size > 0) videoChunksRef.current.push(e.data);
    };

    mr.onstop = () => {
      const blob = new Blob(videoChunksRef.current, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      setPendingVideoBlob(blob);
      setPendingVideoUrl(url);
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    };

    mediaRecorderRef.current = mr;
    mr.start(100);
    setIsRecording(true);

    let elapsed = 0;
    recordingTimerRef.current = setInterval(() => {
      elapsed += 1;
      setRecordingSeconds(elapsed);
      if (elapsed >= 30) handleStopRecording();
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
    if (!pendingVideoUrl || !pendingVideoBlob) return;
    setVideoFile(pendingVideoBlob, pendingVideoUrl);
    setPendingVideoUrl(null);
    setPendingVideoBlob(null);
    setCaptureStep(10);
  }, [pendingVideoUrl, pendingVideoBlob, setVideoFile]);

  const handleRetakeVideo = useCallback(() => {
    if (pendingVideoUrl) URL.revokeObjectURL(pendingVideoUrl);
    setPendingVideoUrl(null);
    setPendingVideoBlob(null);
    setRecordingSeconds(0);
    startCamera();
  }, [pendingVideoUrl, startCamera]);

  // ── Setup Screen Submit ───────────────────────────────────────────────────
  function handleSetupSubmit(draft: MomentDraft) {
    onMintComplete?.(draft);
    setTimeout(() => onBack(), 100);
  }

  // ── Progress bar ──────────────────────────────────────────────────────────
  const totalSteps = 10;
  const filledSteps = Math.min(captureStep, totalSteps);
  const progressPct = Math.round((filledSteps / totalSteps) * 100);

  function getStepLabel() {
    if (captureStep <= 8) return `Image ${captureStep + 1} of 9`;
    if (captureStep === 9) return "Video capture";
    return "Final Setup";
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
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES}
        style={{ display: "none" }}
        onChange={handleFileSelect}
      />

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
          onClick={captureStep === 10 ? () => setCaptureStep(9) : onBack}
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
        <div style={{ flex: 1 }}>
          <div
            style={{
              height: "4px",
              borderRadius: "2px",
              background: "rgba(0,0,0,0.08)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progressPct}%`,
                background: MINT_GREEN,
                borderRadius: "2px",
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>
        <span
          style={{
            fontSize: "11px",
            letterSpacing: "0.10em",
            textTransform: "uppercase",
            fontWeight: 600,
            color: "rgba(52,168,132,0.70)",
            flexShrink: 0,
          }}
        >
          {getStepLabel()}
        </span>
      </div>

      {/* ── Image steps (0–8) ──────────────────────────────────────────── */}
      {captureStep <= 8 && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "32px 20px",
            gap: "24px",
          }}
        >
          {!pendingImageUrl ? (
            /* Upload area */
            <button
              type="button"
              data-ocid="capture.upload_button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: "100%",
                maxWidth: "320px",
                aspectRatio: "4/5",
                borderRadius: "20px",
                border: `2px dashed ${MINT_BORDER_STRONG}`,
                background: "rgba(52,168,132,0.04)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                cursor: "pointer",
                transition: "background 0.15s, border-color 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(52,168,132,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(52,168,132,0.04)";
              }}
            >
              <svg
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="none"
                aria-hidden="true"
              >
                <rect
                  x="8"
                  y="12"
                  width="32"
                  height="26"
                  rx="4"
                  stroke={MINT_GREEN}
                  strokeWidth="1.8"
                />
                <circle
                  cx="29"
                  cy="21"
                  r="4"
                  stroke={MINT_GREEN}
                  strokeWidth="1.6"
                />
                <path
                  d="M8 32l10-8 8 6 6-4 8 6"
                  stroke={MINT_GREEN}
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
                <path
                  d="M24 6v6M21 9l3-3 3 3"
                  stroke={MINT_GREEN}
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div style={{ textAlign: "center" }}>
                <p
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "#111",
                    margin: 0,
                  }}
                >
                  Upload Image {captureStep + 1}
                </p>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#6b7280",
                    margin: "6px 0 0",
                  }}
                >
                  jpg, jpeg, png, webp
                </p>
              </div>
              <div
                style={{
                  padding: "10px 24px",
                  borderRadius: "12px",
                  background: MINT_GREEN,
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                Choose Photo
              </div>
            </button>
          ) : (
            /* Preview area */
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "16px",
                width: "100%",
                maxWidth: "320px",
              }}
            >
              <div
                style={{
                  width: "100%",
                  aspectRatio: "4/5",
                  borderRadius: "20px",
                  overflow: "hidden",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
                }}
              >
                <img
                  src={pendingImageUrl}
                  alt="Preview"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: "10px", width: "100%" }}>
                <button
                  type="button"
                  data-ocid="capture.secondary_button"
                  onClick={handleRetakeImage}
                  style={{
                    flex: 1,
                    padding: "13px",
                    borderRadius: "12px",
                    border: "1.5px solid rgba(0,0,0,0.12)",
                    background: "#fff",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                    color: "#374151",
                  }}
                >
                  Retake
                </button>
                <button
                  type="button"
                  data-ocid="capture.primary_button"
                  onClick={handleUseImage}
                  style={{
                    flex: 1,
                    padding: "13px",
                    borderRadius: "12px",
                    border: "none",
                    background: MINT_GREEN,
                    color: "#fff",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Use Photo
                </button>
              </div>
            </div>
          )}

          {/* Thumbnail strip of captured images */}
          {media.imagePreviewUrls.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: "6px",
                flexWrap: "wrap",
                justifyContent: "center",
                maxWidth: "320px",
              }}
            >
              {media.imagePreviewUrls.map((url, i) => (
                <div
                  key={url}
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "8px",
                    overflow: "hidden",
                    border: "2px solid rgba(52,168,132,0.4)",
                  }}
                >
                  <img
                    src={url}
                    alt={`Captured ${i + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
              ))}
              {["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9"]
                .slice(0, 9 - media.imagePreviewUrls.length)
                .map((slot) => (
                  <div
                    key={slot}
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "8px",
                      background: "rgba(0,0,0,0.05)",
                      border: "2px dashed rgba(0,0,0,0.10)",
                    }}
                  />
                ))}
            </div>
          )}
        </div>
      )}

      {/* ── Video step (9) ────────────────────────────────────────────── */}
      {captureStep === 9 && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            gap: "16px",
          }}
        >
          {!pendingVideoUrl ? (
            /* Live camera viewfinder */
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "16px",
                width: "100%",
                maxWidth: "320px",
              }}
            >
              <div
                style={{
                  width: "100%",
                  aspectRatio: "4/5",
                  borderRadius: "20px",
                  overflow: "hidden",
                  background: "#000",
                  position: "relative",
                }}
              >
                {isLoading && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(0,0,0,0.5)",
                    }}
                  >
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        border: "3px solid #fff",
                        borderTopColor: MINT_GREEN,
                        animation: "spin 0.8s linear infinite",
                      }}
                    />
                  </div>
                )}
                {!isSupported && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "20px",
                    }}
                  >
                    <p
                      style={{
                        color: "#fff",
                        textAlign: "center",
                        fontSize: "14px",
                      }}
                    >
                      Camera not available. {error?.message}
                    </p>
                  </div>
                )}
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
                {isRecording && (
                  <div
                    style={{
                      position: "absolute",
                      top: "12px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "rgba(0,0,0,0.6)",
                      borderRadius: "20px",
                      padding: "6px 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: "#ef4444",
                        animation: "recordPulse 1s ease-in-out infinite",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#fff",
                      }}
                    >
                      {recordingSeconds}s / 30s
                    </span>
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: "10px", width: "100%" }}>
                {!isRecording ? (
                  <button
                    type="button"
                    data-ocid="capture.primary_button"
                    onClick={handleStartRecording}
                    disabled={!isActive}
                    style={{
                      flex: 1,
                      padding: "13px",
                      borderRadius: "12px",
                      border: "none",
                      background: isActive ? "#ef4444" : "rgba(0,0,0,0.12)",
                      color: "#fff",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: isActive ? "pointer" : "default",
                    }}
                  >
                    Start Recording
                  </button>
                ) : (
                  <button
                    type="button"
                    data-ocid="capture.primary_button"
                    onClick={handleStopRecording}
                    style={{
                      flex: 1,
                      padding: "13px",
                      borderRadius: "12px",
                      border: "none",
                      background: MINT_GREEN,
                      color: "#fff",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Stop Recording
                  </button>
                )}
              </div>
              <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>
                Max 30 seconds · mp4 / webm
              </p>
            </div>
          ) : (
            /* Video preview */
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "16px",
                width: "100%",
                maxWidth: "320px",
              }}
            >
              <div
                style={{
                  width: "100%",
                  aspectRatio: "4/5",
                  borderRadius: "20px",
                  overflow: "hidden",
                  background: "#000",
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
              <div style={{ display: "flex", gap: "10px", width: "100%" }}>
                <button
                  type="button"
                  data-ocid="capture.secondary_button"
                  onClick={handleRetakeVideo}
                  style={{
                    flex: 1,
                    padding: "13px",
                    borderRadius: "12px",
                    border: "1.5px solid rgba(0,0,0,0.12)",
                    background: "#fff",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                    color: "#374151",
                  }}
                >
                  Retake
                </button>
                <button
                  type="button"
                  data-ocid="capture.primary_button"
                  onClick={handleUseVideo}
                  style={{
                    flex: 1,
                    padding: "13px",
                    borderRadius: "12px",
                    border: "none",
                    background: MINT_GREEN,
                    color: "#fff",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Use Video
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Final setup step (10) ──────────────────────────────────────── */}
      {captureStep === 10 && activeDraft && (
        <FinalSetupScreen
          onBack={() => setCaptureStep(9)}
          onSubmit={handleSetupSubmit}
        />
      )}
    </div>
  );
}
