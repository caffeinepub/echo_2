import { motion } from "motion/react";

// ─── Signal Card ───────────────────────────────────────────────────────────────
function SignalCard({
  label,
  plainValue,
  index,
  accent,
}: {
  label: string;
  plainValue?: string;
  index: number;
  accent?: "violet" | "cyan";
}) {
  const borderColor =
    accent === "violet"
      ? "oklch(0.55 0.25 290 / 0.3)"
      : accent === "cyan"
        ? "oklch(0.82 0.15 210 / 0.25)"
        : "var(--echo-border)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.08 + index * 0.07 }}
      className="rounded-2xl px-4 py-3.5 flex flex-col gap-1"
      style={{
        background: "var(--echo-surface)",
        border: `1px solid ${borderColor}`,
        boxShadow:
          accent === "cyan"
            ? "0 0 24px oklch(0.82 0.15 210 / 0.08), inset 0 1px 0 oklch(0.82 0.15 210 / 0.05)"
            : accent === "violet"
              ? "0 0 24px oklch(0.55 0.25 290 / 0.08), inset 0 1px 0 oklch(0.55 0.25 290 / 0.05)"
              : "0 1px 4px oklch(0 0 0 / 0.05), 0 4px 12px oklch(0 0 0 / 0.04)",
      }}
    >
      <p
        className="text-[9px] uppercase tracking-[0.16em] font-medium"
        style={{ color: "var(--echo-text-secondary)" }}
      >
        {label}
      </p>
      <p
        className="text-base font-mono font-semibold tabular-nums leading-tight"
        style={{ color: "var(--echo-text-dim)" }}
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
  return (
    <div className="px-4 md:px-6 pt-6 pb-32 max-w-2xl mx-auto">
      {/* ── Signal cards ── */}
      <div className="grid grid-cols-2 gap-2.5 mb-6">
        <SignalCard
          label="Total Volume (All Time)"
          plainValue="$2,847,320"
          index={0}
          accent="cyan"
        />
        <SignalCard
          label="24H Volume"
          plainValue="$48,210"
          index={1}
          accent="cyan"
        />
        <SignalCard label="Total Transactions" plainValue="14,203" index={2} />
        <SignalCard
          label="Frozen Assets"
          plainValue="312"
          index={3}
          accent="violet"
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
                style={{
                  background: "white",
                  border: "1px solid oklch(0.9 0.005 185)",
                  boxShadow:
                    "0 2px 8px oklch(0 0 0 / 0.08), 0 1px 2px oklch(0 0 0 / 0.04)",
                  borderRadius: "16px",
                }}
              >
                {/* Artwork area */}
                <div
                  className="w-full flex items-center justify-center p-4"
                  style={{
                    background: "#f8f9fa",
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
                        background: "#eef0f2",
                        minHeight: "80px",
                      }}
                    >
                      <span className="text-[11px] font-mono text-gray-400">
                        {set.code}
                      </span>
                    </div>
                  )}
                </div>

                {/* Set name */}
                <div className="px-3 py-2.5 text-center">
                  <p
                    className="text-[12px] font-semibold leading-tight"
                    style={{ color: "#1a1a1a" }}
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
