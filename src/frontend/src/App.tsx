import { useActor } from "@caffeineai/core-infrastructure";
import { InternetIdentityProvider } from "@caffeineai/core-infrastructure";
import { useEffect, useState } from "react";
import { ThemeProvider } from "./ThemeContext";
import { createActor } from "./backend";
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
import { VideoFeedProvider, useVideoFeed } from "./context/VideoFeedContext";
import type { VideoClip } from "./context/VideoFeedContext";
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
  const [isMinting, setIsMinting] = useState(false);

  const { startDraft } = useMomentDraft();
  const { addRelease } = useReleasesMarket();
  const { addClipToFeed } = useVideoFeed();
  const { actor } = useActor(createActor);

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

  async function handleMintSetConfirm() {
    if (!pendingMintDraft) return;
    const draft = pendingMintDraft;
    const now = Date.now();
    const totalPacks = 300;
    const priceUsd = 1;

    const releaseTitle = draft.title?.trim() || "Mint Moment";
    const releaseCaption = draft.caption?.trim() || "15-second moment";

    // Use persistent storage URLs if available, fall back to blob URL for preview
    const videoUrl = draft.videoUrl ?? draft.videoBlobUrl ?? "";
    const previewUrl = draft.previewUrl ?? videoUrl;

    setIsMinting(true);

    // Call backend createClip with persistent URLs
    let clipId: string | null = null;
    if (actor && videoUrl) {
      try {
        clipId = await actor.createClip(
          videoUrl,
          previewUrl,
          releaseTitle || null,
          (draft.hashtags ?? []).map((h) => (h.startsWith("#") ? h : `#${h}`)),
          draft.explicit ?? false,
        );
      } catch (err) {
        console.error("[Mint] createClip failed:", err);
        // Continue with optimistic local update even if backend call fails
      }
    }

    const packIds = Array.from(
      { length: totalPacks },
      (_, idx) => `pack_${draft.id}_${idx}`,
    );

    const release: MarketRelease = {
      id: `release_mint_${draft.id}`,
      creatorName: "You",
      creatorId: "you",
      coverImageUrl: "/assets/generated/minty-pack-wrapper.png",
      previewClipUrl: previewUrl || undefined,
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

    // Add to Releases feed — use the clip_id from backend if available
    if (videoUrl) {
      const clip: VideoClip = {
        id: clipId ?? `clip_mint_${draft.id}`,
        videoUrl,
        previewUrl,
        creatorName: "You",
        creatorAvatar: null,
        creatorBio: "Creator",
        title: releaseTitle,
        hashtags: (draft.hashtags ?? []).map((h) =>
          h.startsWith("#") ? h : `#${h}`,
        ),
        explicitFlag: draft.explicit ?? false,
        likeCount: 0,
        timestamp: now,
        viralScore: 0,
      };
      addClipToFeed(clip);
    }

    setIsMinting(false);
    setPendingMintDraft(null);
    setShowMintSetConfirmModal(false);

    // Navigate to Releases so user sees their clip immediately
    setView({ type: "tab", tab: "releases" });
  }

  return (
    <div className="min-h-screen bg-background">
      {showSplash && <SplashScreen />}

      <MintSetConfirmModal
        open={showMintSetConfirmModal && pendingMintDraft !== null}
        onClose={() => {
          if (!isMinting) {
            setShowMintSetConfirmModal(false);
            setPendingMintDraft(null);
          }
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
