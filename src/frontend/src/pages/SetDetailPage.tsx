import { ArrowLeft, Package, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { useTheme } from "../ThemeContext";
import type { MockCard, MockSet } from "../store/mockCatalog";
import { getCards, getCategories, getSets } from "../store/mockCatalog";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatUSD(n: number): string {
  if (!n || n === 0) return "$0";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function cardVolume(card: MockCard): number {
  if (card.mintyTransactions && card.averageSalePriceUsd) {
    return card.mintyTransactions * card.averageSalePriceUsd;
  }
  return card.lastSalePriceUsd ?? 0;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface SetDetailPageProps {
  slug: string;
  onBack: () => void;
}

// ─── Market Signal Stat Card ──────────────────────────────────────────────────

function SignalCard({
  label,
  value,
  isDark,
}: {
  label: string;
  value: string;
  isDark: boolean;
}) {
  return (
    <div
      className="flex-1 rounded-2xl px-4 py-4"
      style={{
        background: isDark
          ? "linear-gradient(135deg, rgba(16,80,60,0.55) 0%, rgba(10,50,40,0.45) 100%)"
          : "linear-gradient(135deg, #f0fdf9 0%, #e6faf4 100%)",
        border: isDark
          ? "1px solid rgba(110,230,180,0.18)"
          : "1px solid #a7f3d0",
        boxShadow: isDark
          ? "0 2px 12px rgba(0,200,120,0.06)"
          : "0 2px 12px rgba(16,185,129,0.07)",
      }}
    >
      <p
        className="text-xs font-semibold tracking-widest uppercase mb-1"
        style={{ color: isDark ? "rgba(110,230,180,0.7)" : "#6ee7b7" }}
      >
        {label}
      </p>
      <p
        className="text-2xl font-bold"
        style={{ color: isDark ? "#d1fae5" : "#065f46" }}
      >
        {value}
      </p>
    </div>
  );
}

// ─── Card Row ─────────────────────────────────────────────────────────────────

function CardRow({
  card,
  volume,
  isDark,
  onClick,
}: {
  card: MockCard;
  volume: number;
  isDark: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      data-ocid="set.cards.item.1"
      onClick={onClick}
      className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl transition-all active:scale-[0.99]"
      style={{
        background: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
        border: isDark
          ? "1px solid rgba(255,255,255,0.07)"
          : "1px solid #f0fdf4",
        boxShadow: isDark ? "none" : "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      {/* Card image */}
      <div
        className="w-12 h-16 rounded-lg flex-shrink-0 overflow-hidden"
        style={{
          background: isDark ? "rgba(255,255,255,0.06)" : "#f0fdf4",
          border: isDark
            ? "1px solid rgba(255,255,255,0.08)"
            : "1px solid #d1fae5",
        }}
      >
        {card.imageUrl ? (
          <img
            src={card.imageUrl}
            alt={card.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package
              size={16}
              style={{ color: isDark ? "rgba(110,230,180,0.4)" : "#a7f3d0" }}
            />
          </div>
        )}
      </div>

      {/* Card info */}
      <div className="flex-1 min-w-0">
        <p
          className="font-semibold text-sm leading-tight truncate"
          style={{ color: isDark ? "#f0fdf4" : "#111827" }}
        >
          {card.name}
        </p>
        {card.number && (
          <p
            className="text-xs mt-0.5"
            style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#9ca3af" }}
          >
            #{card.number}
          </p>
        )}
      </div>

      {/* Volume + listings */}
      <div className="text-right flex-shrink-0">
        <p
          className="text-sm font-bold"
          style={{ color: isDark ? "#6ee7b7" : "#059669" }}
        >
          {formatUSD(volume)}
        </p>
        <p
          className="text-xs mt-0.5"
          style={{ color: isDark ? "rgba(255,255,255,0.35)" : "#9ca3af" }}
        >
          0 listings
        </p>
      </div>
    </button>
  );
}

// ─── Card Detail Modal ────────────────────────────────────────────────────────

function CardDetailModal({
  card,
  setName,
  isDark,
  onClose,
}: {
  card: MockCard;
  setName: string;
  isDark: boolean;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0"
          role="button"
          tabIndex={0}
          aria-label="Close"
          style={{ background: "rgba(0,0,0,0.4)" }}
          onClick={onClose}
          onKeyDown={(e) => e.key === "Enter" && onClose()}
        />

        {/* Sheet */}
        <motion.div
          className="relative w-full max-w-lg rounded-t-3xl overflow-hidden"
          style={{
            background: isDark ? "#0d1f1a" : "#ffffff",
            maxHeight: "85vh",
          }}
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
        >
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div
              className="w-10 h-1 rounded-full"
              style={{
                background: isDark ? "rgba(255,255,255,0.15)" : "#d1d5db",
              }}
            />
          </div>

          {/* Close button */}
          <button
            type="button"
            data-ocid="card_detail.close_button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              background: isDark ? "rgba(255,255,255,0.08)" : "#f3f4f6",
            }}
          >
            <X size={14} style={{ color: isDark ? "#d1fae5" : "#374151" }} />
          </button>

          <div
            className="overflow-y-auto px-5 pb-8"
            style={{ maxHeight: "calc(85vh - 48px)" }}
          >
            {/* Card image + identity */}
            <div className="flex gap-4 mt-2 mb-6">
              <div
                className="w-24 h-32 rounded-xl flex-shrink-0 overflow-hidden"
                style={{
                  background: isDark ? "rgba(255,255,255,0.06)" : "#f0fdf4",
                  border: isDark
                    ? "1px solid rgba(255,255,255,0.1)"
                    : "1px solid #d1fae5",
                }}
              >
                {card.imageUrl ? (
                  <img
                    src={card.imageUrl}
                    alt={card.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package
                      size={24}
                      style={{
                        color: isDark ? "rgba(110,230,180,0.4)" : "#a7f3d0",
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <p
                  className="text-lg font-bold leading-tight"
                  style={{ color: isDark ? "#f0fdf4" : "#111827" }}
                >
                  {card.name}
                </p>
                {card.number && (
                  <p
                    className="text-sm mt-0.5"
                    style={{
                      color: isDark ? "rgba(255,255,255,0.45)" : "#6b7280",
                    }}
                  >
                    #{card.number}
                  </p>
                )}
                {card.rarity && (
                  <span
                    className="inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{
                      background: isDark ? "rgba(110,230,180,0.15)" : "#ecfdf5",
                      color: isDark ? "#6ee7b7" : "#059669",
                    }}
                  >
                    {card.rarity}
                  </span>
                )}
                <p
                  className="text-xs mt-2"
                  style={{
                    color: isDark ? "rgba(255,255,255,0.35)" : "#9ca3af",
                  }}
                >
                  {setName}
                </p>
              </div>
            </div>

            {/* Population Data */}
            <SectionHeader label="Population" isDark={isDark} />
            <div className="grid grid-cols-3 gap-2 mb-6">
              {[
                { label: "TAG 10", value: card.tagPopulation10 },
                { label: "TAG 9", value: card.tagPopulation9 },
                { label: "TAG 8", value: card.tagPopulation8 },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="rounded-xl px-3 py-3 text-center"
                  style={{
                    background: isDark ? "rgba(255,255,255,0.04)" : "#f9fafb",
                    border: isDark
                      ? "1px solid rgba(255,255,255,0.07)"
                      : "1px solid #f3f4f6",
                  }}
                >
                  <p
                    className="text-xs font-medium mb-1"
                    style={{
                      color: isDark ? "rgba(255,255,255,0.45)" : "#6b7280",
                    }}
                  >
                    {label}
                  </p>
                  <p
                    className="text-base font-bold"
                    style={{ color: isDark ? "#d1fae5" : "#111827" }}
                  >
                    {value ? value.toLocaleString() : "—"}
                  </p>
                </div>
              ))}
            </div>

            {/* Recent Sales */}
            <SectionHeader label="Recent Sales" isDark={isDark} />
            <div
              className="rounded-xl px-4 py-4 mb-6 text-center"
              style={{
                background: isDark ? "rgba(255,255,255,0.03)" : "#f9fafb",
                border: isDark
                  ? "1px solid rgba(255,255,255,0.06)"
                  : "1px solid #f3f4f6",
              }}
            >
              <p
                className="text-sm"
                style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#9ca3af" }}
              >
                No sales data yet
              </p>
            </div>

            {/* Doppler Analytics placeholder */}
            <SectionHeader label="Doppler Analytics" isDark={isDark} />
            <div
              className="rounded-xl px-4 py-4 text-center"
              style={{
                background: isDark
                  ? "linear-gradient(135deg, rgba(16,80,60,0.3) 0%, rgba(10,50,40,0.2) 100%)"
                  : "linear-gradient(135deg, #f0fdf9 0%, #e6faf4 100%)",
                border: isDark
                  ? "1px solid rgba(110,230,180,0.12)"
                  : "1px solid #a7f3d0",
              }}
            >
              <p
                className="text-xs font-semibold tracking-widest uppercase mb-1"
                style={{ color: isDark ? "rgba(110,230,180,0.5)" : "#6ee7b7" }}
              >
                Velocity · Liquidity · Supply Pressure
              </p>
              <p
                className="text-sm font-medium"
                style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#9ca3af" }}
              >
                Coming soon
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function SectionHeader({ label, isDark }: { label: string; isDark: boolean }) {
  return (
    <p
      className="text-xs font-semibold tracking-widest uppercase mb-3"
      style={{ color: isDark ? "rgba(110,230,180,0.6)" : "#6ee7b7" }}
    >
      {label}
    </p>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SetDetailPage({ slug, onBack }: SetDetailPageProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [selectedCard, setSelectedCard] = useState<MockCard | null>(null);

  // Load data
  const sets = getSets();
  const set: MockSet | undefined = sets.find(
    (s) => s.slug === slug || s.id === slug,
  );
  const allCards = getCards();
  const cards = useMemo(
    () => (set ? allCards.filter((c) => c.setId === set.id && c.active) : []),
    [set, allCards],
  );

  // Category name
  const categories = getCategories();
  const category = set
    ? categories.find((c) => c.id === set.categoryId)
    : undefined;

  // Sort cards by volume descending
  const sortedCards = useMemo(
    () => [...cards].sort((a, b) => cardVolume(b) - cardVolume(a)),
    [cards],
  );

  // Set-level market signals
  const totalVolume = useMemo(
    () => sortedCards.reduce((acc, c) => acc + cardVolume(c), 0),
    [sortedCards],
  );
  const activeListings = 0; // placeholder until real listing data exists

  if (!set) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-8"
        style={{ background: isDark ? "#0a1612" : "#f9fafb" }}
      >
        <p
          style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#9ca3af" }}
          className="text-sm"
        >
          Set not found.
        </p>
        <button
          type="button"
          data-ocid="set.back_button"
          onClick={onBack}
          className="mt-4 text-sm underline"
          style={{ color: isDark ? "#6ee7b7" : "#059669" }}
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pb-24"
      style={{ background: isDark ? "#0a1612" : "#f9fafb" }}
    >
      {/* Back button */}
      <div
        className="sticky top-0 z-10 px-4 pt-4 pb-2"
        style={{ background: isDark ? "#0a1612" : "#f9fafb" }}
      >
        <button
          type="button"
          data-ocid="set.back_button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-medium"
          style={{ color: isDark ? "#6ee7b7" : "#059669" }}
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </div>

      <div className="px-4 space-y-5">
        {/* Set Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-2xl overflow-hidden"
          style={{
            background: isDark
              ? "linear-gradient(135deg, rgba(16,80,60,0.6) 0%, rgba(6,40,30,0.7) 100%)"
              : "#ffffff",
            border: isDark
              ? "1px solid rgba(110,230,180,0.15)"
              : "1px solid #e5e7eb",
            boxShadow: isDark
              ? "0 4px 24px rgba(0,180,100,0.08)"
              : "0 2px 12px rgba(0,0,0,0.06)",
          }}
        >
          <div className="flex gap-4 p-4">
            {/* Set image */}
            <div
              className="w-20 h-20 rounded-xl flex-shrink-0 overflow-hidden"
              style={{
                background: isDark ? "rgba(255,255,255,0.06)" : "#f0fdf4",
                border: isDark
                  ? "1px solid rgba(255,255,255,0.1)"
                  : "1px solid #d1fae5",
              }}
            >
              {set.imageUrl ? (
                <img
                  src={set.imageUrl}
                  alt={set.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package
                    size={24}
                    style={{
                      color: isDark ? "rgba(110,230,180,0.4)" : "#a7f3d0",
                    }}
                  />
                </div>
              )}
            </div>

            {/* Set identity */}
            <div className="flex-1 min-w-0">
              {category && (
                <span
                  className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-1.5"
                  style={{
                    background: isDark ? "rgba(110,230,180,0.15)" : "#ecfdf5",
                    color: isDark ? "#6ee7b7" : "#059669",
                  }}
                >
                  {category.name}
                </span>
              )}
              <h1
                className="text-lg font-bold leading-tight truncate"
                style={{ color: isDark ? "#f0fdf4" : "#111827" }}
              >
                {set.name}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                {set.releaseYear ? (
                  <span
                    className="text-xs"
                    style={{
                      color: isDark ? "rgba(255,255,255,0.45)" : "#6b7280",
                    }}
                  >
                    {set.releaseYear}
                  </span>
                ) : null}
                {set.setCode ? (
                  <span
                    className="text-xs font-mono"
                    style={{
                      color: isDark ? "rgba(255,255,255,0.35)" : "#9ca3af",
                    }}
                  >
                    {set.setCode}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Market Signal Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
          className="flex gap-3"
        >
          <SignalCard
            label="Set Volume"
            value={formatUSD(totalVolume)}
            isDark={isDark}
          />
          <SignalCard
            label="Active Listings"
            value={String(activeListings)}
            isDark={isDark}
          />
        </motion.div>

        {/* Cards Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
        >
          <div className="mb-3">
            <h2
              className="text-base font-bold"
              style={{ color: isDark ? "#f0fdf4" : "#111827" }}
            >
              Cards in This Set
            </h2>
            <p
              className="text-xs mt-0.5"
              style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#9ca3af" }}
            >
              Ranked by highest Minty volume
            </p>
          </div>

          {sortedCards.length === 0 ? (
            <div
              data-ocid="set.cards.empty_state"
              className="rounded-2xl px-5 py-10 text-center"
              style={{
                background: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
                border: isDark
                  ? "1px solid rgba(255,255,255,0.07)"
                  : "1px solid #f3f4f6",
              }}
            >
              <Package
                size={28}
                style={{
                  color: isDark ? "rgba(110,230,180,0.3)" : "#d1fae5",
                  margin: "0 auto 12px",
                }}
              />
              <p
                className="text-sm"
                style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#9ca3af" }}
              >
                No cards in this set yet
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedCards.map((card) => (
                <CardRow
                  key={card.id}
                  card={card}
                  volume={cardVolume(card)}
                  isDark={isDark}
                  onClick={() => setSelectedCard(card)}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Card Detail Modal */}
      <AnimatePresence>
        {selectedCard && (
          <CardDetailModal
            key={selectedCard.id}
            card={selectedCard}
            setName={set.name}
            isDark={isDark}
            onClose={() => setSelectedCard(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
