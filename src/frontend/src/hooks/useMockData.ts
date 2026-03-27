import { ALBUMS, type Album } from "../data/albums";

// Stub hook — swap in real NFT ownership data here later
export function useMockData() {
  const ownedAlbums: Album[] = ALBUMS;
  const allAlbums: Album[] = ALBUMS;

  return { ownedAlbums, allAlbums };
}
