import { Heart, MessageCircle, Pause, Play } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { CommentsModal } from "../components/CommentsModal";
import { EchoSolIcon } from "../components/EchoSolIcon";
import { MintModal } from "../components/MintModal";
import { useWalletContext } from "../context/WalletContext";
import type { SONGS, SongComment } from "../data/songs";
import { useMockData } from "../hooks/useMockData";

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
  onToggleLike: () => void;
  onOpenComments: () => void;
  onBuy: () => void;
  onTogglePlay: () => void;
  onToggleExpand: () => void;
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        ease: [0.22, 1, 0.36, 1],
      }}
      data-ocid={`releases.item.${index + 1}`}
    >
      {/* Collapsed Row */}
      <button
        type="button"
        onClick={onToggleExpand}
        className="w-full text-left transition-colors"
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div
          className="flex items-center gap-3 px-4"
          style={{ minHeight: 76, paddingTop: 10, paddingBottom: 10 }}
        >
          {/* Artwork thumbnail */}
          <div
            className="flex-shrink-0 overflow-hidden relative"
            style={{
              width: 56,
              height: 56,
              borderRadius: 4,
              opacity: isSoldOut ? 0.45 : 1,
            }}
          >
            <img
              src={song.artworkSrc}
              alt={song.title}
              className="w-full h-full object-cover"
            />
            {isPlaying && (
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
              >
                <div className="w-1 h-1 rounded-full bg-violet-400 animate-ping" />
              </div>
            )}
          </div>

          {/* Title + Artist */}
          <div className="flex-1 min-w-0">
            <p
              className="text-white leading-tight truncate"
              style={{ fontSize: 14, fontWeight: 600, letterSpacing: "0.01em" }}
            >
              {song.title}
            </p>
            <p
              className="truncate mt-0.5"
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.38)",
                letterSpacing: "0.01em",
              }}
            >
              {song.artist}
            </p>
          </div>

          {/* Status */}
          <div className="flex-shrink-0 flex flex-col items-end gap-0.5">
            {isUpcoming && (
              <>
                <span
                  className="font-mono uppercase"
                  style={{
                    fontSize: 9,
                    letterSpacing: "0.14em",
                    color: "#FBBF24",
                    opacity: 0.85,
                  }}
                >
                  Upcoming
                </span>
                <span
                  className="font-mono"
                  style={{
                    fontSize: 10,
                    color: "rgba(251,191,36,0.55)",
                    letterSpacing: "0.04em",
                  }}
                >
                  {countdown}
                </span>
              </>
            )}
            {isLive && (
              <>
                <div className="flex items-center gap-1">
                  <span
                    className="rounded-full"
                    style={{
                      width: 5,
                      height: 5,
                      backgroundColor: "#4ADE80",
                      boxShadow: "0 0 5px rgba(74,222,128,0.7)",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    className="font-mono uppercase"
                    style={{
                      fontSize: 9,
                      letterSpacing: "0.14em",
                      color: "rgba(74,222,128,0.75)",
                    }}
                  >
                    Live
                  </span>
                </div>
                <span
                  className="font-mono"
                  style={{
                    fontSize: 10,
                    color: "rgba(255,255,255,0.3)",
                    letterSpacing: "0.02em",
                  }}
                >
                  {minted} / {song.supply}
                </span>
              </>
            )}
            {isSoldOut && (
              <span
                className="font-mono uppercase"
                style={{
                  fontSize: 9,
                  letterSpacing: "0.14em",
                  color: "rgba(255,100,100,0.55)",
                }}
              >
                Sold Out
              </span>
            )}
          </div>
        </div>
      </button>

      {/* Expanded Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            key="expand"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div
              className="px-4 py-4 flex flex-col gap-3"
              style={{
                backgroundColor: "rgba(255,255,255,0.025)",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {/* Preview row */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTogglePlay();
                  }}
                  data-ocid={`releases.item.${index + 1}.toggle`}
                  disabled={isSoldOut}
                  className="flex-shrink-0 flex items-center justify-center rounded-full transition-opacity disabled:opacity-30"
                  style={{
                    width: 32,
                    height: 32,
                    border: "1px solid rgba(255,255,255,0.14)",
                    backgroundColor: isPlaying
                      ? "rgba(124,58,237,0.3)"
                      : "rgba(255,255,255,0.06)",
                  }}
                >
                  {isPlaying ? (
                    <Pause size={12} className="text-white" fill="white" />
                  ) : (
                    <Play
                      size={12}
                      className="text-white/80"
                      fill="currentColor"
                      style={{ marginLeft: 1 }}
                    />
                  )}
                </button>

                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span
                      className="font-mono"
                      style={{
                        fontSize: 10,
                        color: "rgba(255,255,255,0.3)",
                        letterSpacing: "0.06em",
                      }}
                    >
                      30s preview
                    </span>
                    {isPlaying && (
                      <span
                        className="font-mono"
                        style={{
                          fontSize: 10,
                          color: "rgba(124,58,237,0.7)",
                          letterSpacing: "0.04em",
                        }}
                      >
                        playing
                      </span>
                    )}
                  </div>
                  <div
                    className="w-full rounded-full overflow-hidden"
                    style={{
                      height: 2,
                      backgroundColor: "rgba(255,255,255,0.08)",
                    }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${progress}%`,
                        background: "linear-gradient(90deg, #7C3AED, #a78bfa)",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Social row */}
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleLike();
                  }}
                  data-ocid={`releases.item.${index + 1}.toggle`}
                  className="flex items-center gap-1.5 transition-transform active:scale-90"
                >
                  <Heart
                    size={14}
                    className={isLiked ? "text-pink-400" : "text-white/30"}
                    fill={isLiked ? "currentColor" : "none"}
                  />
                  <span
                    style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}
                  >
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
                  className="flex items-center gap-1.5 transition-transform active:scale-90"
                >
                  <MessageCircle size={14} className="text-white/30" />
                  <span
                    style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}
                  >
                    {comments.length}
                  </span>
                </button>
              </div>

              {/* Mint row */}
              {!isSoldOut && (
                <div
                  className="flex items-center justify-between pt-1"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <div className="flex items-center">
                    <EchoSolIcon size={14} />
                    <span
                      className="font-mono"
                      style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}
                    >
                      {song.mintPrice} SOL
                    </span>
                  </div>

                  {isOwned ? (
                    <span
                      className="font-mono uppercase"
                      style={{
                        fontSize: 9,
                        letterSpacing: "0.14em",
                        color: "rgba(167,139,250,0.6)",
                        border: "1px solid rgba(124,58,237,0.2)",
                        padding: "3px 8px",
                        borderRadius: 3,
                      }}
                    >
                      Owned
                    </span>
                  ) : isUpcoming ? (
                    <button
                      type="button"
                      disabled
                      className="font-mono cursor-not-allowed"
                      style={{
                        fontSize: 10,
                        letterSpacing: "0.04em",
                        color: "rgba(251,191,36,0.45)",
                        border: "1px solid rgba(251,191,36,0.15)",
                        padding: "4px 10px",
                        borderRadius: 4,
                        backgroundColor: "transparent",
                      }}
                    >
                      Opens in {countdown}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onBuy();
                      }}
                      data-ocid={`releases.item.${index + 1}.primary_button`}
                      className="font-medium text-white transition-opacity hover:opacity-90 active:opacity-75"
                      style={{
                        fontSize: 12,
                        letterSpacing: "0.04em",
                        backgroundColor: "#7C3AED",
                        padding: "6px 16px",
                        borderRadius: 4,
                      }}
                    >
                      Mint
                    </button>
                  )}
                </div>
              )}
            </div>
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

  return (
    <>
      <div className="pb-24 pt-2">
        {/* Page header */}
        <div className="px-4 pt-4 pb-5">
          <p
            className="uppercase tracking-widest font-mono"
            style={{
              fontSize: 10,
              letterSpacing: "0.22em",
              color: "rgba(255,255,255,0.22)",
            }}
          >
            Lineup
          </p>
          <div
            className="mt-2"
            style={{ height: 1, backgroundColor: "rgba(255,255,255,0.06)" }}
          />
          <p
            className="mt-2"
            style={{ fontSize: 10, color: "rgba(255,255,255,0.16)" }}
          >
            {allAlbums.length} drop{allAlbums.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Lineup rows */}
        <div>
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
