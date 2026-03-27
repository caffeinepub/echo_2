import { useEffect, useState } from "react";
import { BottomNav, type Tab } from "./components/BottomNav";
import { MiniPlayer } from "./components/MiniPlayer";
import { SplashScreen } from "./components/SplashScreen";
import { TopBar } from "./components/TopBar";
import { AudioPlayerProvider } from "./context/AudioPlayerContext";
import { AlbumPlayerPage } from "./pages/AlbumPlayerPage";
import { LibraryPage } from "./pages/LibraryPage";
import { MarketDetailPage } from "./pages/MarketDetailPage";
import { MarketPage } from "./pages/MarketPage";
import { ReleasesPage } from "./pages/ReleasesPage";

type View =
  | { type: "tab"; tab: Tab }
  | { type: "album-player"; albumId: string; fromTab: Tab }
  | { type: "market-detail"; albumId: string };

export default function App() {
  const [view, setView] = useState<View>({ type: "tab", tab: "library" });
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    document.documentElement.classList.add("dark");
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
    <AudioPlayerProvider>
      <div className="min-h-screen bg-background">
        {showSplash && <SplashScreen />}

        <TopBar />

        <main className="pt-16 pb-[68px] min-h-screen">
          {view.type === "tab" && view.tab === "library" && (
            <LibraryPage onAlbumClick={handleAlbumClick} />
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
        </main>

        <MiniPlayer />
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
    </AudioPlayerProvider>
  );
}
