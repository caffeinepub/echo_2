import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { MintMomentModal } from "../components/MintMomentModal";
import { useMomentDraft } from "../context/MomentDraftContext";
import { usePackStyle } from "../context/PackStyleContext";

interface LibraryPageProps {
  onAlbumClick?: (albumId: string) => void;
  onBrowseReleases?: () => void;
  onCaptureMoment?: () => void;
  onViewTransactions?: () => void;
}

type PackState = "idle" | "opening" | "revealed";

const BUTTON_BASE = {
  width: "280px",
  height: "52px",
  borderRadius: "14px",
  fontSize: "15px",
  fontWeight: 500,
  letterSpacing: "0.02em",
  border: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "background 0.15s ease, transform 0.1s ease",
} as const;

const DROPBOX_IMAGE =
  "https://dl.dropboxusercontent.com/scl/fi/aoe7dmzh7jqriugs8p9xl/Photo-Apr-05-2026-2-05-53-AM.png?rlkey=6squh6tpozf5ljw7gtiwl0ovz";

function PackCard({
  accentRgb: _accentRgb,
}: {
  accentRgb: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        width: "280px",
        border: "1px solid rgba(0,0,0,0.06)",
        borderRadius: "20px",
        boxShadow: "0 8px 40px rgba(0,0,0,0.12), 0 2px 12px rgba(0,0,0,0.08)",
        overflow: "hidden",
        position: "relative",
        background: "#fff",
        minHeight: "350px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Content layer */}
      <div
        style={{
          padding: "24px 24px 28px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0",
          flex: 1,
        }}
      >
        <span
          style={{
            fontSize: "11px",
            letterSpacing: "0.08em",
            color: "#9B9B9B",
            fontWeight: 500,
            textTransform: "uppercase",
            fontFamily: "var(--font-ui)",
          }}
        >
          MINTY PACK
        </span>

        <div
          style={{
            width: "32px",
            height: "1px",
            background: "rgba(0,0,0,0.10)",
            margin: "10px 0 16px",
          }}
        />

        {/* Hero image — fills the center of the card */}
        <div
          style={{
            width: "100%",
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 0.55s ease, transform 0.55s ease",
            minHeight: "210px",
          }}
        >
          {!imgError ? (
            <img
              src={DROPBOX_IMAGE}
              alt="Minty Pack"
              onError={() => setImgError(true)}
              style={{
                width: "100%",
                height: "210px",
                objectFit: "cover",
                display: "block",
                borderRadius: "14px",
                boxShadow:
                  "0 6px 24px rgba(0,0,0,0.14), 0 2px 6px rgba(0,0,0,0.08)",
              }}
            />
          ) : (
            /* Fallback gradient tile when image fails */
            <div
              style={{
                width: "100%",
                height: "210px",
                borderRadius: "14px",
                background:
                  "linear-gradient(135deg, oklch(0.80 0.12 300), oklch(0.72 0.16 280))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontSize: "32px",
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.9)",
                  fontFamily: "var(--font-ui)",
                  letterSpacing: "0.04em",
                }}
              >
                MINTY
              </span>
            </div>
          )}
        </div>

        <h2
          style={{
            fontSize: "22px",
            fontWeight: 600,
            color: "#111111",
            margin: "18px 0 0",
            textAlign: "center",
            fontFamily: "var(--font-ui)",
            letterSpacing: "0.02em",
            lineHeight: 1.2,
          }}
        >
          Mint a Moment
        </h2>
      </div>
    </div>
  );
}

// ── Draft in-progress locked state ─────────────────────────────────────────────
function DraftLockedState({
  onFinish,
  accentRgb,
  accentColor,
  accentOklch,
  accentOklchLight,
}: {
  onFinish: () => void;
  accentRgb: string;
  accentColor: string;
  accentOklch: string;
  accentOklchLight: string;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const { activeDraft } = useMomentDraft();

  const hasVideo =
    (activeDraft?.videoBlobUrl !== null &&
      activeDraft?.videoBlobUrl !== undefined) ||
    (activeDraft?.videoUrl !== null && activeDraft?.videoUrl !== undefined);

  const mintButtonStyle = {
    ...BUTTON_BASE,
    background: isActive
      ? `linear-gradient(160deg, oklch(${accentOklchLight}), oklch(${accentOklch}))`
      : `linear-gradient(160deg, oklch(${accentOklch}), oklch(${accentOklchLight}))`,
    color: "#ffffff",
    boxShadow: isHovered
      ? `0 4px 20px rgba(${accentRgb},0.38), 0 1px 6px rgba(${accentRgb},0.25), inset 0 1px 0 rgba(255,255,255,0.20)`
      : `0 2px 12px rgba(${accentRgb},0.28), inset 0 1px 0 rgba(255,255,255,0.18)`,
    transform: isActive ? "scale(0.97)" : "scale(1)",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "280px",
      }}
    >
      <div
        data-ocid="library.loading_state"
        style={{
          background: `rgba(${accentRgb},0.06)`,
          border: `1px solid rgba(${accentRgb},0.18)`,
          borderRadius: "14px",
          padding: "16px 20px",
          width: "100%",
          marginBottom: "20px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: `rgba(${accentRgb},0.75)`,
            margin: "0 auto 12px",
            animation: "draftDotPulse 2s ease-in-out infinite",
          }}
        />
        <p
          style={{
            fontSize: "14px",
            fontWeight: 500,
            color: "#2a4a3a",
            margin: "0 0 6px",
            lineHeight: 1.4,
          }}
        >
          Video draft in progress
        </p>
        <p
          style={{
            fontSize: "13px",
            fontWeight: 400,
            color: "#5a7a6a",
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          Complete your moment to publish it.
        </p>

        <div
          style={{
            marginTop: "12px",
            paddingTop: "12px",
            borderTop: `1px solid rgba(${accentRgb},0.12)`,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize: "12px",
              color: hasVideo ? accentColor : "#7a9a8a",
              fontWeight: hasVideo ? 600 : 400,
            }}
          >
            {hasVideo ? "✓ Video recorded" : "No video yet"}
          </span>
        </div>
      </div>

      <button
        type="button"
        data-ocid="library.primary_button"
        style={mintButtonStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setIsActive(false);
        }}
        onMouseDown={() => setIsActive(true)}
        onMouseUp={() => setIsActive(false)}
        onClick={onFinish}
      >
        Finish Recording
      </button>
    </motion.div>
  );
}

export function LibraryPage({
  onBrowseReleases,
  onCaptureMoment,
  onViewTransactions,
}: LibraryPageProps) {
  const [packState, setPackState] = useState<PackState>("idle");
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [isButtonActive, setIsButtonActive] = useState(false);
  const [isAltButtonHovered, setIsAltButtonHovered] = useState(false);
  const [showMintModal, setShowMintModal] = useState(false);

  const { activeStyle: activeCycle } = usePackStyle();
  const { hasDraft, startDraft } = useMomentDraft();

  const accentColor = `oklch(${activeCycle.accentOklchDark})`;
  const accentRgb = `${activeCycle.accentR},${activeCycle.accentG},${activeCycle.accentB}`;

  useEffect(() => {
    const id = "library-keyframes-style";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      @keyframes draftDotPulse {
        0%, 100% { opacity: 0.5; transform: scale(1); }
        50%       { opacity: 1;   transform: scale(1.25); }
      }
    `;
    document.head.appendChild(style);
  }, []);

  const handleOpenAnother = useCallback(() => {
    setPackState("idle");
  }, []);

  function handleViewLibrary() {
    if (onBrowseReleases) onBrowseReleases();
    else setPackState("idle");
  }

  const primaryButtonStyle = {
    ...BUTTON_BASE,
    background: isButtonActive
      ? `linear-gradient(160deg, oklch(${activeCycle.accentOklchLight}), oklch(${activeCycle.accentOklch}))`
      : `linear-gradient(160deg, oklch(${activeCycle.accentOklch}), oklch(${activeCycle.accentOklchLight}))`,
    color: "#ffffff",
    boxShadow: isButtonHovered
      ? `0 4px 20px rgba(${accentRgb},0.35), 0 1px 6px rgba(${accentRgb},0.20), inset 0 1px 0 rgba(255,255,255,0.18)`
      : `0 2px 12px rgba(${accentRgb},0.22), inset 0 1px 0 rgba(255,255,255,0.15)`,
    transform: isButtonActive ? "scale(0.98)" : "scale(1)",
  };

  const secondaryButtonStyle = {
    ...BUTTON_BASE,
    background: isAltButtonHovered
      ? `rgba(${accentRgb},0.08)`
      : `rgba(${accentRgb},0.04)`,
    color: accentColor,
    border: `1px solid rgba(${accentRgb},0.22)`,
  };

  const showFlippable = !hasDraft && packState === "idle";

  return (
    <div
      data-ocid="library.page"
      style={{
        minHeight: "calc(100vh - 68px - 64px)",
        background: "#F7F6F2",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 24px",
        position: "relative",
      }}
    >
      <AnimatePresence>
        {packState === "opening" && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.03)",
              pointerEvents: "none",
              zIndex: 0,
            }}
          />
        )}
      </AnimatePresence>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0",
          position: "relative",
          zIndex: 1,
        }}
      >
        <AnimatePresence mode="wait">
          {/* LOCKED STATE — draft in progress */}
          {hasDraft && packState === "idle" && (
            <motion.div
              key="locked"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <PackCard accentRgb={accentRgb} />
              <div style={{ height: "20px" }} />
              <DraftLockedState
                onFinish={() => onCaptureMoment?.()}
                accentRgb={accentRgb}
                accentColor={accentColor}
                accentOklch={activeCycle.accentOklch}
                accentOklchLight={activeCycle.accentOklchLight}
              />
            </motion.div>
          )}

          {/* IDLE — pack card + mint button */}
          {showFlippable && (
            <motion.div
              key="pack"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <PackCard accentRgb={accentRgb} />

              <button
                type="button"
                data-ocid="library.primary_button"
                style={{ ...primaryButtonStyle, marginTop: "32px" }}
                onMouseEnter={() => setIsButtonHovered(true)}
                onMouseLeave={() => {
                  setIsButtonHovered(false);
                  setIsButtonActive(false);
                }}
                onMouseDown={() => setIsButtonActive(true)}
                onMouseUp={() => setIsButtonActive(false)}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMintModal(true);
                }}
              >
                Mint Moment
              </button>
            </motion.div>
          )}

          {/* OPENING — brief transition */}
          {packState === "opening" && (
            <motion.div
              key="opening"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{
                width: "280px",
                height: "373px",
                background: "var(--echo-surface, #FCFCFC)",
                borderRadius: "20px",
              }}
            />
          )}
        </AnimatePresence>

        {/* Open Another / View Library shown after opening */}
        {packState === "revealed" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              marginTop: "28px",
              width: "280px",
            }}
          >
            <button
              type="button"
              data-ocid="library.primary_button"
              style={primaryButtonStyle}
              onMouseEnter={() => setIsButtonHovered(true)}
              onMouseLeave={() => {
                setIsButtonHovered(false);
                setIsButtonActive(false);
              }}
              onMouseDown={() => setIsButtonActive(true)}
              onMouseUp={() => setIsButtonActive(false)}
              onClick={handleOpenAnother}
            >
              Open Another
            </button>
            <button
              type="button"
              data-ocid="library.secondary_button"
              style={secondaryButtonStyle}
              onMouseEnter={() => setIsAltButtonHovered(true)}
              onMouseLeave={() => setIsAltButtonHovered(false)}
              onClick={handleViewLibrary}
            >
              View Library
            </button>
          </div>
        )}
      </div>

      {/* Mint Moment Info Modal */}
      {!hasDraft && (
        <MintMomentModal
          open={showMintModal}
          onClose={() => setShowMintModal(false)}
          onConfirm={() => {
            setShowMintModal(false);
            startDraft();
            onCaptureMoment?.();
          }}
        />
      )}

      {/* Transaction history link */}
      {onViewTransactions && (
        <div
          style={{
            position: "absolute",
            bottom: 20,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <button
            type="button"
            data-ocid="library.transactions_link"
            onClick={onViewTransactions}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 11,
              color: "rgba(124,58,237,0.50)",
              fontFamily: "DM Sans, sans-serif",
              letterSpacing: "0.02em",
              padding: "4px 8px",
              borderRadius: 6,
              transition: "color 0.15s",
            }}
          >
            ₿ Transaction history
          </button>
        </div>
      )}
    </div>
  );
}
