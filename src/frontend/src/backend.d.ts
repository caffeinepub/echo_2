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
export interface Track {
    title: string;
    duration: bigint;
}
export interface TcgSet {
    id: bigint;
    setCode: string;
    coverImageUrl: string;
    setName: string;
    featured: boolean;
    tcgCategory: string;
    sortOrder: bigint;
    slug: string;
    isActive: boolean;
    cardCount?: bigint;
    releaseYear: bigint;
}
export interface MarketListing {
    seller: Principal;
    editionId: bigint;
    price: bigint;
}
export interface UpdateTcgSetInput {
    id: bigint;
    setCode: string;
    coverImageUrl: string;
    setName: string;
    featured: boolean;
    tcgCategory: string;
    sortOrder: bigint;
    slug: string;
    isActive: boolean;
    cardCount?: bigint;
    releaseYear: bigint;
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
export interface CreateTcgSetInput {
    setCode: string;
    coverImageUrl: string;
    setName: string;
    featured: boolean;
    tcgCategory: string;
    sortOrder: bigint;
    slug: string;
    isActive: boolean;
    cardCount?: bigint;
    releaseYear: bigint;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addAlbum(album: Album): Promise<void>;
    addRelease(release: Release): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createSet(input: CreateTcgSetInput): Promise<TcgSet>;
    deleteSet(id: bigint): Promise<void>;
    getAlbumById(id: string): Promise<Album | null>;
    getAlbums(): Promise<Array<Album>>;
    getAllSetsAdmin(): Promise<Array<TcgSet>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFeaturedSets(): Promise<Array<TcgSet>>;
    getMarketListings(): Promise<Array<MarketListing>>;
    getPokemonSets(): Promise<Array<TcgSet>>;
    getReleases(): Promise<Array<Release>>;
    getSetById(id: bigint): Promise<TcgSet | null>;
    getSetBySlug(slug: string): Promise<TcgSet | null>;
    getSets(): Promise<Array<TcgSet>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchSetsByName(searchTerm: string): Promise<Array<TcgSet>>;
    toggleSetActive(id: bigint): Promise<void>;
    updateSet(input: UpdateTcgSetInput): Promise<TcgSet>;
}
