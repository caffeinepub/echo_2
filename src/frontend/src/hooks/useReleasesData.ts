import {
  type AdminRelease,
  useAdminReleases,
} from "../context/AdminReleasesContext";
import { useWalletContext } from "../context/WalletContext";
import { SONGS, type Song } from "../data/songs";

function adminReleaseToSong(r: AdminRelease): Song {
  const audioUrl = r.audioDataUrl || r.audioExternalUrl || "";
  const minted = r.mintedCount ?? 0;
  const isSoldOut = minted >= r.supply;

  let mintOpensInMs: number | null = null;
  if (r.status === "scheduled" && r.releaseDate) {
    const diff = new Date(r.releaseDate).getTime() - Date.now();
    mintOpensInMs = diff > 0 ? diff : 0;
  } else if (r.status === "live") {
    mintOpensInMs = 0;
  }

  return {
    id: r.id,
    collectionName: r.title.toUpperCase().replace(/\s+/g, "_"),
    title: r.title,
    artist: r.artist,
    artworkSrc:
      r.artworkDataUrl || "/assets/generated/album-fragments.dim_600x600.jpg",
    supply: r.supply,
    userEdition: 0,
    preview_url: audioUrl,
    full_url: audioUrl,
    floorPrice: r.priceSOL,
    lastSoldPrice: r.priceSOL,
    owners: minted,
    minted,
    isSoldOut,
    mintOpensInMs,
    editions_in_circulation: minted,
    volume_24h_sol: 0,
    mintPrice: r.priceSOL,
    nft_mint_address: r.id,
    signalStrength: 0.3,
    coverMotion: r.coverMotion,
    motionEnabled: r.motionEnabled,
    likes: 0,
    comments: [],
  };
}

export function useReleasesData() {
  const { releases: adminReleases } = useAdminReleases();
  const { ownedAlbumIds, isConnected } = useWalletContext();

  const publicAdminReleases = adminReleases
    .filter(
      (r) =>
        (r.status === "live" || r.status === "scheduled") &&
        r.visibility !== "private",
    )
    .map(adminReleaseToSong);

  const adminIds = new Set(publicAdminReleases.map((s) => s.id));
  const staticSongs = SONGS.filter((s) => !adminIds.has(s.id));
  const allAlbums: Song[] = [...publicAdminReleases, ...staticSongs];

  const ownedAlbums: Song[] = isConnected
    ? allAlbums.filter((s) => ownedAlbumIds.includes(s.id))
    : [];

  return { allAlbums, ownedAlbums };
}
