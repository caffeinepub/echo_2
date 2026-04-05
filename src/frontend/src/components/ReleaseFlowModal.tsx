import {
  Check,
  ChevronLeft,
  ChevronRight,
  Film,
  Flame,
  Image,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { SealedPack } from "../context/CollectionContext";
import { useCollection } from "../context/CollectionContext";
import type { MarketRelease } from "../context/ReleasesMarketContext";
import { useReleasesMarket } from "../context/ReleasesMarketContext";

const MINT = "#7ED6B1";
const MINT_LIGHT = "rgba(16,185,129,0.10)";
const MINT_BORDER = "rgba(16,185,129,0.30)";

const COVER_OPTIONS = [
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&q=80",
  "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=200&q=80",
  "https://images.unsplash.com/photo-1492551557933-34265f7af79e?w=200&q=80",
  "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=200&q=80",
];

type MediaMode = "clip" | "image";

interface ReleaseFlowModalProps {
  open: boolean;
  onClose: () => void;
  pack: SealedPack;
  allPacksInSet: SealedPack[];
}

export function ReleaseFlowModal({
  open,
  onClose,
  pack,
  allPacksInSet,
}: ReleaseFlowModalProps) {
  const { addRelease } = useReleasesMarket();
  const { removeSealedPacks } = useCollection();

  const [step, setStep] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [mediaMode, setMediaMode] = useState<MediaMode>("image");
  const [previewClipUrl, setPreviewClipUrl] = useState<string | undefined>(
    undefined,
  );
  const [coverImage, setCoverImage] = useState(
    allPacksInSet[0]?.pendingNFT?.imageUrl ?? COVER_OPTIONS[0],
  );
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [priceStr, setPriceStr] = useState("2.00");
  const [confirmed, setConfirmed] = useState(false);

  // ── Clip camera state ──────────────────────────────────────────────────────
  const [clipCameraActive, setClipCameraActive] = useState(false);
  const [clipRecording, setClipRecording] = useState(false);
  const [clipCountdown, setClipCountdown] = useState(7);
  const [clipCameraError, setClipCameraError] = useState<string | null>(null);

  const clipVideoRef = useRef<HTMLVideoElement>(null);
  const clipStreamRef = useRef<MediaStream | null>(null);
  const clipMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const clipChunksRef = useRef<Blob[]>([]);
  const clipTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const maxQty = allPacksInSet.length;
  const priceUsd = Number.parseFloat(priceStr) || 0;

  // Collect cover images from packs (deduplicated)
  const packImages = [
    ...new Set(
      allPacksInSet
        .map((p) => p.pendingNFT?.imageUrl)
        .filter(Boolean) as string[],
    ),
    ...COVER_OPTIONS,
  ].slice(0, 8);

  // ── Clip camera helpers ────────────────────────────────────────────────────
  function stopClipCamera() {
    if (clipTimerRef.current) {
      clearInterval(clipTimerRef.current);
      clipTimerRef.current = null;
    }
    if (
      clipMediaRecorderRef.current &&
      clipMediaRecorderRef.current.state !== "inactive"
    ) {
      clipMediaRecorderRef.current.stop();
    }
    if (clipStreamRef.current) {
      for (const track of clipStreamRef.current.getTracks()) {
        track.stop();
      }
      clipStreamRef.current = null;
    }
    if (clipVideoRef.current) {
      clipVideoRef.current.srcObject = null;
    }
    setClipCameraActive(false);
    setClipRecording(false);
    setClipCountdown(7);
  }

  async function startClipCamera() {
    setClipCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      clipStreamRef.current = stream;
      if (clipVideoRef.current) {
        clipVideoRef.current.srcObject = stream;
        clipVideoRef.current.play().catch(() => {});
      }
      setClipCameraActive(true);
    } catch (err: any) {
      const msg =
        err?.name === "NotAllowedError"
          ? "Camera permission required. Please allow access and try again."
          : "Could not access camera. Try again.";
      setClipCameraError(msg);
    }
  }

  function startClipRecording() {
    const stream = clipStreamRef.current;
    if (!stream) return;
    clipChunksRef.current = [];
    setClipCountdown(7);

    let mr: MediaRecorder;
    try {
      mr = new MediaRecorder(stream, { mimeType: "video/webm" });
    } catch {
      mr = new MediaRecorder(stream);
    }

    mr.ondataavailable = (e) => {
      if (e.data.size > 0) clipChunksRef.current.push(e.data);
    };

    mr.onstop = () => {
      const blob = new Blob(clipChunksRef.current, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      // Revoke previous clip URL if any
      if (previewClipUrl) URL.revokeObjectURL(previewClipUrl);
      setPreviewClipUrl(url);
      setClipRecording(false);
      stopClipCamera();
    };

    clipMediaRecorderRef.current = mr;
    mr.start(100);
    setClipRecording(true);

    let elapsed = 0;
    clipTimerRef.current = setInterval(() => {
      elapsed += 1;
      setClipCountdown(7 - elapsed);
      if (elapsed >= 7) {
        stopClipRecording();
      }
    }, 1000);
  }

  function stopClipRecording() {
    if (clipTimerRef.current) {
      clearInterval(clipTimerRef.current);
      clipTimerRef.current = null;
    }
    if (
      clipMediaRecorderRef.current &&
      clipMediaRecorderRef.current.state !== "inactive"
    ) {
      clipMediaRecorderRef.current.stop();
    }
    setClipRecording(false);
  }

  // Stop clip camera when modal closes or step changes away
  // biome-ignore lint/correctness/useExhaustiveDependencies: stopClipCamera is a stable local function
  useEffect(() => {
    if (!open) {
      stopClipCamera();
    }
  }, [open]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: stopClipCamera is a stable local function
  useEffect(() => {
    if (step !== 1 || mediaMode !== "clip") {
      stopClipCamera();
    }
  }, [step, mediaMode]);

  // Cleanup on unmount
  // biome-ignore lint/correctness/useExhaustiveDependencies: stopClipCamera is a stable local function
  useEffect(() => {
    return () => {
      stopClipCamera();
    };
  }, []);

  // ── Other handlers ─────────────────────────────────────────────────────────
  function handleQuantityChange(delta: number) {
    setQuantity((prev) => Math.min(maxQty, Math.max(1, prev + delta)));
  }

  function handleConfirmRelease() {
    const now = Date.now();
    const selectedPacks = allPacksInSet.slice(0, quantity);
    const release: MarketRelease = {
      id: `release_${now}_${Math.random().toString(36).slice(2, 7)}`,
      creatorName: "you.icp",
      coverImageUrl: coverImage,
      previewClipUrl: mediaMode === "clip" ? previewClipUrl : undefined,
      title: title.trim() || pack.setName,
      caption: caption.trim(),
      setName: pack.setName,
      packsAvailable: quantity,
      packIds: selectedPacks.map((p) => p.id),
      priceUsd,
      listedAt: now,
      expiresAt: now + 24 * 3600000,
      status: "active",
      collectibleType: pack.collectibleType,
      creatorId: "you",
      packCount: quantity,
      explicit: false,
      hashtags: [],
      likes: 0,
    };
    addRelease(release);
    removeSealedPacks(selectedPacks.map((p) => p.id));
    setConfirmed(true);
    setTimeout(() => {
      onClose();
      setStep(0);
      setQuantity(1);
      setMediaMode("image");
      setPreviewClipUrl(undefined);
      setTitle("");
      setCaption("");
      setPriceStr("2.00");
      setConfirmed(false);
    }, 1200);
  }

  if (!open) return null;

  return (
    <div
      data-ocid="release_flow.modal"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 400,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        padding: "0",
      }}
    >
      {/* Backdrop */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Close"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Escape" || e.key === "Enter") onClose();
        }}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          animation: "rfBackdropIn 0.2s ease",
        }}
      />

      {/* Sheet */}
      <div
        style={{
          position: "relative",
          background: "var(--echo-surface, #FCFCFC)",
          borderRadius: "28px 28px 0 0",
          width: "100%",
          maxWidth: 520,
          maxHeight: "90dvh",
          overflowY: "auto",
          padding: "28px 20px 40px",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.18)",
          animation: "rfSlideUp 0.28s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        <style>{`
          @keyframes rfBackdropIn {
            from { opacity: 0; }
            to   { opacity: 1; }
          }
          @keyframes rfSlideUp {
            from { transform: translateY(60px); opacity: 0; }
            to   { transform: translateY(0); opacity: 1; }
          }
          @keyframes rfRecordPulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.08); }
          }
        `}</style>

        {/* Close */}
        <button
          type="button"
          data-ocid="release_flow.close_button"
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "rgba(0,0,0,0.06)",
            border: "none",
            borderRadius: "50%",
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#6b7280",
          }}
        >
          <X size={16} />
        </button>

        {/* Step dots */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 6,
            marginBottom: 20,
          }}
        >
          {[0, 1, 2].map((s) => (
            <div
              key={s}
              style={{
                width: s === step ? 20 : 7,
                height: 7,
                borderRadius: 4,
                background: s === step ? MINT : "rgba(0,0,0,0.12)",
                transition: "width 0.2s ease, background 0.2s ease",
              }}
            />
          ))}
        </div>

        {/* Step 0 — Quantity */}
        {step === 0 && (
          <div>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#111",
                marginBottom: 6,
              }}
            >
              How many packs to release?
            </h2>
            <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 24 }}>
              {pack.setName} ·{" "}
              <span style={{ color: MINT, fontWeight: 600 }}>
                "9 Photos + Video"
              </span>
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 20,
                marginBottom: 20,
              }}
            >
              <button
                type="button"
                data-ocid="release_flow.button"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  border: `1.5px solid ${MINT_BORDER}`,
                  background: MINT_LIGHT,
                  color: MINT,
                  fontSize: 22,
                  cursor: quantity <= 1 ? "not-allowed" : "pointer",
                  opacity: quantity <= 1 ? 0.4 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                −
              </button>
              <span
                style={{
                  fontSize: 36,
                  fontWeight: 700,
                  color: "#111",
                  minWidth: 56,
                  textAlign: "center",
                }}
              >
                {quantity}
              </span>
              <button
                type="button"
                data-ocid="release_flow.button"
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= maxQty}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  border: `1.5px solid ${MINT_BORDER}`,
                  background: MINT_LIGHT,
                  color: MINT,
                  fontSize: 22,
                  cursor: quantity >= maxQty ? "not-allowed" : "pointer",
                  opacity: quantity >= maxQty ? 0.4 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                +
              </button>
            </div>

            <button
              type="button"
              data-ocid="release_flow.secondary_button"
              onClick={() => setQuantity(maxQty)}
              style={{
                display: "block",
                width: "100%",
                padding: "11px",
                border: `1.5px solid ${MINT_BORDER}`,
                borderRadius: 12,
                background: MINT_LIGHT,
                color: MINT,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                marginBottom: 16,
              }}
            >
              Send all ({maxQty} packs)
            </button>

            <p
              style={{
                fontSize: 12,
                color: "#9ca3af",
                textAlign: "center",
                marginBottom: 24,
              }}
            >
              {maxQty} sealed pack{maxQty !== 1 ? "s" : ""} available in this
              set
            </p>

            <button
              type="button"
              data-ocid="release_flow.primary_button"
              onClick={() => setStep(1)}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: 14,
                background: "linear-gradient(135deg, #7ED6B1 0%, #5FC49A 100%)",
                color: "#fff",
                fontSize: 15,
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Step 1 — Listing Setup */}
        {step === 1 && (
          <div>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#111",
                marginBottom: 6,
              }}
            >
              Set up your release
            </h2>
            <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>
              Releasing {quantity} pack{quantity !== 1 ? "s" : ""} ·{" "}
              {pack.setName}
            </p>

            {/* ── Media type toggle ── */}
            <p
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#374151",
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Preview Media
            </p>
            <div
              style={{
                display: "flex",
                background: "rgba(0,0,0,0.05)",
                borderRadius: 12,
                padding: 3,
                marginBottom: 16,
                gap: 3,
              }}
            >
              <button
                type="button"
                data-ocid="release_flow.toggle"
                onClick={() => setMediaMode("clip")}
                style={{
                  flex: 1,
                  padding: "9px 12px",
                  borderRadius: 10,
                  border: "none",
                  background: mediaMode === "clip" ? "#fff" : "transparent",
                  color: mediaMode === "clip" ? MINT : "#6b7280",
                  fontSize: 13,
                  fontWeight: mediaMode === "clip" ? 700 : 500,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 5,
                  boxShadow:
                    mediaMode === "clip"
                      ? "0 1px 4px rgba(0,0,0,0.10)"
                      : "none",
                  transition: "all 0.15s ease",
                }}
              >
                <Film size={13} />
                Preview Clip
              </button>
              <button
                type="button"
                data-ocid="release_flow.toggle"
                onClick={() => setMediaMode("image")}
                style={{
                  flex: 1,
                  padding: "9px 12px",
                  borderRadius: 10,
                  border: "none",
                  background: mediaMode === "image" ? "#fff" : "transparent",
                  color: mediaMode === "image" ? MINT : "#6b7280",
                  fontSize: 13,
                  fontWeight: mediaMode === "image" ? 700 : 500,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 5,
                  boxShadow:
                    mediaMode === "image"
                      ? "0 1px 4px rgba(0,0,0,0.10)"
                      : "none",
                  transition: "all 0.15s ease",
                }}
              >
                <Image size={13} />
                Cover Image
              </button>
            </div>

            {/* ── Preview Clip — camera recorder ── */}
            {mediaMode === "clip" && (
              <div style={{ marginBottom: 20 }}>
                {/* No clip recorded yet — prompt to start camera */}
                {!previewClipUrl && !clipCameraActive && (
                  <div
                    style={{
                      border: "1.5px dashed rgba(0,0,0,0.14)",
                      borderRadius: 14,
                      padding: "20px 16px",
                      textAlign: "center",
                      background: "rgba(0,0,0,0.02)",
                    }}
                  >
                    <Film
                      size={24}
                      color="#9ca3af"
                      style={{ marginBottom: 8 }}
                    />
                    <p
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#374151",
                        margin: "0 0 4px",
                      }}
                    >
                      Record a 7-second preview
                    </p>
                    <p
                      style={{
                        fontSize: 12,
                        color: "#9ca3af",
                        margin: "0 0 14px",
                      }}
                    >
                      Clip will autoplay muted on your release card
                    </p>
                    {clipCameraError && (
                      <p
                        style={{
                          fontSize: 12,
                          color: "#ef4444",
                          margin: "0 0 10px",
                        }}
                      >
                        {clipCameraError}
                      </p>
                    )}
                    <button
                      type="button"
                      data-ocid="release_flow.button"
                      onClick={startClipCamera}
                      style={{
                        padding: "10px 22px",
                        borderRadius: 10,
                        background:
                          "linear-gradient(135deg, #7ED6B1 0%, #5FC49A 100%)",
                        border: "none",
                        color: "#fff",
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Open Camera
                    </button>
                  </div>
                )}

                {/* Camera active — show viewfinder */}
                {clipCameraActive && !previewClipUrl && (
                  <div
                    style={{
                      border: `1.5px solid ${MINT_BORDER}`,
                      borderRadius: 14,
                      overflow: "hidden",
                      background: "#000",
                      position: "relative",
                    }}
                  >
                    <video
                      ref={clipVideoRef}
                      autoPlay
                      muted
                      playsInline
                      style={{
                        width: "100%",
                        height: 200,
                        objectFit: "cover",
                        display: "block",
                      }}
                    />

                    {/* Recording indicator */}
                    {clipRecording && (
                      <div
                        style={{
                          position: "absolute",
                          top: 10,
                          left: 10,
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          background: "rgba(0,0,0,0.60)",
                          borderRadius: 20,
                          padding: "4px 10px",
                        }}
                      >
                        <div
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            background: "#ef4444",
                            animation: "rfRecordPulse 1s ease-in-out infinite",
                          }}
                        />
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: "#fff",
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          0:{String(clipCountdown).padStart(2, "0")}
                        </span>
                      </div>
                    )}

                    {/* Controls */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 16,
                        padding: "12px 16px",
                        background: "rgba(0,0,0,0.04)",
                      }}
                    >
                      {!clipRecording ? (
                        <button
                          type="button"
                          data-ocid="release_flow.button"
                          onClick={startClipRecording}
                          style={{
                            padding: "10px 24px",
                            borderRadius: 10,
                            background: "#ef4444",
                            border: "none",
                            color: "#fff",
                            fontSize: 13,
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <div
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: "#fff",
                            }}
                          />
                          Record
                        </button>
                      ) : (
                        <button
                          type="button"
                          data-ocid="release_flow.button"
                          onClick={stopClipRecording}
                          style={{
                            padding: "10px 24px",
                            borderRadius: 10,
                            background: "rgba(0,0,0,0.15)",
                            border: "1.5px solid rgba(255,255,255,0.3)",
                            color: "#fff",
                            fontSize: 13,
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          Stop Early
                        </button>
                      )}
                      <button
                        type="button"
                        data-ocid="release_flow.cancel_button"
                        onClick={stopClipCamera}
                        style={{
                          padding: "10px 16px",
                          borderRadius: 10,
                          background: "transparent",
                          border: "none",
                          color: "#6b7280",
                          fontSize: 13,
                          fontWeight: 500,
                          cursor: "pointer",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Clip recorded — show preview */}
                {previewClipUrl && (
                  <div>
                    <video
                      src={previewClipUrl}
                      muted
                      autoPlay
                      loop
                      playsInline
                      style={{
                        width: "100%",
                        maxHeight: 160,
                        objectFit: "cover",
                        borderRadius: 10,
                        marginBottom: 10,
                        display: "block",
                        border: `1.5px solid ${MINT_BORDER}`,
                      }}
                    />
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        justifyContent: "center",
                      }}
                    >
                      <p
                        style={{
                          fontSize: 12,
                          color: MINT,
                          fontWeight: 600,
                          margin: 0,
                          alignSelf: "center",
                        }}
                      >
                        ✓ Preview clip recorded
                      </p>
                      <button
                        type="button"
                        data-ocid="release_flow.button"
                        onClick={() => {
                          if (previewClipUrl)
                            URL.revokeObjectURL(previewClipUrl);
                          setPreviewClipUrl(undefined);
                        }}
                        style={{
                          padding: "5px 12px",
                          borderRadius: 8,
                          background: "rgba(0,0,0,0.06)",
                          border: "none",
                          color: "#374151",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Retake
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Cover image picker ── */}
            {mediaMode === "image" && (
              <div style={{ marginBottom: 20 }}>
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: 8,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Cover Image
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: 8,
                  }}
                >
                  {packImages.slice(0, 8).map((url) => (
                    <button
                      key={url}
                      type="button"
                      data-ocid="release_flow.button"
                      onClick={() => setCoverImage(url)}
                      style={{
                        aspectRatio: "1",
                        borderRadius: 10,
                        overflow: "hidden",
                        border: `2px solid ${
                          coverImage === url ? MINT : "rgba(0,0,0,0.08)"
                        }`,
                        padding: 0,
                        cursor: "pointer",
                        outline:
                          coverImage === url
                            ? `2px solid ${MINT}`
                            : "2px solid transparent",
                        outlineOffset: 1,
                        transition: "border 0.15s, outline 0.15s",
                      }}
                    >
                      <img
                        src={url}
                        alt="Cover option"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Title */}
            <p
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#374151",
                marginBottom: 6,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Title
            </p>
            <input
              data-ocid="release_flow.input"
              type="text"
              placeholder="e.g. Sunset Ride"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={60}
              style={{
                width: "100%",
                padding: "11px 13px",
                borderRadius: 12,
                border: "1.5px solid rgba(0,0,0,0.10)",
                background: "#fff",
                fontSize: 14,
                color: "#111",
                marginBottom: 16,
                boxSizing: "border-box",
                outline: "none",
                transition: "border 0.15s",
              }}
              onFocus={(e) => {
                (e.target as HTMLInputElement).style.border =
                  `1.5px solid ${MINT}`;
              }}
              onBlur={(e) => {
                (e.target as HTMLInputElement).style.border =
                  "1.5px solid rgba(0,0,0,0.10)";
              }}
            />

            {/* Caption */}
            <p
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#374151",
                marginBottom: 6,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Caption{" "}
              <span style={{ fontWeight: 400, color: "#9ca3af" }}>
                (optional)
              </span>
            </p>
            <div style={{ position: "relative", marginBottom: 16 }}>
              <textarea
                data-ocid="release_flow.textarea"
                placeholder="Add a short description (optional)"
                value={caption}
                onChange={(e) => setCaption(e.target.value.slice(0, 120))}
                rows={3}
                style={{
                  width: "100%",
                  padding: "11px 13px",
                  borderRadius: 12,
                  border: "1.5px solid rgba(0,0,0,0.10)",
                  background: "#fff",
                  fontSize: 14,
                  color: "#111",
                  resize: "none",
                  boxSizing: "border-box",
                  outline: "none",
                  fontFamily: "inherit",
                  transition: "border 0.15s",
                }}
                onFocus={(e) => {
                  (e.target as HTMLTextAreaElement).style.border =
                    `1.5px solid ${MINT}`;
                }}
                onBlur={(e) => {
                  (e.target as HTMLTextAreaElement).style.border =
                    "1.5px solid rgba(0,0,0,0.10)";
                }}
              />
              <span
                style={{
                  position: "absolute",
                  bottom: 8,
                  right: 12,
                  fontSize: 11,
                  color: caption.length > 100 ? "#f59e0b" : "#9ca3af",
                }}
              >
                {caption.length}/120
              </span>
            </div>

            {/* Price */}
            <p
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#374151",
                marginBottom: 6,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Price per pack
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: "1.5px solid rgba(0,0,0,0.10)",
                borderRadius: 12,
                background: "#fff",
                overflow: "hidden",
                marginBottom: 24,
              }}
            >
              <span
                style={{
                  padding: "11px 4px 11px 13px",
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#374151",
                }}
              >
                $
              </span>
              <input
                data-ocid="release_flow.input"
                type="number"
                step="0.50"
                min="0.01"
                value={priceStr}
                onChange={(e) => setPriceStr(e.target.value)}
                style={{
                  flex: 1,
                  padding: "11px 13px 11px 4px",
                  border: "none",
                  outline: "none",
                  fontSize: 14,
                  color: "#111",
                  background: "transparent",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
              }}
            >
              <button
                type="button"
                data-ocid="release_flow.cancel_button"
                onClick={() => setStep(0)}
                style={{
                  flex: 1,
                  padding: "13px",
                  borderRadius: 14,
                  border: "1.5px solid rgba(0,0,0,0.10)",
                  background: "#fff",
                  color: "#374151",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                }}
              >
                <ChevronLeft size={15} />
                Back
              </button>
              <button
                type="button"
                data-ocid="release_flow.primary_button"
                onClick={() => setStep(2)}
                style={{
                  flex: 2,
                  padding: "13px",
                  borderRadius: 14,
                  background:
                    "linear-gradient(135deg, #7ED6B1 0%, #5FC49A 100%)",
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — Confirm */}
        {step === 2 && (
          <div>
            {confirmed ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "40px 0",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #7ED6B1, #5FC49A)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 16px rgba(16,185,129,0.35)",
                  }}
                >
                  <Check size={26} color="white" />
                </div>
                <p
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    color: "#111",
                  }}
                >
                  Released!
                </p>
                <p style={{ fontSize: 13, color: "#6b7280" }}>
                  Your packs are now live in the marketplace.
                </p>
              </div>
            ) : (
              <>
                <h2
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#111",
                    marginBottom: 16,
                  }}
                >
                  Confirm release
                </h2>

                {/* Summary card */}
                <div
                  style={{
                    background: "#fff",
                    borderRadius: 16,
                    overflow: "hidden",
                    border: "1.5px solid rgba(0,0,0,0.08)",
                    marginBottom: 16,
                  }}
                >
                  {mediaMode === "clip" && previewClipUrl ? (
                    <video
                      src={previewClipUrl}
                      muted
                      autoPlay
                      loop
                      playsInline
                      style={{
                        width: "100%",
                        height: 140,
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  ) : (
                    <img
                      src={coverImage}
                      alt="Release cover"
                      style={{
                        width: "100%",
                        height: 140,
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  )}
                  <div style={{ padding: "14px 16px" }}>
                    <p
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: "#111",
                        marginBottom: 4,
                      }}
                    >
                      {title.trim() || pack.setName}
                    </p>
                    {caption.trim() && (
                      <p
                        style={{
                          fontSize: 13,
                          color: "#6b7280",
                          marginBottom: 8,
                        }}
                      >
                        {caption}
                      </p>
                    )}
                    <p
                      style={{
                        fontSize: 12,
                        color: "#9ca3af",
                        marginBottom: 8,
                      }}
                    >
                      {pack.setName}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ fontSize: 13, color: "#374151" }}>
                        {quantity} pack{quantity !== 1 ? "s" : ""}
                      </span>
                      <span
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          color: MINT,
                        }}
                      >
                        ${priceUsd.toFixed(2)}
                        <span
                          style={{
                            fontSize: 11,
                            color: "#9ca3af",
                            fontWeight: 400,
                            marginLeft: 3,
                          }}
                        >
                          each
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Burn warning */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 8,
                    background: "rgba(245,158,11,0.08)",
                    border: "1px solid rgba(245,158,11,0.20)",
                    borderRadius: 12,
                    padding: "11px 14px",
                    marginBottom: 20,
                  }}
                >
                  <Flame
                    size={15}
                    color="#f59e0b"
                    style={{ flexShrink: 0, marginTop: 1 }}
                  />
                  <p
                    style={{
                      fontSize: 12,
                      color: "#92400e",
                      lineHeight: 1.5,
                    }}
                  >
                    Listing expires in <strong>24 hours</strong>. Unsold packs
                    will be <strong>burned permanently</strong> — they do not
                    return to your Collection.
                  </p>
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    type="button"
                    data-ocid="release_flow.cancel_button"
                    onClick={() => setStep(1)}
                    style={{
                      flex: 1,
                      padding: "13px",
                      borderRadius: 14,
                      border: "1.5px solid rgba(0,0,0,0.10)",
                      background: "#fff",
                      color: "#374151",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 4,
                    }}
                  >
                    <ChevronLeft size={15} />
                    Back
                  </button>
                  <button
                    type="button"
                    data-ocid="release_flow.confirm_button"
                    onClick={handleConfirmRelease}
                    style={{
                      flex: 2,
                      padding: "13px",
                      borderRadius: 14,
                      background:
                        "linear-gradient(135deg, #7ED6B1 0%, #5FC49A 100%)",
                      color: "#fff",
                      fontSize: 15,
                      fontWeight: 700,
                      border: "none",
                      cursor: "pointer",
                      boxShadow: "0 4px 14px rgba(16,185,129,0.30)",
                    }}
                  >
                    Confirm Release
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
