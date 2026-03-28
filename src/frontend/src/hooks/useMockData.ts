import { useWalletContext } from "../context/WalletContext";
import { SONGS, type Song } from "../data/songs";

export function useMockData() {
  const { ownedAlbumIds, isConnected } = useWalletContext();

  const ownedAlbums: Song[] = isConnected
    ? SONGS.filter((s) => ownedAlbumIds.includes(s.id))
    : [];

  const allAlbums: Song[] = SONGS;

  return { ownedAlbums, allAlbums };
}
