import { InternetIdentityProvider } from "@caffeineai/core-infrastructure";
import { useEffect, useState } from "react";
import { ThemeProvider } from "./ThemeContext";
import { BottomNav, type Tab } from "./components/BottomNav";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { MintSetConfirmModal } from "./components/MintSetConfirmModal";
import { SplashScreen } from "./components/SplashScreen";
import { TopBar } from "./components/TopBar";
import { AdminReleasesProvider } from "./context/AdminReleasesContext";
import { AuctionProvider } from "./context/AuctionContext";
import { BondingCurveProvider } from "./context/BondingCurveContext";
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
import { VideoFeedProvider } from "./context/VideoFeedContext";
import { WalletProvider } from "./context/WalletContext";
import { CaptureMomentPage } from "./pages/CaptureMomentPage";
import { CollectionPage } from "./pages/CollectionPage";
import { LibraryPage } from "./pages/LibraryPage";
import { MarketPage } from "./pages/MarketPage";
import { ProfilePage } from "./pages/ProfilePage";
import { ReleasesPage } from "./pages/ReleasesPage";
import { UploadPage } from "./pages/UploadPage";
import { seedMockData } from "./store/seedMockData";

type View =
  | { type: "tab"; tab: Tab }
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

  const activeTab: Tab = view.type === "tab" ? view.tab : "library";

  function handleTabChange(tab: Tab) {
    setView({ type: "tab", tab });
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
    const priceUsd = 1;

    const packIds = Array.from(
      { length: totalPacks },
      (_, idx) => `pack_${draft.id}_${idx}`,
    );

    const releaseTitle = draft.title?.trim() || "Mint Moment";
    const releaseCaption = draft.caption?.trim() || "15-second moment";

    const release: MarketRelease = {
      id: `release_mint_${draft.id}`,
      creatorName: "You",
      creatorId: "you",
      coverImageUrl: "/assets/generated/minty-pack-wrapper.png",
      previewClipUrl: draft.video ?? undefined,
      title: releaseTitle,
      caption: releaseCaption,
      setName: releaseTitle,
      packsAvailable: totalPacks,
      packCount: totalPacks,
      packIds,
      priceUsd,
      listedAt: now,
      expiresAt: now + 365 * 24 * 3600000,
      status: "active",
      collectibleType: "video",
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
        {view.type === "tab" && view.tab === "collection" && (
          <CollectionPage
            onGoToLibrary={() => setView({ type: "tab", tab: "releases" })}
          />
        )}
        {view.type === "tab" && view.tab === "market" && <MarketPage />}
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
                        <VideoFeedProvider>
                          <BondingCurveProvider>
                            <AppContent />
                          </BondingCurveProvider>
                        </VideoFeedProvider>
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
