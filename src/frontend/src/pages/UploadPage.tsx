import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  ChevronRight,
  QrCode,
  ScanLine,
  Upload,
} from "lucide-react";
import { useState } from "react";
import { useTheme } from "../ThemeContext";

type Grader = "TAG" | "PSA" | null;
type PaymentRail = "USDC" | "BTC" | "ETH" | "SOL";

const STEPS = ["Grader", "Identify", "Photos", "Price", "Submit"] as const;
type Step = 0 | 1 | 2 | 3 | 4;

interface UploadPageProps {
  onBack: () => void;
}

export function UploadPage({ onBack }: UploadPageProps) {
  const { theme } = useTheme();
  const { identity } = useInternetIdentity();
  const isLight = theme === "light";

  const [step, setStep] = useState<Step>(0);
  const [grader, setGrader] = useState<Grader>(null);
  const [certNumber, setCertNumber] = useState("");
  const [metadata, setMetadata] = useState<{
    cardName: string;
    set: string;
    year: string;
    grade: string;
    certId: string;
  } | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [price, setPrice] = useState("");
  const [paymentRail, setPaymentRail] = useState<PaymentRail>("USDC");
  const [submitted, setSubmitted] = useState(false);

  const isSignedIn = !!identity && !identity.getPrincipal().isAnonymous();

  const pageBg = isLight ? "#f8f9fc" : "var(--echo-bg, #0a1208)";
  const panelBg = isLight ? "#ffffff" : "oklch(0.14 0.04 160 / 0.95)";
  const borderColor = isLight
    ? "rgba(0,0,0,0.08)"
    : "oklch(0.45 0.12 160 / 0.30)";
  const textPrimary = isLight ? "#0d1f1a" : "rgba(255,255,255,0.92)";
  const textSecondary = isLight ? "#6b8a80" : "oklch(0.62 0.08 160)";
  const inputBg = isLight ? "rgba(0,0,0,0.03)" : "oklch(0.18 0.06 165 / 0.70)";
  const mintColor = isLight ? "oklch(0.52 0.18 160)" : "oklch(0.72 0.18 160)";

  function handleFetchMetadata() {
    // Simulate metadata fetch from cert/QR
    setMetadata({
      cardName: "Eevee Promo",
      set: "McDonald's 2021",
      year: "2021",
      grade: grader === "TAG" ? "TAG 9" : "PSA 9",
      certId: certNumber || "QR-12345678",
    });
    setStep(2);
  }

  function handleAddPhoto() {
    // Simulate camera capture
    setPhotos((p) => [...p, `photo-${p.length + 1}`]);
  }

  function handleSubmit() {
    setSubmitted(true);
  }

  // ── Step indicator ──────────────────────────────────────────────────────────
  function StepIndicator() {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          marginBottom: "24px",
        }}
      >
        {STEPS.map((label, i) => (
          <>
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <div
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "10px",
                  fontWeight: 700,
                  flexShrink: 0,
                  background:
                    i < step
                      ? "oklch(0.65 0.18 160)"
                      : i === step
                        ? isLight
                          ? "rgba(126,214,177,0.15)"
                          : "oklch(0.45 0.16 160 / 0.25)"
                        : isLight
                          ? "rgba(0,0,0,0.06)"
                          : "rgba(255,255,255,0.06)",
                  color:
                    i < step ? "white" : i === step ? mintColor : textSecondary,
                  border:
                    i === step
                      ? `1.5px solid ${mintColor}`
                      : i < step
                        ? "1.5px solid oklch(0.65 0.18 160)"
                        : `1.5px solid ${borderColor}`,
                }}
              >
                {i < step ? <CheckCircle2 size={11} /> : i + 1}
              </div>
              <span
                style={{
                  fontSize: "10px",
                  color: i === step ? mintColor : textSecondary,
                  fontWeight: i === step ? 600 : 400,
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <ChevronRight
                key={`arrow-${label}`}
                size={12}
                style={{ color: borderColor, flexShrink: 0 }}
              />
            )}
          </>
        ))}
      </div>
    );
  }

  // ── Submitted success ───────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div
        style={{ minHeight: "100vh", background: pageBg, padding: "24px 16px" }}
      >
        <div
          style={{
            maxWidth: "480px",
            margin: "0 auto",
            background: panelBg,
            border: `1px solid ${borderColor}`,
            borderRadius: "16px",
            padding: "40px 28px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: isLight
                ? "rgba(126,214,177,0.12)"
                : "oklch(0.45 0.16 160 / 0.20)",
              border: `1px solid ${mintColor}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <CheckCircle2 size={26} style={{ color: mintColor }} />
          </div>
          <h2
            style={{
              color: textPrimary,
              fontSize: "20px",
              fontWeight: 700,
              marginBottom: "10px",
            }}
          >
            Listing Submitted
          </h2>
          <p
            style={{
              color: textSecondary,
              fontSize: "14px",
              lineHeight: "1.6",
              marginBottom: "28px",
            }}
          >
            Your slab has been submitted for review. An admin will verify and
            publish it shortly.
          </p>
          <button
            type="button"
            onClick={onBack}
            style={{
              padding: "11px 28px",
              borderRadius: "20px",
              background: isLight
                ? "rgba(126,214,177,0.10)"
                : "oklch(0.45 0.16 160 / 0.20)",
              color: mintColor,
              border: `1px solid ${isLight ? "rgba(126,214,177,0.30)" : "oklch(0.73 0.11 160 / 0.35)"}`,
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Back to Browse
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ minHeight: "100vh", background: pageBg, paddingBottom: "32px" }}
    >
      {/* Page header */}
      <div
        style={{
          position: "sticky",
          top: "72px",
          zIndex: 30,
          background: pageBg,
          borderBottom: `1px solid ${borderColor}`,
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <button
          type="button"
          onClick={onBack}
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
            border: `1px solid ${borderColor}`,
            color: textSecondary,
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <ArrowLeft size={15} />
        </button>
        <div>
          <h1
            style={{
              color: textPrimary,
              fontSize: "17px",
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            Submit a Listing
          </h1>
          <p
            style={{ color: textSecondary, fontSize: "11px", marginTop: "3px" }}
          >
            List your graded slab on Minty
          </p>
        </div>
      </div>

      <div
        style={{ padding: "20px 16px", maxWidth: "520px", margin: "0 auto" }}
      >
        <StepIndicator />

        {/* Prompt to sign in if not authenticated */}
        {!isSignedIn && (
          <div
            style={{
              background: isLight
                ? "rgba(126,214,177,0.06)"
                : "oklch(0.45 0.16 160 / 0.10)",
              border: `1px solid ${isLight ? "rgba(126,214,177,0.20)" : "oklch(0.73 0.11 160 / 0.25)"}`,
              borderRadius: "12px",
              padding: "14px 16px",
              marginBottom: "20px",
              fontSize: "13px",
              color: textSecondary,
            }}
          >
            Sign in with Internet Identity to submit a listing.
          </div>
        )}

        {/* STEP 0 — Select Grader */}
        {step === 0 && (
          <div
            style={{
              background: panelBg,
              border: `1px solid ${borderColor}`,
              borderRadius: "16px",
              padding: "24px",
            }}
          >
            <h2
              style={{
                color: textPrimary,
                fontSize: "16px",
                fontWeight: 700,
                marginBottom: "6px",
              }}
            >
              Select Grader
            </h2>
            <p
              style={{
                color: textSecondary,
                fontSize: "13px",
                marginBottom: "20px",
              }}
            >
              Which grading company issued this slab?
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              {(["TAG", "PSA"] as Grader[]).map((g) => (
                <button
                  key={g!}
                  type="button"
                  onClick={() => {
                    setGrader(g);
                    setStep(1);
                  }}
                  data-ocid={`upload.grader.${g?.toLowerCase()}.button`}
                  style={{
                    flex: 1,
                    padding: "18px 12px",
                    borderRadius: "12px",
                    border:
                      grader === g
                        ? `2px solid ${mintColor}`
                        : `1px solid ${borderColor}`,
                    background:
                      grader === g
                        ? isLight
                          ? "rgba(126,214,177,0.08)"
                          : "oklch(0.45 0.16 160 / 0.15)"
                        : inputBg,
                    color: grader === g ? mintColor : textPrimary,
                    fontSize: "16px",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 1 — Identify slab */}
        {step === 1 && (
          <div
            style={{
              background: panelBg,
              border: `1px solid ${borderColor}`,
              borderRadius: "16px",
              padding: "24px",
            }}
          >
            <h2
              style={{
                color: textPrimary,
                fontSize: "16px",
                fontWeight: 700,
                marginBottom: "6px",
              }}
            >
              Identify Slab
            </h2>
            <p
              style={{
                color: textSecondary,
                fontSize: "13px",
                marginBottom: "20px",
              }}
            >
              {grader === "TAG"
                ? "Scan the QR code on your slab."
                : "Enter your PSA cert number."}
            </p>

            {grader === "TAG" ? (
              <button
                type="button"
                onClick={handleFetchMetadata}
                data-ocid="upload.qr.scan_button"
                style={{
                  width: "100%",
                  padding: "32px 16px",
                  borderRadius: "12px",
                  border: `1px dashed ${isLight ? "rgba(126,214,177,0.40)" : "oklch(0.73 0.11 160 / 0.40)"}`,
                  background: isLight
                    ? "rgba(126,214,177,0.04)"
                    : "oklch(0.45 0.16 160 / 0.08)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "12px",
                  cursor: "pointer",
                  color: mintColor,
                }}
              >
                <QrCode size={36} strokeWidth={1.4} />
                <span style={{ fontSize: "14px", fontWeight: 600 }}>
                  Tap to scan QR code
                </span>
                <span style={{ fontSize: "11px", color: textSecondary }}>
                  Uses your device camera
                </span>
              </button>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div>
                  <label
                    htmlFor="cert-number"
                    style={{
                      fontSize: "11px",
                      color: textSecondary,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      display: "block",
                      marginBottom: "6px",
                    }}
                  >
                    PSA Cert Number
                  </label>
                  <input
                    type="text"
                    value={certNumber}
                    onChange={(e) => setCertNumber(e.target.value)}
                    placeholder="e.g. 12345678"
                    id="cert-number"
                    data-ocid="upload.cert.input"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      background: inputBg,
                      border: `1px solid ${borderColor}`,
                      color: textPrimary,
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleFetchMetadata}
                  data-ocid="upload.cert.fetch_button"
                  disabled={!certNumber.trim()}
                  style={{
                    padding: "11px",
                    borderRadius: "10px",
                    background: certNumber.trim()
                      ? "oklch(0.65 0.18 160)"
                      : inputBg,
                    color: certNumber.trim() ? "white" : textSecondary,
                    border: "none",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: certNumber.trim() ? "pointer" : "not-allowed",
                  }}
                >
                  Fetch Slab Data
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setStep(0)}
              style={{
                marginTop: "16px",
                background: "none",
                border: "none",
                color: textSecondary,
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              ← Back
            </button>
          </div>
        )}

        {/* STEP 2 — Photos */}
        {step === 2 && metadata && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
          >
            {/* Metadata preview */}
            <div
              style={{
                background: isLight
                  ? "rgba(126,214,177,0.06)"
                  : "oklch(0.45 0.16 160 / 0.12)",
                border: `1px solid ${isLight ? "rgba(126,214,177,0.20)" : "oklch(0.73 0.11 160 / 0.25)"}`,
                borderRadius: "12px",
                padding: "14px 16px",
              }}
            >
              <div
                style={{
                  fontSize: "10px",
                  color: textSecondary,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "8px",
                }}
              >
                Slab Identified
              </div>
              <div
                style={{
                  color: textPrimary,
                  fontWeight: 700,
                  fontSize: "16px",
                }}
              >
                {metadata.cardName}
              </div>
              <div
                style={{
                  color: textSecondary,
                  fontSize: "13px",
                  marginTop: "2px",
                }}
              >
                {metadata.set} · {metadata.year}
              </div>
              <div
                style={{
                  color: mintColor,
                  fontSize: "13px",
                  fontWeight: 600,
                  marginTop: "4px",
                }}
              >
                {metadata.grade} · Cert {metadata.certId}
              </div>
            </div>

            {/* Photo capture */}
            <div
              style={{
                background: panelBg,
                border: `1px solid ${borderColor}`,
                borderRadius: "16px",
                padding: "24px",
              }}
            >
              <h2
                style={{
                  color: textPrimary,
                  fontSize: "16px",
                  fontWeight: 700,
                  marginBottom: "6px",
                }}
              >
                Slab Photos
              </h2>
              <p
                style={{
                  color: textSecondary,
                  fontSize: "13px",
                  marginBottom: "16px",
                }}
              >
                Take live photos of your slab using the camera below.
              </p>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {["Front of slab", "Back of slab", "Label close-up"].map(
                  (label, i) => (
                    <button
                      key={label}
                      type="button"
                      onClick={handleAddPhoto}
                      data-ocid={`upload.photo.${i + 1}.button`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "14px 16px",
                        borderRadius: "12px",
                        border: photos[i]
                          ? `1.5px solid ${mintColor}`
                          : `1px dashed ${borderColor}`,
                        background: photos[i]
                          ? isLight
                            ? "rgba(126,214,177,0.06)"
                            : "oklch(0.45 0.16 160 / 0.12)"
                          : inputBg,
                        cursor: "pointer",
                      }}
                    >
                      {photos[i] ? (
                        <CheckCircle2
                          size={18}
                          style={{ color: mintColor, flexShrink: 0 }}
                        />
                      ) : (
                        <Camera
                          size={18}
                          style={{ color: textSecondary, flexShrink: 0 }}
                        />
                      )}
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: 500,
                          color: photos[i] ? mintColor : textPrimary,
                        }}
                      >
                        {photos[i] ? `${label} ✓` : label}
                      </span>
                      {!photos[i] && (
                        <span
                          style={{
                            marginLeft: "auto",
                            fontSize: "11px",
                            color: textSecondary,
                          }}
                        >
                          <ScanLine size={13} />
                        </span>
                      )}
                    </button>
                  ),
                )}
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "18px" }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{
                    flex: 1,
                    padding: "11px",
                    borderRadius: "10px",
                    background: "transparent",
                    border: `1px solid ${borderColor}`,
                    color: textSecondary,
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={photos.length < 3}
                  data-ocid="upload.photos.next_button"
                  style={{
                    flex: 2,
                    padding: "11px",
                    borderRadius: "10px",
                    background:
                      photos.length >= 3 ? "oklch(0.65 0.18 160)" : inputBg,
                    color: photos.length >= 3 ? "white" : textSecondary,
                    border: "none",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: photos.length >= 3 ? "pointer" : "not-allowed",
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 — Price */}
        {step === 3 && (
          <div
            style={{
              background: panelBg,
              border: `1px solid ${borderColor}`,
              borderRadius: "16px",
              padding: "24px",
            }}
          >
            <h2
              style={{
                color: textPrimary,
                fontSize: "16px",
                fontWeight: 700,
                marginBottom: "6px",
              }}
            >
              Set Price
            </h2>
            <p
              style={{
                color: textSecondary,
                fontSize: "13px",
                marginBottom: "20px",
              }}
            >
              Enter your asking price in USD and select a preferred payment
              rail.
            </p>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              <div>
                <label
                  htmlFor="price-input"
                  style={{
                    fontSize: "11px",
                    color: textSecondary,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  Price (USD)
                </label>
                <div style={{ position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: textSecondary,
                      fontSize: "16px",
                      fontWeight: 600,
                    }}
                  >
                    $
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0"
                    id="price-input"
                    data-ocid="upload.price.input"
                    style={{
                      width: "100%",
                      padding: "12px 14px 12px 28px",
                      borderRadius: "10px",
                      background: inputBg,
                      border: `1px solid ${borderColor}`,
                      color: textPrimary,
                      fontSize: "16px",
                      fontWeight: 700,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              <div>
                <p
                  style={{
                    fontSize: "11px",
                    color: textSecondary,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    display: "block",
                    marginBottom: "8px",
                    margin: "0 0 8px",
                  }}
                >
                  Preferred Payment
                </p>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {(["USDC", "BTC", "ETH", "SOL"] as PaymentRail[]).map(
                    (rail) => (
                      <button
                        key={rail}
                        type="button"
                        onClick={() => setPaymentRail(rail)}
                        data-ocid={`upload.payment.${rail.toLowerCase()}.button`}
                        style={{
                          padding: "7px 14px",
                          borderRadius: "20px",
                          border:
                            paymentRail === rail
                              ? `1.5px solid ${mintColor}`
                              : `1px solid ${borderColor}`,
                          background:
                            paymentRail === rail
                              ? isLight
                                ? "rgba(126,214,177,0.10)"
                                : "oklch(0.45 0.16 160 / 0.20)"
                              : inputBg,
                          color:
                            paymentRail === rail ? mintColor : textSecondary,
                          fontSize: "13px",
                          fontWeight: paymentRail === rail ? 600 : 400,
                          cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                      >
                        {rail}
                      </button>
                    ),
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button
                type="button"
                onClick={() => setStep(2)}
                style={{
                  flex: 1,
                  padding: "11px",
                  borderRadius: "10px",
                  background: "transparent",
                  border: `1px solid ${borderColor}`,
                  color: textSecondary,
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                disabled={!price.trim() || Number(price) <= 0}
                data-ocid="upload.price.next_button"
                style={{
                  flex: 2,
                  padding: "11px",
                  borderRadius: "10px",
                  background:
                    price.trim() && Number(price) > 0
                      ? "oklch(0.65 0.18 160)"
                      : inputBg,
                  color:
                    price.trim() && Number(price) > 0 ? "white" : textSecondary,
                  border: "none",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor:
                    price.trim() && Number(price) > 0
                      ? "pointer"
                      : "not-allowed",
                }}
              >
                Review
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 — Review & Submit */}
        {step === 4 && metadata && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
          >
            <div
              style={{
                background: panelBg,
                border: `1px solid ${borderColor}`,
                borderRadius: "16px",
                padding: "24px",
              }}
            >
              <h2
                style={{
                  color: textPrimary,
                  fontSize: "16px",
                  fontWeight: 700,
                  marginBottom: "16px",
                }}
              >
                Review Listing
              </h2>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {[
                  { label: "Card", value: metadata.cardName },
                  { label: "Set", value: `${metadata.set} · ${metadata.year}` },
                  { label: "Grade", value: metadata.grade },
                  { label: "Cert ID", value: metadata.certId },
                  {
                    label: "Photos",
                    value: `${photos.length} photos captured`,
                  },
                  {
                    label: "Price",
                    value: `$${Number(price).toLocaleString()} USD`,
                  },
                  { label: "Payment", value: paymentRail },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "10px 0",
                      borderBottom: `1px solid ${borderColor}`,
                    }}
                  >
                    <span style={{ fontSize: "13px", color: textSecondary }}>
                      {label}
                    </span>
                    <span
                      style={{
                        fontSize: "13px",
                        color: textPrimary,
                        fontWeight: 500,
                      }}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              <p
                style={{
                  fontSize: "12px",
                  color: textSecondary,
                  lineHeight: "1.5",
                  marginTop: "14px",
                }}
              >
                Your listing will be submitted for admin review before going
                live.
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                onClick={() => setStep(3)}
                style={{
                  flex: 1,
                  padding: "13px",
                  borderRadius: "10px",
                  background: "transparent",
                  border: `1px solid ${borderColor}`,
                  color: textSecondary,
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!isSignedIn}
                data-ocid="upload.submit.button"
                style={{
                  flex: 2,
                  padding: "13px",
                  borderRadius: "10px",
                  background: isSignedIn
                    ? "linear-gradient(135deg, #c8f5e6, #9fe8d0, #7ddfc2)"
                    : inputBg,
                  color: isSignedIn ? "#0f2a25" : textSecondary,
                  border: isSignedIn
                    ? "1px solid rgba(125,223,194,0.35)"
                    : `1px solid ${borderColor}`,
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: isSignedIn ? "pointer" : "not-allowed",
                  boxShadow: isSignedIn
                    ? "0 2px 6px rgba(0,0,0,0.06), 0 0 0 1px rgba(125,223,194,0.35)"
                    : "none",
                }}
              >
                <Upload
                  size={14}
                  style={{
                    display: "inline",
                    marginRight: "6px",
                    verticalAlign: "middle",
                  }}
                />
                {isSignedIn ? "Submit Listing" : "Sign in to Submit"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
