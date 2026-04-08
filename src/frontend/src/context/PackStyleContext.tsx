import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type PackStyleId = 3;

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
    logoFilter: "none",
  },
};

interface PackStyleContextValue {
  activeStyleId: PackStyleId;
  activeStyle: PackStyle;
  setStyleId: (id: PackStyleId) => void;
}

const PackStyleContext = createContext<PackStyleContextValue>({
  activeStyleId: 3,
  activeStyle: PACK_STYLES[3],
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
  const [activeStyleId] = useState<PackStyleId>(() => {
    // Always force purple — override any previously saved theme
    localStorage.setItem("minty_pack_style", "3");
    return 3;
  });

  const activeStyle = PACK_STYLES[3];

  // Inject CSS vars on mount and whenever style changes (always purple)
  useEffect(() => {
    applyThemeVars(activeStyle);
  }, [activeStyle]);

  // setStyleId is a no-op — purple is the only theme
  const setStyleId = useCallback((_id: PackStyleId) => {
    // noop: only purple supported
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
