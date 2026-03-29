import { AlertCircle, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useClipsContext } from "../context/ClipsContext";
import { useWalletContext } from "../context/WalletContext";
import { useSolPriceContext } from "../contexts/SolPriceContext";
import { SONGS, formatEdition } from "../data/songs";
import { formatUSD } from "../utils/formatUSD";
import { SolSymbol } from "./SolSymbol";

interface MintModalProps {
  albumId: string;
  clipId?: string;
  onClose: () => void;
  onSuccess?: (editionNumber: number) => void;
  solPrice?: number;
}

type MintState =
  | "idle"
  | "connect"
  | "awaiting_approval"
  | "minting"
  | "confirmed"
  | "error";

function ClipMintContent({
  clipId,
  onClose,
  onSuccess,
}: {
  clipId: string;
  onClose: () => void;
  onSuccess?: (editionNumber: number) => void;
}) {
  const { clips, mintClip, isOwned, getOwnership } = useClipsContext();
  const { isConnected, connect, walletAddress } = useWalletContext();
  const { solPrice } = useSolPriceContext();
  const [mintState, setMintState] = useState<MintState>(
    isConnected ? "idle" : "connect",
  );
  const [editionNumber, setEditionNumber] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const clip = clips.find((c) => c.id === clipId);
  if (!clip) return null;

  const alreadyOwned = isOwned(clipId);
  const ownership = getOwnership(clipId);
  const solEquiv =
    solPrice > 0 ? (clip.mintPriceUSD / solPrice).toFixed(4) : "—";

  async function handleMint() {
    setMintState("awaiting_approval");
    try {
      setMintState("minting");
      const result = await mintClip(clipId, walletAddress ?? "anon");
      setEditionNumber(result.editionNumber);
      setMintState("confirmed");
      onSuccess?.(result.editionNumber);
    } catch {
      setErrorMsg("Mint failed. Please try again.");
      setMintState("error");
    }
  }

  if (alreadyOwned && ownership) {
    return (
      <div
        className="flex flex-col items-center text-center gap-5 py-2"
        data-ocid="mint.success_state"
      >
        <p className="text-sm font-semibold text-foreground/90">
          You own this clip
        </p>
        <span className="text-[11px] font-mono text-muted-foreground/50 border border-border/40 px-2 py-0.5 rounded-full">
          ECHO CLIP · {ownership.editionNumber} / {clip.supply}
        </span>
        <button
          type="button"
          onClick={onClose}
          data-ocid="mint.close_button"
          className="px-6 py-2.5 rounded-xl text-sm font-medium border border-border/30 text-foreground/60"
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {mintState === "connect" && (
        <motion.div
          key="connect"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col items-center text-center gap-5"
        >
          <p className="text-sm font-medium text-foreground/90">
            Connect wallet to mint
          </p>
          <button
            type="button"
            onClick={() => {
              connect();
              setMintState("idle");
            }}
            data-ocid="mint.primary_button"
            className="w-full py-3 rounded-xl text-sm font-medium text-white"
            style={{ backgroundColor: "#7C3AED" }}
          >
            Connect Phantom
          </button>
        </motion.div>
      )}

      {mintState === "idle" && (
        <motion.div
          key="idle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col gap-5"
        >
          <div className="flex items-center gap-4">
            <img
              src={clip.thumbnailUrl}
              alt={clip.caption}
              className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {clip.caption || "Untitled Clip"}
              </p>
              <p className="text-xs text-muted-foreground/60 mt-0.5">
                {clip.creatorName}
              </p>
              <p className="text-[11px] text-muted-foreground/40 mt-1">
                {clip.mintedCount} / {clip.supply} minted
              </p>
            </div>
          </div>
          <div className="border-t border-border/20" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground/50">Mint price</span>
            <div className="text-right">
              <span className="text-lg font-mono font-medium text-foreground/90">
                {formatUSD(clip.mintPriceUSD)}
              </span>
              <p className="text-[11px] font-mono text-muted-foreground/40">
                ≈ {solEquiv} SOL
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleMint}
            data-ocid="mint.primary_button"
            className="w-full py-3 rounded-xl text-sm font-medium text-white"
            style={{ backgroundColor: "#7C3AED" }}
          >
            Mint for $5
          </button>
        </motion.div>
      )}

      {(mintState === "awaiting_approval" || mintState === "minting") && (
        <motion.div
          key="minting"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col items-center gap-5 py-6"
          data-ocid="mint.loading_state"
        >
          <div className="w-10 h-10 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
          <p className="text-sm text-foreground/70">
            {mintState === "awaiting_approval"
              ? "Preparing mint…"
              : "Minting your clip…"}
          </p>
        </motion.div>
      )}

      {mintState === "confirmed" && editionNumber !== null && (
        <motion.div
          key="confirmed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col items-center text-center gap-5 py-2"
          data-ocid="mint.success_state"
        >
          <svg
            width="56"
            height="56"
            viewBox="0 0 56 56"
            fill="none"
            role="img"
            aria-label="Mint successful"
          >
            <circle
              cx="28"
              cy="28"
              r="25"
              stroke="rgba(74,222,128,0.25)"
              strokeWidth="1.5"
            />
            <motion.path
              d="M18 28l8 8 14-14"
              stroke="#4ade80"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6 }}
            />
          </svg>
          <div className="space-y-1.5">
            <p className="text-base font-semibold text-foreground/90">
              Clip minted
            </p>
            <p className="text-xs text-muted-foreground/60">
              Edition {editionNumber} / {clip.supply}
            </p>
          </div>
          <span className="text-[11px] font-mono text-muted-foreground/50 border border-border/40 px-2 py-0.5 rounded-full">
            ECHO CLIP · {editionNumber} / {clip.supply}
          </span>
          <button
            type="button"
            onClick={onClose}
            data-ocid="mint.close_button"
            className="px-6 py-2.5 rounded-xl text-sm font-medium border border-border/30 text-foreground/60"
          >
            Done
          </button>
        </motion.div>
      )}

      {mintState === "error" && (
        <motion.div
          key="error"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col items-center text-center gap-4 py-2"
          data-ocid="mint.error_state"
        >
          <AlertCircle size={36} className="text-red-400/70" />
          <p className="text-sm font-medium text-foreground/80">{errorMsg}</p>
          <div className="flex gap-3 w-full">
            <button
              type="button"
              onClick={onClose}
              data-ocid="mint.cancel_button"
              className="flex-1 py-2.5 rounded-xl text-sm border border-border/30 text-muted-foreground/50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => setMintState("idle")}
              data-ocid="mint.primary_button"
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white"
              style={{ backgroundColor: "#7C3AED" }}
            >
              Try again
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function MintModal({
  albumId,
  clipId,
  onClose,
  onSuccess,
}: MintModalProps) {
  const { isConnected, connect, mintAlbum } = useWalletContext();
  const [mintState, setMintState] = useState<MintState>(
    isConnected ? "idle" : "connect",
  );
  const [editionNumber, setEditionNumber] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [mintingText, setMintingText] = useState("Minting your song...");

  // Cycling minting status text — must be before early return
  useEffect(() => {
    if (mintState !== "minting") return;
    setMintingText("Minting your song...");
    const t = setTimeout(() => {
      setMintingText("Recording ownership on Solana...");
    }, 1200);
    return () => clearTimeout(t);
  }, [mintState]);

  const { solPrice } = useSolPriceContext();

  // Render clip mint flow if clipId provided
  if (clipId) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.80)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          data-ocid="mint.modal"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="relative w-full max-w-sm rounded-2xl border border-border/30 overflow-hidden"
            style={{ backgroundColor: "oklch(0.12 0.005 265)" }}
          >
            <button
              type="button"
              onClick={onClose}
              data-ocid="mint.close_button"
              className="absolute top-4 right-4 text-muted-foreground/50 hover:text-foreground/80 transition-colors z-10"
            >
              <X size={16} />
            </button>
            <div className="p-6 min-h-[260px] flex flex-col justify-center">
              <ClipMintContent
                clipId={clipId}
                onClose={onClose}
                onSuccess={onSuccess}
              />
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  const song = SONGS.find((s) => s.id === albumId);
  if (!song) return null;

  const isLocked = mintState === "awaiting_approval" || mintState === "minting";

  async function handleBuy() {
    setMintState("awaiting_approval");
    try {
      const result = await mintAlbum(albumId, {
        onApproved: () => setMintState("minting"),
      });
      setEditionNumber(result.editionNumber);
      setMintState("confirmed");
      onSuccess?.(result.editionNumber);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Transaction failed");
      setMintState("error");
    }
  }

  function handleConnect() {
    connect();
    setMintState("idle");
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(0,0,0,0.80)" }}
        onClick={(e) => {
          if (e.target === e.currentTarget && !isLocked) onClose();
        }}
        data-ocid="mint.modal"
      >
        <style>{`
          @keyframes pulse-ring {
            0% { transform: scale(0.88); opacity: 0.7; }
            100% { transform: scale(1.25); opacity: 0; }
          }
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes orbit {
            0% { transform: rotate(0deg) translateX(96px) rotate(0deg); }
            100% { transform: rotate(360deg) translateX(96px) rotate(-360deg); }
          }
        `}</style>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className="relative w-full max-w-sm rounded-2xl border border-border/30 overflow-hidden"
          style={{ backgroundColor: "oklch(0.12 0.005 265)" }}
        >
          {!isLocked && (
            <button
              type="button"
              onClick={onClose}
              data-ocid="mint.close_button"
              className="absolute top-4 right-4 text-muted-foreground/50 hover:text-foreground/80 transition-colors z-10"
            >
              <X size={16} />
            </button>
          )}

          <div className="p-6 min-h-[320px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {/* CONNECT STATE */}
              {mintState === "connect" && (
                <motion.div
                  key="connect"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col items-center text-center gap-5"
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center border border-border/30"
                    style={{ backgroundColor: "rgba(124, 58, 237, 0.12)" }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="w-6 h-6"
                      fill="none"
                      role="img"
                      aria-label="Wallet icon"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="#7C3AED"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M8 12h8M14 10l2 2-2 2"
                        stroke="#7C3AED"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground/90 mb-1">
                      Connect wallet to mint
                    </p>
                    <p className="text-xs text-muted-foreground/50">
                      Connect your Phantom wallet to purchase {song.title}.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleConnect}
                    data-ocid="mint.primary_button"
                    className="w-full py-3 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: "#7C3AED" }}
                  >
                    Connect Phantom
                  </button>
                </motion.div>
              )}

              {/* IDLE STATE */}
              {mintState === "idle" && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col gap-5"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={song.artworkSrc}
                      alt={song.title}
                      className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {song.title}
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-0.5">
                        {song.artist}
                      </p>
                      <p className="text-[11px] text-muted-foreground/40 mt-1">
                        {song.supply} Editions · {song.editions_in_circulation}{" "}
                        minted
                      </p>
                    </div>
                  </div>
                  <div className="border-t border-border/20" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground/50">
                      Mint price
                    </span>
                    <div className="text-right">
                      <span className="text-lg font-mono font-medium text-foreground/90 flex items-center justify-end gap-1">
                        <SolSymbol animated={true} />
                        {song.mintPrice}
                      </span>
                      <span className="text-[11px] font-mono text-muted-foreground/40">
                        {formatUSD(song.mintPrice * solPrice)}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground/35 -mt-2">
                    Transaction will open in Phantom.
                  </p>
                  <button
                    type="button"
                    onClick={handleBuy}
                    data-ocid="mint.primary_button"
                    className="w-full py-3 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90 active:opacity-80"
                    style={{ backgroundColor: "#7C3AED" }}
                  >
                    Buy Edition
                  </button>
                </motion.div>
              )}

              {/* AWAITING APPROVAL STATE */}
              {mintState === "awaiting_approval" && (
                <motion.div
                  key="awaiting_approval"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col items-center text-center gap-6 py-4"
                  data-ocid="mint.loading_state"
                >
                  <div
                    className="relative flex items-center justify-center"
                    style={{ width: 96, height: 96 }}
                  >
                    <div
                      className="absolute rounded-full"
                      style={{
                        width: 88,
                        height: 88,
                        border: "1.5px solid rgba(124, 58, 237, 0.5)",
                        animation: "pulse-ring 2s ease-out infinite",
                      }}
                    />
                    <div
                      className="absolute rounded-full"
                      style={{
                        width: 76,
                        height: 76,
                        border: "1.5px solid rgba(124, 58, 237, 0.35)",
                        animation: "pulse-ring 2s ease-out infinite 0.4s",
                      }}
                    />
                    <img
                      src="/assets/uploads/img_3646-019d2cf5-e619-74bd-8ead-a4765433f691-1.png"
                      alt="Phantom"
                      className="rounded-full object-cover z-10"
                      style={{ width: 56, height: 56 }}
                    />
                  </div>
                  <div>
                    <p className="text-sm text-foreground/80 font-medium">
                      Waiting for Phantom approval...
                    </p>
                    <p className="text-xs text-muted-foreground/40 mt-1.5">
                      Approve the transaction in your wallet
                    </p>
                  </div>
                </motion.div>
              )}

              {/* MINTING STATE */}
              {mintState === "minting" && (
                <motion.div
                  key="minting"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col items-center text-center gap-6 py-2"
                  data-ocid="mint.loading_state"
                >
                  <div
                    className="relative flex items-center justify-center"
                    style={{ width: 220, height: 220 }}
                  >
                    <div
                      className="absolute rounded-2xl"
                      style={{
                        width: 160,
                        height: 160,
                        boxShadow: "0 0 60px 20px rgba(109, 40, 217, 0.25)",
                      }}
                    />
                    <svg
                      width="200"
                      height="200"
                      viewBox="0 0 200 200"
                      className="absolute"
                      role="img"
                      aria-label="Minting progress ring"
                      style={{ animation: "spin-slow 3s linear infinite" }}
                    >
                      <defs>
                        <linearGradient
                          id="mintGradient"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="100%"
                        >
                          <stop
                            offset="0%"
                            stopColor="#7C3AED"
                            stopOpacity="0.9"
                          />
                          <stop
                            offset="50%"
                            stopColor="#a855f7"
                            stopOpacity="0.5"
                          />
                          <stop
                            offset="100%"
                            stopColor="#7C3AED"
                            stopOpacity="0"
                          />
                        </linearGradient>
                      </defs>
                      <circle
                        cx="100"
                        cy="100"
                        r="96"
                        fill="none"
                        stroke="url(#mintGradient)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeDasharray="502"
                        strokeDashoffset="125"
                      />
                    </svg>
                    <img
                      src={song.artworkSrc}
                      alt={song.title}
                      className="rounded-2xl object-cover z-10 relative"
                      style={{ width: 160, height: 160 }}
                    />
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={mintingText}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.3 }}
                      className="text-sm text-foreground/70 font-medium"
                    >
                      {mintingText}
                    </motion.p>
                  </AnimatePresence>
                </motion.div>
              )}

              {/* CONFIRMED STATE */}
              {mintState === "confirmed" && editionNumber !== null && (
                <motion.div
                  key="confirmed"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col items-center text-center gap-5 py-2"
                  data-ocid="mint.success_state"
                >
                  <div className="relative">
                    <div
                      style={{
                        position: "absolute",
                        inset: -6,
                        borderRadius: "50%",
                        boxShadow: "0 0 28px 10px rgba(74, 222, 128, 0.15)",
                      }}
                    />
                    <svg
                      width="56"
                      height="56"
                      viewBox="0 0 56 56"
                      fill="none"
                      role="img"
                      aria-label="Mint successful"
                      className="relative z-10"
                    >
                      <circle
                        cx="28"
                        cy="28"
                        r="25"
                        stroke="rgba(74,222,128,0.25)"
                        strokeWidth="1.5"
                      />
                      <motion.path
                        d="M18 28l8 8 14-14"
                        stroke="#4ade80"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{
                          duration: 0.6,
                          ease: "easeOut",
                          delay: 0.1,
                        }}
                      />
                    </svg>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-base font-semibold text-foreground/90">
                      Song minted successfully
                    </p>
                    <p className="text-xs text-muted-foreground/60">
                      Now in your wallet
                    </p>
                    <p className="text-xs text-muted-foreground/60">
                      Full song unlocked
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-muted-foreground/50 border border-border/40 px-2 py-0.5 rounded-full">
                    {formatEdition(editionNumber)}
                  </span>
                  <button
                    type="button"
                    onClick={onClose}
                    data-ocid="mint.close_button"
                    className="mt-1 px-6 py-2.5 rounded-xl text-sm font-medium border border-border/30 text-foreground/60 hover:text-foreground/90 hover:border-border/60 transition-all"
                  >
                    Done
                  </button>
                </motion.div>
              )}

              {/* ERROR STATE */}
              {mintState === "error" && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col items-center text-center gap-4 py-2"
                  data-ocid="mint.error_state"
                >
                  <AlertCircle size={36} className="text-red-400/70" />
                  <div>
                    <p className="text-sm font-medium text-foreground/80">
                      Transaction failed
                    </p>
                    <p className="text-xs text-muted-foreground/40 mt-1">
                      {errorMsg}
                    </p>
                  </div>
                  <div className="flex gap-3 w-full mt-1">
                    <button
                      type="button"
                      onClick={onClose}
                      data-ocid="mint.cancel_button"
                      className="flex-1 py-2.5 rounded-xl text-sm border border-border/30 text-muted-foreground/50 hover:text-foreground/70 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => setMintState("idle")}
                      data-ocid="mint.primary_button"
                      className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: "#7C3AED" }}
                    >
                      Try again
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
