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
import {
  WeeklyRoundProvider,
  useWeeklyRound,
} from "./context/WeeklyRoundContext";
import { InternetIdentityProvider } from "./hooks/useInternetIdentity";
import { CaptureMomentPage } from "./pages/CaptureMomentPage";
import { CollectionPage } from "./pages/CollectionPage";
import { LibraryPage } from "./pages/LibraryPage";
import { ProfilePage } from "./pages/ProfilePage";
import ReleasesPage from "./pages/ReleasesPage";
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
  const { roundId: currentRoundId } = useWeeklyRound();

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

    // Simulate $1 minting fee payment
    console.log("[Minty] Minting fee: $1 in BTC deducted");

    const coverImageUrl =
      draft.photos.length > 0
        ? draft.photos[0]
        : "/assets/generated/minty-pack-wrapper.png";

    const releaseTitle = draft.title?.trim() || "Untitled Moment";
    const releaseCaption = draft.caption?.trim() || "";

    const release: MarketRelease = {
      id: `nft_${draft.id}_${now}`,
      creatorName: "You",
      creatorId: "you",
      coverImageUrl,
      previewClipUrl: draft.video ?? undefined,
      title: releaseTitle,
      caption: releaseCaption,
      setName: releaseTitle,
      packsAvailable: 1,
      packCount: 1,
      packIds: [],
      priceUsd: 1,
      listedAt: now,
      expiresAt: now + 7 * 24 * 3600000,
      status: "active",
      collectibleType: "photo",
      explicit: draft.explicit ?? false,
      hashtags: draft.hashtags ?? [],
      likes: 0,
      roundId: currentRoundId,
      isTop10: false,
      isDeletedAfterRound: false,
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
            onGoToLibrary={() => setView({ type: "tab", tab: "library" })}
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

/**
 * WeeklyRoundBridge sits inside ReleasesMarketProvider so it can access
 * finalizeRound from that context and pass it as onRoundEnd to WeeklyRoundProvider.
 */
function WeeklyRoundBridge({ children }: { children: React.ReactNode }) {
  const { finalizeRound } = useReleasesMarket();
  return (
    <WeeklyRoundProvider onRoundEnd={finalizeRound}>
      {children}
    </WeeklyRoundProvider>
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
                      <WeeklyRoundBridge>
                        <AuctionProvider>
                          <ErrorBoundary>
                            <AppContent />
                          </ErrorBoundary>
                        </AuctionProvider>
                      </WeeklyRoundBridge>
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
