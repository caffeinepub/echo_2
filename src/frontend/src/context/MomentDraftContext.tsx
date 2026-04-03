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
  photos: string[]; // data URLs or object URLs
  video: string | null;
  completed: boolean;
  createdAt: number;
}

interface MomentDraftCtx {
  activeDraft: MomentDraft | null;
  hasDraft: boolean; // exists and !completed
  startDraft: () => void;
  addPhoto: (dataUrl: string) => void;
  removePhoto: (index: number) => void;
  addVideo: (dataUrl: string) => void;
  removeVideo: () => void;
  completeDraft: () => void;
  clearDraft: () => void;
}

const MomentDraftContext = createContext<MomentDraftCtx | null>(null);

function loadFromStorage(): MomentDraft | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as MomentDraft;
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
      };
      return draft;
    });
  }, []);

  const addPhoto = useCallback((dataUrl: string) => {
    setActiveDraft((prev) => {
      if (!prev || prev.completed) return prev;
      if (prev.photos.length >= 9) return prev;
      return { ...prev, photos: [...prev.photos, dataUrl] };
    });
  }, []);

  const removePhoto = useCallback((index: number) => {
    setActiveDraft((prev) => {
      if (!prev || prev.completed) return prev;
      const updated = [...prev.photos];
      updated.splice(index, 1);
      return { ...prev, photos: updated };
    });
  }, []);

  const addVideo = useCallback((dataUrl: string) => {
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

  return (
    <MomentDraftContext.Provider
      value={{
        activeDraft,
        hasDraft,
        startDraft,
        addPhoto,
        removePhoto,
        addVideo,
        removeVideo,
        completeDraft,
        clearDraft,
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
