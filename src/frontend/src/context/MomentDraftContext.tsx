import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const LS_KEY = "minty_active_draft";

export interface MomentDraft {
  id: string;
  video: string | null;
  completed: boolean;
  createdAt: number;
  packSupply: number; // always 300
  title: string;
  caption: string;
  explicit: boolean;
  hashtags: string[];
}

interface MomentDraftCtx {
  activeDraft: MomentDraft | null;
  hasDraft: boolean;
  startDraft: () => void;
  addVideo: (dataUrl: string, capturedAt?: number) => void;
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
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MomentDraft;
    // Normalise packSupply
    parsed.packSupply = 300;
    // Backfill content labeling fields
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

  useEffect(() => {
    saveToStorage(activeDraft);
  }, [activeDraft]);

  const startDraft = useCallback(() => {
    setActiveDraft((prev) => {
      if (prev !== null && !prev.completed) return prev;
      const draft: MomentDraft = {
        id: `draft_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        video: null,
        completed: false,
        createdAt: Date.now(),
        packSupply: 300,
        title: "",
        caption: "",
        explicit: false,
        hashtags: [],
      };
      return draft;
    });
  }, []);

  const addVideo = useCallback((dataUrl: string, _capturedAt?: number) => {
    setActiveDraft((prev) => {
      if (!prev || prev.completed) return prev;
      return { ...prev, video: dataUrl };
    });
  }, []);

  const removeVideo = useCallback(() => {
    setActiveDraft((prev) => {
      if (!prev || prev.completed) return prev;
      return { ...prev, video: null };
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
        addVideo,
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
