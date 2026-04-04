import { useEffect, useState } from "react";
import { ThemeProvider } from "./ThemeContext";
import { BottomNav, type Tab } from "./components/BottomNav";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { SplashScreen } from "./components/SplashScreen";
import { TopBar } from "./components/TopBar";
import { AdminReleasesProvider } from "./context/AdminReleasesContext";
import { CollectionProvider, useCollection } from "./context/CollectionContext";
import type { SealedPack } from "./context/CollectionContext";
import {
  MomentDraftProvider,
  useMomentDraft,
} from "./context/MomentDraftContext";
import type { MomentDraft } from "./context/MomentDraftContext";
import { ReleasesMarketProvider } from "./context/ReleasesMarketContext";
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
  const { addSealedPacks } = useCollection();

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

  function handleMintComplete(draft: MomentDraft) {
    const now = Date.now();
    const newPacks: SealedPack[] = [];

    draft.photos.forEach((photoUrl, idx) => {
      const nftId = `nft_${draft.id}_photo_${idx}`;
      newPacks.push({
        id: `pack_${draft.id}_photo_${idx}`,
        setName: "My Mint Moment",
        editionNumber: idx + 1,
        totalSupply: draft.photos.length + (draft.video ? 1 : 0),
        collectibleType: "photo",
        pendingNFT: {
          id: nftId,
          title: `Moment Photo ${idx + 1}`,
          setName: "My Mint Moment",
          editionNumber: idx + 1,
          totalSupply: draft.photos.length + (draft.video ? 1 : 0),
          mediaType: "photo",
          imageUrl: photoUrl,
          rarity: "Common",
          mintDate: new Date(now).toISOString(),
          creator: "You",
          owners: ["you"],
          views: 0,
          isLeader: false,
          hasOwnershipHistory: false,
          addedAt: now + idx,
        },
        createdAt: now + idx,
      });
    });

    if (draft.video) {
      newPacks.push({
        id: `pack_${draft.id}_video`,
        setName: "My Mint Moment",
        editionNumber: draft.photos.length + 1,
        totalSupply: draft.photos.length + 1,
        collectibleType: "video",
        pendingNFT: {
          id: `nft_${draft.id}_video`,
          title: "Moment Video",
          setName: "My Mint Moment",
          editionNumber: draft.photos.length + 1,
          totalSupply: draft.photos.length + 1,
          mediaType: "video",
          imageUrl: "https://images.pokemontcg.io/sv1/025_hires.png",
          rarity: "Rare",
          mintDate: new Date(now).toISOString(),
          creator: "You",
          owners: ["you"],
          views: 0,
          isLeader: false,
          hasOwnershipHistory: false,
          addedAt: now + draft.photos.length,
        },
        createdAt: now + draft.photos.length,
      });
    }

    if (newPacks.length > 0) {
      addSealedPacks(newPacks);
    }
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
