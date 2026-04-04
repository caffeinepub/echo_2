import { useEffect, useState } from "react";
import type { MomentDraft } from "../context/MomentDraftContext";
import { useMomentDraft } from "../context/MomentDraftContext";

const MINT_GREEN = "rgba(52,168,132,1)";
const MINT_BORDER = "rgba(52,168,132,0.3)";
const MINT_BORDER_STRONG = "rgba(52,168,132,0.55)";

interface FinalSetupScreenProps {
  photos: string[];
  onBack: () => void; // go back to re-review
  onSubmit: (draft: MomentDraft) => void;
}

export function FinalSetupScreen({
  photos,
  onBack,
  onSubmit,
}: FinalSetupScreenProps) {
  const {
    activeDraft,
    setTitle,
    setCaption,
    setCoverIndex,
    setExplicit,
    completeDraft,
  } = useMomentDraft();

  const [localTitle, setLocalTitle] = useState(activeDraft?.title ?? "");
  const [localCaption, setLocalCaption] = useState(activeDraft?.caption ?? "");
  const [localExplicit, setLocalExplicit] = useState(
    activeDraft?.explicit ?? false,
  );
  const [localCoverIndex, setLocalCoverIndex] = useState(
    activeDraft?.coverIndex ?? 0,
  );
  const [titleTouched, setTitleTouched] = useState(false);

  // Sync to draft context on every change
  useEffect(() => {
    setTitle(localTitle);
  }, [localTitle, setTitle]);
  useEffect(() => {
    setCaption(localCaption);
  }, [localCaption, setCaption]);
  useEffect(() => {
    setExplicit(localExplicit);
  }, [localExplicit, setExplicit]);
  useEffect(() => {
    setCoverIndex(localCoverIndex);
  }, [localCoverIndex, setCoverIndex]);

  function handleSubmit() {
    if (!localTitle.trim()) {
      setTitleTouched(true);
      return;
    }
    if (!activeDraft) return;
    // completeDraft marks it done so LibraryPage resets to idle
    completeDraft();
    // Snapshot the draft with updated fields before it's cleared
    const snapshot: MomentDraft = {
      ...activeDraft,
      title: localTitle.trim(),
      caption: localCaption.trim(),
      coverIndex: localCoverIndex,
      explicit: localExplicit,
      completed: true,
    };
    onSubmit(snapshot);
  }

  const titleEmpty = !localTitle.trim();
  const showTitleError = titleTouched && titleEmpty;

  return (
    <div
      style={{
        minHeight: "calc(100vh - 68px - 64px)",
        background: "#F7F6F2",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "16px 20px",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          gap: "12px",
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
        <h2
          style={{
            flex: 1,
            fontSize: "16px",
            fontWeight: 700,
            color: "#111",
            margin: 0,
            letterSpacing: "-0.01em",
          }}
        >
          Final Setup
        </h2>
        {/* Step indicator */}
        <span
          style={{
            fontSize: "11px",
            letterSpacing: "0.10em",
            textTransform: "uppercase",
            fontWeight: 600,
            color: "rgba(52,168,132,0.70)",
          }}
        >
          10 / 10
        </span>
      </div>

      {/* Body */}
      <div
        style={{
          flex: 1,
          padding: "24px 20px 40px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          maxWidth: "480px",
          width: "100%",
          alignSelf: "center",
        }}
      >
        {/* ── Set Title ── */}
        <div>
          <label
            htmlFor="set-title"
            style={{
              display: "block",
              fontSize: "12px",
              fontWeight: 700,
              color: "#374151",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              marginBottom: "8px",
            }}
          >
            Set Title <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            id="set-title"
            type="text"
            placeholder="Name your Mint Moment…"
            value={localTitle}
            onChange={(e) => {
              setLocalTitle(e.target.value);
              if (e.target.value.trim()) setTitleTouched(false);
            }}
            onBlur={() => setTitleTouched(true)}
            maxLength={60}
            style={{
              width: "100%",
              padding: "13px 14px",
              borderRadius: "14px",
              border: showTitleError
                ? "2px solid #ef4444"
                : `1.5px solid ${localTitle.trim() ? MINT_BORDER_STRONG : "rgba(0,0,0,0.10)"}`,
              background: "#fff",
              fontSize: "15px",
              fontWeight: 500,
              color: "#111",
              outline: "none",
              transition: "border-color 0.15s",
              boxSizing: "border-box",
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "5px",
            }}
          >
            {showTitleError ? (
              <span
                style={{ fontSize: "11px", color: "#ef4444", fontWeight: 500 }}
              >
                Title is required to publish
              </span>
            ) : (
              <span />
            )}
            <span style={{ fontSize: "11px", color: "#9ca3af" }}>
              {localTitle.length}/60
            </span>
          </div>
        </div>

        {/* ── Caption ── */}
        <div>
          <label
            htmlFor="set-caption"
            style={{
              display: "block",
              fontSize: "12px",
              fontWeight: 700,
              color: "#374151",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              marginBottom: "8px",
            }}
          >
            Caption{" "}
            <span
              style={{
                color: "#9ca3af",
                fontWeight: 400,
                fontSize: "11px",
                textTransform: "none",
                letterSpacing: 0,
              }}
            >
              (optional)
            </span>
          </label>
          <textarea
            id="set-caption"
            placeholder="Describe this moment…"
            value={localCaption}
            onChange={(e) => setLocalCaption(e.target.value)}
            rows={3}
            maxLength={200}
            style={{
              width: "100%",
              padding: "13px 14px",
              borderRadius: "14px",
              border: "1.5px solid rgba(0,0,0,0.10)",
              background: "#fff",
              fontSize: "14px",
              fontWeight: 400,
              color: "#111",
              outline: "none",
              resize: "none",
              fontFamily: "inherit",
              lineHeight: 1.5,
              boxSizing: "border-box",
              transition: "border-color 0.15s",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = MINT_BORDER_STRONG;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "rgba(0,0,0,0.10)";
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "4px",
            }}
          >
            <span style={{ fontSize: "11px", color: "#9ca3af" }}>
              {localCaption.length}/200
            </span>
          </div>
        </div>

        {/* ── Cover Photo Selection ── */}
        <div>
          <p
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "#374151",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              margin: "0 0 8px",
            }}
          >
            Cover Photo
          </p>
          <p
            style={{
              fontSize: "12px",
              color: "#6b7280",
              margin: "0 0 12px",
              lineHeight: 1.5,
            }}
          >
            Select one of your 9 photos as the cover for this set.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "8px",
            }}
          >
            {photos.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setLocalCoverIndex(i)}
                style={{
                  aspectRatio: "4/5",
                  borderRadius: "12px",
                  overflow: "hidden",
                  border:
                    localCoverIndex === i
                      ? `2.5px solid ${MINT_GREEN}`
                      : "2px solid rgba(0,0,0,0.08)",
                  background: "none",
                  padding: 0,
                  cursor: "pointer",
                  position: "relative",
                  transition: "border-color 0.15s",
                  boxShadow:
                    localCoverIndex === i
                      ? "0 0 0 3px rgba(52,168,132,0.20)"
                      : "none",
                }}
                aria-label={`Select photo ${i + 1} as cover`}
                aria-pressed={localCoverIndex === i}
              >
                <img
                  src={src}
                  alt={`Set cover ${i + 1}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
                {/* Selected checkmark */}
                {localCoverIndex === i && (
                  <div
                    style={{
                      position: "absolute",
                      top: "6px",
                      right: "6px",
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      background: MINT_GREEN,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 11 11"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M2 5.5l2.5 2.5 4.5-4.5"
                        stroke="#fff"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
                {/* Photo number */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "5px",
                    left: "6px",
                    fontSize: "9px",
                    fontWeight: 700,
                    color: "#fff",
                    textShadow: "0 1px 3px rgba(0,0,0,0.6)",
                    letterSpacing: "0.04em",
                  }}
                >
                  {i + 1}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Explicit Content Toggle ── */}
        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            border: localExplicit
              ? "1.5px solid rgba(245,158,11,0.40)"
              : `1.5px solid ${MINT_BORDER}`,
            padding: "16px",
            transition: "border-color 0.2s",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "16px",
            }}
          >
            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#111",
                  margin: "0 0 4px",
                }}
              >
                Mark this set as explicit
              </p>
              <p
                style={{
                  fontSize: "12px",
                  color: "#6b7280",
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                Explicit sets may be hidden for viewers with safe viewing
                enabled.
              </p>
            </div>

            {/* Toggle switch */}
            <button
              type="button"
              role="switch"
              aria-checked={localExplicit}
              onClick={() => setLocalExplicit(!localExplicit)}
              style={{
                flexShrink: 0,
                width: "48px",
                height: "28px",
                borderRadius: "14px",
                border: "none",
                background: localExplicit
                  ? "rgba(245,158,11,0.85)"
                  : "rgba(0,0,0,0.12)",
                cursor: "pointer",
                position: "relative",
                transition: "background 0.2s",
                marginTop: "2px",
                padding: 0,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "3px",
                  left: localExplicit ? "23px" : "3px",
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  background: "#fff",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.20)",
                  transition: "left 0.2s cubic-bezier(0.34,1.56,0.64,1)",
                }}
              />
            </button>
          </div>

          {/* Warning chip when explicit is ON */}
          {localExplicit && (
            <div
              style={{
                marginTop: "12px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(245,158,11,0.08)",
                borderRadius: "8px",
                padding: "8px 10px",
                border: "1px solid rgba(245,158,11,0.20)",
              }}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 13 13"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M6.5 1.5L11.5 10H1.5L6.5 1.5z"
                  stroke="#f59e0b"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
                <path
                  d="M6.5 5v3"
                  stroke="#f59e0b"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
                <circle cx="6.5" cy="9.5" r="0.6" fill="#f59e0b" />
              </svg>
              <span
                style={{ fontSize: "11px", color: "#92400e", fontWeight: 500 }}
              >
                This set will be hidden from viewers with safe viewing enabled.
              </span>
            </div>
          )}
        </div>

        {/* ── Summary ── */}
        <div
          style={{
            background: "rgba(52,168,132,0.05)",
            borderRadius: "14px",
            border: `1px solid ${MINT_BORDER}`,
            padding: "14px 16px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          <p
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: MINT_GREEN,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              margin: 0,
            }}
          >
            Ready to publish
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "4px 12px",
              marginTop: "4px",
            }}
          >
            {[
              "9 photos captured",
              "1 video captured",
              "100 packs will be minted",
              localExplicit ? "Marked as explicit" : "Standard content",
            ].map((item) => (
              <div
                key={item}
                style={{ display: "flex", alignItems: "center", gap: "5px" }}
              >
                <div
                  style={{
                    width: "5px",
                    height: "5px",
                    borderRadius: "50%",
                    background: MINT_GREEN,
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: "12px", color: "#374151" }}>
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Submit Button ── */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={titleEmpty}
          style={{
            width: "100%",
            height: "54px",
            borderRadius: "14px",
            fontSize: "15px",
            fontWeight: 700,
            letterSpacing: "0.01em",
            border: "none",
            cursor: titleEmpty ? "default" : "pointer",
            background: titleEmpty
              ? "rgba(0,0,0,0.07)"
              : `linear-gradient(160deg, ${MINT_GREEN}, rgba(42,144,112,1))`,
            color: titleEmpty ? "rgba(0,0,0,0.28)" : "#fff",
            boxShadow: titleEmpty
              ? "none"
              : "0 2px 14px rgba(52,168,132,0.30), inset 0 1px 0 rgba(255,255,255,0.18)",
            transition: "background 0.2s, box-shadow 0.2s, color 0.2s",
          }}
          aria-disabled={titleEmpty}
        >
          Continue to Set Price
        </button>

        {titleEmpty && titleTouched && (
          <p
            style={{
              fontSize: "12px",
              color: "#ef4444",
              textAlign: "center",
              margin: "-16px 0 0",
              fontWeight: 500,
            }}
          >
            Add a title before continuing.
          </p>
        )}
      </div>
    </div>
  );
}
