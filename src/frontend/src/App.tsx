import { useActor, useInternetIdentity } from "@caffeineai/core-infrastructure";
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
import { PaymentProvider, usePayment } from "./context/PaymentContext";
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
import { TransactionHistoryPage } from "./pages/TransactionHistoryPage";
import { UploadPage } from "./pages/UploadPage";

const DROPBOX_IMAGE =
  "https://dl.dropboxusercontent.com/scl/fi/aoe7dmzh7jqriugs8p9xl/Photo-Apr-05-2026-2-05-53-AM.png?rlkey=6squh6tpozf5ljw7gtiwl0ovz";

type View =
  | { type: "tab"; tab: Tab }
  | { type: "upload" }
  | { type: "capture-moment" }
  | { type: "profile" }
  | { type: "transactions" };

/** Fetch bytes from a blob URL or regular URL */
async function fetchBytes(url: string): Promise<Uint8Array> {
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  return new Uint8Array(buf);
}

/** Compute SHA-256 hex hash of a byte array using Web Crypto */
async function sha256Hex(data: Uint8Array): Promise<string> {
  const buffer = data.buffer.slice(
    data.byteOffset,
    data.byteOffset + data.byteLength,
  ) as ArrayBuffer;
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function AppContent() {
  const [view, setView] = useState<View>({ type: "tab", tab: "library" });
  const [showSplash, setShowSplash] = useState(true);
  const [pendingMintDraft, setPendingMintDraft] = useState<MomentDraft | null>(
    null,
  );
  const [showMintSetConfirmModal, setShowMintSetConfirmModal] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { startDraft } = useMomentDraft();
  const { addRelease } = useReleasesMarket();
  const { addClipToFeed } = useVideoFeed();
  const { actor } = useActor(createActor);
  const { recordMintFee } = usePayment();
  const { identity } = useInternetIdentity();

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
    setUploadError(null);
    setShowMintSetConfirmModal(true);
    setView({ type: "tab", tab: "library" });
  }

  async function handleMintSetConfirm() {
    if (!pendingMintDraft) return;
    const draft = pendingMintDraft;
    const now = Date.now();
    const priceUsd = 1;

    const releaseTitle = draft.title?.trim() || "Mint Moment";
    const releaseCaption = draft.caption?.trim() || "15-second moment";

    setIsMinting(true);
    setUploadError(null);

    let finalVideoUrl = draft.videoUrl ?? draft.videoBlobUrl ?? "";
    let finalPreviewUrl = draft.previewUrl ?? finalVideoUrl;
    let videoBytes: Uint8Array | null = null;

    // ── Step 1: Rate limit check ──────────────────────────────────────────────
    if (actor) {
      try {
        const rateResult = await actor.checkMintRateLimit();
        if (rateResult.__kind__ === "err") {
          setUploadError(rateResult.err);
          setIsMinting(false);
          setUploadStatus(null);
          return;
        }
      } catch (err) {
        console.warn("[Mint] checkMintRateLimit failed (non-fatal):", err);
      }
    }

    // ── Step 2: Upload video blob to backend storage ──────────────────────────
    if (actor) {
      const blobUrl = draft.videoBlobUrl ?? draft.videoUrl;
      const previewBlobUrl = draft.previewUrl ?? blobUrl;

      if (blobUrl) {
        try {
          setUploadStatus("Uploading video…");
          videoBytes = await fetchBytes(blobUrl);
          finalVideoUrl = await actor.uploadVideoBlob(videoBytes, "video/mp4");
        } catch (err) {
          console.error("[Mint] uploadVideoBlob failed:", err);
          setUploadError("Video upload failed. Please try again.");
          setIsMinting(false);
          setUploadStatus(null);
          return;
        }
      }

      if (previewBlobUrl) {
        try {
          setUploadStatus("Uploading preview…");
          const previewBytes = await fetchBytes(previewBlobUrl);
          finalPreviewUrl = await actor.uploadPreviewBlob(
            previewBytes,
            "video/mp4",
          );
        } catch (err) {
          console.warn("[Mint] uploadPreviewBlob failed (non-fatal):", err);
          finalPreviewUrl = finalVideoUrl;
        }
      }
    }

    // ── Step 3: Duplicate video hash check ────────────────────────────────────
    if (actor && videoBytes) {
      try {
        setUploadStatus("Verifying video…");
        const hexHash = await sha256Hex(videoBytes);
        const hashResult = await actor.recordVideoHash(hexHash);
        if (hashResult.__kind__ === "err") {
          setUploadError(
            hashResult.err === "duplicate"
              ? "Duplicate video detected. This clip has already been minted."
              : hashResult.err,
          );
          setIsMinting(false);
          setUploadStatus(null);
          return;
        }
      } catch (err) {
        console.warn("[Mint] recordVideoHash failed (non-fatal):", err);
      }
    }

    setUploadStatus("Minting NFT…");

    // ── Step 4: Call createClip with persistent URLs ───────────────────────────
    let clipId: string | null = null;
    if (actor && finalVideoUrl) {
      try {
        clipId = await actor.createClip(
          finalVideoUrl,
          finalPreviewUrl,
          releaseTitle || null,
          (draft.hashtags ?? []).map((h) => (h.startsWith("#") ? h : `#${h}`)),
          draft.explicit ?? false,
        );
      } catch (err) {
        console.error("[Mint] createClip failed:", err);
        // Continue with optimistic local update — clip still visible in feed this session
      }
    }

    // ── Step 5: Init bonding curve for new clip ────────────────────────────────
    if (actor && clipId) {
      try {
        await actor.initBondingCurve(clipId);
      } catch (err) {
        console.warn("[Mint] initBondingCurve failed (non-fatal):", err);
      }
    }

    // ── Step 6: Record $1 mint fee (non-blocking) ─────────────────────────────
    if (identity) {
      const creatorPrincipal = identity.getPrincipal();
      recordMintFee(creatorPrincipal).catch((err) =>
        console.error("[Mint] recordMintFee failed:", err),
      );
    }

    const totalPacks = 300;
    const packIds = Array.from(
      { length: totalPacks },
      (_, idx) => `pack_${draft.id}_${idx}`,
    );

    const release: MarketRelease = {
      id: `release_mint_${draft.id}`,
      creatorName: "You",
      creatorId: "you",
      coverImageUrl: DROPBOX_IMAGE,
      previewClipUrl: finalPreviewUrl || undefined,
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

    // ── Step 7: Add optimistically to Releases feed ───────────────────────────
    if (finalVideoUrl) {
      const clip: VideoClip = {
        id: clipId ?? `clip_mint_${draft.id}`,
        videoUrl: finalVideoUrl,
        previewUrl: finalPreviewUrl,
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
      };
      addClipToFeed(clip);
    }

    setIsMinting(false);
    setUploadStatus(null);
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
            setUploadError(null);
            setUploadStatus(null);
          }
        }}
        onConfirm={handleMintSetConfirm}
        uploadStatus={uploadStatus}
        uploadError={uploadError}
      />

      <TopBar onProfileClick={() => setView({ type: "profile" })} />
      <main className="pt-16 pb-[68px] min-h-screen">
        {view.type === "tab" && view.tab === "library" && (
          <LibraryPage
            onBrowseReleases={() => setView({ type: "tab", tab: "releases" })}
            onCaptureMoment={handleCaptureMoment}
            onViewTransactions={() => setView({ type: "transactions" })}
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
        {view.type === "transactions" && (
          <TransactionHistoryPage
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
                            <PaymentProvider>
                              <ErrorBoundary>
                                <AppContent />
                              </ErrorBoundary>
                            </PaymentProvider>
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
