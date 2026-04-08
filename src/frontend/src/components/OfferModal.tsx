import { CheckCircle, X } from "lucide-react";
import { useRef, useState } from "react";
import type { OfferRecord } from "../context/BondingCurveContext";
import { usePackStyle } from "../context/PackStyleContext";
import type { MarketListing } from "../pages/MarketPage";
import { BtcLogo } from "./BtcLogo";

export type { OfferRecord };

const LS_OFFERS_KEY = "minty_offers_v1";

export function loadOffers(): OfferRecord[] {
  try {
    const raw = localStorage.getItem(LS_OFFERS_KEY);
    return raw ? (JSON.parse(raw) as OfferRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveOffers(offers: OfferRecord[]) {
  try {
    localStorage.setItem(LS_OFFERS_KEY, JSON.stringify(offers));
  } catch {
    /* ignore */
  }
}

interface Props {
  listing: MarketListing;
  clipTitle: string;
  onClose: () => void;
  onOfferSent: () => void;
}

export function OfferModal({
  listing,
  clipTitle,
  onClose,
  onOfferSent,
}: Props) {
  const { activeStyle } = usePackStyle();
  const accentR = activeStyle.accentR;
  const accentG = activeStyle.accentG;
  const accentB = activeStyle.accentB;
  const accent = `rgb(${accentR},${accentG},${accentB})`;
  const accentBorder = `rgba(${accentR},${accentG},${accentB},0.28)`;
  const accentBg = `rgba(${accentR},${accentG},${accentB},0.08)`;
  const accentGlow = `rgba(${accentR},${accentG},${accentB},0.35)`;
  const accentGrad = `linear-gradient(135deg, rgba(${accentR},${accentG},${accentB},0.85) 0%, rgba(160,100,220,0.85) 100%)`;

  const [offerInput, setOfferInput] = useState("");
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Slide-to-confirm state
  const sliderRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);

  function getTrackWidth() {
    return sliderRef.current ? sliderRef.current.offsetWidth - 48 : 260;
  }

  function handlePointerDown(e: React.PointerEvent) {
    if (confirmed) return;
    const offerVal = Number.parseFloat(offerInput);
    if (!offerInput || Number.isNaN(offerVal) || offerVal <= 0) {
      setError("Please enter a valid offer amount greater than $0");
      return;
    }
    setError("");
    setIsDragging(true);
    startXRef.current = e.clientX - dragX;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!isDragging) return;
    const newX = Math.max(
      0,
      Math.min(e.clientX - startXRef.current, getTrackWidth()),
    );
    setDragX(newX);
  }

  function handlePointerUp() {
    if (!isDragging) return;
    setIsDragging(false);
    const track = getTrackWidth();
    if (dragX >= track * 0.82) {
      setDragX(track);
      setConfirmed(true);
      submitOffer();
    } else {
      setDragX(0);
    }
  }

  function submitOffer() {
    const offerVal = Number.parseFloat(offerInput);
    const record: OfferRecord = {
      id: `offer_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      clipId: listing.clipId,
      listingId: listing.id,
      editionNumber: listing.editionNumber,
      offerPriceUsd: offerVal,
      offererUsername: "You",
      status: "pending",
      createdAt: Date.now(),
    };
    const existing = loadOffers();
    saveOffers([record, ...existing]);
    setTimeout(() => {
      setShowSuccess(true);
      setTimeout(() => {
        onOfferSent();
        onClose();
      }, 1400);
    }, 300);
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  const fillPct = Math.round((dragX / Math.max(1, getTrackWidth())) * 100);
  const offerVal = Number.parseFloat(offerInput);
  const isValidOffer =
    offerInput.length > 0 && !Number.isNaN(offerVal) && offerVal > 0;

  return (
    // biome-ignore lint/a11y/useSemanticElements: backdrop
    <div
      role="dialog"
      aria-modal="true"
      onClick={handleBackdropClick}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 600,
        background: "rgba(8,0,18,0.82)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        fontFamily: "DM Sans, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          borderRadius: "24px 24px 0 0",
          background: "rgba(14,6,26,0.98)",
          border: `1px solid ${accentBorder}`,
          boxShadow: `0 -10px 50px ${accentGlow}`,
          padding: "0 0 env(safe-area-inset-bottom, 16px)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 18px 14px",
            borderBottom: `1px solid ${accentBorder}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: accentGrad,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 15,
              }}
            >
              💬
            </div>
            <div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#f0eaff",
                  lineHeight: 1.2,
                }}
              >
                Make an Offer
              </div>
              <div style={{ fontSize: 12, color: accent, marginTop: 1 }}>
                Edition #{listing.editionNumber}/{listing.totalEditions}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close offer modal"
            data-ocid="offer_modal.close"
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              border: `1px solid ${accentBorder}`,
              background: accentBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#c0a8e6",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            padding: "20px 18px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* Clip info row */}
          <div
            style={{
              borderRadius: 14,
              background: accentBg,
              border: `1px solid ${accentBorder}`,
              padding: "12px 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#f0eaff",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {clipTitle || "Untitled Moment"}
              </div>
              <div style={{ fontSize: 11, color: "#9070b0", marginTop: 2 }}>
                @{listing.sellerId.replace("user_", "")}
              </div>
            </div>
            <div style={{ flexShrink: 0, textAlign: "right" }}>
              <div
                style={{
                  fontSize: 10,
                  color: "#7050a0",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 2,
                }}
              >
                Listed at
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: accent,
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                <BtcLogo size={12} />${listing.listPrice.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Offer input */}
          <div>
            <label
              htmlFor="offer-input"
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#9070b0",
                display: "block",
                marginBottom: 7,
              }}
            >
              Your Offer (USD in BTC)
            </label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                borderRadius: 14,
                background: accentBg,
                border: `1.5px solid ${error ? "rgba(220,80,80,0.5)" : accentBorder}`,
                padding: "0 14px",
                transition: "border-color 0.2s",
              }}
            >
              <BtcLogo size={14} />
              <span style={{ fontSize: 18, fontWeight: 700, color: accent }}>
                $
              </span>
              <input
                id="offer-input"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={offerInput}
                onChange={(e) => {
                  setOfferInput(e.target.value);
                  setError("");
                }}
                data-ocid="offer_modal.price_input"
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  fontSize: 22,
                  fontWeight: 700,
                  color: "#f0eaff",
                  padding: "12px 0",
                  fontFamily: "DM Sans, sans-serif",
                  WebkitAppearance: "none",
                  MozAppearance: "textfield",
                }}
              />
            </div>
            {error && (
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(220,80,80,0.9)",
                  marginTop: 5,
                  paddingLeft: 4,
                }}
              >
                {error}
              </div>
            )}
            {isValidOffer && offerVal < listing.listPrice && (
              <div
                style={{
                  fontSize: 11,
                  color: "#9070b0",
                  marginTop: 5,
                  paddingLeft: 4,
                }}
              >
                Your offer is{" "}
                <span style={{ color: accent }}>
                  ${(listing.listPrice - offerVal).toFixed(2)} below
                </span>{" "}
                the asking price.
              </div>
            )}
          </div>

          {/* Slide to confirm */}
          {showSuccess ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "14px",
                borderRadius: 50,
                background: `rgba(${accentR},${accentG},${accentB},0.18)`,
                border: `1.5px solid ${accentBorder}`,
              }}
            >
              <CheckCircle size={20} color={accent} />
              <span style={{ fontSize: 14, fontWeight: 700, color: accent }}>
                Offer sent!
              </span>
            </div>
          ) : (
            <div style={{ userSelect: "none" }}>
              <div
                ref={sliderRef}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                data-ocid="offer_modal.slide_confirm"
                style={{
                  position: "relative",
                  height: 52,
                  borderRadius: 50,
                  background: confirmed
                    ? `rgba(${accentR},${accentG},${accentB},0.22)`
                    : `rgba(${accentR},${accentG},${accentB},0.08)`,
                  border: `1.5px solid ${accentBorder}`,
                  overflow: "hidden",
                  cursor: confirmed ? "default" : "grab",
                  transition: "background 0.3s",
                }}
              >
                {/* Fill track */}
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${Math.min(fillPct + 5, 100)}%`,
                    background: accentGrad,
                    opacity: 0.25,
                    transition: isDragging ? "none" : "width 0.3s ease",
                    borderRadius: 50,
                  }}
                />
                {/* Label */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 700,
                    color: confirmed ? accent : "#9070b0",
                    pointerEvents: "none",
                    letterSpacing: "0.04em",
                  }}
                >
                  {confirmed ? "Offer Sent ✓" : "Slide to Send Offer →"}
                </div>
                {/* Thumb */}
                {!confirmed && (
                  <div
                    ref={thumbRef}
                    onPointerDown={handlePointerDown}
                    style={{
                      position: "absolute",
                      top: 4,
                      left: 4 + dragX,
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: accentGrad,
                      boxShadow: `0 2px 12px ${accentGlow}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "grab",
                      transition: isDragging ? "none" : "left 0.3s ease",
                      fontSize: 18,
                    }}
                  >
                    💬
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
