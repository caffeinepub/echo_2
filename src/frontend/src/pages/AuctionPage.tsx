import { useEffect, useRef, useState } from "react";
import { usePackStyle } from "../context/PackStyleContext";
import { useWeeklyAuction } from "../context/WeeklyAuctionContext";
import type {
  WeeklyAuctionItem,
  WeeklyBid,
} from "../context/WeeklyAuctionContext";
import { useWeeklyRound } from "../context/WeeklyRoundContext";

const BTC_USD = 83000;
const FALLBACK_IMG = "/assets/generated/minty-pack-wrapper.png";

function formatBtc(btc: number): string {
  return btc.toFixed(5);
}

function formatUsd(usd: number): string {
  return usd.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function timeAgo(ts: number): string {
  const diff = Math.max(0, Date.now() - ts);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Countdown Ring ────────────────────────────────────────────────────────────

interface CountdownRingProps {
  totalMs: number;
  hours: number;
  minutes: number;
  seconds: number;
  accentR: number;
  accentG: number;
  accentB: number;
  danger: boolean;
}

function CountdownRing({
  totalMs,
  hours,
  minutes,
  seconds,
  accentR,
  accentG,
  accentB,
  danger,
}: CountdownRingProps) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const fraction = Math.min(1, totalMs / 3600000);
  const dashOffset = circumference * (1 - fraction);
  const color = danger ? "#FF6B35" : `rgb(${accentR},${accentG},${accentB})`;
  const glowColor = danger
    ? "rgba(255,107,53,0.45)"
    : `rgba(${accentR},${accentG},${accentB},0.45)`;

  return (
    <div
      className="flex flex-col items-center gap-1"
      data-ocid="auction.countdown_ring"
    >
      <div
        style={{
          position: "relative",
          width: 124,
          height: 124,
          animation: danger ? "auction-shake 3s ease-in-out infinite" : "none",
        }}
      >
        <svg
          width="124"
          height="124"
          style={{ transform: "rotate(-90deg)" }}
          aria-label="Countdown timer"
          role="img"
        >
          <circle
            cx="62"
            cy="62"
            r={radius}
            fill="none"
            stroke="rgba(0,0,0,0.06)"
            strokeWidth="8"
          />
          <circle
            cx="62"
            cy="62"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{
              transition: "stroke-dashoffset 1s linear, stroke 0.5s ease",
              filter: `drop-shadow(0 0 6px ${glowColor})`,
            }}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 22,
              fontWeight: 700,
              color: danger ? "#FF6B35" : "#0d1520",
              letterSpacing: "-0.5px",
              lineHeight: 1,
            }}
          >
            {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:
            {String(seconds).padStart(2, "0")}
          </span>
          <span
            style={{
              fontSize: 10,
              color: "#8baec8",
              marginTop: 4,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            remaining
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Bid Row ───────────────────────────────────────────────────────────────────

interface BidRowProps {
  bid: WeeklyBid;
  isNew: boolean;
  accentR: number;
  accentG: number;
  accentB: number;
}

function BidRow({ bid, isNew, accentR, accentG, accentB }: BidRowProps) {
  const [visible, setVisible] = useState(!isNew);

  useEffect(() => {
    if (isNew) {
      requestAnimationFrame(() => setVisible(true));
    }
  }, [isNew]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 12px",
        borderRadius: 12,
        background: isNew
          ? `rgba(${accentR},${accentG},${accentB},0.07)`
          : "rgba(0,0,0,0.02)",
        transform: visible ? "translateX(0)" : "translateX(100%)",
        opacity: visible ? 1 : 0,
        transition:
          "transform 0.4s cubic-bezier(0.22,1,0.36,1), opacity 0.4s ease",
        marginBottom: 4,
        border: isNew
          ? `1px solid rgba(${accentR},${accentG},${accentB},0.18)`
          : "1px solid rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: `rgba(${accentR},${accentG},${accentB},0.15)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 700,
            color: `rgb(${accentR},${accentG},${accentB})`,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {bid.bidderName.charAt(0).toUpperCase()}
        </div>
        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#0d1520",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            @{bid.bidderName}
          </div>
          <div
            style={{
              fontSize: 11,
              color: "#8baec8",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {timeAgo(bid.placedAt)}
          </div>
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: `rgb(${accentR},${accentG},${accentB})`,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {formatBtc(bid.amountBtc)} BTC
        </div>
        <div
          style={{
            fontSize: 11,
            color: "#8baec8",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          ≈ ${formatUsd(bid.amountUsd)}
        </div>
      </div>
    </div>
  );
}

// ─── Sparkle Burst ────────────────────────────────────────────────────────────

function SparkleBurst({ active }: { active: boolean }) {
  if (!active) return null;
  const dots = [
    { angle: 0, color: "#FFD700", delay: "0ms" },
    { angle: 60, color: "#FF6B9D", delay: "40ms" },
    { angle: 120, color: "#A78BFA", delay: "80ms" },
    { angle: 180, color: "#34D399", delay: "120ms" },
    { angle: 240, color: "#60A5FA", delay: "160ms" },
    { angle: 300, color: "#FB923C", delay: "200ms" },
  ];

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "visible",
      }}
    >
      {dots.map((d) => (
        <div
          key={d.angle}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: d.color,
            animation: `sparkle-burst 0.7s ease-out ${d.delay} forwards`,
            transform: `rotate(${d.angle}deg) translateX(0) translate(-50%,-50%)`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Winner Overlay ────────────────────────────────────────────────────────────

function WinnerOverlay({
  winner,
  amountBtc,
  onDone,
}: {
  winner: string;
  amountBtc: number;
  onDone: () => void;
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 500);
    }, 3200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.55)",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.5s ease",
        backdropFilter: "blur(8px)",
      }}
      data-ocid="auction.winner.modal"
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 24,
          padding: "36px 40px",
          textAlign: "center",
          maxWidth: 320,
          animation:
            "winner-scale-in 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards",
          boxShadow: "0 24px 64px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
        <div
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: "#0d1520",
            fontFamily: "'DM Sans', sans-serif",
            marginBottom: 8,
          }}
        >
          Sold!
        </div>
        <div
          style={{
            fontSize: 15,
            color: "#5b7fa6",
            fontFamily: "'DM Sans', sans-serif",
            marginBottom: 4,
          }}
        >
          <strong style={{ color: "#0d1520" }}>@{winner}</strong> wins for
        </div>
        <div
          style={{
            fontSize: 24,
            fontWeight: 800,
            color: "#F59E0B",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {formatBtc(amountBtc)} BTC
        </div>
        <div
          style={{
            fontSize: 13,
            color: "#8baec8",
            fontFamily: "'DM Sans', sans-serif",
            marginTop: 4,
          }}
        >
          ≈ ${formatUsd(amountBtc * BTC_USD)}
        </div>
      </div>
    </div>
  );
}

// ─── Live Auction Hero ─────────────────────────────────────────────────────────

interface LiveAuctionHeroProps {
  auction: WeeklyAuctionItem;
  timeRemaining: {
    hours: number;
    minutes: number;
    seconds: number;
    totalMs: number;
  };
  accentR: number;
  accentG: number;
  accentB: number;
}

function LiveAuctionHero({
  auction,
  timeRemaining,
  accentR,
  accentG,
  accentB,
}: LiveAuctionHeroProps) {
  const [bidInput, setBidInput] = useState("");
  const [sparkleActive, setSparkleActive] = useState(false);
  const [bidError, setBidError] = useState("");
  const { placeBid } = useWeeklyAuction();
  const prevBidCount = useRef(auction.bids.length);
  const [newBidIdx, setNewBidIdx] = useState<number | null>(null);

  const isDanger = timeRemaining.totalMs < 5 * 60 * 1000;
  const minBid = auction.highestBid + 0.00001;
  const inputVal = Number.parseFloat(bidInput);

  useEffect(() => {
    if (auction.bids.length > prevBidCount.current) {
      setNewBidIdx(auction.bids.length - 1);
      setTimeout(() => setNewBidIdx(null), 800);
    }
    prevBidCount.current = auction.bids.length;
  }, [auction.bids.length]);

  function handleBid() {
    const amt = Number.parseFloat(bidInput);
    if (Number.isNaN(amt) || amt <= auction.highestBid) {
      setBidError(`Minimum bid: ${formatBtc(minBid)} BTC`);
      return;
    }
    setBidError("");
    placeBid(amt);
    setBidInput("");
    setSparkleActive(true);
    setTimeout(() => setSparkleActive(false), 800);
  }

  const recentBids = [...auction.bids].reverse().slice(0, 5);
  const accentColor = `rgb(${accentR},${accentG},${accentB})`;
  const glowColor = `rgba(${accentR},${accentG},${accentB},0.45)`;
  const glowColorMid = `rgba(${accentR},${accentG},${accentB},0.2)`;

  const bidButtonDisabled =
    !bidInput || Number.isNaN(inputVal) || inputVal <= auction.highestBid;

  return (
    <div style={{ padding: "0 16px", marginBottom: 24 }}>
      <div
        data-ocid="auction.active.card"
        style={{
          borderRadius: 20,
          overflow: "hidden",
          position: "relative",
          aspectRatio: "16/10",
          background: "#f0f4fa",
          animation: isDanger
            ? "auction-shake 3s ease-in-out infinite"
            : "auction-glow-pulse 2s ease-in-out infinite",
          boxShadow: `0 4px 20px rgba(0,0,0,0.08), 0 0 0 2px ${accentColor}, 0 0 24px ${glowColorMid}, 0 0 40px ${glowColorMid}`,
        }}
      >
        <img
          src={auction.imageUrl}
          alt={auction.title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = FALLBACK_IMG;
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, transparent 40%, rgba(0,0,0,0.55) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            display: "flex",
            alignItems: "center",
            gap: 5,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(8px)",
            borderRadius: 20,
            padding: "4px 10px",
          }}
          data-ocid="auction.live.badge"
        >
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#FF3B30",
              boxShadow: "0 0 0 0 rgba(255,59,48,0.4)",
              animation: "live-ping 1.5s cubic-bezier(0,0,0.2,1) infinite",
            }}
          />
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#fff",
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: "0.08em",
            }}
          >
            LIVE
          </span>
        </div>
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            background: "linear-gradient(135deg, #F59E0B, #D97706)",
            borderRadius: 14,
            padding: "4px 10px",
            fontSize: 12,
            fontWeight: 800,
            color: "#fff",
            fontFamily: "'DM Sans', sans-serif",
            boxShadow: "0 2px 8px rgba(245,158,11,0.4)",
          }}
          data-ocid="auction.rank.badge"
        >
          #{auction.rank}
        </div>
        <div style={{ position: "absolute", bottom: 12, left: 12, right: 12 }}>
          <div
            style={{
              fontSize: 17,
              fontWeight: 800,
              color: "#fff",
              fontFamily: "'DM Sans', sans-serif",
              marginBottom: 2,
              textShadow: "0 1px 4px rgba(0,0,0,0.5)",
            }}
          >
            {auction.title}
          </div>
          <div
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.8)",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Minted by @{auction.creatorName} · ♥{" "}
            {auction.likes.toLocaleString()}
          </div>
        </div>
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          padding: "20px 16px",
          marginTop: 12,
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
          border: "1px solid rgba(0,0,0,0.05)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <CountdownRing
            totalMs={timeRemaining.totalMs}
            hours={timeRemaining.hours}
            minutes={timeRemaining.minutes}
            seconds={timeRemaining.seconds}
            accentR={accentR}
            accentG={accentG}
            accentB={accentB}
            danger={isDanger}
          />
          <div style={{ flex: 1, paddingLeft: 20 }}>
            <div
              style={{
                fontSize: 11,
                color: "#8baec8",
                fontFamily: "'DM Sans', sans-serif",
                marginBottom: 4,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Current Bid
            </div>
            {auction.highestBid > 0 ? (
              <>
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 800,
                    color: accentColor,
                    fontFamily: "'DM Sans', sans-serif",
                    lineHeight: 1,
                  }}
                >
                  {formatBtc(auction.highestBid)}
                  <span
                    style={{ fontSize: 14, fontWeight: 600, marginLeft: 4 }}
                  >
                    BTC
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "#5b7fa6",
                    fontFamily: "'DM Sans', sans-serif",
                    marginTop: 2,
                  }}
                >
                  ≈ ${formatUsd(auction.highestBid * BTC_USD)}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#8baec8",
                    fontFamily: "'DM Sans', sans-serif",
                    marginTop: 6,
                  }}
                >
                  {auction.bids.length} bid
                  {auction.bids.length !== 1 ? "s" : ""} · last{" "}
                  {timeAgo(
                    auction.bids[auction.bids.length - 1]?.placedAt ?? 0,
                  )}
                </div>
              </>
            ) : (
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#8baec8",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                No bids yet —{" "}
                <span style={{ color: accentColor }}>be first!</span>
              </div>
            )}
          </div>
        </div>

        {auction.bids.length > 0 && (
          <div style={{ marginBottom: 16 }} data-ocid="auction.bid.list">
            <div
              style={{
                fontSize: 11,
                color: "#8baec8",
                fontFamily: "'DM Sans', sans-serif",
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Recent Bids
            </div>
            {recentBids.map((bid, idx) => (
              <BidRow
                key={bid.id}
                bid={bid}
                isNew={idx === 0 && newBidIdx !== null}
                accentR={accentR}
                accentG={accentG}
                accentB={accentB}
              />
            ))}
          </div>
        )}

        <div
          style={{ borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: 16 }}
        >
          <div
            style={{
              fontSize: 11,
              color: "#8baec8",
              fontFamily: "'DM Sans', sans-serif",
              marginBottom: 8,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Place Your Bid
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <input
                type="number"
                step="0.00001"
                min={minBid}
                value={bidInput}
                onChange={(e) => {
                  setBidInput(e.target.value);
                  setBidError("");
                }}
                placeholder={`Min ${formatBtc(minBid)} BTC`}
                data-ocid="auction.bid.input"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: bidError
                    ? "1.5px solid #FF3B30"
                    : `1.5px solid rgba(${accentR},${accentG},${accentB},0.3)`,
                  fontSize: 15,
                  fontFamily: "'DM Sans', sans-serif",
                  outline: "none",
                  background: "#fafcff",
                  color: "#0d1520",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => {
                  (e.target as HTMLInputElement).style.borderColor =
                    accentColor;
                }}
                onBlur={(e) => {
                  (e.target as HTMLInputElement).style.borderColor =
                    `rgba(${accentR},${accentG},${accentB},0.3)`;
                }}
              />
              {bidInput && !Number.isNaN(inputVal) && inputVal > 0 && (
                <div
                  style={{
                    fontSize: 11,
                    color: "#8baec8",
                    fontFamily: "'DM Sans', sans-serif",
                    marginTop: 4,
                    paddingLeft: 2,
                  }}
                >
                  ≈ ${formatUsd(inputVal * BTC_USD)}
                </div>
              )}
              {bidError && (
                <div
                  style={{
                    fontSize: 11,
                    color: "#FF3B30",
                    fontFamily: "'DM Sans', sans-serif",
                    marginTop: 4,
                    paddingLeft: 2,
                  }}
                  data-ocid="auction.bid.error_state"
                >
                  {bidError}
                </div>
              )}
            </div>
            <div style={{ position: "relative" }}>
              <button
                type="button"
                data-ocid="auction.place_bid.primary_button"
                onClick={handleBid}
                disabled={bidButtonDisabled}
                style={{
                  padding: "12px 20px",
                  borderRadius: 12,
                  background: bidButtonDisabled
                    ? "rgba(0,0,0,0.08)"
                    : `linear-gradient(135deg, rgb(${accentR},${accentG},${accentB}), rgba(${accentR},${accentG},${accentB},0.8))`,
                  color: bidButtonDisabled ? "#8baec8" : "#fff",
                  border: "none",
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: "'DM Sans', sans-serif",
                  cursor: bidButtonDisabled ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                  boxShadow: bidButtonDisabled
                    ? "none"
                    : `0 4px 16px ${glowColor}`,
                  whiteSpace: "nowrap",
                  minWidth: 100,
                }}
              >
                Place Bid
              </button>
              <SparkleBurst active={sparkleActive} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Queue Card ────────────────────────────────────────────────────────────────

function QueueCard({
  item,
  accentR,
  accentG,
  accentB,
}: {
  item: WeeklyAuctionItem;
  accentR: number;
  accentG: number;
  accentB: number;
}) {
  // accentR, accentG, accentB retained for future use / consistency
  return (
    <div
      data-ocid={`auction.queue.item.${item.rank}`}
      style={{
        flexShrink: 0,
        width: 120,
        borderRadius: 16,
        overflow: "hidden",
        background: "#fff",
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        border: "1px solid rgba(0,0,0,0.05)",
        opacity: 0.78,
        cursor: "default",
        transition: "opacity 0.2s",
      }}
    >
      <div
        style={{ position: "relative", aspectRatio: "4/5", overflow: "hidden" }}
      >
        <img
          src={item.imageUrl}
          alt={item.title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "grayscale(15%)",
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = FALLBACK_IMG;
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 6,
            right: 6,
            background: "linear-gradient(135deg, #F59E0B, #D97706)",
            borderRadius: 10,
            padding: "2px 7px",
            fontSize: 10,
            fontWeight: 800,
            color: "#fff",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          #{item.rank}
        </div>
      </div>
      <div style={{ padding: "8px 8px 10px" }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#0d1520",
            fontFamily: "'DM Sans', sans-serif",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {item.title}
        </div>
        <div
          style={{
            fontSize: 10,
            color: `rgb(${accentR},${accentG},${accentB})`,
            fontFamily: "'DM Sans', sans-serif",
            marginTop: 2,
          }}
        >
          ♥ {item.likes.toLocaleString()}
        </div>
      </div>
    </div>
  );
}

// ─── Completed Row ─────────────────────────────────────────────────────────────

function CompletedRow({
  item,
  accentR,
  accentG,
  accentB,
}: {
  item: WeeklyAuctionItem;
  accentR: number;
  accentG: number;
  accentB: number;
}) {
  return (
    <div
      data-ocid={`auction.completed.item.${item.rank}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 16px",
        background: "#fff",
        borderRadius: 16,
        marginBottom: 8,
        boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        border: "1px solid rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          position: "relative",
          width: 52,
          height: 52,
          borderRadius: 10,
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <img
          src={item.imageUrl}
          alt={item.title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = FALLBACK_IMG;
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 2,
            right: 2,
            background: "linear-gradient(135deg, #F59E0B, #D97706)",
            borderRadius: 6,
            padding: "1px 4px",
            fontSize: 8,
            fontWeight: 800,
            color: "#fff",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          #{item.rank}
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#0d1520",
            fontFamily: "'DM Sans', sans-serif",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {item.title}
        </div>
        {item.winner && (
          <div
            style={{
              fontSize: 11,
              color: "#5b7fa6",
              fontFamily: "'DM Sans', sans-serif",
              marginTop: 2,
            }}
          >
            Won by @{item.winner}
          </div>
        )}
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        {item.highestBid > 0 ? (
          <>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: `rgb(${accentR},${accentG},${accentB})`,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {formatBtc(item.highestBid)} BTC
            </div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#34D399",
                fontFamily: "'DM Sans', sans-serif",
                marginTop: 2,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              SOLD
            </div>
          </>
        ) : (
          <div
            style={{
              fontSize: 11,
              color: "#8baec8",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            No bids
          </div>
        )}
      </div>
    </div>
  );
}

// ─── AuctionPage ───────────────────────────────────────────────────────────────

export function AuctionPage() {
  const { activeStyle } = usePackStyle();
  const { accentR, accentG, accentB } = activeStyle;
  const {
    activeAuction,
    upcomingAuctions,
    completedAuctions,
    timeRemaining,
    justEndedWinner,
    clearJustEnded,
  } = useWeeklyAuction();
  const { timeRemaining: roundTime } = useWeeklyRound();

  const accentColor = `rgb(${accentR},${accentG},${accentB})`;

  return (
    <>
      <style>{`
        @keyframes auction-glow-pulse {
          0%,100% { box-shadow: 0 4px 20px rgba(0,0,0,0.08), 0 0 0 2px ${accentColor}, 0 0 16px rgba(${accentR},${accentG},${accentB},0.2), 0 0 30px rgba(${accentR},${accentG},${accentB},0.1); }
          50% { box-shadow: 0 4px 20px rgba(0,0,0,0.08), 0 0 0 3px ${accentColor}, 0 0 32px rgba(${accentR},${accentG},${accentB},0.45), 0 0 60px rgba(${accentR},${accentG},${accentB},0.2); }
        }
        @keyframes auction-shake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-3px); }
          40% { transform: translateX(3px); }
          60% { transform: translateX(-2px); }
          80% { transform: translateX(2px); }
        }
        @keyframes live-ping {
          0% { box-shadow: 0 0 0 0 rgba(255,59,48,0.5); transform: scale(1); }
          70% { box-shadow: 0 0 0 6px rgba(255,59,48,0); transform: scale(1); }
          100% { box-shadow: 0 0 0 0 rgba(255,59,48,0); }
        }
        @keyframes sparkle-burst {
          0% { transform: rotate(var(--r,0deg)) translateX(0) translate(-50%,-50%); opacity: 1; }
          100% { transform: rotate(var(--r,0deg)) translateX(36px) translate(-50%,-50%); opacity: 0; }
        }
        @keyframes winner-scale-in {
          0% { transform: scale(0.7); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(16px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .auction-queue-scroll::-webkit-scrollbar { display: none; }
      `}</style>

      {justEndedWinner && (
        <WinnerOverlay
          winner={justEndedWinner.name}
          amountBtc={justEndedWinner.amountBtc}
          onDone={clearJustEnded}
        />
      )}

      <div
        style={{
          background: "var(--echo-bg, #f7f9fc)",
          minHeight: "100vh",
          fontFamily: "'DM Sans', sans-serif",
          paddingBottom: 32,
        }}
        data-ocid="auction.page"
      >
        <div style={{ padding: "20px 16px 16px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: "#0d1520",
                  margin: 0,
                  letterSpacing: "-0.5px",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Auction
              </h1>
              <p
                style={{
                  fontSize: 13,
                  color: "#8baec8",
                  margin: "4px 0 0",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Top 25 weekly moments · 1 hr each
              </p>
            </div>
            {activeAuction && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "rgba(255,59,48,0.1)",
                  borderRadius: 20,
                  padding: "6px 12px",
                  border: "1px solid rgba(255,59,48,0.2)",
                }}
              >
                <div
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#FF3B30",
                    animation:
                      "live-ping 1.5s cubic-bezier(0,0,0.2,1) infinite",
                  }}
                />
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#FF3B30",
                    letterSpacing: "0.08em",
                  }}
                >
                  LIVE NOW
                </span>
              </div>
            )}
          </div>
        </div>

        {activeAuction ? (
          <LiveAuctionHero
            auction={activeAuction}
            timeRemaining={timeRemaining}
            accentR={accentR}
            accentG={accentG}
            accentB={accentB}
          />
        ) : (
          <div
            data-ocid="auction.empty_state"
            style={{
              margin: "0 16px 24px",
              padding: "40px 24px",
              background: "#fff",
              borderRadius: 20,
              boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
              textAlign: "center",
              animation: "fade-in-up 0.5s ease forwards",
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏆</div>
            <div
              style={{
                fontSize: 17,
                fontWeight: 700,
                color: "#0d1520",
                fontFamily: "'DM Sans', sans-serif",
                marginBottom: 8,
              }}
            >
              Auction starts when Round ends
            </div>
            <div
              style={{
                fontSize: 13,
                color: "#8baec8",
                fontFamily: "'DM Sans', sans-serif",
                marginBottom: 16,
              }}
            >
              The Top 25 most liked photos from this round will be auctioned one
              by one.
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: `rgba(${accentR},${accentG},${accentB},0.08)`,
                borderRadius: 12,
                padding: "8px 16px",
                border: `1px solid rgba(${accentR},${accentG},${accentB},0.15)`,
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  color: accentColor,
                  fontWeight: 600,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Round ends in {roundTime.days}d {roundTime.hours}h{" "}
                {roundTime.minutes}m
              </span>
            </div>
          </div>
        )}

        {upcomingAuctions.length > 0 && (
          <div style={{ marginBottom: 24 }} data-ocid="auction.queue.section">
            <div
              style={{
                padding: "0 16px",
                marginBottom: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#0d1520",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Up Next
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "#8baec8",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {upcomingAuctions.length} remaining
              </div>
            </div>
            <div
              style={{
                display: "flex",
                gap: 10,
                overflowX: "auto",
                paddingLeft: 16,
                paddingRight: 16,
                paddingBottom: 8,
                scrollbarWidth: "none",
              }}
              className="auction-queue-scroll"
            >
              {upcomingAuctions.map((item) => (
                <QueueCard
                  key={item.id}
                  item={item}
                  accentR={accentR}
                  accentG={accentG}
                  accentB={accentB}
                />
              ))}
            </div>
          </div>
        )}

        {completedAuctions.length > 0 && (
          <div
            style={{ padding: "0 16px" }}
            data-ocid="auction.completed.section"
          >
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#0d1520",
                fontFamily: "'DM Sans', sans-serif",
                marginBottom: 12,
              }}
            >
              Completed
            </div>
            {completedAuctions.map((item) => (
              <CompletedRow
                key={item.id}
                item={item}
                accentR={accentR}
                accentG={accentG}
                accentB={accentB}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
