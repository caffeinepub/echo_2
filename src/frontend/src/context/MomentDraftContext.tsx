import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const LS_KEY = "minty_active_draft_v3";

export interface MomentDraft {
  id: string;
  /** Local blob URL for in-session preview only — not persisted across refresh */
  videoBlobUrl: string | null;
  /** Persistent object-storage URL for the main video — survives refresh */
  videoUrl: string | null;
  /** Persistent object-storage URL for the 2s preview loop — survives refresh */
  previewUrl: string | null;
  completed: boolean;
  createdAt: number;
  title: string;
  caption: string;
  explicit: boolean;
  hashtags: string[];
}

interface MomentDraftCtx {
  activeDraft: MomentDraft | null;
  hasDraft: boolean;
  startDraft: () => void;
  /** Store the local blob URL (for in-session playback before upload completes) */
  setVideoBlobUrl: (blobUrl: string) => void;
  /** Store persistent storage URLs after upload completes */
  setPersistedUrls: (videoUrl: string, previewUrl: string) => void;
  removeVideo: () => void;
  completeDraft: () => void;
  clearDraft: () => void;
  setTitle: (title: string) => void;
  setCaption: (caption: string) => void;
  setExplicit: (explicit: boolean) => void;
  setHashtags: (tags: string[]) => void;
}

const MomentDraftContext = createContext<MomentDraftCtx | null>(null);

function loadFromStorage(): MomentDraft | null {
  try {
    // Clear old draft keys
    localStorage.removeItem("minty_active_draft");
    localStorage.removeItem("minty_active_draft_v2");
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MomentDraft;
    if (parsed.title === undefined) parsed.title = "";
    if (parsed.caption === undefined) parsed.caption = "";
    if (parsed.explicit === undefined) parsed.explicit = false;
    if (!parsed.hashtags) parsed.hashtags = [];
    // blob URLs don't survive page refresh — clear them
    parsed.videoBlobUrl = null;
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
      // Don't persist blob URLs — they're browser-local
      const toSave: MomentDraft = { ...draft, videoBlobUrl: null };
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
      return {
        id: `draft_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        videoBlobUrl: null,
        videoUrl: null,
        previewUrl: null,
        completed: false,
        createdAt: Date.now(),
        title: "",
        caption: "",
        explicit: false,
        hashtags: [],
      };
    });
  }, []);

  const setVideoBlobUrl = useCallback((blobUrl: string) => {
    setActiveDraft((prev) => {
      if (!prev || prev.completed) return prev;
      return { ...prev, videoBlobUrl: blobUrl };
    });
  }, []);

  const setPersistedUrls = useCallback(
    (videoUrl: string, previewUrl: string) => {
      setActiveDraft((prev) => {
        if (!prev || prev.completed) return prev;
        return { ...prev, videoUrl, previewUrl };
      });
    },
    [],
  );

  const removeVideo = useCallback(() => {
    setActiveDraft((prev) => {
      if (!prev || prev.completed) return prev;
      return {
        ...prev,
        videoBlobUrl: null,
        videoUrl: null,
        previewUrl: null,
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
        setVideoBlobUrl,
        setPersistedUrls,
        removeVideo,
        completeDraft,
        clearDraft,
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
