import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type PackStyleId = 1 | 2 | 3 | 4;

export interface PackStyle {
  id: PackStyleId;
  name: string;
  label: string;
  accentOklch: string;
  accentOklchDark: string;
  accentOklchLight: string;
  accentR: number;
  accentG: number;
  accentB: number;
  glowDark: string;
  glowLight: string;
  logoFilter: string;
}

export const PACK_STYLES: Record<PackStyleId, PackStyle> = {
  1: {
    id: 1,
    name: "mint",
    label: "Mint",
    accentOklch: "0.70 0.18 160",
    accentOklchDark: "0.76 0.18 160",
    accentOklchLight: "0.55 0.18 160",
    accentR: 52,
    accentG: 211,
    accentB: 153,
    glowDark: "rgba(52,211,153,",
    glowLight: "rgba(52,180,130,",
    logoFilter: "none",
  },
  2: {
    id: 2,
    name: "pink",
    label: "Pink",
    accentOklch: "0.78 0.12 0",
    accentOklchDark: "0.82 0.13 0",
    accentOklchLight: "0.62 0.13 0",
    accentR: 240,
    accentG: 171,
    accentB: 185,
    glowDark: "rgba(240,171,185,",
    glowLight: "rgba(210,140,160,",
    logoFilter: "hue-rotate(-160deg) saturate(0.9)",
  },
  3: {
    id: 3,
    name: "purple",
    label: "Purple",
    accentOklch: "0.76 0.12 300",
    accentOklchDark: "0.80 0.13 300",
    accentOklchLight: "0.58 0.13 300",
    accentR: 192,
    accentG: 160,
    accentB: 230,
    glowDark: "rgba(192,160,230,",
    glowLight: "rgba(160,120,200,",
    logoFilter: "hue-rotate(140deg) saturate(0.85)",
  },
  4: {
    id: 4,
    name: "blue",
    label: "Blue",
    accentOklch: "0.58 0.18 240",
    accentOklchDark: "0.62 0.18 240",
    accentOklchLight: "0.58 0.18 240",
    accentR: 75,
    accentG: 130,
    accentB: 220,
    glowDark: "rgba(75,130,220,",
    glowLight: "rgba(75,130,220,",
    logoFilter: "hue-rotate(75deg) saturate(0.85) brightness(1.05)",
  },
};

interface PackStyleContextValue {
  activeStyleId: PackStyleId;
  activeStyle: PackStyle;
  setStyleId: (id: PackStyleId) => void;
}

const PackStyleContext = createContext<PackStyleContextValue>({
  activeStyleId: 1,
  activeStyle: PACK_STYLES[1],
  setStyleId: () => {},
});

// Always light mode — dark mode has been removed.
function applyThemeVars(style: PackStyle) {
  const root = document.documentElement;
  const accent = style.accentOklchLight;
  root.style.setProperty("--cycle-accent", `oklch(${accent})`);
  root.style.setProperty("--cycle-accent-oklch", accent);
  root.style.setProperty("--cycle-accent-r", String(style.accentR));
  root.style.setProperty("--cycle-accent-g", String(style.accentG));
  root.style.setProperty("--cycle-accent-b", String(style.accentB));
  root.style.setProperty(
    "--cycle-accent-rgb",
    `${style.accentR},${style.accentG},${style.accentB}`,
  );
  root.style.setProperty("--cycle-glow-color", style.glowLight);
  root.style.setProperty("--accent", accent);
  root.style.setProperty("--ring", accent);
}

export function PackStyleProvider({ children }: { children: React.ReactNode }) {
  const [activeStyleId, setActiveStyleId] = useState<PackStyleId>(() => {
    const saved = localStorage.getItem("minty_pack_style");
    // also check legacy key for backwards compat
    const legacy = localStorage.getItem("minty_active_cycle");
    const raw = saved ?? legacy ?? "1";
    const parsed = Number.parseInt(raw, 10);
    if (parsed >= 1 && parsed <= 4) return parsed as PackStyleId;
    return 1; // default mint
  });

  const activeStyle = PACK_STYLES[activeStyleId];

  // Inject CSS vars whenever style changes (always light)
  useEffect(() => {
    applyThemeVars(activeStyle);
  }, [activeStyle]);

  const setStyleId = useCallback((id: PackStyleId) => {
    setActiveStyleId(id);
    localStorage.setItem("minty_pack_style", String(id));
  }, []);

  return (
    <PackStyleContext.Provider
      value={{ activeStyleId, activeStyle, setStyleId }}
    >
      {children}
    </PackStyleContext.Provider>
  );
}

export function usePackStyle() {
  return useContext(PackStyleContext);
}

// backwards compat — remove after all files updated
export {
  usePackStyle as useCycleTheme,
  PackStyleProvider as CycleThemeProvider,
};
export type { PackStyleId as CycleId, PackStyle as CycleTheme };
export const CYCLE_THEMES = PACK_STYLES;
