import { CheckCircle2, Clock, Lock, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "../ThemeContext";
import { useCamera } from "../camera/useCamera";
import { useAdminReleases } from "../context/AdminReleasesContext";
import { useWalletContext } from "../context/WalletContext";
import { useQRScanner } from "../qr-code/useQRScanner";

interface Props {
  onBack: () => void;
}

type SubmitView = "list" | "form" | "success";
type Grader = "TAG" | "PSA";
type PaymentRail = "USDC" | "ETH" | "BTC" | "SOL";

interface SlabMetadata {
  cardName: string;
  setName: string;
  year: string;
  grade: string;
  certId: string;
  grader: Grader;
}

interface PhotoSlot {
  label: string;
  key: "front" | "back" | "label";
  dataUrl: string | null;
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const MOCK_PSA_DATA: Record<string, SlabMetadata> = {
  "84792341": {
    cardName: "Charizard Holo",
    setName: "Base Set",
    year: "1999",
    grade: "10",
    certId: "84792341",
    grader: "PSA",
  },
  "10245678": {
    cardName: "Pikachu Illustrator",
    setName: "CoroCoro Promo",
    year: "1998",
    grade: "9",
    certId: "10245678",
    grader: "PSA",
  },
  "27654321": {
    cardName: "Mewtwo Holo",
    setName: "Base Set",
    year: "1999",
    grade: "9.5",
    certId: "27654321",
    grader: "PSA",
  },
  default: {
    cardName: "Lugia 1st Edition",
    setName: "Neo Genesis",
    year: "2000",
    grade: "9",
    certId: "",
    grader: "PSA",
  },
};

// Camera Slot Component
function CameraSlot({
  slot,
  isActive,
  onActivate,
  onCapture,
  isDark,
}: {
  slot: PhotoSlot;
  isActive: boolean;
  onActivate: () => void;
  onCapture: (dataUrl: string) => void;
  isDark: boolean;
}) {
  const {
    startCamera,
    stopCamera,
    capturePhoto,
    videoRef,
    isActive: isStreaming,
  } = useCamera({ facingMode: "environment" });

  // biome-ignore lint/correctness/useExhaustiveDependencies: stable camera refs
  useEffect(() => {
    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isActive]);

  async function handleCapture() {
    const file = await capturePhoto();
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const url = ev.target?.result as string;
        if (url) {
          onCapture(url);
          stopCamera();
        }
      };
      reader.readAsDataURL(file);
    }
  }

  const panelBg = isDark ? "rgba(16,30,26,0.9)" : "#ffffff";
  const border = slot.dataUrl
    ? "1px solid #10b981"
    : isDark
      ? "1px solid rgba(16,185,129,0.2)"
      : "1px solid #e5e7eb";

  return (
    <div
      style={{
        borderRadius: 14,
        background: panelBg,
        border,
        overflow: "hidden",
        marginBottom: 12,
      }}
    >
      <button
        type="button"
        onClick={onActivate}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          padding: "12px 16px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
        }}
      >
        <span
          style={{
            fontWeight: 600,
            fontSize: 14,
            color: isDark ? "#d1fae5" : "#111",
          }}
        >
          {slot.label}
        </span>
        {slot.dataUrl ? (
          <CheckCircle2 size={18} color="#10b981" />
        ) : (
          <span style={{ fontSize: 12, color: "#10b981", fontWeight: 600 }}>
            {isActive ? "Hide" : "Capture"}
          </span>
        )}
      </button>

      {slot.dataUrl ? (
        <div style={{ padding: "0 16px 12px" }}>
          <img
            src={slot.dataUrl}
            alt={slot.label}
            style={{
              width: "100%",
              borderRadius: 8,
              maxHeight: 160,
              objectFit: "cover",
            }}
          />
          <button
            type="button"
            onClick={onActivate}
            style={{
              marginTop: 8,
              fontSize: 12,
              color: "#10b981",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            Retake
          </button>
        </div>
      ) : isActive ? (
        <div style={{ padding: "0 16px 16px" }}>
          <div
            style={{
              position: "relative",
              borderRadius: 10,
              overflow: "hidden",
              background: "#000",
              aspectRatio: "4/3",
            }}
          >
            {/* biome-ignore lint/a11y/useMediaCaption: camera preview */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: "10%",
                border: "2px solid rgba(16,185,129,0.6)",
                borderRadius: 8,
                pointerEvents: "none",
              }}
            />
          </div>
          <button
            type="button"
            data-ocid="creator.photo.capture_button"
            onClick={handleCapture}
            disabled={!isStreaming}
            style={{
              marginTop: 12,
              width: "100%",
              padding: 12,
              borderRadius: 10,
              background: isStreaming
                ? "linear-gradient(135deg, #c8f5e6, #9fe8d0, #7ddfc2)"
                : "rgba(16,185,129,0.2)",
              color: "#0f2a25",
              fontWeight: 700,
              fontSize: 14,
              border: "none",
              cursor: isStreaming ? "pointer" : "not-allowed",
            }}
          >
            {isStreaming ? "📸 Take Photo" : "Starting camera..."}
          </button>
        </div>
      ) : null}
    </div>
  );
}

// QR Scanner Component
function QRScannerView({
  onResult,
  isDark,
}: { onResult: (result: string) => void; isDark: boolean }) {
  const { startScanning, stopScanning, qrResults, videoRef, isScanning } =
    useQRScanner({});
  const reported = useRef(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: stable scanner refs
  useEffect(() => {
    startScanning();
    return () => {
      stopScanning();
    };
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: stable scanner refs
  useEffect(() => {
    if (qrResults && qrResults.length > 0 && !reported.current) {
      reported.current = true;
      stopScanning();
      onResult(qrResults[0].data);
    }
  }, [qrResults]);

  return (
    <div style={{ textAlign: "center" }}>
      <p
        style={{
          fontSize: 13,
          color: isDark ? "rgba(209,250,229,0.7)" : "#555",
          marginBottom: 12,
        }}
      >
        Point camera at TAG QR code on slab
      </p>
      <div
        style={{
          position: "relative",
          borderRadius: 12,
          overflow: "hidden",
          background: "#000",
          aspectRatio: "1",
          maxWidth: 320,
          margin: "0 auto",
        }}
      >
        {/* biome-ignore lint/a11y/useMediaCaption: camera preview */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: "15%",
            borderRadius: 4,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 24,
              height: 24,
              borderTop: "3px solid #10b981",
              borderLeft: "3px solid #10b981",
              borderRadius: "4px 0 0 0",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 24,
              height: 24,
              borderTop: "3px solid #10b981",
              borderRight: "3px solid #10b981",
              borderRadius: "0 4px 0 0",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: 24,
              height: 24,
              borderBottom: "3px solid #10b981",
              borderLeft: "3px solid #10b981",
              borderRadius: "0 0 0 4px",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: 24,
              height: 24,
              borderBottom: "3px solid #10b981",
              borderRight: "3px solid #10b981",
              borderRadius: "0 0 4px 0",
            }}
          />
        </div>
      </div>
      {isScanning && (
        <p style={{ marginTop: 12, fontSize: 12, color: "#10b981" }}>
          Scanning...
        </p>
      )}
    </div>
  );
}

// Main Component
export function CreatorSubmitPage({ onBack: _onBack }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { walletAddress } = useWalletContext();
  const { releases, submitRelease } = useAdminReleases();

  const [subView, setSubView] = useState<SubmitView>("list");

  // Wizard state
  const [step, setStep] = useState(1);
  const [grader, setGrader] = useState<Grader | null>(null);
  const [certInput, setCertInput] = useState("");
  const [lookingUp, setLookingUp] = useState(false);
  const [metadata, setMetadata] = useState<SlabMetadata | null>(null);
  const [photos, setPhotos] = useState<PhotoSlot[]>([
    { label: "Front of Slab", key: "front", dataUrl: null },
    { label: "Back of Slab", key: "back", dataUrl: null },
    { label: "Label Close-up", key: "label", dataUrl: null },
  ]);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [priceUSD, setPriceUSD] = useState("");
  const [payment, setPayment] = useState<PaymentRail | null>(null);

  const mySubmissions = releases.filter((r) => r.submittedBy === walletAddress);

  const pageBg = isDark ? "#080e0c" : "#f8f9fc";
  const panelBg = isDark ? "rgba(16,30,26,0.9)" : "#ffffff";
  const borderColor = isDark ? "rgba(16,185,129,0.15)" : "#e8ecf3";
  const textPrimary = isDark ? "#d1fae5" : "#0f172a";
  const textSecondary = isDark ? "rgba(209,250,229,0.55)" : "#5b6475";

  function resetWizard() {
    setStep(1);
    setGrader(null);
    setCertInput("");
    setLookingUp(false);
    setMetadata(null);
    setPhotos([
      { label: "Front of Slab", key: "front", dataUrl: null },
      { label: "Back of Slab", key: "back", dataUrl: null },
      { label: "Label Close-up", key: "label", dataUrl: null },
    ]);
    setActiveSlot(null);
    setPriceUSD("");
    setPayment(null);
  }

  function handleQRResult(raw: string) {
    const parts = raw.split("|");
    const certId = parts[0] ?? raw;
    const meta: SlabMetadata = {
      cardName: parts[1] ?? "Charizard Holo",
      setName: parts[2] ?? "Base Set",
      year: parts[3] ?? "1999",
      grade: parts[4] ?? "10",
      certId,
      grader: "TAG",
    };
    setMetadata(meta);
  }

  async function handlePSALookup() {
    setLookingUp(true);
    await new Promise((r) => setTimeout(r, 1500));
    const found = MOCK_PSA_DATA[certInput] ?? {
      ...MOCK_PSA_DATA.default,
      certId: certInput,
    };
    setMetadata({ ...found, certId: certInput || found.certId });
    setLookingUp(false);
  }

  function setPhotoDataUrl(idx: number, dataUrl: string) {
    setPhotos((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, dataUrl } : s)),
    );
    setActiveSlot(null);
  }

  function handlePublish() {
    if (!metadata || !grader || !priceUSD || !payment) return;
    submitRelease({
      title: `${metadata.cardName} – ${metadata.setName} (${metadata.grade})`,
      artist: grader,
      audioFileName: metadata.certId,
      artworkDataUrl: photos[0].dataUrl ?? undefined,
      priceSOL: Number(priceUSD),
      supply: 1,
      mintedCount: 0,
      genre: grader,
      description: `Cert #${metadata.certId} · ${metadata.setName} · ${metadata.year} · Grade ${metadata.grade}`,
      rightsStatus: "original",
      visibility: "private",
      status: "submitted",
      submittedBy: walletAddress ?? undefined,
      submittedAt: new Date().toISOString(),
    });
    setSubView("success");
  }

  const statusConfig: Record<
    string,
    { label: string; color: string; bg: string; border: string }
  > = {
    submitted: {
      label: "Submitted",
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.12)",
      border: "rgba(245,158,11,0.25)",
    },
    approved: {
      label: "Approved",
      color: "#10b981",
      bg: "rgba(16,185,129,0.12)",
      border: "rgba(16,185,129,0.25)",
    },
    live: {
      label: "Approved",
      color: "#10b981",
      bg: "rgba(16,185,129,0.12)",
      border: "rgba(16,185,129,0.25)",
    },
    draft: {
      label: "Approved",
      color: "#10b981",
      bg: "rgba(16,185,129,0.12)",
      border: "rgba(16,185,129,0.25)",
    },
    scheduled: {
      label: "Approved",
      color: "#10b981",
      bg: "rgba(16,185,129,0.12)",
      border: "rgba(16,185,129,0.25)",
    },
    rejected: {
      label: "Rejected",
      color: "#ef4444",
      bg: "rgba(239,68,68,0.12)",
      border: "rgba(239,68,68,0.25)",
    },
  };

  // SUCCESS
  if (subView === "success") {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: pageBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <div
          data-ocid="creator.submit.success_state"
          style={{
            background: panelBg,
            border: `1px solid ${borderColor}`,
            borderRadius: 20,
            padding: "48px 32px",
            maxWidth: 400,
            width: "100%",
            textAlign: "center",
          }}
        >
          <CheckCircle2
            size={56}
            style={{
              color: "#10b981",
              margin: "0 auto 24px",
              display: "block",
            }}
          />
          <h2
            style={{
              color: textPrimary,
              fontSize: 20,
              fontWeight: 700,
              marginBottom: 12,
            }}
          >
            Listing Submitted
          </h2>
          <p
            style={{
              color: textSecondary,
              fontSize: 14,
              lineHeight: 1.7,
              marginBottom: 32,
            }}
          >
            Your slab listing has been submitted for review. We'll notify you
            once it's live.
          </p>
          <button
            type="button"
            data-ocid="creator.submit.view_submissions.button"
            onClick={() => {
              resetWizard();
              setSubView("list");
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 24px",
              borderRadius: 10,
              background: "oklch(0.45 0.18 200)",
              color: "white",
              fontSize: 14,
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
            }}
          >
            View My Submissions
          </button>
        </div>
      </div>
    );
  }

  // WIZARD FORM
  if (subView === "form") {
    const allPhotosCaptured = photos.every((p) => p.dataUrl !== null);
    const priceValid = Number(priceUSD) > 0;

    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 60,
          background: pageBg,
          overflowY: "auto",
          overscrollBehavior: "contain",
          paddingTop: "calc(64px + env(safe-area-inset-top, 0px))",
          paddingBottom: "calc(100px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        {/* Header */}
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 61,
            background: isDark ? "#080e0c" : "#ffffff",
            borderBottom: `1px solid ${borderColor}`,
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <button
            type="button"
            onClick={() => {
              resetWizard();
              setSubView("list");
            }}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: textSecondary,
              padding: 4,
              display: "flex",
            }}
          >
            <X size={20} />
          </button>
          <span
            style={{
              flex: 1,
              fontWeight: 700,
              fontSize: 16,
              color: textPrimary,
            }}
          >
            List a Slab
          </span>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                style={{
                  width: s === step ? 20 : 8,
                  height: 8,
                  borderRadius: 4,
                  background:
                    s === step
                      ? "#10b981"
                      : s < step
                        ? "rgba(16,185,129,0.5)"
                        : isDark
                          ? "rgba(255,255,255,0.15)"
                          : "#e5e7eb",
                  transition: "all 0.3s",
                }}
              />
            ))}
          </div>
        </div>

        <div style={{ padding: "20px 16px", maxWidth: 480, margin: "0 auto" }}>
          <p
            style={{
              fontSize: 12,
              color: textSecondary,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            Step {step} of 5
          </p>

          {/* STEP 1 */}
          {step === 1 && (
            <>
              <h2
                style={{
                  color: textPrimary,
                  fontSize: 20,
                  fontWeight: 700,
                  marginBottom: 4,
                }}
              >
                Select Grader
              </h2>
              <p
                style={{ color: textSecondary, fontSize: 14, marginBottom: 24 }}
              >
                Choose the grading company for this slab.
              </p>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {(["TAG", "PSA"] as Grader[]).map((g) => (
                  <button
                    key={g}
                    type="button"
                    data-ocid={`creator.grader.${g.toLowerCase()}.button`}
                    onClick={() => setGrader(g)}
                    style={{
                      padding: "20px 24px",
                      borderRadius: 14,
                      border:
                        grader === g
                          ? "2px solid #10b981"
                          : `1px solid ${borderColor}`,
                      background:
                        grader === g
                          ? isDark
                            ? "rgba(16,185,129,0.12)"
                            : "rgba(16,185,129,0.06)"
                          : panelBg,
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.2s",
                    }}
                  >
                    <p
                      style={{
                        fontWeight: 700,
                        fontSize: 18,
                        color: grader === g ? "#10b981" : textPrimary,
                        marginBottom: 4,
                      }}
                    >
                      {g}
                    </p>
                    <p
                      style={{ fontSize: 13, color: textSecondary, margin: 0 }}
                    >
                      {g === "TAG"
                        ? "Scan QR code on slab"
                        : "Enter PSA cert number"}
                    </p>
                  </button>
                ))}
              </div>
              <button
                type="button"
                data-ocid="creator.step1.continue.button"
                disabled={!grader}
                onClick={() => setStep(2)}
                style={{
                  marginTop: 32,
                  width: "100%",
                  padding: 14,
                  borderRadius: 12,
                  background: grader
                    ? "linear-gradient(135deg, #c8f5e6, #9fe8d0, #7ddfc2)"
                    : isDark
                      ? "rgba(255,255,255,0.08)"
                      : "#e5e7eb",
                  color: grader ? "#0f2a25" : textSecondary,
                  fontWeight: 700,
                  fontSize: 15,
                  border: "none",
                  cursor: grader ? "pointer" : "not-allowed",
                  transition: "all 0.2s",
                }}
              >
                Continue
              </button>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <h2
                style={{
                  color: textPrimary,
                  fontSize: 20,
                  fontWeight: 700,
                  marginBottom: 4,
                }}
              >
                Identify Slab
              </h2>
              <p
                style={{ color: textSecondary, fontSize: 14, marginBottom: 20 }}
              >
                {grader === "TAG"
                  ? "Scan the QR code on the TAG slab."
                  : "Enter the PSA cert number."}
              </p>

              {!metadata && grader === "TAG" && (
                <QRScannerView onResult={handleQRResult} isDark={isDark} />
              )}

              {!metadata && grader === "PSA" && (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  <input
                    data-ocid="creator.cert.input"
                    type="text"
                    value={certInput}
                    onChange={(e) => setCertInput(e.target.value)}
                    placeholder="e.g. 84792341"
                    style={{
                      padding: "12px 14px",
                      borderRadius: 10,
                      border: `1px solid ${borderColor}`,
                      background: isDark ? "rgba(255,255,255,0.05)" : "#fff",
                      color: textPrimary,
                      fontSize: 15,
                      outline: "none",
                    }}
                  />
                  <button
                    type="button"
                    data-ocid="creator.lookup.button"
                    disabled={!certInput.trim() || lookingUp}
                    onClick={handlePSALookup}
                    style={{
                      padding: 12,
                      borderRadius: 10,
                      background:
                        certInput.trim() && !lookingUp
                          ? "linear-gradient(135deg, #c8f5e6, #9fe8d0, #7ddfc2)"
                          : isDark
                            ? "rgba(255,255,255,0.08)"
                            : "#e5e7eb",
                      color:
                        certInput.trim() && !lookingUp
                          ? "#0f2a25"
                          : textSecondary,
                      fontWeight: 700,
                      fontSize: 14,
                      border: "none",
                      cursor:
                        certInput.trim() && !lookingUp
                          ? "pointer"
                          : "not-allowed",
                    }}
                  >
                    {lookingUp ? "Looking up..." : "Look Up Slab"}
                  </button>
                </div>
              )}

              {metadata && (
                <>
                  <div
                    style={{
                      background: "rgba(16,185,129,0.1)",
                      border: "1px solid rgba(16,185,129,0.3)",
                      borderRadius: 10,
                      padding: "10px 14px",
                      marginBottom: 16,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <CheckCircle2 size={16} color="#10b981" />
                    <span
                      style={{
                        color: "#10b981",
                        fontWeight: 600,
                        fontSize: 14,
                      }}
                    >
                      Slab Verified ✓
                    </span>
                  </div>
                  {(
                    [
                      ["Card Name", metadata.cardName],
                      ["Set", metadata.setName],
                      ["Year", metadata.year],
                      ["Grade", metadata.grade],
                      ["Cert ID", metadata.certId],
                      ["Grader", metadata.grader],
                    ] as [string, string][]
                  ).map(([label, value]) => (
                    <div
                      key={label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 0",
                        borderBottom: `1px solid ${borderColor}`,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <Lock size={12} color={textSecondary} />
                        <span style={{ fontSize: 13, color: textSecondary }}>
                          {label}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: textPrimary,
                        }}
                      >
                        {value}
                      </span>
                    </div>
                  ))}
                  <button
                    type="button"
                    data-ocid="creator.step2.continue.button"
                    onClick={() => setStep(3)}
                    style={{
                      marginTop: 24,
                      width: "100%",
                      padding: 14,
                      borderRadius: 12,
                      background:
                        "linear-gradient(135deg, #c8f5e6, #9fe8d0, #7ddfc2)",
                      color: "#0f2a25",
                      fontWeight: 700,
                      fontSize: 15,
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Continue
                  </button>
                </>
              )}
            </>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <>
              <h2
                style={{
                  color: textPrimary,
                  fontSize: 20,
                  fontWeight: 700,
                  marginBottom: 4,
                }}
              >
                Slab Photos
              </h2>
              <p
                style={{ color: textSecondary, fontSize: 14, marginBottom: 20 }}
              >
                Capture live photos using your camera. Gallery uploads are not
                accepted.
              </p>
              {photos.map((slot, idx) => (
                <CameraSlot
                  key={slot.key}
                  slot={slot}
                  isActive={activeSlot === idx}
                  onActivate={() =>
                    setActiveSlot(activeSlot === idx ? null : idx)
                  }
                  onCapture={(url) => setPhotoDataUrl(idx, url)}
                  isDark={isDark}
                />
              ))}
              <button
                type="button"
                data-ocid="creator.step3.continue.button"
                disabled={!allPhotosCaptured}
                onClick={() => setStep(4)}
                style={{
                  marginTop: 8,
                  width: "100%",
                  padding: 14,
                  borderRadius: 12,
                  background: allPhotosCaptured
                    ? "linear-gradient(135deg, #c8f5e6, #9fe8d0, #7ddfc2)"
                    : isDark
                      ? "rgba(255,255,255,0.08)"
                      : "#e5e7eb",
                  color: allPhotosCaptured ? "#0f2a25" : textSecondary,
                  fontWeight: 700,
                  fontSize: 15,
                  border: "none",
                  cursor: allPhotosCaptured ? "pointer" : "not-allowed",
                }}
              >
                {allPhotosCaptured
                  ? "Continue"
                  : "Capture all 3 photos to continue"}
              </button>
            </>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <>
              <h2
                style={{
                  color: textPrimary,
                  fontSize: 20,
                  fontWeight: 700,
                  marginBottom: 4,
                }}
              >
                Set Price
              </h2>
              <p
                style={{ color: textSecondary, fontSize: 14, marginBottom: 24 }}
              >
                Set your listing price and preferred payment method.
              </p>

              <p
                style={{
                  fontSize: 12,
                  color: textSecondary,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Price (USD)
              </p>
              <div style={{ position: "relative", marginBottom: 28 }}>
                <span
                  style={{
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: textSecondary,
                    fontSize: 15,
                  }}
                >
                  $
                </span>
                <input
                  data-ocid="creator.price.input"
                  type="number"
                  min="0"
                  step="0.01"
                  value={priceUSD}
                  onChange={(e) => setPriceUSD(e.target.value)}
                  placeholder="0.00"
                  style={{
                    width: "100%",
                    padding: "13px 14px 13px 28px",
                    borderRadius: 10,
                    border: `1px solid ${borderColor}`,
                    background: isDark ? "rgba(255,255,255,0.05)" : "#fff",
                    color: textPrimary,
                    fontSize: 18,
                    fontWeight: 600,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <p
                style={{
                  fontSize: 12,
                  color: textSecondary,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  display: "block",
                  marginBottom: 10,
                }}
              >
                Preferred Payment
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {(["USDC", "ETH", "BTC", "SOL"] as PaymentRail[]).map(
                  (rail) => (
                    <button
                      key={rail}
                      type="button"
                      data-ocid={`creator.payment.${rail.toLowerCase()}.toggle`}
                      onClick={() => setPayment(rail)}
                      style={{
                        padding: "8px 16px",
                        borderRadius: 20,
                        border:
                          payment === rail
                            ? "1px solid #10b981"
                            : `1px solid ${borderColor}`,
                        background:
                          payment === rail
                            ? isDark
                              ? "rgba(16,185,129,0.15)"
                              : "rgba(16,185,129,0.08)"
                            : panelBg,
                        color: payment === rail ? "#10b981" : textSecondary,
                        fontWeight: 600,
                        fontSize: 13,
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      {rail}
                    </button>
                  ),
                )}
              </div>

              <button
                type="button"
                data-ocid="creator.step4.continue.button"
                disabled={!priceValid || !payment}
                onClick={() => setStep(5)}
                style={{
                  marginTop: 32,
                  width: "100%",
                  padding: 14,
                  borderRadius: 12,
                  background:
                    priceValid && payment
                      ? "linear-gradient(135deg, #c8f5e6, #9fe8d0, #7ddfc2)"
                      : isDark
                        ? "rgba(255,255,255,0.08)"
                        : "#e5e7eb",
                  color: priceValid && payment ? "#0f2a25" : textSecondary,
                  fontWeight: 700,
                  fontSize: 15,
                  border: "none",
                  cursor: priceValid && payment ? "pointer" : "not-allowed",
                }}
              >
                Review Listing
              </button>
            </>
          )}

          {/* STEP 5 */}
          {step === 5 && metadata && (
            <>
              <h2
                style={{
                  color: textPrimary,
                  fontSize: 20,
                  fontWeight: 700,
                  marginBottom: 4,
                }}
              >
                Review & Publish
              </h2>
              <p
                style={{ color: textSecondary, fontSize: 14, marginBottom: 20 }}
              >
                Check your listing details before publishing.
              </p>

              <div
                style={{
                  background: panelBg,
                  border: `1px solid ${borderColor}`,
                  borderRadius: 14,
                  padding: 16,
                  marginBottom: 16,
                }}
              >
                <p
                  style={{
                    fontSize: 12,
                    color: textSecondary,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: 12,
                  }}
                >
                  Slab Details
                </p>
                {(
                  [
                    ["Card", metadata.cardName],
                    ["Set", metadata.setName],
                    ["Year", metadata.year],
                    ["Grade", `${metadata.grader} ${metadata.grade}`],
                    ["Cert ID", metadata.certId],
                  ] as [string, string][]
                ).map(([k, v]) => (
                  <div
                    key={k}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "6px 0",
                      borderBottom: `1px solid ${borderColor}`,
                    }}
                  >
                    <span style={{ fontSize: 13, color: textSecondary }}>
                      {k}
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: textPrimary,
                      }}
                    >
                      {v}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                {photos.map((p) =>
                  p.dataUrl ? (
                    <div
                      key={p.key}
                      style={{ flex: 1, borderRadius: 8, overflow: "hidden" }}
                    >
                      <img
                        src={p.dataUrl}
                        alt={p.label}
                        style={{
                          width: "100%",
                          aspectRatio: "3/4",
                          objectFit: "cover",
                        }}
                      />
                      <p
                        style={{
                          fontSize: 10,
                          color: textSecondary,
                          textAlign: "center",
                          marginTop: 4,
                        }}
                      >
                        {p.label}
                      </p>
                    </div>
                  ) : null,
                )}
              </div>

              <div
                style={{
                  background: panelBg,
                  border: `1px solid ${borderColor}`,
                  borderRadius: 14,
                  padding: 16,
                  marginBottom: 24,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: 12,
                      color: textSecondary,
                      marginBottom: 2,
                    }}
                  >
                    Listing Price
                  </p>
                  <p
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      color: textPrimary,
                    }}
                  >
                    ${Number(priceUSD).toLocaleString()}
                  </p>
                </div>
                <span
                  style={{
                    padding: "6px 14px",
                    borderRadius: 20,
                    background: "rgba(16,185,129,0.12)",
                    border: "1px solid rgba(16,185,129,0.3)",
                    color: "#10b981",
                    fontWeight: 600,
                    fontSize: 13,
                  }}
                >
                  {payment}
                </span>
              </div>

              <button
                type="button"
                data-ocid="creator.publish.primary_button"
                onClick={handlePublish}
                style={{
                  width: "100%",
                  padding: 16,
                  borderRadius: 14,
                  background:
                    "linear-gradient(135deg, #c8f5e6, #9fe8d0, #7ddfc2)",
                  color: "#0f2a25",
                  fontWeight: 700,
                  fontSize: 16,
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(16,185,129,0.25)",
                }}
              >
                Publish Listing
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // LIST VIEW
  return (
    <div
      style={{
        minHeight: "100vh",
        background: pageBg,
        paddingTop: "calc(72px + env(safe-area-inset-top,0px))",
        paddingBottom: "calc(100px + env(safe-area-inset-bottom,0px))",
      }}
    >
      <div
        style={{
          padding: "0 16px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h1 style={{ fontSize: 22, fontWeight: 700, color: textPrimary }}>
          My Listings
        </h1>
        <button
          type="button"
          data-ocid="creator.new_listing.button"
          onClick={() => {
            resetWizard();
            setSubView("form");
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 16px",
            borderRadius: 10,
            background: "linear-gradient(135deg, #c8f5e6, #9fe8d0, #7ddfc2)",
            color: "#0f2a25",
            fontWeight: 600,
            fontSize: 13,
            border: "none",
            cursor: "pointer",
          }}
        >
          + New Listing
        </button>
      </div>

      <div
        style={{
          padding: "0 16px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {mySubmissions.length === 0 ? (
          <div
            data-ocid="creator.submissions.empty_state"
            style={{
              background: panelBg,
              border: `1px solid ${borderColor}`,
              borderRadius: 14,
              padding: "48px 24px",
              textAlign: "center",
            }}
          >
            <p style={{ color: textSecondary, fontSize: 15 }}>
              No listings yet.
            </p>
            <p style={{ color: textSecondary, fontSize: 13, marginTop: 6 }}>
              Tap "New Listing" to list your first slab.
            </p>
          </div>
        ) : (
          mySubmissions.map((r, idx) => {
            const sc = statusConfig[r.status] ?? statusConfig.submitted;
            return (
              <div
                key={r.id}
                data-ocid={`creator.submissions.item.${idx + 1}`}
                style={{
                  background: panelBg,
                  border: `1px solid ${borderColor}`,
                  borderRadius: 14,
                  padding: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                {r.artworkDataUrl ? (
                  <img
                    src={r.artworkDataUrl}
                    alt={r.title}
                    style={{
                      width: 52,
                      height: 70,
                      borderRadius: 6,
                      objectFit: "cover",
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 52,
                      height: 70,
                      borderRadius: 6,
                      background: isDark ? "rgba(16,185,129,0.1)" : "#f0fdf4",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 22,
                    }}
                  >
                    🎴
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontWeight: 600,
                      fontSize: 14,
                      color: textPrimary,
                      marginBottom: 2,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {r.title}
                  </p>
                  <p
                    style={{
                      fontSize: 12,
                      color: textSecondary,
                      marginBottom: 6,
                    }}
                  >
                    {r.artist}
                  </p>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <span
                      style={{
                        background: sc.bg,
                        color: sc.color,
                        border: `1px solid ${sc.border}`,
                        fontSize: 10,
                        fontWeight: 600,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        padding: "2px 8px",
                        borderRadius: 4,
                      }}
                    >
                      {r.status === "submitted" && (
                        <span style={{ marginRight: 3 }}>⏳</span>
                      )}
                      {r.status === "rejected" && (
                        <span style={{ marginRight: 3 }}>✕</span>
                      )}
                      {(r.status === "live" ||
                        r.status === "draft" ||
                        r.status === "scheduled") && (
                        <span style={{ marginRight: 3 }}>✓</span>
                      )}
                      {sc.label}
                    </span>
                    {r.submittedAt && (
                      <span
                        style={{
                          fontSize: 11,
                          color: textSecondary,
                          display: "flex",
                          alignItems: "center",
                          gap: 3,
                        }}
                      >
                        <Clock size={10} />
                        {formatRelativeTime(r.submittedAt)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default CreatorSubmitPage;
