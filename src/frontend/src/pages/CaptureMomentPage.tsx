import { useCallback, useEffect, useState } from "react";
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
const MINT_BORDER = "rgba(52,168,132,0.3)";
const MINT_BORDER_STRONG = "rgba(52,168,132,0.55)";

// Step 0 = take 1 photo, Step 1 = review (FinalSetupScreen)
type CaptureStep = 0 | 1;

export function CaptureMomentPage({
  onBack,
  onMintComplete,
}: CaptureMomentPageProps) {
  const { activeDraft, hasDraft, addPhoto } = useMomentDraft();

  const photos = activeDraft?.photos ?? [];

  const [captureStep, setCaptureStep] = useState<CaptureStep>(() =>
    photos.length > 0 ? 1 : 0,
  );
  // Preview state after capture (before "Use" or "Retake")
  const [pendingPhotoUrl, setPendingPhotoUrl] = useState<string | null>(null);

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
    `;
    document.head.appendChild(style);
  }, []);

  // Start camera on step 0, stop on step 1 or unmount
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional — only re-run on step change
  useEffect(() => {
    if (captureStep === 0 && !pendingPhotoUrl) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [captureStep]);

  // Stop camera when entering final setup step
  useEffect(() => {
    if (captureStep === 1) {
      stopCamera();
    }
  }, [captureStep, stopCamera]);

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
    setCaptureStep(1);
  }, [pendingPhotoUrl, addPhoto]);

  const handleRetakePhoto = useCallback(() => {
    if (pendingPhotoUrl) URL.revokeObjectURL(pendingPhotoUrl);
    setPendingPhotoUrl(null);
    startCamera();
  }, [pendingPhotoUrl, startCamera]);

  // ── Setup Screen Submit ───────────────────────────────────────────────────
  function handleSetupSubmit(draft: MomentDraft) {
    onMintComplete?.(draft);
    setTimeout(() => {
      onBack();
    }, 100);
  }

  // ── Progress bar ──────────────────────────────────────────────────────────
  const progressPct = Math.round((captureStep / 1) * 100);

  // ── Step label ────────────────────────────────────────────────────────────
  function getStepLabel() {
    if (captureStep === 0) return "Capture Your Moment";
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
      </div>

      {/* ── CAMERA STEP 0 ── */}
      {captureStep === 0 && (
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
          {isSupported !== false && !error && !pendingPhotoUrl && (
            <>
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  maxWidth: "360px",
                  borderRadius: "16px",
                  overflow: "hidden",
                  background: "#000",
                  aspectRatio: "4/5",
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
                  disabled={isLoading}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: "rgba(0,0,0,0.08)",
                    border: `1.5px solid ${MINT_BORDER}`,
                    cursor: isLoading ? "not-allowed" : "pointer",
                    opacity: isLoading ? 0.5 : 1,
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

                {/* Shutter button */}
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
                    transition: "background 0.2s ease, box-shadow 0.2s ease",
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
                Tap to capture
              </p>
            </>
          )}

          {/* ── PHOTO PREVIEW (after shutter, before "Use") ── */}
          {pendingPhotoUrl && (
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
                  aspectRatio: "4/5",
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
        </div>
      )}

      {/* ── FINAL SETUP STEP (step 1) ── */}
      {captureStep === 1 && (
        <FinalSetupScreen
          photos={photos}
          onBack={() => setCaptureStep(0)}
          onSubmit={handleSetupSubmit}
        />
      )}
    </div>
  );
}
