import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Album {
    id: string;
    coverImageUrl: string;
    title: string;
    tracklist: Array<Track>;
    totalSupply: bigint;
    artist: string;
    collectionName: string;
}
export interface Release {
    album: Album;
    floorPrice: bigint;
    isActive: boolean;
    lastSoldPrice: bigint;
    mintedCount: bigint;
    ownersCount: bigint;
    mintOpenTime: bigint;
}
export interface Track {
    title: string;
    duration: bigint;
}
export interface MarketListing {
    seller: Principal;
    editionId: bigint;
    price: bigint;
}
export interface backendInterface {
    addAlbum(album: Album): Promise<void>;
    addRelease(release: Release): Promise<void>;
    getAlbumById(id: string): Promise<Album | null>;
    getAlbums(): Promise<Array<Album>>;
    getMarketListings(): Promise<Array<MarketListing>>;
    getReleases(): Promise<Array<Release>>;
}
