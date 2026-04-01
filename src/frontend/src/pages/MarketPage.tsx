import { motion } from "motion/react";
import { useTheme } from "../ThemeContext";

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

// ─── Set data ──────────────────────────────────────────────────────────────────
const SETS: { name: string; slug: string; code: string; image?: string }[] = [
  {
    name: "Scarlet & Violet Base",
    slug: "scarlet-violet-base",
    code: "SV1",
    image:
      "/assets/254078cc-95d3-4430-a38a-0383ef456c6f-019d465f-1466-74bb-910e-cac4ea4b6c71.png",
  },
  { name: "Paldea Evolved", slug: "paldea-evolved", code: "SV2" },
  { name: "Obsidian Flames", slug: "obsidian-flames", code: "SV3" },
  { name: "Pokémon 151", slug: "pokemon-151", code: "MEW" },
  { name: "Paradox Rift", slug: "paradox-rift", code: "SV4" },
  { name: "Paldean Fates", slug: "paldean-fates", code: "SV4.5" },
  { name: "Temporal Forces", slug: "temporal-forces", code: "SV5" },
  { name: "Twilight Masquerade", slug: "twilight-masquerade", code: "SV6" },
  { name: "Shrouded Fable", slug: "shrouded-fable", code: "SV6.5" },
  { name: "Stellar Crown", slug: "stellar-crown", code: "SV7" },
  { name: "Surging Sparks", slug: "surging-sparks", code: "SV8" },
  { name: "Prismatic Evolutions", slug: "prismatic-evolutions", code: "SV8.5" },
  { name: "Journey Together", slug: "journey-together", code: "SV9" },
  { name: "Destined Rivals", slug: "destined-rivals", code: "SV9.5" },
  { name: "Black Bolt", slug: "black-bolt", code: "SV10" },
  { name: "White Flare", slug: "white-flare", code: "SV10" },
];

// ─── Main page ─────────────────────────────────────────────────────────────────
interface MarketPageProps {
  onAlbumClick: (albumId: string) => void;
}

export function MarketPage({ onAlbumClick }: MarketPageProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

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
          Browse Sets
        </p>

        <div className="grid grid-cols-2 gap-3">
          {SETS.map((set, i) => (
            <motion.div
              key={set.slug}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.25 + i * 0.04 }}
            >
              <button
                type="button"
                data-ocid={`discover.item.${i + 1}`}
                onClick={() => onAlbumClick(set.slug)}
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
                  {set.image ? (
                    <img
                      src={set.image}
                      alt={set.name}
                      className="object-contain max-h-full max-w-full"
                      style={{ maxHeight: "96px", maxWidth: "100%" }}
                    />
                  ) : (
                    <div
                      className="flex items-center justify-center w-full h-full rounded-lg"
                      style={{
                        background: isDark
                          ? "rgba(20, 50, 35, 0.6)"
                          : "#eef0f2",
                        minHeight: "80px",
                      }}
                    >
                      <span
                        className="text-[11px] font-mono"
                        style={{
                          color: isDark
                            ? "rgba(130, 190, 160, 0.5)"
                            : undefined,
                        }}
                      >
                        {!isDark && (
                          <span className="text-gray-400">{set.code}</span>
                        )}
                        {isDark && set.code}
                      </span>
                    </div>
                  )}
                </div>

                {/* Set name */}
                <div className="px-3 py-2.5 text-center">
                  <p
                    className="text-[12px] font-semibold leading-tight"
                    style={{
                      color: isDark ? "rgba(220, 248, 235, 0.9)" : "#1a1a1a",
                    }}
                  >
                    {set.name}
                  </p>
                </div>
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
