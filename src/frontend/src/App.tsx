import { useState } from "react";
import { useEffect } from "react";
import { ThemeProvider } from "./ThemeContext";
import { BottomNav, type Tab } from "./components/BottomNav";
import { SplashScreen } from "./components/SplashScreen";
import { TopBar } from "./components/TopBar";
import { AdminReleasesProvider } from "./context/AdminReleasesContext";
import { WalletProvider } from "./context/WalletContext";
import { InternetIdentityProvider } from "./hooks/useInternetIdentity";
import { LibraryPage } from "./pages/LibraryPage";
import { ManageReleasesPage } from "./pages/ManageReleasesPage";
import { MarketDetailPage } from "./pages/MarketDetailPage";
import { MarketPage } from "./pages/MarketPage";
import { ReleasesPage } from "./pages/ReleasesPage";
import { SetDetailPage } from "./pages/SetDetailPage";
import { UploadPage } from "./pages/UploadPage";

type View =
  | { type: "tab"; tab: Tab }
  | { type: "set-detail"; slug: string }
  | { type: "market-detail"; id: string }
  | { type: "upload" }
  | { type: "admin" };

function AppContent() {
  const [view, setView] = useState<View>({ type: "tab", tab: "library" });
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1400);
    return () => clearTimeout(timer);
  }, []);

  const activeTab: Tab = view.type === "tab" ? view.tab : "market";

  function handleTabChange(tab: Tab) {
    setView({ type: "tab", tab });
  }

  function handleSetClick(slug: string) {
    setView({ type: "set-detail", slug });
  }

  function handleMarketItemClick(id: string) {
    setView({ type: "market-detail", id });
  }

  return (
    <div className="min-h-screen bg-background">
      {showSplash && <SplashScreen />}

      <TopBar
        onAdminClick={() => setView({ type: "admin" })}
        onUploadClick={() => setView({ type: "upload" })}
      />

      <main className="pt-16 pb-[68px] min-h-screen">
        {view.type === "tab" && view.tab === "library" && (
          <LibraryPage
            onBrowseReleases={() => setView({ type: "tab", tab: "releases" })}
          />
        )}
        {view.type === "tab" && view.tab === "releases" && <ReleasesPage />}
        {view.type === "tab" && view.tab === "market" && (
          <MarketPage
            onAlbumClick={handleMarketItemClick}
            onSetClick={handleSetClick}
          />
        )}
        {view.type === "set-detail" && (
          <SetDetailPage
            slug={view.slug}
            onBack={() => setView({ type: "tab", tab: "market" })}
          />
        )}
        {view.type === "market-detail" && (
          <MarketDetailPage
            id={view.id}
            onBack={() => setView({ type: "tab", tab: "market" })}
          />
        )}
        {view.type === "upload" && (
          <UploadPage
            onBack={() => setView({ type: "tab", tab: "releases" })}
          />
        )}
        {view.type === "admin" && (
          <ManageReleasesPage
            onBack={() => setView({ type: "tab", tab: "library" })}
          />
        )}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <InternetIdentityProvider>
        <WalletProvider>
          <AdminReleasesProvider>
            <AppContent />
          </AdminReleasesProvider>
        </WalletProvider>
      </InternetIdentityProvider>
    </ThemeProvider>
  );
}
