import { useCallback, useEffect, useRef, useState } from "react";
import { FinalSetupScreen } from "../components/FinalSetupScreen";
import {
  type MomentDraft,
  useMomentDraft,
} from "../context/MomentDraftContext";
import { useReleasesMarket } from "../context/ReleasesMarketContext";
import { useWeeklyRound } from "../context/WeeklyRoundContext";

interface CaptureMomentPageProps {
  onBack: () => void;
  onMintComplete?: (draft: MomentDraft) => void;
}

const MINT_GREEN = "rgba(52,168,132,1)";
const MINT_BORDER = "rgba(52,168,132,0.3)";
const REC_RED = "rgba(239,68,68,1)";

const MAX_RECORD_SECONDS = 15;

type CaptureStep = 0 | 1 | 2;
// 0 = record, 1 = preview, 2 = details

// Compute SHA-256 hash of first 64KB of a blob
async function hashBlob(blob: Blob): Promise<string> {
  const slice = blob.slice(0, 65536);
  const buf = await slice.arrayBuffer();
  const hashBuf = await crypto.subtle.digest("SHA-256", buf);
  const hashArr = Array.from(new Uint8Array(hashBuf));
  return hashArr.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function getBestMimeType(): string {
  const candidates = [
    "video/mp4",
    "video/webm;codecs=h264",
    "video/webm;codecs=vp9",
    "video/webm",
  ];
  return (
    candidates.find((m) => MediaRecorder.isTypeSupported(m)) ?? "video/webm"
  );
}

export function CaptureMomentPage({
  onBack,
  onMintComplete,
}: CaptureMomentPageProps) {
  const { activeDraft, hasDraft, setVideo } = useMomentDraft();
  const { checkAndRecordMint, checkImageHash, recordImageHash } =
    useReleasesMarket();
  const { roundId } = useWeeklyRound();

  const [captureStep, setCaptureStep] = useState<CaptureStep>(
    activeDraft?.videoUrl ? 2 : 0,
  );

  // Recording state
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const liveVideoRef = useRef<HTMLVideoElement>(null);

  const [isLoadingCamera, setIsLoadingCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(MAX_RECORD_SECONDS);
  const [pendingVideoUrl, setPendingVideoUrl] = useState<string | null>(null);
  const [pendingBlob, setPendingBlob] = useState<Blob | null>(null);
  const [mintError, setMintError] = useState<string | null>(null);

  // Inject animation styles
  useEffect(() => {
    const id = "capture-moment-styles-v2";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      @keyframes recPulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50%       { opacity: 0.55; transform: scale(0.88); }
      }
      @keyframes spin {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
      }
      @keyframes draftDotPulse {
        0%, 100% { opacity: 1; }
        50%       { opacity: 0.4; }
      }
      @keyframes countdownPop {
        0%   { transform: scale(1.4); opacity: 0.6; }
        100% { transform: scale(1);   opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }, []);

  // Start camera stream
  const startCamera = useCallback(async () => {
    setIsLoadingCamera(true);
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 },
          facingMode: "environment",
        },
        audio: true,
      });
      streamRef.current = stream;
      if (liveVideoRef.current) {
        liveVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      const message =
        err instanceof Error && err.name === "NotAllowedError"
          ? "Camera/microphone permission denied. Please allow access and try again."
          : "Could not access camera. Please check your device settings.";
      setCameraError(message);
    } finally {
      setIsLoadingCamera(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      for (const t of streamRef.current.getTracks()) t.stop();
      streamRef.current = null;
    }
  }, []);

  // Start/stop camera based on step
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional
  useEffect(() => {
    if (captureStep === 0) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [captureStep]);

  // Wire stream to live video element
  useEffect(() => {
    if (liveVideoRef.current && streamRef.current) {
      liveVideoRef.current.srcObject = streamRef.current;
    }
  });

  // Stop recording and assemble blob
  const finishRecording = useCallback(() => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === "inactive") return;
    recorder.stop();
  }, []);

  // Start recording
  const handleStartRecording = useCallback(() => {
    if (!streamRef.current) return;
    const mimeType = getBestMimeType();
    const recorder = new MediaRecorder(streamRef.current, { mimeType });
    chunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      const url = URL.createObjectURL(blob);
      setPendingVideoUrl(url);
      setPendingBlob(blob);
      setIsRecording(false);
      setCaptureStep(1);
    };

    recorder.start(100); // collect data every 100ms
    recorderRef.current = recorder;
    setIsRecording(true);
    setSecondsLeft(MAX_RECORD_SECONDS);

    // Countdown timer
    let elapsed = 0;
    countdownTimerRef.current = setInterval(() => {
      elapsed += 1;
      setSecondsLeft(MAX_RECORD_SECONDS - elapsed);
      if (elapsed >= MAX_RECORD_SECONDS) {
        if (countdownTimerRef.current) {
          clearInterval(countdownTimerRef.current);
          countdownTimerRef.current = null;
        }
        finishRecording();
      }
    }, 1000);
  }, [finishRecording]);

  // Stop recording early
  const handleStopEarly = useCallback(() => {
    finishRecording();
  }, [finishRecording]);

  // Retake video
  const handleRetake = useCallback(() => {
    if (pendingVideoUrl) {
      URL.revokeObjectURL(pendingVideoUrl);
    }
    setPendingVideoUrl(null);
    setPendingBlob(null);
    setMintError(null);
    setSecondsLeft(MAX_RECORD_SECONDS);
    setCaptureStep(0);
  }, [pendingVideoUrl]);

  // Use video — check anti-spam and advance to details
  const handleUseVideo = useCallback(async () => {
    if (!pendingVideoUrl || !pendingBlob) return;

    // Check mint rate limit
    const mintCheck = checkAndRecordMint();
    if (!mintCheck.allowed) {
      setMintError(mintCheck.message);
      return;
    }

    // Hash check for duplicate detection
    try {
      const hash = await hashBlob(pendingBlob);
      if (hash) {
        const hashCheck = checkImageHash(hash, roundId);
        if (!hashCheck.allowed) {
          setMintError("This video has already been minted this round.");
          return;
        }
        recordImageHash(hash, roundId);
      }
    } catch {
      // If hashing fails, skip duplicate check
    }

    // Store video URLs in draft context
    setVideo(pendingVideoUrl, pendingVideoUrl);
    setMintError(null);
    setCaptureStep(2);
  }, [
    pendingVideoUrl,
    pendingBlob,
    checkAndRecordMint,
    checkImageHash,
    recordImageHash,
    roundId,
    setVideo,
  ]);

  // Setup Screen Submit
  function handleSetupSubmit(draft: MomentDraft) {
    onMintComplete?.(draft);
    setTimeout(() => {
      onBack();
    }, 100);
  }

  const progressPct = captureStep === 0 ? 0 : captureStep === 1 ? 50 : 100;

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

      {/* Step label */}
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
          {captureStep === 0 && "Record Your Moment"}
          {captureStep === 1 && "Preview"}
          {captureStep === 2 && "Final Setup"}
        </span>
      </div>

      {/* ── STEP 0: RECORD ── */}
      {captureStep === 0 && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "16px 20px 32px",
          }}
        >
          {/* Camera error */}
          {cameraError && (
            <div
              data-ocid="capture.error_state"
              style={{
                margin: "32px 0",
                textAlign: "center",
                padding: "24px",
                background: "rgba(0,0,0,0.04)",
                borderRadius: "16px",
                border: `1.5px solid ${MINT_BORDER}`,
                width: "100%",
                maxWidth: "360px",
              }}
            >
              <p
                style={{
                  fontSize: "15px",
                  fontWeight: 600,
                  color: "#111",
                  margin: "0 0 8px",
                }}
              >
                Camera not available
              </p>
              <p
                style={{
                  fontSize: "13px",
                  color: "#6b7280",
                  margin: "0 0 16px",
                }}
              >
                {cameraError}
              </p>
              <button
                type="button"
                data-ocid="capture.button"
                onClick={startCamera}
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

          {/* Camera viewfinder */}
          {!cameraError && (
            <>
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  maxWidth: "360px",
                  borderRadius: "16px",
                  overflow: "hidden",
                  background: "#000",
                  aspectRatio: "9/16",
                  boxShadow: isRecording
                    ? "0 4px 24px rgba(239,68,68,0.35)"
                    : "0 4px 24px rgba(52,168,132,0.18)",
                  border: isRecording
                    ? `2px solid ${REC_RED}`
                    : `1.5px solid ${MINT_BORDER}`,
                  transition: "border 0.2s ease, box-shadow 0.2s ease",
                  flexShrink: 0,
                }}
              >
                <video
                  ref={liveVideoRef}
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
                {isLoadingCamera && (
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

                {/* REC indicator + countdown */}
                {isRecording && (
                  <>
                    {/* REC badge top-left */}
                    <div
                      style={{
                        position: "absolute",
                        top: 12,
                        left: 14,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        background: "rgba(0,0,0,0.55)",
                        backdropFilter: "blur(4px)",
                        borderRadius: "20px",
                        padding: "4px 10px",
                        zIndex: 3,
                      }}
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: REC_RED,
                          animation: "recPulse 1s ease-in-out infinite",
                        }}
                      />
                      <span
                        style={{
                          color: "#fff",
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: "0.10em",
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        REC
                      </span>
                    </div>

                    {/* Big countdown in center-bottom */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: 80,
                        left: 0,
                        right: 0,
                        display: "flex",
                        justifyContent: "center",
                        pointerEvents: "none",
                        zIndex: 3,
                      }}
                    >
                      <span
                        key={secondsLeft}
                        style={{
                          fontSize: 72,
                          fontWeight: 800,
                          color: "#fff",
                          fontFamily: "'DM Sans', sans-serif",
                          lineHeight: 1,
                          textShadow: "0 2px 20px rgba(0,0,0,0.7)",
                          animation: "countdownPop 0.3s ease-out",
                          letterSpacing: "-0.04em",
                        }}
                      >
                        {secondsLeft}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Controls below viewfinder */}
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
                {/* Record / Stop button */}
                {!isRecording ? (
                  <button
                    type="button"
                    data-ocid="capture.primary_button"
                    onClick={handleStartRecording}
                    disabled={isLoadingCamera}
                    aria-label="Start recording"
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: "50%",
                      background: !isLoadingCamera
                        ? `linear-gradient(160deg, ${REC_RED}, rgba(200,30,30,1))`
                        : "rgba(0,0,0,0.10)",
                      border: "3px solid rgba(255,255,255,0.9)",
                      boxShadow: !isLoadingCamera
                        ? "0 4px 18px rgba(239,68,68,0.38)"
                        : "none",
                      cursor: !isLoadingCamera ? "pointer" : "default",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "background 0.2s ease, box-shadow 0.2s ease",
                    }}
                  >
                    {/* Filled circle = record */}
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.92)",
                      }}
                    />
                  </button>
                ) : (
                  <button
                    type="button"
                    data-ocid="capture.secondary_button"
                    onClick={handleStopEarly}
                    aria-label="Stop recording"
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: "50%",
                      background: "rgba(0,0,0,0.85)",
                      border: `3px solid ${REC_RED}`,
                      boxShadow: "0 4px 18px rgba(239,68,68,0.30)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {/* Square = stop */}
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: "4px",
                        background: REC_RED,
                      }}
                    />
                  </button>
                )}
              </div>

              {/* Helper text */}
              <p
                style={{
                  fontSize: "12px",
                  color: isRecording
                    ? "rgba(239,68,68,0.75)"
                    : "rgba(52,168,132,0.65)",
                  marginTop: "10px",
                  textAlign: "center",
                  letterSpacing: "0.03em",
                }}
              >
                {isRecording
                  ? "Recording with audio · Tap ■ to stop early"
                  : "Tap ● to record up to 15 seconds"}
              </p>
            </>
          )}
        </div>
      )}

      {/* ── STEP 1: PREVIEW ── */}
      {captureStep === 1 && pendingVideoUrl && (
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
              borderRadius: "16px",
              overflow: "hidden",
              background: "#000",
              aspectRatio: "9/16",
              border: `1.5px solid ${MINT_BORDER}`,
              boxShadow: "0 4px 24px rgba(52,168,132,0.15)",
              flexShrink: 0,
            }}
          >
            <video
              ref={previewVideoRef}
              src={pendingVideoUrl}
              autoPlay
              loop
              playsInline
              muted
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />

            {/* Overlay label */}
            <div
              style={{
                position: "absolute",
                bottom: 12,
                left: 0,
                right: 0,
                display: "flex",
                justifyContent: "center",
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  background: "rgba(0,0,0,0.50)",
                  backdropFilter: "blur(6px)",
                  borderRadius: "20px",
                  padding: "4px 12px",
                }}
              >
                <span
                  style={{
                    color: "rgba(255,255,255,0.85)",
                    fontSize: 11,
                    fontWeight: 600,
                    fontFamily: "'DM Sans', sans-serif",
                    letterSpacing: "0.05em",
                  }}
                >
                  Preview · looping
                </span>
              </div>
            </div>
          </div>

          {/* Mint error banner */}
          {mintError && (
            <button
              type="button"
              data-ocid="capture.error_state"
              onClick={() => setMintError(null)}
              style={{
                width: "100%",
                maxWidth: "360px",
                background: "rgba(220,38,38,0.08)",
                border: "1.5px solid rgba(220,38,38,0.25)",
                borderRadius: "12px",
                padding: "10px 14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 16 }}>&#x26A0;&#xFE0F;</span>
              <p
                style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#dc2626",
                  margin: 0,
                  lineHeight: 1.4,
                }}
              >
                {mintError}
              </p>
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: 16,
                  color: "rgba(220,38,38,0.5)",
                  lineHeight: 1,
                }}
              >
                &times;
              </span>
            </button>
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

      {/* ── STEP 2: FINAL SETUP ── */}
      {captureStep === 2 && (
        <FinalSetupScreen
          videoUrl={activeDraft?.videoUrl ?? pendingVideoUrl ?? undefined}
          onBack={() => setCaptureStep(1)}
          onSubmit={handleSetupSubmit}
        />
      )}
    </div>
  );
}
