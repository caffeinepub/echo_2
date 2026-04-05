import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type CycleId = 1 | 2 | 3 | 4 | 5 | 6;

export interface CycleTheme {
  id: CycleId;
  name: string;
  label: string;
  accentOklch: string;
  accentOklchDark: string;
  accentOklchLight: string;
  accentR: number;
  accentG: number;
  accentB: number;
  packWrapperUrl: string;
  glowDark: string;
  glowLight: string;
  logoFilter: string;
}

export const CYCLE_THEMES: Record<CycleId, CycleTheme> = {
  1: {
    id: 1,
    name: "mint",
    label: "Cycle 1 — Mint",
    accentOklch: "0.70 0.18 160",
    accentOklchDark: "0.76 0.18 160",
    accentOklchLight: "0.55 0.18 160",
    accentR: 52,
    accentG: 211,
    accentB: 153,
    packWrapperUrl:
      "/assets/generated/pack-wrapper-cycle1-mint-transparent.dim_400x560.png",
    glowDark: "rgba(52,211,153,",
    glowLight: "rgba(52,180,130,",
    logoFilter: "none",
  },
  2: {
    id: 2,
    name: "pink",
    label: "Cycle 2 — Pink",
    accentOklch: "0.78 0.12 0",
    accentOklchDark: "0.82 0.13 0",
    accentOklchLight: "0.62 0.13 0",
    accentR: 240,
    accentG: 171,
    accentB: 185,
    packWrapperUrl:
      "/assets/generated/pack-wrapper-cycle2-pink-transparent.dim_400x560.png",
    glowDark: "rgba(240,171,185,",
    glowLight: "rgba(210,140,160,",
    logoFilter: "hue-rotate(-160deg) saturate(0.9)",
  },
  3: {
    id: 3,
    name: "blue",
    label: "Cycle 3 — Blue",
    accentOklch: "0.58 0.18 240",
    accentOklchDark: "0.62 0.18 240",
    accentOklchLight: "0.58 0.18 240",
    accentR: 75,
    accentG: 130,
    accentB: 220,
    packWrapperUrl:
      "/assets/generated/pack-wrapper-cycle3-blue-v2-transparent.dim_400x560.png",
    glowDark: "rgba(75,130,220,",
    glowLight: "rgba(75,130,220,",
    logoFilter: "hue-rotate(75deg) saturate(0.85) brightness(1.05)",
  },
  4: {
    id: 4,
    name: "offwhite",
    label: "Cycle 4 — Off-white",
    accentOklch: "0.92 0.03 80",
    accentOklchDark: "0.94 0.03 80",
    accentOklchLight: "0.70 0.04 80",
    accentR: 245,
    accentG: 240,
    accentB: 225,
    packWrapperUrl:
      "/assets/generated/pack-wrapper-cycle4-offwhite-transparent.dim_400x560.png",
    glowDark: "rgba(245,240,225,",
    glowLight: "rgba(200,195,180,",
    logoFilter: "hue-rotate(-80deg) saturate(0.3) brightness(1.2)",
  },
  5: {
    id: 5,
    name: "purple",
    label: "Cycle 5 — Purple",
    accentOklch: "0.76 0.12 300",
    accentOklchDark: "0.80 0.13 300",
    accentOklchLight: "0.58 0.13 300",
    accentR: 192,
    accentG: 160,
    accentB: 230,
    packWrapperUrl:
      "/assets/generated/pack-wrapper-cycle5-purple-transparent.dim_400x560.png",
    glowDark: "rgba(192,160,230,",
    glowLight: "rgba(160,120,200,",
    logoFilter: "hue-rotate(140deg) saturate(0.85)",
  },
  6: {
    id: 6,
    name: "gold",
    label: "Cycle 6 — Gold",
    accentOklch: "0.80 0.14 80",
    accentOklchDark: "0.83 0.15 80",
    accentOklchLight: "0.62 0.14 80",
    accentR: 212,
    accentG: 175,
    accentB: 55,
    packWrapperUrl:
      "/assets/generated/pack-wrapper-cycle6-gold-transparent.dim_400x560.png",
    glowDark: "rgba(212,175,55,",
    glowLight: "rgba(180,145,30,",
    // Champagne-gold treatment: shift hue from mint-green toward warm amber-gold,
    // boost saturation for richness, slight brightness lift for glossy sheen.
    logoFilter:
      "hue-rotate(-75deg) saturate(1.4) brightness(1.12) contrast(1.05)",
  },
};

interface CycleThemeContextValue {
  activeCycleId: CycleId;
  activeCycle: CycleTheme;
  setCycleId: (id: CycleId) => void;
}

const CycleThemeContext = createContext<CycleThemeContextValue>({
  activeCycleId: 3,
  activeCycle: CYCLE_THEMES[3],
  setCycleId: () => {},
});

// Always light mode — dark mode has been removed.
function applyThemeVars(cycle: CycleTheme) {
  const root = document.documentElement;
  const accent = cycle.accentOklchLight;
  root.style.setProperty("--cycle-accent", `oklch(${accent})`);
  root.style.setProperty("--cycle-accent-oklch", accent);
  root.style.setProperty("--cycle-accent-r", String(cycle.accentR));
  root.style.setProperty("--cycle-accent-g", String(cycle.accentG));
  root.style.setProperty("--cycle-accent-b", String(cycle.accentB));
  root.style.setProperty(
    "--cycle-accent-rgb",
    `${cycle.accentR},${cycle.accentG},${cycle.accentB}`,
  );
  root.style.setProperty("--cycle-glow-color", cycle.glowLight);
  root.style.setProperty("--accent", accent);
  root.style.setProperty("--ring", accent);

  // Gold cycle prestige — set extra vars and attribute
  if (cycle.id === 6) {
    root.setAttribute("data-gold-cycle", "true");
    root.classList.add("gold-cycle");
    root.style.setProperty("--gold-text", "#9A7B1C");
    root.style.setProperty("--gold-border", "rgba(212,175,55,0.72)");
    root.style.setProperty("--gold-bg", "#FFFFFF");
    root.style.setProperty(
      "--gold-glow",
      "0 0 12px rgba(212,175,55,0.28), 0 0 4px rgba(212,175,55,0.15), 0 1px 3px rgba(0,0,0,0.06)",
    );
    root.style.setProperty(
      "--gold-glow-strong",
      "0 0 18px rgba(212,175,55,0.38), 0 0 6px rgba(212,175,55,0.20), 0 1px 4px rgba(0,0,0,0.08)",
    );
  } else {
    root.removeAttribute("data-gold-cycle");
    root.classList.remove("gold-cycle");
    root.style.removeProperty("--gold-text");
    root.style.removeProperty("--gold-border");
    root.style.removeProperty("--gold-bg");
    root.style.removeProperty("--gold-glow");
    root.style.removeProperty("--gold-glow-strong");
  }
}

export function CycleThemeProvider({
  children,
}: { children: React.ReactNode }) {
  const [activeCycleId, setActiveCycleId] = useState<CycleId>(() => {
    const saved = localStorage.getItem("minty_active_cycle");
    const parsed = saved ? Number.parseInt(saved, 10) : 3;
    if (parsed >= 1 && parsed <= 6) return parsed as CycleId;
    return 3; // default blue
  });

  const activeCycle = CYCLE_THEMES[activeCycleId];

  // Inject CSS vars whenever cycle changes (always light)
  useEffect(() => {
    applyThemeVars(activeCycle);
  }, [activeCycle]);

  const setCycleId = useCallback((id: CycleId) => {
    setActiveCycleId(id);
    localStorage.setItem("minty_active_cycle", String(id));
  }, []);

  return (
    <CycleThemeContext.Provider
      value={{ activeCycleId, activeCycle, setCycleId }}
    >
      {children}
    </CycleThemeContext.Provider>
  );
}

export function useCycleTheme() {
  return useContext(CycleThemeContext);
}
