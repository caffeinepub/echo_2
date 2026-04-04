import { useEffect, useState } from "react";
import { ThemeProvider } from "./ThemeContext";
import { BottomNav, type Tab } from "./components/BottomNav";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { SetPackPriceModal } from "./components/SetPackPriceModal";
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
import { UserSettingsProvider } from "./context/UserSettingsContext";
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

const PRICE_TO_HOURS: Record<number, number> = {
  1: 24,
  5: 12,
  20: 8,
  50: 4,
  100: 1,
};

function AppContent() {
  const [view, setView] = useState<View>({ type: "tab", tab: "library" });
  const [showSplash, setShowSplash] = useState(true);
  const [pendingMintDraft, setPendingMintDraft] = useState<MomentDraft | null>(
    null,
  );
  const [showPackPriceModal, setShowPackPriceModal] = useState(false);
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

  // When a creator completes capture, store the draft and show the pricing modal
  // before anything is published to Releases.
  function handleMintComplete(draft: MomentDraft) {
    setPendingMintDraft(draft);
    setShowPackPriceModal(true);
    setView({ type: "tab", tab: "library" });
  }

  // Called when the creator confirms a price in SetPackPriceModal.
  // Contains all pack-generation logic; uses user-selected price + matching duration.
  function handleConfirmPackPrice(priceUsd: number) {
    if (!pendingMintDraft) return;
    const draft = pendingMintDraft;
    const now = Date.now();
    const totalPacks = 100; // always 100 packs per Mint Moment set

    const hours = PRICE_TO_HOURS[priceUsd] ?? 24;

    // 90/10 split — round to integers, ensure they sum to totalPacks
    const videoCount = Math.max(1, Math.round(totalPacks * 0.1));
    const photoCount = totalPacks - videoCount;

    // Build assignment pool: photoCount slots + videoCount slots
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

    // Use the dedicated cover photo if captured; otherwise fall back to collectible photo (legacy compat)
    const coverImageUrl =
      draft.coverPhoto ??
      (draft.photos.length > 0
        ? (draft.photos[draft.coverIndex ?? 0] ?? draft.photos[0])
        : "https://images.pokemontcg.io/sv1/025_hires.png");

    const packIds = pool.map((_, idx) => `pack_${draft.id}_${idx}`);

    // Use title/caption/explicit from FinalSetupScreen fields
    const releaseTitle = draft.title?.trim() || "Mint Moment";
    const releaseCaption =
      draft.caption?.trim() ||
      `${photoCount} photos · ${videoCount} video · ${totalPacks} packs`;

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
      expiresAt: now + hours * 3600000,
      status: "active",
      collectibleType: "photo",
      explicit: draft.explicit ?? false,
    };

    addRelease(release);
    setPendingMintDraft(null);
    setShowPackPriceModal(false);
  }

  return (
    <div className="min-h-screen bg-background">
      {showSplash && <SplashScreen />}

      {/* Pack Price Modal — intercepts between capture-complete and Releases listing */}
      {showPackPriceModal && pendingMintDraft && (
        <SetPackPriceModal
          onConfirm={handleConfirmPackPrice}
          onClose={() => handleConfirmPackPrice(1)}
        />
      )}

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
    <UserSettingsProvider>
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
    </UserSettingsProvider>
  );
}
