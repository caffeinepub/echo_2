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
export interface TcgCategory {
    id: bigint;
    name: string;
    slug: string;
    imageUrl: string;
    isActive: boolean;
    sortOrder: bigint;
}
export interface CreateTcgCategoryInput {
    name: string;
    slug: string;
    imageUrl: string;
    isActive: boolean;
    sortOrder: bigint;
}
export interface UpdateTcgCategoryInput {
    id: bigint;
    name: string;
    slug: string;
    imageUrl: string;
    isActive: boolean;
    sortOrder: bigint;
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
export interface TcgCard {
    id: bigint;
    setId: bigint;
    cardName: string;
    cardNumber: string;
    rarity: string;
    imageUrl: string;
    isActive: boolean;
    isSupported: boolean;
    sortOrder: bigint;
}
export interface CreateTcgCardInput {
    setId: bigint;
    cardName: string;
    cardNumber: string;
    rarity: string;
    imageUrl: string;
    isActive: boolean;
    isSupported: boolean;
    sortOrder: bigint;
}
export interface UpdateTcgCardInput {
    id: bigint;
    setId: bigint;
    cardName: string;
    cardNumber: string;
    rarity: string;
    imageUrl: string;
    isActive: boolean;
    isSupported: boolean;
    sortOrder: bigint;
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
    createCategory(input: CreateTcgCategoryInput): Promise<TcgCategory>;
    updateCategory(input: UpdateTcgCategoryInput): Promise<TcgCategory>;
    deleteCategory(id: bigint): Promise<void>;
    toggleCategoryActive(id: bigint): Promise<void>;
    getCategories(): Promise<Array<TcgCategory>>;
    getAllCategoriesAdmin(): Promise<Array<TcgCategory>>;
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
    getSetsByCategory(categorySlug: string): Promise<Array<TcgSet>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchSetsByName(searchTerm: string): Promise<Array<TcgSet>>;
    toggleSetActive(id: bigint): Promise<void>;
    updateSet(input: UpdateTcgSetInput): Promise<TcgSet>;
    createCard(input: CreateTcgCardInput): Promise<TcgCard>;
    updateCard(input: UpdateTcgCardInput): Promise<TcgCard>;
    deleteCard(id: bigint): Promise<void>;
    toggleCardActive(id: bigint): Promise<void>;
    toggleCardSupported(id: bigint): Promise<void>;
    getCardsBySet(setId: bigint): Promise<Array<TcgCard>>;
    getAllCardsAdmin(): Promise<Array<TcgCard>>;
    getCardsBySetAdmin(setId: bigint): Promise<Array<TcgCard>>;
}
