import { Heart, MessageCircle, Pause, Play } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "../ThemeContext";
import { AnimatedCover } from "../components/AnimatedCover";
import { CommentsModal } from "../components/CommentsModal";
import { EchoSolIcon } from "../components/EchoSolIcon";
import { MintModal } from "../components/MintModal";
import { useWalletContext } from "../context/WalletContext";
import { useSolPriceContext } from "../contexts/SolPriceContext";
import type { SONGS, SongComment } from "../data/songs";
import { useMockData } from "../hooks/useMockData";
import { formatUSD } from "../utils/formatUSD";

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

interface LineupRowProps {
  song: (typeof SONGS)[0];
  index: number;
  likes: number;
  isLiked: boolean;
  comments: SongComment[];
  minted: number;
  isOwned: boolean;
  isPlaying: boolean;
  isExpanded: boolean;
  isLight: boolean;
  onToggleLike: () => void;
  onOpenComments: () => void;
  onBuy: () => void;
  onTogglePlay: () => void;
  onToggleExpand: () => void;
}

function MintPriceDisplay({ sol }: { sol: number }) {
  const { solPrice } = useSolPriceContext();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <EchoSolIcon size={13} />
        <span
          className="font-mono"
          style={{
            fontSize: 12,
            color: "var(--echo-text-secondary)",
            marginLeft: 2,
          }}
        >
          {sol} SOL
        </span>
      </div>
      <span
        className="font-mono"
        style={{
          fontSize: 10,
          color: "var(--echo-text-dark)",
          opacity: 0.65,
          marginLeft: 19,
        }}
      >
        {formatUSD(sol * solPrice)}
      </span>
    </div>
  );
}

function LineupRow({
  song,
  index,
  likes,
  isLiked,
  comments,
  minted,
  isOwned,
  isPlaying,
  isExpanded,
  isLight,
  onToggleLike,
  onOpenComments,
  onBuy,
  onTogglePlay,
  onToggleExpand,
}: LineupRowProps) {
  const countdown = useCountdown(
    song.mintOpensInMs !== 0 && song.mintOpensInMs !== null
      ? song.mintOpensInMs
      : null,
  );

  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPlaying) {
      setProgress(0);
      timerRef.current = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            clearInterval(timerRef.current!);
            return 100;
          }
          return p + 100 / 30;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setProgress(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  const isUpcoming =
    song.mintOpensInMs !== null &&
    song.mintOpensInMs !== 0 &&
    song.mintOpensInMs > 0;
  const isSoldOut = song.isSoldOut;
  const isLive = !isUpcoming && !isSoldOut;

  // Light/dark conditional values
  const rowBorderBottom = isLight
    ? "1px solid #E6EAF2"
    : "1px solid rgba(255,255,255,0.055)";
  const rowHoverBg = isLight
    ? "rgba(124,58,237,0.03)"
    : "rgba(255,255,255,0.02)";
  const titleColor = isLight ? "#0F172A" : "white";
  const dropsInLabel = isLight ? "#B45309" : "rgba(251,191,36,0.6)";
  const dropsInTimer = isLight ? "#D97706" : "rgba(251,191,36,0.4)";
  const liveNowColor = isLight ? "#16A34A" : "rgba(74,222,128,0.7)";
  const mintedColor = isLight
    ? "var(--echo-text-secondary)"
    : "var(--echo-text-muted)";
  const soldOutColor = isLight ? "#7C8596" : "var(--echo-text-dark)";
  const progressTrackBg = isLight ? "#E6EAF2" : "rgba(255,255,255,0.07)";
  const playBtnBorder = isLight ? "#E6EAF2" : "rgba(255,255,255,0.12)";
  const playBtnBg = isPlaying
    ? isLight
      ? "rgba(124,58,237,0.15)"
      : "rgba(124,58,237,0.2)"
    : isLight
      ? "rgba(0,0,0,0.04)"
      : "rgba(255,255,255,0.04)";
  const playIconColor = isLight ? "#5B6475" : "var(--echo-text-dim)";
  const previewLabelColor = isLight ? "#7C8596" : "var(--echo-text-dark)";
  const socialIconColor = isLight ? "#7C8596" : "var(--echo-text-dark)";
  const socialCountColor = isLight ? "#7C8596" : "var(--echo-text-muted)";
  const opensInColor = isLight ? "#B45309" : "rgba(251,191,36,0.4)";
  const ownedBorder = isLight ? "rgba(124,58,237,0.3)" : "rgba(124,58,237,0.2)";
  const ownedText = isLight ? "rgba(109,40,217,0.7)" : "rgba(167,139,250,0.5)";

  // Expanded card tint
  const expandedCardBg = isLight
    ? "rgba(124,58,237,0.03)"
    : "rgba(124,58,237,0.04)";
  const expandedBorderColor = isLight
    ? "rgba(124,58,237,0.12)"
    : "rgba(124,58,237,0.18)";

  // Artwork glow when expanded
  const artworkGlow = isExpanded
    ? "0 0 18px 4px rgba(124,58,237,0.35), 0 0 8px 2px rgba(124,58,237,0.2)"
    : "none";
  const artworkSize = isExpanded ? 112 : 48;
  const artworkRadius = isExpanded ? 7 : 2;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        layout: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
        opacity: { duration: 0.4, delay: index * 0.05 },
        y: { duration: 0.4, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] },
      }}
      data-ocid={`releases.item.${index + 1}`}
      style={{
        borderBottom: isExpanded ? "none" : rowBorderBottom,
        backgroundColor: isExpanded ? expandedCardBg : "transparent",
        borderRadius: isExpanded ? 6 : 0,
        margin: isExpanded ? "4px 8px" : 0,
        border: isExpanded ? `1px solid ${expandedBorderColor}` : "none",
        overflow: "hidden",
        transition:
          "background-color 0.3s ease, border-color 0.3s ease, margin 0.3s ease",
      }}
    >
      {/* Main row — tap to expand/collapse */}
      <button
        type="button"
        onClick={onToggleExpand}
        className="w-full text-left"
        style={{
          display: "block",
          transition: "background 0.15s",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: 0,
        }}
        onMouseEnter={(e) => {
          if (!isExpanded)
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              rowHoverBg;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor =
            "transparent";
        }}
      >
        <div
          className="flex items-start px-4"
          style={{
            paddingTop: isExpanded ? 14 : 12,
            paddingBottom: isExpanded ? 14 : 12,
            gap: 14,
          }}
        >
          {/* Artwork — scales smoothly on expand */}
          <motion.div
            layout
            className="flex-shrink-0 overflow-hidden relative"
            style={{
              width: artworkSize,
              height: artworkSize,
              borderRadius: artworkRadius,
              opacity: isSoldOut ? 0.35 : 1,
              boxShadow: artworkGlow,
              transition: "box-shadow 0.35s ease, border-radius 0.35s ease",
              flexShrink: 0,
            }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <AnimatedCover
              coverImage={song.artworkSrc}
              coverMotion={song.coverMotion}
              motionEnabled={song.motionEnabled}
              animate={isExpanded}
              alt={song.title}
              style={{ width: "100%", height: "100%", display: "block" }}
            />
            {isPlaying && (
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  backgroundColor: "rgba(0,0,0,0.4)",
                  borderRadius: artworkRadius,
                }}
              >
                <span
                  className="block rounded-full"
                  style={{
                    width: 6,
                    height: 6,
                    backgroundColor: "#a78bfa",
                    animation: "ping 1s cubic-bezier(0,0,0.2,1) infinite",
                  }}
                />
              </div>
            )}
          </motion.div>

          {/* Title + Artist + Status */}
          <div
            className="flex-1 min-w-0"
            style={{
              paddingRight: 4,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              minHeight: isExpanded ? 112 : undefined,
            }}
          >
            <p
              className="leading-snug"
              style={{
                fontSize: isExpanded ? 15 : 14,
                fontWeight: 600,
                letterSpacing: "0.01em",
                color: titleColor,
                marginBottom: 3,
                transition: "font-size 0.25s ease",
                wordBreak: "break-word",
              }}
            >
              {song.title}
            </p>
            <p
              style={{
                fontSize: 11,
                color: isLight ? "#5B6475" : "var(--echo-text-muted)",
                marginBottom: isExpanded ? 10 : 0,
              }}
            >
              {song.artist}
            </p>

            {/* Status badge — always visible in the title column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {isUpcoming && (
                <>
                  <span
                    className="font-mono uppercase"
                    style={{
                      fontSize: 8,
                      letterSpacing: "0.18em",
                      color: dropsInLabel,
                    }}
                  >
                    DROPS IN
                  </span>
                  <span
                    className="font-mono"
                    style={{
                      fontSize: isExpanded ? 13 : 11,
                      color: dropsInTimer,
                      letterSpacing: "0.06em",
                      transition: "font-size 0.25s ease",
                    }}
                  >
                    {countdown}
                  </span>
                </>
              )}
              {isLive && (
                <>
                  <span
                    className="font-mono uppercase flex items-center"
                    style={{
                      fontSize: 8,
                      letterSpacing: "0.18em",
                      color: liveNowColor,
                      gap: 3,
                    }}
                  >
                    LIVE NOW
                    <span
                      style={{
                        display: "inline-block",
                        animation: "livePulse 1.4s ease-in-out infinite",
                      }}
                    >
                      ●
                    </span>
                  </span>
                  <span
                    className="font-mono"
                    style={{
                      fontSize: 10,
                      color: mintedColor,
                      letterSpacing: "0.03em",
                    }}
                  >
                    {minted} / {song.supply} minted
                  </span>
                </>
              )}
              {isSoldOut && (
                <span
                  className="font-mono uppercase"
                  style={{
                    fontSize: 8,
                    letterSpacing: "0.18em",
                    color: soldOutColor,
                  }}
                >
                  SOLD OUT
                </span>
              )}
            </div>
          </div>
        </div>
      </button>

      {/* Expanded details — fade in below the artwork row */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            key="expand"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{
              padding: "0 16px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {/* Thin divider */}
            <div
              style={{
                height: 1,
                backgroundColor: isLight
                  ? "rgba(124,58,237,0.1)"
                  : "rgba(124,58,237,0.15)",
                marginBottom: 2,
              }}
            />

            {/* Preview row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25, delay: 0.08 }}
              style={{ display: "flex", alignItems: "center", gap: 12 }}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePlay();
                }}
                data-ocid={`releases.item.${index + 1}.toggle`}
                disabled={isSoldOut}
                style={{
                  flexShrink: 0,
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  border: `1px solid ${playBtnBorder}`,
                  backgroundColor: playBtnBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: isSoldOut ? "not-allowed" : "pointer",
                  opacity: isSoldOut ? 0.3 : 1,
                  transition: "background 0.15s, transform 0.15s",
                  transform: isPlaying ? "scale(0.95)" : "scale(1)",
                }}
              >
                {isPlaying ? (
                  <Pause
                    size={12}
                    color={isLight ? "#0F172A" : "white"}
                    fill={isLight ? "#0F172A" : "white"}
                  />
                ) : (
                  <Play
                    size={12}
                    color={playIconColor}
                    fill={playIconColor}
                    style={{ marginLeft: 1 }}
                  />
                )}
              </button>

              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 5,
                }}
              >
                <span
                  className="font-mono uppercase"
                  style={{
                    fontSize: 9,
                    color: previewLabelColor,
                    letterSpacing: "0.12em",
                  }}
                >
                  30S PREVIEW
                </span>
                <div
                  style={{
                    height: 2,
                    borderRadius: 1,
                    backgroundColor: progressTrackBg,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${progress}%`,
                      background: "linear-gradient(90deg,#7C3AED,#a78bfa)",
                      boxShadow: "0 0 6px rgba(124,58,237,0.5)",
                      transition: "width 1s linear",
                    }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Social row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25, delay: 0.13 }}
              style={{ display: "flex", alignItems: "center", gap: 20 }}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleLike();
                }}
                data-ocid={`releases.item.${index + 1}.toggle`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                <Heart
                  size={14}
                  color={isLiked ? "#f472b6" : socialIconColor}
                  fill={isLiked ? "#f472b6" : "none"}
                />
                <span style={{ fontSize: 12, color: socialCountColor }}>
                  {likes}
                </span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenComments();
                }}
                data-ocid={`releases.item.${index + 1}.button`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                <MessageCircle size={14} color={socialIconColor} />
                <span style={{ fontSize: 12, color: socialCountColor }}>
                  {comments.length}
                </span>
              </button>
            </motion.div>

            {/* Price + action row */}
            {!isSoldOut && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25, delay: 0.18 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <MintPriceDisplay sol={song.mintPrice} />

                {isOwned ? (
                  <span
                    className="font-mono uppercase"
                    style={{
                      fontSize: 9,
                      letterSpacing: "0.1em",
                      color: ownedText,
                      border: `1px solid ${ownedBorder}`,
                      padding: "3px 10px",
                      borderRadius: 2,
                    }}
                  >
                    OWNED
                  </span>
                ) : isUpcoming ? (
                  <span
                    className="font-mono uppercase"
                    style={{
                      fontSize: 9,
                      letterSpacing: "0.06em",
                      color: opensInColor,
                    }}
                  >
                    OPENS IN {countdown}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onBuy();
                    }}
                    data-ocid={`releases.item.${index + 1}.primary_button`}
                    className="font-mono uppercase"
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                      backgroundColor: "#7C3AED",
                      color: "white",
                      padding: "7px 20px",
                      borderRadius: 2,
                      border: "none",
                      cursor: "pointer",
                      boxShadow: "0 0 14px rgba(124,58,237,0.4)",
                    }}
                  >
                    MINT
                  </button>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

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
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Simulate live updates
  useEffect(() => {
    const likeTimer = setInterval(() => {
      const liveSongs = allAlbums.filter(
        (s) => !s.isSoldOut && s.mintOpensInMs === 0,
      );
      if (liveSongs.length === 0) return;
      const pick = liveSongs[Math.floor(Math.random() * liveSongs.length)];
      setLikesMap((prev) => ({ ...prev, [pick.id]: (prev[pick.id] ?? 0) + 1 }));
    }, 8000);

    const mintTimer = setInterval(() => {
      const liveSongs = allAlbums.filter(
        (s) => !s.isSoldOut && s.mintOpensInMs === 0,
      );
      if (liveSongs.length === 0) return;
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

  // Auto-stop after 30s
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

  function handleTogglePlay(id: string) {
    setPlayingId((prev) => (prev === id ? null : id));
  }

  function handleToggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  const openCommentsSong = openCommentsId
    ? allAlbums.find((s) => s.id === openCommentsId)
    : null;

  // Pad drop count to 2 digits
  const dropCount = String(allAlbums.length).padStart(2, "0");

  const headerDividerColor = isLight ? "#E6EAF2" : "rgba(255,255,255,0.07)";
  const dropCountColor = isLight ? "#7C8596" : "var(--echo-text-dark)";

  return (
    <>
      <style>{`
        @keyframes livePulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>

      <div
        className="pb-24"
        style={
          isLight
            ? { backgroundColor: "#F8F9FC", minHeight: "100%" }
            : undefined
        }
      >
        {/* Editorial page header */}
        <div
          style={{
            padding: "20px 16px 0",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              paddingBottom: 12,
            }}
          >
            <span
              className="font-mono uppercase"
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.22em",
                color: "var(--echo-text-secondary)",
              }}
            >
              LINEUP
            </span>
            <span
              className="font-mono"
              style={{
                fontSize: 10,
                color: dropCountColor,
                letterSpacing: "0.08em",
              }}
            >
              {dropCount} DROPS
            </span>
          </div>
          <div
            style={{
              height: 1,
              backgroundColor: headerDividerColor,
            }}
          />
        </div>

        {/* Lineup rows */}
        <div style={{ paddingTop: 4 }}>
          {allAlbums.map((song, i) => (
            <LineupRow
              key={song.id}
              song={song}
              index={i}
              likes={likesMap[song.id] ?? song.likes}
              isLiked={likedIds.has(song.id)}
              comments={commentsMap[song.id] ?? song.comments}
              minted={mintedMap[song.id] ?? song.minted}
              isOwned={ownedAlbumIds.includes(song.id)}
              isPlaying={playingId === song.id}
              isExpanded={expandedId === song.id}
              isLight={isLight}
              onToggleLike={() => handleToggleLike(song.id)}
              onOpenComments={() => setOpenCommentsId(song.id)}
              onBuy={() => setMintModalAlbumId(song.id)}
              onTogglePlay={() => handleTogglePlay(song.id)}
              onToggleExpand={() => handleToggleExpand(song.id)}
            />
          ))}
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
