import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const LS_KEY = "minty_active_draft";

export interface CaptureMetadataItem {
  sequenceIndex: number; // 0 for the single photo
  capturedAt: number; // Date.now() at capture time
  mediaType: "photo" | "video";
}

export interface MomentDraft {
  id: string;
  photos: string[]; // data URLs or object URLs — max 1
  video: string | null; // kept for backwards-compat; always null in new flow
  completed: boolean;
  createdAt: number;
  captureMetadata: CaptureMetadataItem[];
  packSupply: number; // how many packs the creator wants to mint
  // Content labeling fields (filled in FinalSetupScreen)
  title: string;
  caption: string;
  explicit: boolean;
  hashtags: string[]; // structured array, e.g. ["nightdrive", "citylights"]
}

interface MomentDraftCtx {
  activeDraft: MomentDraft | null;
  hasDraft: boolean; // exists and !completed
  startDraft: () => void;
  addPhoto: (dataUrl: string, capturedAt?: number) => void;
  removePhoto: (index: number) => void;
  removeVideo: () => void;
  completeDraft: () => void;
  clearDraft: () => void;
  setPackSupply: (n: number) => void;
  setTitle: (title: string) => void;
  setCaption: (caption: string) => void;
  setExplicit: (explicit: boolean) => void;
  setHashtags: (tags: string[]) => void;
}

const MomentDraftContext = createContext<MomentDraftCtx | null>(null);

function loadFromStorage(): MomentDraft | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MomentDraft;
    // Backfill captureMetadata for drafts saved before this field existed
    if (!parsed.captureMetadata) {
      parsed.captureMetadata = [];
    }
    // Backfill packSupply for drafts saved before this field existed
    if (!parsed.packSupply || parsed.packSupply < 10) {
      parsed.packSupply = 300;
    }
    // Backfill content labeling fields
    if (parsed.title === undefined) parsed.title = "";
    if (parsed.caption === undefined) parsed.caption = "";
    if (parsed.explicit === undefined) parsed.explicit = false;
    // Backfill hashtags
    if (!parsed.hashtags) parsed.hashtags = [];
    return parsed;
  } catch {
    return null;
  }
}

function saveToStorage(draft: MomentDraft | null) {
  try {
    if (draft === null) {
      localStorage.removeItem(LS_KEY);
    } else {
      localStorage.setItem(LS_KEY, JSON.stringify(draft));
    }
  } catch {
    // ignore storage errors
  }
}

export function MomentDraftProvider({
  children,
}: { children: React.ReactNode }) {
  const [activeDraft, setActiveDraft] = useState<MomentDraft | null>(() =>
    loadFromStorage(),
  );

  const hasDraft = activeDraft !== null && !activeDraft.completed;

  // Persist whenever draft changes
  useEffect(() => {
    saveToStorage(activeDraft);
  }, [activeDraft]);

  const startDraft = useCallback(() => {
    setActiveDraft((prev) => {
      // Idempotent — if an active incomplete draft already exists, keep it
      if (prev !== null && !prev.completed) return prev;
      const draft: MomentDraft = {
        id: `draft_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        photos: [],
        video: null,
        completed: false,
        createdAt: Date.now(),
        captureMetadata: [],
        packSupply: 300,
        title: "",
        caption: "",
        explicit: false,
        hashtags: [],
      };
      return draft;
    });
  }, []);

  const addPhoto = useCallback((dataUrl: string, capturedAt?: number) => {
    setActiveDraft((prev) => {
      if (!prev || prev.completed) return prev;
      // Only allow 1 photo
      if (prev.photos.length >= 1) return prev;
      const sequenceIndex = 0;
      const meta: CaptureMetadataItem = {
        sequenceIndex,
        capturedAt: capturedAt ?? Date.now(),
        mediaType: "photo",
      };
      return {
        ...prev,
        photos: [...prev.photos, dataUrl],
        captureMetadata: [...prev.captureMetadata, meta],
      };
    });
  }, []);

  const removePhoto = useCallback((index: number) => {
    setActiveDraft((prev) => {
      if (!prev || prev.completed) return prev;
      const updatedPhotos = [...prev.photos];
      updatedPhotos.splice(index, 1);
      const updatedMeta = prev.captureMetadata.filter(
        (m) => !(m.mediaType === "photo" && m.sequenceIndex === index),
      );
      return { ...prev, photos: updatedPhotos, captureMetadata: updatedMeta };
    });
  }, []);

  const removeVideo = useCallback(() => {
    setActiveDraft((prev) => {
      if (!prev || prev.completed) return prev;
      return {
        ...prev,
        video: null,
        captureMetadata: prev.captureMetadata.filter(
          (m) => m.mediaType !== "video",
        ),
      };
    });
  }, []);

  const completeDraft = useCallback(() => {
    setActiveDraft((prev) => {
      if (!prev) return prev;
      return { ...prev, completed: true };
    });
  }, []);

  const clearDraft = useCallback(() => {
    setActiveDraft(null);
  }, []);

  const setPackSupply = useCallback((n: number) => {
    setActiveDraft((prev) => {
      if (!prev || prev.completed) return prev;
      return { ...prev, packSupply: Math.max(10, Math.min(10000, n)) };
    });
  }, []);

  const setTitle = useCallback((title: string) => {
    setActiveDraft((prev) => {
      if (!prev || prev.completed) return prev;
      return { ...prev, title };
    });
  }, []);

  const setCaption = useCallback((caption: string) => {
    setActiveDraft((prev) => {
      if (!prev || prev.completed) return prev;
      return { ...prev, caption };
    });
  }, []);

  const setExplicit = useCallback((explicit: boolean) => {
    setActiveDraft((prev) => {
      if (!prev || prev.completed) return prev;
      return { ...prev, explicit };
    });
  }, []);

  const setHashtags = useCallback((tags: string[]) => {
    setActiveDraft((prev) => {
      if (!prev || prev.completed) return prev;
      return { ...prev, hashtags: tags.slice(0, 3) };
    });
  }, []);

  return (
    <MomentDraftContext.Provider
      value={{
        activeDraft,
        hasDraft,
        startDraft,
        addPhoto,
        removePhoto,
        removeVideo,
        completeDraft,
        clearDraft,
        setPackSupply,
        setTitle,
        setCaption,
        setExplicit,
        setHashtags,
      }}
    >
      {children}
    </MomentDraftContext.Provider>
  );
}

export function useMomentDraft(): MomentDraftCtx {
  const ctx = useContext(MomentDraftContext);
  if (!ctx) {
    throw new Error("useMomentDraft must be used inside MomentDraftProvider");
  }
  return ctx;
}
