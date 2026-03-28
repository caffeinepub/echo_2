import { Heart, MessageCircle, Pause, Play } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { CommentsModal } from "../components/CommentsModal";
import { MintModal } from "../components/MintModal";
import { SolSymbol } from "../components/SolSymbol";
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

interface SongFeedCardProps {
  song: (typeof SONGS)[0];
  index: number;
  likes: number;
  isLiked: boolean;
  comments: SongComment[];
  minted: number;
  isOwned: boolean;
  isPlaying: boolean;
  onToggleLike: () => void;
  onOpenComments: () => void;
  onBuy: () => void;
  onTogglePlay: () => void;
}

function SongFeedCard({
  song,
  index,
  likes,
  isLiked,
  comments,
  minted,
  isOwned,
  isPlaying,
  onToggleLike,
  onOpenComments,
  onBuy,
  onTogglePlay,
}: SongFeedCardProps) {
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

  const mintPercent = song.supply > 0 ? (minted / song.supply) * 100 : 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay: index * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
      data-ocid={`releases.item.${index + 1}`}
    >
      {/* Artwork — full width, edge-to-edge */}
      <div className="relative w-full aspect-square overflow-hidden">
        <img
          src={song.artworkSrc}
          alt={song.title}
          className="w-full h-full object-cover"
          style={{
            transform: isPlaying ? "scale(1.03)" : "scale(1)",
            transition: "transform 0.8s ease",
          }}
        />

        {/* Overlay for sold-out */}
        {isSoldOut && (
          <>
            <div className="absolute inset-0 bg-black/40" />
            <span
              className="absolute top-4 left-4 text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 rounded-sm"
              style={{
                border: "1px solid rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.45)",
                backgroundColor: "rgba(0,0,0,0.5)",
              }}
            >
              Sold Out
            </span>
          </>
        )}

        {/* Overlay for upcoming */}
        {isUpcoming && (
          <>
            <div className="absolute inset-0 bg-black/30" />
            <div
              className="absolute top-4 left-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{
                backgroundColor: "rgba(0,0,0,0.6)",
                border: "1px solid rgba(251, 191, 36, 0.25)",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400/70" />
              <span className="text-[10px] font-mono text-amber-400/80 tracking-wide">
                Upcoming
              </span>
            </div>
          </>
        )}

        {/* Live indicator */}
        {isLive && (
          <div className="absolute top-4 right-4 flex items-center gap-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full bg-green-400/70"
              style={{ boxShadow: "0 0 6px rgba(74,222,128,0.6)" }}
            />
          </div>
        )}

        {/* Play button on artwork */}
        {!isSoldOut && (
          <button
            type="button"
            onClick={onTogglePlay}
            data-ocid={`releases.item.${index + 1}.toggle`}
            className="absolute bottom-4 right-4 flex items-center justify-center rounded-full transition-all"
            style={{
              width: 44,
              height: 44,
              backgroundColor: "rgba(0,0,0,0.65)",
              border: "1px solid rgba(255,255,255,0.18)",
              backdropFilter: "blur(8px)",
              boxShadow: isPlaying ? "0 0 20px rgba(124,58,237,0.5)" : "none",
            }}
          >
            {isPlaying ? (
              <Pause size={16} className="text-white" fill="white" />
            ) : (
              <Play
                size={16}
                className="text-white"
                fill="white"
                style={{ marginLeft: 2 }}
              />
            )}
          </button>
        )}

        {/* Pulse ring when playing */}
        {isPlaying && (
          <div
            className="absolute bottom-4 right-4 rounded-full pointer-events-none"
            style={{
              width: 44,
              height: 44,
              animation: "feed-pulse 2s ease-out infinite",
              border: "1.5px solid rgba(124,58,237,0.5)",
            }}
          />
        )}
      </div>

      {/* Song info */}
      <div className="px-4 pt-3">
        <p className="text-lg font-semibold text-white leading-snug">
          {song.title}
        </p>
        <p className="text-sm text-white/50 mt-0.5">{song.artist}</p>
      </div>

      {/* Preview progress bar */}
      <div className="px-4 pt-3 flex items-center gap-3">
        <span className="text-[11px] text-white/30 font-mono">30s preview</span>
        <div
          className="flex-1 rounded-full overflow-hidden"
          style={{ height: 2, backgroundColor: "rgba(255,255,255,0.1)" }}
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

      {/* Action row */}
      <div className="px-4 pt-3 flex items-center gap-5">
        <button
          type="button"
          onClick={onToggleLike}
          data-ocid={`releases.item.${index + 1}.toggle`}
          className="flex items-center gap-1.5 transition-transform active:scale-90"
        >
          <Heart
            size={20}
            className={isLiked ? "text-pink-400" : "text-white/40"}
            fill={isLiked ? "currentColor" : "none"}
          />
          <span className="text-sm text-white/50">{likes}</span>
        </button>

        <button
          type="button"
          onClick={onOpenComments}
          data-ocid={`releases.item.${index + 1}.button`}
          className="flex items-center gap-1.5 transition-transform active:scale-90"
        >
          <MessageCircle size={20} className="text-white/40" />
          <span className="text-sm text-white/50">{comments.length}</span>
        </button>
      </div>

      {/* Mint info */}
      <div className="px-4 pt-2 pb-1">
        {isUpcoming ? (
          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] font-mono text-amber-400/80">
              Mint opens in {countdown}
            </span>
            <button
              type="button"
              disabled
              className="mt-1 w-full py-2.5 rounded-xl text-sm font-medium text-white/30 cursor-not-allowed"
              style={{
                backgroundColor: "rgba(124,58,237,0.2)",
                border: "1px solid rgba(124,58,237,0.15)",
              }}
            >
              <span className="flex items-center justify-center gap-2">
                <SolSymbol />
                {song.mintPrice} SOL
              </span>
            </button>
          </div>
        ) : isSoldOut ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="text-[11px] font-mono tracking-widest uppercase px-2 py-0.5 rounded-sm"
                style={{
                  border: "1px solid rgba(255,100,100,0.2)",
                  color: "rgba(255,120,120,0.5)",
                }}
              >
                Sold Out
              </span>
              <span className="text-[12px] text-white/25 font-mono">
                {song.supply} / {song.supply} minted
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {/* Supply row */}
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-white/40 font-mono">
                {minted} / {song.supply} minted
              </span>
              {isOwned && (
                <span
                  className="text-[10px] font-mono tracking-widest uppercase px-1.5 py-0.5 rounded-sm"
                  style={{
                    border: "1px solid rgba(124,58,237,0.3)",
                    color: "rgba(167,139,250,0.7)",
                  }}
                >
                  Owned
                </span>
              )}
            </div>
            {/* Progress bar */}
            <div
              className="w-full rounded-full overflow-hidden"
              style={{ height: 2, backgroundColor: "rgba(255,255,255,0.08)" }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${mintPercent}%`,
                  background:
                    "linear-gradient(90deg, rgba(124,58,237,0.8), rgba(167,139,250,0.5))",
                }}
              />
            </div>
            {/* Price + buy */}
            <div className="flex items-center gap-3 mt-0.5">
              <span className="flex items-center gap-1 text-sm text-white/70 font-mono">
                <SolSymbol />
                {song.mintPrice}
              </span>
              {isOwned ? (
                <button
                  type="button"
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white/50 border"
                  style={{ borderColor: "rgba(255,255,255,0.1)" }}
                >
                  Play Song
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onBuy}
                  data-ocid={`releases.item.${index + 1}.primary_button`}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90 active:opacity-80"
                  style={{ backgroundColor: "#7C3AED" }}
                >
                  Buy
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Separator */}
      <div className="mt-4 border-t border-white/5" />
    </motion.article>
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

  const openCommentsSong = openCommentsId
    ? allAlbums.find((s) => s.id === openCommentsId)
    : null;

  return (
    <>
      <style>{`
        @keyframes feed-pulse {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.7); opacity: 0; }
        }
      `}</style>

      <div className="pb-24 pt-4">
        <div className="flex flex-col gap-0">
          {allAlbums.map((song, i) => (
            <SongFeedCard
              key={song.id}
              song={song}
              index={i}
              likes={likesMap[song.id] ?? song.likes}
              isLiked={likedIds.has(song.id)}
              comments={commentsMap[song.id] ?? song.comments}
              minted={mintedMap[song.id] ?? song.minted}
              isOwned={ownedAlbumIds.includes(song.id)}
              isPlaying={playingId === song.id}
              onToggleLike={() => handleToggleLike(song.id)}
              onOpenComments={() => setOpenCommentsId(song.id)}
              onBuy={() => setMintModalAlbumId(song.id)}
              onTogglePlay={() => handleTogglePlay(song.id)}
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
