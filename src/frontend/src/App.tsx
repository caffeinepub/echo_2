import { useState } from "react";
import { useEffect } from "react";
import { ThemeProvider } from "./ThemeContext";
import { BottomNav, type Tab } from "./components/BottomNav";
import { MiniPlayer } from "./components/MiniPlayer";
import { SplashScreen } from "./components/SplashScreen";
import { TopBar } from "./components/TopBar";
import { AdminReleasesProvider } from "./context/AdminReleasesContext";
import { VideoPlayerProvider } from "./context/AudioPlayerContext";
import { WalletProvider } from "./context/WalletContext";
import { SolPriceProvider } from "./contexts/SolPriceContext";
import { AlbumPlayerPage } from "./pages/AlbumPlayerPage";
import { LibraryPage } from "./pages/LibraryPage";
import { ManageReleasesPage } from "./pages/ManageReleasesPage";
import { MarketDetailPage } from "./pages/MarketDetailPage";
import { MarketPage } from "./pages/MarketPage";
import { ReleasesPage } from "./pages/ReleasesPage";

type View =
  | { type: "tab"; tab: Tab }
  | { type: "album-player"; albumId: string; fromTab: Tab }
  | { type: "market-detail"; albumId: string }
  | { type: "admin" };

function AppContent() {
  const [view, setView] = useState<View>({ type: "tab", tab: "library" });
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1400);
    return () => clearTimeout(timer);
  }, []);

  const activeTab: Tab =
    view.type === "tab"
      ? view.tab
      : view.type === "album-player"
        ? view.fromTab
        : "market";

  function handleTabChange(tab: Tab) {
    setView({ type: "tab", tab });
  }

  function handleAlbumClick(albumId: string) {
    setView({ type: "album-player", albumId, fromTab: activeTab });
  }

  function handleMarketAlbumClick(albumId: string) {
    setView({ type: "market-detail", albumId });
  }

  return (
    <WalletProvider>
      <VideoPlayerProvider>
        <div className="min-h-screen bg-background">
          {showSplash && <SplashScreen />}

          <TopBar onAdminClick={() => setView({ type: "admin" })} />

          <main className="pt-16 pb-[68px] min-h-screen">
            {view.type === "tab" && view.tab === "library" && (
              <LibraryPage
                onAlbumClick={handleAlbumClick}
                onBrowseReleases={() =>
                  setView({ type: "tab", tab: "releases" })
                }
              />
            )}
            {view.type === "tab" && view.tab === "releases" && (
              <ReleasesPage onAlbumClick={handleAlbumClick} />
            )}
            {view.type === "tab" && view.tab === "market" && (
              <MarketPage onAlbumClick={handleMarketAlbumClick} />
            )}
            {view.type === "album-player" && (
              <AlbumPlayerPage
                albumId={view.albumId}
                onBack={() => setView({ type: "tab", tab: view.fromTab })}
              />
            )}
            {view.type === "market-detail" && (
              <MarketDetailPage
                albumId={view.albumId}
                onBack={() => setView({ type: "tab", tab: "market" })}
              />
            )}
            {view.type === "admin" && (
              <ManageReleasesPage
                onBack={() => setView({ type: "tab", tab: "library" })}
              />
            )}
          </main>

          <MiniPlayer />
          <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
        </div>
      </VideoPlayerProvider>
    </WalletProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <SolPriceProvider>
        <AdminReleasesProvider>
          <AppContent />
        </AdminReleasesProvider>
      </SolPriceProvider>
    </ThemeProvider>
  );
}
