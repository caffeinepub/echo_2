import { Send, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { useWalletContext } from "../context/WalletContext";
import type { SongComment } from "../data/songs";

function relativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface CommentsModalProps {
  songId: string;
  comments: SongComment[];
  onClose: () => void;
  onAddComment: (songId: string, text: string) => void;
}

export function CommentsModal({
  songId,
  comments,
  onClose,
  onAddComment,
}: CommentsModalProps) {
  const { isConnected } = useWalletContext();
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || !isConnected) return;
    onAddComment(songId, trimmed);
    setText("");
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSend();
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50"
        style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
        onClick={onClose}
        data-ocid="comments.modal"
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 32, stiffness: 340 }}
          className="absolute bottom-0 left-0 right-0 flex flex-col"
          style={{
            maxHeight: "70vh",
            backgroundColor: "oklch(0.12 0.005 265)",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "20px 20px 0 0",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
            <h2 className="text-sm font-semibold text-white/90 tracking-wide">
              Comments
            </h2>
            <button
              type="button"
              onClick={onClose}
              data-ocid="comments.close_button"
              className="text-white/30 hover:text-white/70 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Comment list */}
          <div className="flex-1 overflow-y-auto px-5 pb-2 min-h-0">
            {comments.length === 0 ? (
              <div
                className="flex items-center justify-center py-10 text-white/25 text-sm"
                data-ocid="comments.empty_state"
              >
                Be the first to comment
              </div>
            ) : (
              <div className="flex flex-col gap-4 pb-2">
                {comments.map((c) => (
                  <div key={c.id} className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-white/40 tracking-wide">
                        {c.walletAddress}
                      </span>
                      <span className="text-[10px] text-white/20">
                        {relativeTime(c.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-white/75 leading-snug">
                      {c.text}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Input row */}
          <div
            className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
            <input
              ref={inputRef}
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isConnected ? "Add a comment…" : "Connect wallet to comment"
              }
              disabled={!isConnected}
              data-ocid="comments.input"
              className="flex-1 bg-transparent text-sm text-white/80 placeholder:text-white/20 outline-none disabled:opacity-40"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!text.trim() || !isConnected}
              data-ocid="comments.submit_button"
              className="text-violet-400 disabled:opacity-25 transition-opacity"
            >
              <Send size={15} />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
