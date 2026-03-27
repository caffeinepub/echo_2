import { useWalletContext } from "../context/WalletContext";
import { ALBUMS, type Album } from "../data/albums";

export function useMockData() {
  const { ownedAlbumIds, isConnected } = useWalletContext();

  const ownedAlbums: Album[] = isConnected
    ? ALBUMS.filter((a) => ownedAlbumIds.includes(a.id))
    : [];

  const allAlbums: Album[] = ALBUMS;

  return { ownedAlbums, allAlbums };
}
