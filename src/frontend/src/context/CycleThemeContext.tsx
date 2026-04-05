import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useTheme } from "../ThemeContext";

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
    accentOklch: "0.78 0.10 240",
    accentOklchDark: "0.82 0.12 240",
    accentOklchLight: "0.60 0.12 240",
    accentR: 147,
    accentG: 197,
    accentB: 253,
    packWrapperUrl:
      "/assets/generated/pack-wrapper-cycle3-blue-transparent.dim_400x560.png",
    glowDark: "rgba(147,197,253,",
    glowLight: "rgba(110,160,220,",
    logoFilter: "hue-rotate(80deg) saturate(0.9)",
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
    logoFilter: "hue-rotate(-80deg) saturate(1.1) brightness(1.0)",
  },
};

interface CycleThemeContextValue {
  activeCycleId: CycleId;
  activeCycle: CycleTheme;
  setCycleId: (id: CycleId) => void;
}

const CycleThemeContext = createContext<CycleThemeContextValue>({
  activeCycleId: 1,
  activeCycle: CYCLE_THEMES[1],
  setCycleId: () => {},
});

function applyThemeVars(cycle: CycleTheme, isDark: boolean) {
  const root = document.documentElement;
  const accent = isDark ? cycle.accentOklchDark : cycle.accentOklchLight;
  root.style.setProperty("--cycle-accent", `oklch(${accent})`);
  root.style.setProperty("--cycle-accent-oklch", accent);
  root.style.setProperty("--cycle-accent-r", String(cycle.accentR));
  root.style.setProperty("--cycle-accent-g", String(cycle.accentG));
  root.style.setProperty("--cycle-accent-b", String(cycle.accentB));
  root.style.setProperty(
    "--cycle-accent-rgb",
    `${cycle.accentR},${cycle.accentG},${cycle.accentB}`,
  );
  root.style.setProperty(
    "--cycle-glow-color",
    isDark ? cycle.glowDark : cycle.glowLight,
  );
  root.style.setProperty("--accent", accent);
  root.style.setProperty("--ring", accent);
}

export function CycleThemeProvider({
  children,
}: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const [activeCycleId, setActiveCycleId] = useState<CycleId>(() => {
    const saved = localStorage.getItem("minty_active_cycle");
    const parsed = saved ? Number.parseInt(saved, 10) : 1;
    if (parsed >= 1 && parsed <= 6) return parsed as CycleId;
    return 1;
  });

  const activeCycle = CYCLE_THEMES[activeCycleId];
  const isDark = theme === "dark";

  // Inject CSS vars whenever cycle or theme changes
  useEffect(() => {
    applyThemeVars(activeCycle, isDark);
  }, [activeCycle, isDark]);

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
