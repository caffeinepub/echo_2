import { useCallback, useEffect, useRef, useState } from "react";
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

const PHOTO_SLOT_IDS = ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9"];

export function CaptureMomentPage({
  onBack,
  onMintComplete,
}: CaptureMomentPageProps) {
  const {
    activeDraft,
    hasDraft,
    addPhoto,
    removePhoto,
    addVideo,
    removeVideo,
    completeDraft,
  } = useMomentDraft();

  const photos = activeDraft?.photos ?? [];
  const video = activeDraft?.video ?? null;
  const photoCount = photos.length;
  const hasVideo = video !== null;

  const isComplete = photoCount === 9 && hasVideo;
  const [isPrinting, setIsPrinting] = useState(false);
  const [printDone, setPrintDone] = useState(false);

  // File input refs
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [pendingPhotoSlot, setPendingPhotoSlot] = useState<number | null>(null);
  const [removePhotoTarget, setRemovePhotoTarget] = useState<number | null>(
    null,
  );

  // Inject animation styles once
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
    `;
    document.head.appendChild(style);
  }, []);

  // ── Photo slot click ──────────────────────────────────────────────────────
  function handlePhotoSlotClick(slotIndex: number) {
    // If slot is already filled, show remove option
    if (slotIndex < photoCount) {
      setRemovePhotoTarget(removePhotoTarget === slotIndex ? null : slotIndex);
      return;
    }
    // Only allow clicking the first empty slot in order
    if (slotIndex !== photoCount) return;
    setPendingPhotoSlot(slotIndex);
    photoInputRef.current?.click();
  }

  const handlePhotoChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const objectUrl = URL.createObjectURL(file);
      addPhoto(objectUrl);
      setPendingPhotoSlot(null);
      // Reset input so same file can be re-selected
      e.target.value = "";
    },
    [addPhoto],
  );

  const handleVideoChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const objectUrl = URL.createObjectURL(file);
      addVideo(objectUrl);
      e.target.value = "";
    },
    [addVideo],
  );

  function handlePrint() {
    if (!isComplete || isPrinting || printDone) return;
    setIsPrinting(true);
    // Simulate async print/mint
    setTimeout(() => {
      const draftSnapshot = activeDraft;
      completeDraft();
      setIsPrinting(false);
      setPrintDone(true);
      // Fire mint complete callback with snapshot of the draft
      if (draftSnapshot) {
        onMintComplete?.(draftSnapshot);
      }
      // Return to library after a brief success moment
      setTimeout(() => {
        onBack();
      }, 1200);
    }, 1400);
  }

  // ── Progress bar width ────────────────────────────────────────────────────
  const progressPct = Math.round(
    ((photoCount + (hasVideo ? 1 : 0)) / 10) * 100,
  );

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
      {/* Hidden file inputs — tabIndex=-1 keeps them out of tab order */}
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        tabIndex={-1}
        style={{
          position: "absolute",
          width: 0,
          height: 0,
          opacity: 0,
          pointerEvents: "none",
        }}
        onChange={handlePhotoChange}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        tabIndex={-1}
        style={{
          position: "absolute",
          width: 0,
          height: 0,
          opacity: 0,
          pointerEvents: "none",
        }}
        onChange={handleVideoChange}
      />

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

        {/* Draft status banner */}
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

      {/* Main scrollable content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "28px 20px 40px",
          gap: "0",
          overflowY: "auto",
        }}
      >
        {/* Section label */}
        <span
          style={{
            fontSize: "11px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            fontWeight: 600,
            color: MINT_GREEN,
            marginBottom: "12px",
          }}
        >
          Capture Moment
        </span>

        {/* Title */}
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
          Capture Your Moment
        </h1>

        {/* Description */}
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
          Fill all 9 photos and 1 video to print your Moment.
        </p>

        {/* ── PHOTO GRID ─────────────────────────────────────────────────── */}
        <div
          style={{
            marginTop: "28px",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "8px",
            width: "100%",
            maxWidth: "320px",
          }}
        >
          {PHOTO_SLOT_IDS.map((slotId, i) => {
            const isFilled = i < photoCount;
            const isNextSlot = i === photoCount;
            const isRemoveTarget = removePhotoTarget === i;
            const isPending = pendingPhotoSlot === i;

            return (
              <button
                key={slotId}
                type="button"
                data-ocid={`capture.item.${i + 1}`}
                aria-label={
                  isFilled
                    ? `Slot ${i + 1} filled — tap to remove`
                    : isNextSlot
                      ? `Add slot ${i + 1}`
                      : `Slot ${i + 1}`
                }
                disabled={!isFilled && !isNextSlot}
                onClick={() => {
                  if (isRemoveTarget) {
                    removePhoto(i);
                    setRemovePhotoTarget(null);
                  } else {
                    handlePhotoSlotClick(i);
                  }
                }}
                style={{
                  aspectRatio: "1",
                  borderRadius: "12px",
                  background: isFilled
                    ? "transparent"
                    : isPending
                      ? "rgba(52,168,132,0.08)"
                      : isNextSlot
                        ? "rgba(52,168,132,0.04)"
                        : "rgba(0,0,0,0.04)",
                  border: isFilled
                    ? `2px solid ${MINT_BORDER_STRONG}`
                    : isNextSlot
                      ? `1.5px dashed ${MINT_BORDER_STRONG}`
                      : `1.5px dashed ${MINT_BORDER}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: isFilled || isNextSlot ? "pointer" : "default",
                  overflow: "hidden",
                  position: "relative",
                  transition: "border-color 0.18s ease, background 0.18s ease",
                  outline: "none",
                  padding: 0,
                }}
              >
                {isFilled ? (
                  <>
                    <img
                      src={photos[i]}
                      alt={`Slot ${i + 1}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                        opacity: isRemoveTarget ? 0.45 : 1,
                        transition: "opacity 0.18s ease",
                      }}
                    />
                    {/* Remove overlay */}
                    {isRemoveTarget && (
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "rgba(230,60,60,0.12)",
                          borderRadius: "12px",
                        }}
                      >
                        <div
                          style={{
                            background: "rgba(220,50,50,0.88)",
                            borderRadius: "8px",
                            padding: "4px 8px",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                            aria-hidden="true"
                          >
                            <path
                              d="M1 1l10 10M11 1L1 11"
                              stroke="white"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                            />
                          </svg>
                          <span
                            style={{
                              fontSize: "11px",
                              color: "white",
                              fontWeight: 600,
                            }}
                          >
                            Remove
                          </span>
                        </div>
                      </div>
                    )}
                    {/* Check badge when not in remove mode */}
                    {!isRemoveTarget && (
                      <div
                        style={{
                          position: "absolute",
                          bottom: "4px",
                          right: "4px",
                          width: "16px",
                          height: "16px",
                          borderRadius: "50%",
                          background: MINT_GREEN,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <svg
                          width="9"
                          height="9"
                          viewBox="0 0 9 9"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M1.5 4.5l2 2 4-4"
                            stroke="white"
                            strokeWidth="1.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    )}
                  </>
                ) : isNextSlot ? (
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 22 22"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      cx="11"
                      cy="11"
                      r="8.5"
                      stroke={MINT_GREEN}
                      strokeWidth="1.3"
                    />
                    <path
                      d="M11 7.5v7M7.5 11h7"
                      stroke={MINT_GREEN}
                      strokeWidth="1.3"
                      strokeLinecap="round"
                    />
                  </svg>
                ) : (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      cx="10"
                      cy="10"
                      r="7"
                      stroke={MINT_BORDER}
                      strokeWidth="1.2"
                    />
                    <path
                      d="M10 7v6M7 10h6"
                      stroke={MINT_BORDER}
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>

        {/* ── VIDEO SLOT ─────────────────────────────────────────────────── */}
        <button
          type="button"
          data-ocid="capture.upload_button"
          aria-label={
            hasVideo ? "Video added — tap to remove" : "Add video (max 30s)"
          }
          onClick={() => {
            if (!hasVideo) {
              videoInputRef.current?.click();
            }
          }}
          style={{
            marginTop: "8px",
            width: "100%",
            maxWidth: "320px",
            height: "60px",
            borderRadius: "12px",
            background: hasVideo ? "rgba(52,168,132,0.06)" : "rgba(0,0,0,0.04)",
            border: hasVideo
              ? `1.5px solid ${MINT_BORDER_STRONG}`
              : `1.5px dashed ${MINT_BORDER}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            cursor: "pointer",
            transition: "background 0.18s ease, border-color 0.18s ease",
            outline: "none",
            padding: 0,
          }}
        >
          {hasVideo ? (
            <>
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
                <path
                  d="M5 9h4"
                  stroke={MINT_GREEN}
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
              <span
                style={{
                  fontSize: "13px",
                  color: MINT_GREEN,
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                }}
              >
                Video added ✓
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeVideo();
                }}
                style={{
                  marginLeft: "auto",
                  marginRight: "12px",
                  background: "rgba(220,60,60,0.10)",
                  border: "1px solid rgba(220,60,60,0.25)",
                  borderRadius: "6px",
                  padding: "3px 8px",
                  fontSize: "11px",
                  color: "rgba(200,50,50,0.85)",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                Remove
              </button>
            </>
          ) : (
            <>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
              >
                <rect
                  x="2"
                  y="4"
                  width="11"
                  height="12"
                  rx="2"
                  stroke={MINT_BORDER}
                  strokeWidth="1.2"
                />
                <path
                  d="M13 8l5-3v10l-5-3V8z"
                  stroke={MINT_BORDER}
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
              </svg>
              <span
                style={{
                  fontSize: "12px",
                  color: "rgba(52,168,132,0.65)",
                  fontWeight: 500,
                  letterSpacing: "0.03em",
                }}
              >
                Add Video (max 30s)
              </span>
            </>
          )}
        </button>

        {/* ── PROGRESS TEXT ──────────────────────────────────────────────── */}
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
              transition: "color 0.2s ease",
            }}
          >
            {photoCount} / 9 photos
          </span>
          <span style={{ fontSize: "11px", color: "rgba(0,0,0,0.15)" }}>·</span>
          <span
            style={{
              fontSize: "13px",
              color: hasVideo ? MINT_GREEN : "#9B9B9B",
              fontWeight: hasVideo ? 600 : 400,
              letterSpacing: "0.02em",
              transition: "color 0.2s ease",
            }}
          >
            {hasVideo ? 1 : 0} / 1 video
          </span>
        </div>

        {/* ── PRINT MOMENT BUTTON ────────────────────────────────────────── */}
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
                style={{ fontSize: "14px", fontWeight: 600, color: MINT_GREEN }}
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

          {/* Helper text when not complete */}
          {!isComplete && !printDone && (
            <p
              style={{
                fontSize: "12px",
                color: "#9B9B9B",
                margin: 0,
                textAlign: "center",
                letterSpacing: "0.02em",
              }}
            >
              Add all photos and video to continue
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
