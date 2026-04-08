import { ArrowLeft, UserCircle } from "lucide-react";
import { usePackStyle } from "../context/PackStyleContext";
import { useEarnings } from "../hooks/useEarnings";

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const MOCK_PROFILE = {
  displayName: "Collector",
};

// ─── ProfilePage ───────────────────────────────────────────────────────────────
interface ProfilePageProps {
  onBack: () => void;
}

export function ProfilePage({ onBack }: ProfilePageProps) {
  const { activeStyle } = usePackStyle();
  const accentColor = `rgb(${activeStyle.accentR},${activeStyle.accentG},${activeStyle.accentB})`;
  const earnings = useEarnings();

  return (
    <div
      data-ocid="profile.page"
      className="min-h-screen"
      style={{ background: "#f7f8f7", paddingBottom: 48 }}
    >
      {/* Header */}
      <header
        className="sticky top-16 z-40 flex items-center backdrop-blur-xl border-b"
        style={{
          background: "rgba(255,255,255,0.92)",
          borderColor: "rgba(0,0,0,0.07)",
          height: 52,
          paddingLeft: 12,
          paddingRight: 16,
        }}
      >
        <button
          type="button"
          data-ocid="profile.back.button"
          onClick={onBack}
          className="flex items-center gap-1.5 rounded-lg transition-all duration-150"
          style={{
            padding: "6px 8px",
            fontSize: "13px",
            color: accentColor,
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          <ArrowLeft size={16} strokeWidth={1.8} />
          <span
            style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}
          >
            Back
          </span>
        </button>
      </header>

      <div
        className="px-5 flex flex-col"
        style={{ paddingTop: 40, gap: 32, maxWidth: 480, margin: "0 auto" }}
      >
        {/* ── Avatar + Username ──────────────────────────────────────────── */}
        <section
          data-ocid="profile.identity"
          className="flex flex-col items-center"
          style={{ gap: 14 }}
        >
          {/* Circular avatar */}
          <div
            className="flex items-center justify-center rounded-full flex-shrink-0"
            style={{
              width: 88,
              height: 88,
              background: `rgba(${activeStyle.accentR},${activeStyle.accentG},${activeStyle.accentB},0.08)`,
              border: `2px solid rgba(${activeStyle.accentR},${activeStyle.accentG},${activeStyle.accentB},0.22)`,
              boxShadow: `0 4px 20px rgba(${activeStyle.accentR},${activeStyle.accentG},${activeStyle.accentB},0.12)`,
            }}
          >
            <UserCircle
              size={44}
              style={{ color: accentColor }}
              strokeWidth={1.2}
            />
          </div>

          {/* Username */}
          <div
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: "#111",
              letterSpacing: "-0.01em",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {MOCK_PROFILE.displayName}
          </div>
        </section>

        {/* ── Revenue Card ──────────────────────────────────────────────── */}
        <section data-ocid="profile.revenue.card">
          <div
            className="rounded-2xl"
            style={{
              background: "#ffffff",
              border: "1px solid rgba(0,0,0,0.07)",
              boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
              padding: "28px 24px",
            }}
          >
            {/* Label */}
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.10em",
                textTransform: "uppercase",
                color: "#9aaa9a",
                fontFamily: "'DM Sans', sans-serif",
                marginBottom: 8,
              }}
            >
              Total Earned
            </div>

            {/* Big number */}
            <div
              style={{
                fontSize: 40,
                fontWeight: 700,
                color: "#111",
                letterSpacing: "-0.03em",
                lineHeight: 1,
                fontFamily: "'DM Sans', sans-serif",
                marginBottom: earnings.loading ? 4 : 6,
              }}
            >
              {earnings.loading ? (
                <span style={{ color: "#ccc" }}>--</span>
              ) : (
                <span>
                  <span
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      color: "#f7931a",
                      marginRight: 2,
                    }}
                  >
                    ₿
                  </span>
                  ${earnings.totalUsd}
                </span>
              )}
            </div>

            {/* BTC subtext */}
            <div
              style={{
                fontSize: 12,
                color: "#aaa",
                fontFamily: "'DM Sans', sans-serif",
                marginBottom: 24,
              }}
            >
              {earnings.loading ? "" : `≈ ${earnings.totalBtc} BTC`}
            </div>

            {/* Divider */}
            <div
              style={{
                height: 1,
                background: "rgba(0,0,0,0.06)",
                marginBottom: 20,
              }}
            />

            {/* Breakdown */}
            <div className="flex flex-col" style={{ gap: 16 }}>
              {/* From copy sales */}
              <div className="flex items-center justify-between">
                <span
                  style={{
                    fontSize: 14,
                    color: "#666",
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 400,
                  }}
                >
                  From copy sales
                </span>
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: earnings.loading ? "#ccc" : "#111",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {earnings.loading ? "--" : `$${earnings.fromCopySales}`}
                </span>
              </div>

              {/* From trade royalties */}
              <div className="flex items-center justify-between">
                <span
                  style={{
                    fontSize: 14,
                    color: "#666",
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 400,
                  }}
                >
                  From trade royalties
                </span>
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: earnings.loading ? "#ccc" : "#111",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {earnings.loading ? "--" : `$${earnings.fromTradeRoyalties}`}
                </span>
              </div>

              {/* From auction wins */}
              <div className="flex items-center justify-between">
                <span
                  style={{
                    fontSize: 14,
                    color: "#666",
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 400,
                  }}
                >
                  From auction wins
                </span>
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: earnings.loading ? "#ccc" : "#111",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {earnings.loading ? "--" : `$${earnings.fromAuctionWins}`}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
