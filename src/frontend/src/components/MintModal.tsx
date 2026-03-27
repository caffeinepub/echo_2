import { AlertCircle, CheckCircle, Loader2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useWalletContext } from "../context/WalletContext";
import { ALBUMS, formatEdition } from "../data/albums";
import { SolSymbol } from "./SolSymbol";

interface MintModalProps {
  albumId: string;
  onClose: () => void;
  onSuccess?: (editionNumber: number) => void;
}

type MintState = "idle" | "connect" | "confirming" | "success" | "error";

export function MintModal({ albumId, onClose, onSuccess }: MintModalProps) {
  const { isConnected, connect, mintAlbum } = useWalletContext();
  const [mintState, setMintState] = useState<MintState>(
    isConnected ? "idle" : "connect",
  );
  const [editionNumber, setEditionNumber] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const album = ALBUMS.find((a) => a.id === albumId);
  if (!album) return null;

  async function handleBuy() {
    setMintState("confirming");
    try {
      const result = await mintAlbum(albumId);
      setEditionNumber(result.editionNumber);
      setMintState("success");
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
        style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
        onClick={(e) => {
          if (e.target === e.currentTarget && mintState !== "confirming")
            onClose();
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
          {/* Close button */}
          {mintState !== "confirming" && (
            <button
              type="button"
              onClick={onClose}
              data-ocid="mint.close_button"
              className="absolute top-4 right-4 text-muted-foreground/50 hover:text-foreground/80 transition-colors z-10"
            >
              <X size={16} />
            </button>
          )}

          <div className="p-6">
            {/* CONNECT STATE */}
            {mintState === "connect" && (
              <motion.div
                key="connect"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
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
                    Connect your Phantom wallet to purchase {album.title}.
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col gap-5"
              >
                {/* Album info */}
                <div className="flex items-center gap-4">
                  <img
                    src={album.artworkSrc}
                    alt={album.title}
                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {album.title}
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-0.5">
                      {album.artist}
                    </p>
                    <p className="text-[11px] text-muted-foreground/40 mt-1">
                      {album.supply} Editions · {album.editions_in_circulation}{" "}
                      minted
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-border/20" />

                {/* Price */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground/50">
                    Mint price
                  </span>
                  <span className="text-lg font-mono font-medium text-foreground/90">
                    <SolSymbol className="mr-1" />
                    {album.mintPrice}
                  </span>
                </div>

                <p className="text-[11px] text-muted-foreground/35 -mt-2">
                  Transaction will open in Phantom.
                </p>

                {/* Buy button */}
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

            {/* CONFIRMING STATE */}
            {mintState === "confirming" && (
              <motion.div
                key="confirming"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center text-center gap-5 py-4"
                data-ocid="mint.loading_state"
              >
                <Loader2
                  size={36}
                  className="animate-spin"
                  style={{ color: "#7C3AED" }}
                />
                <div>
                  <p className="text-sm font-medium text-foreground/80">
                    Waiting for Phantom...
                  </p>
                  <p className="text-xs text-muted-foreground/40 mt-1">
                    Approve the transaction in your wallet
                  </p>
                </div>
              </motion.div>
            )}

            {/* SUCCESS STATE */}
            {mintState === "success" && editionNumber !== null && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center gap-4 py-2"
                data-ocid="mint.success_state"
              >
                <CheckCircle size={40} className="text-green-400/80" />
                <div>
                  <p className="text-base font-semibold text-foreground/90">
                    Minted!
                  </p>
                  <p className="text-xs text-muted-foreground/55 mt-1.5 leading-relaxed">
                    {formatEdition(editionNumber)} is now in your wallet and
                    Library.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  data-ocid="mint.close_button"
                  className="mt-2 px-6 py-2.5 rounded-xl text-sm font-medium border border-border/30 text-foreground/60 hover:text-foreground/90 hover:border-border/60 transition-all"
                >
                  Done
                </button>
              </motion.div>
            )}

            {/* ERROR STATE */}
            {mintState === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
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
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
