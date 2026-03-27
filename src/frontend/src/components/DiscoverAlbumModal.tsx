import { Play, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useAudioPlayer } from "../context/AudioPlayerContext";
import type { AlbumEntry } from "../pages/MarketPage";
import { SolSymbol } from "./SolSymbol";

interface DiscoverAlbumModalProps {
  album: AlbumEntry;
  isOwned: boolean;
  ownedEdition?: number;
  onClose: () => void;
  onBuy?: () => void;
}

export function DiscoverAlbumModal({
  album,
  isOwned,
  ownedEdition,
  onClose,
  onBuy,
}: DiscoverAlbumModalProps) {
  const { currentTrack, isPlaying, playPreview, stop } = useAudioPlayer();
  const isPreviewActive = currentTrack?.id === album.id && isPlaying;

  const mktCap = (
    album.floor_price_sol * album.editions_in_circulation
  ).toFixed(1);
  const positive = album.change_24h_pct >= 0;
  const changeColor = positive ? "#3DDC97" : "#FF6B6B";
  const supplyPct = Math.round(
    (album.editions_in_circulation / album.total_supply) * 100,
  );
  const isSoldOut = album.editions_in_circulation >= album.total_supply;

  function handlePreview() {
    if (isPreviewActive) {
      stop();
    } else {
      playPreview({
        id: album.id,
        title: album.title,
        artist: album.artist,
        artworkSrc: album.artworkSrc,
        preview_url: album.preview_url,
      });
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
        style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        data-ocid="discover.modal"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className="relative w-full max-w-sm rounded-2xl border border-white/[0.07] overflow-hidden"
          style={{ backgroundColor: "oklch(0.12 0.005 265)" }}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            data-ocid="discover.close_button"
            className="absolute top-4 right-4 text-muted-foreground/40 hover:text-foreground/70 transition-colors z-10"
          >
            <X size={16} />
          </button>

          <div className="p-6 flex flex-col gap-5">
            {/* Artwork */}
            <div className="flex flex-col items-center gap-4">
              <div
                className="w-40 h-40 rounded-2xl overflow-hidden flex-shrink-0"
                style={{
                  boxShadow:
                    "0 0 40px 12px rgba(255,255,255,0.06), 0 8px 32px rgba(0,0,0,0.6)",
                }}
              >
                {album.artworkSrc ? (
                  <img
                    src={album.artworkSrc}
                    alt={album.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-white/[0.06]" />
                )}
              </div>

              {/* Title + artist */}
              <div className="text-center">
                <h2 className="text-xl font-semibold text-foreground/90 leading-tight">
                  {album.title}
                </h2>
                <p className="text-sm text-muted-foreground/60 mt-1">
                  {album.artist}
                </p>
              </div>

              {/* Owned badge */}
              {isOwned && (
                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full border border-white/[0.1]"
                    style={{ color: "#3DDC97", letterSpacing: "0.12em" }}
                  >
                    Owned
                  </span>
                  {ownedEdition && (
                    <span className="text-[10px] text-muted-foreground/50 font-mono">
                      #{String(ownedEdition).padStart(3, "0")} of{" "}
                      {album.total_supply}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Stats row */}
            <div
              className="grid grid-cols-3 py-4"
              style={{
                borderTop: "1px solid rgba(255,255,255,0.06)",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {/* MCAP */}
              <div className="flex flex-col items-center gap-[6px]">
                <p
                  className="text-[11px] uppercase"
                  style={{ letterSpacing: "0.14em", color: "#7A7A7A" }}
                >
                  MCAP
                </p>
                <p
                  className="font-medium tabular-nums"
                  style={{
                    fontSize: "18px",
                    color: "#EDEDED",
                    fontWeight: 500,
                  }}
                >
                  <SolSymbol className="w-3 h-3 mr-1" />
                  {mktCap}
                </p>
                <p
                  className="text-[10px] font-mono"
                  style={{ color: changeColor }}
                >
                  {positive ? "+" : ""}
                  {album.change_24h_pct.toFixed(1)}%
                </p>
              </div>

              {/* SUPPLY */}
              <div
                className="flex flex-col items-center gap-[6px]"
                style={{
                  borderLeft: "1px solid rgba(255,255,255,0.06)",
                  borderRight: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <p
                  className="text-[11px] uppercase"
                  style={{ letterSpacing: "0.14em", color: "#7A7A7A" }}
                >
                  SUPPLY
                </p>
                <p
                  className="font-medium tabular-nums leading-none"
                  style={{
                    fontSize: "18px",
                    color: "#EDEDED",
                    fontWeight: 500,
                  }}
                >
                  {album.editions_in_circulation}
                  <span
                    style={{
                      fontSize: "13px",
                      color: "rgba(237,237,237,0.45)",
                    }}
                  >
                    /{album.total_supply}
                  </span>
                </p>
                <p
                  className="text-[10px]"
                  style={{ color: "rgba(122,122,122,0.7)" }}
                >
                  minted
                </p>
              </div>

              {/* TXNS */}
              <div className="flex flex-col items-center gap-[6px]">
                <p
                  className="text-[11px] uppercase"
                  style={{ letterSpacing: "0.14em", color: "#7A7A7A" }}
                >
                  TXNS
                </p>
                <p
                  className="font-medium tabular-nums"
                  style={{
                    fontSize: "18px",
                    color: "#EDEDED",
                    fontWeight: 500,
                  }}
                >
                  {album.txns}
                </p>
                <p
                  className="text-[10px]"
                  style={{ color: "rgba(122,122,122,0.7)" }}
                >
                  recent
                </p>
              </div>
            </div>

            {/* Supply progress bar */}
            <div>
              <p
                className="text-[11px] mb-2"
                style={{ color: "rgba(122,122,122,0.6)" }}
              >
                {album.editions_in_circulation} / {album.total_supply} minted
              </p>
              <div
                className="w-full rounded-full overflow-hidden"
                style={{
                  height: "3px",
                  backgroundColor: "rgba(255,255,255,0.05)",
                }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(supplyPct, 100)}%`,
                    background:
                      "linear-gradient(to right, rgba(255,255,255,0.8), rgba(139,92,246,0.4))",
                  }}
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              {/* Preview button */}
              <button
                type="button"
                onClick={handlePreview}
                data-ocid="discover.secondary_button"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm border border-white/[0.12] text-muted-foreground/70 hover:text-foreground/90 hover:border-white/20 transition-colors"
              >
                <Play size={13} />
                {isPreviewActive ? "Stop" : "Preview"}
              </button>

              {/* Buy / Sold Out button */}
              {!isOwned &&
                (isSoldOut ? (
                  <button
                    type="button"
                    disabled
                    data-ocid="discover.primary_button"
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium text-muted-foreground/30 bg-white/[0.04] cursor-not-allowed"
                  >
                    Sold Out
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onBuy}
                    data-ocid="discover.primary_button"
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white hover:opacity-90 active:opacity-80 transition-opacity"
                    style={{ backgroundColor: "#7C3AED" }}
                  >
                    Buy <SolSymbol className="w-3 h-3 mx-1" />
                    {album.mintPrice}
                  </button>
                ))}

              {isOwned && (
                <div
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-center"
                  style={{
                    color: "#3DDC97",
                    backgroundColor: "rgba(61,220,151,0.08)",
                  }}
                >
                  Owned
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
