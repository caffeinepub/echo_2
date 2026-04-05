import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type CycleId = 1 | 2 | 3 | 4 | 5 | 6 | 7;

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
    name: "white4",
    label: "Cycle 4 — White",
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
    accentOklch: "0.72 0.12 75",
    accentOklchDark: "0.76 0.13 75",
    accentOklchLight: "0.58 0.12 75",
    accentR: 201,
    accentG: 162,
    accentB: 55,
    packWrapperUrl:
      "/assets/generated/pack-wrapper-cycle6-gold-transparent.dim_400x560.png",
    glowDark: "rgba(201,162,55,",
    glowLight: "rgba(185,148,45,",
    // Champagne-gold treatment: shift hue from mint-green toward warm amber-gold,
    // boost saturation for richness, slight brightness lift for glossy sheen.
    logoFilter:
      "hue-rotate(-65deg) saturate(1.1) brightness(1.12) contrast(1.05) sepia(0.20)",
  },
  7: {
    id: 7,
    name: "white",
    label: "Cycle 7 — White",
    accentOklch: "0.14 0 0",
    accentOklchDark: "0.10 0 0",
    accentOklchLight: "0.14 0 0",
    accentR: 0,
    accentG: 0,
    accentB: 0,
    packWrapperUrl:
      "/assets/generated/pack-wrapper-cycle7-white-transparent.dim_400x560.png",
    glowDark: "rgba(0,0,0,",
    glowLight: "rgba(0,0,0,",
    logoFilter: "white-cycle-badge", // special marker — handled in TopBar
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
    root.style.setProperty("--gold-text", "#8B6914");
    root.style.setProperty("--gold-border", "rgba(201,162,55,0.60)");
    root.style.setProperty("--gold-bg", "#FFFFFF");
    root.style.setProperty(
      "--gold-glow",
      "0 0 10px rgba(201,162,55,0.22), 0 0 3px rgba(201,162,55,0.12), 0 1px 3px rgba(0,0,0,0.06)",
    );
    root.style.setProperty(
      "--gold-glow-strong",
      "0 0 16px rgba(201,162,55,0.30), 0 0 5px rgba(201,162,55,0.16), 0 1px 4px rgba(0,0,0,0.08)",
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

  // White cycle editorial — set surface overrides and attribute
  if (cycle.id === 7) {
    root.setAttribute("data-white-cycle", "true");
    root.classList.add("white-cycle");
    root.style.setProperty("--echo-bg", "#FFFFFF");
    root.style.setProperty("--echo-bg-alpha", "rgba(255,255,255,0.98)");
    root.style.setProperty("--echo-surface", "#FCFCFC");
    root.style.setProperty("--echo-surface-alt", "#F8F8F8");
    root.style.setProperty("--echo-elevated", "#F0F0F0");
    root.style.setProperty("--echo-border", "#EAEAEA");
    root.style.setProperty("--echo-border-subtle", "#F0F0F0");
    root.style.setProperty("--echo-border-faint", "#F5F5F5");
    root.style.setProperty("--echo-text", "#000000");
    root.style.setProperty("--echo-text-dim", "#111111");
    root.style.setProperty("--echo-text-secondary", "#444444");
    root.style.setProperty("--echo-text-muted", "#777777");
    root.style.setProperty("--echo-text-dark", "#777777");
    root.style.setProperty("--echo-nav-bg", "rgba(255,255,255,0.98)");
    root.style.setProperty("--echo-nav-border", "#EAEAEA");
    root.style.setProperty("--echo-header-bg", "rgba(255,255,255,0.98)");
    root.style.setProperty("--echo-header-border", "#EAEAEA");
    root.style.setProperty("--white-text", "#000000");
    root.style.setProperty("--white-border", "rgba(0,0,0,0.18)");
    root.style.setProperty("--white-bg", "#FFFFFF");
  } else {
    root.removeAttribute("data-white-cycle");
    root.classList.remove("white-cycle");
    root.style.removeProperty("--echo-bg");
    root.style.removeProperty("--echo-bg-alpha");
    root.style.removeProperty("--echo-surface");
    root.style.removeProperty("--echo-surface-alt");
    root.style.removeProperty("--echo-elevated");
    root.style.removeProperty("--echo-border");
    root.style.removeProperty("--echo-border-subtle");
    root.style.removeProperty("--echo-border-faint");
    root.style.removeProperty("--echo-text");
    root.style.removeProperty("--echo-text-dim");
    root.style.removeProperty("--echo-text-secondary");
    root.style.removeProperty("--echo-text-muted");
    root.style.removeProperty("--echo-text-dark");
    root.style.removeProperty("--echo-nav-bg");
    root.style.removeProperty("--echo-nav-border");
    root.style.removeProperty("--echo-header-bg");
    root.style.removeProperty("--echo-header-border");
    root.style.removeProperty("--white-text");
    root.style.removeProperty("--white-border");
    root.style.removeProperty("--white-bg");
  }
}

export function CycleThemeProvider({
  children,
}: { children: React.ReactNode }) {
  const [activeCycleId, setActiveCycleId] = useState<CycleId>(() => {
    const saved = localStorage.getItem("minty_active_cycle");
    const parsed = saved ? Number.parseInt(saved, 10) : 3;
    if (parsed >= 1 && parsed <= 7) return parsed as CycleId;
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
