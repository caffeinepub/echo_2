import { useCallback, useEffect, useState } from "react";
import {
  type Clip,
  MINT_PRICE_USD,
  MINT_WINDOW_MS,
  MOCK_CLIPS,
  TOTAL_SUPPLY,
} from "../data/clips";

const LS_OWNERSHIPS = "echo_clip_ownerships";
const LS_CLIPS = "echo_clips_extra";

export interface ClipOwnership {
  clipId: string;
  editionNumber: number;
  mintedAt: number;
}

function loadOwnerships(): ClipOwnership[] {
  try {
    const raw = localStorage.getItem(LS_OWNERSHIPS);
    return raw ? (JSON.parse(raw) as ClipOwnership[]) : [];
  } catch {
    return [];
  }
}

function saveOwnerships(o: ClipOwnership[]) {
  try {
    localStorage.setItem(LS_OWNERSHIPS, JSON.stringify(o));
  } catch {
    // quota
  }
}

function loadExtraClips(): Clip[] {
  try {
    const raw = localStorage.getItem(LS_CLIPS);
    return raw ? (JSON.parse(raw) as Clip[]) : [];
  } catch {
    return [];
  }
}

function saveExtraClips(clips: Clip[]) {
  try {
    localStorage.setItem(LS_CLIPS, JSON.stringify(clips));
  } catch {
    // quota
  }
}

export type AddClipData = Omit<
  Clip,
  "id" | "postedAt" | "mintedCount" | "supply" | "mintPriceUSD" | "mintWindowMs"
>;

export function useClipsData() {
  const [extraClips, setExtraClips] = useState<Clip[]>(() => loadExtraClips());
  const [ownerships, setOwnerships] = useState<ClipOwnership[]>(() =>
    loadOwnerships(),
  );
  // mintedCounts lets us update counts without mutating mock data
  const [mintedCounts, setMintedCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    saveOwnerships(ownerships);
  }, [ownerships]);

  useEffect(() => {
    saveExtraClips(extraClips);
  }, [extraClips]);

  const clips: Clip[] = [...MOCK_CLIPS, ...extraClips].map((c) => ({
    ...c,
    mintedCount: mintedCounts[c.id] ?? c.mintedCount,
  }));

  const addClip = useCallback((data: AddClipData) => {
    const clip: Clip = {
      ...data,
      id: `clip_user_${Date.now()}`,
      postedAt: Date.now(),
      mintedCount: 0,
      supply: TOTAL_SUPPLY,
      mintPriceUSD: MINT_PRICE_USD,
      mintWindowMs: MINT_WINDOW_MS,
    };
    setExtraClips((prev) => {
      const updated = [clip, ...prev];
      saveExtraClips(updated);
      return updated;
    });
  }, []);

  const mintClip = useCallback(
    async (clipId: string, _walletAddress: string): Promise<ClipOwnership> => {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      let assignedEdition = 1;

      setMintedCounts((prev) => {
        const clip = clips.find((c) => c.id === clipId);
        const current = prev[clipId] ?? clip?.mintedCount ?? 0;
        assignedEdition = current + 1;
        return { ...prev, [clipId]: assignedEdition };
      });

      const ownership: ClipOwnership = {
        clipId,
        editionNumber: assignedEdition,
        mintedAt: Date.now(),
      };

      setOwnerships((prev) => {
        const updated = [...prev, ownership];
        saveOwnerships(updated);
        return updated;
      });

      return ownership;
    },
    [clips],
  );

  const isOwned = useCallback(
    (clipId: string) => ownerships.some((o) => o.clipId === clipId),
    [ownerships],
  );

  const getOwnership = useCallback(
    (clipId: string) => ownerships.find((o) => o.clipId === clipId) ?? null,
    [ownerships],
  );

  const isExpired = useCallback(
    (clip: Clip) => clip.postedAt + clip.mintWindowMs < Date.now(),
    [],
  );

  return {
    clips,
    ownerships,
    addClip,
    mintClip,
    isOwned,
    getOwnership,
    isExpired,
  };
}
