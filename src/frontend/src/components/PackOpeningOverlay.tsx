import { useCallback, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import type { CollectionNFT, SealedPack } from "../context/CollectionContext";
import { usePackStyle } from "../context/PackStyleContext";

const OVERLAY_KEYFRAMES = `
  @keyframes packFloat {
    0%   { transform: translateY(0px); }
    50%  { transform: translateY(-8px); }
    100% { transform: translateY(0px); }
  }
  @keyframes packAppear {
    0%   { opacity: 0; transform: translateY(24px) scale(0.94); }
    100% { opacity: 1; transform: translateY(0px) scale(1); }
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
  @keyframes nftRevealFade {
    0%   { opacity: 0; transform: scale(0.96); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes nftRevealFadeVideo {
    0%   { opacity: 0; transform: scale(0.97); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes uiOverlayIn {
    0%   { opacity: 0; transform: translateY(10px); }
    100% { opacity: 1; transform: translateY(0px); }
  }
  @keyframes metaFadeIn {
    0%   { opacity: 0; transform: translateY(10px); }
    100% { opacity: 1; transform: translateY(0px); }
  }
  @keyframes overlayFadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes cardRise {
    0%   { opacity: 0; transform: translateY(50px) scale(0.90); }
    100% { opacity: 1; transform: translateY(0px) scale(1.0); }
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes panelIn {
    from { opacity: 0; transform: scale(0.96); }
    to   { opacity: 1; transform: scale(1); }
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
    overflow: hidden;
    box-sizing: border-box;
  }
  dialog.pack-opening-dialog::backdrop {
    display: none;
  }
`;

const DROPBOX_IMAGE =
  "https://www.dropbox.com/scl/fi/aoe7dmzh7jqriugs8p9xl/Photo-Apr-05-2026-2-05-53-AM.png?rlkey=6squh6tpozf5ljw7gtiwl0ovz&dl=1";

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
  nft: CollectionNFT | null;
  onComplete: (nft: CollectionNFT) => void;
  onClose: () => void;
  isLoading?: boolean;
}

type Phase = "idle" | "anticipation" | "tear" | "suspense" | "reveal";

const KNOB_SIZE = 54;

export function PackOpeningOverlay({
  pack: _pack,
  nft,
  onComplete,
  onClose,
  isLoading = false,
}: PackOpeningOverlayProps) {
  ensureOverlayStyles();

  const { activeStyle: activeCycle } = usePackStyle();
  const r = activeCycle.accentR;
  const g = activeCycle.accentG;
  const b = activeCycle.accentB;

  const [phase, setPhase] = useState<Phase>("idle");
  const [shineActive, setShineActive] = useState(false);
  const completedRef = useRef(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const trackRef = useRef<HTMLDivElement>(null);
  const [knobX, setKnobX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [sliderProgress, setSliderProgress] = useState(0);
  const [sliderTriggered, setSliderTriggered] = useState(false);
  const dragStartXRef = useRef(0);
  const knobStartXRef = useRef(0);
  const trackRefStable = trackRef;

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

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
      const t = setTimeout(() => {
        if (nft?.rarity === "Rare") setShineActive(true);
      }, 300);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [phase, nft?.rarity]);

  const handleComplete = useCallback(() => {
    if (completedRef.current || !nft) return;
    completedRef.current = true;
    onComplete(nft);
  }, [nft, onComplete]);

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

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (sliderTriggered || isLoading || !nft) return;
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

  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (sliderTriggered || isLoading || !nft) return;
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

  const isVideo = nft?.mediaType === "video";
  const isRare = nft?.rarity === "Rare";
  const isSlideDisabled = isLoading || !nft;

  const labelOpacity = Math.max(0, 1 - sliderProgress * 2.5);
  const inIdleOrSliding = phase === "idle";

  // Format mint date/time
  const mintDate = nft?.mintDate ? new Date(nft.mintDate) : new Date();
  const mintDateStr = mintDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const mintTimeStr = mintDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  const handlePanelKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  const overlay = (
    <dialog
      ref={dialogRef}
      className="pack-opening-dialog"
      data-ocid="collection.modal"
      aria-label="Pack Opening"
      style={{
        zIndex: 9999,
        padding: 0,
        background: "rgba(10,15,12,0.55)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        animation: "overlayFadeIn 0.32s ease",
      }}
    >
      {/* Scrim button — closes overlay when tapping outside panel (reveal only) */}
      {phase === "reveal" && (
        <button
          type="button"
          aria-label="Close overlay"
          onClick={onClose}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            cursor: "pointer",
            background: "transparent",
            border: "none",
            padding: 0,
          }}
        />
      )}

      {/* Close button — shown during non-reveal phases */}
      {phase !== "reveal" && (
        <button
          type="button"
          data-ocid="collection.close_button"
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            zIndex: 10,
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.18)",
            color: "rgba(255,255,255,0.80)",
            fontSize: "18px",
            lineHeight: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            padding: 0,
            touchAction: "manipulation",
            flexShrink: 0,
          }}
        >
          &#215;
        </button>
      )}

      {/* IDLE: Pack wrapper + Slide to Open */}
      {inIdleOrSliding && (
        <>
          <div
            style={{
              width: "240px",
              aspectRatio: "3/4",
              position: "relative",
              animation:
                "packAppear 0.42s cubic-bezier(0.22,1,0.36,1) both, packFloat 3s ease-in-out 0.42s infinite",
              marginBottom: "auto",
              marginTop: "auto",
              flexShrink: 0,
              filter: `drop-shadow(0 0 ${28 + sliderProgress * 36}px rgba(${r},${g},${b},${0.28 + sliderProgress * 0.38})) drop-shadow(0 24px 48px rgba(0,0,0,0.6))`,
              transition: isDragging ? "none" : "filter 0.2s ease",
            }}
          >
            <img
              src={DROPBOX_IMAGE}
              alt="Minty Pack"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                display: "block",
                borderRadius: "16px",
              }}
            />
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "16px",
                background: `radial-gradient(ellipse at 50% 50%, rgba(${r},${g},${b},${sliderProgress * 0.12}), transparent 70%)`,
                pointerEvents: "none",
                transition: isDragging ? "none" : "background 0.2s ease",
              }}
            />
          </div>

          <div style={{ flex: 1, minHeight: "28px" }} />

          {/* Slide control */}
          <div
            style={{
              width: "100%",
              maxWidth: "340px",
              paddingBottom: "8px",
              userSelect: "none",
              WebkitUserSelect: "none",
            }}
          >
            <div
              style={{
                textAlign: "center",
                marginBottom: "14px",
                opacity: isSlideDisabled ? 0.45 : labelOpacity,
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
                {isLoading ? "Preparing your pack\u2026" : "Slide to open pack"}
              </span>
            </div>

            <div
              ref={trackRef}
              data-ocid="collection.drag_handle"
              onPointerDown={isSlideDisabled ? undefined : onPointerDown}
              onPointerMove={isSlideDisabled ? undefined : onPointerMove}
              onPointerUp={isSlideDisabled ? undefined : onPointerUp}
              onPointerCancel={isSlideDisabled ? undefined : onPointerUp}
              onTouchStart={isSlideDisabled ? undefined : onTouchStart}
              onTouchMove={isSlideDisabled ? undefined : onTouchMove}
              onTouchEnd={isSlideDisabled ? undefined : onTouchEnd}
              style={{
                position: "relative",
                width: "100%",
                height: "64px",
                borderRadius: "32px",
                background: isSlideDisabled
                  ? `rgba(${r},${g},${b},0.05)`
                  : `rgba(${r},${g},${b},0.10)`,
                border: `1px solid rgba(${r},${g},${b},${isSlideDisabled ? 0.1 : 0.22})`,
                cursor: isSlideDisabled
                  ? "not-allowed"
                  : isDragging
                    ? "grabbing"
                    : "grab",
                touchAction: "none",
                overflow: "hidden",
                transition: "background 0.3s ease, border-color 0.3s ease",
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
                  background: `linear-gradient(90deg, rgba(${r},${g},${b},0.22), rgba(${r},${g},${b},0.12))`,
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
                  background: isSlideDisabled
                    ? "rgba(255,255,255,0.25)"
                    : "#ffffff",
                  boxShadow: `0 2px 12px rgba(0,0,0,0.25), 0 0 0 2px rgba(${r},${g},${b},0.25)`,
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
                {isLoading ? (
                  <div
                    style={{
                      width: "16px",
                      height: "16px",
                      border: "2px solid rgba(4,12,8,0.15)",
                      borderTop: `2px solid rgba(${r},${g},${b},0.8)`,
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                    }}
                  />
                ) : (
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
                )}
              </div>

              {/* Chevron hint */}
              {!isSlideDisabled && (
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
                      stroke={`rgba(${r},${g},${b},0.8)`}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ANTICIPATION: Wrapper shakes + glows */}
      {phase === "anticipation" && (
        <div
          style={{
            width: "240px",
            aspectRatio: "3/4",
            position: "relative",
            animation: "packShake 400ms ease-in-out forwards",
            flexShrink: 0,
            filter: `drop-shadow(0 0 60px rgba(${r},${g},${b},0.75)) drop-shadow(0 0 120px rgba(${r},${g},${b},0.40)) drop-shadow(0 24px 48px rgba(0,0,0,0.7))`,
          }}
        >
          <img
            src={DROPBOX_IMAGE}
            alt="Minty Pack"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              display: "block",
              borderRadius: "16px",
            }}
          />
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "16px",
              background: `radial-gradient(ellipse at 50% 50%, rgba(${r},${g},${b},0.22), transparent 65%)`,
              pointerEvents: "none",
            }}
          />
        </div>
      )}

      {/* TEAR: Wrapper halves split */}
      {phase === "tear" && (
        <div
          style={{
            position: "relative",
            width: "240px",
            aspectRatio: "3/4",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "240px",
              height: "50%",
              overflow: "hidden",
              borderRadius: "16px 16px 0 0",
              animation: "halfTearTop 700ms cubic-bezier(0.4,0,0.2,1) forwards",
            }}
          >
            <img
              src={DROPBOX_IMAGE}
              alt=""
              style={{
                width: "240px",
                height: "calc(240px * 4 / 3)",
                objectFit: "contain",
                display: "block",
              }}
            />
          </div>

          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: "240px",
              height: "50%",
              overflow: "hidden",
              borderRadius: "0 0 16px 16px",
              animation:
                "halfTearBottom 700ms cubic-bezier(0.4,0,0.2,1) forwards",
            }}
          >
            <img
              src={DROPBOX_IMAGE}
              alt=""
              style={{
                width: "240px",
                height: "calc(240px * 4 / 3)",
                objectFit: "contain",
                display: "block",
                transform: "translateY(-50%)",
              }}
            />
          </div>

          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "180px",
              height: "180px",
              borderRadius: "50%",
              background: `radial-gradient(circle, rgba(255,255,255,0.24), rgba(${r},${g},${b},0.18), transparent 70%)`,
              pointerEvents: "none",
              animation: "lightBurst 700ms ease-out forwards",
            }}
          />
        </div>
      )}

      {/* SUSPENSE: Frosted silhouette */}
      {phase === "suspense" && (
        <div
          aria-hidden="true"
          style={{
            width: "240px",
            aspectRatio: "3/4",
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

      {/* REVEAL: Floating glass panel */}
      {phase === "reveal" && nft && (
        <div
          data-ocid="collection.panel"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={handlePanelKeyDown}
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: "360px",
            width: "calc(100% - 32px)",
            borderRadius: "24px",
            background: "rgba(18,24,20,0.72)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: `1px solid rgba(${r},${g},${b},0.18)`,
            boxShadow: `0 32px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(${r},${g},${b},0.08)`,
            overflow: "hidden",
            animation: "panelIn 320ms cubic-bezier(0.22,1,0.36,1) both",
          }}
        >
          {/* Close × button top-right */}
          <button
            type="button"
            data-ocid="collection.close_button"
            onClick={onClose}
            aria-label="Close"
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              zIndex: 10,
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.10)",
              border: "1px solid rgba(255,255,255,0.18)",
              color: "rgba(255,255,255,0.65)",
              fontSize: "16px",
              lineHeight: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              padding: 0,
              touchAction: "manipulation",
              flexShrink: 0,
            }}
          >
            &#215;
          </button>

          {/* Media area — fills panel width, no side padding */}
          <div
            style={{
              borderRadius: "24px 24px 0 0",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {isVideo ? (
              <video
                src={nft.previewClipUrl || nft.imageUrl}
                autoPlay
                loop
                muted
                playsInline
                style={{
                  width: "100%",
                  display: "block",
                  maxHeight: "260px",
                  objectFit: "cover",
                  animation: "nftRevealFadeVideo 900ms ease forwards",
                }}
              />
            ) : (
              <img
                src={nft.imageUrl}
                alt={nft.title}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = DROPBOX_IMAGE;
                  (e.currentTarget as HTMLImageElement).style.objectFit =
                    "contain";
                  (e.currentTarget as HTMLImageElement).style.padding = "12px";
                  (e.currentTarget as HTMLImageElement).style.background =
                    "#F9F9F7";
                }}
                style={{
                  width: "100%",
                  display: "block",
                  maxHeight: "260px",
                  objectFit: "cover",
                  animation: "nftRevealFade 600ms ease forwards",
                }}
              />
            )}

            {/* Rare shine sweep */}
            {isRare && shineActive && (
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  overflow: "hidden",
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
                      "linear-gradient(to right, transparent, rgba(255,255,255,0.10), transparent)",
                    animation:
                      "shineSweep 0.80s cubic-bezier(0.4,0,0.6,1) forwards",
                  }}
                />
              </div>
            )}
          </div>

          {/* Info section */}
          <div
            style={{
              padding: "20px 20px 24px",
              animation: "metaFadeIn 380ms ease 200ms both",
            }}
          >
            {/* Rarity badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "3px 10px",
                borderRadius: "20px",
                background: isRare
                  ? `rgba(${r},${g},${b},0.18)`
                  : "rgba(255,255,255,0.07)",
                border: isRare
                  ? `1px solid rgba(${r},${g},${b},0.35)`
                  : "1px solid rgba(255,255,255,0.14)",
                fontSize: "10px",
                color: isRare
                  ? `rgba(${r},${g},${b},1)`
                  : "rgba(255,255,255,0.55)",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase" as const,
              }}
            >
              {isRare ? "RARE" : "COMMON"}
            </div>

            {/* Mint date */}
            <div style={{ marginTop: "12px" }}>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.75)",
                  lineHeight: 1.4,
                }}
              >
                Minted {mintDateStr}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 400,
                  color: "rgba(255,255,255,0.40)",
                  marginTop: "2px",
                }}
              >
                {mintTimeStr}
              </div>
            </div>

            {/* Primary action */}
            <div
              style={{
                marginTop: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <button
                type="button"
                data-ocid="collection.primary_button"
                onClick={handleComplete}
                style={{
                  width: "100%",
                  height: "50px",
                  borderRadius: "14px",
                  border: "none",
                  background: `linear-gradient(160deg, oklch(${activeCycle.accentOklchDark}), oklch(${activeCycle.accentOklchLight}))`,
                  color: "#fff",
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: "pointer",
                  letterSpacing: "0.01em",
                  touchAction: "manipulation",
                }}
              >
                View NFT
              </button>
            </div>
          </div>
        </div>
      )}
    </dialog>
  );

  return ReactDOM.createPortal(overlay, document.body);
}
