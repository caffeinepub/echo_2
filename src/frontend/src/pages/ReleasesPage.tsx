import { Heart, MessageCircle, Pause, Play } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "../ThemeContext";
import { CommentsModal } from "../components/CommentsModal";
import { EchoSolIcon } from "../components/EchoSolIcon";
import { MintModal } from "../components/MintModal";
import { useWalletContext } from "../context/WalletContext";
import { useSolPriceContext } from "../contexts/SolPriceContext";
import type { SONGS, SongComment } from "../data/songs";
import { useMockData } from "../hooks/useMockData";
import { formatUSD } from "../utils/formatUSD";

// ─── Countdown hook ───────────────────────────────────────────────────────────
function useCountdown(targetMs: number | null) {
  const [remaining, setRemaining] = useState<number>(() =>
    targetMs === null ? 0 : targetMs,
  );

  useEffect(() => {
    if (targetMs === null) return;
    const end = Date.now() + targetMs;
    const interval = setInterval(() => {
      const left = Math.max(0, end - Date.now());
      setRemaining(left);
      if (left === 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [targetMs]);

  const hours = Math.floor(remaining / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

// ─── Category tabs ────────────────────────────────────────────────────────────
const CATEGORIES = [
  "All",
  "Trending",
  "Live Now",
  "Upcoming",
  "Sold Out",
  "New",
  "Electronic",
  "Ambient",
  "Hip Hop",
  "Experimental",
];

type Song = (typeof SONGS)[0];

function filterSongs(songs: Song[], category: string): Song[] {
  if (category === "Live Now")
    return songs.filter((s) => !s.isSoldOut && s.mintOpensInMs === 0);
  if (category === "Upcoming")
    return songs.filter((s) => s.mintOpensInMs !== null && s.mintOpensInMs > 0);
  if (category === "Sold Out") return songs.filter((s) => s.isSoldOut);
  return songs;
}

// ─── Animated waveform overlay ───────────────────────────────────────────────
const BAR_COUNT = 28;
const BAR_KEYS = Array.from({ length: BAR_COUNT }, (_, i) => `bar-${i}`);

function WaveformOverlay() {
  return (
    <>
      <style>{`
        @keyframes waveBar {
          0%, 100% { transform: scaleY(0.2); }
          50% { transform: scaleY(1); }
        }
      `}</style>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 3,
          pointerEvents: "none",
          zIndex: 3,
        }}
      >
        {BAR_KEYS.map((key, i) => (
          <div
            key={key}
            style={{
              width: 3,
              height: 40,
              borderRadius: 2,
              background:
                "linear-gradient(to top, rgba(99,255,255,0.75), rgba(168,85,247,0.65))",
              transformOrigin: "bottom",
              animation: `waveBar ${0.8 + (i % 5) * 0.18}s ease-in-out infinite`,
              animationDelay: `${(i * 0.07) % 0.9}s`,
            }}
          />
        ))}
      </div>
    </>
  );
}

// ─── Mint price display ───────────────────────────────────────────────────────
function MintPriceDisplay({ sol }: { sol: number }) {
  const { solPrice } = useSolPriceContext();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <EchoSolIcon size={14} />
        <span
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: "white",
            letterSpacing: "-0.01em",
          }}
        >
          {sol} SOL
        </span>
      </div>
      <span
        style={{
          fontSize: 11,
          color: "rgba(255,255,255,0.45)",
          paddingLeft: 20,
        }}
      >
        {formatUSD(sol * solPrice)}
      </span>
    </div>
  );
}

function MintPriceDisplayLight({ sol }: { sol: number }) {
  const { solPrice } = useSolPriceContext();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <EchoSolIcon size={14} />
        <span
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: "#0F172A",
            letterSpacing: "-0.01em",
          }}
        >
          {sol} SOL
        </span>
      </div>
      <span style={{ fontSize: 11, color: "#8A94A6", paddingLeft: 20 }}>
        {formatUSD(sol * solPrice)}
      </span>
    </div>
  );
}

// ─── Feed card ────────────────────────────────────────────────────────────────
interface FeedCardProps {
  song: Song;
  index: number;
  likes: number;
  isLiked: boolean;
  comments: SongComment[];
  minted: number;
  isOwned: boolean;
  isPlaying: boolean;
  isLight: boolean;
  onToggleLike: () => void;
  onOpenComments: () => void;
  onBuy: () => void;
  onTogglePlay: () => void;
}

function ReleaseFeedCard({
  song,
  index,
  likes,
  isLiked,
  comments,
  minted,
  isOwned,
  isPlaying,
  isLight,
  onToggleLike,
  onOpenComments,
  onBuy,
  onTogglePlay,
}: FeedCardProps) {
  const countdown = useCountdown(
    song.mintOpensInMs !== 0 && song.mintOpensInMs !== null
      ? song.mintOpensInMs
      : null,
  );

  const mintPercent = Math.min(100, Math.round((minted / song.supply) * 100));
  const isUpcoming = song.mintOpensInMs !== null && song.mintOpensInMs > 0;
  const isSoldOut = song.isSoldOut;
  const isLive = !isUpcoming && !isSoldOut;

  const cardBg = isLight ? "#FFFFFF" : "rgba(255,255,255,0.04)";
  const cardBorder = isLight
    ? "1px solid #E8ECF3"
    : "1px solid rgba(255,255,255,0.08)";
  const cardShadow = isLight ? "0 2px 16px rgba(0,0,0,0.07)" : "none";
  const dataRowBg = isLight ? "#F8F9FC" : "rgba(0,0,0,0.25)";
  const dataRowBorder = isLight
    ? "1px solid #E8ECF3"
    : "1px solid rgba(255,255,255,0.06)";
  const actionRowBg = isLight ? "#FFFFFF" : "transparent";
  const progressTrackBg = isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)";
  const mintedLabelColor = isLight ? "#5B6475" : "rgba(255,255,255,0.5)";
  const mintedValueColor = isLight ? "#0F172A" : "white";
  const socialIconColor = isLight ? "#7C8596" : "rgba(255,255,255,0.45)";
  const socialCountColor = isLight ? "#5B6475" : "rgba(255,255,255,0.45)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut", delay: index * 0.05 }}
      data-ocid={`releases.item.${index + 1}`}
      style={{
        background: cardBg,
        border: cardBorder,
        boxShadow: cardShadow,
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      {/* ── Media area (button for a11y) ── */}
      <button
        type="button"
        onClick={onTogglePlay}
        aria-label={isPlaying ? "Pause preview" : "Play 30s preview"}
        style={{
          position: "relative",
          display: "block",
          width: "100%",
          paddingTop: "66.66%",
          overflow: "hidden",
          background: "#0A0A0F",
          cursor: "pointer",
          border: "none",
          padding: 0,
        }}
      >
        {/* Padding trick inner wrapper */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
          }}
        >
          {/* Artwork */}
          <img
            src={song.artworkSrc}
            alt={song.title}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: isSoldOut ? "grayscale(60%) brightness(0.7)" : "none",
              transition: "filter 0.3s ease",
            }}
          />

          {/* Gradient overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.88) 100%)",
              zIndex: 1,
            }}
          />

          {/* Waveform when playing */}
          <AnimatePresence>
            {isPlaying && (
              <motion.div
                key="waveform"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{ position: "absolute", inset: 0, zIndex: 3 }}
              >
                <WaveformOverlay />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Play/pause badge top-right */}
          <motion.div
            whileTap={{ scale: 0.9 }}
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              zIndex: 4,
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "rgba(0,0,0,0.45)",
              border: "1px solid rgba(255,255,255,0.2)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            {isPlaying ? (
              <Pause size={14} color="white" fill="white" />
            ) : (
              <Play
                size={14}
                color="white"
                fill="white"
                style={{ marginLeft: 2 }}
              />
            )}
          </motion.div>

          {/* Info overlay — bottom of media */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "12px 14px 14px",
              zIndex: 2,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "white",
                  lineHeight: 1.2,
                  letterSpacing: "-0.01em",
                  textShadow: "0 1px 4px rgba(0,0,0,0.6)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  textAlign: "left",
                }}
              >
                {song.title}
              </p>
              <p
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.65)",
                  marginTop: 2,
                  textShadow: "0 1px 3px rgba(0,0,0,0.5)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  textAlign: "left",
                }}
              >
                {song.artist}
              </p>
            </div>

            {/* Status badge */}
            <div style={{ flexShrink: 0, marginLeft: 10, textAlign: "right" }}>
              {isUpcoming && (
                <div
                  style={{
                    background: "rgba(0,0,0,0.55)",
                    backdropFilter: "blur(6px)",
                    border: "1px solid rgba(251,191,36,0.3)",
                    borderRadius: 8,
                    padding: "4px 8px",
                  }}
                >
                  <p
                    style={{
                      fontSize: 8,
                      color: "rgba(251,191,36,0.7)",
                      letterSpacing: "0.12em",
                      fontFamily: "monospace",
                      marginBottom: 1,
                      textAlign: "right",
                    }}
                  >
                    DROPS IN
                  </p>
                  <p
                    style={{
                      fontSize: 12,
                      color: "rgba(251,191,36,0.9)",
                      fontFamily: "monospace",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {countdown}
                  </p>
                </div>
              )}
              {isLive && (
                <div
                  style={{
                    background: "rgba(0,0,0,0.55)",
                    backdropFilter: "blur(6px)",
                    border: "1px solid rgba(74,222,128,0.25)",
                    borderRadius: 8,
                    padding: "4px 8px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 8,
                      color: "rgba(74,222,128,0.8)",
                      letterSpacing: "0.12em",
                      fontFamily: "monospace",
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                      marginBottom: 1,
                      justifyContent: "flex-end",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: "#4ade80",
                        animation: "liveDot 1.4s ease-in-out infinite",
                        flexShrink: 0,
                      }}
                    />
                    LIVE
                  </div>
                  <p
                    style={{
                      fontSize: 11,
                      color: "rgba(255,255,255,0.75)",
                      fontFamily: "monospace",
                    }}
                  >
                    {minted} / {song.supply}
                  </p>
                </div>
              )}
              {isSoldOut && (
                <div
                  style={{
                    background: "rgba(0,0,0,0.55)",
                    backdropFilter: "blur(6px)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 8,
                    padding: "4px 10px",
                  }}
                >
                  <p
                    style={{
                      fontSize: 9,
                      color: "rgba(255,255,255,0.4)",
                      letterSpacing: "0.16em",
                      fontFamily: "monospace",
                    }}
                  >
                    SOLD OUT
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </button>

      {/* ── Data row ── */}
      <div
        style={{
          background: dataRowBg,
          borderTop: dataRowBorder,
          borderBottom: dataRowBorder,
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        {isLight ? (
          <MintPriceDisplayLight sol={song.mintPrice} />
        ) : (
          <MintPriceDisplay sol={song.mintPrice} />
        )}

        {/* Mint progress */}
        <div style={{ flex: 1, maxWidth: 160, textAlign: "right" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 5,
            }}
          >
            <span
              style={{
                fontSize: 10,
                color: mintedLabelColor,
                letterSpacing: "0.08em",
                fontFamily: "monospace",
                textTransform: "uppercase",
              }}
            >
              Minted
            </span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: mintedValueColor,
                fontFamily: "monospace",
              }}
            >
              {minted} / {song.supply}
            </span>
          </div>
          <div
            style={{
              height: 4,
              borderRadius: 4,
              background: progressTrackBg,
              overflow: "hidden",
            }}
          >
            <motion.div
              style={{
                height: "100%",
                borderRadius: 4,
                background: "linear-gradient(90deg, #7C3AED, #a78bfa)",
              }}
              initial={{ width: 0 }}
              animate={{ width: `${mintPercent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* ── Action row ── */}
      <div
        style={{
          background: actionRowBg,
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        {/* Like */}
        <button
          type="button"
          onClick={onToggleLike}
          data-ocid={`releases.item.${index + 1}.toggle`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "6px 0",
            flexShrink: 0,
          }}
        >
          <Heart
            size={18}
            color={isLiked ? "#f472b6" : socialIconColor}
            fill={isLiked ? "#f472b6" : "none"}
          />
          <span
            style={{
              fontSize: 13,
              color: isLiked ? "#f472b6" : socialCountColor,
              fontWeight: isLiked ? 600 : 400,
            }}
          >
            {likes}
          </span>
        </button>

        {/* Comments */}
        <button
          type="button"
          onClick={onOpenComments}
          data-ocid={`releases.item.${index + 1}.button`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "6px 0",
            flexShrink: 0,
          }}
        >
          <MessageCircle size={18} color={socialIconColor} />
          <span style={{ fontSize: 13, color: socialCountColor }}>
            {comments.length}
          </span>
        </button>

        <div style={{ flex: 1 }} />

        {/* Play 30s */}
        <button
          type="button"
          onClick={onTogglePlay}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 14px",
            borderRadius: 20,
            border: isLight
              ? "1px solid #E8ECF3"
              : "1px solid rgba(255,255,255,0.12)",
            background: isPlaying
              ? "rgba(124,58,237,0.15)"
              : isLight
                ? "rgba(0,0,0,0.04)"
                : "rgba(255,255,255,0.05)",
            cursor: "pointer",
            transition: "background 0.2s",
            flexShrink: 0,
          }}
        >
          {isPlaying ? (
            <Pause
              size={12}
              color={isLight ? "#7C3AED" : "#a78bfa"}
              fill={isLight ? "#7C3AED" : "#a78bfa"}
            />
          ) : (
            <Play
              size={12}
              color={isLight ? "#7C3AED" : "#a78bfa"}
              fill={isLight ? "#7C3AED" : "#a78bfa"}
              style={{ marginLeft: 1 }}
            />
          )}
          <span
            style={{
              fontSize: 12,
              color: isLight ? "#7C3AED" : "#a78bfa",
              fontWeight: 500,
            }}
          >
            {isPlaying ? "Stop" : "Play 30s"}
          </span>
        </button>

        {/* Mint button */}
        {isSoldOut ? (
          <button
            type="button"
            disabled
            style={{
              padding: "8px 18px",
              borderRadius: 20,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.05)",
              color: "rgba(255,255,255,0.25)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "not-allowed",
              flexShrink: 0,
            }}
          >
            Sold Out
          </button>
        ) : isOwned ? (
          <button
            type="button"
            disabled
            style={{
              padding: "8px 18px",
              borderRadius: 20,
              border: "1px solid rgba(74,222,128,0.3)",
              background: "rgba(74,222,128,0.08)",
              color: "rgba(74,222,128,0.75)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "default",
              flexShrink: 0,
            }}
          >
            Owned
          </button>
        ) : isUpcoming ? (
          <button
            type="button"
            disabled
            style={{
              padding: "8px 16px",
              borderRadius: 20,
              border: "1px solid rgba(251,191,36,0.3)",
              background: "rgba(251,191,36,0.06)",
              color: "rgba(251,191,36,0.65)",
              fontSize: 11,
              fontWeight: 600,
              cursor: "not-allowed",
              flexShrink: 0,
              fontFamily: "monospace",
              letterSpacing: "0.02em",
            }}
          >
            {countdown}
          </button>
        ) : (
          <motion.button
            type="button"
            onClick={onBuy}
            whileTap={{ scale: 0.96 }}
            data-ocid={`releases.item.${index + 1}.primary_button`}
            style={{
              padding: "8px 20px",
              borderRadius: 20,
              border: "none",
              background: "#7C3AED",
              color: "white",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 0 14px rgba(124,58,237,0.45)",
              flexShrink: 0,
              letterSpacing: "0.02em",
            }}
          >
            Mint NFT
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
interface ReleasesPageProps {
  onAlbumClick?: (albumId: string) => void;
}

export function ReleasesPage({
  onAlbumClick: _onAlbumClick,
}: ReleasesPageProps) {
  const { allAlbums } = useMockData();
  const { ownedAlbumIds, walletAddress } = useWalletContext();
  const { theme } = useTheme();
  const isLight = theme === "light";

  const [activeCategory, setActiveCategory] = useState("All");

  const [likesMap, setLikesMap] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    for (const s of allAlbums) map[s.id] = s.likes;
    return map;
  });
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [commentsMap, setCommentsMap] = useState<Record<string, SongComment[]>>(
    () => {
      const map: Record<string, SongComment[]> = {};
      for (const s of allAlbums) map[s.id] = [...s.comments];
      return map;
    },
  );
  const [mintedMap, setMintedMap] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    for (const s of allAlbums) map[s.id] = s.minted;
    return map;
  });
  const [openCommentsId, setOpenCommentsId] = useState<string | null>(null);
  const [mintModalAlbumId, setMintModalAlbumId] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    const likeTimer = setInterval(() => {
      const liveSongs = allAlbums.filter(
        (s) => !s.isSoldOut && s.mintOpensInMs === 0,
      );
      if (!liveSongs.length) return;
      const pick = liveSongs[Math.floor(Math.random() * liveSongs.length)];
      setLikesMap((prev) => ({ ...prev, [pick.id]: (prev[pick.id] ?? 0) + 1 }));
    }, 8000);

    const mintTimer = setInterval(() => {
      const liveSongs = allAlbums.filter(
        (s) => !s.isSoldOut && s.mintOpensInMs === 0,
      );
      if (!liveSongs.length) return;
      const pick = liveSongs[Math.floor(Math.random() * liveSongs.length)];
      setMintedMap((prev) => {
        const current = prev[pick.id] ?? pick.minted;
        if (current >= pick.supply) return prev;
        return { ...prev, [pick.id]: current + 1 };
      });
    }, 12000);

    return () => {
      clearInterval(likeTimer);
      clearInterval(mintTimer);
    };
  }, [allAlbums]);

  const playTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (playTimerRef.current) clearTimeout(playTimerRef.current);
    if (playingId) {
      playTimerRef.current = setTimeout(() => setPlayingId(null), 30000);
    }
    return () => {
      if (playTimerRef.current) clearTimeout(playTimerRef.current);
    };
  }, [playingId]);

  function handleToggleLike(id: string) {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        setLikesMap((m) => ({ ...m, [id]: Math.max(0, (m[id] ?? 0) - 1) }));
      } else {
        next.add(id);
        setLikesMap((m) => ({ ...m, [id]: (m[id] ?? 0) + 1 }));
      }
      return next;
    });
  }

  function handleAddComment(songId: string, text: string) {
    const newComment: SongComment = {
      id: `user_${Date.now()}`,
      walletAddress: walletAddress
        ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-3)}`
        : "Guest",
      text,
      timestamp: Date.now(),
    };
    setCommentsMap((prev) => ({
      ...prev,
      [songId]: [...(prev[songId] ?? []), newComment],
    }));
  }

  const openCommentsSong = openCommentsId
    ? allAlbums.find((s) => s.id === openCommentsId)
    : null;
  const filteredSongs = filterSongs(allAlbums, activeCategory);
  const pageBg = isLight ? "#F8F9FC" : "#0A0A0F";

  return (
    <>
      <style>{`
        @keyframes liveDot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.25; }
        }
        .feed-tabs-scroll::-webkit-scrollbar { display: none; }
        .feed-tabs-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div
        style={{ background: pageBg, minHeight: "100%", paddingBottom: 120 }}
      >
        {/* ── Category tabs ── */}
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            background: isLight
              ? "rgba(248,249,252,0.92)"
              : "rgba(10,10,15,0.92)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderBottom: isLight
              ? "1px solid #E8ECF3"
              : "1px solid rgba(255,255,255,0.07)",
            paddingTop: 10,
            paddingBottom: 10,
          }}
        >
          <div
            className="feed-tabs-scroll"
            style={{
              display: "flex",
              gap: 8,
              overflowX: "auto",
              paddingLeft: 14,
              paddingRight: 14,
            }}
          >
            {CATEGORIES.map((cat) => {
              const active = cat === activeCategory;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  data-ocid="releases.tab"
                  style={{
                    flexShrink: 0,
                    padding: "6px 14px",
                    borderRadius: 20,
                    fontSize: 13,
                    fontWeight: active ? 600 : 400,
                    color: active
                      ? "white"
                      : isLight
                        ? "#5B6475"
                        : "rgba(255,255,255,0.5)",
                    background: active ? "#7C3AED" : "transparent",
                    border: active
                      ? "1px solid #7C3AED"
                      : isLight
                        ? "1px solid #E8ECF3"
                        : "1px solid rgba(255,255,255,0.1)",
                    cursor: "pointer",
                    transition: "all 0.18s ease",
                    boxShadow: active
                      ? "0 0 10px rgba(124,58,237,0.35)"
                      : "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Feed ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            padding: "16px 14px 0",
          }}
        >
          {filteredSongs.length === 0 ? (
            <div
              data-ocid="releases.empty_state"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "60px 20px",
                color: isLight ? "#8A94A6" : "rgba(255,255,255,0.3)",
                fontSize: 14,
                textAlign: "center",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 32, marginBottom: 4 }}>🎵</span>
              <p style={{ fontWeight: 600 }}>No releases in this category</p>
              <p style={{ fontSize: 12, opacity: 0.7 }}>
                Check back soon for new drops
              </p>
            </div>
          ) : (
            filteredSongs.map((song, i) => (
              <ReleaseFeedCard
                key={song.id}
                song={song}
                index={i}
                likes={likesMap[song.id] ?? song.likes}
                isLiked={likedIds.has(song.id)}
                comments={commentsMap[song.id] ?? song.comments}
                minted={mintedMap[song.id] ?? song.minted}
                isOwned={ownedAlbumIds.includes(song.id)}
                isPlaying={playingId === song.id}
                isLight={isLight}
                onToggleLike={() => handleToggleLike(song.id)}
                onOpenComments={() => setOpenCommentsId(song.id)}
                onBuy={() => setMintModalAlbumId(song.id)}
                onTogglePlay={() =>
                  setPlayingId((prev) => (prev === song.id ? null : song.id))
                }
              />
            ))
          )}
        </div>
      </div>

      {mintModalAlbumId && (
        <MintModal
          albumId={mintModalAlbumId}
          onClose={() => setMintModalAlbumId(null)}
        />
      )}

      <AnimatePresence>
        {openCommentsId && openCommentsSong && (
          <CommentsModal
            key={openCommentsId}
            songId={openCommentsId}
            comments={commentsMap[openCommentsId] ?? []}
            onClose={() => setOpenCommentsId(null)}
            onAddComment={handleAddComment}
          />
        )}
      </AnimatePresence>
    </>
  );
}
