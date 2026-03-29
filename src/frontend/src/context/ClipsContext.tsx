import { type ReactNode, createContext, useContext } from "react";
import type { Clip } from "../data/clips";
import {
  type AddClipData,
  type ClipOwnership,
  useClipsData,
} from "../hooks/useClipsData";

interface ClipsContextValue {
  clips: Clip[];
  ownerships: ClipOwnership[];
  addClip: (data: AddClipData) => void;
  mintClip: (clipId: string, walletAddress: string) => Promise<ClipOwnership>;
  isOwned: (clipId: string) => boolean;
  getOwnership: (clipId: string) => ClipOwnership | null;
  isExpired: (clip: Clip) => boolean;
}

const ClipsContext = createContext<ClipsContextValue | null>(null);

export function ClipsProvider({ children }: { children: ReactNode }) {
  const value = useClipsData();
  return (
    <ClipsContext.Provider value={value}>{children}</ClipsContext.Provider>
  );
}

export function useClipsContext(): ClipsContextValue {
  const ctx = useContext(ClipsContext);
  if (!ctx)
    throw new Error("useClipsContext must be used within ClipsProvider");
  return ctx;
}
