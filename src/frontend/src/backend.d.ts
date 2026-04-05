import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type PackOpenResult = {
    __kind__: "ok";
    ok: Collectible;
} | {
    __kind__: "err";
    err: string;
};
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
export interface MediaAsset {
    contentType: string;
    assetId: string;
    createdAt: bigint;
    blobStorageKey: string;
    setId: string;
    mediaIndex: bigint;
    mediaType: CollectibleMediaType;
}
export interface MarketListing {
    seller: Principal;
    editionId: bigint;
    price: bigint;
}
export interface MintySetInput {
    id: string;
    title: string;
    creator: Principal;
    hashtags: Array<string>;
    video: string;
    explicit: boolean;
    coverImage: string;
    pricePerPackUsd: bigint;
    caption: string;
    previewClip: string;
    images: Array<string>;
}
export interface UpdateTcgCardInput {
    id: bigint;
    cardName: string;
    sortOrder: bigint;
    isActive: boolean;
    setId: bigint;
    imageUrl: string;
    rarity: string;
    cardNumber: string;
    isSupported: boolean;
}
export interface Collectible {
    id: string;
    setName: string;
    title: string;
    creator: string;
    typeSupply: bigint;
    editionNumber: bigint;
    ownerPrincipal: Principal;
    mintDate: string;
    totalSupply: bigint;
    imageUrl: string;
    releaseId: string;
    mediaType: CollectibleMediaType;
    rarity: string;
    packId: string;
    openedAt: bigint;
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
export interface CreateTcgCardInput {
    cardName: string;
    sortOrder: bigint;
    isActive: boolean;
    setId: bigint;
    imageUrl: string;
    rarity: string;
    cardNumber: string;
    isSupported: boolean;
}
export interface CreateTcgCategoryInput {
    sortOrder: bigint;
    name: string;
    slug: string;
    isActive: boolean;
    imageUrl: string;
}
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
export interface MintySet {
    id: string;
    title: string;
    creator: Principal;
    hashtags: Array<string>;
    video: string;
    createdAt: bigint;
    explicit: boolean;
    coverImage: string;
    pricePerPackUsd: bigint;
    supply: bigint;
    caption: string;
    previewClip: string;
    images: Array<string>;
}
export interface UpdateTcgCategoryInput {
    id: bigint;
    sortOrder: bigint;
    name: string;
    slug: string;
    isActive: boolean;
    imageUrl: string;
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
export interface TcgCard {
    id: bigint;
    cardName: string;
    sortOrder: bigint;
    isActive: boolean;
    setId: bigint;
    imageUrl: string;
    rarity: string;
    cardNumber: string;
    isSupported: boolean;
}
export interface Pack {
    id: string;
    status: PackStatus;
    coverImageUrl: string;
    setName: string;
    ownerPrincipal: Principal;
    createdAt: bigint;
    totalSupply: bigint;
    releaseId: string;
    serialNumber: bigint;
    packCount: bigint;
    collectibleId?: string;
    openedAt?: bigint;
}
export interface AddPackInput {
    id: string;
    coverImageUrl: string;
    setName: string;
    ownerPrincipal: Principal;
    totalSupply: bigint;
    releaseId: string;
    serialNumber: bigint;
    packCount: bigint;
}
export interface TcgCategory {
    id: bigint;
    sortOrder: bigint;
    name: string;
    slug: string;
    isActive: boolean;
    imageUrl: string;
}
export interface UserProfile {
    name: string;
}
export enum CollectibleMediaType {
    video = "video",
    photo = "photo"
}
export enum PackStatus {
    opened = "opened",
    sealed = "sealed"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addAlbum(album: Album): Promise<void>;
    addPack(input: AddPackInput): Promise<void>;
    addRelease(release: Release): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCard(input: CreateTcgCardInput): Promise<TcgCard>;
    createCategory(input: CreateTcgCategoryInput): Promise<TcgCategory>;
    createMintySet(setInput: MintySetInput): Promise<string>;
    createSet(input: CreateTcgSetInput): Promise<TcgSet>;
    deleteCard(id: bigint): Promise<void>;
    deleteCategory(id: bigint): Promise<void>;
    deleteSet(id: bigint): Promise<void>;
    getAlbumById(id: string): Promise<Album | null>;
    getAlbums(): Promise<Array<Album>>;
    getAllCardsAdmin(): Promise<Array<TcgCard>>;
    getAllCategoriesAdmin(): Promise<Array<TcgCategory>>;
    getAllSetsAdmin(): Promise<Array<TcgSet>>;
    getCallerCollectibles(): Promise<Array<Collectible>>;
    getCallerPacks(): Promise<Array<Pack>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCardsBySet(setId: bigint): Promise<Array<TcgCard>>;
    getCardsBySetAdmin(setId: bigint): Promise<Array<TcgCard>>;
    getCategories(): Promise<Array<TcgCategory>>;
    getFeaturedSets(): Promise<Array<TcgSet>>;
    getMarketListings(): Promise<Array<MarketListing>>;
    getMintySet(id: string): Promise<MintySet | null>;
    getMintySets(): Promise<Array<MintySet>>;
    getPokemonSets(): Promise<Array<TcgSet>>;
    getReleases(): Promise<Array<Release>>;
    getSetById(id: bigint): Promise<TcgSet | null>;
    getSetBySlug(slug: string): Promise<TcgSet | null>;
    getSets(): Promise<Array<TcgSet>>;
    getSetsByCategory(categorySlug: string): Promise<Array<TcgSet>>;
    getUserCollectibles(user: Principal): Promise<Array<Collectible>>;
    getUserPacks(user: Principal): Promise<Array<Pack>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listMintySetsByCreator(creator: Principal): Promise<Array<MintySet>>;
    openPack(packId: string): Promise<PackOpenResult>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchSetsByName(searchTerm: string): Promise<Array<TcgSet>>;
    toggleCardActive(id: bigint): Promise<void>;
    toggleCardSupported(id: bigint): Promise<void>;
    toggleCategoryActive(id: bigint): Promise<void>;
    toggleSetActive(id: bigint): Promise<void>;
    updateCard(input: UpdateTcgCardInput): Promise<TcgCard>;
    updateCategory(input: UpdateTcgCategoryInput): Promise<TcgCategory>;
    updateSet(input: UpdateTcgSetInput): Promise<TcgSet>;
    uploadMediaAsset(asset: MediaAsset): Promise<string>;
}
