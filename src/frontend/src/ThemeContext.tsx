import { createContext, useContext, useEffect } from "react";

type Theme = "light";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Always force light mode — dark mode has been removed.
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", "light");
    root.classList.remove("dark");
    // Remove any stale localStorage preference
    localStorage.removeItem("echo-theme");
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: "light", toggleTheme: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
