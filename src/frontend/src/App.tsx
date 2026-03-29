import { useState } from "react";
import { useEffect } from "react";
import { ThemeProvider } from "./ThemeContext";
import { BottomNav, type Tab } from "./components/BottomNav";
import { MiniPlayer } from "./components/MiniPlayer";
import { SplashScreen } from "./components/SplashScreen";
import { TopBar } from "./components/TopBar";
import { ADMIN_WALLET_ADDRESS } from "./config/admin";
import { AdminReleasesProvider } from "./context/AdminReleasesContext";
import { AudioPlayerProvider } from "./context/AudioPlayerContext";
import { WalletProvider } from "./context/WalletContext";
import { SolPriceProvider } from "./contexts/SolPriceContext";
import { useWallet } from "./hooks/useWallet";
import { AlbumPlayerPage } from "./pages/AlbumPlayerPage";
import { CreatorSubmitPage } from "./pages/CreatorSubmitPage";
import { LibraryPage } from "./pages/LibraryPage";
import { ManageReleasesPage } from "./pages/ManageReleasesPage";
import { MarketDetailPage } from "./pages/MarketDetailPage";
import { MarketPage } from "./pages/MarketPage";
import { ReleasesPage } from "./pages/ReleasesPage";

type View =
  | { type: "tab"; tab: Tab }
  | { type: "album-player"; albumId: string; fromTab: Tab }
  | { type: "market-detail"; albumId: string }
  | { type: "admin" }
  | { type: "creator-submit" };

function AppContent() {
  const [view, setView] = useState<View>({ type: "tab", tab: "library" });
  const [showSplash, setShowSplash] = useState(true);
  const { isConnected, walletAddress } = useWallet();

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1400);
    return () => clearTimeout(timer);
  }, []);

  const isAdmin =
    ADMIN_WALLET_ADDRESS !== "" &&
    isConnected &&
    walletAddress === ADMIN_WALLET_ADDRESS;

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

  function handleUploadClick() {
    if (isAdmin) {
      setView({ type: "admin" });
    } else {
      setView({ type: "creator-submit" });
    }
  }

  return (
    <AudioPlayerProvider>
      <div className="min-h-screen bg-background">
        {showSplash && <SplashScreen />}

        <TopBar
          onAdminClick={() => setView({ type: "admin" })}
          onUploadClick={handleUploadClick}
        />

        <main className="pt-16 pb-[68px] min-h-screen">
          {view.type === "tab" && view.tab === "library" && (
            <LibraryPage
              onAlbumClick={handleAlbumClick}
              onBrowseReleases={() => setView({ type: "tab", tab: "releases" })}
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
          {view.type === "creator-submit" && (
            <CreatorSubmitPage
              onBack={() => setView({ type: "tab", tab: "library" })}
            />
          )}
        </main>

        <MiniPlayer />
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
    </AudioPlayerProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <SolPriceProvider>
        <WalletProvider>
          <AdminReleasesProvider>
            <AppContent />
          </AdminReleasesProvider>
        </WalletProvider>
      </SolPriceProvider>
    </ThemeProvider>
  );
}
