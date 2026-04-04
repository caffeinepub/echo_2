import { useCallback, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import type { CollectionNFT, SealedPack } from "../context/CollectionContext";

const PACK_IMAGE =
  "/assets/comfyui_00009-019d510a-371e-750b-b780-72fcb79d8ba5.png";

const OVERLAY_KEYFRAMES = `
  @keyframes packFloat {
    0%   { transform: translateY(0px); }
    50%  { transform: translateY(-8px); }
    100% { transform: translateY(0px); }
  }
  @keyframes packShake {
    0%   { transform: translateX(0px); }
    8%   { transform: translateX(-4px); }
    16%  { transform: translateX(4px); }
    24%  { transform: translateX(-4px); }
    32%  { transform: translateX(4px); }
    40%  { transform: translateX(-3px); }
    48%  { transform: translateX(3px); }
    56%  { transform: translateX(-2px); }
    64%  { transform: translateX(2px); }
    72%  { transform: translateX(-1px); }
    80%  { transform: translateX(1px); }
    90%  { transform: translateX(-0.5px); }
    100% { transform: translateX(0px); }
  }
  @keyframes silhouettePulse {
    0%   { opacity: 0.5; }
    50%  { opacity: 0.9; }
    100% { opacity: 0.5; }
  }
  @keyframes shineSweep {
    0%   { transform: translateX(-120%) skewX(-16deg); }
    100% { transform: translateX(260%) skewX(-16deg); }
  }
  @keyframes cardRise {
    0%   { opacity: 0; transform: translateY(50px) scale(0.90); }
    100% { opacity: 1; transform: translateY(0px) scale(1.0); }
  }
  @keyframes metaFadeIn {
    0%   { opacity: 0; transform: translateY(10px); }
    100% { opacity: 1; transform: translateY(0px); }
  }
  @keyframes actionSlideUp {
    0%   { opacity: 0; transform: translateY(20px); }
    100% { opacity: 1; transform: translateY(0px); }
  }
  @keyframes overlayFadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes lightBurst {
    0%   { transform: scale(0); opacity: 0; }
    40%  { transform: scale(1); opacity: 1; }
    100% { transform: scale(1.6); opacity: 0; }
  }
  @keyframes halfTearTop {
    0%   { transform: translateY(0px) rotate(0deg); opacity: 1; }
    100% { transform: translateY(-60px) rotate(-4deg); opacity: 0; }
  }
  @keyframes halfTearBottom {
    0%   { transform: translateY(0px) rotate(0deg); opacity: 1; }
    100% { transform: translateY(60px) rotate(3deg); opacity: 0; }
  }
  /* Reset native <dialog> styling */
  dialog.pack-opening-dialog {
    border: none;
    padding: 0;
    margin: 0;
    background: transparent;
    max-width: 100vw;
    max-height: 100vh;
    width: 100vw;
    height: 100vh;
    position: fixed;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow-y: auto;
    box-sizing: border-box;
  }
  dialog.pack-opening-dialog::backdrop {
    display: none;
  }
`;

let overlayStylesInjected = false;
function ensureOverlayStyles() {
  if (overlayStylesInjected) return;
  const el = document.createElement("style");
  el.textContent = OVERLAY_KEYFRAMES;
  document.head.appendChild(el);
  overlayStylesInjected = true;
}

export interface PackOpeningOverlayProps {
  pack: SealedPack;
  nft: CollectionNFT;
  onComplete: (nft: CollectionNFT) => void;
  onClose: () => void;
}

type Phase =
  | "idle" // Pack centered, slide to open control
  | "anticipation" // Pack shakes + inner glow
  | "tear" // Pack halves split apart
  | "suspense" // Silhouette card
  | "reveal" // NFT card rises
  | "action"; // Metadata + buttons

const KNOB_SIZE = 54;

export function PackOpeningOverlay({
  pack,
  nft,
  onComplete,
  onClose: _onClose,
}: PackOpeningOverlayProps) {
  ensureOverlayStyles();

  const [phase, setPhase] = useState<Phase>("idle");
  const [shineActive, setShineActive] = useState(false);
  const completedRef = useRef(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Slider state
  const trackRef = useRef<HTMLDivElement>(null);
  const [knobX, setKnobX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [sliderProgress, setSliderProgress] = useState(0);
  const [sliderTriggered, setSliderTriggered] = useState(false);
  const dragStartXRef = useRef(0);
  const knobStartXRef = useRef(0);
  // Keep a ref for trackRef so updateKnob doesn't need it in deps
  const trackRefStable = trackRef;

  const wrapperImageUrl = PACK_IMAGE;

  // Open the native dialog on mount
  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  // Phase auto-advance timers
  useEffect(() => {
    if (phase === "anticipation") {
      const t = setTimeout(() => setPhase("tear"), 450);
      return () => clearTimeout(t);
    }
    if (phase === "tear") {
      const t = setTimeout(() => setPhase("suspense"), 700);
      return () => clearTimeout(t);
    }
    if (phase === "suspense") {
      const t = setTimeout(() => setPhase("reveal"), 900);
      return () => clearTimeout(t);
    }
    if (phase === "reveal") {
      const t1 = setTimeout(() => setPhase("action"), 600);
      const t2 = setTimeout(() => {
        if (nft.rarity === "Rare") setShineActive(true);
      }, 300);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
    return undefined;
  }, [phase, nft.rarity]);

  // Keyboard dismiss in action phase
  useEffect(() => {
    if (phase !== "action") return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleComplete();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const handleComplete = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete(nft);
  }, [nft, onComplete]);

  // ─── Slider logic ───────────────────────────────────────────────────────────
  const updateKnob = useCallback(
    (clientX: number) => {
      const trackWidth =
        trackRefStable.current?.getBoundingClientRect().width ?? 0;
      if (trackWidth === 0) return;
      const maxKnob = trackWidth - KNOB_SIZE;
      const rawX = clientX - dragStartXRef.current + knobStartXRef.current;
      const clamped = Math.max(0, Math.min(rawX, maxKnob));
      const progress = maxKnob > 0 ? clamped / maxKnob : 0;
      setKnobX(clamped);
      setSliderProgress(progress);

      if (progress >= 0.88 && !sliderTriggered) {
        setSliderTriggered(true);
        setKnobX(maxKnob);
        setSliderProgress(1);
        setTimeout(() => setPhase("anticipation"), 120);
      }
    },
    [sliderTriggered, trackRefStable],
  );

  const snapBack = useCallback(() => {
    setKnobX(0);
    setSliderProgress(0);
    setIsDragging(false);
  }, []);

  // Pointer events (unified touch + mouse)
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (sliderTriggered) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragStartXRef.current = e.clientX;
    knobStartXRef.current = knobX;
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || sliderTriggered) return;
    updateKnob(e.clientX);
  };

  const onPointerUp = () => {
    if (!isDragging || sliderTriggered) return;
    setIsDragging(false);
    if (sliderProgress < 0.88) snapBack();
  };

  // Touch fallback for iOS Safari
  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (sliderTriggered) return;
    const touch = e.touches[0];
    setIsDragging(true);
    dragStartXRef.current = touch.clientX;
    knobStartXRef.current = knobX;
  };

  const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || sliderTriggered) return;
    e.preventDefault();
    const touch = e.touches[0];
    updateKnob(touch.clientX);
  };

  const onTouchEnd = () => {
    if (!isDragging || sliderTriggered) return;
    setIsDragging(false);
    if (sliderProgress < 0.88) snapBack();
  };

  // ─── Derived values ──────────────────────────────────────────────────────────
  const isVideo = nft.mediaType === "video";
  const isRare = nft.rarity === "Rare";

  const glowBase = 0.25 + sliderProgress * 0.45;
  const glowOuter = 0.1 + sliderProgress * 0.25;
  const packGlow = `0 0 ${40 + sliderProgress * 40}px rgba(52,211,153,${glowBase}), 0 0 ${80 + sliderProgress * 80}px rgba(52,211,153,${glowOuter})`;
  const labelOpacity = Math.max(0, 1 - sliderProgress * 2.5);

  const inIdleOrSliding = phase === "idle";

  const editionText = isVideo
    ? `Video #${nft.editionNumber} of ${nft.totalSupply}`
    : `Photo #${nft.editionNumber} of ${nft.totalSupply}`;

  const overlay = (
    <dialog
      ref={dialogRef}
      className="pack-opening-dialog"
      data-ocid="collection.modal"
      aria-label="Pack Opening"
      style={{
        zIndex: 9999,
        padding: "24px 20px 48px",
        background: "rgba(4,12,8,0.88)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        animation: "overlayFadeIn 0.28s ease",
      }}
    >
      {/* ── IDLE: Pack + Slide to Open ─────────────────────────────────────── */}
      {inIdleOrSliding && (
        <>
          {/* Floating pack card */}
          <div
            style={{
              width: "220px",
              aspectRatio: "4/5",
              borderRadius: "18px",
              overflow: "hidden",
              border: "1.5px solid rgba(52,211,153,0.30)",
              boxShadow: packGlow,
              position: "relative",
              animation: "packFloat 3s ease-in-out infinite",
              marginBottom: "auto",
              marginTop: "auto",
              flexShrink: 0,
            }}
          >
            {/* Wrapper shell — full fill */}
            <img
              src={wrapperImageUrl}
              alt="Sealed Pack"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                zIndex: 0,
              }}
            />
            {/* Cover art insert — centered label visible through wrapper window */}
            {pack.coverPhotoUrl && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 1,
                }}
              >
                <img
                  src={pack.coverPhotoUrl}
                  alt=""
                  aria-hidden="true"
                  style={{
                    width: "58%",
                    height: "52%",
                    objectFit: "cover",
                    borderRadius: "6px",
                    opacity: 0.88,
                    display: "block",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.32)",
                  }}
                />
              </div>
            )}
          </div>

          {/* Spacer */}
          <div style={{ flex: 1, minHeight: "32px" }} />

          {/* Slide to Open control */}
          <div
            style={{
              width: "100%",
              maxWidth: "340px",
              paddingBottom: "8px",
              userSelect: "none",
              WebkitUserSelect: "none",
            }}
          >
            {/* Label */}
            <div
              style={{
                textAlign: "center",
                marginBottom: "14px",
                opacity: labelOpacity,
                transition: isDragging ? "none" : "opacity 0.25s ease",
              }}
            >
              <span
                style={{
                  fontSize: "13px",
                  color: "rgba(255,255,255,0.55)",
                  letterSpacing: "0.08em",
                  fontWeight: 500,
                  textTransform: "uppercase",
                }}
              >
                Slide to Open
              </span>
            </div>

            {/* Track */}
            <div
              ref={trackRef}
              data-ocid="collection.drag_handle"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              style={{
                position: "relative",
                width: "100%",
                height: "64px",
                borderRadius: "32px",
                background: "rgba(52,211,153,0.10)",
                border: "1px solid rgba(52,211,153,0.22)",
                cursor: isDragging ? "grabbing" : "grab",
                touchAction: "none",
                overflow: "hidden",
              }}
            >
              {/* Fill bar */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${knobX + KNOB_SIZE / 2}px`,
                  background:
                    "linear-gradient(90deg, rgba(52,211,153,0.22), rgba(52,211,153,0.12))",
                  borderRadius: "32px",
                  transition: isDragging
                    ? "none"
                    : "width 0.35s cubic-bezier(0.22,1,0.36,1)",
                  pointerEvents: "none",
                }}
              />

              {/* Knob */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: `${knobX + 5}px`,
                  transform: "translateY(-50%)",
                  width: `${KNOB_SIZE}px`,
                  height: `${KNOB_SIZE}px`,
                  borderRadius: "50%",
                  background: "#ffffff",
                  boxShadow:
                    "0 2px 12px rgba(0,0,0,0.25), 0 0 0 2px rgba(52,211,153,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: isDragging
                    ? "none"
                    : "left 0.35s cubic-bezier(0.22,1,0.36,1)",
                  pointerEvents: "none",
                  flexShrink: 0,
                }}
              >
                {/* Arrow chevron — decorative */}
                <svg
                  aria-hidden="true"
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  style={{ opacity: 0.55 }}
                >
                  <path
                    d="M6 4l5 5-5 5"
                    stroke="#040c08"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* Chevron hint on right — decorative */}
              <div
                style={{
                  position: "absolute",
                  right: "18px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  opacity: Math.max(0, 1 - sliderProgress * 3) * 0.35,
                  pointerEvents: "none",
                  transition: isDragging ? "none" : "opacity 0.2s",
                }}
              >
                <svg
                  aria-hidden="true"
                  width="14"
                  height="14"
                  viewBox="0 0 18 18"
                  fill="none"
                >
                  <path
                    d="M6 4l5 5-5 5"
                    stroke="rgba(52,211,153,0.8)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── ANTICIPATION: Pack shakes + glows ─────────────────────────────── */}
      {phase === "anticipation" && (
        <div
          style={{
            width: "220px",
            aspectRatio: "4/5",
            borderRadius: "18px",
            overflow: "hidden",
            border: "1.5px solid rgba(52,211,153,0.50)",
            boxShadow:
              "0 0 80px rgba(52,211,153,0.70), 0 0 160px rgba(52,211,153,0.35), inset 0 0 40px rgba(52,211,153,0.15)",
            position: "relative",
            animation: "packShake 400ms ease-in-out forwards",
            flexShrink: 0,
          }}
        >
          {/* Wrapper shell */}
          <img
            src={wrapperImageUrl}
            alt="Sealed Pack"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              zIndex: 0,
            }}
          />
          {/* Cover art insert */}
          {pack.coverPhotoUrl && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1,
              }}
            >
              <img
                src={pack.coverPhotoUrl}
                alt=""
                aria-hidden="true"
                style={{
                  width: "58%",
                  height: "52%",
                  objectFit: "cover",
                  borderRadius: "6px",
                  opacity: 0.88,
                  display: "block",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.32)",
                }}
              />
            </div>
          )}
          {/* Inner glow overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse at 50% 50%, rgba(52,211,153,0.18), transparent 70%)",
              pointerEvents: "none",
              zIndex: 2,
            }}
          />
        </div>
      )}

      {/* ── TEAR: Pack halves split ───────────────────────────────────────── */}
      {phase === "tear" && (
        <div
          style={{
            position: "relative",
            width: "220px",
            aspectRatio: "4/5",
            flexShrink: 0,
          }}
        >
          {/* Top half */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "220px",
              height: "50%",
              overflow: "hidden",
              borderRadius: "18px 18px 0 0",
              animation: "halfTearTop 700ms cubic-bezier(0.4,0,0.2,1) forwards",
            }}
          >
            <img
              src={wrapperImageUrl}
              alt=""
              aria-hidden="true"
              style={{
                width: "220px",
                height: "calc(220px * 5 / 4)",
                objectFit: "cover",
                objectPosition: "top",
                display: "block",
              }}
            />
          </div>

          {/* Bottom half */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: "220px",
              height: "50%",
              overflow: "hidden",
              borderRadius: "0 0 18px 18px",
              animation:
                "halfTearBottom 700ms cubic-bezier(0.4,0,0.2,1) forwards",
            }}
          >
            <img
              src={wrapperImageUrl}
              alt=""
              aria-hidden="true"
              style={{
                width: "220px",
                height: "calc(220px * 5 / 4)",
                objectFit: "cover",
                objectPosition: "bottom",
                display: "block",
                transform: "translateY(-100%)",
              }}
            />
          </div>

          {/* Light burst from the seam */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "160px",
              height: "160px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(255,255,255,0.22), rgba(52,211,153,0.18), transparent 70%)",
              pointerEvents: "none",
              animation: "lightBurst 700ms ease-out forwards",
            }}
          />
        </div>
      )}

      {/* ── SUSPENSE: Frosted silhouette ──────────────────────────────────── */}
      {phase === "suspense" && (
        <div
          aria-hidden="true"
          style={{
            width: "220px",
            aspectRatio: "4/5",
            borderRadius: "18px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.12)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            animation:
              "cardRise 0.35s ease-out, silhouettePulse 1.2s ease-in-out 0.35s infinite",
            flexShrink: 0,
          }}
        />
      )}

      {/* ── REVEAL + ACTION: NFT card rises, then metadata + buttons ────────── */}
      {(phase === "reveal" || phase === "action") && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            maxWidth: "320px",
          }}
        >
          {/* NFT Card */}
          <div
            style={{
              width: "260px",
              aspectRatio: "4/5",
              borderRadius: "18px",
              overflow: "hidden",
              border: isRare
                ? "1.5px solid rgba(52,211,153,0.55)"
                : "1px solid rgba(52,211,153,0.20)",
              boxShadow: isRare
                ? "0 0 50px rgba(52,211,153,0.30), 0 16px 50px rgba(0,0,0,0.55)"
                : "0 0 20px rgba(52,211,153,0.10), 0 16px 40px rgba(0,0,0,0.50)",
              position: "relative",
              animation:
                phase === "reveal"
                  ? "cardRise 600ms cubic-bezier(0.22,1,0.36,1) forwards"
                  : undefined,
              flexShrink: 0,
              marginBottom: phase === "action" ? "16px" : 0,
            }}
          >
            {/* Cover image — always static (no <video>) */}
            <img
              src={nft.imageUrl}
              alt={nft.title}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />

            {/* Video badge — bottom-right, motion cue for video NFTs */}
            {isVideo && (
              <div
                style={{
                  position: "absolute",
                  bottom: "10px",
                  right: "10px",
                  background: "rgba(4,12,8,0.75)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  borderRadius: "20px",
                  padding: "4px 10px",
                  border: "1px solid rgba(52,211,153,0.35)",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  animation: "metaFadeIn 0.35s ease 0.30s both",
                }}
              >
                <svg
                  aria-hidden="true"
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                >
                  <polygon points="2,1 9,5 2,9" fill="rgba(52,211,153,0.9)" />
                </svg>
                <span
                  style={{
                    fontSize: "10px",
                    color: "rgba(255,255,255,0.90)",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  VIDEO
                </span>
              </div>
            )}

            {/* Shine sweep — Rare only */}
            {isRare && shineActive && (
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  overflow: "hidden",
                  borderRadius: "18px",
                  pointerEvents: "none",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "50%",
                    height: "100%",
                    background:
                      "linear-gradient(to right, transparent, rgba(255,255,255,0.18), transparent)",
                    animation:
                      "shineSweep 0.65s cubic-bezier(0.4,0,0.6,1) forwards",
                  }}
                />
              </div>
            )}

            {/* Media type badge — top-left */}
            <div
              style={{
                position: "absolute",
                top: "10px",
                left: "10px",
                background: "rgba(4,12,8,0.78)",
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
                borderRadius: "20px",
                padding: "4px 10px",
                border: "1px solid rgba(52,211,153,0.28)",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                animation: "metaFadeIn 0.35s ease 0.30s both",
              }}
            >
              <span aria-hidden="true" style={{ fontSize: "11px" }}>
                {isVideo ? "▶" : "📷"}
              </span>
              <span
                style={{
                  fontSize: "10px",
                  color: "rgba(255,255,255,0.90)",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                {isVideo ? "Video" : "Photo"}
              </span>
            </div>

            {/* Rarity badge — top-right */}
            <div
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: isRare
                  ? "rgba(52,168,132,0.22)"
                  : "rgba(0,0,0,0.52)",
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
                borderRadius: "20px",
                padding: "4px 10px",
                border: isRare
                  ? "1px solid rgba(52,211,153,0.55)"
                  : "1px solid rgba(255,255,255,0.15)",
                animation: "metaFadeIn 0.35s ease 0.40s both",
              }}
            >
              <span
                style={{
                  fontSize: "10px",
                  color: isRare ? "#5de8bb" : "rgba(255,255,255,0.65)",
                  fontWeight: 700,
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                }}
              >
                {isRare ? "RARE" : "COMMON"}
              </span>
            </div>
          </div>

          {/* ── ACTION: Metadata + Buttons ────────────────────────────────── */}
          {phase === "action" && (
            <>
              {/* Staggered metadata */}
              <div
                style={{
                  textAlign: "center",
                  marginBottom: "20px",
                  width: "100%",
                  maxWidth: "280px",
                }}
              >
                {/* Title */}
                <div
                  style={{
                    fontSize: "15px",
                    color: "rgba(255,255,255,0.95)",
                    fontWeight: 700,
                    letterSpacing: "-0.01em",
                    marginBottom: "8px",
                    animation: "metaFadeIn 350ms ease 0ms both",
                  }}
                >
                  {nft.title}
                </div>

                {/* Rarity pill */}
                <div
                  style={{
                    display: "inline-block",
                    padding: "3px 12px",
                    borderRadius: "20px",
                    background: isRare
                      ? "rgba(52,168,132,0.18)"
                      : "rgba(255,255,255,0.08)",
                    border: isRare
                      ? "1px solid rgba(52,211,153,0.40)"
                      : "1px solid rgba(255,255,255,0.15)",
                    fontSize: "11px",
                    color: isRare ? "#5de8bb" : "rgba(255,255,255,0.60)",
                    fontWeight: 700,
                    letterSpacing: "0.09em",
                    textTransform: "uppercase" as const,
                    marginBottom: "8px",
                    animation: "metaFadeIn 350ms ease 80ms both",
                  }}
                >
                  {isRare ? "✦ Rare" : "Common"}
                </div>

                {/* Edition */}
                <div
                  style={{
                    fontSize: "12px",
                    color: "rgba(52,211,153,0.85)",
                    fontWeight: 600,
                    marginBottom: "5px",
                    animation: "metaFadeIn 350ms ease 140ms both",
                    display: "block",
                  }}
                >
                  {editionText}
                </div>

                {/* Creator */}
                <div
                  style={{
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.40)",
                    fontWeight: 500,
                    animation: "metaFadeIn 350ms ease 200ms both",
                  }}
                >
                  by {nft.creator}
                </div>
              </div>

              {/* Action buttons */}
              <div
                style={{
                  width: "100%",
                  maxWidth: "280px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  animation: "actionSlideUp 380ms ease 280ms both",
                }}
              >
                {/* View NFT — primary */}
                <button
                  type="button"
                  data-ocid="collection.primary_button"
                  onClick={handleComplete}
                  style={{
                    width: "100%",
                    height: "52px",
                    borderRadius: "14px",
                    border: "none",
                    background: "linear-gradient(160deg, #34A884, #2a9070)",
                    color: "#fff",
                    fontSize: "15px",
                    fontWeight: 700,
                    cursor: "pointer",
                    letterSpacing: "0.01em",
                    boxShadow:
                      "0 0 28px rgba(52,168,132,0.32), 0 4px 16px rgba(0,0,0,0.30)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    touchAction: "manipulation",
                  }}
                >
                  View NFT
                </button>

                {/* Back to Collection — secondary */}
                <button
                  type="button"
                  data-ocid="collection.secondary_button"
                  onClick={handleComplete}
                  style={{
                    width: "100%",
                    height: "48px",
                    borderRadius: "14px",
                    border: "1px solid rgba(52,211,153,0.32)",
                    background: "transparent",
                    color: "rgba(255,255,255,0.68)",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                    letterSpacing: "0.01em",
                    touchAction: "manipulation",
                  }}
                >
                  Back to Collection
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </dialog>
  );

  return ReactDOM.createPortal(overlay, document.body);
}
