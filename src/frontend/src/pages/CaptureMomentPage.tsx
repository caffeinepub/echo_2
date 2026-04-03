interface CaptureMomentPageProps {
  onBack: () => void;
}

const PHOTO_SLOTS = [0, 1, 2, 3, 4, 5, 6, 7, 8];

export function CaptureMomentPage({ onBack }: CaptureMomentPageProps) {
  return (
    <div
      data-ocid="capture.page"
      style={{
        minHeight: "calc(100vh - 68px - 64px)",
        background: "#F7F6F2",
        display: "flex",
        flexDirection: "column",
        padding: "0",
        position: "relative",
      }}
    >
      {/* Top bar with back button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "16px 20px",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
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
            color: "rgba(52,168,132,1)",
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
              stroke="rgba(52,168,132,1)"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back
        </button>
      </div>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 24px",
          gap: "0",
        }}
      >
        {/* Section label */}
        <span
          style={{
            fontSize: "11px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            fontWeight: 600,
            color: "rgba(52,168,132,1)",
            marginBottom: "14px",
          }}
        >
          Capture Moment
        </span>

        {/* Title */}
        <h1
          style={{
            fontSize: "24px",
            fontWeight: 700,
            color: "#111111",
            margin: 0,
            textAlign: "center",
            letterSpacing: "-0.01em",
          }}
        >
          Your Moment
        </h1>

        {/* Description */}
        <p
          style={{
            fontSize: "14px",
            color: "#5a6a62",
            lineHeight: 1.65,
            marginTop: "10px",
            textAlign: "center",
            maxWidth: "280px",
          }}
        >
          Capture your media to create a collectible Moment.
        </p>

        {/* Media capture grid placeholder */}
        <div
          style={{
            marginTop: "36px",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "8px",
            width: "100%",
            maxWidth: "320px",
          }}
        >
          {PHOTO_SLOTS.map((slot) => (
            <div
              key={slot}
              data-ocid={`capture.item.${slot + 1}`}
              style={{
                aspectRatio: "1",
                borderRadius: "12px",
                background: "rgba(0,0,0,0.04)",
                border: "1.5px dashed rgba(52,168,132,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
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
                  stroke="rgba(52,168,132,0.35)"
                  strokeWidth="1.2"
                />
                <path
                  d="M10 7v6M7 10h6"
                  stroke="rgba(52,168,132,0.45)"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          ))}
        </div>

        {/* Video slot */}
        <div
          data-ocid="capture.upload_button"
          style={{
            marginTop: "8px",
            width: "100%",
            maxWidth: "320px",
            height: "56px",
            borderRadius: "12px",
            background: "rgba(0,0,0,0.04)",
            border: "1.5px dashed rgba(52,168,132,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
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
              stroke="rgba(52,168,132,0.45)"
              strokeWidth="1.2"
            />
            <path
              d="M13 8l5-3v10l-5-3V8z"
              stroke="rgba(52,168,132,0.45)"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          </svg>
          <span
            style={{
              fontSize: "12px",
              color: "rgba(52,168,132,0.65)",
              fontWeight: 500,
              letterSpacing: "0.04em",
            }}
          >
            Add Video (max 30s)
          </span>
        </div>

        {/* Status */}
        <p
          style={{
            marginTop: "24px",
            fontSize: "12px",
            color: "#9B9B9B",
            letterSpacing: "0.02em",
          }}
        >
          0 / 9 photos · 0 / 1 video
        </p>
      </div>
    </div>
  );
}
