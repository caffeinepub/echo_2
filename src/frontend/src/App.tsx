import { useEffect, useState } from "react";
import { ThemeProvider } from "./ThemeContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { SplashScreen } from "./components/SplashScreen";
import { PackStyleProvider } from "./context/PackStyleContext";
import { UserSettingsProvider } from "./context/UserSettingsContext";
import { InternetIdentityProvider } from "./hooks/useInternetIdentity";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { PetPage } from "./pages/PetPage";

type ActiveTab = "pet" | "leaderboard";

function TabBar({
  active,
  onChange,
}: {
  active: ActiveTab;
  onChange: (tab: ActiveTab) => void;
}) {
  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: 72,
        background: "rgba(255, 255, 255, 0.98)",
        borderTop: "1px solid #d0dfef",
        boxShadow: "0 -2px 12px rgba(0,0,0,0.06)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        zIndex: 100,
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
      aria-label="Main navigation"
    >
      <button
        type="button"
        aria-label="Pet tab"
        aria-selected={active === "pet"}
        data-ocid="pet.tab"
        onClick={() => onChange("pet")}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: "8px 28px",
          borderRadius: 14,
          transition: "background 0.18s ease",
        }}
      >
        <span
          style={{
            fontSize: 22,
            lineHeight: 1,
            filter:
              active === "pet"
                ? "drop-shadow(0 0 4px rgba(127, 184, 232, 0.6))"
                : "none",
            transform: active === "pet" ? "scale(1.12)" : "scale(1)",
            transition: "transform 0.2s ease, filter 0.2s ease",
            display: "block",
          }}
        >
          🐾
        </span>
        <span
          style={{
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize: 10,
            fontWeight: active === "pet" ? 700 : 500,
            letterSpacing: "0.04em",
            color:
              active === "pet" ? "#7fb8e8" : "var(--echo-text-muted, #8baec8)",
            transition: "color 0.2s ease",
          }}
        >
          Pet
        </span>
      </button>

      <button
        type="button"
        aria-label="Leaderboard tab"
        aria-selected={active === "leaderboard"}
        data-ocid="leaderboard.tab"
        onClick={() => onChange("leaderboard")}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: "8px 28px",
          borderRadius: 14,
          transition: "background 0.18s ease",
        }}
      >
        <span
          style={{
            fontSize: 22,
            lineHeight: 1,
            filter:
              active === "leaderboard"
                ? "drop-shadow(0 0 4px rgba(127, 184, 232, 0.6))"
                : "none",
            transform: active === "leaderboard" ? "scale(1.12)" : "scale(1)",
            transition: "transform 0.2s ease, filter 0.2s ease",
            display: "block",
          }}
        >
          🏆
        </span>
        <span
          style={{
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize: 10,
            fontWeight: active === "leaderboard" ? 700 : 500,
            letterSpacing: "0.04em",
            color:
              active === "leaderboard"
                ? "#7fb8e8"
                : "var(--echo-text-muted, #8baec8)",
            transition: "color 0.2s ease",
          }}
        >
          Leaderboard
        </span>
      </button>
    </nav>
  );
}

function AppContent() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>("pet");

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {showSplash && <SplashScreen />}
      <main
        style={{
          minHeight: "100vh",
          paddingBottom: 72,
        }}
      >
        {activeTab === "pet" ? <PetPage /> : <LeaderboardPage />}
      </main>
      <TabBar active={activeTab} onChange={setActiveTab} />
    </div>
  );
}

export default function App() {
  return (
    <UserSettingsProvider>
      <ThemeProvider>
        <PackStyleProvider>
          <InternetIdentityProvider>
            <ErrorBoundary>
              <AppContent />
            </ErrorBoundary>
          </InternetIdentityProvider>
        </PackStyleProvider>
      </ThemeProvider>
    </UserSettingsProvider>
  );
}
