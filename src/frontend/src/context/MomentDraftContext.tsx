import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const LS_KEY = "minty_active_draft_v2";

export interface MomentDraft {
  id: string;
  // Serializable metadata — persisted to localStorage
  title: string;
  caption: string;
  explicit: boolean;
  hashtags: string[];
  packSupply: number; // always 300
  pricePerPackUsd: number; // creator-set price per pack (1–100)
  coverImageIndex: number; // which of the 9 images is the cover
  createdAt: number;
  completed: boolean;
  // Image count (only count is persisted; actual File objects are in-memory)
  imageCount: number;
  hasVideo: boolean;
}

// In-memory only — not persisted (File/Blob can't be JSON serialized)
export interface MomentDraftMedia {
  images: File[]; // up to 9 image files
  imagePreviewUrls: string[]; // ephemeral object URLs for display
  videoFile: Blob | null; // actual video blob for upload
  videoPreviewUrl: string | null; // ephemeral object URL for display
}

interface MomentDraftCtx {
  activeDraft: MomentDraft | null;
  media: MomentDraftMedia;
  hasDraft: boolean;
  startDraft: () => void;
  addImage: (file: File) => void;
  removeImage: (index: number) => void;
  setCoverImageIndex: (n: number) => void;
  setVideoFile: (blob: Blob, previewUrl: string) => void;
  removeVideo: () => void;
  setPricePerPackUsd: (n: number) => void;
  completeDraft: () => void;
  clearDraft: () => void;
  setTitle: (title: string) => void;
  setCaption: (caption: string) => void;
  setExplicit: (explicit: boolean) => void;
  setHashtags: (tags: string[]) => void;
}

const MomentDraftContext = createContext<MomentDraftCtx | null>(null);

const EMPTY_MEDIA: MomentDraftMedia = {
  images: [],
  imagePreviewUrls: [],
  videoFile: null,
  videoPreviewUrl: null,
};

function loadFromStorage(): MomentDraft | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MomentDraft;
    if (parsed.packSupply === undefined || parsed.packSupply < 10)
      parsed.packSupply = 300;
    if (parsed.pricePerPackUsd === undefined) parsed.pricePerPackUsd = 1;
    if (parsed.coverImageIndex === undefined) parsed.coverImageIndex = 0;
    if (parsed.imageCount === undefined) parsed.imageCount = 0;
    if (parsed.hasVideo === undefined) parsed.hasVideo = false;
    if (!parsed.title) parsed.title = "";
    if (!parsed.caption) parsed.caption = "";
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
    // ignore
  }
}

export function MomentDraftProvider({
  children,
}: { children: React.ReactNode }) {
  const [activeDraft, setActiveDraft] = useState<MomentDraft | null>(() =>
    loadFromStorage(),
  );
  const [media, setMedia] = useState<MomentDraftMedia>(EMPTY_MEDIA);
  // Track revoked URLs to avoid double-revoke
  const revokedUrls = useRef<Set<string>>(new Set());

  const hasDraft = activeDraft !== null && !activeDraft.completed;

  useEffect(() => {
    saveToStorage(activeDraft);
  }, [activeDraft]);

  // Cleanup object URLs when media changes or component unmounts
  useEffect(() => {
    return () => {
      for (const url of media.imagePreviewUrls) {
        if (!revokedUrls.current.has(url)) {
          URL.revokeObjectURL(url);
          revokedUrls.current.add(url);
        }
      }
      if (
        media.videoPreviewUrl &&
        !revokedUrls.current.has(media.videoPreviewUrl)
      ) {
        URL.revokeObjectURL(media.videoPreviewUrl);
        revokedUrls.current.add(media.videoPreviewUrl);
      }
    };
  }, [media]);

  const startDraft = useCallback(() => {
    setActiveDraft((prev) => {
      if (prev !== null && !prev.completed) return prev;
      return {
        id: `draft_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        title: "",
        caption: "",
        explicit: false,
        hashtags: [],
        packSupply: 300,
        pricePerPackUsd: 1,
        coverImageIndex: 0,
        createdAt: Date.now(),
        completed: false,
        imageCount: 0,
        hasVideo: false,
      };
    });
    setMedia(EMPTY_MEDIA);
  }, []);

  const addImage = useCallback((file: File) => {
    setMedia((prev) => {
      if (prev.images.length >= 9) return prev;
      const url = URL.createObjectURL(file);
      return {
        ...prev,
        images: [...prev.images, file],
        imagePreviewUrls: [...prev.imagePreviewUrls, url],
      };
    });
    setActiveDraft((prev) => {
      if (!prev || prev.completed) return prev;
      return { ...prev, imageCount: Math.min((prev.imageCount ?? 0) + 1, 9) };
    });
  }, []);

  const removeImage = useCallback((index: number) => {
    setMedia((prev) => {
      const url = prev.imagePreviewUrls[index];
      if (url && !revokedUrls.current.has(url)) {
        URL.revokeObjectURL(url);
        revokedUrls.current.add(url);
      }
      const newImages = [...prev.images];
      const newUrls = [...prev.imagePreviewUrls];
      newImages.splice(index, 1);
      newUrls.splice(index, 1);
      return { ...prev, images: newImages, imagePreviewUrls: newUrls };
    });
    setActiveDraft((prev) => {
      if (!prev || prev.completed) return prev;
      return { ...prev, imageCount: Math.max(0, (prev.imageCount ?? 1) - 1) };
    });
  }, []);

  const setCoverImageIndex = useCallback((n: number) => {
    setActiveDraft((prev) => {
      if (!prev || prev.completed) return prev;
      return { ...prev, coverImageIndex: n };
    });
  }, []);

  const setVideoFile = useCallback((blob: Blob, previewUrl: string) => {
    setMedia((prev) => {
      if (
        prev.videoPreviewUrl &&
        !revokedUrls.current.has(prev.videoPreviewUrl)
      ) {
        URL.revokeObjectURL(prev.videoPreviewUrl);
        revokedUrls.current.add(prev.videoPreviewUrl);
      }
      return { ...prev, videoFile: blob, videoPreviewUrl: previewUrl };
    });
    setActiveDraft((prev) => {
      if (!prev || prev.completed) return prev;
      return { ...prev, hasVideo: true };
    });
  }, []);

  const removeVideo = useCallback(() => {
    setMedia((prev) => {
      if (
        prev.videoPreviewUrl &&
        !revokedUrls.current.has(prev.videoPreviewUrl)
      ) {
        URL.revokeObjectURL(prev.videoPreviewUrl);
        revokedUrls.current.add(prev.videoPreviewUrl);
      }
      return { ...prev, videoFile: null, videoPreviewUrl: null };
    });
    setActiveDraft((prev) => {
      if (!prev || prev.completed) return prev;
      return { ...prev, hasVideo: false };
    });
  }, []);

  const setPricePerPackUsd = useCallback((_n: number) => {
    setActiveDraft((prev) => {
      if (!prev || prev.completed) return prev;
      return { ...prev, pricePerPackUsd: 1 };
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
    setMedia(EMPTY_MEDIA);
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
        media,
        hasDraft,
        startDraft,
        addImage,
        removeImage,
        setCoverImageIndex,
        setVideoFile,
        removeVideo,
        setPricePerPackUsd,
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
  if (!ctx)
    throw new Error("useMomentDraft must be used inside MomentDraftProvider");
  return ctx;
}
