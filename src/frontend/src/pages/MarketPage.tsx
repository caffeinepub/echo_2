import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useTheme } from "../ThemeContext";
import type { TcgCategory as BackendCategory, TcgSet } from "../backend.d";
import { useActor } from "../hooks/useActor";

// ─── Signal Card ───────────────────────────────────────────────────────────────

function SignalCard({
  label,
  plainValue,
  index,
  accent,
  isDark,
}: {
  label: string;
  plainValue?: string;
  index: number;
  accent?: "violet" | "cyan";
  isDark: boolean;
}) {
  const lightBorderColor =
    accent === "violet"
      ? "oklch(0.55 0.25 290 / 0.3)"
      : accent === "cyan"
        ? "oklch(0.82 0.15 210 / 0.25)"
        : "var(--echo-border)";

  const lightBoxShadow =
    accent === "cyan"
      ? "0 0 24px oklch(0.82 0.15 210 / 0.08), inset 0 1px 0 oklch(0.82 0.15 210 / 0.05)"
      : accent === "violet"
        ? "0 0 24px oklch(0.55 0.25 290 / 0.08), inset 0 1px 0 oklch(0.55 0.25 290 / 0.05)"
        : "0 6px 18px rgba(0,0,0,0.06)";

  const cardStyle = isDark
    ? {
        background: "rgba(10, 28, 20, 0.72)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(110, 230, 185, 0.15)",
        boxShadow:
          "0 0 20px rgba(80, 200, 150, 0.08), inset 0 1px 0 rgba(110, 230, 185, 0.07)",
      }
    : {
        background: "white",
        border: `1px solid ${lightBorderColor}`,
        boxShadow: lightBoxShadow,
      };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.08 + index * 0.07 }}
      className="rounded-2xl px-4 py-3.5 flex flex-col gap-1"
      style={cardStyle}
    >
      <p
        className="text-[9px] uppercase tracking-[0.16em] font-medium"
        style={
          isDark
            ? { color: "rgba(150, 210, 185, 0.65)" }
            : { color: "var(--echo-text-secondary)" }
        }
      >
        {label}
      </p>
      <p
        className="text-base font-mono font-semibold tabular-nums leading-tight"
        style={
          isDark
            ? { color: "rgba(220, 248, 235, 0.92)" }
            : { color: "var(--echo-text-dim)" }
        }
      >
        {plainValue}
      </p>
    </motion.div>
  );
}

// ─── Set Card Skeleton ───────────────────────────────────────────────────────────────

function SetCardSkeleton({ isDark }: { isDark: boolean }) {
  const bg = isDark ? "rgba(20, 50, 35, 0.4)" : "#e9ecef";
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: isDark ? "rgba(10, 28, 20, 0.5)" : "white",
        border: isDark
          ? "1px solid rgba(110, 230, 185, 0.1)"
          : "1px solid #eee",
        animation: "pulse 1.5s ease-in-out infinite",
      }}
    >
      <div style={{ height: "120px", background: bg }} />
      <div className="px-3 py-2.5">
        <div
          style={{
            height: "10px",
            width: "40%",
            borderRadius: "4px",
            background: bg,
            marginBottom: "6px",
          }}
        />
        <div
          style={{
            height: "13px",
            width: "80%",
            borderRadius: "4px",
            background: bg,
          }}
        />
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────────

interface MarketPageProps {
  onAlbumClick?: (albumId: string) => void;
  onSetClick: (slug: string) => void;
}

export function MarketPage({ onSetClick }: MarketPageProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { actor, isFetching } = useActor();
  const [sets, setSets] = useState<TcgSet[]>([]);
  const [categories, setCategories] = useState<BackendCategory[]>([]);
  const [loadingSets, setLoadingSets] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  useEffect(() => {
    if (!actor || isFetching) return;
    Promise.all([actor.getSets(), (actor as any).getCategories()])
      .then(([s, c]) => {
        setSets(s);
        setCategories(
          c
            .filter((cat: BackendCategory) => cat.isActive)
            .sort(
              (a: BackendCategory, b: BackendCategory) =>
                Number(a.sortOrder) - Number(b.sortOrder),
            ),
        );
      })
      .catch(() => {})
      .finally(() => setLoadingSets(false));
  }, [actor, isFetching]);

  // Build the filter pill list: All + each active category
  const categoryPills = ["All", ...categories.map((c) => c.name)];

  const filteredSets =
    activeCategory === "All"
      ? sets
      : sets.filter((s) => {
          // Match by category name or slug
          const cat = categories.find((c) => c.name === activeCategory);
          return cat
            ? s.tcgCategory === cat.slug || s.tcgCategory === cat.name
            : false;
        });

  const setCardStyle = isDark
    ? {
        background: "rgba(10, 28, 20, 0.72)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        border: "1px solid rgba(110, 230, 185, 0.15)",
        boxShadow:
          "0 0 20px rgba(80, 200, 150, 0.08), inset 0 1px 0 rgba(110, 230, 185, 0.07)",
        borderRadius: "16px",
      }
    : {
        background: "white",
        border: "1px solid oklch(0.9 0.005 185)",
        boxShadow:
          "0 2px 8px oklch(0 0 0 / 0.08), 0 1px 2px oklch(0 0 0 / 0.04)",
        borderRadius: "16px",
      };

  const textPrimary = isDark ? "rgba(220, 248, 235, 0.9)" : "#1a1a1a";
  const textSecondary = isDark ? "rgba(150, 210, 185, 0.55)" : "#9ca3af";
  const placeholderBg = isDark ? "rgba(20, 50, 35, 0.6)" : "#eef0f2";
  const placeholderText = isDark ? "rgba(130, 190, 160, 0.5)" : "#9ca3af";

  return (
    <div className="px-4 md:px-6 pt-6 pb-32 max-w-2xl mx-auto">
      {/* ── Signal cards ── */}
      <div className="grid grid-cols-2 gap-2.5 mb-6">
        <SignalCard
          label="Total Volume (All Time)"
          plainValue="$2,847,320"
          index={0}
          accent="cyan"
          isDark={isDark}
        />
        <SignalCard
          label="24H Volume"
          plainValue="$48,210"
          index={1}
          accent="cyan"
          isDark={isDark}
        />
        <SignalCard
          label="Total Transactions"
          plainValue="14,203"
          index={2}
          isDark={isDark}
        />
        <SignalCard
          label="Frozen Assets"
          plainValue="312"
          index={3}
          accent="violet"
          isDark={isDark}
        />
      </div>

      {/* ── Browse Sets ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.2 }}
      >
        <p
          className="text-[9px] uppercase tracking-[0.16em] font-medium mb-3"
          style={{ color: "var(--echo-text-secondary)" }}
        >
          Browse Categories
        </p>

        {/* ── Category filter pills ── */}
        <div
          className="flex gap-2 mb-4"
          style={{
            overflowX: "auto",
            paddingBottom: "4px",
            scrollbarWidth: "none",
          }}
          data-ocid="discover.category.tab"
        >
          {categoryPills.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                data-ocid={`discover.${cat.toLowerCase().replace(/[^a-z0-9]/g, "_")}.tab`}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  flexShrink: 0,
                  transition: "all 0.15s",
                  background: isActive
                    ? "#10b981"
                    : isDark
                      ? "rgba(20, 50, 35, 0.5)"
                      : "#f3f4f6",
                  color: isActive
                    ? "white"
                    : isDark
                      ? "rgba(150, 210, 185, 0.65)"
                      : "#6b7280",
                  border: isActive
                    ? "1px solid transparent"
                    : isDark
                      ? "1px solid rgba(110, 230, 185, 0.12)"
                      : "1px solid #e5e7eb",
                  boxShadow: isActive
                    ? "0 0 12px rgba(16,185,129,0.3)"
                    : "none",
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* ── Set grid ── */}
        {loadingSets ? (
          <div
            data-ocid="discover.sets.loading_state"
            className="grid grid-cols-2 gap-3"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
              <SetCardSkeleton key={i} isDark={isDark} />
            ))}
          </div>
        ) : filteredSets.length === 0 ? (
          <div
            data-ocid="discover.sets.empty_state"
            className="flex flex-col items-center justify-center py-14 text-center"
          >
            <p
              style={{
                color: textPrimary,
                fontSize: "14px",
                fontWeight: 600,
                marginBottom: "4px",
              }}
            >
              No sets in this category yet
            </p>
            <p style={{ color: textSecondary, fontSize: "12px" }}>
              {activeCategory === "All"
                ? "No sets have been added yet."
                : `No ${activeCategory} sets have been added yet.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredSets.map((set, i) => (
              <motion.div
                key={set.slug}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 + i * 0.04 }}
              >
                <button
                  type="button"
                  data-ocid={`discover.item.${i + 1}`}
                  onClick={() => onSetClick(set.slug)}
                  className="w-full rounded-2xl overflow-hidden text-left transition-transform active:scale-95 hover:scale-[1.02]"
                  style={setCardStyle}
                >
                  {/* Artwork area */}
                  <div
                    className="w-full flex items-center justify-center p-4"
                    style={{
                      background: isDark ? "rgba(8, 22, 15, 0.5)" : "#f8f9fa",
                      minHeight: "120px",
                    }}
                  >
                    {set.coverImageUrl ? (
                      <img
                        src={set.coverImageUrl}
                        alt={set.setName}
                        className="object-contain max-h-full max-w-full"
                        style={{ maxHeight: "96px", maxWidth: "100%" }}
                      />
                    ) : (
                      <div
                        className="flex items-center justify-center w-full h-full rounded-lg"
                        style={{
                          background: placeholderBg,
                          minHeight: "80px",
                        }}
                      >
                        <span
                          className="text-[11px] font-mono font-semibold"
                          style={{ color: placeholderText }}
                        >
                          {set.setCode}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Set info */}
                  <div className="px-3 py-2.5">
                    <p
                      className="text-[9px] font-mono font-medium mb-0.5"
                      style={{ color: textSecondary }}
                    >
                      {set.setCode}
                    </p>
                    <p
                      className="text-[12px] font-semibold leading-tight"
                      style={{ color: textPrimary }}
                    >
                      {set.setName}
                    </p>
                    {set.cardCount !== undefined && set.cardCount !== null && (
                      <p
                        className="text-[10px] mt-0.5"
                        style={{ color: textSecondary }}
                      >
                        {Number(set.cardCount)} cards
                      </p>
                    )}
                  </div>
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
