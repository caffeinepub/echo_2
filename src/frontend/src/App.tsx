import { useEffect, useState } from "react";
import { BottomNav, type Tab } from "./components/BottomNav";
import { DiscoverAlbumModal } from "./components/DiscoverAlbumModal";
import { MiniPlayer } from "./components/MiniPlayer";
import { MintModal } from "./components/MintModal";
import { SplashScreen } from "./components/SplashScreen";
import { TopBar } from "./components/TopBar";
import { AudioPlayerProvider } from "./context/AudioPlayerContext";
import { WalletProvider } from "./context/WalletContext";
import { useWalletContext } from "./context/WalletContext";
import { AlbumPlayerPage } from "./pages/AlbumPlayerPage";
import { LibraryPage } from "./pages/LibraryPage";
import { MarketPage, TOP_ALBUMS } from "./pages/MarketPage";
import { ReleasesPage } from "./pages/ReleasesPage";

// Maps Discover album ids (ta-xx) to ALBUMS ids (echo_xxx)
const DISCOVER_TO_ALBUM_ID: Record<string, string> = {
  "ta-01": "echo_001",
  "ta-02": "echo_002",
};

// Mock owned editions for Discover modal display
const OWNED_EDITIONS_MOCK: Record<string, number> = {
  "ta-01": 42,
  "ta-02": 7,
};

type View =
  | { type: "tab"; tab: Tab }
  | { type: "album-player"; albumId: string; fromTab: Tab };

function AppInner() {
  const [view, setView] = useState<View>({ type: "tab", tab: "library" });
  const [showSplash, setShowSplash] = useState(true);
  const [discoverModalAlbumId, setDiscoverModalAlbumId] = useState<
    string | null
  >(null);
  const [mintFromDiscoverId, setMintFromDiscoverId] = useState<string | null>(
    null,
  );

  const { ownedAlbumIds, ownedEditions } = useWalletContext();

  useEffect(() => {
    document.documentElement.classList.add("dark");
    const timer = setTimeout(() => setShowSplash(false), 1400);
    return () => clearTimeout(timer);
  }, []);

  const activeTab: Tab = view.type === "tab" ? view.tab : view.fromTab;

  function handleTabChange(tab: Tab) {
    setView({ type: "tab", tab });
  }

  function handleAlbumClick(albumId: string) {
    setView({ type: "album-player", albumId, fromTab: activeTab });
  }

  function handleMarketAlbumClick(albumId: string) {
    setDiscoverModalAlbumId(albumId);
  }

  // Discover modal data
  const discoverAlbum = discoverModalAlbumId
    ? (TOP_ALBUMS.find((a) => a.id === discoverModalAlbumId) ?? null)
    : null;

  const discoverEchoId = discoverModalAlbumId
    ? (DISCOVER_TO_ALBUM_ID[discoverModalAlbumId] ?? null)
    : null;

  const discoverIsOwned = discoverEchoId
    ? ownedAlbumIds.includes(discoverEchoId)
    : false;

  const discoverOwnedEdition = discoverEchoId
    ? (ownedEditions[discoverEchoId] ??
      OWNED_EDITIONS_MOCK[discoverModalAlbumId ?? ""])
    : undefined;

  function handleDiscoverBuy() {
    const echoId = discoverEchoId;
    if (echoId) {
      setDiscoverModalAlbumId(null);
      setMintFromDiscoverId(echoId);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {showSplash && <SplashScreen />}

      <TopBar />

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
      </main>

      <MiniPlayer />
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Discover album modal */}
      {discoverAlbum && (
        <DiscoverAlbumModal
          album={discoverAlbum}
          isOwned={discoverIsOwned}
          ownedEdition={discoverIsOwned ? discoverOwnedEdition : undefined}
          onClose={() => setDiscoverModalAlbumId(null)}
          onBuy={discoverEchoId ? handleDiscoverBuy : undefined}
        />
      )}

      {/* Mint modal triggered from Discover */}
      {mintFromDiscoverId && (
        <MintModal
          albumId={mintFromDiscoverId}
          onClose={() => setMintFromDiscoverId(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <WalletProvider>
      <AudioPlayerProvider>
        <AppInner />
      </AudioPlayerProvider>
    </WalletProvider>
  );
}
