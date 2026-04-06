import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const LS_KEY = "minty_active_draft_v2";

export interface MomentDraft {
  id: string;
  // Video-only flow
  videoUrl: string | null; // object URL (session-only)
  previewClipUrl: string | null; // same as videoUrl for now
  completed: boolean;
  createdAt: number;
  packSupply: number;
  // Content labeling fields (filled in FinalSetupScreen)
  title: string;
  caption: string;
  explicit: boolean;
  hashtags: string[];
}

interface MomentDraftCtx {
  activeDraft: MomentDraft | null;
  hasDraft: boolean;
  startDraft: () => void;
  setVideo: (url: string, previewUrl: string) => void;
  clearVideo: () => void;
  completeDraft: () => void;
  clearDraft: () => void;
  setPackSupply: (n: number) => void;
  setTitle: (title: string) => void;
  setCaption: (caption: string) => void;
  setExplicit: (explicit: boolean) => void;
  setHashtags: (tags: string[]) => void;
}

const MomentDraftContext = createContext<MomentDraftCtx | null>(null);

function makeFreshDraft(): MomentDraft {
  return {
    id: `draft_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    videoUrl: null,
    previewClipUrl: null,
    completed: false,
    createdAt: Date.now(),
    packSupply: 300,
    title: "",
    caption: "",
    explicit: false,
    hashtags: [],
  };
}

// Only persist non-blob metadata (object URLs are session-only)
function loadFromStorage(): MomentDraft | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MomentDraft;
    // Object URLs don't survive a page refresh — clear them
    parsed.videoUrl = null;
    parsed.previewClipUrl = null;
    // Backfill
    if (!parsed.packSupply || parsed.packSupply < 10) parsed.packSupply = 300;
    if (parsed.title === undefined) parsed.title = "";
    if (parsed.caption === undefined) parsed.caption = "";
    if (parsed.explicit === undefined) parsed.explicit = false;
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
      // Don't persist blob URLs
      const toSave = { ...draft, videoUrl: null, previewClipUrl: null };
      localStorage.setItem(LS_KEY, JSON.stringify(toSave));
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

  useEffect(() => {
    saveToStorage(activeDraft);
  }, [activeDraft]);

  const startDraft = useCallback(() => {
    setActiveDraft((prev) => {
      if (prev !== null && !prev.completed) return prev;
      return makeFreshDraft();
    });
  }, []);

  const setVideo = useCallback((url: string, previewUrl: string) => {
    setActiveDraft((prev) => {
      if (!prev || prev.completed) return prev;
      return { ...prev, videoUrl: url, previewClipUrl: previewUrl };
    });
  }, []);

  const clearVideo = useCallback(() => {
    setActiveDraft((prev) => {
      if (!prev || prev.completed) return prev;
      return { ...prev, videoUrl: null, previewClipUrl: null };
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
        setVideo,
        clearVideo,
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
