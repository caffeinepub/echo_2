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
const SETS = [
  {
    name: "Scarlet & Violet Base",
    slug: "scarlet-violet-base",
    code: "SV1",
    gradient:
      "linear-gradient(135deg, oklch(0.55 0.15 185), oklch(0.45 0.12 210))",
  },
  {
    name: "Paldea Evolved",
    slug: "paldea-evolved",
    code: "SV2",
    gradient:
      "linear-gradient(135deg, oklch(0.55 0.18 160), oklch(0.45 0.15 185))",
  },
  {
    name: "Obsidian Flames",
    slug: "obsidian-flames",
    code: "SV3",
    gradient:
      "linear-gradient(135deg, oklch(0.55 0.18 30), oklch(0.45 0.15 10))",
  },
  {
    name: "Pokémon 151",
    slug: "pokemon-151",
    code: "MEW",
    gradient:
      "linear-gradient(135deg, oklch(0.55 0.20 290), oklch(0.45 0.18 270))",
  },
  {
    name: "Paradox Rift",
    slug: "paradox-rift",
    code: "SV4",
    gradient:
      "linear-gradient(135deg, oklch(0.50 0.15 220), oklch(0.40 0.12 240))",
  },
  {
    name: "Paldean Fates",
    slug: "paldean-fates",
    code: "SV4.5",
    gradient:
      "linear-gradient(135deg, oklch(0.55 0.22 340), oklch(0.45 0.18 320))",
  },
  {
    name: "Temporal Forces",
    slug: "temporal-forces",
    code: "SV5",
    gradient:
      "linear-gradient(135deg, oklch(0.50 0.12 200), oklch(0.40 0.10 220))",
  },
  {
    name: "Twilight Masquerade",
    slug: "twilight-masquerade",
    code: "SV6",
    gradient:
      "linear-gradient(135deg, oklch(0.50 0.20 280), oklch(0.40 0.18 300))",
  },
  {
    name: "Shrouded Fable",
    slug: "shrouded-fable",
    code: "SV6.5",
    gradient:
      "linear-gradient(135deg, oklch(0.40 0.08 250), oklch(0.30 0.06 270))",
  },
  {
    name: "Stellar Crown",
    slug: "stellar-crown",
    code: "SV7",
    gradient:
      "linear-gradient(135deg, oklch(0.60 0.18 50), oklch(0.50 0.15 40))",
  },
  {
    name: "Surging Sparks",
    slug: "surging-sparks",
    code: "SV8",
    gradient:
      "linear-gradient(135deg, oklch(0.60 0.20 60), oklch(0.50 0.18 80))",
  },
  {
    name: "Prismatic Evolutions",
    slug: "prismatic-evolutions",
    code: "SV8.5",
    gradient:
      "linear-gradient(135deg, oklch(0.60 0.25 290), oklch(0.50 0.22 330))",
  },
  {
    name: "Journey Together",
    slug: "journey-together",
    code: "SV9",
    gradient:
      "linear-gradient(135deg, oklch(0.55 0.15 175), oklch(0.45 0.12 195))",
  },
  {
    name: "Destined Rivals",
    slug: "destined-rivals",
    code: "SV9.5",
    gradient:
      "linear-gradient(135deg, oklch(0.50 0.20 15), oklch(0.40 0.18 350))",
  },
  {
    name: "Black Bolt",
    slug: "black-bolt",
    code: "SV10",
    gradient:
      "linear-gradient(135deg, oklch(0.25 0.05 250), oklch(0.15 0.03 270))",
  },
  {
    name: "White Flare",
    slug: "white-flare",
    code: "SV10",
    gradient:
      "linear-gradient(135deg, oklch(0.85 0.08 185), oklch(0.75 0.06 200))",
  },
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
                  background: "var(--echo-surface, white)",
                  border: "1px solid oklch(0.88 0.01 185 / 0.25)",
                  boxShadow:
                    "0 2px 8px oklch(0 0 0 / 0.08), 0 1px 2px oklch(0 0 0 / 0.05)",
                }}
              >
                {/* Artwork area */}
                <div
                  className="aspect-square w-full flex items-center justify-center"
                  style={{ background: set.gradient }}
                >
                  <span
                    className="text-[11px] font-mono font-semibold tracking-wider"
                    style={{ color: "white", opacity: 0.7 }}
                  >
                    {set.code}
                  </span>
                </div>

                {/* Set name */}
                <div className="px-2 py-2.5 text-center">
                  <p
                    className="text-[13px] font-semibold leading-tight"
                    style={{ color: "var(--echo-text-dim)" }}
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
