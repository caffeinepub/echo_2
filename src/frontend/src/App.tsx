import { useEffect, useState } from "react";
import { ThemeProvider } from "./ThemeContext";
import { BottomNav, type Tab } from "./components/BottomNav";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { SplashScreen } from "./components/SplashScreen";
import { TopBar } from "./components/TopBar";
import { AdminReleasesProvider } from "./context/AdminReleasesContext";
import { CollectionProvider } from "./context/CollectionContext";
import {
  MomentDraftProvider,
  useMomentDraft,
} from "./context/MomentDraftContext";
import type { MomentDraft } from "./context/MomentDraftContext";
import {
  ReleasesMarketProvider,
  useReleasesMarket,
} from "./context/ReleasesMarketContext";
import type { MarketRelease } from "./context/ReleasesMarketContext";
import { WalletProvider } from "./context/WalletContext";
import { InternetIdentityProvider } from "./hooks/useInternetIdentity";
import { CaptureMomentPage } from "./pages/CaptureMomentPage";
import { CardDetailPage } from "./pages/CardDetailPage";
import { CollectionPage } from "./pages/CollectionPage";
import { LibraryPage } from "./pages/LibraryPage";
import { ManageCatalogPage } from "./pages/ManageCatalogPage";
import { MarketDetailPage } from "./pages/MarketDetailPage";
import { MarketPage } from "./pages/MarketPage";
import { ProfilePage } from "./pages/ProfilePage";
import { ReleasesPage } from "./pages/ReleasesPage";
import SetDetailPage from "./pages/SetDetailPage";
import { UploadPage } from "./pages/UploadPage";
import { seedMockData } from "./store/seedMockData";

type View =
  | { type: "tab"; tab: Tab }
  | { type: "set-detail"; slug: string }
  | { type: "market-detail"; id: string }
  | { type: "card-detail"; id: string }
  | { type: "upload" }
  | { type: "admin" }
  | { type: "capture-moment" }
  | { type: "profile" };

function AppContent() {
  const [view, setView] = useState<View>({ type: "tab", tab: "library" });
  const [showSplash, setShowSplash] = useState(true);
  const { startDraft } = useMomentDraft();
  const { addRelease } = useReleasesMarket();

  useEffect(() => {
    seedMockData();
  }, []);

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
  function handleCaptureMoment() {
    startDraft();
    setView({ type: "capture-moment" });
  }

  // When a creator completes a Mint Moment, all generated packs are
  // automatically listed in Releases — not stored in the creator's Collection.
  // The creator is the origin of the set but not the holder of the packs.
  function handleMintComplete(draft: MomentDraft) {
    const now = Date.now();
    const totalPacks = draft.packSupply ?? 100;

    // 90/10 split — round to integers, ensure they sum to totalPacks
    const videoCount = Math.max(1, Math.round(totalPacks * 0.1));
    const photoCount = totalPacks - videoCount;

    // Build assignment pool: photoCount slots + videoCount slots
    // Photo slots are numbered 1..photoCount, video slots 1..videoCount
    type SlotPhoto = { type: "photo"; num: number };
    type SlotVideo = { type: "video"; num: number };
    type Slot = SlotPhoto | SlotVideo;

    const pool: Slot[] = [
      ...Array.from({ length: photoCount }, (_, i) => ({
        type: "photo" as const,
        num: i + 1,
      })),
      ...Array.from({ length: videoCount }, (_, i) => ({
        type: "video" as const,
        num: i + 1,
      })),
    ];

    // Fisher-Yates shuffle — randomizes which packs get photo vs video
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    const coverImageUrl =
      draft.photos.length > 0
        ? draft.photos[0]
        : "https://images.pokemontcg.io/sv1/025_hires.png";

    const packIds = pool.map((_, idx) => `pack_${draft.id}_${idx}`);

    const release: MarketRelease = {
      id: `release_mint_${draft.id}`,
      creatorName: "You",
      coverImageUrl,
      previewClipUrl: draft.video ?? undefined,
      title: "My Mint Moment",
      caption: `${photoCount} photos · ${videoCount} video · ${totalPacks} packs`,
      setName: "My Mint Moment",
      packsAvailable: totalPacks,
      packIds,
      priceUsd: 3.0,
      listedAt: now,
      expiresAt: now + 24 * 3600000,
      status: "active",
      collectibleType: "photo",
    };

    addRelease(release);
  }

  return (
    <div className="min-h-screen bg-background">
      {showSplash && <SplashScreen />}
      <TopBar
        onAdminClick={() => setView({ type: "admin" })}
        onProfileClick={() => setView({ type: "profile" })}
      />
      <main className="pt-16 pb-[68px] min-h-screen">
        {view.type === "tab" && view.tab === "library" && (
          <LibraryPage
            onBrowseReleases={() => setView({ type: "tab", tab: "releases" })}
            onCaptureMoment={handleCaptureMoment}
          />
        )}
        {view.type === "tab" && view.tab === "releases" && <ReleasesPage />}
        {view.type === "tab" && view.tab === "market" && (
          <ErrorBoundary
            fallback={
              <div style={{ padding: "32px 16px", textAlign: "center" }}>
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#111",
                    marginBottom: "4px",
                  }}
                >
                  Unable to load Discover items
                </p>
                <p style={{ fontSize: "12px", color: "#6b7280" }}>
                  Please refresh and try again.
                </p>
              </div>
            }
          >
            <MarketPage
              onAlbumClick={handleMarketItemClick}
              onSetClick={handleSetClick}
            />
          </ErrorBoundary>
        )}
        {view.type === "tab" && view.tab === "collection" && (
          <CollectionPage
            onGoToLibrary={() => setView({ type: "tab", tab: "library" })}
          />
        )}
        {view.type === "set-detail" && (
          <SetDetailPage
            slug={view.slug}
            onBack={() => setView({ type: "tab", tab: "market" })}
          />
        )}
        {view.type === "card-detail" && (
          <CardDetailPage
            id={view.id}
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
          <ManageCatalogPage
            onBack={() => setView({ type: "tab", tab: "library" })}
          />
        )}
        {view.type === "capture-moment" && (
          <CaptureMomentPage
            onBack={() => setView({ type: "tab", tab: "library" })}
            onMintComplete={handleMintComplete}
          />
        )}
        {view.type === "profile" && (
          <ProfilePage
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
            <MomentDraftProvider>
              <CollectionProvider>
                <ReleasesMarketProvider>
                  <AppContent />
                </ReleasesMarketProvider>
              </CollectionProvider>
            </MomentDraftProvider>
          </AdminReleasesProvider>
        </WalletProvider>
      </InternetIdentityProvider>
    </ThemeProvider>
  );
}
