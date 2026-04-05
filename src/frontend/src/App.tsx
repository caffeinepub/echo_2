import { useEffect, useState } from "react";
import { ThemeProvider } from "./ThemeContext";
import { BottomNav, type Tab } from "./components/BottomNav";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { MintSetConfirmModal } from "./components/MintSetConfirmModal";
import { SplashScreen } from "./components/SplashScreen";
import { TopBar } from "./components/TopBar";
import { AdminReleasesProvider } from "./context/AdminReleasesContext";
import { AuctionProvider } from "./context/AuctionContext";
import { CollectionProvider } from "./context/CollectionContext";
import {
  MomentDraftProvider,
  useMomentDraft,
} from "./context/MomentDraftContext";
import type { MomentDraft } from "./context/MomentDraftContext";
import { PackStyleProvider } from "./context/PackStyleContext";
import {
  ReleasesMarketProvider,
  useReleasesMarket,
} from "./context/ReleasesMarketContext";
import type { MarketRelease } from "./context/ReleasesMarketContext";
import { UserSettingsProvider } from "./context/UserSettingsContext";
import { WalletProvider } from "./context/WalletContext";
import { InternetIdentityProvider } from "./hooks/useInternetIdentity";
import { CaptureMomentPage } from "./pages/CaptureMomentPage";
import { CardDetailPage } from "./pages/CardDetailPage";
import { CollectionPage } from "./pages/CollectionPage";
import { LibraryPage } from "./pages/LibraryPage";
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
  | { type: "capture-moment" }
  | { type: "profile" };

function AppContent() {
  const [view, setView] = useState<View>({ type: "tab", tab: "library" });
  const [showSplash, setShowSplash] = useState(true);
  const [pendingMintDraft, setPendingMintDraft] = useState<MomentDraft | null>(
    null,
  );
  const [showMintSetConfirmModal, setShowMintSetConfirmModal] = useState(false);
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

  function handleMintComplete(draft: MomentDraft) {
    setPendingMintDraft(draft);
    setShowMintSetConfirmModal(true);
    setView({ type: "tab", tab: "library" });
  }

  function handleMintSetConfirm() {
    if (!pendingMintDraft) return;
    const draft = pendingMintDraft;
    const now = Date.now();
    const totalPacks = 300;
    const priceUsd = 10; // bonding curve starting price

    // Simulate $100 minting fee payment
    console.log("[Minty] Minting fee: $100 deducted");

    const videoCount = Math.max(1, Math.round(totalPacks * 0.1));
    const photoCount = totalPacks - videoCount;

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

    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    const coverImageUrl =
      draft.coverPhoto ??
      (draft.photos.length > 0
        ? (draft.photos[draft.coverIndex ?? 0] ?? draft.photos[0])
        : "https://images.pokemontcg.io/sv1/025_hires.png");

    const packIds = pool.map((_, idx) => `pack_${draft.id}_${idx}`);

    const releaseTitle = draft.title?.trim() || "Mint Moment";
    const releaseCaption =
      draft.caption?.trim() ||
      `${photoCount} photos \u00b7 ${videoCount} video \u00b7 ${totalPacks} packs`;

    const release: MarketRelease = {
      id: `release_mint_${draft.id}`,
      creatorName: "You",
      creatorId: "you",
      coverImageUrl,
      previewClipUrl: draft.video ?? undefined,
      title: releaseTitle,
      caption: releaseCaption,
      setName: releaseTitle,
      packsAvailable: totalPacks,
      packCount: totalPacks,
      packIds,
      priceUsd,
      listedAt: now,
      // Standardized releases: 1 year expiry (no burn for normal releases)
      expiresAt: now + 365 * 24 * 3600000,
      status: "active",
      collectibleType: "photo",
      explicit: draft.explicit ?? false,
      hashtags: draft.hashtags ?? [],
    };

    addRelease(release);
    setPendingMintDraft(null);
    setShowMintSetConfirmModal(false);
  }

  return (
    <div className="min-h-screen bg-background">
      {showSplash && <SplashScreen />}

      <MintSetConfirmModal
        open={showMintSetConfirmModal && pendingMintDraft !== null}
        onClose={() => {
          setShowMintSetConfirmModal(false);
          setPendingMintDraft(null);
        }}
        onConfirm={handleMintSetConfirm}
      />

      <TopBar onProfileClick={() => setView({ type: "profile" })} />
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
    <UserSettingsProvider>
      <ThemeProvider>
        <PackStyleProvider>
          <InternetIdentityProvider>
            <WalletProvider>
              <AdminReleasesProvider>
                <MomentDraftProvider>
                  <CollectionProvider>
                    <ReleasesMarketProvider>
                      <AuctionProvider>
                        <AppContent />
                      </AuctionProvider>
                    </ReleasesMarketProvider>
                  </CollectionProvider>
                </MomentDraftProvider>
              </AdminReleasesProvider>
            </WalletProvider>
          </InternetIdentityProvider>
        </PackStyleProvider>
      </ThemeProvider>
    </UserSettingsProvider>
  );
}
