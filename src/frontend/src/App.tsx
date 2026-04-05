import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ThemeProvider } from "./ThemeContext";
import { ExternalBlob } from "./backend";
import { BottomNav, type Tab } from "./components/BottomNav";
import { MintSetConfirmModal } from "./components/MintSetConfirmModal";
import { SplashScreen } from "./components/SplashScreen";
import { TopBar } from "./components/TopBar";
import { CollectionProvider } from "./context/CollectionContext";
import {
  type MomentDraft,
  MomentDraftProvider,
  useMomentDraft,
} from "./context/MomentDraftContext";
import { PackStyleProvider } from "./context/PackStyleContext";
import { UserSettingsProvider } from "./context/UserSettingsContext";
import { WalletProvider } from "./context/WalletContext";
import { useActor } from "./hooks/useActor";
import { InternetIdentityProvider } from "./hooks/useInternetIdentity";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { CaptureMomentPage } from "./pages/CaptureMomentPage";
import { CollectionPage } from "./pages/CollectionPage";
import { LibraryPage } from "./pages/LibraryPage";
import { PetPage } from "./pages/PetPage";
import { ProfilePage } from "./pages/ProfilePage";
import { seedMockData } from "./store/seedMockData";

type View =
  | { type: "tab"; tab: Tab }
  | { type: "capture-moment" }
  | { type: "profile" };

// ─── Preview clip generation ─────────────────────────────────────────────────
async function generatePreviewClip(videoBlobUrl: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.src = videoBlobUrl;
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = "anonymous";

    const canvas = document.createElement("canvas");
    let stream: MediaStream | null = null;
    let recorder: MediaRecorder | null = null;
    const chunks: BlobPart[] = [];

    const cleanup = () => {
      video.pause();
      for (const t of stream?.getTracks() ?? []) {
        t.stop();
      }
    };

    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth || 1080;
      canvas.height = video.videoHeight || 1350;

      try {
        stream = canvas.captureStream(30);
        recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
      } catch {
        try {
          stream = canvas.captureStream(30);
          recorder = new MediaRecorder(stream);
        } catch (e) {
          reject(e);
          return;
        }
      }

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      recorder.onstop = () => {
        cleanup();
        resolve(new Blob(chunks, { type: "video/webm" }));
      };

      recorder.start();
      video.play().catch(() => {});

      const ctx = canvas.getContext("2d");
      let elapsed = 0;
      const interval = setInterval(() => {
        if (ctx) ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        elapsed += 1 / 30;
        if (elapsed >= 2) {
          clearInterval(interval);
          if (recorder && recorder.state !== "inactive") recorder.stop();
        }
      }, 1000 / 30);

      // Safety timeout
      setTimeout(() => {
        clearInterval(interval);
        if (recorder && recorder.state !== "inactive") recorder.stop();
      }, 3000);
    };

    video.onerror = () => reject(new Error("Video load failed"));
    video.load();
  });
}

function AppContent() {
  const [view, setView] = useState<View>({ type: "tab", tab: "library" });
  const [showSplash, setShowSplash] = useState(true);
  const [pendingMintDraft, setPendingMintDraft] = useState<MomentDraft | null>(
    null,
  );
  const [showMintSetConfirmModal, setShowMintSetConfirmModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const { startDraft, media, clearDraft } = useMomentDraft();
  const { actor } = useActor();
  const { identity } = useInternetIdentity();

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

    // ── If we have an actor, upload to backend ────────────────────────────
    if (actor) {
      setIsUploading(true);
      try {
        // Upload images in parallel
        const imageUrls = await Promise.all(
          media.images.map(async (file) => {
            const ab = await file.arrayBuffer();
            const blob = ExternalBlob.fromBytes(new Uint8Array(ab));
            return blob.getDirectURL();
          }),
        );

        // Upload video
        let videoUrl = "";
        if (media.videoFile) {
          const ab = await media.videoFile.arrayBuffer();
          const blob = ExternalBlob.fromBytes(new Uint8Array(ab));
          videoUrl = blob.getDirectURL();
        }

        // Generate & upload preview clip
        let previewClipUrl = videoUrl;
        if (media.videoPreviewUrl) {
          try {
            const previewBlob = await generatePreviewClip(
              media.videoPreviewUrl,
            );
            const ab = await previewBlob.arrayBuffer();
            const extBlob = ExternalBlob.fromBytes(new Uint8Array(ab));
            previewClipUrl = extBlob.getDirectURL();
          } catch {
            // Fall back to full video URL
            previewClipUrl = videoUrl;
          }
        }

        // Cover image = first image (or empty string)
        const coverImageUrl = imageUrls[0] ?? "";

        const principal = identity?.getPrincipal();
        if (!principal) throw new Error("Not authenticated");

        const setInput = {
          id: draft.id,
          title: draft.title,
          creator: principal,
          hashtags: draft.hashtags,
          video: videoUrl,
          explicit: draft.explicit,
          coverImage: coverImageUrl,
          pricePerPackUsd: BigInt(Math.round(draft.pricePerPackUsd * 100)),
          caption: draft.caption,
          previewClip: previewClipUrl,
          images: imageUrls,
        };

        await actor.createMintySet(setInput);

        clearDraft();
        toast.success("Moment minted!");
      } catch (err) {
        console.error("[Minty] Mint failed:", err);
        toast.error("Mint failed. Please try again.");
      } finally {
        setIsUploading(false);
        setPendingMintDraft(null);
        setShowMintSetConfirmModal(false);
      }
      return;
    }

    // ── Fallback: no actor — local only ──────────────────────────────────
    clearDraft();
    setPendingMintDraft(null);
    setShowMintSetConfirmModal(false);
    toast.success("Moment minted!");
  }

  return (
    <div className="min-h-screen bg-background">
      {showSplash && <SplashScreen />}

      {/* Uploading overlay */}
      {isUploading && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9998,
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(8px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
          }}
          data-ocid="mint.loading_state"
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: "3px solid rgba(126,214,177,0.3)",
              borderTopColor: "#7ED6B1",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <p
            style={{
              color: "#fff",
              fontSize: "15px",
              fontWeight: 600,
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            Uploading media…
          </p>
          <p
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: "12px",
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            This may take a moment
          </p>
        </div>
      )}

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
          <LibraryPage onCaptureMoment={handleCaptureMoment} />
        )}
        {view.type === "tab" && view.tab === "collection" && (
          <CollectionPage
            onGoToLibrary={() => setView({ type: "tab", tab: "library" })}
          />
        )}
        {view.type === "tab" && view.tab === "pet" && <PetPage />}
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
              <MomentDraftProvider>
                <CollectionProvider>
                  <AppContent />
                </CollectionProvider>
              </MomentDraftProvider>
            </WalletProvider>
          </InternetIdentityProvider>
        </PackStyleProvider>
      </ThemeProvider>
    </UserSettingsProvider>
  );
}
