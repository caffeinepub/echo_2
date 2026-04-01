import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, ChevronLeft, Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

interface LibraryPageProps {
  onAlbumClick?: (albumId: string) => void;
  onBrowseReleases?: () => void;
}

const AVAILABLE_SETS = [
  {
    id: "sv-base",
    name: "Scarlet & Violet Base",
    total: 258,
    color: "#e53e3e",
  },
  {
    id: "paldea-evolved",
    name: "Paldea Evolved",
    total: 279,
    color: "#dd6b20",
  },
  {
    id: "obsidian-flames",
    name: "Obsidian Flames",
    total: 230,
    color: "#6b46c1",
  },
  { id: "pokemon-151", name: "Pokémon 151", total: 165, color: "#3182ce" },
];

function PokeBallIcon({ color }: { color: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className="w-16 h-16 opacity-30"
      aria-hidden="true"
    >
      <circle
        cx="50"
        cy="50"
        r="48"
        fill="none"
        stroke={color}
        strokeWidth="4"
      />
      <path d="M2 50 Q2 2 50 2" fill={color} opacity="0.4" />
      <path d="M98 50 Q98 2 50 2" fill={color} opacity="0.2" />
      <rect x="2" y="47" width="96" height="6" fill={color} opacity="0.5" />
      <circle
        cx="50"
        cy="50"
        r="12"
        fill="white"
        stroke={color}
        strokeWidth="4"
      />
      <circle cx="50" cy="50" r="6" fill={color} opacity="0.6" />
    </svg>
  );
}

function SetCard({
  setData,
  onClick,
}: { setData: (typeof AVAILABLE_SETS)[0]; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      data-ocid={`library.item.${setData.id}`}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="flex flex-col rounded-2xl overflow-hidden text-left w-full
        bg-white dark:bg-white/5
        border border-black/5 dark:border-white/10
        shadow-[0_6px_18px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]
        hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_6px_32px_rgba(16,185,129,0.12)]
        transition-all duration-200 cursor-pointer"
    >
      {/* Image area */}
      <div
        className="relative w-full aspect-square flex items-center justify-center rounded-t-xl"
        style={{
          background: `linear-gradient(135deg, ${setData.color}22, ${setData.color}55)`,
        }}
      >
        <PokeBallIcon color={setData.color} />
      </div>

      {/* Info */}
      <div className="px-3 py-2.5">
        <p className="text-[13px] font-semibold text-foreground/90 leading-tight truncate">
          {setData.name}
        </p>
        <p className="text-[11px] text-muted-foreground/50 mt-0.5">
          0 / {setData.total}
        </p>
      </div>
    </motion.button>
  );
}

function SetDetailView({
  setData,
  onBack,
}: { setData: (typeof AVAILABLE_SETS)[0]; onBack: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.25 }}
    >
      <button
        type="button"
        data-ocid="library.back_button"
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-emerald-500 hover:text-emerald-400 transition-colors mb-6 -ml-1"
      >
        <ChevronLeft className="w-4 h-4" />
        Library
      </button>

      <h2 className="text-xl font-bold text-foreground mb-8">{setData.name}</h2>

      <div
        data-ocid="library.empty_state"
        className="flex flex-col items-center justify-center py-24 text-center"
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-4 opacity-40"
          style={{
            background: `linear-gradient(135deg, ${setData.color}22, ${setData.color}44)`,
          }}
        >
          <PokeBallIcon color={setData.color} />
        </div>
        <p className="text-sm text-muted-foreground/60">
          No cards from this set yet.
        </p>
      </div>
    </motion.div>
  );
}

function AddSetModal({
  open,
  onClose,
  myLibrary,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  myLibrary: string[];
  onAdd: (id: string) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        data-ocid="library.modal"
        className="rounded-2xl max-w-sm w-full
          bg-white dark:bg-[#0d1f1a]
          border border-black/5 dark:border-white/10"
      >
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-foreground">
            Add Set
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-2 mt-1">
          {AVAILABLE_SETS.map((set) => {
            const alreadyAdded = myLibrary.includes(set.id);
            return (
              <button
                key={set.id}
                type="button"
                data-ocid={`library.add_${set.id}_button`}
                disabled={alreadyAdded}
                onClick={() => {
                  if (!alreadyAdded) {
                    onAdd(set.id);
                    onClose();
                  }
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-150
                  ${
                    alreadyAdded
                      ? "opacity-40 cursor-not-allowed bg-black/5 dark:bg-white/5"
                      : "hover:bg-emerald-50 dark:hover:bg-emerald-500/10 cursor-pointer bg-transparent"
                  }
                  border border-transparent hover:border-emerald-200 dark:hover:border-emerald-500/20`}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${set.color}22, ${set.color}55)`,
                  }}
                >
                  <svg
                    viewBox="0 0 100 100"
                    className="w-4 h-4"
                    aria-hidden="true"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="48"
                      fill="none"
                      stroke={set.color}
                      strokeWidth="6"
                    />
                    <rect x="2" y="47" width="96" height="6" fill={set.color} />
                    <circle
                      cx="50"
                      cy="50"
                      r="12"
                      fill="white"
                      stroke={set.color}
                      strokeWidth="6"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {set.name}
                  </p>
                  <p className="text-xs text-muted-foreground/50">
                    {set.total} cards
                  </p>
                </div>
                {alreadyAdded && (
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function LibraryPage({
  onAlbumClick: _onAlbumClick,
  onBrowseReleases: _onBrowseReleases,
}: LibraryPageProps) {
  const [myLibrary, setMyLibrary] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);

  const selectedSet =
    AVAILABLE_SETS.find((s) => s.id === selectedSetId) ?? null;
  const librarySetData = AVAILABLE_SETS.filter((s) => myLibrary.includes(s.id));

  function handleAdd(id: string) {
    setMyLibrary((prev) => [...prev, id]);
  }

  return (
    <div className="px-6 md:px-12 pt-8 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-2xl font-bold text-foreground"
        >
          Library
        </motion.h1>

        <motion.button
          type="button"
          data-ocid="library.open_modal_button"
          onClick={() => setShowModal(true)}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className="w-9 h-9 rounded-full flex items-center justify-center
            bg-emerald-500 hover:bg-emerald-400
            text-white shadow-[0_0_16px_rgba(16,185,129,0.35)]
            transition-all duration-200"
          aria-label="Add Set"
        >
          <Plus className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {selectedSet ? (
          <SetDetailView
            key="detail"
            setData={selectedSet}
            onBack={() => setSelectedSetId(null)}
          />
        ) : myLibrary.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            data-ocid="library.empty_state"
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <p className="text-sm text-muted-foreground/60">
              Your collection is empty.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-2 gap-4"
          >
            {librarySetData.map((set, i) => (
              <motion.div
                key={set.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
              >
                <SetCard
                  setData={set}
                  onClick={() => setSelectedSetId(set.id)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Set Modal */}
      <AddSetModal
        open={showModal}
        onClose={() => setShowModal(false)}
        myLibrary={myLibrary}
        onAdd={handleAdd}
      />
    </div>
  );
}
