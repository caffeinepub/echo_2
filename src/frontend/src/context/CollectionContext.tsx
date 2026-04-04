import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const LS_KEY = "minty_collection";
const LS_SEEDED_KEY = "minty_collection_seeded";
const LS_PACKS_KEY = "minty_sealed_packs";
const LS_PACKS_SEEDED_KEY = "minty_packs_seeded";

export interface CollectionNFT {
  id: string;
  title: string;
  setName: string;
  editionNumber: number;
  totalSupply: number;
  mediaType: "photo" | "video";
  imageUrl: string;
  rarity: string;
  mintDate: string;
  creator: string;
  owners: string[];
  views: number;
  isLeader: boolean;
  hasOwnershipHistory: boolean;
  addedAt: number;
}

export interface SealedPack {
  id: string;
  setName: string;
  editionNumber: number;
  totalSupply: number;
  collectibleType: "photo" | "video";
  pendingNFT: CollectionNFT;
  createdAt: number;
}

interface CollectionCtx {
  nfts: CollectionNFT[];
  sealedPacks: SealedPack[];
  addNFT: (nft: CollectionNFT) => void;
  addNFTs: (nfts: CollectionNFT[]) => void;
  addSealedPacks: (packs: SealedPack[]) => void;
  openPack: (packId: string) => void;
  removeNFT: (nftId: string) => void;
  removeSealedPacks: (packIds: string[]) => void;
}

const CollectionContext = createContext<CollectionCtx | null>(null);

const MOCK_NFTS: CollectionNFT[] = [
  {
    id: "nft_mock_1",
    title: "Golden Moment #1",
    setName: "Mint Moments Vol. 1",
    editionNumber: 3,
    totalSupply: 100,
    mediaType: "photo",
    imageUrl: "https://images.pokemontcg.io/sv1/025_hires.png",
    rarity: "Rare",
    mintDate: new Date(Date.now() - 86400000 * 5).toISOString(),
    creator: "minty.xyz",
    owners: ["0x3f2a...c8e1", "0xa1b2...d3e4"],
    views: 1243,
    isLeader: true,
    hasOwnershipHistory: true,
    addedAt: Date.now() - 86400000 * 5,
  },
  {
    id: "nft_mock_2",
    title: "Glacier Drift",
    setName: "Arctic Series",
    editionNumber: 7,
    totalSupply: 50,
    mediaType: "video",
    imageUrl: "https://images.pokemontcg.io/sv1/025_hires.png",
    rarity: "Uncommon",
    mintDate: new Date(Date.now() - 86400000 * 12).toISOString(),
    creator: "minty.xyz",
    owners: ["0x3f2a...c8e1"],
    views: 488,
    isLeader: false,
    hasOwnershipHistory: false,
    addedAt: Date.now() - 86400000 * 12,
  },
  {
    id: "nft_mock_3",
    title: "Sage Leaf",
    setName: "Nature Drop",
    editionNumber: 22,
    totalSupply: 200,
    mediaType: "photo",
    imageUrl: "https://images.pokemontcg.io/sv1/025_hires.png",
    rarity: "Common",
    mintDate: new Date(Date.now() - 86400000 * 20).toISOString(),
    creator: "minty.xyz",
    owners: ["0x3f2a...c8e1", "0xd4e5...f6a7", "0xb8c9...0a1b"],
    views: 92,
    isLeader: false,
    hasOwnershipHistory: true,
    addedAt: Date.now() - 86400000 * 20,
  },
  {
    id: "nft_mock_4",
    title: "Crystal Mint",
    setName: "Crystal Series",
    editionNumber: 1,
    totalSupply: 25,
    mediaType: "photo",
    imageUrl: "https://images.pokemontcg.io/sv1/025_hires.png",
    rarity: "Ultra Rare",
    mintDate: new Date(Date.now() - 86400000 * 30).toISOString(),
    creator: "minty.xyz",
    owners: ["0x3f2a...c8e1"],
    views: 3871,
    isLeader: false,
    hasOwnershipHistory: false,
    addedAt: Date.now() - 86400000 * 30,
  },
];

const MOCK_SEALED_PACKS: SealedPack[] = [
  {
    id: "pack_mock_1",
    setName: "Mint Moments Vol. 1",
    editionNumber: 4,
    totalSupply: 100,
    collectibleType: "photo",
    pendingNFT: {
      id: "nft_from_pack_1",
      title: "Sunlit Path",
      setName: "Mint Moments Vol. 1",
      editionNumber: 4,
      totalSupply: 100,
      mediaType: "photo",
      imageUrl: "https://images.pokemontcg.io/sv1/025_hires.png",
      rarity: "Uncommon",
      mintDate: new Date().toISOString(),
      creator: "minty.xyz",
      owners: ["you"],
      views: 0,
      isLeader: false,
      hasOwnershipHistory: false,
      addedAt: Date.now(),
    },
    createdAt: Date.now() - 1000 * 60 * 60,
  },
  {
    id: "pack_mock_2",
    setName: "Arctic Series",
    editionNumber: 2,
    totalSupply: 50,
    collectibleType: "video",
    pendingNFT: {
      id: "nft_from_pack_2",
      title: "Frozen Drift",
      setName: "Arctic Series",
      editionNumber: 2,
      totalSupply: 50,
      mediaType: "video",
      imageUrl: "https://images.pokemontcg.io/sv1/025_hires.png",
      rarity: "Rare",
      mintDate: new Date().toISOString(),
      creator: "minty.xyz",
      owners: ["you"],
      views: 0,
      isLeader: false,
      hasOwnershipHistory: false,
      addedAt: Date.now() - 500,
    },
    createdAt: Date.now() - 1000 * 60 * 30,
  },
];

function loadNFTsFromStorage(): CollectionNFT[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CollectionNFT[];
  } catch {
    return [];
  }
}

function saveNFTsToStorage(nfts: CollectionNFT[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(nfts));
  } catch {
    // ignore
  }
}

function loadPacksFromStorage(): SealedPack[] {
  try {
    const raw = localStorage.getItem(LS_PACKS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SealedPack[];
  } catch {
    return [];
  }
}

function savePacksToStorage(packs: SealedPack[]) {
  try {
    localStorage.setItem(LS_PACKS_KEY, JSON.stringify(packs));
  } catch {
    // ignore
  }
}

export function CollectionProvider({
  children,
}: { children: React.ReactNode }) {
  const [nfts, setNfts] = useState<CollectionNFT[]>(() =>
    loadNFTsFromStorage(),
  );
  const [sealedPacks, setSealedPacks] = useState<SealedPack[]>(() =>
    loadPacksFromStorage(),
  );

  // Seed mock NFTs once on first mount
  useEffect(() => {
    const alreadySeeded = localStorage.getItem(LS_SEEDED_KEY);
    if (!alreadySeeded) {
      setNfts((prev) => [...MOCK_NFTS, ...prev]);
      localStorage.setItem(LS_SEEDED_KEY, "1");
    }
  }, []);

  // Seed mock sealed packs once on first mount
  useEffect(() => {
    const alreadySeeded = localStorage.getItem(LS_PACKS_SEEDED_KEY);
    if (!alreadySeeded) {
      setSealedPacks((prev) => [...MOCK_SEALED_PACKS, ...prev]);
      localStorage.setItem(LS_PACKS_SEEDED_KEY, "1");
    }
  }, []);

  // Persist whenever nfts change
  useEffect(() => {
    saveNFTsToStorage(nfts);
  }, [nfts]);

  // Persist whenever sealedPacks change
  useEffect(() => {
    savePacksToStorage(sealedPacks);
  }, [sealedPacks]);

  const addNFT = useCallback((nft: CollectionNFT) => {
    setNfts((prev) => [nft, ...prev]);
  }, []);

  const addNFTs = useCallback((newNfts: CollectionNFT[]) => {
    setNfts((prev) => [...newNfts, ...prev]);
  }, []);

  const addSealedPacks = useCallback((packs: SealedPack[]) => {
    setSealedPacks((prev) => [...packs, ...prev]);
  }, []);

  const openPack = useCallback((packId: string) => {
    setSealedPacks((prevPacks) => {
      const pack = prevPacks.find((p) => p.id === packId);
      if (!pack) return prevPacks;
      // Atomically remove pack and add NFT
      setNfts((prevNfts) => [pack.pendingNFT, ...prevNfts]);
      return prevPacks.filter((p) => p.id !== packId);
    });
  }, []);

  const removeNFT = useCallback((nftId: string) => {
    setNfts((prev) => prev.filter((n) => n.id !== nftId));
  }, []);

  const removeSealedPacks = useCallback((packIds: string[]) => {
    const idSet = new Set(packIds);
    setSealedPacks((prev) => prev.filter((p) => !idSet.has(p.id)));
  }, []);

  return (
    <CollectionContext.Provider
      value={{
        nfts,
        sealedPacks,
        addNFT,
        addNFTs,
        addSealedPacks,
        openPack,
        removeNFT,
        removeSealedPacks,
      }}
    >
      {children}
    </CollectionContext.Provider>
  );
}

export function useCollection(): CollectionCtx {
  const ctx = useContext(CollectionContext);
  if (!ctx) {
    throw new Error("useCollection must be used inside CollectionProvider");
  }
  return ctx;
}
